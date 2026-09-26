// Build webapp/js/data.js + data-saa.js from content/*.json (the source of truth)
// Assigns ids to items lacking one (next free number per prefix) and writes
// them back into the batch files so ids stay stable across re-merges.
// Usage (repo root): node tools/build-data.js   then: node tools/validate-data.js
const fs = require('fs');
const path = require('path');

const B = path.join(__dirname, '..', 'content');
const OUT = path.join(__dirname, '..', 'webapp', 'js');
const pad = (n) => String(n).padStart(3, '0');

const files = fs.readdirSync(B).filter((f) => f.endsWith('.json'));
const load = (f) => JSON.parse(fs.readFileSync(path.join(B, f), 'utf8'));

// Collect max ids already used per prefix (retired ids are never reused:
// also honour ids recorded in retired.json if present).
const maxId = {};
const note = (id) => {
  const m = /^(clf|saa)-(c|q)-(\d{3})$/.exec(id || '');
  if (m) { const k = `${m[1]}-${m[2]}`; maxId[k] = Math.max(maxId[k] || 0, +m[3]); }
};
const batches = files.filter((f) => f !== 'retired.json').map((f) => ({ f, items: load(f) }));
batches.forEach((b) => b.items.forEach((it) => note(it.id)));
if (files.includes('retired.json')) load('retired.json').forEach(note);

for (const b of batches) {
  const track = b.f.startsWith('saa') ? 'saa' : 'clf';
  const kind = /-cards/.test(b.f) ? 'c' : 'q';
  let changed = false;
  for (const it of b.items) {
    if (!it.id) {
      const k = `${track}-${kind}`;
      maxId[k] = (maxId[k] || 0) + 1;
      it.id = `${k}-${pad(maxId[k])}`;
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(path.join(B, b.f), JSON.stringify(b.items, null, 1));
}

const collect = (track, kind) => batches
  .filter((b) => b.f.startsWith(track) && (kind === 'c' ? /-cards/.test(b.f) : /-q-/.test(b.f)))
  .flatMap((b) => b.items)
  .sort((a, z) => a.id.localeCompare(z.id));

const q = (v) => JSON.stringify(v);
const cardLine = (c) => `  { id: ${q(c.id)}, term: ${q(c.term)}, definition: ${q(c.definition)}, category: ${q(c.category)}, section: ${q(c.section ?? null)} },`;
const qLine = (x) => `  { id: ${q(x.id)}, question: ${q(x.question)}, options: ${q(x.options)}, answer: ${q(x.answer)}, explanation: ${q(x.explanation)}, domain: ${q(x.domain)}, section: ${q(x.section ?? null)} },`;

const clfCards = collect('clf', 'c');
const clfQs = collect('clf', 'q');
const saaCards = collect('saa', 'c');
const saaQs = collect('saa', 'q');

fs.writeFileSync(path.join(OUT, 'data.js'), `// ============================================================
//  AWS Cloud Practitioner (CLF-C02) — Question Bank + Flashcards
//  ${clfQs.length} practice questions · ${clfCards.length} flashcards
//  ids are stable (never reuse a retired id); section = COURSES.clf section id
// ============================================================

const FLASHCARDS = [
${clfCards.map(cardLine).join('\n')}
];

const QUESTIONS = [
${clfQs.map(qLine).join('\n')}
];

// Category lists for flashcard filtering
const FLASHCARD_CATEGORIES = ["compute", "storage", "database", "network", "security", "billing"];
const QUIZ_DOMAINS = [
  { id: "domain1", name: "Cloud Concepts", weight: "24%" },
  { id: "domain2", name: "Security & Compliance", weight: "30%" },
  { id: "domain3", name: "Cloud Technology & Services", weight: "34%" },
  { id: "domain4", name: "Billing, Pricing & Support", weight: "12%" },
];
`);

fs.writeFileSync(path.join(OUT, 'data-saa.js'), `// ============================================================
//  AWS Solutions Architect Associate (SAA-C03) — Question Bank + Flashcards
//  ${saaQs.length} practice questions · ${saaCards.length} flashcards
//  Multi-response questions: 5 options, answer = [i, j], text says "Choose TWO"
//  ids are stable (never reuse a retired id); section = COURSES.saa section id
// ============================================================

const SAA_FLASHCARDS = [
${saaCards.map(cardLine).join('\n')}
];

const SAA_QUESTIONS = [
${saaQs.map(qLine).join('\n')}
];

const SAA_FLASHCARD_CATEGORIES = ["compute", "storage", "database", "network", "security", "integration", "management", "analytics"];
const SAA_QUIZ_DOMAINS = [
  { id: "saa1", name: "Design Secure Architectures", weight: "30%" },
  { id: "saa2", name: "Design Resilient Architectures", weight: "26%" },
  { id: "saa3", name: "Design High-Performing Architectures", weight: "24%" },
  { id: "saa4", name: "Design Cost-Optimized Architectures", weight: "20%" },
];
`);

console.log(`CLF ${clfQs.length}q/${clfCards.length}c  SAA ${saaQs.length}q/${saaCards.length}c`);
