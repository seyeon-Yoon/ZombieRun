"use strict";

const themeStorage = require("../../models/themeStorage");
const NoticeStorage = require("../../models/NoticeStorage");

const output = {
    home: (req, res) => {
        res.render("home/index");
    },

    mnhome: (req, res) => {
        res.render("home/mnhome");
    },
};

const process = {
    verifyThemeCode: async (req, res) => {
        const themeCode = req.body.theme_code;
        try {
            const response = await themeStorage.verifyThemeCode(themeCode);
            return res.json(response);
        } catch (err) {
            return res.json(err);
        }
    },

    saveThemeData: async (req, res) => {
        const themeData = req.body;
        try {
            const response = await themeStorage.saveThemeData(themeData);
            return res.json(response);
        } catch (err) {
            return res.json(err);
        }
    },

    // 공지사항 저장
    saveNotice: async (req, res) => {
        const notice = req.body;
        try {
            const response = await NoticeStorage.save(notice);
            return res.json(response);
        } catch (err) {
            return res.json(err);
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

module.exports = {
    output,
    process,
}; 