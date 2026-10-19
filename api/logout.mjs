import { clearSessionCookieHeader } from "../lib/auth.mjs";

// หมายเหตุ: ใช้ runtime เริ่มต้น (Node.js) แทน "edge" ตามคำแนะนำปัจจุบันของ Vercel
// ต้องใช้ `export default { fetch(request) {...} }` (ไม่ใช่
// `export default function handler(request) {...}`) ให้ Vercel Node.js
// runtime จดจำว่าเป็น Web-standard handler — ดูหมายเหตุยาวใน api/login.mjs

export default {
    async fetch(request) {
        if (request.method !== "POST") {
            return new Response(JSON.stringify({ error: "Method not allowed" }), {
                status: 405,
                headers: { "Content-Type": "application/json" },
            });
        }

        const headers = new Headers({ "Content-Type": "application/json" });
        headers.append("Set-Cookie", clearSessionCookieHeader());

        return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    },
};
