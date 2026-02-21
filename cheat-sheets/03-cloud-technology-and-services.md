# Domain 3: Cloud Technology & Services (34% of Exam)

> This is the LARGEST domain. Know the major services and what they do.

## AWS Service Map — The Big Picture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        AWS SERVICES OVERVIEW                         │
│                                                                      │
│  COMPUTE          STORAGE          DATABASE         NETWORKING       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ EC2      │    │ S3       │    │ RDS      │    │ VPC      │      │
│  │ Lambda   │    │ EBS      │    │ DynamoDB │    │ CloudFrnt│      │
│  │ ECS/EKS  │    │ EFS      │    │ Aurora   │    │ Route 53 │      │
│  │ Fargate  │    │ Glacier  │    │ ElastiCa.│    │ API GW   │      │
│  │ Beanstalk│    │ Storage  │    │ Redshift │    │ Direct   │      │
│  │ Lightsail│    │  Gateway │    │ Neptune  │    │  Connect │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│                                                                      │
│  SECURITY         MANAGEMENT       AI/ML            MIGRATION        │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ IAM      │    │CloudWatch│    │ SageMaker│    │ Snow     │      │
│  │ KMS      │    │CloudTrail│    │ Rekognit.│    │  Family  │      │
│  │ WAF      │    │CloudForm.│    │ Comprehnd│    │ DMS      │      │
│  │ Shield   │    │ Trusted  │    │ Lex      │    │ Migration│      │
│  │ GuardDuty│    │  Advisor │    │ Polly    │    │  Hub     │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## COMPUTE Services

### EC2 — Elastic Compute Cloud

```
┌──────────────────────────────────────────────────────────┐
│  EC2 = Virtual Servers (think: "renting a computer")     │
│                                                          │
│  ┌──────────────────────────────────────────────┐       │
│  │            EC2 INSTANCE TYPES                 │       │
│  ├──────────┬────────────────────────────────────┤       │
│  │ General  │ M-series: balanced (web servers)   │       │
│  │ Purpose  │ T-series: burstable (dev/test)     │       │
│  ├──────────┼────────────────────────────────────┤       │
│  │ Compute  │ C-series: CPU-heavy (batch jobs,   │       │
│  │ Optimized│ gaming, scientific modeling)        │       │
│  ├──────────┼────────────────────────────────────┤       │
│  │ Memory   │ R-series: RAM-heavy (databases,    │       │
│  │ Optimized│ in-memory caching)                 │       │
│  ├──────────┼────────────────────────────────────┤       │
│  │ Storage  │ I/D-series: high disk I/O          │       │
│  │ Optimized│ (data warehousing)                 │       │
│  ├──────────┼────────────────────────────────────┤       │
│  │ Accel.   │ P/G-series: GPU (machine learning, │       │
│  │ Computing│ graphics rendering)                │       │
│  └──────────┴────────────────────────────────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### EC2 Pricing Models — CRITICAL FOR EXAM

```
┌──────────────────────────────────────────────────────────────────┐
│                    EC2 PRICING MODELS                             │
│                                                                   │
│  $$$$  ┌─────────────┐                                           │
│   $$$  │ ON-DEMAND   │  Pay by the hour/second                   │
│    $$  │             │  No commitment, most flexible              │
│     $  │             │  Best for: short-term, unpredictable       │
│        └─────────────┘                                           │
│                                                                   │
│  $$$$  ┌─────────────┐                                           │
│   $$$  │ RESERVED    │  1 or 3 year commitment                   │
│    $$  │ INSTANCES   │  Up to 72% discount                       │
│  ►  $  │             │  Best for: steady, predictable use        │
│        └─────────────┘  (like a lease on an apartment)           │
│                                                                   │
│  $$$$  ┌─────────────┐                                           │
│   $$$  │ SAVINGS     │  Commit to $/hour for 1 or 3 years       │
│  ► $$  │ PLANS       │  More flexible than Reserved              │
│     $  │             │  Applies across instance families          │
│        └─────────────┘                                           │
│                                                                   │
│  $$$$  ┌─────────────┐                                           │
│   $$$  │ SPOT        │  Up to 90% discount!                      │
│    $$  │ INSTANCES   │  BUT: AWS can take it back with           │
│►    $  │             │  2-min notice                              │
│        └─────────────┘  Best for: fault-tolerant, flexible jobs  │
│                                                                   │
│  $$$$  ┌─────────────┐                                           │
│   $$$  │ DEDICATED   │  Physical server just for you             │
│    $$  │ HOSTS       │  Most expensive                           │
│     $  │             │  Best for: compliance, licensing           │
│        └─────────────┘                                           │
│                                                                   │
│  PRICE:  Spot < Reserved/Savings < On-Demand < Dedicated         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Lambda — Serverless Compute

```
┌──────────────────────────────────────────────────────────┐
│  Lambda = Run code WITHOUT managing servers              │
│                                                          │
│  EVENT ──► LAMBDA FUNCTION ──► RESULT                    │
│                                                          │
│  Examples:                                               │
│  • Image uploaded to S3 → Lambda resizes it              │
│  • API request → Lambda processes it                     │
│  • Timer (cron) → Lambda runs cleanup                    │
│                                                          │
│  KEY FACTS:                                              │
│  • Pay per request + compute time (per ms)               │
│  • Scales automatically                                  │
│  • Max runtime: 15 minutes per invocation                │
│  • You just upload your code                             │
│  • AWS manages the servers (serverless)                  │
│                                                          │
│  Compare to EC2:                                         │
│  EC2 = you rent the whole kitchen                        │
│  Lambda = you just order a meal (pay per plate)          │
└──────────────────────────────────────────────────────────┘
```

### Other Compute Services

```
┌────────────────────┬─────────────────────────────────────┐
│ Service            │ What It Does                        │
├────────────────────┼─────────────────────────────────────┤
│ ECS / EKS          │ Run Docker containers               │
│ Fargate            │ Serverless containers (no servers   │
│                    │ to manage)                           │
│ Elastic Beanstalk  │ Upload code → AWS handles the rest  │
│                    │ (PaaS, easy deployment)              │
│ Lightsail          │ Simple VPS — like a "starter" EC2   │
│ AWS Batch          │ Run batch processing jobs at scale   │
│ Outposts           │ AWS hardware in YOUR data center     │
└────────────────────┴─────────────────────────────────────┘
```

---

## STORAGE Services

```
┌──────────────────────────────────────────────────────────────────┐
│                    AWS STORAGE SERVICES                           │
│                                                                   │
│  ┌────────────────────────────────────────────┐                  │
│  │              S3 (Simple Storage Service)    │                  │
│  │                                            │                  │
│  │  Object storage = files (photos, videos,   │                  │
│  │  backups, static websites)                  │                  │
│  │                                            │                  │
│  │  ┌─────────────────────────────────────┐   │                  │
│  │  │ S3 STORAGE CLASSES (by cost/access) │   │                  │
│  │  │                                     │   │                  │
│  │  │  HOT ◄──────────────────────► COLD  │   │                  │
│  │  │  (frequent access)    (rare access) │   │                  │
│  │  │                                     │   │                  │
│  │  │  S3 Standard                        │   │                  │
│  │  │    │                                │   │                  │
│  │  │  S3 Standard-IA (Infrequent Access) │   │                  │
│  │  │    │                                │   │                  │
│  │  │  S3 One Zone-IA                     │   │                  │
│  │  │    │                                │   │                  │
│  │  │  S3 Glacier Instant Retrieval       │   │                  │
│  │  │    │                                │   │                  │
│  │  │  S3 Glacier Flexible Retrieval      │   │                  │
│  │  │    │                                │   │                  │
│  │  │  S3 Glacier Deep Archive            │   │                  │
│  │  │    (cheapest, 12-48hr retrieval)    │   │                  │
│  │  │                                     │   │                  │
│  │  │  S3 Intelligent-Tiering             │   │                  │
│  │  │    (auto-moves data between tiers)  │   │                  │
│  │  └─────────────────────────────────────┘   │                  │
│  └────────────────────────────────────────────┘                  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐          │
│  │ EBS          │  │ EFS          │  │ Storage GW    │          │
│  │              │  │              │  │               │          │
│  │ Block storage│  │ File storage │  │ Hybrid cloud  │          │
│  │ (hard drive  │  │ (shared NFS  │  │ storage       │          │
│  │  for EC2)    │  │  across EC2) │  │ (on-prem →    │          │
│  │              │  │              │  │  cloud bridge) │          │
│  │ 1 EBS =      │  │ 1 EFS =     │  │               │          │
│  │ 1 EC2 inst.  │  │ many EC2    │  │               │          │
│  └──────────────┘  └──────────────┘  └───────────────┘          │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Storage Types Comparison

```
  OBJECT STORAGE          BLOCK STORAGE          FILE STORAGE
  (S3)                    (EBS)                  (EFS)

  ┌────┐ ┌────┐          ┌────────────┐          ┌────────────┐
  │doc │ │img │          │ ████ │     │          │ /home/     │
  └────┘ └────┘          │ ████ │ ████│          │ /data/     │
  ┌────┐ ┌────┐          │      │ ████│          │ /logs/     │
  │vid │ │zip │          └────────────┘          └────────────┘
  └────┘ └────┘

  Files as objects        Raw blocks like a       Shared folder
  Unlimited storage       hard drive              Multiple users
  HTTP access             Attached to 1 EC2       NFS protocol
  Great for web           Great for OS/DB         Great for shared
```

---

## DATABASE Services

```
┌──────────────────────────────────────────────────────────────────┐
│                    AWS DATABASE SERVICES                          │
│                                                                   │
│  RELATIONAL (SQL)                 NON-RELATIONAL (NoSQL)         │
│  ┌─────────────────────┐         ┌────────────────────┐         │
│  │ RDS                 │         │ DynamoDB           │         │
│  │ Managed SQL DB      │         │ Key-value & doc DB │         │
│  │ • MySQL             │         │ • Serverless       │         │
│  │ • PostgreSQL        │         │ • Single-digit ms  │         │
│  │ • Oracle            │         │ • Auto-scales      │         │
│  │ • SQL Server        │         │                    │         │
│  │ • MariaDB           │         │ Think: shopping    │         │
│  │                     │         │ cart, gaming,       │         │
│  │ YOU: manage data    │         │ IoT data           │         │
│  │ AWS: patching, HA   │         └────────────────────┘         │
│  └─────────────────────┘                                         │
│                                                                   │
│  ┌─────────────────────┐         ┌────────────────────┐         │
│  │ Aurora              │         │ ElastiCache        │         │
│  │ AWS's own RDBMS     │         │ In-memory cache    │         │
│  │ • MySQL compatible  │         │ (Redis, Memcached) │         │
│  │ • PostgreSQL compat │         │ • Blazing fast     │         │
│  │ • 5x faster MySQL   │         │ • Reduces DB load  │         │
│  │ • Auto-scales       │         └────────────────────┘         │
│  │ • Up to 15 replicas │                                         │
│  └─────────────────────┘         ┌────────────────────┐         │
│                                   │ Redshift           │         │
│  ┌─────────────────────┐         │ Data warehouse     │         │
│  │ Neptune             │         │ • Analytics/BI     │         │
│  │ Graph database      │         │ • Petabyte-scale   │         │
│  │ (social networks,   │         │ • Columnar storage │         │
│  │  fraud detection)   │         └────────────────────┘         │
│  └─────────────────────┘                                         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## NETWORKING Services

```
┌──────────────────────────────────────────────────────────────────┐
│                    VPC — Your Private Network                     │
│                                                                   │
│  ┌──────────────────── VPC ─────────────────────────┐           │
│  │                                                    │           │
│  │  ┌── Public Subnet ──┐  ┌── Private Subnet ──┐   │           │
│  │  │                    │  │                     │   │           │
│  │  │  ┌──────┐         │  │  ┌──────┐          │   │           │
│  │  │  │ Web  │         │  │  │  DB  │          │   │           │
│  │  │  │Server│         │  │  │Server│          │   │           │
│  │  │  └──────┘         │  │  └──────┘          │   │           │
│  │  │                    │  │                     │   │           │
│  │  │  Accessible from  │  │  NOT accessible     │   │           │
│  │  │  the internet     │  │  from internet       │   │           │
│  │  └────────────────────┘  └─────────────────────┘   │           │
│  │          │                         │               │           │
│  │    ┌─────┴─────┐           ┌──────┴──────┐       │           │
│  │    │  Internet  │           │   NAT       │       │           │
│  │    │  Gateway   │           │   Gateway   │       │           │
│  │    │(front door)│           │(lets private│       │           │
│  │    └─────┬─────┘           │ subnet reach│       │           │
│  │          │                  │ internet     │       │           │
│  └──────────┼──────────────────┴──────────────┘       │           │
│             │                                                     │
│      ┌──────┴──────┐                                             │
│      │  Internet   │                                             │
│      └─────────────┘                                             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Key Networking Services

```
┌────────────────────┬─────────────────────────────────────────┐
│ Service            │ What It Does                            │
├────────────────────┼─────────────────────────────────────────┤
│ VPC                │ Your own private network in AWS         │
│ CloudFront         │ CDN — caches content at edge locations  │
│                    │ (makes websites fast globally)          │
│ Route 53           │ DNS service (domain → IP address)       │
│                    │ "AWS phonebook"                         │
│ API Gateway        │ Create and manage REST APIs             │
│ Direct Connect     │ Dedicated physical line from your       │
│                    │ data center to AWS (not internet)       │
│ VPN                │ Encrypted tunnel over internet to AWS   │
│ Elastic Load       │ Distributes traffic across instances    │
│ Balancer (ELB)     │ (like a traffic cop)                    │
│ Global Accelerator │ Routes users to nearest AWS endpoint    │
└────────────────────┴─────────────────────────────────────────┘
```

---

## MANAGEMENT & MONITORING

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                    │
│  │ CloudWatch       │    │ CloudTrail       │                    │
│  │                  │    │                  │                    │
│  │ PERFORMANCE      │    │ AUDIT LOG        │                    │
│  │ monitoring       │    │ (who did what)   │                    │
│  │                  │    │                  │                    │
│  │ • CPU usage      │    │ • API calls      │                    │
│  │ • Memory         │    │ • Login events   │                    │
│  │ • Alarms         │    │ • Changes made   │                    │
│  │ • Dashboards     │    │                  │                    │
│  │                  │    │ Think: security  │                    │
│  │ Think: fitness   │    │ camera footage   │                    │
│  │ tracker          │    │                  │                    │
│  └──────────────────┘    └──────────────────┘                    │
│                                                                   │
│  EASY WAY TO REMEMBER:                                           │
│  CloudWatch = PERFORMANCE (watches metrics)                      │
│  CloudTrail = AUDITING (trail of who did what)                   │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                    │
│  │ CloudFormation   │    │ Trusted Advisor  │                    │
│  │                  │    │                  │                    │
│  │ Infrastructure   │    │ Best practices   │                    │
│  │ as Code (IaC)    │    │ checker          │                    │
│  │                  │    │                  │                    │
│  │ Define resources │    │ 5 CATEGORIES:    │                    │
│  │ in a template    │    │ • Cost Optim.    │                    │
│  │ (JSON/YAML)      │    │ • Performance    │                    │
│  │                  │    │ • Security       │                    │
│  │ Deploy identical │    │ • Fault Toler.   │                    │
│  │ environments     │    │ • Service Limits │                    │
│  │ repeatedly       │    │                  │                    │
│  └──────────────────┘    └──────────────────┘                    │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                    │
│  │ Systems Manager  │    │ AWS Organizations│                    │
│  │                  │    │                  │                    │
│  │ Manage EC2       │    │ Multi-account    │                    │
│  │ fleet at scale   │    │ management       │                    │
│  │ • Patch mgmt     │    │ • Central billing│                    │
│  │ • Run commands   │    │ • SCPs           │                    │
│  │ • Parameter Store│    │ • OU structure   │                    │
│  └──────────────────┘    └──────────────────┘                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## AI/ML & Analytics Services (Know the Names)

```
┌────────────────────┬──────────────────────────────────────┐
│ Service            │ What It Does (one-liner)             │
├────────────────────┼──────────────────────────────────────┤
│ SageMaker          │ Build, train & deploy ML models      │
│ Rekognition        │ Image & video analysis (faces, text) │
│ Comprehend         │ Natural language processing (NLP)    │
│ Lex                │ Build chatbots (powers Alexa)        │
│ Polly              │ Text-to-speech                       │
│ Transcribe         │ Speech-to-text                       │
│ Translate          │ Language translation                  │
│ Textract           │ Extract text from documents          │
│ Kendra             │ Intelligent search service           │
│ Athena             │ Query S3 data with SQL (serverless)  │
│ QuickSight         │ Business intelligence dashboards     │
│ Kinesis            │ Real-time streaming data             │
│ Glue               │ ETL (extract, transform, load)       │
│ EMR                │ Big data processing (Hadoop/Spark)   │
└────────────────────┴──────────────────────────────────────┘
```

---

## Migration & Transfer Services

```
┌──────────────────────────────────────────────────────────────┐
│                   DATA MIGRATION                              │
│                                                              │
│  OVER THE NETWORK:                                           │
│  ┌──────────────────────────────────────────┐               │
│  │ DMS (Database Migration Service)         │               │
│  │ Move databases to AWS                     │               │
│  │                                          │               │
│  │ Migration Hub                            │               │
│  │ Track migration progress                  │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
│  PHYSICAL (when internet is too slow):                       │
│  ┌──────────────────────────────────────────┐               │
│  │                                          │               │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐ │               │
│  │  │Snowcone │  │Snowball │  │Snowmobile│ │               │
│  │  │         │  │  Edge   │  │         │ │               │
│  │  │ 8-14 TB │  │ 80 TB  │  │ 100 PB  │ │               │
│  │  │         │  │         │  │         │ │               │
│  │  │ Portable│  │ Rugged  │  │ Literal │ │               │
│  │  │ device  │  │ box     │  │ shipping│ │               │
│  │  │         │  │         │  │ container│ │               │
│  │  └─────────┘  └─────────┘  └─────────┘ │               │
│  │                                          │               │
│  │  Small ◄───────────────────────► Huge   │               │
│  │                                          │               │
│  │  "If it takes >1 week to transfer over  │               │
│  │   the network, use Snow Family"          │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Ways to Interact with AWS

```
┌──────────────────────────────────────────────────────────────┐
│  3 WAYS TO TALK TO AWS                                       │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ AWS Console    │  │ AWS CLI        │  │ AWS SDKs       │ │
│  │                │  │                │  │                │ │
│  │ Web browser    │  │ Terminal /     │  │ Code           │ │
│  │ Point & click  │  │ command line   │  │ (Python, JS,   │ │
│  │                │  │                │  │  Java, etc.)   │ │
│  │ Best for:      │  │ Best for:      │  │ Best for:      │ │
│  │ Learning,      │  │ Automation,    │  │ Building apps  │ │
│  │ exploring      │  │ scripting      │  │ that use AWS   │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│                                                              │
│  All three use the SAME underlying AWS APIs                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```
