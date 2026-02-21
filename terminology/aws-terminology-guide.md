# AWS Terminology Guide — Real-World Analogies

> Every AWS term mapped to something you already know.
> When you see the term on the exam, picture the analogy.

---

## Core Cloud Terms

| Term | Definition | Analogy |
|------|-----------|---------|
| **Cloud Computing** | On-demand IT resources via the internet | Streaming Netflix vs. buying DVDs |
| **Region** | A physical location with multiple data centers | A city (e.g., "Northern Virginia") |
| **Availability Zone (AZ)** | An isolated data center within a region | A different building in the same city |
| **Edge Location** | A mini data center that caches content near users | A local branch of a library |
| **Elasticity** | Automatically scale up/down with demand | A rubber band — stretches and snaps back |
| **Scalability** | Ability to handle growth | An elevator that can carry more weight |
| **High Availability (HA)** | System stays up even when parts fail | A hospital that never closes |
| **Fault Tolerance** | System continues working despite failures | A plane with 4 engines — still flies with 3 |
| **Disaster Recovery (DR)** | Plan for recovering from catastrophic failure | A fire escape plan |
| **Latency** | Delay between request and response | The wait time at a drive-through |
| **Throughput** | Amount of data processed in a given time | Lanes on a highway |
| **Provisioning** | Setting up and configuring resources | Furnishing a new apartment |

---

## Compute Terms

| Term | Definition | Analogy |
|------|-----------|---------|
| **EC2** | Virtual servers in the cloud | Renting a computer by the hour |
| **Instance** | A single virtual server | One rented computer |
| **AMI** | Amazon Machine Image — template for an EC2 instance | A blueprint for a house |
| **Lambda** | Runs code without servers, pay per execution | A vending machine — insert coin, get result |
| **Serverless** | AWS manages the servers; you just write code | Uber vs. owning a car |
| **Container** | Packaged app + dependencies that runs anywhere | A shipping container — same box fits any ship |
| **ECS / EKS** | Services that run containers | A container shipping port |
| **Fargate** | Serverless container runner | Uber for containers |
| **Elastic Beanstalk** | Upload code, AWS handles deployment | A restaurant where you bring the recipe, they cook |
| **Auto Scaling Group** | Automatically adds/removes EC2 instances | A store hiring temp workers during holidays |
| **Load Balancer (ELB)** | Distributes traffic across instances | A host at a restaurant seating people at open tables |

---

## Storage Terms

| Term | Definition | Analogy |
|------|-----------|---------|
| **S3** | Object storage for files | An infinite filing cabinet |
| **S3 Bucket** | A container that holds S3 objects | A folder in the filing cabinet |
| **S3 Object** | A file stored in S3 | A document in the folder |
| **EBS** | Block storage attached to EC2 (like a hard drive) | An external hard drive plugged into your computer |
| **EFS** | Shared file system across multiple EC2 | A network drive everyone in the office shares |
| **Glacier** | Cheap archive storage, slow retrieval | A storage unit across town — cheap rent, takes time to get stuff |
| **Storage Gateway** | Bridge between on-premises and cloud storage | A USB adapter between old and new devices |
| **Snowball** | Physical device to transfer huge data to AWS | Mailing a hard drive to AWS instead of uploading |
| **Snowmobile** | A literal truck for moving petabytes to AWS | A moving truck for your data |

---

## Database Terms

| Term | Definition | Analogy |
|------|-----------|---------|
| **RDS** | Managed relational database (SQL) | A maintained apartment vs. a house you maintain yourself |
| **Aurora** | AWS's super-fast relational database | RDS on steroids |
| **DynamoDB** | Fast NoSQL key-value database | A phone book — look up by name, get number instantly |
| **ElastiCache** | In-memory cache (super fast) | Sticky notes on your desk for stuff you look up often |
| **Redshift** | Data warehouse for analytics | A library's research archive |
| **Neptune** | Graph database | A social network map — who's friends with whom |
| **DocumentDB** | MongoDB-compatible document DB | Filing cabinets of JSON documents |

---

## Networking Terms

| Term | Definition | Analogy |
|------|-----------|---------|
| **VPC** | Virtual Private Cloud — your private network | Your own gated neighborhood in AWS |
| **Subnet** | A section of your VPC | A street within the neighborhood |
| **Public Subnet** | Accessible from the internet | A house with a front door facing the street |
| **Private Subnet** | NOT accessible from the internet | A house with no street entrance — backyard only |
| **Internet Gateway** | Connects your VPC to the internet | The gate at the entrance of the neighborhood |
| **NAT Gateway** | Lets private resources access the internet (outbound) | A P.O. box — you can send mail out, but nobody can come in |
| **Route 53** | AWS DNS service | A phone book that translates names to numbers |
| **CloudFront** | Content Delivery Network (CDN) | Local branches of a chain store — same product, closer to you |
| **Security Group** | Instance-level firewall (allow only) | A bouncer at a club — only lets approved people in |
| **NACL** | Subnet-level firewall (allow + deny) | The gate guard for the whole street |
| **Direct Connect** | Dedicated line from your building to AWS | A private highway with no traffic |
| **VPN** | Encrypted tunnel to AWS over the internet | A secret passage through a public area |
| **API Gateway** | Front door for APIs | A receptionist routing calls |

---

## Security Terms

| Term | Definition | Analogy |
|------|-----------|---------|
| **IAM** | Identity and Access Management | The building's security badge system |
| **IAM User** | A person or application identity | An employee badge |
| **IAM Group** | A collection of users | A department (all get the same access) |
| **IAM Role** | Temporary credentials for a service | A visitor pass — temporary, specific access |
| **IAM Policy** | JSON document defining permissions | The rules printed on the back of the badge |
| **MFA** | Multi-Factor Authentication | A lock that needs both a key AND a fingerprint |
| **Root Account** | The master account (email you signed up with) | The building's master key — lock it away |
| **KMS** | Key Management Service — manages encryption keys | A locksmith managing all your building's locks |
| **CloudTrail** | Records who did what (API audit log) | A security camera system |
| **GuardDuty** | AI-powered threat detection | A smart security guard that spots suspicious behavior |
| **WAF** | Web Application Firewall | A bouncer who knows common attack tricks |
| **Shield** | DDoS protection | Riot gear for your website |
| **Inspector** | Scans for vulnerabilities | A building inspector checking for code violations |
| **Artifact** | Compliance reports download portal | The file cabinet with all your compliance certificates |
| **Config** | Tracks resource configuration changes | A changelog for your building's blueprints |
| **Least Privilege** | Give minimum permissions needed | Keys only open the rooms you need — not every door |
| **SCP** | Service Control Policy (Organizations) | Building-wide rules that override individual badges |

---

## Management & Monitoring Terms

| Term | Definition | Analogy |
|------|-----------|---------|
| **CloudWatch** | Monitors performance metrics and logs | A fitness tracker for your AWS resources |
| **CloudWatch Alarm** | Alert when a metric crosses a threshold | Your fitness tracker buzzing when heart rate is too high |
| **CloudFormation** | Infrastructure as Code (templates) | A LEGO instruction manual — build the same thing every time |
| **Trusted Advisor** | Best-practices recommendation engine | A consultant who reviews your AWS setup |
| **Systems Manager** | Manage EC2 fleet (patching, commands) | An IT admin's remote management tool |
| **AWS Organizations** | Manage multiple AWS accounts | A corporate HQ managing branch offices |
| **Consolidated Billing** | One bill for all accounts in an Org | One family phone plan instead of individual plans |
| **AWS Health Dashboard** | Shows AWS service outages | A bus schedule status board |

---

## Billing Terms

| Term | Definition | Analogy |
|------|-----------|---------|
| **Free Tier** | Some services free up to a limit | Free samples at Costco |
| **On-Demand** | Pay per hour/second, no commitment | Paying per ride on a city bus |
| **Reserved Instance** | Commit 1-3 years for a discount | A monthly bus pass |
| **Savings Plan** | Commit $/hour for 1-3 years, flexible | A transit card with preloaded money |
| **Spot Instance** | Use spare capacity at huge discount, can be interrupted | Standby flights — cheap but you might get bumped |
| **Dedicated Host** | Physical server just for you | Renting the entire bus for yourself |
| **Cost Explorer** | Visualize and analyze past spending | Looking at your bank statement graphs |
| **AWS Budgets** | Set spending alerts | Setting a spending limit alert on your credit card |
| **Pricing Calculator** | Estimate costs before deploying | Getting a quote before hiring a contractor |
| **TCO** | Total Cost of Ownership | Comparing the FULL cost of owning vs. renting a house |
| **TAM** | Technical Account Manager (Enterprise support) | A dedicated account rep at your bank |
| **Concierge** | Billing/account help (Enterprise support) | A personal financial advisor |

---

## Quick-Fire Acronym Decoder

| Acronym | Full Name | Remember It As |
|---------|-----------|----------------|
| **EC2** | Elastic Compute Cloud | "E-C-two" = Electric Computer |
| **S3** | Simple Storage Service | 3 S's = Storage |
| **RDS** | Relational Database Service | "R" = Relational |
| **VPC** | Virtual Private Cloud | "V" = Virtual network |
| **IAM** | Identity and Access Management | "I AM allowed to..." |
| **ELB** | Elastic Load Balancer | "E-L-B" = Even Load Balance |
| **EBS** | Elastic Block Store | "E-B-S" = EC2's Block Storage |
| **EFS** | Elastic File System | "E-F-S" = Everyone's File Share |
| **SQS** | Simple Queue Service | A line at the store |
| **SNS** | Simple Notification Service | A text message blast |
| **SES** | Simple Email Service | "S-E-S" = Send Emails Simply |
| **CDN** | Content Delivery Network | Copies of content everywhere |
| **DNS** | Domain Name System | Internet phone book |
| **SSL/TLS** | Secure Sockets Layer / Transport Layer Security | The "s" in "https" |
| **MFA** | Multi-Factor Authentication | 2 locks on one door |
| **SCP** | Service Control Policy | Master rules for accounts |
| **OU** | Organizational Unit | Department within a company |
| **AZ** | Availability Zone | A data center building |
| **AMI** | Amazon Machine Image | Server blueprint |
| **ARN** | Amazon Resource Name | A resource's unique ID |
