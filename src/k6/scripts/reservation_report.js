const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(__dirname, '../results/reservation_report.json');
const outputPath = path.resolve(__dirname, '../results/reservation_report.html');

const rawData = fs.readFileSync(inputPath, 'utf-8');
const lines = rawData.split('\n').filter(l => l.trim() !== '');
const metrics = lines.map(l => JSON.parse(l));

const summary = {};

// 集計
metrics.forEach(m => {
    if (m.type !== 'Point' || !m.data || !m.data.tags) return;
    const scenario = m.data.tags.scenario || 'unknown';
    if (!summary[scenario]) {
        summary[scenario] = {
            http_reqs: 0,
            durations: [],
            checksPassed: 0,
            checksTotal: 0
        };
    }
    const s = summary[scenario];

    if (m.metric === 'http_reqs') {
        s.http_reqs += 1;
    } else if (m.metric === 'http_req_duration') {
        s.durations.push(m.data.value || 0);
    }

    // ステータスチェック
    if (m.data.tags.status) {
        s.checksTotal += 1;
        if (m.data.tags.status === '200') s.checksPassed += 1;
    }
});

// HTML 生成
let html = `
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>k6 レポート</title>
<style>
body { font-family: Arial; padding: 20px; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
th { background: #f4f4f4; }
</style>
</head>
<body>
<h1>k6 フェーズ別集計レポート</h1>
<table>
<tr>
<th>フェーズ</th>
<th>総リクエスト数</th>
<th>平均レスポンス (ms)</th>
<th>最大レスポンス (ms)</th>
<th>チェック成功率 (%)</th>
</tr>
`;

for (const [scenario, s] of Object.entries(summary)) {
    const avg = s.durations.length ? (s.durations.reduce((a,b)=>a+b,0)/s.durations.length).toFixed(2) : 0;
    const max = s.durations.length ? Math.max(...s.durations).toFixed(2) : 0;
    const checkRate = s.checksTotal ? ((s.checksPassed / s.checksTotal)*100).toFixed(1) : 0;
    html += `<tr>
    <td>${scenario}</td>
    <td>${s.http_reqs}</td>
    <td>${avg}</td>
    <td>${max}</td>
    <td>${checkRate}</td>
    </tr>`;
}

html += `</table></body></html>`;

fs.writeFileSync(outputPath, html, 'utf-8');
console.log(`HTML レポートを作成しました: ${outputPath}`);