"use strict";

const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/homeController");  // 경로 수정
const userController = require("../controllers/userController");  // userController 추가

// 라우팅 기능 //output 메서드는 homeController.js에 있음
router.get('/', ctrl.output.home); // 클라이언트가 '/' 경로로 GET요청을 보낼 때, ctrl(homeController) 파일에 정의된 output.home 메서드를 실행하여 해당 요청에 응답을 처리하라.
router.get('/login', ctrl.output.login);
router.get('/theme', ctrl.output.theme);
router.get("/map-popup", ctrl.output.mapPopup);

router.post('/login', userController.login);  // 로그인 처리 로직을 userController로 변경
router.post('/theme', ctrl.process.theme);

module.exports = router;  // 외부에서도 사용할 수 있도록 내보내는 코드
