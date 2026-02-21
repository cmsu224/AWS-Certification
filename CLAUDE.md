# CLAUDE.md — AI Assistant Guide for AWS-Certification

## Project Overview

This is an **AWS Cloud Practitioner (CLF-C02) study kit** — a comprehensive repository with visual cheat sheets, a terminology guide, interactive bash-based study tools, a 30-day study plan, and a mobile-friendly web app with 300+ practice questions.

## Repository Structure

```
AWS-Certification/
├── README.md                                  # Main entry point: exam overview, resources, usage
├── CLAUDE.md                                  # This file
├── study-plan/
│   └── 30-day-gameplan.md                     # Day-by-day study plan with videos, hands-on labs, quizzes
├── cheat-sheets/                              # Visual markdown cheat sheets (one per exam domain)
│   ├── 01-cloud-concepts.md                   # Domain 1 — Cloud Concepts (24% of exam)
│   ├── 02-security-and-compliance.md          # Domain 2 — Security & Compliance (30% of exam)
│   ├── 03-cloud-technology-and-services.md    # Domain 3 — Cloud Technology & Services (34% of exam)
│   └── 04-billing-pricing-and-support.md      # Domain 4 — Billing, Pricing & Support (12% of exam)
├── terminology/
│   └── aws-terminology-guide.md               # AWS terms with real-world analogies (7 sections)
├── flashcards/
│   └── flashcard-quiz.sh                      # Interactive terminal flashcard quiz (64 cards)
├── quizzes/
│   └── practice-exam.sh                       # Interactive terminal practice exam (120+ questions)
└── webapp/                                    # Mobile-friendly PWA study app
    ├── index.html                             # Main app shell
    ├── manifest.json                          # PWA manifest for "Add to Home Screen"
    ├── sw.js                                  # Service worker for offline support
    ├── css/
    │   └── style.css                          # Mobile-first responsive styles
    └── js/
        ├── app.js                             # App logic: navigation, quiz engine, flashcards, progress
        └── data.js                            # All question & flashcard data (300+ questions, 100+ cards)
```

## Content Conventions

### Study Plan (`study-plan/`)
- Single comprehensive file with 30 days of instructions
- Each day has: Watch (video timestamps), Read (cheat sheet sections), Hands-On (AWS console labs), Study (key concepts), Quiz (specific practice)
- Links to free external resources (freeCodeCamp YouTube, AWS Skill Builder)

### Cheat Sheets (`cheat-sheets/`)
- Each file covers one CLF-C02 exam domain
- Numbered with prefix `01-` through `04-` matching domain order
- Use **ASCII box-drawing diagrams** extensively for visual learning (built with `┌─┐│└─┘═╔╗╚╝` characters)
- Include markdown tables for quick-reference comparisons
- Include memory tricks and analogies (e.g., "Think of renting an apartment")
- Each cheat sheet opens with the domain name, exam weight percentage, and a note about importance

### Terminology Guide (`terminology/`)
- Single file with 7 sections: Core Cloud, Compute, Storage, Database, Networking, Security, Management/Monitoring, Billing
- Every term has three columns: **Term | Definition | Analogy**
- Ends with an acronym decoder table

### Interactive Terminal Tools (`flashcards/` and `quizzes/`)
- **Bash scripts** — no external dependencies, use only standard bash features
- Use ANSI color codes for terminal formatting (`\033[0;31m` style)
- Both scripts accept an optional category/domain argument to filter content
- Data is stored as pipe-delimited (`|`) strings in bash arrays within each script
- Flashcard format: `"TERM|DEFINITION|CATEGORY"` with categories: compute, storage, database, network, security, billing
- Practice exam format: `"QUESTION|A|B|C|D|CORRECT_LETTER|EXPLANATION|DOMAIN"` with domains: domain1-domain4
- Both include shuffle logic, scoring, progress tracking, and a review section for missed items

### Web App (`webapp/`)
- **No build step, no dependencies** — pure HTML/CSS/JS, works by opening index.html
- Mobile-first responsive design (dark theme)
- PWA with service worker for offline support and "Add to Home Screen"
- Features: Dashboard, Flashcards (by category), Practice Quiz (by domain, quick, full exam), Progress tracking
- All data lives in `js/data.js` as JS objects (FLASHCARDS array, QUESTIONS array)
- Question format: `{ question, options: [4 strings], answer: index, explanation, domain }`
- Flashcard format: `{ term, definition, category }`
- Progress stored in localStorage (`aws-study-progress`)
- No external API calls — everything is local

## Running the Interactive Tools

```bash
# Flashcard quiz — all categories or filtered
bash flashcards/flashcard-quiz.sh
bash flashcards/flashcard-quiz.sh compute

# Practice exam — full 20-question exam or by domain
bash quizzes/practice-exam.sh
bash quizzes/practice-exam.sh domain2

# Web app — open in browser
open webapp/index.html       # macOS
start webapp/index.html      # Windows
```

## Key Conventions for AI Assistants

### When Adding New Content
- **Study plan**: Keep the day-by-day format. Each day has Watch/Read/Hands-On/Study/Quiz sections.
- **Cheat sheets**: Maintain the ASCII diagram style. Use box-drawing characters, not plain dashes. Include analogies and "memory tricks" where helpful.
- **Terminology**: Follow the three-column format (Term | Definition | Analogy). Keep analogies relatable and concise.
- **Flashcards (bash)**: Add entries to `CARDS` array in `flashcard-quiz.sh` using pipe-delimited format.
- **Practice exam (bash)**: Add entries to `QUESTIONS` array in `practice-exam.sh` using 8-field pipe-delimited format.
- **Web app questions**: Add entries to `QUESTIONS` array in `webapp/js/data.js` as JS objects.
- **Web app flashcards**: Add entries to `FLASHCARDS` array in `webapp/js/data.js` as JS objects.
- **File naming**: Cheat sheets use kebab-case with a numeric prefix (e.g., `05-new-topic.md`).

### When Modifying Bash Scripts
- No external dependencies — scripts must work on a standard bash installation
- Preserve the ANSI color scheme (RED, GREEN, YELLOW, BLUE, CYAN, BOLD, NC)
- Test that pipe-delimited data strings don't contain unescaped pipe characters in content fields
- The shuffle algorithm uses `$RANDOM` — don't replace with external tools

### When Modifying the Web App
- No build tools or package managers — keep it as pure HTML/CSS/JS
- Mobile-first design — test on small screens
- All data in `data.js` — no external API calls
- Progress persists via localStorage
- Service worker caches all assets for offline use — update CACHE_NAME version if assets change

### General Guidelines
- This repo has **no tests, no CI, no package manager, and no build step**
- All content targets the CLF-C02 exam specifically
- The four exam domains and their weights are: Cloud Concepts (24%), Security & Compliance (30%), Cloud Technology & Services (34%), Billing/Pricing/Support (12%)
- README.md serves as the main navigation hub — update its tables and links when adding new files
