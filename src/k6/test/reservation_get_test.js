import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// チェック成功率
export let successRate = new Rate('check_success_rate');

// 固定ユーザーID
const FIXED_USER_ID = 1;

// POST データ作成関数
function createPostData(userId) {
    return JSON.stringify({
        userId: userId,
        itemId: 10,
        reservedAt: "2025-08-24T10:00:00"
    });
}

// POST
function doPost(userId) {
    const payload = createPostData(userId);
    const params = { headers: { 'Content-Type': 'application/json' } };
    let res = http.post('http://localhost:8080/reservation/booking', payload, params);

    let success = check(res, {
        'POST status 200': (r) => r.status === 200,
        'POST body present': (r) => r.body.length > 0
    });
    successRate.add(success);

    // POST 後に少し待ってキャッシュ構築時間を確保
    sleep(0.5);
}

// GET
function doGet(userId) {
    let res = http.get(`http://localhost:8080/reservation/${userId}`);

    let success = check(res, {
        'GET status 200': (r) => r.status === 200
    });
    successRate.add(success);
}

// シナリオ設定（合計約1分）
export let options = {
    stages: [
        { duration: '10s', target: 10 },  // ウォームアップ
        { duration: '40s', target: 50 },  // 中負荷
        { duration: '10s', target: 0 }    // クールダウン
    ],
    thresholds: {
        'check_success_rate': ['rate>0.95']
    },
};

let postDone = false;

export function setup() {
    doPost(FIXED_USER_ID);  // 全体で 1 件だけ POST
}

export default function () {
    doGet(FIXED_USER_ID);
    sleep(1);
}