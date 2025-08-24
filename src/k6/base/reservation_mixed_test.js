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

export default function () {
    // 初回反復のみ固定ユーザーに POST（VU 内で1回だけ）
    if (__ITER === 0) {
        doPost(FIXED_USER_ID);
    }

    // 20%でランダム POST、80%で固定ユーザー GET
    if (Math.random() < 0.2) {
        doPost(Math.floor(Math.random() * 100) + 1); // ランダムユーザー
    } else {
        doGet(FIXED_USER_ID);
    }

    sleep(1);
}