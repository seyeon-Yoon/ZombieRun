const fs = require("fs").promises;

class NoticeStorage {
    static #getNoticesFilePath() {
        return "./src/databases/notices.json";
    }

    static async #readNotices() {
        try {
            const filePath = this.#getNoticesFilePath();
            console.log('notices.json 파일 읽기 시도:', filePath);
            const data = await fs.readFile(filePath, "utf-8");
            const parsedData = JSON.parse(data);
            console.log('notices.json 파일 읽기 성공:', parsedData);
            return parsedData;
        } catch (err) {
            console.error("공지사항 파일 읽기 실패:", err);
            if (err.code === 'ENOENT') {
                console.log('notices.json 파일이 없어서 새로 생성합니다.');
                const initialData = {
                    notices: [],
                    lastId: 0
                };
                await this.#writeNotices(initialData);
                return initialData;
            }
            throw err;
        }
    }

    static async #writeNotices(data) {
        try {
            const filePath = this.#getNoticesFilePath();
            console.log('notices.json 파일 쓰기 시도:', data);
            await fs.writeFile(filePath, JSON.stringify(data, null, 4));
            console.log('notices.json 파일 쓰기 성공');
        } catch (err) {
            console.error("공지사항 파일 쓰기 실패:", err);
            throw err;
        }
    }

    static async getNotices() {
        try {
            console.log('공지사항 목록 조회 시도');
            const data = await this.#readNotices();
            console.log('조회된 공지사항:', data.notices);
            return data.notices;
        } catch (err) {
            console.error('공지사항 조회 중 오류:', err);
            throw { success: false, msg: "공지사항 조회 실패" };
        }
    }

    static async save(noticeInfo) {
        try {
            console.log('공지사항 저장 시도:', noticeInfo);
            const data = await this.#readNotices();
            const newId = data.lastId + 1;
            
            const notice = {
                id: newId,
                content: noticeInfo.content,
                created_at: noticeInfo.created_at
            };

            data.notices.push(notice);
            data.lastId = newId;

            console.log('새로운 공지사항 데이터:', data);
            await this.#writeNotices(data);
            return { success: true };
        } catch (err) {
            console.error('공지사항 저장 중 오류:', err);
            throw { success: false, msg: "공지사항 저장 실패" };
        }
    }

    static async delete(id) {
        try {
            console.log('공지사항 삭제 시도:', id);
            const data = await this.#readNotices();
            const noticeIndex = data.notices.findIndex(notice => notice.id === parseInt(id));
            
            if (noticeIndex === -1) {
                console.error('존재하지 않는 공지사항:', id);
                throw { success: false, msg: "존재하지 않는 공지사항입니다." };
            }

            data.notices.splice(noticeIndex, 1);
            console.log('공지사항 삭제 후 데이터:', data);
            await this.#writeNotices(data);
            return { success: true };
        } catch (err) {
            console.error('공지사항 삭제 중 오류:', err);
            throw { success: false, msg: err.msg || "공지사항 삭제 실패" };
        }
    }
}

module.exports = NoticeStorage; 