"use strict";

const fs = require("fs").promises;
const path = require("path");

class ThemeStorage {
    static #getThemeInfo(data, themeCode) {
        const themes = JSON.parse(data);
        const idx = themes.theme_code.indexOf(themeCode);
        if (idx === -1) return null;
        
        const themeKeys = Object.keys(themes);
        const themeInfo = themeKeys.reduce((newTheme, key) => {
            newTheme[key] = themes[key][idx];
            return newTheme;
        }, {});

        return themeInfo;
    }

    static #getThemes(data, isAll, fields) {
        const themes = JSON.parse(data);
        if (isAll) {
            // 데이터를 배열 형태로 변환
            const themeArray = themes.theme_code.map((code, index) => {
                return {
                    theme_name: themes.theme_name[index],
                    theme_code: themes.theme_code[index],
                    escape_time_minutes: themes.escape_time_minutes[index],
                    available_hints: themes.available_hints[index],
                    monitoring_places: themes.monitoring_places[index],
                    map_file: themes.map_file[index]
                };
            });
            return themeArray;
        }
        
        // isAll이 false일 때는 힌트와 장소 데이터도 포함하여 반환
        return {
            ...themes,
            hints: themes.hints || {},
            places: themes.places || {}
        };
    }

    static async getThemes(isAll, ...fields) {
        try {
            const filePath = path.join(__dirname, "..", "databases", "themes.json");
            const data = await fs.readFile(filePath, 'utf8');
            return this.#getThemes(data, isAll, fields);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // 파일이 없는 경우 기본 구조 반환
                return isAll ? [] : {
                    theme_name: [],
                    theme_code: [],
                    escape_time_minutes: [],
                    available_hints: [],
                    monitoring_places: [],
                    map_file: [],
                    hints: {},
                    places: {}
                };
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
                    themes = {
                        theme_name: [],
                        theme_code: [],
                        escape_time_minutes: [],
                        available_hints: [],
                        monitoring_places: [],
                        map_file: [],
                        hints: {},
                        places: {}
                    };
                } else {
                    throw error;
                }
            }

            // 테마 코드 중복 검사
            if (themes.theme_code.includes(themeInfo.theme_code)) {
                throw new Error("이미 존재하는 테마 코드입니다.");
            }

            // 새로운 테마 정보 추가
            themes.theme_name.push(themeInfo.theme_name);
            themes.theme_code.push(themeInfo.theme_code);
            themes.escape_time_minutes.push(themeInfo.escape_time_minutes);
            themes.available_hints.push(themeInfo.available_hints);
            themes.monitoring_places.push(themeInfo.monitoring_places);
            themes.map_file.push(themeInfo.map_file);

            // 파일 저장
            await fs.writeFile(filePath, JSON.stringify(themes, null, 2));

            return { success: true };
        } catch (error) {
            console.error("테마 저장 중 오류 발생:", error);
            return { success: false, message: error.message };
        }
    }

    static async saveThemeData(themeCode, hints, places) {
        try {
            console.log('=== ThemeStorage.saveThemeData 시작 ===');
            console.log('1. 받은 매개변수:', {
                themeCode,
                hints: JSON.stringify(hints, null, 2),
                places: JSON.stringify(places, null, 2)
            });
            
            const filePath = path.join(__dirname, "..", "databases", "themes.json");
            console.log('2. 파일 경로:', filePath);
            
            let themes;
            try {
                const data = await fs.readFile(filePath, 'utf8');
                themes = JSON.parse(data);
                console.log('3. 현재 themes.json 데이터:', JSON.stringify(themes, null, 2));
            } catch (error) {
                console.error('4. 파일 읽기 오류:', error);
                if (error.code === 'ENOENT') {
                    console.log('4-1. 파일이 없어 새로 생성합니다.');
                    themes = {
                        theme_name: [],
                        theme_code: [],
                        escape_time_minutes: [],
                        available_hints: [],
                        monitoring_places: [],
                        map_file: [],
                        hints: {},
                        places: {}
                    };
                } else {
                    throw error;
                }
            }

            // 테마 존재 여부 확인
            const themeIndex = themes.theme_code.indexOf(themeCode);
            console.log('5. 테마 인덱스:', themeIndex);
            
            if (themeIndex === -1) {
                console.error('6. 테마 코드 없음:', themeCode);
                throw new Error("존재하지 않는 테마 코드입니다.");
            }

            // 힌트와 장소 데이터 추가/업데이트
            if (!themes.hints) themes.hints = {};
            if (!themes.places) themes.places = {};

            themes.hints[themeCode] = hints;
            themes.places[themeCode] = places;

            console.log('7. 저장할 최종 데이터:', JSON.stringify(themes, null, 2));

            // 파일 저장
            await fs.writeFile(filePath, JSON.stringify(themes, null, 2));
            console.log('8. 파일 저장 완료');
            
            return { success: true };
        } catch (error) {
            console.error('9. 에러 발생:', error);
            console.error('에러 스택:', error.stack);
            return { success: false, message: error.message };
        }
    }
}

module.exports = ThemeStorage;
