# Domain 1: Cloud Concepts (24% of Exam)

## What is Cloud Computing?

On-demand delivery of IT resources over the internet with pay-as-you-go pricing.

**Instead of this (Traditional):**
```
┌─────────────────────────────────┐
│  YOUR OFFICE / DATA CENTER      │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ SRV │ │ SRV │ │ SRV │      │
│  │  1  │ │  2  │ │  3  │      │  YOU buy it all
│  └──┬──┘ └──┬──┘ └──┬──┘      │  YOU maintain it
│     │       │       │          │  YOU secure the building
│  ┌──┴───────┴───────┴──┐      │  YOU pay even when idle
│  │     Your Network     │      │
│  └──────────────────────┘      │
└─────────────────────────────────┘
```

**You get this (Cloud):**
```
         ☁ AWS Cloud ☁
┌─────────────────────────────────┐
│                                 │
│   Servers?  ✓ On demand         │
│   Storage?  ✓ On demand         │  AWS owns the hardware
│   Network?  ✓ On demand         │  YOU just use it
│   Database? ✓ On demand         │  Pay only for what you use
│                                 │
│   Scale up ↑  or down ↓         │
│   anytime you want              │
│                                 │
└─────────────────────────────────┘
```

---

## 6 Advantages of Cloud Computing

```
┌────────────────────────────────────────────────────────┐
│              6 ADVANTAGES OF CLOUD                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  1. TRADE CAPITAL FOR VARIABLE EXPENSE                 │
│     No big upfront costs → pay for what you use        │
│                                                        │
│  2. BENEFIT FROM MASSIVE ECONOMIES OF SCALE            │
│     AWS buys in bulk → savings passed to you           │
│                                                        │
│  3. STOP GUESSING CAPACITY                             │
│     Scale up/down as needed → no over/under buying     │
│                                                        │
│  4. INCREASE SPEED AND AGILITY                         │
│     New resources in minutes, not weeks                │
│                                                        │
│  5. STOP SPENDING MONEY RUNNING DATA CENTERS           │
│     Focus on your app, not the infrastructure          │
│                                                        │
│  6. GO GLOBAL IN MINUTES                               │
│     Deploy worldwide with a few clicks                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Cloud Computing Models

```
┌──────────────────────────────────────────────────────────────┐
│                   CLOUD DEPLOYMENT MODELS                    │
├──────────────┬──────────────────┬────────────────────────────┤
│   PUBLIC      │     HYBRID       │      PRIVATE (On-Prem)    │
│   CLOUD       │     CLOUD        │      CLOUD                │
├──────────────┼──────────────────┼────────────────────────────┤
│              │                  │                            │
│  Everything  │  Mix of cloud   │  Everything in YOUR        │
│  runs on     │  + on-premises  │  own data center           │
│  AWS         │                  │                            │
│              │  ┌────┐ ┌────┐  │  ┌────────────────┐        │
│  ┌────────┐  │  │AWS │↔│Your│  │  │ Your Building  │        │
│  │  AWS   │  │  │    │ │ DC │  │  │ Your Hardware  │        │
│  │  100%  │  │  └────┘ └────┘  │  │ Your Software  │        │
│  └────────┘  │                  │  └────────────────┘        │
│              │                  │                            │
│  Most common │  Banks, health  │  Government, strict        │
│  for startups│  care, legacy   │  compliance needs          │
│              │  systems        │                            │
└──────────────┴──────────────────┴────────────────────────────┘
```

---

## Cloud Service Models: IaaS vs PaaS vs SaaS

Think of it like **pizza**:

```
  YOU MANAGE ←────────────────────────────→ AWS MANAGES

  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │  ON-PREMISES    IaaS          PaaS          SaaS        │
  │  (Make at       (Buy dough   (Buy frozen   (Order       │
  │   home)         & toppings)   pizza, bake)  delivery)   │
  │                                                         │
  │  ┌─────────┐   ┌─────────┐  ┌─────────┐  ┌─────────┐  │
  │  │App      │   │App  YOU │  │App  YOU │  │App      │  │
  │  │Data     │   │Data     │  │Data     │  │Data     │  │
  │  │Runtime  │   │Runtime  │  │Runtime  │  │Runtime  │  │
  │  │OS    YOU│   │OS       │  │OS       │  │OS   AWS │  │
  │  │Virtual. │   │Virtual. │  │Virt.AWS │  │Virtual. │  │
  │  │Servers  │   │Serv.AWS │  │Servers  │  │Servers  │  │
  │  │Storage  │   │Storage  │  │Storage  │  │Storage  │  │
  │  │Network  │   │Network  │  │Network  │  │Network  │  │
  │  └─────────┘   └─────────┘  └─────────┘  └─────────┘  │
  │                                                         │
  │  Example:       EC2           Elastic      Gmail,       │
  │  Your DC                      Beanstalk    Dropbox      │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
```

| Model | What It Means | AWS Example | You Manage | AWS Manages |
|-------|---------------|-------------|------------|-------------|
| **IaaS** | Infrastructure as a Service | EC2, VPC | OS, apps, data | Hardware, networking |
| **PaaS** | Platform as a Service | Elastic Beanstalk, Lambda | Just your code + data | Everything else |
| **SaaS** | Software as a Service | Amazon WorkSpaces | Just use it | Everything |

---

## AWS Global Infrastructure

```
  ┌─────────────────────── AWS GLOBAL INFRASTRUCTURE ────────────────────────┐
  │                                                                          │
  │  REGIONS (30+)                                                           │
  │  ┌──────────────────────────────────────────┐                           │
  │  │  A Region = a physical location           │                           │
  │  │  in the world (e.g., us-east-1)           │                           │
  │  │                                            │                           │
  │  │  Each Region has multiple AZs:             │                           │
  │  │                                            │                           │
  │  │  Region: us-east-1 (N. Virginia)           │                           │
  │  │  ┌──────┐    ┌──────┐    ┌──────┐         │                           │
  │  │  │ AZ-a │    │ AZ-b │    │ AZ-c │         │                           │
  │  │  │      │◄──►│      │◄──►│      │         │                           │
  │  │  │ Data │    │ Data │    │ Data │         │                           │
  │  │  │Center│    │Center│    │Center│         │                           │
  │  │  └──────┘    └──────┘    └──────┘         │                           │
  │  │     ↑ Isolated but connected               │                           │
  │  │       with low-latency links               │                           │
  │  └──────────────────────────────────────────┘                           │
  │                                                                          │
  │  EDGE LOCATIONS (400+)                                                   │
  │  ┌──────────────────────────────────────────┐                           │
  │  │  Caches content close to users            │                           │
  │  │  Used by CloudFront (CDN)                 │                           │
  │  │                                            │                           │
  │  │  User in Tokyo → gets data from           │                           │
  │  │  Tokyo edge location (fast!)               │                           │
  │  │  instead of US server (slow)               │                           │
  │  └──────────────────────────────────────────┘                           │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘
```

### How to Choose a Region

```
  ┌──────────────────────────────────────────┐
  │  REGION SELECTION CHECKLIST              │
  │                                          │
  │  1. COMPLIANCE                           │
  │     Does data need to stay in            │
  │     a specific country?        □         │
  │                                          │
  │  2. LATENCY                              │
  │     Where are your users?      □         │
  │     (Pick the closest region)            │
  │                                          │
  │  3. SERVICE AVAILABILITY                 │
  │     Does the region have the   □         │
  │     services you need?                   │
  │                                          │
  │  4. PRICING                              │
  │     Some regions cost more     □         │
  │     than others                          │
  └──────────────────────────────────────────┘
```

---

## Well-Architected Framework (6 Pillars)

```
                    AWS WELL-ARCHITECTED FRAMEWORK
                    ─────────────────────────────

    ┌───────────┐ ┌───────────┐ ┌───────────┐
    │OPERATIONAL│ │ SECURITY  │ │RELIABILITY│
    │EXCELLENCE │ │           │ │           │
    │           │ │ Protect   │ │ Recover   │
    │ Run &     │ │ data &    │ │ from      │
    │ monitor   │ │ systems   │ │ failure   │
    │ systems   │ │           │ │           │
    └───────────┘ └───────────┘ └───────────┘

    ┌───────────┐ ┌───────────┐ ┌───────────┐
    │PERFORMANCE│ │   COST    │ │SUSTAIN-   │
    │EFFICIENCY │ │OPTIMIZATION│ │ABILITY   │
    │           │ │           │ │           │
    │ Use       │ │ Avoid     │ │ Minimize  │
    │ resources │ │ waste     │ │ environ.  │
    │ wisely    │ │           │ │ impact    │
    └───────────┘ └───────────┘ └───────────┘
```

**Memory trick — "OSRPCS" → "Oh Snap, Really Pretty Cool Stuff"**

| Pillar | One-Liner | Key Question |
|--------|-----------|--------------|
| **Operational Excellence** | Run things well | "Can we improve our processes?" |
| **Security** | Protect everything | "Who can access what?" |
| **Reliability** | Survive failures | "What if something breaks?" |
| **Performance Efficiency** | Use resources wisely | "Are we using the right tools?" |
| **Cost Optimization** | Don't waste money | "Are we spending too much?" |
| **Sustainability** | Be eco-friendly | "Can we reduce our footprint?" |

---

## Key Concepts to Remember

| Concept | What It Means | Analogy |
|---------|---------------|---------|
| **Elasticity** | Auto scale up/down based on demand | Rubber band stretching |
| **High Availability** | System stays running even if parts fail | Multiple backup generators |
| **Fault Tolerance** | System works even when components fail | Airplane with multiple engines |
| **Agility** | Spin up resources quickly | Fast food vs. fine dining |
| **Scalability** | Handle growth (vertical = bigger, horizontal = more) | Bigger truck vs. more trucks |

```
  VERTICAL SCALING          HORIZONTAL SCALING
  (Scale UP)                (Scale OUT)

  ┌──────────┐              ┌────┐ ┌────┐ ┌────┐
  │          │              │    │ │    │ │    │
  │  BIGGER  │              │ S1 │ │ S2 │ │ S3 │
  │  SERVER  │              │    │ │    │ │    │
  │          │              └────┘ └────┘ └────┘
  │          │
  └──────────┘              More servers working
  One big server            together
```
