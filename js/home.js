/* ========================================
   HOME DASHBOARD LOGIC (CLOCK & WEATHER)
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initWeather();
    fetchWindowsTools();   
});


const API_URL = "https://script.google.com/macros/s/AKfycbwHTzirucpV93BmjvTRBsG53IQnfTRTN6CZcNEvjSV8vzzzO5cl0jG4ecJdinbNOYqWxg/exec";

async function fetchWindowsTools() {
    const tableBody = document.getElementById("windowsToolsBody");

    try {
        const response = await fetch(`${API_URL}?action=getWindowsTools`);
        const result = await response.json();

        if (result.status === "success" && result.data.length > 0) {
            tableBody.innerHTML = "";

            result.data.forEach(item => {
                const tr = document.createElement("tr");

                let targetUrl = item.url.trim();
                if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
                    targetUrl = `https://${targetUrl}`;
                }

                tr.innerHTML = `
                    <td class="model-name">${item.name}</td>
                    <td style="text-align: center;">
                        <a href="${targetUrl}" target="_blank" class="dl-btn direct">
                            <span>⬇️</span> Download File
                        </a>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="2" class="table-loading">ไม่พบข้อมูลไฟล์</td></tr>`;
        }
    } catch (error) {
        console.error("Error loading Windows & Tools:", error);
        tableBody.innerHTML = `<tr><td colspan="2" class="table-loading" style="color: #ef4444;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
    }
}


function initClock() {
    function updateClock() {
        const now = new Date();
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById("digitalClock").textContent = `${hours}:${minutes}:${seconds}`;

        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        document.getElementById("digitalDate").textContent = now.toLocaleDateString('en-US', options);
    }

    updateClock();
    setInterval(updateClock, 1000);
}

function initWeather() {
    const tempEl = document.getElementById("weatherTemp");
    const locationEl = document.getElementById("weatherLocation");
    const iconEl = document.getElementById("weatherIcon");

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                    const data = await res.json();
                    
                    const temp = Math.round(data.current_weather.temperature);
                    const weatherCode = data.current_weather.weathercode;

                    tempEl.textContent = `${temp}°C`;
                    locationEl.textContent = "Current Location";
                    iconEl.textContent = getWeatherIcon(weatherCode);

                } catch (err) {
                    console.error("Error fetching weather:", err);
                    locationEl.textContent = "Weather unavailable";
                }
            },
            (error) => {
                console.warn("Geolocation permission denied/failed:", error.message);
                locationEl.textContent = "Location access denied";
            }
        );
    } else {
        locationEl.textContent = "Geolocation not supported";
    }
}

function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if (code >= 1 && code <= 3) return "🌤️";
    if (code >= 45 && code <= 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 80 && code <= 82) return "🌦️";
    if (code >= 95) return "⛈️";
    return "🌡️";
}
