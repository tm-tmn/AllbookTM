const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzciz7yky6XqQhksOICETxOBLPMXdAR-Cco3H6QRSqf3QRl26kpI64qTBRJvriFNr-E/exec"; 

let navigationHistory = [];
let currentViewMode = localStorage.getItem("manualViewMode") || "tiles";

document.addEventListener("DOMContentLoaded", () => {
    navigateToFolder("", "Service Manual", true);
});

// ฟังก์ชันเปลี่ยน View Mode ผ่าน Dropdown Select
function setViewMode(mode) {
    currentViewMode = mode;
    localStorage.setItem("manualViewMode", mode);
    
    const grid = document.getElementById("manualGrid");
    if (grid) {
        grid.className = `manual-grid view-${mode}`;
    }

    // ซิงค์ค่าไปที่ Dropdown หากฟังก์ชันนี้ถูกเรียกจากส่วนอื่น
    const select = document.getElementById("viewModeSelect");
    if (select && select.value !== mode) {
        select.value = mode;
    }
}

// สร้าง HTML Controls ที่เปลี่ยนจาก Button Group เป็น Dropdown Select
function renderControlsHTML(showBack) {
    return `
        <div class="action-controls-wrapper">
            <div class="view-selector-container">
                <select id="viewModeSelect" class="view-select" onchange="setViewMode(this.value)">
                    <option value="tiles" ${currentViewMode === 'tiles' ? 'selected' : ''}>⏹️ Tiles</option>
                    <option value="list" ${currentViewMode === 'list' ? 'selected' : ''}>☰ List</option>
                    <option value="detail" ${currentViewMode === 'detail' ? 'selected' : ''}>📑 Detail</option>
                    <option value="content" ${currentViewMode === 'content' ? 'selected' : ''}>📰 Content</option>
                </select>
            </div>
            ${showBack ? `
                <button class="back-button" onclick="navigateBack()">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    <span>Back</span>
                </button>
            ` : ''}
        </div>
    `;
}

async function navigateToFolder(folderId, folderName, isRoot = false) {
    const grid = document.getElementById("manualGrid");
    const titleHeader = document.getElementById("manualTitleHeader");
    const subtitle = document.getElementById("manualSubtitle");
    const actionContainer = document.getElementById("manualActionContainer");

    if (isRoot) {
        navigationHistory = [{ id: folderId, name: folderName }];
    } else {
        navigationHistory.push({ id: folderId, name: folderName });
    }

    titleHeader.textContent = folderName;
    subtitle.textContent = isRoot 
        ? "Select an equipment category to view service manuals & documents." 
        : `Browsing items in ${folderName}`;

    actionContainer.innerHTML = renderControlsHTML(navigationHistory.length > 1);

    grid.className = `manual-grid view-${currentViewMode}`;
    grid.innerHTML = `<div class="manual-loading">Loading content...</div>`;

    try {
        let items = { folders: [], files: [] };

        if (isRoot) {
            const response = await fetch(`${GAS_API_URL}?action=manualFolders`);
            const folderData = await response.json();
            items.folders = folderData.map(f => ({ ...f, type: 'folder' }));
        } else {
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

        if (hasFolders) {
            items.folders.forEach(folder => {
                const card = document.createElement("div");
                card.className = "manual-card";
                card.innerHTML = `
                    <div class="manual-icon">📁</div>
                    <div class="manual-name" title="${folder.name}">${folder.name}</div>
                    <span class="manual-tag">Folder</span>
                `;
                card.onclick = () => navigateToFolder(folder.id, folder.name, false);
                grid.appendChild(card);
            });
        }

        if (hasFiles) {
            items.files.forEach(file => {
                const card = document.createElement("div");
                card.className = "manual-card";
                card.innerHTML = `
                    <div class="manual-icon">📄</div>
                    <div class="manual-name" title="${file.name}">${file.name}</div>
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

function navigateBack() {
    if (navigationHistory.length > 1) {
        navigationHistory.pop(); 
        const previousFolder = navigationHistory[navigationHistory.length - 1]; 
        const isRoot = navigationHistory.length === 1;
        
        navigationHistory.pop(); 
        navigateToFolder(previousFolder.id, previousFolder.name, isRoot);
    }
}

function openPdfModal(fileId, fileName, webViewLink) {
    const modal = document.getElementById("pdfModal");
    const modalTitle = document.getElementById("pdfModalTitle");
    const iframe = document.getElementById("pdfIframe");
    const openBtn = document.getElementById("pdfOpenNewTabBtn");

    modalTitle.textContent = fileName;
    
    if (openBtn) {
        openBtn.href = webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
    }
    
    iframe.src = "about:blank";
    iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;

    modal.classList.add("active");
}

function closePdfModal() {
    const modal = document.getElementById("pdfModal");
    const iframe = document.getElementById("pdfIframe");
    
    modal.classList.remove("active");
    iframe.src = "";
}
