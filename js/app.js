/* ========================================
   SESSION CONFIGURATION
======================================== */

const INACTIVITY_LIMIT = 10 * 60 * 1000;

const MAX_SESSION_TIME = 30 * 60 * 1000;


/* ========================================
   CHECK LOGIN
======================================== */

const isLoggedIn =
    sessionStorage.getItem(
        "teamWebsiteLogin"
    );


const loginTime =
    Number(
        sessionStorage.getItem(
            "teamWebsiteLoginTime"
        )
    );


if (
    isLoggedIn !== "true" ||
    !loginTime
) {

    window.location.href =
        "index.html";

}


/* ========================================
   CHECK MAX SESSION
======================================== */

function checkSessionLifetime() {

    const currentTime =
        Date.now();

    const sessionAge =
        currentTime - loginTime;


    if (
        sessionAge >=
        MAX_SESSION_TIME
    ) {

        logout();

    }

}


setInterval(
    checkSessionLifetime,
    1000
);


/* ========================================
   INACTIVITY TIMER
======================================== */

let inactivityTimer;


function resetInactivityTimer() {

    clearTimeout(
        inactivityTimer
    );


    inactivityTimer =
        setTimeout(
            () => {

                logout();

            },
            INACTIVITY_LIMIT
        );

}


/* ========================================
   USER ACTIVITY
======================================== */

const activityEvents = [

    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll",
    "click"

];


activityEvents.forEach(
    (eventName) => {

        document.addEventListener(
            eventName,
            resetInactivityTimer,
            true
        );

    }
);


resetInactivityTimer();


/* ========================================
   SIDEBAR
======================================== */

const sidebar =
    document.getElementById(
        "sidebar"
    );


const sidebarToggle =
    document.getElementById(
        "sidebarToggle"
    );


const mobileMenuButton =
    document.getElementById(
        "mobileMenuButton"
    );


const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


/* Desktop / Tablet */

if (sidebarToggle) {

    sidebarToggle.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "collapsed"
            );

        }
    );

}


/* Mobile */

if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.add(
                "mobile-open"
            );

            sidebarOverlay.classList.add(
                "active"
            );

        }
    );

}


/* Close Mobile Sidebar */

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeMobileSidebar
    );

}


function closeMobileSidebar() {

    sidebar.classList.remove(
        "mobile-open"
    );

    sidebarOverlay.classList.remove(
        "active"
    );

}


/* ========================================
   LOGOUT
======================================== */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );

}


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
