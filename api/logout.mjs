import { clearSessionCookieHeader } from "../lib/auth.mjs";

// หมายเหตุ: ใช้ runtime เริ่มต้น (Node.js) แทน "edge" ตามคำแนะนำปัจจุบันของ Vercel

export default async function handler(request) {
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    const headers = new Headers({ "Content-Type": "application/json" });
    headers.append("Set-Cookie", clearSessionCookieHeader());

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
