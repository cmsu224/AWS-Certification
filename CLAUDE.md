# CLAUDE.md — AI Assistant Guide for AWS-Certification

## Project Overview

This is an **AWS Cloud Practitioner (CLF-C02) study kit** — a documentation-only repository with no application code, no build system, and no dependencies. It contains visual cheat sheets, a terminology guide, and interactive bash-based study tools for the AWS Certified Cloud Practitioner exam.

## Repository Structure

```
AWS-Certification/
├── README.md                                  # Main entry point: exam overview, study plan, usage instructions
├── CLAUDE.md                                  # This file
├── cheat-sheets/                              # Visual markdown cheat sheets (one per exam domain)
│   ├── 01-cloud-concepts.md                   # Domain 1 — Cloud Concepts (24% of exam)
│   ├── 02-security-and-compliance.md          # Domain 2 — Security & Compliance (30% of exam)
│   ├── 03-cloud-technology-and-services.md    # Domain 3 — Cloud Technology & Services (34% of exam)
│   └── 04-billing-pricing-and-support.md      # Domain 4 — Billing, Pricing & Support (12% of exam)
├── terminology/
│   └── aws-terminology-guide.md               # AWS terms with real-world analogies (7 sections)
├── flashcards/
│   └── flashcard-quiz.sh                      # Interactive terminal flashcard quiz
└── quizzes/
    └── practice-exam.sh                       # Interactive terminal practice exam (multiple choice)
```

## Content Conventions

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

### Interactive Tools (`flashcards/` and `quizzes/`)
- **Bash scripts** — no external dependencies, use only standard bash features
- Use ANSI color codes for terminal formatting (`\033[0;31m` style)
- Both scripts accept an optional category/domain argument to filter content
- Data is stored as pipe-delimited (`|`) strings in bash arrays within each script
- Flashcard format: `"TERM|DEFINITION|CATEGORY"` with categories: compute, storage, database, network, security, billing
- Practice exam format: `"QUESTION|A|B|C|D|CORRECT_LETTER|EXPLANATION|DOMAIN"` with domains: domain1-domain4
- Both include shuffle logic, scoring, progress tracking, and a review section for missed items

## Running the Interactive Tools

```bash
# Flashcard quiz — all categories or filtered
bash flashcards/flashcard-quiz.sh
bash flashcards/flashcard-quiz.sh compute

# Practice exam — full 20-question exam or by domain
bash quizzes/practice-exam.sh
bash quizzes/practice-exam.sh domain2
```

## Key Conventions for AI Assistants

### When Adding New Content
- **Cheat sheets**: Maintain the ASCII diagram style. Use box-drawing characters, not plain dashes. Include analogies and "memory tricks" where helpful.
- **Terminology**: Follow the three-column format (Term | Definition | Analogy). Keep analogies relatable and concise.
- **Flashcards**: Add new entries to the `CARDS` array in `flashcard-quiz.sh` using the pipe-delimited format. Assign to an existing category or create a new one.
- **Practice exam**: Add new entries to the `QUESTIONS` array in `practice-exam.sh` using the 8-field pipe-delimited format. Assign to an existing domain.
- **File naming**: Cheat sheets use kebab-case with a numeric prefix (e.g., `05-new-topic.md`).

### When Modifying Bash Scripts
- No external dependencies — scripts must work on a standard bash installation
- Preserve the ANSI color scheme (RED, GREEN, YELLOW, BLUE, CYAN, BOLD, NC)
- Test that pipe-delimited data strings don't contain unescaped pipe characters in content fields
- The shuffle algorithm uses `$RANDOM` — don't replace with external tools

### General Guidelines
- This repo has **no tests, no CI, no package manager, and no build step**
- All content targets the CLF-C02 exam specifically
- The four exam domains and their weights are: Cloud Concepts (24%), Security & Compliance (30%), Cloud Technology & Services (34%), Billing/Pricing/Support (12%)
- README.md serves as the main navigation hub — update its tables and links when adding new files
