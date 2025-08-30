import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// チェック成功率
export let successRate = new Rate('check_success_rate');
// GET レスポンス専用メトリクス
export let getDuration = new Trend('get_duration');

// POST データ作成関数
function createPostData(userId, reservedAt) {
    return JSON.stringify({
        userId: userId,
        itemId: 10,
        reservedAt: reservedAt
    });
}

// 初期データ作成 (1万件登録)
function insertInitialData() {
    const params = { headers: { 'Content-Type': 'application/json' } };
    let baseTime = new Date("2025-08-24T10:00:00");

    for (let i = 1; i <= 10000; i++) {
        // ユーザーごとに予約時刻をずらす
        let reservedAt = new Date(baseTime.getTime() + i * 60000).toISOString(); 
        const payload = createPostData(i, reservedAt);

        let res = http.post('http://localhost:8080/reservation//users/create', payload, params);
        check(res, { 'Initial POST status 200': (r) => r.status === 200 });
    }
}

// GET のみを計測
function doGet() {
    let res = http.get(`http://localhost:8080/reservation//users/test`);

    let success = check(res, {
        'GET status 200': (r) => r.status === 200
    });
    successRate.add(success);
    getDuration.add(res.timings.duration);
}

// シナリオ設定
export let options = {
    stages: [
        { duration: '10s', target: 5 },  // ウォームアップ
        { duration: '40s', target: 100 },  // 中負荷
        { duration: '10s', target: 5 }   // クールダウン
    ],
    thresholds: {
        'check_success_rate': ['rate>0.95'],
        'get_duration': ['p(95)<50'],
    },
};

export function setup() {
    // 1万件のレコード登録
    insertInitialData();

    // キャッシュ構築用の初回 GET
    http.get(`http://localhost:8080/reservation//users/test`);
    sleep(5);
}

export default function (data) {
    doGet();
    sleep(1);
}