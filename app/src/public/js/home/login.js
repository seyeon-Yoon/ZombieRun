"use strict";

const id = document.querySelector("#id"),
    password = document.querySelector("#password"),
    loginBtn = document.querySelector("#button");

loginBtn.addEventListener("click", login);

function login() {
    const req = {
        id: id.value,
        password : password.value,
    };
    console.log(req);
    console.log(JSON.stringify(req));
    fetch("/login", {
        method: "POST", //restAPI와 관련되어있음.
        headers: {  //데이터타입을 명시적으로 알려줌
            
            "Content-Type" : "application/json" //내가보내는 데이터타입
        },
        body: JSON.stringify(req),  // 해당데이터를 문자열로 바꿔주는 메서드
    })
        .then((res) => res.json())
        .then((res) => {
            if (res.success) {
                location.href = '/theme';
            } else {
                alert(res.msg);
            }
        })
        .catch((err) => {
            console.error("로그인 중 에러 발생");
        });
}