import { createSessionToken, timingSafeEqual, sessionCookieHeader } from "../lib/auth.mjs";

// หมายเหตุ: ไม่ตั้ง runtime: "edge" แล้ว เพราะ Vercel แนะนำให้ย้ายมาใช้
// runtime เริ่มต้น (Node.js) แทน — Node.js รุ่นปัจจุบันมี crypto.subtle
// (Web Crypto API) ใน global scope อยู่แล้ว โค้ดใน lib/auth.mjs จึงทำงาน
// ได้เหมือนเดิมโดยไม่ต้องแก้ไข
//
// สำคัญ: Vercel Node.js runtime รองรับ Web-standard handler แค่ 2 รูปแบบ
// คือ `export default { fetch(request) {...} }` หรือ named export ตาม
// HTTP method เช่น `export function POST(request) {...}` เท่านั้น —
// `export default function handler(request) {...}` แบบ edge runtime เดิม
// ไม่ถูกจดจำ ทำให้ Vercel fallback ไปมองเป็น Node-style (req, res) แทน
// ซึ่งไม่มีใครเรียก res.end() เลย จึง "ค้าง" ไม่ตอบสนองแทนที่จะ error

const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 ชั่วโมง

export default {
    async fetch(request) {
        if (request.method !== "POST") {
            return new Response(JSON.stringify({ error: "Method not allowed" }), {
                status: 405,
                headers: { "Content-Type": "application/json" },
            });
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return new Response(JSON.stringify({ error: "Invalid request body" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const password = typeof body.password === "string" ? body.password : "";
        const expectedPassword = process.env.AUTH_PASSWORD || "";
        const secret = process.env.AUTH_SECRET || "";

        if (!expectedPassword || !secret) {
            // ยังไม่ได้ตั้งค่า AUTH_PASSWORD / AUTH_SECRET ใน Vercel Environment Variables
            return new Response(
                JSON.stringify({ error: "Server not configured. Missing AUTH_PASSWORD or AUTH_SECRET." }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const isValid = timingSafeEqual(password, expectedPassword);

        if (!isValid) {
            // หน่วงเวลาเล็กน้อยเพื่อลดความเร็วของการ brute-force
            await new Promise((resolve) => setTimeout(resolve, 400));
            return new Response(JSON.stringify({ error: "Invalid password" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const token = await createSessionToken(secret, SESSION_TTL_SECONDS);
        const headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Set-Cookie", sessionCookieHeader(token, SESSION_TTL_SECONDS));

        return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    },
};
