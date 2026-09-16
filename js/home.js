/* ========================================
   HOME DASHBOARD LOGIC (CLOCK, WEATHER & DOWNLOADS)
======================================== */
let currentSheetData = [];
const API_URL = "https://script.google.com/macros/s/AKfycbwULQcYLojlJezIc1_FWXkHeJxIqWa-vrNtyH_zzC9P5YiRlypXJuTldcl_GbGYwLSk/exec";

document.addEventListener("DOMContentLoaded", async () => {
    initClock();
    initWeather();
    
    await initDownloadCenter();
    await fetchWindowsTools();  
});

// ----------------------------------------
// 1. DOWNLOAD CENTER LOGIC
// ----------------------------------------
async function initDownloadCenter() {
    const categorySelect = document.getElementById("categorySelect");
    const modelSelect = document.getElementById("modelSelect");

    try {
        const res = await fetch(`${API_URL}?action=getCategories`, { redirect: "follow" });
        const result = await res.json();

        if (result.status === "success" && result.data.length > 0) {
            categorySelect.innerHTML = "";

            const allOpt = document.createElement("option");
            allOpt.value = "ALL";
            allOpt.textContent = "All Categories (ทั้งหมด)";
            categorySelect.appendChild(allOpt);

            result.data.forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat;
                opt.textContent = cat;
                categorySelect.appendChild(opt);
            });

            const defaultCategory = result.data[0]; 
            categorySelect.value = defaultCategory;
  
            loadCategoryData(defaultCategory);
        }
    } catch (err) {
        console.error("Error loading categories:", err);
    }

    categorySelect.addEventListener("change", (e) => {
        loadCategoryData(e.target.value);
    });

    modelSelect.addEventListener("change", (e) => {
        renderTableData(e.target.value);
    });
}

async function loadCategoryData(categoryName) {
    const tableBody = document.getElementById("downloadCenterBody");
    const modelSelect = document.getElementById("modelSelect");

    const loadingText = categoryName === "ALL" ? "ข้อมูลทั้งหมด" : categoryName;
    tableBody.innerHTML = `<tr><td colspan="4" class="table-loading">กำลังโหลดข้อมูล ${loadingText}...</td></tr>`;
    modelSelect.disabled = true;

    try {
        const res = await fetch(`${API_URL}?action=getDownloadData&category=${encodeURIComponent(categoryName)}`, { redirect: "follow" });
        const result = await res.json();

        if (result.status === "success") {
            currentSheetData = result.data;

            const modelLabel = categoryName === "ALL" ? "แสดงทุกรุ่น" : `แสดงทุกรุ่น (${categoryName})`;
            modelSelect.innerHTML = `<option value="ALL">-- ${modelLabel} --</option>`;

            const uniqueModels = [...new Set(currentSheetData.map(item => item.model))].filter(Boolean);
            
            uniqueModels.forEach(model => {
                const opt = document.createElement("option");
                opt.value = model;
                opt.textContent = model;
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
            <td class="model-name">${item.model || "-"}</td>
            <td style="text-align: center;">${item.version || "-"}</td>
            <td style="text-align: center;">${installBtn}</td>
            <td style="text-align: center;">${updateBtn}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function formatLinkBtn(url, label) {
    if (!url || url === "-") return `<span class="no-data">-</span>`;
    let targetUrl = String(url).trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = `https://${targetUrl}`;
    }
    const btnClass = label.toLowerCase() === "install" ? "install" : "update";
    return `<a href="${targetUrl}" target="_blank" class="dl-btn ${btnClass}">Download ${label}</a>`;
}

// ----------------------------------------
// 2. WINDOWS & TOOLS LOGIC (ดึงจาก Sheet "link")
// ----------------------------------------
async function fetchWindowsTools() {
    const tableBody = document.getElementById("windowsToolsBody");

    try {
        const response = await fetch(`${API_URL}?action=getWindowsTools&_t=${Date.now()}`, {
            method: "GET",
            redirect: "follow"
        });

        const result = await response.json();

        if (result.status === "success" && result.data && result.data.length > 0) {
            tableBody.innerHTML = "";

            result.data.forEach(item => {
                const tr = document.createElement("tr");

                let targetUrl = (item.url || "").trim();
                if (targetUrl && !targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
                    targetUrl = `https://${targetUrl}`;
                }

                tr.innerHTML = `
                    <td class="model-name">${item.name || "-"}</td>
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
        tableBody.innerHTML = `<tr><td colspan="2" class="table-loading" style="color: #ef4444;">เกิดข้อผิดพลาดในการโหลดข้อมูล (${error.message})</td></tr>`;
    }
}

// ----------------------------------------
// 3. CLOCK & WEATHER LOGIC
// ----------------------------------------
function initClock() {
    function updateClock() {
        const now = new Date();
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const clockEl = document.getElementById("digitalClock");
        const dateEl = document.getElementById("digitalDate");

        if (clockEl) clockEl.textContent = `${hours}:${minutes}:${seconds}`;
        if (dateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            dateEl.textContent = now.toLocaleDateString('en-US', options);
        }
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

                    if (tempEl) tempEl.textContent = `${temp}°C`;
                    if (locationEl) locationEl.textContent = "Current Location";
                    if (iconEl) iconEl.textContent = getWeatherIcon(weatherCode);

                } catch (err) {
                    console.error("Error fetching weather:", err);
                    if (locationEl) locationEl.textContent = "Weather unavailable";
                }
            },
            (error) => {
                console.warn("Geolocation permission denied/failed:", error.message);
                if (locationEl) locationEl.textContent = "Location access denied";
            }
        );
    } else {
        if (locationEl) locationEl.textContent = "Geolocation not supported";
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
