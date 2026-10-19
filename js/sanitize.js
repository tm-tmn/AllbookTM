/* ========================================
   SANITIZE HELPER
   ป้องกัน XSS เมื่อนำข้อมูลจากภายนอก (Google Sheet,
   Google Drive, Cloudflare R2) มาแสดงผลผ่าน innerHTML
   ใช้ escapeHtml() ครอบทุกค่าที่มาจาก API ก่อน insert
   ลงใน innerHTML หรือ attribute เสมอ
======================================== */
function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
