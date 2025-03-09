"use strict";

const fs = require("fs").promises; //파일시스템으로 해당 파일에 접근할 수 있게해줌

class UserStorage {
    static #getUserInfo (data, id) { // private한 변수나 메서드는 최상단으로 올리는게 코딩 문화
        const users = JSON.parse(data);
        const idx = users.id.indexOf(id);
        const usersKeys = Object.keys(users); // => [id, password, name]
        const userInfo = usersKeys.reduce((newUser, info) => {
            newUser[info] = users[info][idx];
            return newUser;
        }, {});

        return userInfo;
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

    static getUsers(isAll, ...fields) {
        return fs
            .readFile("./src/databases/users.json")
            .then((data)=> { //해당로직이 성공했을 때 
                return this.#getUsers(data, isAll, fields);
            })
            .catch(console.error); //해당로직이 실패했을 때
    }

    static getUserInfo(id) {
        return fs
            .readFile("./src/databases/users.json")
            .then((data)=> { //해당로직이 성공했을 때 
                return this.#getUserInfo(data, id);
            })
            .catch(console.error); //해당로직이 실패했을 때    
    }

    static async save(userInfo) {
        const users = await this.getUsers(true);
        if (users.id.includes(userInfo.id)) {
            throw ("이미 존재하는 아이디입니다.");
        }
        users.id.push(userInfo.id);
        users.name.push(userInfo.name);
        users.password.push(userInfo.password);
        await fs.writeFile("./src/databases/users.json", JSON.stringify(users));
        return {success: true} ;
    }
}

module.exports = UserStorage;