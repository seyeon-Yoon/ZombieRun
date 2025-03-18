const express = require("express");
const router = express.Router();

const ctrl = require("../../controllers/homeController");

// GET 라우트
router.get("/", ctrl.output.home);
router.get("/login", ctrl.output.login);
router.get("/theme", ctrl.output.theme);
router.get("/mnhome", ctrl.output.mnhome);
router.get("/keypad", ctrl.output.keypad);
router.get("/map-popup", ctrl.output.mapPopup);
router.get("/get-theme-data", ctrl.process.getThemeData);

// POST 라우트
router.post("/login", ctrl.process.login);
router.post("/theme", ctrl.process.theme);
router.post("/verify-theme", ctrl.process.verifyThemeCode);
router.post("/save-theme-data", ctrl.process.saveThemeData);

module.exports = router; 