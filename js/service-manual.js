let allManualsData = null; // เก็บข้อมูลทั้งหมดจาก manuals-data.json
let navigationHistory = [];
let currentViewMode = localStorage.getItem("manualViewMode") || "tiles";

document.addEventListener("DOMContentLoaded", async () => {
    await initManualsData();
});

// โหลดข้อมูลจาก manuals-data.json มาเตรียมไว้
async function initManualsData() {
    const grid = document.getElementById("manualGrid");
    if (grid) {
        grid.innerHTML = `<div class="manual-loading">Loading manuals data...</div>`;
    }

    try {
        const response = await fetch("./manuals-data.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allManualsData = await response.json();
        
        // เมื่อโหลดข้อมูลเสร็จแล้ว ให้เริ่มต้นที่โฟลเดอร์ Root
        navigateToFolder("", "Service Manual", true);
    } catch (error) {
        console.error("Error loading manuals-data.json:", error);
        if (grid) {
            grid.innerHTML = `<div class="manual-loading">Failed to load manuals data.</div>`;
        }
    }
}

// ฟังก์ชันเปลี่ยน View Mode ผ่าน Dropdown Select
function setViewMode(mode) {
    currentViewMode = mode;
    localStorage.setItem("manualViewMode", mode);
    
    const grid = document.getElementById("manualGrid");
    if (grid) {
        grid.className = `manual-grid view-${mode}`;
    }

    const select = document.getElementById("viewModeSelect");
    if (select && select.value !== mode) {
        select.value = mode;
    }
}

// สร้าง HTML Controls
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

function findNodeByPath(pathArray) {
    if (!allManualsData || !pathArray || pathArray.length === 0) return null;
    
    let current = { children: allManualsData };

    for (const segment of pathArray) {
        if (current && current.children) {
            current = current.children.find(
                item => item.id === segment || item.name === segment
            );
        } else {
            return null;
        }
    }
    return current;
}

function navigateToFolder(folderPath, folderName, isRoot = false) {
    const grid = document.getElementById("manualGrid");
    const titleHeader = document.getElementById("manualTitleHeader");
    const subtitle = document.getElementById("manualSubtitle");
    const actionContainer = document.getElementById("manualActionContainer");

    if (isRoot) {
        navigationHistory = [{ path: [], name: folderName }];
    } else {
        navigationHistory.push({ path: folderPath, name: folderName });
    }

    if (titleHeader) titleHeader.textContent = folderName;
    if (subtitle) {
        subtitle.textContent = isRoot 
            ? "Select an equipment category to view service manuals & documents." 
            : `Browsing items in ${folderName}`;
    }

    if (actionContainer) {
        actionContainer.innerHTML = renderControlsHTML(navigationHistory.length > 1);
    }

    if (!grid) return;

    grid.className = `manual-grid view-${currentViewMode}`;

    const currentFolder = isRoot 
    ? { children: allManualsData }
    : findNodeByPath(folderPath);

    if (!currentFolder || !currentFolder.children) {
        grid.innerHTML = `<div class="manual-loading">No items found inside.</div>`;
        return;
    }

    grid.innerHTML = "";

    const folders = currentFolder.children.filter(item => item.type === 'folder');
    const files = currentFolder.children.filter(item => item.type === 'file');

    if (folders.length === 0 && files.length === 0) {
        grid.innerHTML = `<div class="manual-loading">No folders or PDF documents found inside.</div>`;
        return;
    }
    folders.forEach(folder => {
        const card = document.createElement("div");
        card.className = "manual-card";
        card.innerHTML = `
            <div class="manual-icon">📁</div>
            <div class="manual-name" title="${folder.name}">${folder.name}</div>
            <span class="manual-tag">Folder</span>
        `;

        const currentPath = navigationHistory[navigationHistory.length - 1].path;
        const folderIdentifier = folder.id || folder.name;
        const newPath = [...currentPath, folderIdentifier];
        
        card.onclick = () => navigateToFolder(newPath, folder.name, false);
        grid.appendChild(card);
    });

    files.forEach(file => {
        const card = document.createElement("div");
        card.className = "manual-card";
        card.innerHTML = `
            <div class="manual-icon">📄</div>
            <div class="manual-name" title="${file.name}">${file.name}</div>
            <span class="manual-tag">PDF</span>
        `;

        card.onclick = () => openPdfModal(file.url, file.name);
        grid.appendChild(card);
    });
}

function navigateBack() {
    if (navigationHistory.length > 1) {
        navigationHistory.pop(); 
        const previousFolder = navigationHistory[navigationHistory.length - 1]; 
        const isRoot = navigationHistory.length === 1;
        
        const path = previousFolder.path;
        const name = previousFolder.name;
        
        navigationHistory.pop(); // ลบออกเพื่อให้ navigateToFolder ดันเข้าตามปกติ
        navigateToFolder(path, name, isRoot);
    }
}

// เปิดไฟล์ PDF ด้วย Direct R2 URL
function openPdfModal(fileUrl, fileName) {
    const modal = document.getElementById("pdfModal");
    const modalTitle = document.getElementById("pdfModalTitle");
    const iframe = document.getElementById("pdfIframe");
    const openBtn = document.getElementById("pdfOpenNewTabBtn");

    if (modalTitle) modalTitle.textContent = fileName;
    
    if (openBtn) {
        openBtn.href = fileUrl;
    }
    
    if (iframe) {
        iframe.src = fileUrl;
    }

    if (modal) {
        modal.classList.add("active");
    }
}

function closePdfModal() {
    const modal = document.getElementById("pdfModal");
    const iframe = document.getElementById("pdfIframe");
    
    if (modal) modal.classList.remove("active");
    if (iframe) iframe.src = "";
}
