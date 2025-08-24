const fs = require('fs');
const path = require('path');

// === 入力ファイル（Before / After） ===
const beforePath = path.resolve(__dirname, '../results/reservation_get_before_report.json');
const afterPath  = path.resolve(__dirname, '../results/reservation_get_after_report.json');

// === 出力 HTML ===
const outputPath = path.resolve(__dirname, '../results/reservation_report_comparison.html');

// JSON 読み込み＆整形
function parseK6Json(filePath) {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const lines = rawData.split('\n').filter(l => l.trim() !== '');
    const metrics = lines.map(l => JSON.parse(l));

    const summary = {};

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

    // 集計値算出
    for (const scenario of Object.keys(summary)) {
        const s = summary[scenario];
        s.avg = s.durations.length ? (s.durations.reduce((a,b)=>a+b,0)/s.durations.length).toFixed(2) : 0;
        s.max = s.durations.length ? Math.max(...s.durations).toFixed(2) : 0;
        s.checkRate = s.checksTotal ? ((s.checksPassed / s.checksTotal)*100).toFixed(1) : 0;
    }

    return summary;
}

const beforeSummary = parseK6Json(beforePath);
const afterSummary  = parseK6Json(afterPath);

// HTML 出力
let html = `
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>k6 Before/After レポート</title>
<style>
body { font-family: Arial; padding: 20px; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
th { background: #f4f4f4; }
</style>
</head>
<body>
<h1>k6 Before / After 比較レポート</h1>
<table>
<tr>
<th>フェーズ</th>
<th>Before 総リクエスト数</th>
<th>After 総リクエスト数</th>
<th>Before 平均レスポンス (ms)</th>
<th>After 平均レスポンス (ms)</th>
<th>Before 最大レスポンス (ms)</th>
<th>After 最大レスポンス (ms)</th>
<th>Before チェック成功率 (%)</th>
<th>After チェック成功率 (%)</th>
</tr>
`;

const allScenarios = Array.from(new Set([...Object.keys(beforeSummary), ...Object.keys(afterSummary)]));

allScenarios.forEach(scenario => {
    const b = beforeSummary[scenario] || { http_reqs:0, avg:0, max:0, checkRate:0 };
    const a = afterSummary[scenario]  || { http_reqs:0, avg:0, max:0, checkRate:0 };
    html += `<tr>
        <td>${scenario}</td>
        <td>${b.http_reqs}</td>
        <td>${a.http_reqs}</td>
        <td>${b.avg}</td>
        <td>${a.avg}</td>
        <td>${b.max}</td>
        <td>${a.max}</td>
        <td>${b.checkRate}</td>
        <td>${a.checkRate}</td>
    </tr>`;
});

html += `</table></body></html>`;

fs.writeFileSync(outputPath, html, 'utf-8');
console.log(`HTML 比較レポートを作成しました: ${outputPath}`);