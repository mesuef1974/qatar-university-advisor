/**
 * Quality Evaluation Pipeline — Qatar University Advisor
 * ═══════════════════════════════════════════════════════
 * Runs the golden Q&A set against /api/chat and scores each response.
 * Pass criterion: keyword overlap >= scoring.passThreshold
 *
 * Usage:
 *   BASE_URL=https://qatar-university-advisor.vercel.app node tests/golden/run-eval.js
 *   BASE_URL=http://localhost:3000 node tests/golden/run-eval.js
 *
 * Exit code 0 if overall score >= scoring.minOverallScore, else 1 (CI gate).
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const QA_PATH = join(process.cwd(), 'tests', 'golden', 'qa-set.json');

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^؀-ۿa-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreItem(item, answer) {
  const normalizedAnswer = normalize(answer);
  const expectKeywords = item.expectKeywords || [];
  const mustNot = item.mustNotContain || [];

  // Check forbidden phrases first — automatic fail
  for (const forbidden of mustNot) {
    if (normalizedAnswer.includes(normalize(forbidden))) {
      return { score: 0, reason: `forbidden: "${forbidden}"`, hits: 0, expected: expectKeywords.length };
    }
  }

  if (expectKeywords.length === 0) return { score: 1, reason: 'no keywords', hits: 0, expected: 0 };

  let hits = 0;
  for (const kw of expectKeywords) {
    if (normalizedAnswer.includes(normalize(kw))) hits++;
  }
  const score = hits / expectKeywords.length;
  return { score, reason: `${hits}/${expectKeywords.length} keywords`, hits, expected: expectKeywords.length };
}

async function askChat(question) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    return { answer: '', source: 'http_error', status: res.status };
  }
  const data = await res.json();
  return { answer: data.answer || '', source: data.source || 'unknown', status: 200 };
}

async function main() {
  const qaData = JSON.parse(readFileSync(QA_PATH, 'utf-8'));
  const { items, scoring } = qaData;

  console.log(`\n🎯 Running ${items.length} golden Q&A items against ${BASE_URL}\n`);
  console.log(`   Pass threshold per item: ${scoring.passThreshold}`);
  console.log(`   Min overall score:       ${scoring.minOverallScore}\n`);

  const results = [];
  let passed = 0;
  let totalScore = 0;

  for (const item of items) {
    process.stdout.write(`[${item.id}] `);
    let answer = '';
    let source = 'error';
    try {
      const r = await askChat(item.question);
      answer = r.answer;
      source = r.source;
    } catch (err) {
      results.push({ id: item.id, score: 0, reason: `fetch error: ${err.message}`, source: 'error' });
      console.log(`❌ FETCH ERROR (${err.message})`);
      continue;
    }

    const { score, reason, hits, expected } = scoreItem(item, answer);
    const isPass = score >= scoring.passThreshold;
    if (isPass) passed++;
    totalScore += score;

    results.push({ id: item.id, category: item.category, score, hits, expected, source, reason });
    const marker = isPass ? '✅' : '⚠️ ';
    console.log(`${marker} score=${score.toFixed(2)} (${reason}) src=${source}`);
  }

  const overall = totalScore / items.length;
  const passRate = passed / items.length;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 Results`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`   Pass rate:     ${(passRate * 100).toFixed(1)}% (${passed}/${items.length})`);
  console.log(`   Overall score: ${(overall * 100).toFixed(1)}%`);

  // Per-category breakdown
  const byCategory = {};
  for (const r of results) {
    if (!byCategory[r.category]) byCategory[r.category] = { count: 0, sum: 0 };
    byCategory[r.category].count++;
    byCategory[r.category].sum += r.score;
  }
  console.log(`\n   By category:`);
  for (const [cat, stats] of Object.entries(byCategory)) {
    const catScore = (stats.sum / stats.count) * 100;
    console.log(`     ${cat.padEnd(15)} ${catScore.toFixed(1)}% (${stats.count} items)`);
  }

  const passedThreshold = overall >= scoring.minOverallScore;
  console.log(`\n${'═'.repeat(60)}`);
  if (passedThreshold) {
    console.log(`✅ PASS — overall score ${(overall * 100).toFixed(1)}% >= threshold ${(scoring.minOverallScore * 100).toFixed(1)}%`);
    process.exit(0);
  } else {
    console.log(`❌ FAIL — overall score ${(overall * 100).toFixed(1)}% < threshold ${(scoring.minOverallScore * 100).toFixed(1)}%`);
    console.log(`\n   Failed items:`);
    for (const r of results.filter((x) => x.score < scoring.passThreshold)) {
      console.log(`     ${r.id}: ${r.reason}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Eval pipeline crashed:', err);
  process.exit(2);
});
