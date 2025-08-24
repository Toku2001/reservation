import http from 'k6/http';
import { check, sleep } from 'k6';

// 各フェーズの設定
export let options = {
    scenarios: {
        single_request: {
            executor: 'constant-vus',
            vus: 1,
            duration: '10s',
        },
        low_load: {
            executor: 'constant-vus',
            vus: 10,
            duration: '30s',
            startTime: '15s',
        },
        high_load: {
            executor: 'constant-vus',
            vus: 100,
            duration: '30s',
            startTime: '50s',
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.1'], // 失敗率10%以下
        http_req_duration: ['p(95)<500'], // 95パーセンタイル500ms以下
    },
};

// POST するデータのサンプル
const payload = JSON.stringify({
    userId: 1,
    itemId: 10,
    reservedAt: "2025-08-17T12:00:00"
});

const params = {
    headers: {
        'Content-Type': 'application/json',
    },
};

export default function () {
    let res = http.post('http://localhost:8080/reservation/booking', payload, params);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response body present': (r) => r.body.length > 0
    });

    sleep(1);
}