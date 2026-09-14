/* ========================================
   SESSION CONFIGURATION
======================================== */

const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 Minutes
const MAX_SESSION_TIME = 30 * 60 * 1000; // 30 Minutes

/* ========================================
   CHECK LOGIN STATUS
======================================== */

const isLoggedIn = sessionStorage.getItem("teamWebsiteLogin");
const loginTime = Number(sessionStorage.getItem("teamWebsiteLoginTime"));

if (isLoggedIn !== "true" || !loginTime) {
    window.location.href = "index.html";
}

/* ========================================
   CHECK MAX SESSION LIFETIME
======================================== */

function checkSessionLifetime() {
    const currentTime = Date.now();
    const sessionAge = currentTime - loginTime;

    if (sessionAge >= MAX_SESSION_TIME) {
        logout();
    }
}

setInterval(checkSessionLifetime, 1000);

/* ========================================
   INACTIVITY TIMER
======================================== */

let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {
        logout();
    }, INACTIVITY_LIMIT);
}

/* Listen to User Activity Events */
const activityEvents = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll",
    "click"
];

activityEvents.forEach((eventName) => {
    document.addEventListener(eventName, resetInactivityTimer, true);
});

// Initial Timer Start
resetInactivityTimer();

/* ========================================
   LOGOUT FUNCTION
======================================== */

function logout() {
    sessionStorage.removeItem("teamWebsiteLogin");
    sessionStorage.removeItem("teamWebsiteLoginTime");
    window.location.href = "index.html";
}

/* ========================================
   SIDEBAR & UI NAVIGATION CONTROLLER
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const mobileMenuButton = document.getElementById("mobileMenuButton");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const logoutButton = document.getElementById("logoutButton");

    /* Desktop Sidebar Toggle (สำรองไว้หากยังต้องการใช้ปุ่มสลับแทน Hover) */
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });
    }

    /* Mobile Drawer Open */
    if (mobileMenuButton && sidebar && sidebarOverlay) {
        mobileMenuButton.addEventListener("click", () => {
            sidebar.classList.add("mobile-open");
            sidebarOverlay.classList.add("active");
        });
    }

    /* Mobile Drawer Close */
    if (sidebarOverlay && sidebar) {
        sidebarOverlay.addEventListener("click", closeMobileSidebar);
    }

    function closeMobileSidebar() {
        if (sidebar) sidebar.classList.remove("mobile-open");
        if (sidebarOverlay) sidebarOverlay.classList.remove("active");
    }

    /* Logout Button Handler */
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }
});
