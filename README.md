# HomeAlright E-Commerce Platform

HomeAlright คือแพลตฟอร์มอีคอมเมิร์ซสำหรับขายเฟอร์นิเจอร์และของตกแต่งบ้าน ระบบถูกแบ่งการทำงานออกเป็น 3 ส่วนหลัก ได้แก่ Backend API, Frontend Web Application และระบบ Automated Testing

## โครงสร้างโปรเจกต์

* `frontend/`: โค้ดส่วนหน้าบ้าน พัฒนาด้วย React และ Vite
* `Backend/`: โค้ดส่วนหลังบ้าน (API) และ Business Logic พัฒนาด้วย NestJS
* `testing/`: สคริปต์สำหรับการทำ End-to-End (E2E) Testing ด้วย Playwright

## เทคโนโลยีที่ใช้

**Frontend** ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Backend** ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

**Database** ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

**Testing** ![Playwright](https://img.shields.io/badge/playwright-%232EAD33.svg?style=for-the-badge&logo=playwright&logoColor=white)

## สิ่งที่ต้องติดตั้งก่อนเริ่มงาน

* [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 18 ขึ้นไป)
* npm (มาพร้อมกับ Node.js)
* [Git](https://git-scm.com/)

## ขั้นตอนการติดตั้งและรันโปรเจกต์

**1. Clone โปรเจกต์ลงเครื่อง**
```bash
git clone https://github.com/psu6810110181/final-project.git
cd final-project
```

**2. ตั้งค่าและรัน Backend**
เปิด Terminal แล้วเข้าไปที่โฟลเดอร์ Backend:
```bash
cd Backend
npm install

# คัดลอกไฟล์ Environment Variables และตั้งค่าให้เรียบร้อย
cp .env.example .env

# เริ่มรันเซิร์ฟเวอร์
npm run start:dev
```

*(โดยปกติ Backend API จะทำงานอยู่ที่ `http://localhost:3000`)*

**3. ตั้งค่าและรัน Frontend**
เปิด Terminal หน้าต่างใหม่ แล้วเข้าไปที่โฟลเดอร์ frontend:
```bash
cd frontend
npm install

# เริ่มรันแอปพลิเคชันส่วนหน้าบ้าน
npm run dev
```
*(โดยปกติ Frontend จะทำงานอยู่ที่ `http://localhost:5173`)*

**4. การรัน Automated Tests**
หากต้องการทดสอบระบบ ให้เปิด Terminal ใหม่แล้วเข้าไปที่โฟลเดอร์ testing:
```bash
cd testing
npm install
npx playwright install # ติดตั้งเบราว์เซอร์ที่จำเป็น (ทำแค่ครั้งแรก)
npx playwright test
```

## คำสั่งที่ใช้บ่อย

**ในโฟลเดอร์ `/frontend`:**
* `npm run dev`: รันโปรเจกต์จำลองสำหรับพัฒนา (Development Server)
* `npm run build`: สร้างไฟล์สำหรับการนำไปใช้งานจริง (Production Build) ลงในโฟลเดอร์ `dist`
* `npm run lint`: ตรวจสอบและค้นหาข้อผิดพลาดในโค้ด (ESLint)

**ในโฟลเดอร์ `/Backend`:**
* `npm run start:dev`: รันเซิร์ฟเวอร์และรีสตาร์ทอัตโนมัติเมื่อมีการแก้โค้ด (Watch mode)
* `npm run build`: คอมไพล์โปรเจกต์ NestJS
* `npm run test`: รันการทดสอบระบบ (Unit tests)

**ในโฟลเดอร์ `/testing`:**
* `npx playwright test`: สั่งรัน E2E เทสต์ทั้งหมด
* `npx playwright show-report`: ดูรายละเอียดผลการทดสอบผ่านเบราว์เซอร์
