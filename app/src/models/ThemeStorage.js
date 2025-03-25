"use strict";

const fs = require("fs").promises;
const path = require("path");

class ThemeStorage {
    static #getThemeInfo(data, themeCode) {
        const themes = JSON.parse(data);
        return themes.themes.find(theme => theme.theme_code === themeCode) || null;
    }

    static #getThemes(data, isAll) {
        const themes = JSON.parse(data);
        if (isAll) {
            // 모든 테마 정보 반환
            return themes.themes;
        }
        
        // 힌트와 장소 데이터를 포함한 전체 데이터 반환
        return themes;
    }

    static async getThemes(isAll) {
        try {
            const filePath = path.join(__dirname, "..", "databases", "themes.json");
            const data = await fs.readFile(filePath, 'utf8');
            return this.#getThemes(data, isAll);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // 파일이 없는 경우 기본 구조 반환
                return isAll ? [] : { themes: [] };
            }
            console.error("테마 목록 조회 중 오류 발생:", error);
            throw error;
        }
    }

    static async getThemeInfo(themeCode) {
        try {
            const filePath = path.join(__dirname, "..", "databases", "themes.json");
            const data = await fs.readFile(filePath, 'utf8');
            return this.#getThemeInfo(data, themeCode);
        } catch (error) {
            console.error("테마 정보 조회 중 오류 발생:", error);
            throw error;
        }
    }

    static async save(themeInfo) {
        try {
            const filePath = path.join(__dirname, "..", "databases", "themes.json");
            
            // themes.json 파일 읽기
            let themes;
            try {
                const data = await fs.readFile(filePath, 'utf8');
                themes = JSON.parse(data);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    // 파일이 없는 경우 기본 구조 생성
                    themes = { themes: [] };
                } else {
                    throw error;
                }
            }

            // 테마 코드 중복 체크
            const existingIndex = themes.themes.findIndex(theme => theme.theme_code === themeInfo.theme_code);
            if (existingIndex !== -1) {
                return {
                    success: false,
                    message: "이미 존재하는 테마 코드입니다."
                };
            }

            // 새 테마 추가
            themes.themes.push({
                theme_name: themeInfo.theme_name,
                theme_code: themeInfo.theme_code,
                escape_time_minutes: themeInfo.escape_time_minutes,
                available_hints: themeInfo.available_hints,
                monitoring_places: themeInfo.monitoring_places,
                map_file: themeInfo.map_file,
                hints: [],
                places: []
            });

            // 파일 저장
            await fs.writeFile(filePath, JSON.stringify(themes, null, 2));

            return {
                success: true,
                message: "테마가 성공적으로 저장되었습니다."
            };
        } catch (error) {
            console.error("테마 저장 중 오류 발생:", error);
            return {
                success: false,
                message: "테마 저장 중 오류가 발생했습니다."
            };
        }
    }

    static async deleteTheme(themeCode) {
        try {
            const filePath = path.join(__dirname, "..", "databases", "themes.json");
            const data = await fs.readFile(filePath, 'utf8');
            const themes = JSON.parse(data);

            // 테마 찾기
            const themeIndex = themes.themes.findIndex(theme => theme.theme_code === themeCode);
            if (themeIndex === -1) {
                return {
                    success: false,
                    message: "존재하지 않는 테마입니다."
                };
            }

            // 테마 삭제
            themes.themes.splice(themeIndex, 1);

            // 파일 저장
            await fs.writeFile(filePath, JSON.stringify(themes, null, 2));

            return {
                success: true,
                message: "테마가 성공적으로 삭제되었습니다."
            };
        } catch (error) {
            console.error("테마 삭제 중 오류 발생:", error);
            return {
                success: false,
                message: "테마 삭제 중 오류가 발생했습니다."
            };
        }
    }

    static async saveThemeData(themeCode, hints, places) {
        try {
            const filePath = path.join(__dirname, "..", "databases", "themes.json");
            const data = await fs.readFile(filePath, 'utf8');
            const themes = JSON.parse(data);

            // 테마 찾기
            const themeIndex = themes.themes.findIndex(theme => theme.theme_code === themeCode);
            if (themeIndex === -1) {
                return {
                    success: false,
                    message: "존재하지 않는 테마입니다."
                };
            }

            // 힌트와 장소 데이터 업데이트
            themes.themes[themeIndex].hints = hints;
            themes.themes[themeIndex].places = places;

            // 파일 저장
            await fs.writeFile(filePath, JSON.stringify(themes, null, 2));

            return {
                success: true,
                message: "테마 데이터가 성공적으로 저장되었습니다."
            };
        } catch (error) {
            console.error("테마 데이터 저장 중 오류 발생:", error);
            return {
                success: false,
                message: "테마 데이터 저장 중 오류가 발생했습니다."
            };
        }
    }
}

module.exports = ThemeStorage;
