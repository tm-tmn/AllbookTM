// กำหนด Folder ID ของ Google Drive ที่เก็บไฟล์ Service Manual
const SERVICE_MANUAL_FOLDER_ID = "1FA9jloILZQ7CFCPiGY0P9kZwH76mvqIp";
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzciz7yky6XqQhksOICETxOBLPMXdAR-Cco3H6QRSqf3QRl26kpI64qTBRJvriFNr-E/exec"; 

document.addEventListener("DOMContentLoaded", () => {
    loadManualFolders(SERVICE_MANUAL_FOLDER_ID);
});

// ดึงรายการโฟลเดอร์อุปกรณ์
async function loadManualFolders(folderId) {
    const grid = document.getElementById("manualGrid");
    grid.innerHTML = `<div class="manual-loading">Loading service manuals...</div>`;

    try {
        const response = await fetch(`${GAS_API_URL}?folderId=${folderId}`);
        const data = await response.json();

        grid.innerHTML = "";

        if (!data.folders || data.folders.length === 0) {
            grid.innerHTML = `<div class="manual-loading">No manual folders found.</div>`;
            return;
        }

        data.folders.forEach(folder => {
            const card = document.createElement("div");
            card.className = "manual-card";
            card.innerHTML = `
                <div class="manual-icon">📁</div>
                <div class="manual-name">${folder.name}</div>
                <span class="manual-tag">Folder</span>
            `;
            card.onclick = () => loadManualFiles(folder.id, folder.name);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading folders:", error);
        grid.innerHTML = `<div class="manual-loading">Failed to load manuals.</div>`;
    }
}

// ดึงรายการไฟล์ PDF ในโฟลเดอร์นั้นๆ
async function loadManualFiles(folderId, folderName) {
    const grid = document.getElementById("manualGrid");
    const titleHeader = document.getElementById("manualTitleHeader");
    const subtitle = document.getElementById("manualSubtitle");
    const actionContainer = document.getElementById("manualActionContainer");

    titleHeader.textContent = folderName;
    subtitle.textContent = "Click on a document to preview PDF manual.";
    
    // แสดงปุ่ม Back
    actionContainer.innerHTML = `
        <button class="back-button" onclick="resetToFolders()">
            <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
    `;

    grid.innerHTML = `<div class="manual-loading">Loading documents...</div>`;

    try {
        const response = await fetch(`${GAS_API_URL}?folderId=${folderId}`);
        const data = await response.json();

        grid.innerHTML = "";

        if (!data.files || data.files.length === 0) {
            grid.innerHTML = `<div class="manual-loading">No manual documents found in this folder.</div>`;
            return;
        }

        data.files.forEach(file => {
            const card = document.createElement("div");
            card.className = "manual-card";
            card.innerHTML = `
                <div class="manual-icon">📄</div>
                <div class="manual-name">${file.name}</div>
                <span class="manual-tag">PDF</span>
            `;
            // เมื่อกดการ์ด จะเปิดดู PDF ใน Modal
            card.onclick = () => openPdfModal(file.id, file.name, file.webViewLink);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading PDF files:", error);
        grid.innerHTML = `<div class="manual-loading">Failed to load PDF documents.</div>`;
    }
}

// ย้อนกลับไปหน้าโฟลเดอร์หลัก
function resetToFolders() {
    document.getElementById("manualTitleHeader").textContent = "Service Manual";
    document.getElementById("manualSubtitle").textContent = "Select an equipment category to view service manuals & documents.";
    document.getElementById("manualActionContainer").innerHTML = "";
    loadManualFolders(SERVICE_MANUAL_FOLDER_ID);
}

// เปิดดู PDF Modal
function openPdfModal(fileId, fileName, webViewLink) {
    const modal = document.getElementById("pdfModal");
    const modalTitle = document.getElementById("pdfModalTitle");
    const iframe = document.getElementById("pdfIframe");
    const openNewTabBtn = document.getElementById("pdfOpenNewTabBtn");

    modalTitle.textContent = fileName;
    
    // Embed PDF Viewer ผ่าน Google Drive Preview URL
    iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
    openNewTabBtn.href = webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

    modal.classList.add("active");
}

// ปิด PDF Modal
function closePdfModal() {
    const modal = document.getElementById("pdfModal");
    const iframe = document.getElementById("pdfIframe");
    
    modal.classList.remove("active");
    iframe.src = ""; // เคลียร์ src เพื่อหยุดการโหลดใน Background
}
