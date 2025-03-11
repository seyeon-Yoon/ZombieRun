"use strict";

const { response } = require("express");
const User = require("../models/user");  
const Theme = require("../models/theme");
const ThemeStorage = require("../models/themeStorage");  

const output = {
    home: (req, res) => {
        res.render('index'); //클라이언트가 '/' 경로로 GET 요청을 보낼 때, ../views/index.ejs 파일을 찾아서 렌더링(서버에서 받은 데이터를 바탕으로 웹 페이지를 생성하여 브라우저에 표시하는 과정)하고, 그 결과를 클라이언트에게 응답으로 전송하라.
    },

    login: (req, res) => {
        res.render('../views/login');
    },

    theme: async (req, res) => {
        try {
            const themes = await ThemeStorage.getThemes();
            res.render('../views/theme'); //   /theme.ejs를 불러와라 (데이터 포함)
        } catch (error) {
            console.error("테마 데이터를 불러오는 중 오류 발생:", error);
            res.status(500).send("테마 데이터를 불러올 수 없습니다.");
        }
    },

    mapPopup: (req, res) => {
        res.render('views/mapPopup'); // mapPopup.ejs를 불러와라
    }
};

//themeController.js
const process = {
    login: async (req, res) => {
        const user = new User(req.body);
        const response = await user.login();
        return res.json(response);
    },

    theme: async (req, res) => {
        console.log("서버로 받은 테마 데이터:", req.body); // 디버깅용 로그 추가

        const { theme_name, theme_code, escape_time_minutes, available_hints, monitoring_places } = req.body;
        
        console.log("서버에서 받은 theme_code:", theme_code);
        
        const parsedThemeCode = parseInt(theme_code, 10);  // 문자열을 정수로 변환
        
        console.log("변환된 theme_code:", parsedThemeCode); // 변환된 값 확인
        
        //유효성검사
        if (!/^\d{4}$/.test(theme_code) || isNaN(parsedThemeCode) || parsedThemeCode <= 0) {
            return res.json({ success: false, msg: "테마 코드는 숫자 4자리만 입력 가능합니다." });
        }

        if (!/^\d{1,2}$/.test(String(escape_time_minutes)) || parseInt(escape_time_minutes) > 99) {
            return res.json({ success: false, msg: "탈출 제한 시간은 숫자 2자리까지 입력 가능합니다. (0~99)" });
        }
        
        if (!/^\d$/.test(String(available_hints))) {
            return res.json({ success: false, msg: "사용 가능 힌트 수는 숫자 1자리만 입력 가능합니다." });
        }
       
        if (!/^\d$/.test(String(monitoring_places))) {
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
