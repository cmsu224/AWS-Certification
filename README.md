# AWS Cloud Practitioner (CLF-C02) — Complete Study Kit

> A comprehensive, zero-guesswork study system with 300+ practice questions, hands-on labs, video guides, and a mobile-friendly web app.

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

### 30-Day Study Plan (Start Here!)
| File | Description |
|------|-------------|
| [30-Day Game Plan](study-plan/30-day-gameplan.md) | Day-by-day instructions: what to read, watch, do, and quiz — every single day |

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

### Interactive Terminal Tools
| Tool | Command | Description |
|------|---------|-------------|
| Flashcard Quiz | `bash flashcards/flashcard-quiz.sh` | 64 term-by-term recall flashcards with scoring |
| Practice Exam | `bash quizzes/practice-exam.sh` | 120+ multiple-choice questions with explanations |

### Mobile-Friendly Web App
| Tool | How to Open | Description |
|------|-------------|-------------|
| Study Web App | Open `webapp/index.html` in any browser | 300+ questions, flashcards, progress tracking, exam simulation |

> **Phone access:** Open `webapp/index.html` in your phone's browser. On iOS, tap Share → "Add to Home Screen". On Android, tap the menu → "Add to Home Screen". It works offline!

---

## Key Resources (Free)

| Resource | Link |
|----------|------|
| freeCodeCamp Full Course (14 hrs) | [YouTube — Andrew Brown / ExamPro](https://youtu.be/NhDYbskXRgc) |
| AWS Cloud Practitioner Essentials | [AWS Skill Builder](https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials) |
| Official CLF-C02 Exam Guide (PDF) | [AWS Exam Guide](https://d1.awsstatic.com/training-and-certification/docs-cloud-practitioner/AWS-Certified-Cloud-Practitioner_Exam-Guide.pdf) |
| Official Practice Questions | [AWS Skill Builder](https://explore.skillbuilder.aws/learn/course/external/view/elearning/14050/aws-certified-cloud-practitioner-official-practice-question-set-clf-c02-english) |
| AWS Free Tier (Hands-On) | [aws.amazon.com/free](https://aws.amazon.com/free/) |

---

## How to Use the Interactive Tools

### Flashcard Quiz (Terminal)
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

### Practice Exam (Terminal)
```bash
# Full 20-question mini exam (mixed domains)
bash quizzes/practice-exam.sh

# Specific domain
bash quizzes/practice-exam.sh domain1   # Cloud Concepts
bash quizzes/practice-exam.sh domain2   # Security & Compliance
bash quizzes/practice-exam.sh domain3   # Technology & Services
bash quizzes/practice-exam.sh domain4   # Billing & Pricing
```

### Web App
```bash
# Open in your default browser (or just double-click the file)
open webapp/index.html         # macOS
xdg-open webapp/index.html    # Linux
start webapp/index.html        # Windows
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
