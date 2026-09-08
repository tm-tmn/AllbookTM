// =========================
// Session Configuration
// =========================

const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes

const MAX_SESSION_TIME = 30 * 60 * 1000; // 30 minutes


// =========================
// Check Login
// =========================

const isLoggedIn =
    sessionStorage.getItem("teamWebsiteLogin");

const loginTime =
    Number(
        sessionStorage.getItem("teamWebsiteLoginTime")
    );


if (
    isLoggedIn !== "true" ||
    !loginTime
) {

    window.location.href = "index.html";

}


// =========================
// Check Maximum Session
// =========================

function checkSessionLifetime() {

    const currentTime = Date.now();

    const sessionAge =
        currentTime - loginTime;


    if (sessionAge >= MAX_SESSION_TIME) {

        logout();

    }

}


// ตรวจสอบ Session ทุก 1 วินาที

setInterval(
    checkSessionLifetime,
    1000
);


// =========================
// Inactivity Timer
// =========================

let inactivityTimer;


function resetInactivityTimer() {

    clearTimeout(inactivityTimer);


    inactivityTimer = setTimeout(() => {

        logout();

    }, INACTIVITY_LIMIT);

}


// =========================
// Detect User Activity
// =========================

const activityEvents = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll",
    "click"
];


activityEvents.forEach((eventName) => {

    document.addEventListener(
        eventName,
        resetInactivityTimer,
        true
    );

});


// เริ่มจับเวลาเมื่อเปิดหน้า

resetInactivityTimer();


// =========================
// Sidebar
// =========================

const sidebar =
    document.getElementById("sidebar");

const sidebarToggle =
    document.getElementById("sidebarToggle");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");


// Desktop Sidebar Toggle

sidebarToggle.addEventListener("click", () => {

    sidebar.classList.toggle("collapsed");

});


// Mobile Sidebar

mobileMenuButton.addEventListener("click", () => {

    sidebar.classList.toggle("mobile-open");

});


// =========================
// Logout
// =========================

const logoutButton =
    document.getElementById("logoutButton");


logoutButton.addEventListener(
    "click",
    logout
);


function logout() {

    sessionStorage.removeItem(
        "teamWebsiteLogin"
    );

    sessionStorage.removeItem(
        "teamWebsiteLoginTime"
    );

    window.location.href =
        "index.html";

}
