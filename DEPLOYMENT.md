# Cloudflare Deployment Guide

## ขั้นตอนการ Deploy

### ขั้น 1: ตั้ง API URL ✅
แก้ไข `api-client.js` บรรทัด 4:
```javascript
const API_URL = "https://YOUR_WORKER_URL.workers.dev";
```

### ขั้น 2: ติดตั้ง Wrangler
```bash
npm install -g wrangler
```

### ขั้น 3: สร้าง D1 Database
```bash
# ทำเพียงครั้งเดียว
wrangler d1 create game-store-db

# จะได้ database_id มาจากผลลัพธ์
```

### ขั้น 4: แก้ไข wrangler.toml
ใส่ `database_id` ที่ได้จากขั้น 3 ลงไป

### ขั้น 5: สร้าง Schema
```bash
# ส่ง schema.sql ไปยัง D1
wrangler d1 execute game-store-db --file schema.sql
```

### ขั้น 6: Deploy Worker
```bash
# Deploy ครั้งแรก
wrangler deploy

# ทดสอบ
wrangler dev
```

### ขั้น 7: Update API_URL
เมื่อ deploy เสร็จ คุณจะได้ URL:
- `https://nexora-api.YOUR_SUBDOMAIN.workers.dev`

ใส่ URL นี้ลงใน `api-client.js`

### ขั้น 8: Enable API Mode
แก้ `store-data.js` บรรทัด 2:
```javascript
const USE_API = true;  // เปลี่ยนจาก false เป็น true
```

### ขั้น 9: Push ขึ้น GitHub
```bash
git add .
git commit -m "add cloudflare deployment"
git push
```

## ตรวจสอบ
- index.html ควรโหลด API และแสดงสินค้า
- admin.html ควรบันทึกข้อมูลลง D1

## ปัญหาเบื้องต้น

### API ไม่สามารถเข้าถึงได้
- ตรวจสอบ URL ใน `api-client.js`
- ตรวจสอบ CORS headers

### ข้อมูลไม่ปรากฏ
- ตรวจสอบว่า `USE_API = true`
- ตรวจสอบ browser console สำหรับ errors

### CORS error
- ปรับ `Access-Control-Allow-Origin` ใน `worker.js`
