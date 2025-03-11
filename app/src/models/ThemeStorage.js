"use strict";

const fs = require("fs").promises; // 파일 시스템 접근

class ThemeStorage {
    static #getThemeInfo(data, themeCode) { // private한 변수나 메서드는 최상단으로 올리는게 코딩 문화
        const themes = JSON.parse(data);
        const idx = themes.theme_code.indexOf(themeCode);
        if (idx === -1) return null; // 테마 코드가 없으면 null 반환
        
        const themeKeys = Object.keys(themes);
        const themeInfo = themeKeys.reduce((newTheme, key) => {
            newTheme[key] = themes[key][idx];
            return newTheme;
        }, {});

        return themeInfo;
    }

    static #getThemes(data, isAll, fields) {
        const themes = JSON.parse(data);
        if (isAll) return themes;
        
        return fields.reduce((newThemes, field) => {
            if (themes.hasOwnProperty(field)) {
                newThemes[field] = themes[field];
            }
            return newThemes;
        }, {});
    }

    static getThemes(isAll, ...fields) {
        return fs
            .readFile("./src/databases/themes.json")  // 경로 수정
            .then((data) => this.#getThemes(data, isAll, fields))
            .catch(console.error);
    }

    static getThemeInfo(themeCode) {
        return fs
            .readFile("./src/databases/themes.json")  // 경로 수정
            .then((data) => this.#getThemeInfo(data, themeCode))
            .catch(console.error);
    }

    static async save(themeInfo, files) {
        try {
            const themes = await this.getThemes(true);

            if (themes.theme_code.includes(themeInfo.theme_code)) {
                throw new Error("이미 존재하는 테마 코드입니다.");
            }

            const savedFiles = [];

            if (files && files.length > 0) {
                for (const file of files) {
                    const fileExt = file.originalname.split('.').pop().toLowerCase();
                    const fileName = `${Date.now()}-${file.originalname}`;
                    
                    // Base64 인코딩하여 JSON 내부에 저장
                    const fileBase64 = file.buffer.toString("base64");
                    savedFiles.push({
                        fileName,
                        fileType: fileExt,
                        fileData: fileBase64
                    });
                }
            }

            // 🔹 새로운 테마 추가
            themes.theme_name.push(themeInfo.theme_name);
            themes.theme_code.push(themeInfo.theme_code);
            themes.escape_time_minutes.push(themeInfo.escape_time_minutes);
            themes.available_hints.push(themeInfo.available_hints);
            themes.monitoring_places.push(themeInfo.monitoring_places);
            themes.map_files.push(savedFiles); // 🔹 Base64 파일 데이터 추가
            
            // 🔹 themes.json에 저장
            await fs.writeFile("./src/databases/themes.json", JSON.stringify(themes, null, 2));  // 경로 수정
            return { success: true, uploadedFiles: savedFiles };
        } catch (err) {
            console.error("Theme 저장 중 오류 발생", err);
            return { success: false, msg: err.message || String(err) };
        }
    }
}

module.exports = ThemeStorage;
