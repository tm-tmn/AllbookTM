require('dotenv').config();

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');

// 1. ตั้งค่าการเชื่อมต่อ Cloudflare R2 (ใช้วิธี S3)
// ⚠️ ไม่เก็บ Key ไว้ในโค้ดอีกต่อไป — อ่านจากไฟล์ .env (ดู .env.example) หรือ
//    environment variables ของ CI/CD เท่านั้น ห้าม commit ไฟล์ .env ขึ้น git เด็ดขาด
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'service-manuals';
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

// ตรวจสอบว่ามีค่าที่จำเป็นครบก่อนเริ่มทำงาน ป้องกันการรันพลาดแบบเงียบๆ
const requiredVars = {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_PUBLIC_URL: PUBLIC_URL,
};
const missing = Object.entries(requiredVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  console.error('❌ ขาด environment variable ที่จำเป็น:', missing.join(', '));
  console.error('   สร้างไฟล์ .env จาก .env.example แล้วกรอกค่าให้ครบก่อนรันสคริปต์นี้');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// ฟังก์ชันแปลง Path โฟลเดอร์เป็น Tree JSON
function buildTree(objects) {
  const root = [];

  objects.forEach((obj) => {
    const key = obj.Key;
    if (key.endsWith('/')) return; // ข้าม folder marker เปล่าๆ

    const parts = key.split('/');
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const id = parts.slice(0, index + 1).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');

      let existingNode = currentLevel.find((node) => node.name === part);

      if (!existingNode) {
        if (isFile) {
          // สร้าง URL โดย encode spaces และ special characters
          const fileUrl = `${PUBLIC_URL}/${parts.map(p => encodeURIComponent(p)).join('/')}`;
          existingNode = {
            id: id,
            name: part,
            type: 'file',
            url: fileUrl,
          };
        } else {
          existingNode = {
            id: id,
            name: part,
            type: 'folder',
            items: [],
          };
        }
        currentLevel.push(existingNode);
      }

      if (!isFile) {
        currentLevel = existingNode.items;
      }
    });
  });

  return root;
}

async function main() {
  try {
    console.log('กำลังดึงรายการไฟล์จาก Cloudflare R2...');
    let isTruncated = true;
    let continuationToken;
    const allObjects = [];

    // ดึงข้อมูลทั้งหมด (รองรับเกิน 1,000 ไฟล์ด้วย Pagination)
    while (isTruncated) {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        ContinuationToken: continuationToken,
      });

      const response = await s3.send(command);
      if (response.Contents) {
        allObjects.push(...response.Contents);
      }
      isTruncated = response.IsTruncated;
      continuationToken = response.NextContinuationToken;
    }

    // แปลงโครงสร้างเป็น JSON Tree
    const treeData = buildTree(allObjects);

    // บันทึกลงไฟล์ manuals-data.json
    fs.writeFileSync('manuals-data.json', JSON.stringify(treeData, null, 2));
    console.log('✅ สำเร็จ! สร้างไฟล์ manuals-data.json เรียบร้อยแล้ว');
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err);
    process.exit(1);
  }
}

main();
