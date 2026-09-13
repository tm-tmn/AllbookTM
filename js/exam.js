const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzciz7yky6XqQhksOICETxOBLPMXdAR-Cco3H6QRSqf3QRl26kpI64qTBRJvriFNr-E/exec";

document.addEventListener("DOMContentLoaded", () => {
    fetchExamFolders();
});

// 1. ดึงรายชื่อโฟลเดอร์เครื่องมือ
async function fetchExamFolders() {
    const grid = document.getElementById("examFolderGrid");
    if (!grid) return;

    grid.innerHTML = `<div class="loading-state">กำลังโหลดรายการเครื่องมือ...</div>`;

    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?action=examFolders`);
        const folders = await response.json();

        if (folders.error) {
            grid.innerHTML = `<div class="error-state">เกิดข้อผิดพลาด: ${folders.error}</div>`;
            return;
        }

        renderExamFolders(folders);
    } catch (err) {
        grid.innerHTML = `<div class="error-state">ไม่สามารถเชื่อมต่อเครื่องเซิร์ฟเวอร์ได้</div>`;
    }
}

// 2. แสดง Folder Cards
function renderExamFolders(folders) {
    const grid = document.getElementById("examFolderGrid");
    grid.innerHTML = "";

    folders.forEach(folder => {
        const card = document.createElement("div");
        card.className = "exam-folder-card";
        card.innerHTML = `
            <div class="folder-icon">📁</div>
            <div class="folder-name">${folder.name}</div>
        `;
        card.addEventListener("click", () => fetchExamImages(folder.id, folder.name));
        grid.appendChild(card);
    });
}

// 3. ดึงรูปภาพเมื่อคลิกเลือกเครื่องมือ
async function fetchExamImages(folderId, folderName) {
    const imageGrid = document.getElementById("examImageGrid");
    const folderTitle = document.getElementById("selectedFolderTitle");
    
    if (folderTitle) folderTitle.textContent = folderName;
    if (imageGrid) imageGrid.innerHTML = `<div class="loading-state">กำลังโหลดรูปภาพ...</div>`;

    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?action=examImages&folderId=${folderId}`);
        const images = await response.json();

        if (images.error || images.length === 0) {
            imageGrid.innerHTML = `<div class="empty-state">ไม่พบรูปภาพในโฟลเดอร์นี้</div>`;
            return;
        }

        renderExamImages(images);
    } catch (err) {
        imageGrid.innerHTML = `<div class="error-state">เกิดข้อผิดพลาดในการโหลดรูปภาพ</div>`;
    }
}

// 4. แสดงรูปภาพ Thumbnail & คลิกขยายภาพ Modal
function renderExamImages(images) {
    const imageGrid = document.getElementById("examImageGrid");
    imageGrid.innerHTML = "";

    images.forEach(img => {
        const item = document.createElement("div");
        item.className = "exam-image-item";
        item.innerHTML = `
            <img src="${img.url}=s300" alt="${img.name}" loading="lazy" />
            <div class="image-name">${img.name}</div>
        `;
        item.addEventListener("click", () => openImageModal(`${img.url}=s1600`, img.name));
        imageGrid.appendChild(item);
    });
}

// 5. เปิดดูรูปภาพขนาดใหญ่ (Modal Viewer)
function openImageModal(imgUrl, imgTitle) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const modalCaption = document.getElementById("modalCaption");

    if (modal && modalImg) {
        modalImg.src = imgUrl;
        if (modalCaption) modalCaption.textContent = imgTitle;
        modal.classList.add("active");
    }
}
