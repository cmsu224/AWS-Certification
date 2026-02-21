# Domain 2: Security & Compliance (30% of Exam)

> This is the LARGEST domain on the exam. Know it well!

## The Shared Responsibility Model

This is the **#1 most tested concept** on the exam.

```
┌──────────────────────────────────────────────────────────────────┐
│              SHARED RESPONSIBILITY MODEL                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              CUSTOMER RESPONSIBILITY                        │  │
│  │           "Security IN the Cloud"                           │  │
│  │                                                            │  │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│  │   │ Your Data│ │ IAM &    │ │ Firewall │ │ Encrypt- │    │  │
│  │   │          │ │ Access   │ │ (Security│ │ ion of   │    │  │
│  │   │          │ │ Control  │ │ Groups)  │ │ Data     │    │  │
│  │   └──────────┘ └──────────┘ └──────────┘ └──────────┘    │  │
│  │   Your apps, OS patching (on EC2), network config         │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ═══════════════════════════════════════════════════════════════  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              AWS RESPONSIBILITY                             │  │
│  │           "Security OF the Cloud"                           │  │
│  │                                                            │  │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│  │   │ Hardware │ │ Global   │ │ Regions, │ │ Physical │    │  │
│  │   │ & Infra  │ │ Network  │ │ AZs,Edge │ │ Security │    │  │
│  │   │          │ │          │ │ Locations│ │ of DCs   │    │  │
│  │   └──────────┘ └──────────┘ └──────────┘ └──────────┘    │  │
│  │   Hypervisor, managed services patching, facility ops     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**Memory trick** — Think of renting an **apartment**:
- **Landlord (AWS)** = building structure, plumbing, wiring, parking lot security
- **Tenant (You)** = your furniture, locking your door, not leaving the stove on

### Quick Reference: Who Is Responsible?

| Task | Responsible Party |
|------|-------------------|
| Patching the physical servers | **AWS** |
| Patching your EC2 OS | **YOU** |
| Patching RDS database engine | **AWS** (managed service) |
| Setting up IAM users & permissions | **YOU** |
| Physical security of data centers | **AWS** |
| Encrypting your data | **YOU** |
| Replacing faulty hardware | **AWS** |
| Configuring security groups | **YOU** |
| Patching Lambda runtime | **AWS** (serverless) |

**Rule of thumb**: The more "managed" the service, the more AWS handles.

## IAM — Identity and Access Management

```
┌──────────────────────────────────────────────────────────────────┐
│                         IAM OVERVIEW                              │
│                    (Free service, Global)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ROOT ACCOUNT                                                   │
│   ┌─────────┐  ← Created when you first set up AWS              │
│   │  ROOT   │  ← Has FULL access to EVERYTHING                  │
│   │ 👑      │  ← NEVER use for daily tasks!                     │
│   └────┬────┘  ← Lock it away, enable MFA                       │
│        │                                                         │
│   ┌────┴──────────────────────────────────────────────────┐     │
│   │                                                        │     │
│   │   USERS        GROUPS         ROLES                    │     │
│   │   ┌───┐       ┌───────┐     ┌───────┐                │     │
│   │   │👤 │       │👤👤👤 │     │  🎭   │                │     │
│   │   └───┘       │Admins │     │       │                │     │
│   │   A person    └───────┘     └───────┘                │     │
│   │               A collection   Temporary                │     │
│   │               of users       permissions               │     │
│   │               (share same    for services              │     │
│   │               permissions)   or users                  │     │
│   │                                                        │     │
│   │   POLICIES (JSON documents that define permissions)    │     │
│   │   ┌──────────────────────────────────┐                │     │
│   │   │ {                                │                │     │
│   │   │   "Effect": "Allow",             │                │     │
│   │   │   "Action": "s3:GetObject",      │                │     │
│   │   │   "Resource": "arn:aws:s3:::*"   │                │     │
│   │   │ }                                │                │     │
│   │   └──────────────────────────────────┘                │     │
│   └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### IAM Key Rules

- **Least Privilege Principle**: Give users ONLY the permissions they need
- **Users** = individual people
- **Groups** = collections of users (e.g., "Developers", "Admins")
- **Roles** = temporary permissions for services or cross-account access
- **Policies** = JSON documents that define what is allowed/denied
- Groups can contain users, but **NOT other groups**
- A user can belong to **multiple groups**

### IAM Security Tools

| Tool | What It Does | Analogy |
|------|-------------|---------|
| **MFA** (Multi-Factor Auth) | Password + device code | Bank card + PIN |
| **Access Keys** | For CLI/API access (NOT console) | API password |
| **IAM Credentials Report** | Lists all users & their credential status | Employee audit report |
| **IAM Access Advisor** | Shows which services a user accessed | Activity log |

## Security Services Cheat Sheet

```
┌──────────────────────────────────────────────────────────────────┐
│                   AWS SECURITY SERVICES                           │
├──────────────────┬───────────────────────────────────────────────┤
│ SERVICE          │ WHAT IT DOES                                  │
├──────────────────┼───────────────────────────────────────────────┤
│                  │                                               │
│ AWS WAF          │ Web Application Firewall                      │
│ 🧱              │ Filters HTTP traffic (blocks SQL injection,   │
│                  │ XSS, etc.) — works with CloudFront & ALB     │
│                  │                                               │
│ AWS Shield       │ DDoS protection                               │
│ 🛡️              │ Standard = Free, automatic                    │
│                  │ Advanced = $3k/mo, 24/7 DDoS response team   │
│                  │                                               │
│ AWS GuardDuty    │ Threat detection (AI-powered)                 │
│ 🔍              │ Monitors logs for suspicious activity         │
│                  │ Finds threats you didn't know to look for     │
│                  │                                               │
│ AWS Inspector    │ Vulnerability scanner                         │
│ 🔬              │ Scans EC2 and containers for known vulns      │
│                  │                                               │
│ AWS Macie        │ Sensitive data discovery                      │
│ 🔐              │ Uses ML to find PII in S3 (SSNs, credit      │
│                  │ cards, etc.)                                  │
│                  │                                               │
│ AWS KMS          │ Key Management Service                        │
│ 🔑              │ Create & manage encryption keys               │
│                  │                                               │
│ CloudHSM         │ Hardware Security Module                      │
│ 🔒              │ Dedicated hardware for crypto keys            │
│                  │ YOU manage the keys (not AWS)                 │
│                  │                                               │
│ AWS ACM          │ Certificate Manager                           │
│ 📜              │ Free SSL/TLS certificates                     │
│                  │                                               │
│ Secrets Manager  │ Store secrets (passwords, API keys)           │
│ 🤫              │ Auto-rotates credentials                      │
│                  │                                               │
│ Security Hub     │ Central dashboard for security findings       │
│ 📊              │ Aggregates alerts from GuardDuty, Inspector,  │
│                  │ Macie, etc.                                   │
│                  │                                               │
│ AWS Config       │ Track resource configuration changes          │
│ 📝              │ "Did someone change this security group?"     │
│                  │                                               │
│ CloudTrail       │ Logs ALL API calls in your account            │
│ 👣              │ "WHO did WHAT and WHEN"                       │
│                  │ Enabled by default                            │
│                  │                                               │
│ AWS Artifact     │ Compliance reports & agreements               │
│ 📋              │ Download SOC, PCI, ISO reports                │
│                  │                                               │
└──────────────────┴───────────────────────────────────────────────┘
```

### Encryption at Rest vs In Transit

```
  AT REST (stored data)                 IN TRANSIT (moving data)
  ┌──────────────────────┐             ┌──────────────────────┐
  │  📦 Data sitting     │             │  📦───→ 🔒 ───→ 📦  │
  │  on a disk/drive     │             │  Data moving over    │
  │                      │             │  the network         │
  │  Encrypted with:     │             │  Encrypted with:     │
  │  • KMS keys          │             │  • SSL/TLS           │
  │  • S3 encryption     │             │  • HTTPS             │
  │  • EBS encryption    │             │  • VPN               │
  └──────────────────────┘             └──────────────────────┘
```

## Network Security

```
┌──────────────────────────────────────────────────────────────────┐
│                 VPC SECURITY LAYERS                               │
│                                                                  │
│   INTERNET                                                       │
│      │                                                           │
│      ▼                                                           │
│   ┌──────────── NACL (Network ACL) ──────────────────┐          │
│   │  • Subnet level                                   │          │
│   │  • STATELESS (must define inbound AND outbound)   │          │
│   │  • Has ALLOW and DENY rules                       │          │
│   │  • Rules processed in NUMBER order                │          │
│   │                                                   │          │
│   │   ┌──────── Security Group ──────────────┐       │          │
│   │   │  • Instance level (attached to ENI)  │       │          │
│   │   │  • STATEFUL (return traffic auto)    │       │          │
│   │   │  • ALLOW rules ONLY (no deny)        │       │          │
│   │   │  • All rules evaluated               │       │          │
│   │   │                                      │       │          │
│   │   │        ┌──────────┐                  │       │          │
│   │   │        │  EC2 🖥️  │                  │       │          │
│   │   │        └──────────┘                  │       │          │
│   │   └──────────────────────────────────────┘       │          │
│   └───────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

**Memory trick**:
- **Security Group** = Bouncer at the door (only allows, can't deny, remembers you)
- **NACL** = Security checkpoint at the gate (allows AND denies, doesn't remember you)

| Feature | Security Group | NACL |
|---------|---------------|------|
| Level | Instance | Subnet |
| Stateful? | Yes | No |
| Rules | Allow only | Allow AND Deny |
| Default | Deny all inbound | Allow all |

## Compliance Programs to Know

| Program | What It Is |
|---------|-----------|
| **SOC** (1/2/3) | Service Organization Controls — audit reports |
| **PCI DSS** | Payment Card Industry — credit card security |
| **HIPAA** | Health Insurance Portability — healthcare data |
| **FedRAMP** | Federal Risk & Auth — US government |
| **GDPR** | General Data Protection — EU privacy law |

**Where to find compliance docs?** → **AWS Artifact** (self-service portal)
