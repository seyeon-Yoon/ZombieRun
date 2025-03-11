"use strict";

const User = require("../models/user"); // 사용자 모델

const userController = {
    login: async (req, res) => {
        const { id, password } = req.body;
        const user = new User({ id, password });
        const response = await user.login();
        return res.json(response); // 로그인 결과 반환
    }
};

module.exports = userController;
