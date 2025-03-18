"use strict";

const id = document.querySelector("#id"); //HTML 문서에서 id라는 id 속성을 가진 요소를 찾아서 id 변수에 할당하라. 
const password = document.querySelector("#password");
const loginBtn = document.querySelector("#button");

loginBtn.addEventListener("click", login);

function login(event) {
    event.preventDefault(); // 기본 폼 제출 방지

    const req = {
        id: id.value,
        password : password.value,
    };
    console.log(req);
    console.log(JSON.stringify(req));
    fetch("/login", {
        method: "POST", // REST API 관련
        headers: {  // 데이터타입을 명시적으로 알려줌
            "Content-Type" : "application/json" // 내가 보내는 데이터타입
        },
        body: JSON.stringify(req),  // 해당 데이터를 문자열로 바꿔서 전송
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.success) {
                location.href = '/addTheme';  // 로그인 성공 시 /addTheme 페이지로 이동
            } else {
                alert(res.msg);  // 로그인 실패 시 오류 메시지
            }
        })
        .catch((err) => {
            console.error("로그인 중 에러 발생", err);
        });
}
