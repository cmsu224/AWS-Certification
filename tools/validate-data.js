#!/usr/bin/env node
// ============================================================
//  Validates webapp/js/data.js, data-saa.js and course.js.
//  No dependencies. Run from repo root:  node tools/validate-data.js
//  Exits 1 on any error; prints per-section coverage with --coverage.
// ============================================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const JS = path.join(__dirname, '..', 'webapp', 'js');
const ctx = {};
vm.createContext(ctx);
for (const f of ['course.js', 'data.js', 'data-saa.js']) {
  const src = fs.readFileSync(path.join(JS, f), 'utf8');
  vm.runInContext(src, ctx, { filename: f });
}
const g = vm.runInContext(
  '({COURSES, FLASHCARDS, QUESTIONS, QUIZ_DOMAINS, FLASHCARD_CATEGORIES,' +
  ' SAA_FLASHCARDS, SAA_QUESTIONS, SAA_QUIZ_DOMAINS, SAA_FLASHCARD_CATEGORIES})', ctx);

const errors = [];
const err = (m) => errors.push(m);

const TRACKS = {
  clf: { cards: g.FLASHCARDS, questions: g.QUESTIONS, domains: g.QUIZ_DOMAINS, cats: g.FLASHCARD_CATEGORIES },
  saa: { cards: g.SAA_FLASHCARDS, questions: g.SAA_QUESTIONS, domains: g.SAA_QUIZ_DOMAINS, cats: g.SAA_FLASHCARD_CATEGORIES },
};

const allIds = new Set();
const coverage = {};

for (const [track, t] of Object.entries(TRACKS)) {
  const sectionIds = new Set(g.COURSES[track].sections.map((s) => s.id));
  const domainIds = new Set(t.domains.map((d) => d.id));
  const seenText = new Map();

  const checkCommon = (item, kind) => {
    if (!item.id || !new RegExp(`^${track}-${kind}-\\d{3}$`).test(item.id)) err(`${track}: bad id ${item.id}`);
    if (allIds.has(item.id)) err(`duplicate id ${item.id}`);
    allIds.add(item.id);
    if (item.section !== null && !sectionIds.has(item.section)) err(`${item.id}: unknown section ${item.section}`);
    if (item.section) {
      coverage[item.section] = coverage[item.section] || { c: 0, q: 0 };
      coverage[item.section][kind]++;
    }
  };

  for (const c of t.cards) {
    checkCommon(c, 'c');
    if (!c.term || !c.definition) err(`${c.id}: missing term/definition`);
    if (!t.cats.includes(c.category)) err(`${c.id}: unknown category ${c.category}`);
    const key = 'c:' + String(c.term).trim().toLowerCase();
    if (seenText.has(key)) err(`${c.id}: duplicate term of ${seenText.get(key)} (${c.term})`);
    seenText.set(key, c.id);
  }

  for (const q of t.questions) {
    checkCommon(q, 'q');
    if (!q.question || !q.explanation) err(`${q.id}: missing question/explanation`);
    if (!domainIds.has(q.domain)) err(`${q.id}: unknown domain ${q.domain}`);
    const n = Array.isArray(q.options) ? q.options.length : 0;
    if (Array.isArray(q.answer)) {
      if (n !== 5) err(`${q.id}: multi-answer questions need 5 options (has ${n})`);
      if (q.answer.length !== 2 || new Set(q.answer).size !== 2) err(`${q.id}: multi-answer must list 2 distinct indices`);
      if (q.answer.some((a) => !Number.isInteger(a) || a < 0 || a >= n)) err(`${q.id}: answer index out of range`);
      if (!/\b(two|TWO)\b/.test(q.question)) err(`${q.id}: multi-answer question must say "Choose TWO"`);
    } else {
      if (n !== 4) err(`${q.id}: single-answer questions need 4 options (has ${n})`);
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= n) err(`${q.id}: answer index out of range`);
    }
    if (n && new Set(q.options.map((o) => String(o).trim().toLowerCase())).size !== n) err(`${q.id}: duplicate options`);
    const key = 'q:' + String(q.question).trim().toLowerCase();
    if (seenText.has(key)) err(`${q.id}: duplicate question text of ${seenText.get(key)}`);
    seenText.set(key, q.id);
  }
}

for (const [track, c] of Object.entries(g.COURSES)) {
  for (const s of c.sections) {
    if (!Array.isArray(s.lectures) || !s.lectures.length) err(`${s.id}: no lectures`);
  }
}

const summary = Object.entries(TRACKS).map(([k, t]) =>
  `${k.toUpperCase()}: ${t.questions.length} questions, ${t.cards.length} flashcards`).join(' | ');
console.log(summary);

if (process.argv.includes('--coverage')) {
  for (const [track, c] of Object.entries(g.COURSES)) {
    console.log(`\n${track.toUpperCase()} coverage (cards / questions per section):`);
    for (const s of c.sections) {
      const cv = coverage[s.id] || { c: 0, q: 0 };
      const flag = s.pace !== 'trivial' && (cv.c + cv.q) < 4 ? '  <-- thin' : '';
      console.log(`  ${s.id} ${String(cv.c).padStart(3)} / ${String(cv.q).padStart(3)}  ${s.title}${flag}`);
    }
  }
}

if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  errors.slice(0, 200).forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log('OK');
