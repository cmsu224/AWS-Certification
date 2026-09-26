# ☁️ AWS Certification Study Kit — CLF-C02 → SAA-C03

> 📱 **Open the app: https://cmsu224.github.io/AWS-Certification/**
>
> A phone-first study system for a busy parent: open the app, it tells you exactly what to do next — in 2–20 minute pockets, hands-free when your hands are full.

## 📲 Install it on your phone (works offline)

| 🤖 Android (Chrome) | 🍎 iPhone (must be **Safari**) |
|---|---|
| 1. Open the link in **Chrome** | 1. Open the link in **Safari** |
| 2. Tap **⋮** → **Add to Home screen** → **Install** | 2. Tap **Share** (□↑) → **Add to Home Screen** → **Add** |
| 3. Launch from the new **AWS Study** icon | 3. Launch from the new **AWS Study** icon |

> 💾 Progress lives on the phone. Once a week: **More → Settings → Export** and keep the file somewhere safe.

---

## 🗺️ The path

```
  ┌───────────────────────────────┐        ┌────────────────────────────────┐
  │  PHASE 1 · CLF-C02            │        │  PHASE 2 · SAA-C03             │
  │  Cloud Practitioner           │  ───▶  │  Solutions Architect Associate │
  │                               │  50%   │                                │
  │  Start   Mon 2026-09-28       │ voucher│  Start   Mon 2026-10-26        │
  │  Lectures → Thu 2026-10-15    │        │  Lectures → mid-Dec 2026       │
  │  Exam prep → Thu 2026-10-22   │        │  Exam prep + holiday buffer    │
  │  🎯 Exam  Fri 2026-10-23      │        │  🎯 Exam  Fri 2027-01-08       │
  └───────────────────────────────┘        └────────────────────────────────┘
     ~45–60 min/day · Stéphane Maarek's Udemy courses + this app
```

📖 Full week-by-week plan: **[study-plan/study-plan.md](study-plan/study-plan.md)**

---

## 📝 The exams

| | 🟢 CLF-C02 Cloud Practitioner | 🔵 SAA-C03 Solutions Architect Assoc. |
|---|---|---|
| ❓ Questions | 65 (50 scored + 15 unscored) | 65 (50 scored + 15 unscored) |
| ⏱️ Time | 90 min | 130 min |
| 🎯 Pass | 700 / 1000 | 720 / 1000 |
| 💵 Cost | $100 USD | $150 USD (50% off with the CLF voucher) |
| 🧩 Format | Multiple choice + multiple response | Multiple choice + multiple response |

```
  CLF-C02 domains                         SAA-C03 domains
  ┌───────────────────────────────────┐   ┌────────────────────────────────────┐
  │ 1 Cloud Concepts ........ 24% ███ │   │ 1 Secure Architectures ... 30% ███ │
  │ 2 Security & Compliance . 30% ███ │   │ 2 Resilient ............. 26% ███ │
  │ 3 Technology & Services . 34% ████│   │ 3 High-Performing ....... 24% ██  │
  │ 4 Billing & Support ..... 12% █   │   │ 4 Cost-Optimized ........ 20% ██  │
  └───────────────────────────────────┘   └────────────────────────────────────┘
```

Sources: [CLF-C02 exam guide](https://docs.aws.amazon.com/aws-certification/latest/examguides/cloud-practitioner-02.html) · [SAA-C03 exam guide](https://docs.aws.amazon.com/aws-certification/latest/examguides/solutions-architect-associate-03.html)

---

## 📱 What's in the app

| View | What it does |
|---|---|
| 🏠 **Today** | Exam countdown, streak, pace line (*"~24 min of lectures/day · On track ✅"*) and big action cards: next ~20-min lecture block → ⚡ 2-min review → 🎧 hands-free → 📝 5 quick questions. Switches to **exam-prep mode** (readiness %, full timed exams, weak-domain drills, checklist) when the course is done. |
| 🎓 **Course** | Maarek's sections & lectures with pace badges and suggested playback speed. Finishing a section **unlocks** its cards + questions. |
| 🔁 **Review** | Flashcards + questions on **spaced repetition** (Leitner boxes 0–5: 0/1/3/7/16/35 days). |
| 📝 **Quiz** | Quick 20, by domain, missed/due, full timed exam (65 Q, real time limit, all-or-nothing multi-response). Resumable after interruptions. |
| 🎧 **Hands-free** | The phone reads cards and questions aloud (Web Speech), screen stays awake. For walking, rocking, dishes. |
| 🔊 **Listen** | Pre-built MP3 **audio packs** per section, lock-screen controls, "⬇ Save offline". |
| ⚙️ **More** | Progress & readiness, settings (exam dates, daily minutes, speech), export/import, help. |

### 📊 Content (validated)

| Track | Questions | Flashcards | Course sections |
|---|---|---|---|
| 🟢 CLF-C02 | **223** | **135** | 23 (~14.5 h video) |
| 🔵 SAA-C03 | **226** (31 multi-response) | **186** | 33 (~27 h video) |
| **Total** | **449** | **321** | |

---

## 📂 Repo map

```
AWS-Certification/
├── webapp/                 📱 the PWA (pure HTML/CSS/JS, no build) — deployed to Pages
│   ├── index.html · css/style.css · sw.js · manifest.webmanifest · icons/
│   └── js/  course.js · data.js · data-saa.js (generated) · util · model · session
│            · speech · listen · today · views · app
├── content/*.json          ✍️ SOURCE OF TRUTH for questions & flashcards (one file per batch)
├── tools/
│   ├── build-data.js       content/*.json → webapp/js/data.js + data-saa.js (stable ids)
│   ├── validate-data.js    schema / duplicate / coverage checks
│   ├── rebalance-answers.js  evens out correct-answer positions
│   ├── make-audio.py       builds MP3 audio packs (edge-tts) — runs in CI
│   └── udemy-curricula.json  raw Maarek curricula (source of js/course.js)
├── study-plan/study-plan.md   🗺️ week-by-week plan
├── cheat-sheets/ · terminology/   📄 CLF visual cheat sheets + term/analogy guide
├── flashcards/ · quizzes/  🖥️ legacy terminal tools (bash)
├── tests/smoke.mjs         🧪 Playwright end-to-end smoke test
├── docs/app-spec.md        📐 app spec (data contracts, progress model, SRS, PWA)
├── docs/app-build-log.md   🛠️ engine architecture + decisions
└── .github/workflows/pages.yml  🚀 validate → audio packs → deploy to GitHub Pages
```

---

## 🏗️ How content is built

```
  content/*.json ──▶ node tools/build-data.js ──▶ webapp/js/data.js      (CLF)
   (edit here)                                  └▶ webapp/js/data-saa.js  (SAA)
                         │
                         ▼
               node tools/validate-data.js --coverage
                         │
                         ▼  git push main
      GitHub Actions: validate → make-audio.py (webapp/audio/, not committed) → Pages
```

```bash
node tools/build-data.js                 # rebuild data*.js from content/
node tools/validate-data.js --coverage   # must print OK
node tests/smoke.mjs                     # e2e (Playwright deps outside repo, see file header)
```

> ⚠️ Never hand-edit `webapp/js/data*.js` — they are regenerated.

---

## 🖥️ Legacy terminal tools (CLF only)

| Tool | Command | Content |
|---|---|---|
| 🃏 Flashcard quiz | `bash flashcards/flashcard-quiz.sh [compute\|storage\|database\|network\|security\|billing]` | ~65 cards |
| 📝 Practice exam | `bash quizzes/practice-exam.sh [domain1..domain4]` | ~118 questions |

## 📄 CLF reference sheets

| File | Weight |
|---|---|
| [01 · Cloud Concepts](cheat-sheets/01-cloud-concepts.md) | 24% |
| [02 · Security & Compliance](cheat-sheets/02-security-and-compliance.md) | 30% |
| [03 · Technology & Services](cheat-sheets/03-cloud-technology-and-services.md) | 34% |
| [04 · Billing, Pricing & Support](cheat-sheets/04-billing-pricing-and-support.md) | 12% |
| [📖 Terminology guide](terminology/aws-terminology-guide.md) | Term · Definition · Analogy |

## 🔗 Key resources

| Resource | Link |
|---|---|
| Maarek — Ultimate AWS Cloud Practitioner (Udemy) | [udemy.com/course/aws-certified-cloud-practitioner-new](https://www.udemy.com/course/aws-certified-cloud-practitioner-new/) |
| Maarek — Ultimate AWS Solutions Architect Associate (Udemy) | [udemy.com/course/aws-certified-solutions-architect-associate-saa-c03](https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/) |
| Official exam guides | [AWS Certification Exam Guides](https://docs.aws.amazon.com/aws-certification/latest/examguides/aws-certification-exam-guides.html) |
| AWS Free Tier (hands-on) | [aws.amazon.com/free](https://aws.amazon.com/free/) |

## 💡 Top exam tips

1. **Shared Responsibility** — if you can configure it, it's *your* responsibility.
2. **Security Groups vs NACLs** — SG stateful, instance-level, allow only; NACL stateless, subnet-level, allow + deny.
3. **CloudWatch vs CloudTrail** — Watch = metrics; Trail = who did what.
4. **EC2 pricing** — On-Demand · Savings Plans/Reserved · Spot (cheapest, interruptible).
5. **S3 classes** — Standard → IA → Glacier tiers: colder = cheaper storage, slower retrieval.
6. **Support plans** — TAM = Enterprise (On-Ramp gets a pool of TAMs).
7. **Data transfer** — in is free, out costs.
8. **Well-Architected** — 6 pillars incl. Sustainability.
9. **IAM** — no root for daily work, MFA, least privilege.
10. **SAA** — "Choose TWO" questions are all-or-nothing; read for the *requirement* (cost vs. resilience vs. performance).
