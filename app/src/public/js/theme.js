    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        const themeForm = document.querySelector("#theme-form");
        const addMapBtn = document.querySelector("#add-map-btn"); // "맵 추가" 버튼
        const mapUploadInput = document.querySelector("#map-upload"); // 숨겨진 파일 입력 필드
        const fileListContainer = document.querySelector("#file-list"); // 업로드된 파일 목록
        const themeCodeInput = document.querySelector("#theme_code"); // 테마 코드 입력 필드
        const saveThemeButton = document.querySelector("#save_theme"); // 테마 저장 버튼

        if (!themeForm || !addMapBtn || !mapUploadInput || !fileListContainer || !themeCodeInput || !saveThemeButton) {
            console.error("필수 요소가 누락되었습니다. 스크립트 실행을 중단합니다.");
            return;
        }

        // ✅ 테마 코드 입력 시 숫자만 허용 (최대 4자리)
        themeCodeInput.addEventListener("input", (event) => {
            let value = event.target.value.replace(/\D/g, ""); // 숫자 이외의 문자 제거
            event.target.value = value.slice(0, 4); // 최대 4자리 제한
        });

        // ✅ "맵 추가" 버튼 클릭 시 파일 업로드 창 열기
        addMapBtn.addEventListener("click", () => {
            mapUploadInput.click();
        });

        // ✅ 파일 선택 후 목록에 추가
        mapUploadInput.addEventListener("change", () => {
            updateFileList();
        });

        // ✅ 파일 목록 갱신 및 삭제 기능 개선
        function updateFileList() {
            fileListContainer.innerHTML = ""; // 기존 목록 초기화
            const files = Array.from(mapUploadInput.files);
            if (files.length === 0) return;

            const newFileList = new DataTransfer();

            files.forEach((file, index) => {
                const listItem = document.createElement("li");
                listItem.textContent = file.name;

                const removeBtn = document.createElement("button");
                removeBtn.textContent = "삭제";
                removeBtn.style.marginLeft = "10px";
                removeBtn.addEventListener("click", () => {
                    files.splice(index, 1);
                    newFileList.items.clear();
                    files.forEach((f) => newFileList.items.add(f));
                    mapUploadInput.files = newFileList.files;
                    updateFileList();
                });

                listItem.appendChild(removeBtn);
                fileListContainer.appendChild(listItem);
                newFileList.items.add(file);
            });

            mapUploadInput.files = newFileList.files;
        }

        //테마 저장 기능
        themeForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // 기본 제출 방지

            const themeCodeValue = themeCodeInput.value.trim(); // 테마 코드 입력값 공백제거

            console.log("입력된 테마 코드:", themeCodeValue);

            // ✅ 숫자 4자리인지 확인
            if (!/^\d{4}$/.test(themeCodeValue)) {
                console.warn("⚠️ [WARNING] 유효하지 않은 테마 코드:", themeCodeValue);
                alert("테마 코드는 숫자 4자리만 입력 가능합니다.");
                return;
            }

            const themeData = new FormData();
            themeData.append("theme_name", document.querySelector("#theme_name").value.trim());
            themeData.append("theme_code", themeCodeValue);
            themeData.append("escape_time_minutes", document.querySelector("#escape_time_minutes").value.trim());
            themeData.append("available_hints", document.querySelector("#available_hints").value.trim());
            themeData.append("monitoring_places", document.querySelector("#monitoring_places").value.trim());

            // 전송되는 데이터 확인
            for (let pair of themeData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }
            // ✅ 업로드된 파일 추가
            Array.from(mapUploadInput.files).forEach((file) => {
                themeData.append("map_files", file);
            });

            console.log("보낼 테마 데이터:", Object.fromEntries(themeData));

            // ✅ 버튼 중복 클릭 방지
            saveThemeButton.disabled = true;

            try {
                const response = await fetch("/theme", {
                    method: "POST",
                    body: themeData,
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
                    fileListContainer.innerHTML = ""; // 파일 목록 초기화
                } else {
                    alert("테마 저장 실패: " + (typeof result.msg === "string" ? result.msg : JSON.stringify(result.msg)));
                }
            } catch (error) {
                console.error("테마 저장 중 오류 발생", error);
                alert("테마 저장 중 오류 발생: " + error.message);
            } finally {
                saveThemeButton.disabled = false; // 요청 종료 후 버튼 다시 활성화
            }
        });
    });
