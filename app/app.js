"use strict";

const express = require('express'); // express import
const bodyParser = require("body-parser");
const path = require("path");  // path 모듈 추가
const multer = require("multer");
const app = express(); // express import

// multer 설정 (업로드할 파일 저장소 설정)
const upload = multer({ dest: 'uploads/' });

// 라우팅
const router = require("./src/routes/home");

// 앱 세팅
app.set("views", path.join(__dirname, "src", "views"));  // 절대 경로로 뷰 폴더 설정
app.set("view engine", "ejs"); // 뷰 엔진을 ejs로 설정

// 정적 파일 경로 설정
app.use(express.static(`${__dirname}/src/public`)); // 정적 파일을 제공할 경로 설정
app.use('/uploads', express.static('uploads')); // 업로드된 파일 접근을 위한 정적 경로 추가

// Body-parser 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // URL을 통해 전달되는 데이터 처리

// 라우터 설정
app.use("/", router);

// 클라이언트에서 보낸 form 데이터와 파일 처리
app.post('/theme', upload.single('map_file'), (req, res) => {
    console.log("서버에서 받은 데이터:", req.body);  // 클라이언트에서 보낸 데이터를 확인
    console.log("파일 데이터:", req.file);  // 업로드된 파일 확인
    router.process.theme(req, res);
});

module.exports = app;
