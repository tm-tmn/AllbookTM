// ใส่ URL จริงของคุณตรงบรรทัดแรกนี้
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzciz7yky6XqQhksOICETxOBLPMXdAR-Cco3H6QRSqf3QRl26kpI64qTBRJvriFNr-E/exec"; 

// ตัวแประบบเก็บประวัติการเดินทาง (Breadcrumb Navigation History)
let navigationHistory = [];

document.addEventListener("DOMContentLoaded", () => {
    // เริ่มต้นที่ Root Folder (ใช้ "" หรือ ID ของ Root Manual)
    navigateToFolder("", "Service Manual", true);
});

// ฟังก์ชันเปิดโฟลเดอร์ (ใช้สำหรับเปิดได้ทุกระดับชั้น)
async function navigateToFolder(folderId, folderName, isRoot = false) {
    const grid = document.getElementById("manualGrid");
    const titleHeader = document.getElementById("manualTitleHeader");
    const subtitle = document.getElementById("manualSubtitle");
    const actionContainer = document.getElementById("manualActionContainer");

    // อัปเดต Stack ประวัติ
    if (isRoot) {
        navigationHistory = [{ id: folderId, name: folderName }];
    } else {
        navigationHistory.push({ id: folderId, name: folderName });
    }

    titleHeader.textContent = folderName;
    subtitle.textContent = isRoot 
        ? "Select an equipment category to view service manuals & documents." 
        : `Browsing items in ${folderName}`;

    // แสดงปุ่มย้อนกลับ (ถ้าไม่ใช่ Root)
    if (navigationHistory.length > 1) {
        actionContainer.innerHTML = `
            <button class="back-button" onclick="navigateBack()">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                <span>Back</span>
            </button>
        `;
    } else {
        actionContainer.innerHTML = "";
    }

    grid.innerHTML = `<div class="manual-loading">Loading content...</div>`;

    try {
        let items = { folders: [], files: [] };

        if (isRoot) {
            // หน้า Root ใช้ action=manualFolders
            const response = await fetch(`${GAS_API_URL}?action=manualFolders`);
            const folderData = await response.json();
            items.folders = folderData.map(f => ({ ...f, type: 'folder' }));
        } else {
            // โฟลเดอร์ย่อยใช้ action=manualFiles (ซึ่งส่งคืนทั้ง folders และ files)
            const response = await fetch(`${GAS_API_URL}?action=manualFiles&folderId=${folderId}`);
            items = await response.json();
        }

        grid.innerHTML = "";

        const hasFolders = items.folders && items.folders.length > 0;
        const hasFiles = items.files && items.files.length > 0;

        if (!hasFolders && !hasFiles) {
            grid.innerHTML = `<div class="manual-loading">No folders or PDF documents found inside.</div>`;
            return;
        }

        // 1. แสดง โฟลเดอร์ย่อย ก่อน
        if (hasFolders) {
            items.folders.forEach(folder => {
                const card = document.createElement("div");
                card.className = "manual-card";
                card.innerHTML = `
                    <div class="manual-icon">📁</div>
                    <div class="manual-name">${folder.name}</div>
                    <span class="manual-tag">Folder</span>
                `;
                card.onclick = () => navigateToFolder(folder.id, folder.name, false);
                grid.appendChild(card);
            });
        }

        // 2. แสดง ไฟล์ PDF ต่อท้าย
        if (hasFiles) {
            items.files.forEach(file => {
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
        }

    } catch (error) {
        console.error("Error loading directory content:", error);
        grid.innerHTML = `<div class="manual-loading">Failed to load content.</div>`;
    }
}

// ฟังก์ชันย้อนกลับ 1 ระดับชั้น
function navigateBack() {
    if (navigationHistory.length > 1) {
        navigationHistory.pop(); // ถอดหน้าปัจจุบันออก
        const previousFolder = navigationHistory[navigationHistory.length - 1]; // เอาโฟลเดอร์ก่อนหน้า
        
        // ถ้านับแล้วเหลือ 1 แสดงว่ากลับมาถึง Root
        const isRoot = navigationHistory.length === 1;
        
        // ลบออกชั่วคราวเพราะ navigateToFolder จะ push ซ้ำ
        navigationHistory.pop(); 
        navigateToFolder(previousFolder.id, previousFolder.name, isRoot);
    }
}

// PDF Modal Controls
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
