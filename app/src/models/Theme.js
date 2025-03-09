// "use strict";

// const ThemeStorage = require("./ThemeStorage"); //ThemeStorage

// class Theme {
//     constructor(body) {
//         this.body = body;
//     }

//     async saveTheme() {
//         const client = this.body;
//         try {
//             const response = await ThemeStorage.save(themeData);
//             return response;
//         } catch (err) {
//             return { success: false, msg: err};
//         }
//     }
// }

// module.exports = Theme;

"use strict";

const ThemeStorage = require("./ThemeStorage"); // ThemeStorage 불러오기

class Theme {
    constructor(body) {
        this.body = body;
    }

    async saveTheme() {
        try {
            console.log("저장할 테마 데이터:", this.body); // 🔹 디버깅 로그 추가
            const response = await ThemeStorage.save(this.body); // ✅ ThemeStorage의 save() 호출
            return response;
        } catch (err) {
            console.error("Theme 저장 중 오류 발생:", err);
            return { success: false, msg: err.message || String(err) };
        }
    }
}

module.exports = Theme;
