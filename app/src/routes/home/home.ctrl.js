"use strict";

const { response } = require("express");
const User = require("../../models/User");
const Theme = require("../../models/Theme");

const output = {
    home: (req, res) => {
        res.render('home/index'); //   /index.ejs를 불러와라
    },
    login: (req, res) => {
        res.render('home/login'); //   /login.ejs를 불러와라
    },
    theme: (req, res) => {
        res.render('home/theme'); //   /theme.ejs를 불러와라
    },
    mapPopup: (req, res) => {
        res.render('home/mapPopup'); // mapPopup.ejs를 불러와라
    }
};

const process = {
    login: async (req, res) => {
        const user = new User(req.body);
        const response = await user.login();
        return res.json(response);
    },

    theme: async (req, res) => {
        console.log("서버로 받은 테마 데이터:", req.body); // 디버깅용 로그 추가

        const { theme_name, theme_code, escape_time_minutes, available_hints, monitoring_places } = req.body;

        // 🔹 기존 유효성 검사는 유지하되, theme_name은 제한 없음
        if (!/^\d{4}$/.test(theme_code)) {
            return res.json({ success: false, msg: "테마 코드는 숫자 4자리만 입력 가능합니다." });
        }
        if (!/^\d{1,2}$/.test(escape_time_minutes) || parseInt(escape_time_minutes) > 99) {
            return res.json({ success: false, msg: "탈출 제한 시간은 숫자 2자리까지 입력 가능합니다. (0~99)" });
        }
        if (!/^\d$/.test(available_hints)) {
            return res.json({ success: false, msg: "사용 가능 힌트 수는 숫자 1자리만 입력 가능합니다." });
        }
        if (!/^\d$/.test(monitoring_places)) {
            return res.json({ success: false, msg: "모니터링 장소 개수는 숫자 1자리만 입력 가능합니다." });
        }

        const theme = new Theme(req.body);
        if (typeof theme.saveTheme !== 'function') {
            console.error("saveTheme()가 존재하지 않음.");
            return res.json({ success: false, msg: "saveTheme is not a function" });
        }

        const response = await theme.saveTheme();
        return res.json(response);
    }
};

module.exports = { output, process };
