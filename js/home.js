/* ========================================
   HOME DASHBOARD LOGIC
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    // ทักทายผู้ใช้ตามช่วงเวลา (Morning / Afternoon / Evening)
    updateGreeting();
});

function updateGreeting() {
    const greetingElement = document.getElementById("welcomeGreeting");
    if (!greetingElement) return;

    const hour = new Date().getHours();
    let greetingText = "Welcome back, Team! 👋";

    if (hour < 12) {
        greetingText = "Good Morning, Team! ☀️";
    } else if (hour < 18) {
        greetingText = "Good Afternoon, Team! 🌤️";
    } else {
        greetingText = "Good Evening, Team! 🌙";
    }

    greetingElement.textContent = greetingText;
}
