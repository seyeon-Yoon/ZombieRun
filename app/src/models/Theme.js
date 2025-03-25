"use strict";

const ThemeStorage = require("./themeStorage");

class Theme {
    constructor(body) {
        this.body = body;
    }

    async saveTheme() {
        try {
            const response = await ThemeStorage.save(this.body);
            return response;
        } catch (err) {
            return { 
                success: false, 
                message: err.message || "테마 저장 중 오류가 발생했습니다." 
            };
        }
    }
}

module.exports = Theme;
