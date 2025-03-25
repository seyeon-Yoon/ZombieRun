"use strict";

const { response } = require("express");
const User = require("../models/user");  
const Theme = require("../models/theme");
const ThemeStorage = require("../models/themeStorage");  
const NoticeStorage = require("../models/NoticeStorage");
const fs = require('fs').promises;
const path = require('path');

const output = {
    home: (req, res) => {
        res.render('index'); //클라이언트가 '/' 경로로 GET 요청을 보낼 때, ../views/index.ejs 파일을 찾아서 렌더링(서버에서 받은 데이터를 바탕으로 웹 페이지를 생성하여 브라우저에 표시하는 과정)하고, 그 결과를 클라이언트에게 응답으로 전송하라.
    },

    login: (req, res) => {
        res.render('login'); // 단순히 로그인 페이지만 렌더링
    },

    theme: async (req, res) => {
        try {
            const themes = await ThemeStorage.getThemes(true); // 모든 테마 데이터 로드
            res.render('addTheme', { themes });
        } catch (error) {
            console.error("테마 데이터를 불러오는 중 오류 발생:", error);
            res.status(500).send("테마 데이터를 불러올 수 없습니다.");
        }
    },

    mnhome: async (req, res) => {
        try {
            const themes = await ThemeStorage.getThemes(true);
            const themeCode = req.query.theme_code; // URL 파라미터에서 테마 코드 가져오기
            
            // 선택된 테마 찾기
            const selectedTheme = themes.find(theme => theme.theme_code === themeCode);
            
            res.render('mnhome', { 
                themes,
                selectedTheme: selectedTheme || null,
                monitoring_places: selectedTheme ? parseInt(selectedTheme.monitoring_places) : 0
            });
        } catch (error) {
            console.error("테마 데이터를 불러오는 중 오류 발생:", error);
            res.status(500).send("테마 데이터를 불러올 수 없습니다.");
        }
    },

    keypad: (req, res) => {
        res.render('keypad');
    },

    mapPopup: (req, res) => {
        res.render('mapPopup'); // mapPopup.ejs를 불러와라
    }
};

//themeController.js
const process = {
    login: async (req, res) => {
        try {
        const user = new User(req.body);
            const loginResponse = await user.login();
            
            if (loginResponse.success) {
                // 테마 존재 여부 확인
                const themes = await ThemeStorage.getThemes(true);
                const hasThemes = themes && themes.length > 0;
                
                // 리다이렉션 경로 설정
                const redirectPath = hasThemes ? '/keypad' : '/addTheme';
                console.log("리다이렉션 경로:", redirectPath);
                
                return res.json({
                    success: true,
                    msg: "로그인 성공",
                    redirect: redirectPath
                });
            }
            
            return res.json({
                success: false,
                msg: loginResponse.msg || "아이디 또는 비밀번호가 일치하지 않습니다."
            });
        } catch (error) {
            console.error("로그인 처리 중 오류 발생:", error);
            return res.json({ 
                success: false, 
                msg: "로그인 처리 중 오류가 발생했습니다."
            });
        }
    },

    getThemes: async (req, res) => {
        try {
            console.log('테마 목록 조회 시작');
            const themes = await ThemeStorage.getThemes(true);
            console.log('조회된 테마 목록:', themes);
            res.json(themes);
        } catch (error) {
            console.error("테마 목록 조회 중 오류:", error);
            res.status(500).json({ 
                success: false, 
                message: "테마 목록을 가져오는 중 오류가 발생했습니다." 
            });
        }
    },

    deleteTheme: async (req, res) => {
        try {
            const { theme_code } = req.body;
            console.log('테마 삭제 요청:', { theme_code });
            
            if (!theme_code) {
                console.log('테마 코드 누락');
                return res.status(400).json({
                    success: false,
                    message: "테마 코드가 필요합니다."
                });
            }

            console.log('ThemeStorage.deleteTheme 호출 전');
            const result = await ThemeStorage.deleteTheme(theme_code);
            console.log('삭제 결과:', result);
            
            if (result.success) {
                res.json({
                    success: true,
                    message: "테마가 성공적으로 삭제되었습니다."
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message || "테마 삭제에 실패했습니다."
                });
            }
        } catch (error) {
            console.error("테마 삭제 중 오류:", error);
            res.status(500).json({
                success: false,
                message: "테마 삭제 중 오류가 발생했습니다."
            });
        }
    },

    theme: async (req, res) => {
        try {
        const { theme_name, theme_code, escape_time_minutes, available_hints, monitoring_places } = req.body;
        
            // 유효성 검사
            if (!theme_name || !theme_code || !escape_time_minutes || !available_hints || !monitoring_places) {
                return res.json({ success: false, message: "모든 필수 항목을 입력해주세요." });
            }

            if (!/^\d{4}$/.test(theme_code)) {
                return res.json({ success: false, message: "테마 코드는 숫자 4자리만 입력 가능합니다." });
            }

            if (!/^\d{1,2}$/.test(escape_time_minutes) || parseInt(escape_time_minutes) > 99) {
                return res.json({ success: false, message: "탈출 제한 시간은 숫자 2자리까지 입력 가능합니다. (0~99)" });
            }
            
            if (!/^\d$/.test(available_hints)) {
                return res.json({ success: false, message: "사용 가능 힌트 수는 숫자 1자리만 입력 가능합니다." });
            }
           
            if (!/^\d$/.test(monitoring_places)) {
                return res.json({ success: false, message: "모니터링 장소 개수는 숫자 1자리만 입력 가능합니다." });
            }

            // 파일 정보 추가
            let mapFilePath = null;
            if (req.file) {
                mapFilePath = '/uploads/maps/' + req.file.filename;
            }

            // 테마 데이터 생성
            const themeData = {
                theme_name,
                theme_code,
                escape_time_minutes,
                available_hints,
                monitoring_places,
                map_file: mapFilePath
            };

            const theme = new Theme(themeData);
            const response = await theme.saveTheme();

            if (!response.success && req.file) {
                // 저장 실패 시 업로드된 파일 삭제
                const fullPath = path.join(__dirname, "..", "public", mapFilePath);
                try {
                    await fs.unlink(fullPath);
                } catch (error) {
                    console.error("파일 삭제 중 오류 발생:", error);
                }
            }

            return res.json(response);
        } catch (error) {
            console.error("테마 저장 중 오류 발생:", error);
            return res.json({ 
                success: false, 
                message: "테마 저장 중 오류가 발생했습니다: " + error.message 
            });
        }
    },

    verifyThemeCode: async (req, res) => {
        try {
            const { theme_code } = req.body;
            
            // 테마 코드 유효성 검사
            if (!theme_code || !/^\d{4}$/.test(theme_code)) {
                return res.json({ 
                    success: false, 
                    message: "올바르지 않은 테마 코드 형식입니다." 
                });
            }

            // 테마 코드 존재 여부 확인
            const themes = await ThemeStorage.getThemes(true);
            console.log('입력된 테마 코드:', theme_code);
            console.log('저장된 테마 목록:', themes);
            
            // 테마 배열에서 테마 코드 확인 (문자열로 비교)
            const themeExists = themes.some(theme => theme.theme_code === theme_code.toString());

            if (themeExists) {
                return res.json({ 
                    success: true,
                    message: "테마가 확인되었습니다.",
                    redirect: `/mnhome?theme_code=${theme_code}`
                });
            } else {
                return res.json({ 
                    success: false,
                    message: "등록되지 않은 테마 코드입니다."
                });
            }
        } catch (error) {
            console.error("테마 코드 확인 중 오류 발생:", error);
            return res.json({ 
                success: false, 
                message: "테마 코드 확인 중 오류가 발생했습니다." 
            });
        }
    },

    saveThemeData: async (req, res) => {
        const { theme_code, hints, places } = req.body;
        
        try {
            console.log('=== saveThemeData 시작 ===');
            console.log('1. 받은 데이터:', {
                theme_code,
                hints: JSON.stringify(hints, null, 2),
                places: JSON.stringify(places, null, 2)
            });

            // 입력값 검증
            if (!theme_code || !Array.isArray(hints) || !Array.isArray(places)) {
                console.log('2. 데이터 형식 오류:', { 
                    theme_code: !!theme_code,
                    hintsIsArray: Array.isArray(hints),
                    placesIsArray: Array.isArray(places)
                });
                return res.status(400).json({ 
                    success: false, 
                    msg: "잘못된 데이터 형식입니다." 
                });
            }

            // 힌트 데이터 형식 변환
            const convertedHints = hints.map(hint => {
                console.log('3. 변환 전 힌트 데이터:', hint);
                const converted = {
                    code: hint.hint_code,
                    progress: parseInt(String(hint.progress_rate).replace('%', '')),
                    content: hint.hint_content,
                    answer: hint.answer_content
                };
                console.log('4. 변환 후 힌트 데이터:', converted);
                return converted;
            });

            console.log('5. 변환된 전체 힌트:', JSON.stringify(convertedHints, null, 2));

            // ThemeStorage를 통해 데이터 저장
            const result = await ThemeStorage.saveThemeData(theme_code, convertedHints, places);
            console.log('6. 저장 결과:', result);
            
            if (result.success) {
                console.log('7. 저장 성공');
                return res.json({ success: true, msg: "테마 데이터가 성공적으로 저장되었습니다." });
            } else {
                console.log('7. 저장 실패:', result.message);
                throw new Error(result.message || "저장에 실패했습니다.");
            }
        } catch (err) {
            console.error('8. 에러 발생:', err);
            console.error('에러 스택:', err.stack);
            return res.status(500).json({ 
                success: false, 
                msg: err.message || "테마 데이터 저장 중 오류가 발생했습니다." 
            });
        }
    },

    getThemeData: async (req, res) => {
        const { theme_code } = req.query;
        
        try {
            if (!theme_code) {
                return res.status(400).json({ 
                    success: false, 
                    msg: "테마 코드가 필요합니다." 
                });
            }

            const themes = await ThemeStorage.getThemes(false);
            const theme = themes.themes.find(t => t.theme_code === theme_code);
            
            if (!theme) {
                return res.status(404).json({
                    success: false,
                    msg: "테마를 찾을 수 없습니다."
                });
            }
            
            return res.json({
                success: true,
                hints: { [theme_code]: theme.hints || [] },
                places: { [theme_code]: theme.places || [] }
            });
        } catch (error) {
            console.error("테마 데이터 조회 중 오류:", error);
            return res.status(500).json({
                success: false,
                msg: "테마 데이터 조회 중 오류가 발생했습니다."
            });
        }
    },

    // 공지사항 저장
    saveNotice: async (req, res) => {
        console.log('공지사항 저장 요청 받음:', req.body);
        const notice = req.body;
        
        if (!notice.content || !notice.created_at) {
            console.error('잘못된 요청 데이터:', notice);
            return res.status(400).json({
                success: false,
                msg: "공지사항 내용과 날짜는 필수입니다."
            });
        }

        try {
            console.log('NoticeStorage.save 호출 전...');
            const response = await NoticeStorage.save(notice);
            console.log('NoticeStorage.save 결과:', response);
            return res.json(response);
        } catch (err) {
            console.error('공지사항 저장 중 오류 발생:', err);
            return res.status(500).json({
                success: false,
                msg: err.msg || "서버에서 공지사항 저장 중 오류가 발생했습니다."
            });
        }
    },

    // 공지사항 목록 조회
    getNotices: async (req, res) => {
        try {
            const notices = await NoticeStorage.getNotices();
            return res.json(notices);
        } catch (err) {
            return res.json([]);
        }
    },

    // 공지사항 삭제
    deleteNotice: async (req, res) => {
        const { notice_id } = req.body;
        try {
            const response = await NoticeStorage.delete(notice_id);
            return res.json(response);
        } catch (err) {
            return res.json(err);
        }
    }
};

module.exports = { output, process };
