# 30-Day AWS Cloud Practitioner (CLF-C02) Game Plan

> Zero guesswork. Every day tells you exactly what to read, watch, do, and quiz.
> Follow this plan and you WILL pass.

```
  ╔══════════════════════════════════════════════════════════════════╗
  ║                                                                  ║
  ║    30-DAY GAME PLAN → AWS CERTIFIED CLOUD PRACTITIONER           ║
  ║    ───────────────────────────────────────────────────            ║
  ║                                                                  ║
  ║    Week 1:  Cloud Foundations & Security         (Days 1–7)      ║
  ║    Week 2:  Core AWS Services + Hands-On         (Days 8–14)     ║
  ║    Week 3:  Advanced Services & Billing          (Days 15–21)    ║
  ║    Week 4:  Exam Mastery & Practice Exams        (Days 22–30)    ║
  ║                                                                  ║
  ║    Daily Time Commitment: 1.5 – 2.5 hours                       ║
  ║                                                                  ║
  ╚══════════════════════════════════════════════════════════════════╝
```

---

## Key Resources (Bookmark These Now)

| Resource | Link | Cost |
|----------|------|------|
| freeCodeCamp Full Course (14 hrs) | [YouTube — Andrew Brown / ExamPro](https://youtu.be/NhDYbskXRgc) | Free |
| AWS Cloud Practitioner Essentials | [AWS Skill Builder](https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials) | Free |
| AWS Free Tier Account | [aws.amazon.com/free](https://aws.amazon.com/free/) | Free |
| Official CLF-C02 Exam Guide (PDF) | [AWS Exam Guide](https://d1.awsstatic.com/training-and-certification/docs-cloud-practitioner/AWS-Certified-Cloud-Practitioner_Exam-Guide.pdf) | Free |
| Official Practice Questions | [AWS Skill Builder Exam Prep](https://explore.skillbuilder.aws/learn/course/external/view/elearning/14050/aws-certified-cloud-practitioner-official-practice-question-set-clf-c02-english) | Free |
| This Repo's Web App | Open `webapp/index.html` in your browser | Free |

---

## Before You Start: Day 0 (Setup)

**Time: 30 minutes**

- [ ] **Create an AWS Free Tier account** at [aws.amazon.com/free](https://aws.amazon.com/free/)
  - You'll need a credit card (you won't be charged if you stay within free tier limits)
  - Set your default Region to **us-east-1 (N. Virginia)** — most services are available here
- [ ] **Set a billing alarm** so you're never surprised:
  1. Go to **Billing Dashboard** → **Budgets** → **Create budget**
  2. Choose "Zero spend budget" → this alerts you if anything costs money
- [ ] **Download the official exam guide PDF** (link above) — skim the domain breakdown
- [ ] **Bookmark the freeCodeCamp video** (link above) — you'll watch sections each day

---

# WEEK 1: Cloud Foundations & Security (Days 1–7)

> Goal: Understand what cloud computing IS, how AWS is structured, and how security works.

---

## Day 1 — What Is Cloud Computing?

**Time: ~2 hours**

### Watch
- [ ] freeCodeCamp course: **0:00:00 – 1:30:00** (Cloud Concepts, Cloud Computing overview)
  - [YouTube — start from beginning](https://youtu.be/NhDYbskXRgc)

### Read
- [ ] Cheat sheet: [01-cloud-concepts.md](../cheat-sheets/01-cloud-concepts.md) — sections:
  - "What is Cloud Computing?"
  - "6 Advantages of Cloud Computing"
  - "Cloud Computing Models" (Public / Hybrid / Private)
  - "Cloud Service Models: IaaS vs PaaS vs SaaS"

### Study
- [ ] Memorize the **6 Advantages of Cloud Computing** — these appear on almost every exam
- [ ] Know the difference: **IaaS vs PaaS vs SaaS** (use the pizza analogy)

### Quiz
- [ ] Run: `bash flashcards/flashcard-quiz.sh compute` — focus on understanding, not memorizing

### Checkpoint
> Can you name all 6 advantages of cloud? Can you explain IaaS vs PaaS vs SaaS to a friend? If yes, move on.

---

## Day 2 — AWS Global Infrastructure & Well-Architected Framework

**Time: ~2 hours**

### Watch
- [ ] freeCodeCamp course: **1:30:00 – 3:00:00** (AWS Global Infrastructure, Regions, AZs)

### Read
- [ ] Cheat sheet: [01-cloud-concepts.md](../cheat-sheets/01-cloud-concepts.md) — sections:
  - "AWS Global Infrastructure" (Regions, AZs, Edge Locations)
  - "Well-Architected Framework (6 Pillars)"
  - "Key Concepts to Remember"

### Hands-On (15 min)
- [ ] **Log into AWS Console** → explore the Region dropdown (top-right)
  - Switch between regions — notice how services/resources change
  - Find your Region's AZ count under **EC2 Dashboard → Availability Zones**

### Study
- [ ] Memorize the **6 Pillars**: OSRPCS (Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability)
- [ ] Know **4 criteria for choosing a Region**: Compliance, Latency, Services available, Pricing

### Quiz
- [ ] Open the web app → take the **Domain 1: Cloud Concepts** quiz
- [ ] Target: 70%+ (it's OK to miss some — you're just starting)

### Checkpoint
> Can you explain the difference between a Region, AZ, and Edge Location? Can you name all 6 WAF pillars?

---

## Day 3 — Security: The Shared Responsibility Model

**Time: ~2 hours**

### Watch
- [ ] freeCodeCamp course: **3:00:00 – 4:30:00** (Security, Shared Responsibility)

### Read
- [ ] Cheat sheet: [02-security-and-compliance.md](../cheat-sheets/02-security-and-compliance.md) — sections:
  - "Shared Responsibility Model" — **THIS IS THE #1 MOST TESTED TOPIC**
  - "Who Is Responsible?" reference table

### Study
- [ ] **Golden rule**: "If you can configure it in the AWS console, it's YOUR responsibility"
- [ ] Memorize who is responsible for:
  - AWS: physical hardware, networking infrastructure, Regions/AZs, hypervisor
  - YOU: data, IAM, security groups, encryption, OS patching on EC2, firewall rules

### Practice
- [ ] For each item below, answer "AWS or Customer?" without looking:
  - Patching the guest OS on EC2 → _(Customer)_
  - Physical security of data centers → _(AWS)_
  - Configuring S3 bucket policies → _(Customer)_
  - Hardware maintenance of servers → _(AWS)_
  - Encryption of data at rest → _(Customer)_
  - Managing the hypervisor → _(AWS)_
  - Setting up MFA → _(Customer)_

### Checkpoint
> If someone asks you "who is responsible for X?" can you answer correctly every time? This topic alone is worth 5–8 exam questions.

---

## Day 4 — IAM Deep Dive

**Time: ~2.5 hours**

### Watch
- [ ] freeCodeCamp course: **4:30:00 – 5:30:00** (IAM section)

### Read
- [ ] Cheat sheet: [02-security-and-compliance.md](../cheat-sheets/02-security-and-compliance.md) — sections:
  - "IAM — Identity and Access Management"
  - IAM Security Tools table

### Hands-On (30 min) — **IAM Lab**
1. [ ] **Go to IAM Dashboard** → notice "Sign-in URL for IAM users" at the top
2. [ ] **Create an IAM User** called `study-user`
   - Console access: Yes, custom password
   - DO NOT give it AdministratorAccess
3. [ ] **Create an IAM Group** called `study-group`
   - Attach the policy: `AmazonS3ReadOnlyAccess`
   - Add `study-user` to the group
4. [ ] **Log in as `study-user`** using the IAM sign-in URL
   - Try to create an EC2 instance → you should get "Access Denied"
   - Try to list S3 buckets → it should work (read-only S3 access)
5. [ ] **Enable MFA on your root account** (if you haven't already)
   - IAM → Security credentials → Assign MFA device → use an authenticator app
6. [ ] **Clean up**: delete `study-user` and `study-group` when done

### Study
- [ ] Know the difference: **Users vs Groups vs Roles vs Policies**
- [ ] Know: **Never use root for daily tasks. Always enable MFA on root.**
- [ ] Know: **Roles** are for services (EC2 accessing S3), not for people

### Quiz
- [ ] Run: `bash flashcards/flashcard-quiz.sh security`

### Checkpoint
> Can you explain IAM Users, Groups, Roles, and Policies? Do you know when to use a Role vs a User?

---

## Day 5 — Security Services & Encryption

**Time: ~2 hours**

### Watch
- [ ] freeCodeCamp course: **5:30:00 – 6:30:00** (Security services, encryption, compliance)

### Read
- [ ] Cheat sheet: [02-security-and-compliance.md](../cheat-sheets/02-security-and-compliance.md) — sections:
  - "Security Services Cheat Sheet" (all 13 services)
  - "Encryption at Rest vs In Transit"
  - "Compliance Programs to Know"

### Study — **Know These Service Pairs:**
| If the question says... | The answer is... |
|------------------------|------------------|
| "audit log / who did what / API calls" | **CloudTrail** |
| "performance metrics / CPU / alarms" | **CloudWatch** |
| "DDoS protection / free" | **Shield Standard** |
| "DDoS protection / paid / advanced" | **Shield Advanced** |
| "web application attacks / SQL injection / XSS" | **WAF** |
| "threat detection / ML / suspicious activity" | **GuardDuty** |
| "vulnerability scanning / EC2 / containers" | **Inspector** |
| "sensitive data / PII in S3" | **Macie** |
| "manage encryption keys" | **KMS** |
| "download compliance reports / SOC / PCI" | **Artifact** |
| "track config changes" | **AWS Config** |

### Quiz
- [ ] Open the web app → take **Domain 2: Security & Compliance** quiz
- [ ] Target: 70%+

### Checkpoint
> Can you match each security service to its purpose? Do you know the difference between encryption at rest vs in transit?

---

## Day 6 — Network Security (SGs vs NACLs) + Review

**Time: ~2 hours**

### Watch
- [ ] freeCodeCamp course: **6:30:00 – 7:15:00** (VPC basics, security groups, NACLs)

### Read
- [ ] Cheat sheet: [02-security-and-compliance.md](../cheat-sheets/02-security-and-compliance.md) — sections:
  - "Network Security" (Security Groups vs NACLs)

### Study — **This comparison is heavily tested:**
```
  ┌──────────────────────────┬───────────────────────────┐
  │     Security Group       │        NACL                │
  ├──────────────────────────┼───────────────────────────┤
  │ Instance level           │ Subnet level               │
  │ ALLOW rules only         │ ALLOW and DENY rules       │
  │ Stateful                 │ Stateless                  │
  │ All rules evaluated      │ Rules processed in order   │
  └──────────────────────────┴───────────────────────────┘
```

### Review Day 1–5
- [ ] Re-read the terminology guide: [aws-terminology-guide.md](../terminology/aws-terminology-guide.md)
- [ ] Run ALL flashcard categories: `bash flashcards/flashcard-quiz.sh`
- [ ] Any card you miss → write it down and review before bed

### Checkpoint
> Security Groups vs NACLs — can you list 4 differences? Can you explain them to someone non-technical?

---

## Day 7 — Domain 1 & 2 Assessment

**Time: ~1.5 hours**

### Practice Exams
- [ ] Open the web app → take **Domain 1 quiz** (all questions)
- [ ] Open the web app → take **Domain 2 quiz** (all questions)
- [ ] Run: `bash quizzes/practice-exam.sh domain1`
- [ ] Run: `bash quizzes/practice-exam.sh domain2`

### Review
- [ ] For every question you got wrong, re-read the relevant section in the cheat sheet
- [ ] Make flashcards (physical or digital) for anything you keep missing

### Target Scores
- Domain 1: **80%+**
- Domain 2: **75%+**

> If you're below these targets, spend an extra day reviewing before moving on. There's buffer time in Week 4.

---

# WEEK 2: Core AWS Services + Hands-On (Days 8–14)

> Goal: Know every major AWS service, what it does, and WHEN to use it. Get hands-on experience.

---

## Day 8 — Compute: EC2

**Time: ~2.5 hours**

### Watch
- [ ] freeCodeCamp course: **7:15:00 – 8:30:00** (EC2 section)

### Read
- [ ] Cheat sheet: [03-cloud-technology-and-services.md](../cheat-sheets/03-cloud-technology-and-services.md) — sections:
  - "COMPUTE Services" → EC2, Instance Types, Pricing Models

### Hands-On (30 min) — **Launch Your First EC2 Instance**
1. [ ] Go to **EC2 Dashboard** → **Launch Instance**
2. [ ] Name: `study-instance`
3. [ ] AMI: Amazon Linux 2023 (Free Tier eligible)
4. [ ] Instance type: **t2.micro** (Free Tier!)
5. [ ] Key pair: Create a new one → download it (you'll need it to connect)
6. [ ] Security group: Allow SSH (port 22) from your IP only
7. [ ] **Launch!** → wait for "Running" status
8. [ ] **Connect**: Click "Connect" → use "EC2 Instance Connect" (browser-based)
9. [ ] In the terminal, run: `curl http://169.254.169.254/latest/meta-data/instance-type`
   - This shows you the instance metadata — the exam asks about this!
10. [ ] **IMPORTANT: Terminate the instance** when done (right-click → Terminate)

### Study — **EC2 Pricing Models (HEAVILY TESTED):**
```
  Most Expensive                              Cheapest
  ┌───────────┬───────────┬───────────┬───────────┐
  │ Dedicated │ On-Demand │ Reserved/ │   Spot    │
  │   Host    │           │ Savings   │ Instances │
  │   $$$$    │   $$$     │   $$      │    $      │
  └───────────┴───────────┴───────────┴───────────┘
```
- **On-Demand**: Pay by the hour/second, no commitment, most flexible
- **Reserved/Savings Plans**: 1 or 3 year commitment, up to 72% off
- **Spot**: Up to 90% off, but AWS can take it back with 2 min notice
- **Dedicated Host**: Physical server just for you, most expensive, for compliance/licensing

### Checkpoint
> Can you explain all 4 EC2 pricing models? When would you use each one?

---

## Day 9 — Storage: S3, EBS, EFS

**Time: ~2.5 hours**

### Watch
- [ ] freeCodeCamp course: **8:30:00 – 9:30:00** (S3, storage services)

### Read
- [ ] Cheat sheet: [03-cloud-technology-and-services.md](../cheat-sheets/03-cloud-technology-and-services.md) — sections:
  - "STORAGE Services" (S3, storage classes, EBS, EFS)

### Hands-On (30 min) — **S3 Lab**
1. [ ] Go to **S3** → **Create Bucket**
   - Name: `my-study-bucket-[your-name]-2025` (must be globally unique)
   - Region: us-east-1
   - **Block all public access**: Leave ON (this is a security best practice!)
2. [ ] **Upload a file** → any text file or image
3. [ ] Click the file → try to open the "Object URL" → you should get "Access Denied" (good — it's private!)
4. [ ] Explore **Properties** → notice Storage Class (Standard by default)
5. [ ] Explore **Management** → this is where you'd set lifecycle rules
6. [ ] **Create a lifecycle rule**:
   - Rule name: `archive-old-files`
   - Apply to all objects
   - Transition to Glacier after 90 days (just configure, don't need to wait)
7. [ ] **Delete the bucket** when done (must empty it first)

### Study — **S3 Storage Classes (ALWAYS on the exam):**
```
  HOT (Frequent Access)                    COLD (Archive)
  ◄──────────────────────────────────────────────────────►
  Standard → Standard-IA → One Zone-IA → Glacier → Deep Archive
  $$$$       $$$           $$             $         ¢

  Intelligent-Tiering = auto-moves between tiers
```

### Quiz
- [ ] Run: `bash flashcards/flashcard-quiz.sh storage`

### Checkpoint
> Can you list S3 storage classes from hottest to coldest? Do you know the difference between EBS, EFS, and S3?

---

## Day 10 — Databases: RDS, DynamoDB, Aurora

**Time: ~2 hours**

### Watch
- [ ] freeCodeCamp course: **9:30:00 – 10:15:00** (Databases section)

### Read
- [ ] Cheat sheet: [03-cloud-technology-and-services.md](../cheat-sheets/03-cloud-technology-and-services.md) — section:
  - "DATABASE Services"

### Hands-On (20 min) — **DynamoDB Lab**
1. [ ] Go to **DynamoDB** → **Create Table**
   - Table name: `study-table`
   - Partition key: `id` (String)
   - Leave defaults (On-demand capacity)
2. [ ] Go to **Explore table items** → **Create item**
   - Add: `id` = "1", then add a new attribute: `name` = "AWS Cloud Practitioner"
3. [ ] Query the table — see your item appear
4. [ ] Notice: No schema! You can add any attributes to any item (this is NoSQL)
5. [ ] **Delete the table** when done

### Study — **Database Quick Reference:**
| Service | Type | Key Fact |
|---------|------|----------|
| RDS | Relational (SQL) | MySQL, PostgreSQL, Oracle, SQL Server, MariaDB |
| Aurora | Relational (SQL) | AWS-built, 5x faster than MySQL, auto-scales |
| DynamoDB | NoSQL (key-value) | Serverless, single-digit ms, unlimited scale |
| ElastiCache | In-memory cache | Redis or Memcached, ultra-fast |
| Redshift | Data warehouse | Analytics, petabyte-scale, SQL queries |
| Neptune | Graph database | Relationships, social networks |

### Quiz
- [ ] Run: `bash flashcards/flashcard-quiz.sh database`

### Checkpoint
> SQL vs NoSQL — when would you pick each? What's the difference between RDS and DynamoDB?

---

## Day 11 — Networking: VPC, Subnets, Route 53

**Time: ~2.5 hours**

### Watch
- [ ] freeCodeCamp course: **10:15:00 – 11:15:00** (VPC, networking)

### Read
- [ ] Cheat sheet: [03-cloud-technology-and-services.md](../cheat-sheets/03-cloud-technology-and-services.md) — section:
  - "NETWORKING Services"

### Hands-On (30 min) — **VPC Lab**
1. [ ] Go to **VPC Dashboard** → notice the default VPC already exists
2. [ ] **Create a new VPC**:
   - Name: `study-vpc`
   - CIDR: `10.0.0.0/16`
3. [ ] **Create a public subnet**:
   - Name: `study-public-subnet`
   - CIDR: `10.0.1.0/24`
   - AZ: Pick any
4. [ ] **Create an Internet Gateway**:
   - Name: `study-igw`
   - Attach it to `study-vpc`
5. [ ] **Update the Route Table**:
   - Add route: `0.0.0.0/0` → `study-igw`
   - Associate with `study-public-subnet`
6. [ ] **Understand what you built**: A VPC with one public subnet that can reach the internet
7. [ ] **Clean up**: Delete the VPC (this deletes subnets, route tables, IGW)

### Study — **VPC Architecture:**
```
  ┌──────────────── VPC ──────────────────────┐
  │                                            │
  │  ┌─── Public Subnet ───┐  ┌─── Private ──┐│
  │  │  Web Server          │  │  Database    ││
  │  │  ↕ Internet Gateway  │  │  ↕ NAT GW   ││
  │  └─────────────────────┘  └──────────────┘│
  │                                            │
  └────────────────────────────────────────────┘
         ↕
     Internet
```
- **Public subnet** = has a route to an Internet Gateway
- **Private subnet** = no direct internet access, uses NAT Gateway for outbound
- **Route 53** = DNS (translates domain names → IP addresses)
- **CloudFront** = CDN (caches content at edge locations for speed)

### Quiz
- [ ] Run: `bash flashcards/flashcard-quiz.sh network`

---

## Day 12 — Serverless: Lambda, API Gateway, Fargate

**Time: ~2 hours**

### Watch
- [ ] freeCodeCamp course: **11:15:00 – 12:00:00** (Lambda, serverless, containers)

### Read
- [ ] Cheat sheet: [03-cloud-technology-and-services.md](../cheat-sheets/03-cloud-technology-and-services.md) — sections:
  - Lambda, ECS/EKS, Fargate, Elastic Beanstalk

### Hands-On (20 min) — **Lambda Lab**
1. [ ] Go to **Lambda** → **Create Function**
   - Name: `study-function`
   - Runtime: Python 3.12
   - Leave defaults
2. [ ] Replace the code with:
   ```python
   def lambda_handler(event, context):
       name = event.get('name', 'Cloud Practitioner')
       return {
           'statusCode': 200,
           'body': f'Hello, {name}! You are going to pass the exam!'
       }
   ```
3. [ ] Click **Deploy** → then **Test**
   - Create a test event: `{"name": "YourName"}`
   - Run it → see the response
4. [ ] Notice: No servers to manage! This is serverless.
5. [ ] **Delete the function** when done

### Study — **Compute Decision Tree:**
```
  Need full control over OS?          → EC2
  Just want to deploy code?           → Elastic Beanstalk
  Run code on events, no servers?     → Lambda
  Run containers, manage clusters?    → ECS / EKS
  Run containers, no servers?         → Fargate
  Simple website/app, fixed price?    → Lightsail
```

---

## Day 13 — Remaining Services + Migration

**Time: ~2 hours**

### Watch
- [ ] freeCodeCamp course: **12:00:00 – 13:00:00** (Management, AI/ML, Migration)

### Read
- [ ] Cheat sheet: [03-cloud-technology-and-services.md](../cheat-sheets/03-cloud-technology-and-services.md) — sections:
  - "AI/ML & Analytics Services"
  - "Migration & Transfer Services"
  - "Ways to Interact with AWS"

### Study — **AI/ML Service Quick Match:**
| If the question says... | Answer |
|------------------------|--------|
| "build/train ML models" | **SageMaker** |
| "image/video analysis, facial recognition" | **Rekognition** |
| "text sentiment analysis, NLP" | **Comprehend** |
| "chatbot / conversational AI" | **Lex** |
| "text → speech" | **Polly** |
| "speech → text" | **Transcribe** |
| "translate languages" | **Translate** |
| "extract text from documents/forms" | **Textract** |
| "intelligent document search" | **Kendra** |

### Study — **Migration: Snow Family**
```
  Small Data              Medium                  Massive
  ◄─────────────────────────────────────────────────────►
  Snowcone (8-14 TB)   Snowball Edge (80 TB)   Snowmobile (100 PB)
  Portable, rugged      Suitcase-sized          Literal shipping container
```

---

## Day 14 — Mid-Point Review + Practice Exam

**Time: ~2.5 hours**

### Review (1 hour)
- [ ] Re-read ALL 4 cheat sheets (skim — focus on tables and diagrams)
- [ ] Run ALL flashcard categories: `bash flashcards/flashcard-quiz.sh`
- [ ] Review the terminology guide: [aws-terminology-guide.md](../terminology/aws-terminology-guide.md)

### Practice Exam (1.5 hours)
- [ ] Open the web app → take a **Full Practice Exam** (65 questions)
- [ ] **Write down every question you got wrong**
- [ ] For each wrong answer, find the topic in the cheat sheets and re-read it

### Target Score
- **65%+** = On track (you still have 2 weeks!)
- **75%+** = Great shape
- **Below 60%** = Spend Day 15 reviewing weak domains before continuing

---

# WEEK 3: Advanced Services & Billing (Days 15–21)

> Goal: Master management/monitoring services and billing — these are "easy points" on the exam.

---

## Day 15 — CloudWatch, CloudTrail, Config

**Time: ~2 hours**

### Watch
- [ ] freeCodeCamp course: **13:00:00 – 13:45:00** (Management and monitoring)

### Read
- [ ] Cheat sheet: [03-cloud-technology-and-services.md](../cheat-sheets/03-cloud-technology-and-services.md) — section:
  - "MANAGEMENT & MONITORING"

### Hands-On (20 min) — **CloudWatch Lab**
1. [ ] Go to **CloudWatch** → **Dashboards** → explore the default metrics
2. [ ] Go to **Alarms** → **Create Alarm**
   - Select metric: EC2 → Per-Instance → CPUUtilization
   - Condition: Greater than 80%
   - Notification: Skip for now (or add your email via SNS)
   - This is how production teams monitor their servers!
3. [ ] Go to **CloudTrail** → **Event history**
   - Browse recent events — these are all the API calls in your account
   - Find your own actions (CreateBucket, LaunchInstance, etc.)
   - This is the audit log — "who did what, when"

### Study — **The Big Three (ALWAYS on the exam):**
```
  ┌─────────────────┬──────────────────┬─────────────────┐
  │   CloudWatch    │   CloudTrail     │   AWS Config    │
  ├─────────────────┼──────────────────┼─────────────────┤
  │ PERFORMANCE     │ AUDIT            │ COMPLIANCE      │
  │ CPU, memory,    │ Who did what?    │ Are resources   │
  │ request count   │ API call log     │ configured      │
  │ → metrics &     │ → event history  │ correctly?      │
  │   alarms        │                  │ → config rules  │
  └─────────────────┴──────────────────┴─────────────────┘
```
- **CloudWatch** = performance monitoring (think: watching a dashboard)
- **CloudTrail** = audit log (think: trail of footprints)
- **AWS Config** = configuration compliance (think: is this set up right?)

---

## Day 16 — Trusted Advisor, CloudFormation, Systems Manager

**Time: ~1.5 hours**

### Read
- [ ] Cheat sheet: [03-cloud-technology-and-services.md](../cheat-sheets/03-cloud-technology-and-services.md) — remaining management topics

### Hands-On (15 min)
1. [ ] Go to **Trusted Advisor** → explore the dashboard
   - Notice the 5 categories: Cost Optimization, Performance, Security, Fault Tolerance, Service Limits
   - Free tier (Basic/Developer support) only gets **7 core checks**
   - Business/Enterprise support gets **ALL checks**

### Study — **Trusted Advisor's 5 Categories** (memorize these):
1. **Cost Optimization** — are you wasting money?
2. **Performance** — can things run faster?
3. **Security** — are you exposed?
4. **Fault Tolerance** — will you survive a failure?
5. **Service Limits** — are you about to hit a limit?

### Study — **CloudFormation**
- Infrastructure as Code (IaC) — define ALL your resources in a YAML/JSON template
- Deploy, update, and delete entire stacks consistently
- Think of it as a "blueprint" for your infrastructure

---

## Day 17 — Billing & Pricing

**Time: ~2 hours**

### Watch
- [ ] freeCodeCamp course: **13:45:00 – end** (Billing, pricing, support plans)

### Read
- [ ] Cheat sheet: [04-billing-pricing-and-support.md](../cheat-sheets/04-billing-pricing-and-support.md) — sections:
  - "AWS Free Tier"
  - "AWS Pricing Models"
  - "Billing & Cost Management Tools"

### Hands-On (20 min) — **Billing Dashboard Lab**
1. [ ] Go to **Billing Dashboard** → explore your current costs
2. [ ] Go to **Cost Explorer** → enable it if not already
   - This is where you analyze past spending (after you've used AWS for a while)
3. [ ] Go to **AWS Pricing Calculator** at [calculator.aws](https://calculator.aws/)
   - Try estimating the cost of: 1 EC2 t3.medium instance running 24/7 in us-east-1
   - Add an RDS db.t3.micro MySQL instance
   - See the estimated monthly cost
4. [ ] Go to **Budgets** → verify your zero-spend budget is active

### Study — **The Billing Flow (memorize this):**
```
  BEFORE deploying     DURING usage        AFTER usage
  ┌───────────────┐   ┌──────────────┐   ┌──────────────┐
  │   Pricing     │   │   AWS        │   │   Cost       │
  │   Calculator  │──►│   Budgets    │──►│   Explorer   │
  │   (estimate)  │   │   (alerts)   │   │   (analyze)  │
  └───────────────┘   └──────────────┘   └──────────────┘
```

---

## Day 18 — Support Plans & Organizations

**Time: ~1.5 hours**

### Read
- [ ] Cheat sheet: [04-billing-pricing-and-support.md](../cheat-sheets/04-billing-pricing-and-support.md) — sections:
  - "AWS Support Plans"
  - "AWS Organizations & Consolidated Billing"
  - "Cost Optimization Strategies"

### Study — **Support Plans (ALWAYS on the exam):**
```
  ┌──────────┬──────────┬──────────┬────────────┐
  │  Basic   │Developer │ Business │ Enterprise │
  │  FREE    │  $29/mo  │ $100/mo+ │ $15,000/mo+│
  ├──────────┼──────────┼──────────┼────────────┤
  │ 7 core   │ Email    │ 24/7     │ 24/7       │
  │ Trusted  │ business │ phone,   │ phone,     │
  │ Advisor  │ hours    │ email,   │ email,     │
  │ checks   │ only     │ chat     │ chat       │
  │          │          │          │            │
  │ No tech  │ 1 person │ Full     │ Full       │
  │ support  │ can open │ Trusted  │ Trusted    │
  │          │ cases    │ Advisor  │ Advisor    │
  │          │          │          │            │
  │          │          │ 1 hr     │ 15 min     │
  │          │          │ response │ response   │
  │          │          │          │ + TAM      │
  │          │          │          │ + Concierge│
  └──────────┴──────────┴──────────┴────────────┘
```

**Key facts for the exam:**
- TAM (Technical Account Manager) = **Enterprise only**
- Full Trusted Advisor = **Business or Enterprise**
- Concierge Support = **Enterprise only**
- 15-min response for critical issues = **Enterprise only**

### Quiz
- [ ] Open the web app → take **Domain 4: Billing & Pricing** quiz
- [ ] Target: 80%+ (this is the easiest domain — grab these points!)

---

## Day 19 — Domain 3 Deep Practice

**Time: ~2 hours**

### Practice
- [ ] Open the web app → take **Domain 3: Technology & Services** quiz (ALL questions)
- [ ] This is the biggest domain (34%) — you need to nail it

### Review Strategy
- [ ] For each wrong answer:
  1. Identify the service
  2. Find it in the cheat sheet
  3. Read the description, key facts, and when to use it
  4. Say out loud: "Service X is for Y" (e.g., "Lambda is for running code without servers")

### Flashcard Marathon
- [ ] Run each category and aim for 85%+:
  - `bash flashcards/flashcard-quiz.sh compute`
  - `bash flashcards/flashcard-quiz.sh storage`
  - `bash flashcards/flashcard-quiz.sh database`
  - `bash flashcards/flashcard-quiz.sh network`

---

## Day 20 — Domain 4 + Cross-Domain Review

**Time: ~2 hours**

### Practice
- [ ] Open the web app → take **Domain 4: Billing & Pricing** quiz (ALL questions)
- [ ] Run: `bash flashcards/flashcard-quiz.sh billing`

### Cross-Domain Review
- [ ] Go through the terminology guide one more time
- [ ] Focus on commonly confused pairs:
  - CloudWatch vs CloudTrail
  - Security Groups vs NACLs
  - EBS vs EFS vs S3
  - Reserved Instances vs Savings Plans
  - Shield vs WAF
  - Inspector vs GuardDuty

---

## Day 21 — Full Practice Exam #1

**Time: ~2.5 hours**

### Exam Simulation
- [ ] Open the web app → take a **Full 65-Question Practice Exam**
- [ ] Simulate real conditions:
  - Set a timer for **90 minutes**
  - No notes, no cheat sheets
  - No looking up answers
  - Pick the best answer even if you're unsure

### After the Exam
- [ ] Record your score: ____%
- [ ] Write down your weak domains
- [ ] For EVERY wrong answer, create a flashcard or note

### Target
- **70%+ = You could pass today**, but keep practicing
- **80%+ = Strong position**
- **Below 65% = Don't panic** — you have 9 more days

---

# WEEK 4: Exam Mastery (Days 22–30)

> Goal: Drill practice exams until you consistently score 80%+. Eliminate weak spots.

---

## Day 22 — Weak Area Deep Dive

**Time: ~2 hours**

### Review
- [ ] Look at your Day 21 exam results
- [ ] Identify your **2 weakest topics** and spend 1 hour on each:
  - Re-read the relevant cheat sheet sections
  - Watch the corresponding freeCodeCamp section again
  - Take the domain-specific quiz in the web app

---

## Day 23 — Full Practice Exam #2

**Time: ~2 hours**

- [ ] Open the web app → **Full 65-Question Practice Exam** (different questions shuffled)
- [ ] 90-minute timer, no notes
- [ ] Record score: ____%
- [ ] Review all wrong answers

---

## Day 24 — Flashcard Marathon + AWS Skill Builder

**Time: ~2.5 hours**

- [ ] Take the official **AWS Practice Question Set** on Skill Builder:
  [AWS Official Practice Questions (CLF-C02)](https://explore.skillbuilder.aws/learn/course/external/view/elearning/14050/aws-certified-cloud-practitioner-official-practice-question-set-clf-c02-english)
- [ ] Run ALL flashcard categories — aim for **90%+ on every category**
- [ ] Any term you miss more than twice → write it on a sticky note and put it where you'll see it

---

## Day 25 — Full Practice Exam #3

**Time: ~2 hours**

- [ ] Open the web app → **Full 65-Question Practice Exam**
- [ ] 90-minute timer, no notes
- [ ] Record score: ____%
- [ ] You should be seeing improvement from Exam #1

---

## Day 26 — Hands-On Refresh + Weak Areas

**Time: ~2 hours**

### Quick Hands-On Review
Do these in 30 minutes — just to refresh your memory of the console:
- [ ] Launch and terminate an EC2 t2.micro
- [ ] Create and delete an S3 bucket
- [ ] Look at IAM policies and roles
- [ ] Check CloudTrail event history
- [ ] Browse Trusted Advisor dashboard

### Targeted Study
- [ ] Re-study any topics where you consistently score below 80%
- [ ] Focus on the **"tricky" exam topics**:
  - Shared Responsibility Model edge cases
  - When to use Reserved vs Savings Plans vs Spot
  - Which services are serverless (Lambda, DynamoDB, S3, Fargate)
  - Data transfer costs (IN = free, OUT = costs money)

---

## Day 27 — Full Practice Exam #4

**Time: ~2 hours**

- [ ] Open the web app → **Full 65-Question Practice Exam**
- [ ] 90-minute timer, no notes
- [ ] Record score: ____%

### Target: **80%+**
> If you're scoring 80%+ consistently, you are ready for the real exam.

---

## Day 28 — Final Review

**Time: ~2 hours**

### Speed Review
- [ ] Skim all 4 cheat sheets — focus on diagrams and tables (30 min)
- [ ] Run all flashcards one final time (20 min)
- [ ] Review the **Top 10 Exam Tips** in the README (5 min)
- [ ] Re-read the **security services quick match table** from Day 5 (5 min)
- [ ] Re-read the **EC2 pricing models** from Day 8 (5 min)
- [ ] Re-read the **support plans comparison** from Day 18 (5 min)

### Final Practice
- [ ] Take one more 20-question mixed quiz in the web app (15 min)
- [ ] You should feel confident on 80%+ of questions

---

## Day 29 — Rest & Exam Logistics

**Time: ~30 minutes**

- [ ] **Schedule your exam** (if you haven't already):
  - Go to [aws.amazon.com/certification](https://aws.amazon.com/certification/)
  - Sign in / create your AWS Certification account
  - Choose: Testing center or Online proctored (at home)
  - Cost: $100 USD
- [ ] **If testing at home**: Test your system requirements, webcam, microphone
- [ ] **If testing at a center**: Plan your route, arrive 15 min early
- [ ] **Bring**: Two forms of ID (one with photo)
- [ ] **Light review only** — don't cram. Trust your preparation.
- [ ] Get a good night's sleep!

---

## Day 30 — EXAM DAY

**Time: 90 minutes (exam) + travel/setup**

### Before the Exam
- [ ] Eat a good meal
- [ ] Quick 5-minute review of the **Top 10 Exam Tips**
- [ ] Remember: 65 questions, 90 minutes, ~70% to pass, 15 are unscored (you don't know which)

### During the Exam
- [ ] **Read every question carefully** — AWS loves "MOST" and "LEAST" and "BEST"
- [ ] **Flag and skip** hard questions — come back to them
- [ ] **Eliminate wrong answers** first — then pick from what's left
- [ ] **Don't overthink** — if you've studied, your first instinct is usually right
- [ ] **Use all 90 minutes** — review flagged questions at the end

### Key Exam Strategies
1. Look for keywords: "cost-effective" → Reserved/Savings/Spot, "audit" → CloudTrail, "performance" → CloudWatch
2. "Shared Responsibility" questions: if YOU configure it, it's YOUR responsibility
3. When in doubt between two answers, pick the one that's an **AWS managed service**
4. Never pick answers that say "root account" for daily use — that's always wrong

### After the Exam
- [ ] You'll get a pass/fail immediately on screen
- [ ] Detailed score report arrives by email within 5 business days
- [ ] **Celebrate!** You put in the work.

---

## Score Tracking Sheet

Use this to track your progress across practice exams:

| Exam | Date | Score | Weak Areas |
|------|------|-------|------------|
| Day 7 — Domain 1 | ___ | ___% | |
| Day 7 — Domain 2 | ___ | ___% | |
| Day 14 — Full Exam | ___ | ___% | |
| Day 18 — Domain 4 | ___ | ___% | |
| Day 19 — Domain 3 | ___ | ___% | |
| Day 21 — Full Exam #1 | ___ | ___% | |
| Day 23 — Full Exam #2 | ___ | ___% | |
| Day 25 — Full Exam #3 | ___ | ___% | |
| Day 27 — Full Exam #4 | ___ | ___% | |
