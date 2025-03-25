"use strict";

const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });

const ctrl = require("../../controllers/homeController");

// GET 라우트
router.get("/", ctrl.output.home);
router.get("/login", ctrl.output.login);
router.get("/theme", ctrl.output.theme);
router.get("/mnhome", ctrl.output.mnhome);
router.get("/keypad", ctrl.output.keypad);
router.get("/map-popup", ctrl.output.mapPopup);
router.get("/get-theme-data", ctrl.process.getThemeData);
router.get("/get-notices", ctrl.process.getNotices);
router.get("/get-themes", ctrl.process.getThemes);

// POST 라우트
router.post("/login", ctrl.process.login);
router.post("/theme", upload.single('map_file'), ctrl.process.theme);
router.post("/verify-theme-code", ctrl.process.verifyThemeCode);
router.post("/save-theme-data", ctrl.process.saveThemeData);
router.post("/save-notice", ctrl.process.saveNotice);
router.post("/delete-notice", ctrl.process.deleteNotice);

module.exports = router; 