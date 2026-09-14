/* ========================================
   GOOGLE APPS SCRIPT API
======================================== */
const API_URL = "https://script.google.com/macros/s/AKfycbzciz7yky6XqQhksOICETxOBLPMXdAR-Cco3H6QRSqf3QRl26kpI64qTBRJvriFNr-E/exec";

/* ========================================
   LOAD EXAM FOLDERS
======================================== */
async function loadExamFolders() {
    const grid = document.getElementById("equipmentGrid");
    const actionContainer = document.getElementById("actionContainer");
    const folderTitleHeader = document.getElementById("folderTitleHeader");
    const folderSubtitle = document.getElementById("folderSubtitle");

    actionContainer.innerHTML = "";
    folderTitleHeader.textContent = "Exam";
    folderSubtitle.textContent = "Select equipment to view exam answer images.";
    grid.className = "exam-folder-grid";
    grid.innerHTML = `<div class="exam-loading">Loading...</div>`;

    try {
        const response = await fetch(API_URL + "?action=examFolders");
        const folders = await response.json();

        displayExamFolders(folders);

    } catch (error) {
        console.error("Error loading exam folders:", error);
        grid.innerHTML = `<div class="exam-loading">ไม่สามารถโหลดข้อมูลได้</div>`;
    }
}

/* ========================================
   DISPLAY FOLDERS
======================================== */
function displayExamFolders(folders) {
    const grid = document.getElementById("equipmentGrid");
    grid.innerHTML = "";

    folders.forEach(folder => {
        const card = document.createElement("button");
        card.className = "exam-folder-card";

        card.innerHTML = `
            <div class="exam-folder-icon">📁</div>
            <div class="exam-folder-name">${folder.name}</div>
        `;

        // เพิ่ม Event Listener เพื่อกดดูรูปภาพในโฟลเดอร์
        card.addEventListener("click", () => {
            loadExamImages(folder.id, folder.name);
        });

        grid.appendChild(card);
    });
}

/* ========================================
   LOAD EXAM IMAGES
======================================== */
async function loadExamImages(folderId, folderName) {
    const grid = document.getElementById("equipmentGrid");
    const actionContainer = document.getElementById("actionContainer");
    const folderTitleHeader = document.getElementById("folderTitleHeader");
    const folderSubtitle = document.getElementById("folderSubtitle");

    folderTitleHeader.textContent = folderName;
    folderSubtitle.textContent = `Showing exam images for ${folderName}`;

    // สร้างปุ่ม Icon-only ย้อนกลับ
    actionContainer.innerHTML = `
        <button class="back-button" onclick="loadExamFolders()" title="กลับไปเลือกเครื่องมือ" aria-label="กลับไปเลือกเครื่องมือ">
            <svg viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
        </button>
    `;

    grid.className = "exam-image-grid";
    grid.innerHTML = `<div class="exam-loading">กำลังโหลดรูปภาพ...</div>`;

    try {
        const response = await fetch(`${API_URL}?action=examImages&folderId=${folderId}`);
        const images = await response.json();

        if (!images || images.length === 0) {
            grid.innerHTML = `<div class="exam-loading">ไม่พบรูปภาพในโฟลเดอร์นี้</div>`;
            return;
        }

        displayExamImages(images);

    } catch (error) {
        console.error("Error loading exam images:", error);
        grid.innerHTML = `<div class="exam-loading">ไม่สามารถโหลดรูปภาพได้</div>`;
    }
}

/* ========================================
   DISPLAY IMAGES THUMBNAIL
======================================== */
function displayExamImages(images) {
    const grid = document.getElementById("equipmentGrid");
    grid.innerHTML = "";

    images.forEach(img => {
        const item = document.createElement("div");
        item.className = "exam-image-card";

        const imageUrl = img.url ? `${img.url}=s400` : `https://lh3.googleusercontent.com/d/${img.id}=s400`;
        const fullImageUrl = img.url ? `${img.url}=s1600` : `https://lh3.googleusercontent.com/d/${img.id}=s1600`;

        item.innerHTML = `
            <div class="exam-image-wrapper">
                <img src="${imageUrl}" alt="${img.name}" loading="lazy">
            </div>
            <div class="exam-image-name">${img.name}</div>
        `;

        // คลิกที่รูปเพื่อเปิด Modal Viewer
        item.addEventListener("click", () => {
            openImageModal(fullImageUrl, img.name);
        });

        grid.appendChild(item);
    });
}

/* ========================================
   IMAGE MODAL CONTROLLER
======================================== */
function openImageModal(url, title) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const modalCaption = document.getElementById("modalCaption");

    modalImg.src = url;
    modalCaption.textContent = title;
    modal.classList.add("active");
}

function closeImageModal() {
    const modal = document.getElementById("imageModal");
    modal.classList.remove("active");
}

// ปิด Modal เมื่อคลิกพื้นที่ว่างรอบๆ
document.getElementById("imageModal").addEventListener("click", (e) => {
    if (e.target.id === "imageModal") {
        closeImageModal();
    }
});

/* ========================================
   START
======================================== */
document.addEventListener("DOMContentLoaded", () => {
    loadExamFolders();
});
