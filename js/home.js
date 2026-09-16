/* ========================================
   HOME DASHBOARD LOGIC (CLOCK & WEATHER)
======================================== */
let currentSheetData = [];

document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initWeather();
    fetchWindowsTools();
    initDownloadCenter();   
});

const API_URL = "https://script.google.com/macros/s/AKfycbwHTzirucpV93BmjvTRBsG53IQnfTRTN6CZcNEvjSV8vzzzO5cl0jG4ecJdinbNOYqWxg/exec";
const DL_API_URL = "https://script.google.com/macros/s/AKfycbwULQcYLojlJezIc1_FWXkHeJxIqWa-vrNtyH_zzC9P5YiRlypXJuTldcl_GbGYwLSk/exec";

async function initDownloadCenter() {
    const categorySelect = document.getElementById("categorySelect");
    const modelSelect = document.getElementById("modelSelect");

    // 1. ดึงหมวดหมู่ทั้งหมดจาก Sheet Tabs
    try {
        const res = await fetch(`${DL_API_URL}?action=getCategories`);
        const result = await res.json();

        if (result.status === "success" && result.data.length > 0) {
            categorySelect.innerHTML = "";
            result.data.forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat;
                opt.textContent = cat;
                categorySelect.appendChild(opt);
            });

            // โหลดข้อมูลหมวดแรกทันที
            loadCategoryData(categorySelect.value);
        }
    } catch (err) {
        console.error("Error loading categories:", err);
    }

    // เมื่อเปลี่ยน Product Category
    categorySelect.addEventListener("change", (e) => {
        loadCategoryData(e.target.value);
    });

    // เมื่อเปลี่ยน Model Filter
    modelSelect.addEventListener("change", (e) => {
        renderTableData(e.target.value);
    });
}

// ดึงข้อมูลตาม Sheet ที่เลือก
async function loadCategoryData(categoryName) {
    const tableBody = document.getElementById("downloadCenterBody");
    const modelSelect = document.getElementById("modelSelect");

    tableBody.innerHTML = `<tr><td colspan="4" class="table-loading">กำลังโหลดข้อมูล ${categoryName}...</td></tr>`;
    modelSelect.disabled = true;

    try {
        const res = await fetch(`${DL_API_URL}?action=getDownloadData&category=${encodeURIComponent(categoryName)}`);
        const result = await res.json();

        if (result.status === "success") {
            currentSheetData = result.data;

            // สร้างตัวเลือกใน Model Dropdown
            modelSelect.innerHTML = `<option value="ALL">-- แสดงทุกรุ่น (${categoryName}) --</option>`;
            currentSheetData.forEach(item => {
                const opt = document.createElement("option");
                opt.value = item.model;
                opt.textContent = item.model;
                modelSelect.appendChild(opt);
            });

            modelSelect.disabled = false;
            renderTableData("ALL");
        }
    } catch (err) {
        console.error("Error loading download data:", err);
        tableBody.innerHTML = `<tr><td colspan="4" class="table-loading" style="color:#ef4444;">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>`;
    }
}

// แสดงผลตาราง
function renderTableData(selectedModel) {
    const tableBody = document.getElementById("downloadCenterBody");
    tableBody.innerHTML = "";

    const filteredData = selectedModel === "ALL" 
        ? currentSheetData 
        : currentSheetData.filter(item => item.model === selectedModel);

    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="table-loading">ไม่พบข้อมูล</td></tr>`;
        return;
    }

    filteredData.forEach(item => {
        const tr = document.createElement("tr");

        const installBtn = formatLinkBtn(item.installLink, "Install");
        const updateBtn = formatLinkBtn(item.updateLink, "Update");

        tr.innerHTML = `
            <td class="model-name">${item.model}</td>
            <td style="text-align: center;">${item.version}</td>
            <td style="text-align: center;">${installBtn}</td>
            <td style="text-align: center;">${updateBtn}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function formatLinkBtn(url, label) {
    if (!url || url === "-") return `<span class="no-data">-</span>`;
    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = `https://${targetUrl}`;
    }
    const btnClass = label.toLowerCase() === "install" ? "install" : "update";
    return `<a href="${targetUrl}" target="_blank" class="dl-btn ${btnClass}"> Download ${label}</a>`;
}

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
