// Deterministically rebalance correct-answer positions for single-answer questions.
// Usage: node rebalance.js <batch.json>...   (skips questions with positional options)
const fs = require('fs');
const hash = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
for (const f of process.argv.slice(2)) {
  const items = JSON.parse(fs.readFileSync(f, 'utf8'));
  let moved = 0, skipped = 0;
  const elig = items.filter((q) => !Array.isArray(q.answer) && q.options.length === 4 && !q.options.some((o) => /(above|both|neither|A and B|all of these)/i.test(o)));
  const rank = new Map([...elig].sort((a, b) => hash(a.id || a.question) - hash(b.id || b.question)).map((q, r) => [q, r]));
  items.forEach((q) => {
    if (Array.isArray(q.answer) || q.options.length !== 4) return;
    if (q.options.some((o) => /\b(above|both|neither|A and B|all of these)\b/i.test(o))) { skipped++; return; }
    const target = rank.get(q) % 4;
    if (target === q.answer) return;
    const opts = [...q.options];
    [opts[target], opts[q.answer]] = [opts[q.answer], opts[target]];
    q.options = opts; q.answer = target; moved++;
  });
  fs.writeFileSync(f, JSON.stringify(items, null, 1));
  const dist = [0, 0, 0, 0]; items.forEach((q) => { if (!Array.isArray(q.answer)) dist[q.answer]++; });
  console.log(f, 'moved', moved, 'skipped', skipped, 'dist', dist.join('/'));
}
