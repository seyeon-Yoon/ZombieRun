"use strict";

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require('fs').promises;
const ctrl = require("../controllers/homeController");  // 경로 수정
const userController = require("../controllers/userController");  // userController 추가

// 업로드 디렉토리 생성
const createUploadDir = async () => {
    const uploadDir = path.join(__dirname, "..", "public", "uploads", "maps");
    try {
        await fs.access(uploadDir);
    } catch (error) {
        if (error.code === 'ENOENT') {
            try {
                await fs.mkdir(uploadDir, { recursive: true });
                console.log('업로드 디렉토리 생성 완료:', uploadDir);
            } catch (err) {
                console.error('업로드 디렉토리 생성 실패:', err);
                throw err;
            }
        } else {
            console.error('업로드 디렉토리 접근 오류:', error);
            throw error;
        }
    }
};

// 서버 시작 시 업로드 디렉토리 생성
createUploadDir().catch(console.error);

// multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 상대 경로 대신 절대 경로 사용
        const uploadDir = path.join(__dirname, "..", "public", "uploads", "maps");
        console.log('Upload directory:', uploadDir); // 디버깅용 로그
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename); // 디버깅용 로그
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.jpg', '.jpeg', '.pdf'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('지원하지 않는 파일 형식입니다. (jpg, pdf만 가능)'));
        }
    }
});

// 라우팅 기능 //output 메서드는 homeController.js에 있음
router.get('/', ctrl.output.home);
router.get('/login', ctrl.output.login);
router.get('/keypad', ctrl.output.keypad);
router.get('/mnhome', ctrl.output.mnhome);
router.get('/addTheme', ctrl.output.theme);
router.get('/mapPopup', ctrl.output.mapPopup);
router.get('/get-themes', ctrl.process.getThemes);
router.get('/get-theme-data', ctrl.process.getThemeData);

// API 라우트
router.post('/login', ctrl.process.login);
router.post('/verify-theme-code', ctrl.process.verifyThemeCode);
router.post('/addTheme', upload.single('map_file'), ctrl.process.theme);
router.post('/save-theme-data', ctrl.process.saveThemeData);
router.post('/delete-theme', ctrl.process.deleteTheme);

module.exports = router;  // 외부에서도 사용할 수 있도록 내보내는 코드
