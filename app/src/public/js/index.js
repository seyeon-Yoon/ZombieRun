"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.querySelector("#button");

    if (startBtn) {
        startBtn.addEventListener("click", () => {
            console.log("시작하기 버튼 클릭"); // 디버깅용 로그
            window.location.href = "/login"; 
        });
    } else {
        console.error("버튼을 찾을 수 없음!");
    }
});

