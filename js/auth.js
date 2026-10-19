const enterButton = document.getElementById("enterButton");
const loginModal = document.getElementById("loginModal");
const closeButton = document.getElementById("closeButton");
const loginButton = document.getElementById("loginButton");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");


// =========================
// Open Login
// =========================

enterButton.addEventListener("click", () => {

    loginModal.classList.add("active");

    passwordInput.focus();

});


// =========================
// Close Login
// =========================

closeButton.addEventListener("click", () => {

    closeLogin();

});


function closeLogin() {

    loginModal.classList.remove("active");

    passwordInput.value = "";

    loginError.textContent = "";

}


// =========================
// Login
// ตรวจสอบรหัสผ่านผ่าน /api/login (ฝั่ง server จริง)
// แทนการเทียบวันที่ ddmmyyyy ที่คำนวณฝั่ง client แบบเดิม
// server จะตอบกลับด้วย cookie "session" ที่เซ็นแบบ HMAC
// ซึ่ง middleware.js จะเป็นคนตรวจสอบก่อนเสิร์ฟหน้าที่ต้อง login
// =========================

async function login() {

    const enteredPassword = passwordInput.value.trim();

    if (!enteredPassword) {
        loginError.textContent = "กรุณากรอกรหัสผ่าน";
        return;
    }

    loginButton.disabled = true;
    loginError.textContent = "";

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ password: enteredPassword }),
        });

        if (response.ok) {
            window.location.href = "home.html";
            return;
        }

        if (response.status === 401) {
            loginError.textContent = "Password ไม่ถูกต้อง";
        } else {
            loginError.textContent = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
        }

    } catch (err) {
        console.error("Login request failed:", err);
        loginError.textContent = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่";
    } finally {
        loginButton.disabled = false;
        passwordInput.value = "";
        passwordInput.focus();
    }

}


// =========================
// Login Button
// =========================

loginButton.addEventListener("click", login);


// =========================
// Press Enter
// =========================

passwordInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        login();

    }

});


// =========================
// Close Modal by clicking
// outside the box
// =========================

loginModal.addEventListener("click", (event) => {

    if (event.target === loginModal) {

        closeLogin();

    }

});

// =========================
// Close Modal on ESC Key Press
// =========================
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && loginModal.classList.contains("active")) {
        closeLogin();
    }
});
