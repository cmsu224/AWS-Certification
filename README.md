# AWS Cloud Practitioner (CLF-C02) — Study Kit

> A visual, hands-on study system built for learners who remember by doing.

```
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║    AWS CERTIFIED CLOUD PRACTITIONER                          ║
  ║    ─────────────────────────────────                         ║
  ║    Exam Code: CLF-C02                                        ║
  ║    Questions: 65 (50 scored + 15 unscored)                   ║
  ║    Time: 90 minutes                                          ║
  ║    Passing Score: 700 / 1000 (~70%)                          ║
  ║    Cost: $100 USD                                            ║
  ║                                                              ║
  ╚══════════════════════════════════════════════════════════════╝
```

---

## Exam Domains & Weights

```
  ┌──────────────────────────────────────────────────────┐
  │                                                      │
  │  Domain 1: Cloud Concepts .............. 24%  ████░  │
  │  Domain 2: Security & Compliance ....... 30%  █████  │
  │  Domain 3: Technology & Services ....... 34%  ██████ │
  │  Domain 4: Billing & Pricing ........... 12%  ██░░░  │
  │                                                      │
  │  Focus most study time on Domains 2 & 3 (64% total)  │
  │                                                      │
  └──────────────────────────────────────────────────────┘
```

---

## What's In This Repo

### Cheat Sheets (Visual diagrams for each domain)
| File | Domain | Weight |
|------|--------|--------|
| [01 - Cloud Concepts](cheat-sheets/01-cloud-concepts.md) | Cloud Concepts | 24% |
| [02 - Security & Compliance](cheat-sheets/02-security-and-compliance.md) | Security & Compliance | 30% |
| [03 - Technology & Services](cheat-sheets/03-cloud-technology-and-services.md) | Cloud Technology & Services | 34% |
| [04 - Billing & Pricing](cheat-sheets/04-billing-pricing-and-support.md) | Billing, Pricing & Support | 12% |

### Terminology Guide
| File | Description |
|------|-------------|
| [AWS Terminology Guide](terminology/aws-terminology-guide.md) | Every key term mapped to a real-world analogy |

### Interactive Tools (run in your terminal!)
| Tool | Command | Description |
|------|---------|-------------|
| Flashcard Quiz | `bash flashcards/flashcard-quiz.sh` | Term-by-term recall practice with scoring |
| Practice Exam | `bash quizzes/practice-exam.sh` | Multiple-choice questions with explanations |

---

## Suggested Study Plan

### Week 1-2: Build the Foundation
```
  Day 1-2:  Read cheat sheet 01 (Cloud Concepts)
            Run: bash flashcards/flashcard-quiz.sh compute

  Day 3-5:  Read cheat sheet 02 (Security & Compliance)  ← BIGGEST domain
            Run: bash flashcards/flashcard-quiz.sh security

  Day 6-7:  Review terminology guide for Weeks 1-2 topics
            Run: bash quizzes/practice-exam.sh domain1
            Run: bash quizzes/practice-exam.sh domain2
```

### Week 3-4: Services Deep Dive
```
  Day 8-10: Read cheat sheet 03 (Technology & Services)  ← MOST content
            Run: bash flashcards/flashcard-quiz.sh compute
            Run: bash flashcards/flashcard-quiz.sh storage
            Run: bash flashcards/flashcard-quiz.sh database
            Run: bash flashcards/flashcard-quiz.sh network

  Day 11-12: Read cheat sheet 04 (Billing & Pricing)
             Run: bash flashcards/flashcard-quiz.sh billing

  Day 13-14: Full review of terminology guide
             Run: bash quizzes/practice-exam.sh domain3
             Run: bash quizzes/practice-exam.sh domain4
```

### Week 5: Practice & Review
```
  Day 15-16: Run full practice exams
             bash quizzes/practice-exam.sh
             Target: 80%+ before taking the real exam

  Day 17-18: Focus on weak areas (check your review piles)
             Re-run flashcards for missed categories

  Day 19-20: Final review of all cheat sheets
             One last full practice exam

  Day 21:    EXAM DAY — you've got this!
```

---

## How to Use the Interactive Tools

### Flashcard Quiz
```bash
# All categories (shuffled)
bash flashcards/flashcard-quiz.sh

# Specific category
bash flashcards/flashcard-quiz.sh compute
bash flashcards/flashcard-quiz.sh storage
bash flashcards/flashcard-quiz.sh database
bash flashcards/flashcard-quiz.sh network
bash flashcards/flashcard-quiz.sh security
bash flashcards/flashcard-quiz.sh billing
```

### Practice Exam
```bash
# Full 20-question mini exam (mixed domains)
bash quizzes/practice-exam.sh

# Specific domain
bash quizzes/practice-exam.sh domain1   # Cloud Concepts
bash quizzes/practice-exam.sh domain2   # Security & Compliance
bash quizzes/practice-exam.sh domain3   # Technology & Services
bash quizzes/practice-exam.sh domain4   # Billing & Pricing
```

---

## Quick Reference: Top 10 Exam Tips

1. **Shared Responsibility Model** — Know it cold. "If you can configure it in the console, it's YOUR responsibility."
2. **Security Groups vs NACLs** — SGs are stateful (instance level, allow only). NACLs are stateless (subnet level, allow + deny).
3. **CloudWatch vs CloudTrail** — Watch = performance metrics. Trail = audit log (who did what).
4. **EC2 pricing** — On-Demand (flexible), Reserved/Savings Plans (cheap, committed), Spot (cheapest, interruptible).
5. **S3 storage classes** — Standard → IA → Glacier → Deep Archive. Colder = cheaper storage, slower retrieval.
6. **Always Free vs 12-Month Free** — Lambda and DynamoDB are always free (within limits). EC2 t2.micro is 12-month free.
7. **Support Plans** — TAM = Enterprise only. Full Trusted Advisor = Business or Enterprise.
8. **Data transfer** — IN is free. OUT costs money.
9. **Well-Architected Framework** — 6 pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability.
10. **IAM best practice** — Never use root for daily tasks. Use MFA. Apply least privilege.
