const fs = require('fs');
const path = require('path');

// JSON ファイルのパス
const beforePath = path.resolve(__dirname, './results/reservation_report.json');       // 初回アクセス
const afterPath = path.resolve(__dirname, './results/reservation_report_redis.json'); // キャッシュヒット

// 出力 HTML のパス
const outputPath = path.resolve(__dirname, './results/reservation_cache_comparison.html');

// JSON データ読み込み
function readMetrics(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return rawData
        .split('\n')
        .filter(l => l.trim() !== '')
        .map(l => JSON.parse(l));
}

const beforeData = readMetrics(beforePath);
const afterData = readMetrics(afterPath);

// 集計関数
function summarize(metrics) {
    const summary = {};
    metrics.forEach(m => {
        const value = m?.data?.value ?? 0;
        const tags = m?.data?.tags ?? {};
        const scenario = tags.scenario || 'unknown';

        if (!summary[scenario]) summary[scenario] = { http_reqs: 0, durations: [], checksPassed: 0, checksTotal: 0 };

        if (m.metric === 'http_reqs') summary[scenario].http_reqs += 1;
        if (m.metric === 'http_req_duration') summary[scenario].durations.push(value);

        const status = tags.status;
        if (status !== undefined) {
            summary[scenario].checksTotal += 1;
            if (status === 200 || status === '200') summary[scenario].checksPassed += 1;
        }
    });
    return summary;
}

const beforeSummary = summarize(beforeData);
const afterSummary = summarize(afterData);

const scenarios = Array.from(new Set([...Object.keys(beforeSummary), ...Object.keys(afterSummary)]));

function getMetric(summary, scenario) {
    const s = summary[scenario] || { durations: [], http_reqs: 0, checksPassed: 0, checksTotal: 0 };
    const avg = s.durations.length ? (s.durations.reduce((a,b)=>a+b,0)/s.durations.length).toFixed(2) : 0;
    const max = s.durations.length ? Math.max(...s.durations).toFixed(2) : 0;
    const rps = s.http_reqs;
    const checkRate = s.checksTotal ? ((s.checksPassed/s.checksTotal)*100).toFixed(1) : 0;
    return { avg, max, rps, checkRate };
}

// HTML 生成
let html = `
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>キャッシュヒット比較レポート</title>
<style>
body { font-family: Arial; padding: 20px; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
th { background: #f4f4f4; }
</style>
</head>
<body>
<h1>初回アクセス vs キャッシュヒット 性能比較</h1>
<table>
<tr>
<th>フェーズ</th>
<th>初回アクセス 平均レスポンス (ms)</th>
<th>キャッシュヒット 平均レスポンス (ms)</th>
<th>初回アクセス 最大レスポンス (ms)</th>
<th>キャッシュヒット 最大レスポンス (ms)</th>
<th>初回アクセス RPS</th>
<th>キャッシュヒット RPS</th>
<th>初回アクセス チェック成功率 (%)</th>
<th>キャッシュヒット チェック成功率 (%)</th>
</tr>
`;

scenarios.forEach(scenario => {
    const before = getMetric(beforeSummary, scenario);
    const after = getMetric(afterSummary, scenario);
    html += `<tr>
        <td>${scenario}</td>
        <td>${before.avg}</td>
        <td>${after.avg}</td>
        <td>${before.max}</td>
        <td>${after.max}</td>
        <td>${before.rps}</td>
        <td>${after.rps}</td>
        <td>${before.checkRate}</td>
        <td>${after.checkRate}</td>
    </tr>`;
});

html += `</table></body></html>`;

// ディレクトリ作成（存在しなければ）
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// HTML 書き込み
fs.writeFileSync(outputPath, html, 'utf-8');
console.log(`HTML キャッシュ比較レポートを作成しました: ${outputPath}`);