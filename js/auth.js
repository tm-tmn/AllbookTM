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
// Get Today's Password
// =========================

function getTodayPassword() {

    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0");

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const year = today.getFullYear();

    return `${day}${month}${year}`;

}


// =========================
// Login
// =========================

function login() {

    const enteredPassword = passwordInput.value.trim();

    const todayPassword = getTodayPassword();


    if (enteredPassword === todayPassword) {

        // Login successful

        sessionStorage.setItem(
            "teamWebsiteLogin",
            "true"
        );

        window.location.href = "home.html";

    } else {

        loginError.textContent =
            "Password ไม่ถูกต้อง";

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
