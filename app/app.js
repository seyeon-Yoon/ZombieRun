"use strict";

// 모듈 및 포트설정
const express = require('express'); //express import
const bodyParser = require("body-parser"); 
const app = express(); //express import

//라우팅
const home = require("./src/routes/home");


//앱 세팅
app.set("views", "./src/views"); //뷰엔진에 대한 세팅
app.set("view engine", "ejs"); //뷰엔진을 ejs로 쓰겠다

app.use(express.static(`${__dirname}/src/public`)); //__dirname은 현재 app.js의 위치를 반환 이 안에 /src/public을 정적경로로 추가하겠다는 뜻
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));//URL을 통해 전달되는 데이터에 한글, 공백 등과 같은 문자가 포함될 경우 제대로 인식되지 않는 문제 해결
app.use("/", home); // use -> 미들웨어를 등록해주는 메서드

module.exports = app;