/* ========================================
   AUTH HELPERS (ใช้ Web Crypto API: crypto.subtle, btoa/atob)
   ใช้ร่วมกันทั้งใน middleware.mjs และ api/login.mjs, api/logout.mjs
   เซ็น/ตรวจสอบ session token แบบ HMAC-SHA256
   โดยไม่พึ่ง library ภายนอกใด ๆ — API เหล่านี้มีอยู่แล้วทั้งใน
   Vercel Routing Middleware (runtime เริ่มต้น: Node.js) และ
   Vercel Functions runtime เริ่มต้น (Node.js รุ่นปัจจุบันมี
   crypto.subtle/btoa/atob แบบ global)
======================================== */

const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64Url(buf) {
    const bytes = new Uint8Array(buf);
    let str = "";
    for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    const bin = atob(str);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

async function importHmacKey(secret) {
    return crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

/**
 * สร้าง session token: "<payloadB64>.<signatureB64>"
 * payload เก็บแค่เวลาหมดอายุ (exp) ไม่เก็บรหัสผ่านหรือข้อมูลอ่อนไหวใด ๆ
 */
export async function createSessionToken(secret, ttlSeconds = 8 * 60 * 60) {
    const payload = { exp: Date.now() + ttlSeconds * 1000 };
    const payloadB64 = toBase64Url(enc.encode(JSON.stringify(payload)));
    const key = await importHmacKey(secret);
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
    return `${payloadB64}.${toBase64Url(sig)}`;
}

/**
 * ตรวจสอบว่า token ลายเซ็นถูกต้องและยังไม่หมดอายุ
 */
export async function verifySessionToken(token, secret) {
    if (!token || typeof token !== "string" || !token.includes(".")) return false;
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return false;

    try {
        const key = await importHmacKey(secret);
        const valid = await crypto.subtle.verify(
            "HMAC",
            key,
            fromBase64Url(sigB64),
            enc.encode(payloadB64)
        );
        if (!valid) return false;

        const payload = JSON.parse(dec.decode(fromBase64Url(payloadB64)));
        if (!payload.exp || Date.now() > payload.exp) return false;
        return true;
    } catch {
        return false;
    }
}

/**
 * เปรียบเทียบ string แบบ timing-safe เพื่อลดความเสี่ยง timing attack
 * ตอนเช็ครหัสผ่าน
 */
export function timingSafeEqual(a, b) {
    const aBuf = enc.encode(String(a ?? ""));
    const bBuf = enc.encode(String(b ?? ""));
    const len = Math.max(aBuf.length, bBuf.length);
    let diff = aBuf.length === bBuf.length ? 0 : 1;
    for (let i = 0; i < len; i++) {
        diff |= (aBuf[i] || 0) ^ (bBuf[i] || 0);
    }
    return diff === 0;
}

export function readCookie(request, name) {
    const header = request.headers.get("cookie") || "";
    const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

export function sessionCookieHeader(token, maxAgeSeconds) {
    return `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function clearSessionCookieHeader() {
    return `session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
