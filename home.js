// =========================
// Check Login
// =========================

const isLoggedIn =
    sessionStorage.getItem("teamWebsiteLogin");


if (isLoggedIn !== "true") {

    window.location.href = "index.html";

}


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


logoutButton.addEventListener("click", () => {

    sessionStorage.removeItem(
        "teamWebsiteLogin"
    );

    window.location.href = "index.html";

});
