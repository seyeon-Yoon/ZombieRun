"use strict";

const express = require('express'); // express import
const bodyParser = require("body-parser");
const path = require("path");  // path 모듈 추가
const multer = require("multer");
const app = express(); // express import

// multer 설정 (업로드할 파일 저장소 설정)
const upload = multer({ dest: 'uploads/' });


// 라우팅
const home = require("./src/routes/index");

// 앱 세팅
app.set("views", path.join(__dirname, "src", "views"));  // 절대 경로로 뷰 폴더 설정
app.set("view engine", "ejs"); // 뷰 엔진을 ejs로 설정

// 정적 파일 경로 설정
app.use(express.static(`${__dirname}/src/public`)); // 정적 파일을 제공할 경로 설정

// Body-parser 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // URL을 통해 전달되는 데이터 처리

// 홈 라우팅 설정
app.use("/", home); // 클라이언트가 '/' 경로로 요청을 보낼 때, home 라우터에서 정의된 라우팅 로직을 실행하여 그 요청을 처리하라

// 클라이언트에서 보낸 form 데이터와 파일 처리
app.post('/theme', upload.array('map_files'), (req, res) => {
    console.log("서버에서 받은 데이터:", req.body);  // 클라이언트에서 보낸 데이터를 확인
    console.log("파일 데이터:", req.files);  // 업로드된 파일 확인
    // 이후 데이터 처리 로직
});

module.exports = app;
