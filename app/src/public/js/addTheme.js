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
            if (fileListContainer.children.length > 0) {
                alert('이미 등록된 맵이 있습니다. 기존 맵을 삭제한 후 다시 시도해주세요.');
                return;
            }
            mapUploadInput.click();
        });

        // ✅ 파일 선택 후 목록에 추가
        mapUploadInput.addEventListener("change", () => {
            const files = mapUploadInput.files;
            if (files.length > 0) {
                // 첫 번째 파일만 사용
                const file = files[0];
                
                // 파일 목록 표시
                fileListContainer.innerHTML = '';
                const listItem = document.createElement("li");
                listItem.style.marginBottom = '10px';
                
                // 파일 이름 표시
                const fileName = document.createElement("span");
                fileName.textContent = file.name;
                fileName.style.marginRight = '10px';
                fileName.style.color = '#ffffff';
                fileName.style.fontSize = '16px';
                
                // 삭제 버튼 생성
                const removeBtn = document.createElement("button");
                removeBtn.textContent = '×';
                removeBtn.style.width = '24px';
                removeBtn.style.height = '24px';
                removeBtn.style.padding = '0';
                removeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                removeBtn.style.color = '#ffffff';
                removeBtn.style.border = 'none';
                removeBtn.style.borderRadius = '50%';
                removeBtn.style.cursor = 'pointer';
                removeBtn.style.fontSize = '18px';
                removeBtn.style.fontWeight = 'bold';
                removeBtn.style.display = 'flex';
                removeBtn.style.alignItems = 'center';
                removeBtn.style.justifyContent = 'center';
                removeBtn.style.transition = 'all 0.2s ease';
                
                // 호버 효과 추가
                removeBtn.addEventListener('mouseover', () => {
                    removeBtn.style.backgroundColor = 'rgba(255, 68, 68, 0.8)';
                    removeBtn.style.transform = 'scale(1.1)';
                });
                
                removeBtn.addEventListener('mouseout', () => {
                    removeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    removeBtn.style.transform = 'scale(1)';
                });

                // 파일 항목 스타일링
                listItem.style.display = 'flex';
                listItem.style.alignItems = 'center';
                listItem.style.padding = '10px';
                listItem.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                listItem.style.borderRadius = '8px';
                listItem.style.marginBottom = '10px';
                
                // 삭제 버튼 클릭 이벤트
                removeBtn.addEventListener("click", () => {
                    listItem.remove();
                    mapUploadInput.value = ''; // 파일 입력 초기화
                });
                
                listItem.appendChild(fileName);
                listItem.appendChild(removeBtn);
                fileListContainer.appendChild(listItem);
            }
        });

        //테마 저장 기능
        themeForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // 기본 제출 방지

            const themeCodeValue = themeCodeInput.value.trim(); // 테마 코드 입력값 공백제거
            const themeName = document.querySelector("#theme_name").value.trim();

            // ✅ 숫자 4자리인지 확인
            if (!/^\d{4}$/.test(themeCodeValue)) {
                console.warn("⚠️ [WARNING] 유효하지 않은 테마 코드:", themeCodeValue);
                alert("테마 코드는 숫자 4자리만 입력 가능합니다.");
                return;
            }

            const themeData = new FormData();
            themeData.append("theme_name", themeName);
            themeData.append("theme_code", themeCodeValue);
            themeData.append("escape_time_minutes", document.querySelector("#escape_time_minutes").value.trim());
            themeData.append("available_hints", document.querySelector("#available_hints").value.trim());
            themeData.append("monitoring_places", document.querySelector("#monitoring_places").value.trim());

            // ✅ 업로드된 맵 파일이 있는 경우에만 추가
            const mapFiles = mapUploadInput.files;
            if (mapFiles.length > 0) {
                themeData.append("map_file", mapFiles[0]);
            }

            // ✅ 버튼 중복 클릭 방지
            saveThemeButton.disabled = true;

            try {
                const response = await fetch("/addTheme", {
                    method: "POST",
                    body: themeData,
                });

                if (!response.ok) {
                    throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();

                if (result.success) {
                    alert(`"${themeName}"이 등록되었습니다.`);
                    themeForm.reset();
                    fileListContainer.innerHTML = ""; // 파일 목록 초기화
                    location.reload(); // 페이지 새로고침하여 테마 목록 업데이트
                } else {
                    alert("테마 등록 실패: " + (result.message || "알 수 없는 오류가 발생했습니다."));
                }
            } catch (error) {
                console.error("테마 등록 중 오류 발생", error);
                alert("테마 등록 중 오류가 발생했습니다: " + error.message);
            } finally {
                saveThemeButton.disabled = false; // 요청 종료 후 버튼 다시 활성화
            }
        });
    });
