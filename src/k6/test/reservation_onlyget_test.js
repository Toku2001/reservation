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

// 初期データ作成 (setup 内のみで 1 件実行)
function insertInitialData(userId) {
    const payload = createPostData(userId);
    const params = { headers: { 'Content-Type': 'application/json' } };
    let res = http.post('http://localhost:8080/reservation/booking', payload, params);

    check(res, { 'Initial POST status 200': (r) => r.status === 200 });
}

// GET のみを計測
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
        { duration: '10s', target: 1 },  // ウォームアップ
        { duration: '40s', target: 1 },  // 中負荷
        { duration: '10s', target: 1 }    // クールダウン
    ],
    thresholds: {
        'check_success_rate': ['rate>0.95']
    },
};

let cacheWarmed = false;

export function setup() {
    // 最初に 1 件だけレコードを登録
    insertInitialData(FIXED_USER_ID);
	sleep(5);
	doGet(FIXED_USER_ID);
	sleep(5);
}

export default function () {
    // 計測対象は GET のみ
    doGet(FIXED_USER_ID);
    sleep(1);
}