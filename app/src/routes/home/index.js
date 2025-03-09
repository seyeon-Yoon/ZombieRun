"use strict";

const express = require("express");
const router = express.Router();
const ctrl = require("./home.ctrl");

//라우팅 기능
router.get('/', ctrl.output.home);
router.get('/login', ctrl.output.login);
router.get('/theme', ctrl.output.theme);
router.get("/map-popup", ctrl.output.mapPopup);

router.post('/login', ctrl.process.login);
router.post('/theme', ctrl.process.theme);


module.exports = router; //외부에서도 사용할 수 있도록 내보내는 코드