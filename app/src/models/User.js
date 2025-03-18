"use strict";

const UserStorage = require("./userStorage");

class User {
    constructor(body) {
        this.body = body;
    }

    async login() {
        try {
            const client = this.body;
            const userInfo = await UserStorage.getUserInfo(client.id);

            if (!userInfo.id) {
                return { success: false, msg: "존재하지 않는 아이디입니다." };
            }

            if (userInfo.password === client.password) {
                return { success: true };
            }
            
            return { success: false, msg: "비밀번호가 틀렸습니다." };
        } catch (error) {
            console.error("로그인 처리 중 오류 발생");
            return { 
                success: false, 
                msg: "로그인 처리 중 오류가 발생했습니다." 
            };
        }
    }
}

module.exports = User;