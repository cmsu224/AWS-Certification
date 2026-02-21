# Domain 2: Security & Compliance (30% of Exam)

> This is the BIGGEST domain on the exam. Know this well!

## The Shared Responsibility Model

This is the **#1 most tested concept** on the exam.

```
┌──────────────────────────────────────────────────────────────┐
│               SHARED RESPONSIBILITY MODEL                    │
│                                                              │
│         "Security OF the Cloud" vs                           │
│         "Security IN the Cloud"                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │              CUSTOMER RESPONSIBILITY                   │  │
│  │           "Security IN the Cloud"                      │  │
│  │                                                        │  │
│  │   ┌──────────────────────────────────────────────┐    │  │
│  │   │  Your Data                                    │    │  │
│  │   │  Your Encryption choices                      │    │  │
│  │   │  Your IAM users/roles/permissions             │    │  │
│  │   │  Your Security groups / firewall rules        │    │  │
│  │   │  Your Operating system patches (on EC2)       │    │  │
│  │   │  Your Application code                        │    │  │
│  │   └──────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │              AWS RESPONSIBILITY                        │  │
│  │           "Security OF the Cloud"                      │  │
│  │                                                        │  │
│  │   ┌──────────────────────────────────────────────┐    │  │
│  │   │  Physical data centers & security             │    │  │
│  │   │  Hardware / Global infrastructure             │    │  │
│  │   │  Networking equipment                         │    │  │
│  │   │  Hypervisor (virtualization layer)            │    │  │
│  │   │  Managed service patching (RDS, Lambda, etc.) │    │  │
│  │   └──────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  MEMORY TRICK: "If YOU can touch it in the console,         │
│                 it's YOUR responsibility"                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Shared Responsibility Varies by Service Type

```
  IaaS (EC2)              PaaS (RDS)             SaaS (S3)
  ─────────               ──────────             ─────────
  YOU patch OS            AWS patches OS         AWS manages
  YOU manage firewall     AWS manages engine       everything
  YOU install apps        YOU manage data        YOU manage data
  YOU encrypt data        YOU manage access        & access

  More YOUR                                    More AWS
  responsibility ◄─────────────────────────► responsibility
```

---

## IAM — Identity and Access Management

> "Who can do what to which resources"

```
┌──────────────────────── IAM ─────────────────────────────┐
│                                                           │
│  ROOT ACCOUNT (the email you signed up with)              │
│  ┌─────────────────────────────────────────────────┐     │
│  │  ⚠ DO NOT USE FOR DAILY TASKS                   │     │
│  │  ⚠ Enable MFA immediately                       │     │
│  │  ⚠ Lock it away like a master key               │     │
│  └─────────────────────────────────────────────────┘     │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │  USERS   │  │  GROUPS  │  │  ROLES   │               │
│  │          │  │          │  │          │               │
│  │ A person │  │ Collection│ │ Temporary │               │
│  │ or app   │  │ of users │  │ access   │               │
│  │          │  │          │  │ for a    │               │
│  │ Has long-│  │ Assign   │  │ service  │               │
│  │ term     │  │ policies │  │ or app   │               │
│  │ creds    │  │ to group │  │          │               │
│  └──────────┘  └──────────┘  └──────────┘               │
│       │              │              │                     │
│       └──────────────┴──────────────┘                     │
│                      │                                    │
│               ┌──────────────┐                           │
│               │   POLICIES   │                           │
│               │              │                           │
│               │ JSON docs    │                           │
│               │ that define  │                           │
│               │ permissions  │                           │
│               │              │                           │
│               │ Allow or     │                           │
│               │ Deny actions │                           │
│               └──────────────┘                           │
│                                                           │
│  PRINCIPLE OF LEAST PRIVILEGE:                           │
│  Give only the permissions needed — nothing more          │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### IAM Best Practices Checklist

```
  ✓ Enable MFA on root account
  ✓ Create individual IAM users (never share accounts)
  ✓ Use groups to assign permissions
  ✓ Use roles for EC2 instances and services
  ✓ Use strong password policy
  ✓ Rotate credentials regularly
  ✓ Apply least privilege principle
  ✓ Never put access keys in code
```

---

## Security Services Map

```
┌──────────────────────────────────────────────────────────────┐
│                   AWS SECURITY SERVICES                      │
│                                                              │
│  IDENTITY & ACCESS          DETECTION & MONITORING           │
│  ┌────────────────┐         ┌─────────────────────┐         │
│  │ IAM            │         │ CloudTrail          │         │
│  │ Who can access │         │ WHO did WHAT and    │         │
│  │ what           │         │ WHEN (API audit log)│         │
│  ├────────────────┤         ├─────────────────────┤         │
│  │ IAM Identity   │         │ GuardDuty           │         │
│  │ Center (SSO)   │         │ AI threat detection │         │
│  │ One login for  │         │ "Smart security     │         │
│  │ multiple accts │         │  camera"            │         │
│  └────────────────┘         ├─────────────────────┤         │
│                              │ Security Hub        │         │
│  NETWORK SECURITY           │ Central dashboard   │         │
│  ┌────────────────┐         │ for all findings    │         │
│  │ Security Groups│         ├─────────────────────┤         │
│  │ Instance-level │         │ Amazon Inspector    │         │
│  │ firewall       │         │ Scans for software  │         │
│  │ (ALLOW only)   │         │ vulnerabilities     │         │
│  ├────────────────┤         └─────────────────────┘         │
│  │ NACLs          │                                          │
│  │ Subnet-level   │         ENCRYPTION & COMPLIANCE          │
│  │ firewall       │         ┌─────────────────────┐         │
│  │ (ALLOW + DENY) │         │ KMS                 │         │
│  ├────────────────┤         │ Manage encryption   │         │
│  │ AWS WAF        │         │ keys                │         │
│  │ Web Application│         ├─────────────────────┤         │
│  │ Firewall       │         │ AWS Certificate Mgr │         │
│  │ (blocks SQL    │         │ Free SSL/TLS certs  │         │
│  │  injection,    │         ├─────────────────────┤         │
│  │  XSS, etc.)    │         │ AWS Artifact        │         │
│  ├────────────────┤         │ Compliance reports  │         │
│  │ AWS Shield     │         │ & agreements        │         │
│  │ DDoS protection│         ├─────────────────────┤         │
│  │ Standard: FREE │         │ AWS Config          │         │
│  │ Advanced: PAID │         │ Track resource      │         │
│  └────────────────┘         │ config changes      │         │
│                              └─────────────────────┘         │
└──────────────────────────────────────────────────────────────┘
```

---

## Security Groups vs NACLs

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│             VPC (Your Virtual Network)                   │
│     ┌──────────────────────────────────────────┐        │
│     │          SUBNET                           │        │
│     │   ┌──── NACL ────┐  ← Subnet-level       │        │
│     │   │              │     guard gate          │        │
│     │   │  ┌────────┐  │                        │        │
│     │   │  │Security│  │  ← Instance-level      │        │
│     │   │  │ Group  │  │     bodyguard           │        │
│     │   │  │┌──────┐│  │                        │        │
│     │   │  ││ EC2  ││  │                        │        │
│     │   │  │└──────┘│  │                        │        │
│     │   │  └────────┘  │                        │        │
│     │   └──────────────┘                        │        │
│     └──────────────────────────────────────────┘        │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌───────────────────┬────────────────────────────┐
│  Security Group   │  NACL                      │
├───────────────────┼────────────────────────────┤
│  Instance level   │  Subnet level              │
│  ALLOW rules only │  ALLOW + DENY rules        │
│  Stateful         │  Stateless                 │
│  All rules eval'd │  Rules processed in order  │
│  Must be assigned │  Auto-applies to all       │
│  to instance      │  instances in subnet       │
└───────────────────┴────────────────────────────┘

STATEFUL vs STATELESS:
  Stateful (SG):   If traffic is allowed IN, response OUT is auto-allowed
  Stateless (NACL): Must explicitly allow BOTH inbound AND outbound
```

---

## Compliance & Governance

```
┌──────────────────────────────────────────────────────────┐
│                  COMPLIANCE SERVICES                      │
│                                                          │
│  ┌──────────────┐    "Can I see AWS's compliance        │
│  │ AWS Artifact │     reports?"                           │
│  │              │     YES → Download SOC, PCI, ISO       │
│  │  Self-service│     reports from Artifact               │
│  │  compliance  │                                        │
│  │  portal      │                                        │
│  └──────────────┘                                        │
│                                                          │
│  ┌──────────────┐    "Are my resources configured        │
│  │ AWS Config   │     correctly?"                         │
│  │              │     Tracks config changes over time     │
│  │  Config rule │     Can alert on non-compliant configs  │
│  │  checker     │                                        │
│  └──────────────┘                                        │
│                                                          │
│  ┌──────────────┐    "Who did what in my account?"       │
│  │ CloudTrail   │     Records ALL API calls              │
│  │              │     Like a security camera for          │
│  │  API audit   │     your AWS account                   │
│  │  log         │                                        │
│  └──────────────┘                                        │
│                                                          │
│  ┌──────────────┐    "How do I manage multiple           │
│  │ AWS Orgs     │     accounts?"                          │
│  │              │     Central billing, SCPs to            │
│  │  Multi-acct  │     restrict what accounts can do       │
│  │  management  │                                        │
│  └──────────────┘                                        │
│                                                          │
│  SCP = Service Control Policy                            │
│  → Guardrails for what an account CAN do                 │
│  → Even if IAM allows it, SCP can block it               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Encryption at Rest vs In Transit

```
  AT REST (data sitting in storage)         IN TRANSIT (data moving)
  ─────────────────────────────             ────────────────────────

  ┌──────────┐                              ┌──────┐     ┌──────┐
  │  S3      │  ← encrypted                │ You  │────►│ AWS  │
  │  bucket  │     with KMS key            │      │HTTPS│      │
  │  🔒      │                              │      │SSL  │      │
  └──────────┘                              └──────┘TLS  └──────┘

  Services that encrypt at rest:            Always use HTTPS/SSL/TLS
  • S3 (default since 2023)                 for data in motion
  • EBS volumes
  • RDS databases
  • DynamoDB

  Tool: AWS KMS (Key Management Service)    Tool: AWS Certificate Manager
  manages your encryption keys              provides free SSL/TLS certificates
```
