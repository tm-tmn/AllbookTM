const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');

// 1. ตั้งค่าการเชื่อมต่อ Cloudflare R2 (ใช้วิธี S3)
const R2_ACCOUNT_ID = 'eaeb4e0907607d846269892e1ac0cf41';
const R2_ACCESS_KEY_ID = 'a4edc8c8b22f73c3d923d53af0c4b014';
const R2_SECRET_ACCESS_KEY = 'a47073c75a40d2ccc36873205d98b8ac88d0ff76447bf0c4e27da88eea1e1d78';
const BUCKET_NAME = 'service-manuals'; // ชื่อ Bucket ของคุณ
const PUBLIC_URL = 'https://pub-ab56e3fcaa6242a4bef23ad730720f6c.r2.dev'; // Public Domain ของคุณ

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
  }
}

main();
