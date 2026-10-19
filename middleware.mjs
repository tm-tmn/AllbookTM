import { verifySessionToken, readCookie } from "./lib/auth.mjs";

/*
 * Vercel Edge Middleware — นี่คือจุดที่ "ปิดกั้นจริง" ฝั่ง server
 * ก่อนหน้านี้ระบบเช็ค login ทำแค่ฝั่ง client (JS ในเบราว์เซอร์) ซึ่งใครก็ bypass
 * ได้ง่าย ๆ ด้วยการสั่ง sessionStorage.setItem() ใน console
 *
 * ตอนนี้ไฟล์ html ที่อยู่ใน matcher ด้านล่างจะถูกเช็ค cookie "session"
 * (เซ็นด้วย HMAC, ตรวจสอบลายเซ็น + เวลาหมดอายุ) ก่อนเสิร์ฟไฟล์เสมอ
 * ถ้าไม่มี cookie หรือ cookie ไม่ถูกต้อง -> redirect ไป index.html ทันที
 * โดยที่ "เนื้อหาในหน้าเหล่านี้จะไม่ถูกส่งออกไปที่เบราว์เซอร์เลย"
 */

export const config = {
    matcher: [
        "/home.html",
        "/service-manual.html",
        "/exam.html",
        "/troubleshooting.html",
        "/manuals-data.json",
    ],
};

export default async function middleware(request) {
    const secret = process.env.AUTH_SECRET || "";
    const token = readCookie(request, "session");
    const isValid = secret ? await verifySessionToken(token, secret) : false;

    if (!isValid) {
        const loginUrl = new URL("/index.html", request.url);
        return Response.redirect(loginUrl, 302);
    }

    // cookie ถูกต้อง -> ปล่อยผ่านไปเสิร์ฟไฟล์ตามปกติ (ไม่ return อะไร)
}
