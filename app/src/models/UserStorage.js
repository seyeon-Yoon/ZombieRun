"use strict";

const fs = require("fs").promises;
const path = require("path");

class UserStorage {
    static #getUserInfo(data, id) {
        try {
            const users = JSON.parse(data);
            const idx = users.id.indexOf(id);
            
            if (idx === -1) return {};
            
            const usersKeys = Object.keys(users);
            const userInfo = usersKeys.reduce((newUser, info) => {
                newUser[info] = users[info][idx];
                return newUser;
            }, {});

            return userInfo;
        } catch (error) {
            console.error("사용자 정보 처리 중 오류 발생");
            throw error;
        }
    }

    static #getUsers(data, isAll, fields) {
        const users = JSON.parse(data);
        if (isAll) return users;
        
        const newUsers = fields.reduce((newUsers, field) => {
            if (users.hasOwnProperty(field)) {
                newUsers[field] = users[field];
            }
            return newUsers;
        }, {});
        return newUsers;
    }

    static async getUsers(isAll, ...fields) {
        try {
            const filePath = path.join(__dirname, "..", "databases", "users.json");
            const data = await fs.readFile(filePath, "utf8");
            return this.#getUsers(data, isAll, fields);
        } catch (error) {
            console.error("사용자 목록 조회 중 오류 발생");
            throw error;
        }
    }

    static async getUserInfo(id) {
        try {
            const filePath = path.join(__dirname, "..", "databases", "users.json");
            const data = await fs.readFile(filePath, "utf8");
            return this.#getUserInfo(data, id);
        } catch (error) {
            console.error("사용자 정보 조회 중 오류 발생");
            throw error;
        }
    }
}

module.exports = UserStorage;
