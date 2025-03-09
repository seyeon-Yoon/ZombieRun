"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const themeForm = document.querySelector("#theme-form");
    const addMapBtn = document.querySelector("#add-map-btn"); // 🔹 "맵 추가" 버튼
    const mapUploadInput = document.querySelector("#map-upload"); // 🔹 숨겨진 파일 입력 필드
    const fileListContainer = document.querySelector("#file-list"); // 🔹 업로드된 파일 목록

    // 🔹 "맵 추가" 버튼 클릭 시 파일 업로드 창 열기
    addMapBtn.addEventListener("click", () => {
        mapUploadInput.click();
    });

    // 🔹 파일 선택 후 목록에 추가
    mapUploadInput.addEventListener("change", () => {
        fileListContainer.innerHTML = ""; // 기존 목록 초기화
        const files = Array.from(mapUploadInput.files);

        if (files.length === 0) return;

        files.forEach((file, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = file.name;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "삭제";
            removeBtn.style.marginLeft = "10px";
            removeBtn.addEventListener("click", () => {
                files.splice(index, 1);
                updateFileList(files);
            });

            listItem.appendChild(removeBtn);
            fileListContainer.appendChild(listItem);
        });
    });

    // 🔹 파일 목록 갱신
    function updateFileList(files) {
        fileListContainer.innerHTML = "";
        files.forEach((file, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = file.name;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "삭제";
            removeBtn.style.marginLeft = "10px";
            removeBtn.addEventListener("click", () => {
                files.splice(index, 1);
                updateFileList(files);
            });

            listItem.appendChild(removeBtn);
            fileListContainer.appendChild(listItem);
        });
    }

    // ✅ 테마 저장 기능
    themeForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // 기본 제출 방지

        const themeCodeInput = document.querySelector("#theme_code");
        const themeCodeValue = String(themeCodeInput.value.trim()); // 🔹 String 변환 추가

        console.log("입력된 테마 코드:", themeCodeValue); // 🔍 디버깅용 로그 추가

        // 🔹 숫자 4자리만 허용 (문자열로 변환 후 확인)
        if (!/^\d{4}$/.test(themeCodeValue)) {
            alert("테마 코드는 숫자 4자리만 입력 가능합니다.");
            return;
        }

        const themeData = new FormData();
        themeData.append("theme_name", document.querySelector("#theme_name").value.trim());
        themeData.append("theme_code", themeCodeValue); // 🔹 여기서도 문자열로 변환 후 추가
        themeData.append("escape_time_minutes", document.querySelector("#escape_time_minutes").value.trim());
        themeData.append("available_hints", document.querySelector("#available_hints").value.trim());
        themeData.append("monitoring_places", document.querySelector("#monitoring_places").value.trim());

        // 🔹 업로드된 파일 추가
        Array.from(mapUploadInput.files).forEach((file) => {
            themeData.append("map_files", file);
        });

        console.log("보낼 테마 데이터:", themeData);

        try {
            const response = await fetch("/theme", {
                method: "POST",
                body: themeData, // FormData 사용
            });

            console.log("응답 객체:", response);
            if (!response.ok) {
                throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log("서버 응답 데이터:", result);

            if (result.success) {
                alert("테마 저장 성공!");
                themeForm.reset();
                fileListContainer.innerHTML = ""; // 🔹 파일 목록 초기화
            } else {
                alert("테마 저장 실패: " + (typeof result.msg == "string" ? result.msg : JSON.stringify(result.msg)));
            }
        } catch (error) {
            console.error("테마 저장 중 오류 발생", error);
            alert("테마 저장 중 오류 발생: " + error.message);
        }
    });
});
