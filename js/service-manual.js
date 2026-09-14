const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzciz7yky6XqQhksOICETxOBLPMXdAR-Cco3H6QRSqf3QRl26kpI64qTBRJvriFNr-E/exec"; 

document.addEventListener("DOMContentLoaded", () => {
    loadManualFolders();
});

// 1. ดึงโฟลเดอร์รุ่น/อุปกรณ์ ของ Service Manual
async function loadManualFolders() {
    const grid = document.getElementById("manualGrid");
    grid.innerHTML = `<div class="manual-loading">Loading service manuals...</div>`;

    try {
        // เรียกใช้ action=manualFolders
        const response = await fetch(`${GAS_API_URL}?action=manualFolders`);
        const folders = await response.json();

        grid.innerHTML = "";

        if (!folders || folders.length === 0) {
            grid.innerHTML = `<div class="manual-loading">No manual folders found.</div>`;
            return;
        }

        folders.forEach(folder => {
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

// 2. ดึงไฟล์ PDF ด้านในโฟลเดอร์นั้น
async function loadManualFiles(folderId, folderName) {
    const grid = document.getElementById("manualGrid");
    const titleHeader = document.getElementById("manualTitleHeader");
    const subtitle = document.getElementById("manualSubtitle");
    const actionContainer = document.getElementById("manualActionContainer");

    titleHeader.textContent = folderName;
    subtitle.textContent = "Click on a document to preview PDF manual.";
    
    actionContainer.innerHTML = `
        <button class="back-button" onclick="resetToFolders()">
            <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
    `;

    grid.innerHTML = `<div class="manual-loading">Loading documents...</div>`;

    try {
        // เรียกใช้ action=manualFiles พร้อมส่ง folderId
        const response = await fetch(`${GAS_API_URL}?action=manualFiles&folderId=${folderId}`);
        const files = await response.json();

        grid.innerHTML = "";

        if (!files || files.length === 0) {
            grid.innerHTML = `<div class="manual-loading">No PDF manuals found in this folder.</div>`;
            return;
        }

        files.forEach(file => {
            const card = document.createElement("div");
            card.className = "manual-card";
            card.innerHTML = `
                <div class="manual-icon">📄</div>
                <div class="manual-name">${file.name}</div>
                <span class="manual-tag">PDF</span>
            `;
            card.onclick = () => openPdfModal(file.id, file.name, file.webViewLink);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading PDF files:", error);
        grid.innerHTML = `<div class="manual-loading">Failed to load PDF documents.</div>`;
    }
}

function resetToFolders() {
    document.getElementById("manualTitleHeader").textContent = "Service Manual";
    document.getElementById("manualSubtitle").textContent = "Select an equipment category to view service manuals & documents.";
    document.getElementById("manualActionContainer").innerHTML = "";
    loadManualFolders();
}

function openPdfModal(fileId, fileName, webViewLink) {
    const modal = document.getElementById("pdfModal");
    const modalTitle = document.getElementById("pdfModalTitle");
    const iframe = document.getElementById("pdfIframe");
    const openNewTabBtn = document.getElementById("pdfOpenNewTabBtn");

    modalTitle.textContent = fileName;
    iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
    openNewTabBtn.href = webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

    modal.classList.add("active");
}

function closePdfModal() {
    const modal = document.getElementById("pdfModal");
    const iframe = document.getElementById("pdfIframe");
    
    modal.classList.remove("active");
    iframe.src = "";
}
