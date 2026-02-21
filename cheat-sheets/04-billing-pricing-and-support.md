# Domain 4: Billing, Pricing & Support (12% of Exam)

> Smallest domain but easy points — learn these and lock in 12%.

## AWS Free Tier

```
┌──────────────────────────────────────────────────────────────────┐
│                      AWS FREE TIER                                │
│                                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐        │
│  │ ALWAYS FREE   │  │ 12 MONTHS     │  │ TRIALS        │        │
│  │               │  │ FREE          │  │               │        │
│  │ Never expires │  │ After signup  │  │ Short-term    │        │
│  │               │  │               │  │ free trials   │        │
│  │ • Lambda:     │  │ • EC2: 750    │  │               │        │
│  │   1M requests │  │   hrs/month   │  │ • SageMaker   │        │
│  │   /month      │  │   (t2.micro)  │  │ • Redshift    │        │
│  │               │  │               │  │ • GuardDuty   │        │
│  │ • DynamoDB:   │  │ • S3: 5GB     │  │               │        │
│  │   25GB        │  │               │  │               │        │
│  │               │  │ • RDS: 750    │  │               │        │
│  │ • SNS:        │  │   hrs/month   │  │               │        │
│  │   1M publishes│  │               │  │               │        │
│  │               │  │ • CloudFront: │  │               │        │
│  │ • CloudWatch: │  │   50GB out    │  │               │        │
│  │   10 alarms   │  │               │  │               │        │
│  └───────────────┘  └───────────────┘  └───────────────┘        │
│                                                                   │
│  ⚠ WATCH OUT: Easy to accidentally exceed free tier!             │
│  Use AWS Budgets + Billing Alerts to avoid surprises             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## AWS Pricing Models

```
┌──────────────────────────────────────────────────────────────────┐
│               KEY PRICING PRINCIPLES                              │
│                                                                   │
│  1. PAY AS YOU GO       No upfront cost, pay for what you use    │
│  2. PAY LESS WHEN       Volume discounts kick in as you          │
│     YOU USE MORE        use more                                  │
│  3. PAY LESS WITH       Reserve capacity for lower rates         │
│     COMMITMENT                                                    │
│  4. DATA TRANSFER IN    FREE (almost always)                     │
│  5. DATA TRANSFER OUT   COSTS MONEY                              │
│                                                                   │
│                    ┌────────┐                                     │
│   Data IN → FREE   │  AWS   │  Data OUT → COSTS $$$              │
│   ─────────────►   │  Cloud │  ──────────────────►               │
│                    └────────┘                                     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### How Key Services Are Priced

```
┌────────────────────┬──────────────────────────────────────┐
│ Service            │ You Pay For                          │
├────────────────────┼──────────────────────────────────────┤
│ EC2                │ Instance type × hours running        │
│                    │ + EBS storage + data transfer out    │
├────────────────────┼──────────────────────────────────────┤
│ S3                 │ Storage (per GB) + requests          │
│                    │ + data transfer out                  │
├────────────────────┼──────────────────────────────────────┤
│ Lambda             │ Number of requests + compute time    │
│                    │ (per millisecond)                    │
├────────────────────┼──────────────────────────────────────┤
│ RDS                │ Instance type × hours + storage      │
│                    │ + data transfer out                  │
├────────────────────┼──────────────────────────────────────┤
│ DynamoDB           │ Read/write request units + storage   │
├────────────────────┼──────────────────────────────────────┤
│ CloudFront         │ Data transfer out + requests         │
└────────────────────┴──────────────────────────────────────┘
```

---

## Billing & Cost Management Tools

```
┌──────────────────────────────────────────────────────────────────┐
│                  BILLING & COST TOOLS                             │
│                                                                   │
│  ┌──────────────────────┐    "How much am I spending?"           │
│  │ AWS Billing Dashboard│    Overview of current charges          │
│  └──────────────────────┘                                        │
│                                                                   │
│  ┌──────────────────────┐    "What exactly am I paying for?"     │
│  │ AWS Cost Explorer    │    Visualize & analyze spending         │
│  │                      │    over time, forecast future costs     │
│  └──────────────────────┘                                        │
│                                                                   │
│  ┌──────────────────────┐    "Alert me when I spend too much"    │
│  │ AWS Budgets          │    Set custom spending thresholds       │
│  │                      │    Get email/SNS alerts                 │
│  └──────────────────────┘                                        │
│                                                                   │
│  ┌──────────────────────┐    "How much will this cost?"          │
│  │ AWS Pricing Calc.    │    Estimate costs BEFORE you deploy    │
│  └──────────────────────┘                                        │
│                                                                   │
│  ┌──────────────────────┐    "Show me the detailed bill"         │
│  │ Cost & Usage Report  │    Most detailed cost data             │
│  │ (CUR)                │    Can send to S3 for analysis         │
│  └──────────────────────┘                                        │
│                                                                   │
│  ┌──────────────────────┐    "Am I wasting money?"               │
│  │ Trusted Advisor      │    Recommends cost savings,            │
│  │ (cost pillar)        │    idle resources, etc.                │
│  └──────────────────────┘                                        │
│                                                                   │
│  REMEMBER THE FLOW:                                              │
│  Pricing Calculator → estimate BEFORE                            │
│  Budgets → alert DURING                                          │
│  Cost Explorer → analyze AFTER                                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## AWS Support Plans

```
┌──────────────────────────────────────────────────────────────────┐
│                    AWS SUPPORT PLANS                              │
│                                                                   │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────────┐      │
│  │ BASIC   │  │DEVELOPER│  │ BUSINESS │  │ ENTERPRISE   │      │
│  │         │  │         │  │          │  │              │      │
│  │  FREE   │  │  $29/mo │  │ $100/mo+ │  │ $15,000/mo+  │      │
│  │         │  │         │  │          │  │              │      │
│  │ Trusted │  │ Email   │  │ 24/7     │  │ TAM          │      │
│  │ Advisor │  │ support │  │ phone +  │  │ (Technical   │      │
│  │ (7 core │  │ during  │  │ email +  │  │  Account     │      │
│  │ checks) │  │ business│  │ chat     │  │  Manager)    │      │
│  │         │  │ hours   │  │          │  │              │      │
│  │ Health  │  │ 1 person│  │ Trusted  │  │ ALL Trusted  │      │
│  │ Dashboard│ │ can open│  │ Advisor  │  │ Advisor      │      │
│  │         │  │ tickets │  │ (full)   │  │ checks       │      │
│  │ No tech │  │         │  │          │  │              │      │
│  │ support │  │ General │  │ Response:│  │ Response:    │      │
│  │         │  │ guidance│  │ 1hr for  │  │ 15 min for   │      │
│  │         │  │         │  │ prod down│  │ biz critical │      │
│  └─────────┘  └─────────┘  └──────────┘  └──────────────┘      │
│                                                                   │
│  KEY THINGS TO REMEMBER:                                         │
│  • Basic = FREE, everyone gets it                                │
│  • TAM (Technical Account Manager) = Enterprise only             │
│  • Full Trusted Advisor = Business or Enterprise                 │
│  • Concierge Support = Enterprise only                           │
│  • Infrastructure Event Management = Business (extra) /          │
│    Enterprise (included)                                          │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## AWS Organizations & Consolidated Billing

```
┌──────────────────────────────────────────────────────────────────┐
│                  AWS ORGANIZATIONS                                │
│                                                                   │
│         ┌──────────────────────┐                                 │
│         │   Management Account │  ← Pays ALL the bills           │
│         │   (Payer Account)    │                                 │
│         └──────────┬───────────┘                                 │
│                    │                                              │
│         ┌──────────┴───────────┐                                 │
│         │                      │                                  │
│    ┌────┴─────┐          ┌─────┴────┐                            │
│    │ OU: Dev  │          │ OU: Prod │    OU = Organizational     │
│    ├──────────┤          ├──────────┤         Unit                │
│    │ Acct 1   │          │ Acct 3   │                            │
│    │ Acct 2   │          │ Acct 4   │                            │
│    └──────────┘          └──────────┘                            │
│                                                                   │
│  BENEFITS:                                                       │
│  • ONE bill for all accounts (Consolidated Billing)              │
│  • Volume discounts across all accounts                          │
│  • SCPs to restrict what accounts can do                         │
│  • Centralized management                                        │
│                                                                   │
│  CONSOLIDATED BILLING EXAMPLE:                                   │
│  Account A uses 3TB S3  ┐                                        │
│  Account B uses 4TB S3  ├─ Combined 10TB → better discount!     │
│  Account C uses 3TB S3  ┘                                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Cost Optimization Strategies

```
┌──────────────────────────────────────────────────────────────────┐
│              HOW TO SAVE MONEY ON AWS                             │
│                                                                   │
│  1. RIGHT-SIZING                                                 │
│     Don't use an m5.xlarge when t3.micro will do                 │
│     Use CloudWatch to check utilization                          │
│                                                                   │
│  2. RESERVED INSTANCES / SAVINGS PLANS                           │
│     Commit 1-3 years for up to 72% off                           │
│                                                                   │
│  3. SPOT INSTANCES                                               │
│     Use spare capacity for up to 90% off                         │
│     (for fault-tolerant workloads)                               │
│                                                                   │
│  4. S3 LIFECYCLE POLICIES                                        │
│     Auto-move old data to cheaper storage tiers                  │
│     Standard → IA → Glacier → Deep Archive                      │
│                                                                   │
│  5. TURN OFF IDLE RESOURCES                                      │
│     Stop/terminate unused EC2 instances                          │
│     Delete unused EBS volumes                                    │
│                                                                   │
│  6. USE SERVERLESS                                               │
│     Lambda, Fargate, DynamoDB = pay only when used               │
│                                                                   │
│  7. USE AWS BUDGETS                                              │
│     Set alerts so you don't get surprise bills                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```
