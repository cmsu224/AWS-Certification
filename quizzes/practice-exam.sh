#!/bin/bash
# ============================================================
#  AWS Cloud Practitioner - Practice Exam Quiz
#  Run: bash practice-exam.sh
#  Options:
#    bash practice-exam.sh           → Full 20-question mini exam
#    bash practice-exam.sh domain1   → Cloud Concepts only
#    bash practice-exam.sh domain2   → Security & Compliance only
#    bash practice-exam.sh domain3   → Technology & Services only
#    bash practice-exam.sh domain4   → Billing & Pricing only
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Question format: "QUESTION|A|B|C|D|CORRECT_LETTER|EXPLANATION|DOMAIN"

QUESTIONS=(
  # Domain 1: Cloud Concepts
  "Which of the following is an advantage of cloud computing?|Trade capital expense for variable expense|Maintain physical data centers|Purchase hardware upfront|Guess your capacity needs|A|Cloud computing lets you pay only for what you use instead of buying expensive hardware upfront.|domain1"

  "What does 'elasticity' mean in AWS?|Data is encrypted automatically|Resources scale up and down automatically based on demand|Resources are always available|Data is replicated across regions|B|Elasticity means your infrastructure automatically scales to match demand — like a rubber band stretching and shrinking.|domain1"

  "Which is a benefit of AWS's massive economies of scale?|You can negotiate individual pricing|AWS passes savings to customers as lower pay-as-you-go prices|You must commit to long-term contracts|Only large companies can use AWS|B|Because AWS serves millions of customers, they buy infrastructure in bulk and pass the savings on to you.|domain1"

  "What is the AWS Well-Architected Framework?|A billing management tool|A set of best practices organized into 6 pillars for building reliable systems|A specific AWS service|A programming language|B|The Well-Architected Framework has 6 pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability.|domain1"

  "A company wants to deploy resources globally in minutes. Which advantage of cloud computing does this describe?|Stop guessing capacity|Increase speed and agility|Benefit from economies of scale|Go global in minutes|D|AWS has Regions worldwide. You can deploy your application to multiple Regions in minutes with a few clicks.|domain1"

  "What type of cloud deployment runs entirely on AWS with no on-premises infrastructure?|Hybrid cloud|Private cloud|Public cloud|Multi-cloud|C|Public cloud means everything runs on a cloud provider (AWS) — no hardware in your own data center.|domain1"

  "Which cloud service model gives you the MOST control over the underlying infrastructure?|SaaS|PaaS|IaaS|FaaS|C|IaaS (Infrastructure as a Service), like EC2, gives you control over the OS, networking, and storage. You manage the most.|domain1"

  "Which pillar of the Well-Architected Framework focuses on recovering from failures?|Security|Reliability|Performance Efficiency|Operational Excellence|B|The Reliability pillar ensures your system can recover from failures and meet demand.|domain1"

  # Domain 2: Security & Compliance
  "In the Shared Responsibility Model, which is the CUSTOMER's responsibility?|Physical security of data centers|Patching the hypervisor|Configuring security group rules|Maintaining networking hardware|C|Security groups are configured by YOU in the console, so they are YOUR responsibility. AWS handles the physical infrastructure.|domain2"

  "Which AWS service provides a centralized audit log of all API calls made in your account?|CloudWatch|CloudTrail|GuardDuty|Config|B|CloudTrail records every API call — who did what, when, and from where. Think: trail of footprints.|domain2"

  "What is the FIRST thing you should do after creating a new AWS account?|Launch an EC2 instance|Enable MFA on the root account|Create an S3 bucket|Set up CloudWatch|B|The root account has unlimited power. Enabling MFA (Multi-Factor Authentication) is the #1 security best practice.|domain2"

  "Which AWS service provides DDoS protection at no additional cost?|AWS WAF|AWS Shield Standard|AWS Shield Advanced|AWS GuardDuty|B|AWS Shield Standard is free and automatically protects all AWS customers against common DDoS attacks.|domain2"

  "What is the principle of least privilege?|Give everyone admin access for convenience|Assign permissions only after a security breach|Grant only the minimum permissions needed for a task|Use the root account for all operations|C|Least privilege means each user/role gets only the exact permissions they need — nothing more.|domain2"

  "Which of the following is a subnet-level firewall that supports both ALLOW and DENY rules?|Security Group|NACL (Network Access Control List)|WAF|IAM Policy|B|NACLs work at the subnet level and can both ALLOW and DENY traffic. Security Groups only have ALLOW rules.|domain2"

  "A company needs to download AWS SOC and PCI compliance reports. Which service should they use?|AWS Config|AWS Trusted Advisor|AWS Artifact|AWS Inspector|C|AWS Artifact is the self-service portal where you can download compliance reports and agreements.|domain2"

  "Which IAM feature should be used to grant an EC2 instance access to S3?|IAM User|IAM Group|IAM Role|Root account|C|IAM Roles provide temporary credentials to AWS services. Never put access keys on EC2 — use a role instead.|domain2"

  "What is the difference between encryption at rest and encryption in transit?|They are the same thing|At rest protects stored data; in transit protects data moving over the network|At rest is for databases only; in transit is for S3 only|Encryption at rest is always free; in transit costs extra|B|At rest = data sitting in storage (use KMS). In transit = data moving between systems (use SSL/TLS/HTTPS).|domain2"

  # Domain 3: Technology & Services
  "Which AWS service is a managed relational database?|DynamoDB|RDS|S3|Redshift|B|RDS (Relational Database Service) supports MySQL, PostgreSQL, Oracle, SQL Server, and MariaDB.|domain3"

  "What type of storage does S3 provide?|Block storage|File storage|Object storage|Database storage|C|S3 stores objects (files). Each object has a key, the data, and metadata. It's not a filesystem or database.|domain3"

  "Which EC2 pricing model offers up to 90% discount but your instance can be interrupted?|On-Demand|Reserved|Spot Instances|Dedicated Hosts|C|Spot Instances use spare EC2 capacity. Super cheap, but AWS can reclaim your instance with 2 minutes notice.|domain3"

  "A company needs to run code in response to events without managing servers. Which service should they use?|EC2|Lambda|ECS|Lightsail|B|Lambda is serverless — you upload code, it runs when triggered. No servers to manage, pay per request.|domain3"

  "Which service acts as a Content Delivery Network (CDN) to cache content at edge locations?|Route 53|CloudFront|Direct Connect|Global Accelerator|B|CloudFront caches copies of your content at 400+ edge locations worldwide so users get fast responses.|domain3"

  "What is the purpose of an Amazon VPC?|Store objects in the cloud|Create a private, isolated network in AWS|Manage DNS records|Monitor resource performance|B|A VPC (Virtual Private Cloud) is your own private network within AWS where you launch resources.|domain3"

  "Which service translates domain names (like example.com) into IP addresses?|CloudFront|Route 53|API Gateway|Direct Connect|B|Route 53 is AWS's DNS service. It routes users to your application by translating domain names to IPs.|domain3"

  "Which S3 storage class is the cheapest and designed for data that is rarely accessed and can wait hours for retrieval?|S3 Standard|S3 Standard-IA|S3 Glacier Deep Archive|S3 Intelligent-Tiering|C|S3 Glacier Deep Archive is the cheapest S3 class. Retrieval takes 12-48 hours. Great for compliance archives.|domain3"

  "What is CloudFormation used for?|Monitoring CPU metrics|Defining infrastructure as code using templates|Detecting security threats|Managing encryption keys|B|CloudFormation lets you define all your AWS resources in a YAML/JSON template and deploy them consistently.|domain3"

  "Which service provides intelligent threat detection by analyzing AWS account activity?|CloudTrail|GuardDuty|Inspector|Config|B|GuardDuty uses machine learning to analyze CloudTrail logs, VPC flow logs, and DNS logs to detect threats.|domain3"

  "A company needs to move 50TB of data to AWS. Uploading over the internet would take weeks. What should they use?|AWS Direct Connect|AWS Snowball Edge|AWS Storage Gateway|AWS DataSync|B|When transferring large amounts of data, Snowball Edge is a physical device shipped to you. Load data, ship it back.|domain3"

  "Which AWS service lets you query data in S3 using standard SQL without loading it into a database?|Redshift|RDS|Athena|DynamoDB|C|Athena is serverless — point it at S3 data, write SQL, get results. No infrastructure to manage.|domain3"

  "What is the difference between EBS and EFS?|EBS is object storage; EFS is block storage|EBS attaches to one EC2 instance; EFS is shared across multiple instances|They are the same service|EBS is for databases; EFS is for Lambda|B|EBS = one hard drive for one EC2. EFS = a shared network drive that multiple EC2 instances can access simultaneously.|domain3"

  # Domain 4: Billing & Pricing
  "Which AWS tool helps you estimate costs BEFORE deploying resources?|Cost Explorer|AWS Budgets|AWS Pricing Calculator|Trusted Advisor|C|The AWS Pricing Calculator lets you model your solution and estimate monthly costs before building anything.|domain4"

  "Which AWS tool lets you set alerts when your spending approaches a threshold you define?|Cost Explorer|AWS Budgets|Trusted Advisor|Pricing Calculator|B|AWS Budgets lets you set custom cost thresholds and sends alerts (email/SNS) when you approach or exceed them.|domain4"

  "Which support plan includes a Technical Account Manager (TAM)?|Basic|Developer|Business|Enterprise|D|A TAM is a dedicated AWS expert assigned to your account — only available with Enterprise support.|domain4"

  "How does Consolidated Billing help save money?|It provides a free tier for all accounts|Usage across all accounts is combined to qualify for volume discounts|It eliminates all AWS charges|It provides free Enterprise support|B|When accounts are combined under AWS Organizations, their usage is aggregated — which can unlock volume discounts.|domain4"

  "A company runs a web server 24/7 for the next 3 years. Which pricing model is most cost-effective?|On-Demand|Spot Instances|Reserved Instances or Savings Plans|Dedicated Hosts|C|For steady, predictable workloads running 24/7, Reserved Instances or Savings Plans offer up to 72% savings.|domain4"

  "Which service provides best-practice recommendations across cost, performance, security, fault tolerance, and service limits?|CloudWatch|AWS Config|CloudTrail|Trusted Advisor|D|Trusted Advisor checks your account against AWS best practices in 5 categories and gives recommendations.|domain4"

  "What is the AWS Free Tier?|A paid tier with discounted prices|A set of services that are free within certain usage limits|A support plan|A compliance program|B|The Free Tier includes always-free services, 12-month-free offers, and short-term trials — all with usage limits.|domain4"

  "Data transfer INTO AWS from the internet is generally:|Free|Charged per GB|Charged per request|Available only with Direct Connect|A|Data transfer IN to AWS is free. Data transfer OUT costs money. This is a common exam question!|domain4"

  # ============================================================
  #  Additional questions (expanded bank)
  # ============================================================

  # Domain 1: Cloud Concepts (additional)
  "Which cloud computing advantage eliminates the need to guess about infrastructure capacity?|Go global in minutes|Stop guessing capacity|Trade capital expense for variable expense|Increase speed and agility|B|Cloud computing allows you to scale up or down based on actual demand, so you never over-provision or under-provision.|domain1"
  "A hospital runs some workloads on AWS and keeps sensitive records in its own data center. What deployment model is this?|Public cloud|Private cloud|Hybrid cloud|Community cloud|C|Hybrid cloud combines on-premises infrastructure with public cloud resources.|domain1"
  "Gmail and Salesforce are examples of which cloud service model?|IaaS|PaaS|SaaS|FaaS|C|SaaS (Software as a Service) is a complete application managed by the provider. You just use it.|domain1"
  "What is an AWS Region?|A single data center|A geographic area with 2 or more Availability Zones|A caching location at the edge of the network|A virtual private network|B|An AWS Region is a physical location with multiple isolated data centers called Availability Zones.|domain1"
  "What are AWS Edge Locations used for?|Running EC2 instances|Hosting databases|Caching content closer to users via CloudFront|Managing IAM policies|C|Edge Locations are used by CloudFront to cache content close to end users for low latency.|domain1"
  "What is the difference between scalability and elasticity?|They are the same thing|Scalability is the ability to grow; elasticity is the ability to grow AND shrink automatically|Elasticity only applies to storage|Scalability only applies to databases|B|Scalability is about growing. Elasticity adds the ability to automatically scale back down when load decreases.|domain1"
  "What does 'high availability' mean in AWS?|The system is fast|The system remains operational during failures by running in multiple locations|The system has low cost|The system uses the latest hardware|B|High availability means designing systems to remain operational even when components fail.|domain1"
  "Which of the following is NOT an advantage of cloud computing?|Go global in minutes|Stop guessing capacity|Trade variable expense for capital expense|Benefit from economies of scale|C|Cloud computing trades CAPITAL expense for VARIABLE expense, not the other way around.|domain1"
  "Horizontal scaling means:|Upgrading to a larger instance|Adding more instances to handle load|Moving to a different Region|Increasing storage size|B|Horizontal scaling (scaling out) adds more instances. Vertical scaling (scaling up) increases size of a single instance.|domain1"
  "Which pillar of the Well-Architected Framework focuses on minimizing environmental impact?|Cost Optimization|Sustainability|Operational Excellence|Reliability|B|The Sustainability pillar focuses on minimizing the environmental impact of running cloud workloads.|domain1"
  "What does 'infrastructure as code' mean?|Writing code that runs on servers|Defining infrastructure through code/templates rather than manual configuration|Programming EC2 instances|Using the console to build infrastructure|B|IaC uses templates like CloudFormation to define your infrastructure, making it repeatable and version-controlled.|domain1"
  "What is a benefit of using multiple Availability Zones?|Lower costs|Higher fault tolerance and availability|Faster instance types|More storage capacity|B|Deploying across multiple AZs protects your application from a single data center failure.|domain1"
  "What does 'loose coupling' mean in cloud architecture?|Components have tight dependencies|Components are independent so failure in one does not cascade to others|All resources are in one AZ|Using a single large server|B|Loose coupling means components interact through well-defined interfaces, so one failure doesn't bring down others.|domain1"
  "A company must keep all data within Germany due to regulations. Which factor should guide their Region choice?|Pricing|Compliance|Latency|Service availability|B|Data residency and compliance requirements should be the first factor when choosing an AWS Region.|domain1"
  "Which AWS service helps you assess workloads against the Well-Architected Framework?|Trusted Advisor|AWS Well-Architected Tool|CloudFormation|AWS Config|B|The Well-Architected Tool reviews your workloads against the 6 pillars and provides improvement recommendations.|domain1"

  # Domain 2: Security & Compliance (additional)
  "In the Shared Responsibility Model, who is responsible for patching the guest OS on EC2?|AWS|The customer|Shared equally|The ISP|B|On EC2 (IaaS), YOU manage the guest OS, including patching. AWS manages the hardware and hypervisor.|domain2"
  "Which of the following is AWS's responsibility under the Shared Responsibility Model?|Encrypting customer data|Managing IAM users|Maintaining the underlying hardware and networking infrastructure|Configuring security groups|C|AWS manages the global infrastructure — hardware, networking, data centers, and the hypervisor.|domain2"
  "For Amazon RDS, who is responsible for patching the database engine?|Only the customer|Only AWS|Both|Neither|B|RDS is a managed service. AWS handles database engine patching.|domain2"
  "Why should you NOT use the root account for everyday tasks?|It is slower|It cannot access all services|It has unrestricted access, making it dangerous if compromised|It costs more|C|The root account has unlimited power. If compromised, an attacker can do anything.|domain2"
  "What is an IAM Group?|A collection of AWS accounts|A collection of IAM users that share the same permissions|A type of EC2 instance|A security group for networking|B|IAM Groups let you manage permissions for multiple users at once.|domain2"
  "What format are IAM Policies written in?|XML|YAML|JSON|CSV|C|IAM Policies are JSON documents that define permissions with Effect, Action, and Resource.|domain2"
  "What does MFA add to the sign-in process?|A fingerprint scan only|A second form of verification beyond just a password|Encryption to all data|An extra firewall|B|MFA requires something you know (password) + something you have (phone/token).|domain2"
  "Which IAM tool shows when each user last accessed specific AWS services?|IAM Credentials Report|IAM Access Advisor|CloudTrail|Trusted Advisor|B|IAM Access Advisor shows services each user has accessed, helping identify unused permissions.|domain2"
  "What is Amazon Macie?|A database service|A service that uses ML to discover and protect sensitive data in S3|A compute service|A networking service|B|Macie automatically discovers sensitive data stored in S3 (credit cards, SSNs, etc.).|domain2"
  "Which service should you use to store and automatically rotate database passwords?|KMS|AWS Secrets Manager|IAM|Parameter Store|B|Secrets Manager stores secrets and can automatically rotate them on a schedule.|domain2"
  "Security Groups are stateful. What does stateful mean?|Rules are processed in order|If inbound traffic is allowed, the response is automatically allowed out|Both ALLOW and DENY rules exist|Rules change based on time|B|Stateful means if you allow inbound traffic, the return traffic is automatically allowed.|domain2"
  "What is an SCP (Service Control Policy)?|An IAM policy for individual users|A policy in AWS Organizations that sets permission guardrails for entire accounts|A security group configuration|A billing policy|B|SCPs define the maximum permissions for member accounts in an Organization.|domain2"
  "Which compliance program is required for processing credit card payments?|HIPAA|SOC 2|PCI DSS|FedRAMP|C|PCI DSS is required for any organization that handles credit card data.|domain2"
  "Which regulation governs data protection for EU citizens?|HIPAA|PCI DSS|FedRAMP|GDPR|D|GDPR protects personal data of EU citizens regardless of where data is processed.|domain2"
  "What is the difference between Shield Standard and Shield Advanced?|Standard is paid, Advanced is free|Standard is free basic DDoS; Advanced adds 24/7 DRT support for a fee|They protect different services|No difference|B|Shield Standard is free and automatic. Advanced adds DDoS response team and cost protection.|domain2"
  "Which service tracks changes to your AWS resource configurations over time?|CloudTrail|CloudWatch|AWS Config|Inspector|C|AWS Config records how resources are configured and how configurations change.|domain2"
  "A developer needs temporary access to a production account. What should you use?|Share the root password|Create a permanent IAM user|Use IAM Roles with temporary credentials via STS|Give them access keys|C|IAM Roles via STS provide temporary credentials that expire.|domain2"
  "Which service provides a centralized view of security alerts across AWS services?|CloudTrail|GuardDuty|AWS Security Hub|Inspector|C|Security Hub aggregates findings from GuardDuty, Inspector, Macie into one dashboard.|domain2"
  "What is the best way to give an EC2 instance access to S3?|Store access keys in code|Attach an IAM Role to the instance|Use the root account|Hard-code passwords|B|Attach an IAM Role — the instance gets temporary credentials automatically.|domain2"
  "What does defense in depth mean in AWS security?|Using only one security tool|Applying multiple layers of security controls|Encrypting data once|Using only Shield|B|Defense in depth means multiple security layers so if one fails, others protect you.|domain2"

  # Domain 3: Technology & Services (additional)
  "Which EC2 instance type family is best for compute-intensive tasks like batch processing?|T (General Purpose)|R (Memory Optimized)|C (Compute Optimized)|I (Storage Optimized)|C|C-family instances are compute-optimized with high-performance processors.|domain3"
  "What is the maximum execution time for a single Lambda invocation?|5 minutes|15 minutes|1 hour|Unlimited|B|Lambda functions can run for a maximum of 15 minutes per invocation.|domain3"
  "Which AWS service is a simple, fixed-price virtual private server?|EC2|Lightsail|Lambda|Fargate|B|Lightsail offers simple VPS instances with a fixed monthly price.|domain3"
  "What is the main difference between ECS and EKS?|ECS runs containers; EKS does not|ECS is AWS-native orchestration; EKS uses Kubernetes|They are identical|EKS is serverless; ECS is not|B|ECS is AWS-native container orchestration. EKS uses Kubernetes (open-source).|domain3"
  "What does Fargate do?|Manages DNS records|Runs containers without managing servers or clusters|Provides DDoS protection|Stores objects|B|Fargate is serverless compute for containers. Works with ECS and EKS.|domain3"
  "Which type of ELB operates at the application layer (HTTP/HTTPS)?|Network Load Balancer|Application Load Balancer|Gateway Load Balancer|Classic Load Balancer|B|ALB operates at Layer 7 and can route based on URL path, host, headers, etc.|domain3"
  "S3 objects are stored in what?|Folders|Buckets|Volumes|Tables|B|S3 objects are stored in buckets. Bucket names must be globally unique.|domain3"
  "What is the durability of S3 Standard?|99%|99.9%|99.99%|99.999999999% (11 9s)|D|S3 Standard provides 99.999999999% durability — your data is extremely unlikely to be lost.|domain3"
  "What is Amazon Aurora?|A NoSQL database|AWS cloud-native relational database compatible with MySQL and PostgreSQL|A data warehouse|A graph database|B|Aurora is 5x faster than MySQL and 3x faster than PostgreSQL, with auto-scaling storage.|domain3"
  "Which database is best for single-digit millisecond performance at any scale?|RDS|Redshift|DynamoDB|Neptune|C|DynamoDB is designed for consistently fast performance at any scale.|domain3"
  "What is Amazon Redshift used for?|Transactional databases|Data warehousing and analytics|In-memory caching|Graph databases|B|Redshift is optimized for complex analytical queries on petabytes of data.|domain3"
  "Which database is best for highly connected data like social networks?|DynamoDB|RDS|Neptune|Redshift|C|Neptune is a graph database for highly connected datasets.|domain3"
  "What is a NAT Gateway?|Internet access for public subnets|Allows private subnet resources to access the internet for outbound traffic only|A firewall|A DNS resolver|B|NAT Gateway lets private subnet resources make outbound internet requests while remaining inaccessible from outside.|domain3"
  "What is AWS Direct Connect?|A VPN over the internet|A dedicated private connection from your premises to AWS|A CDN service|A DNS service|B|Direct Connect provides a dedicated, private connection — not over the public internet.|domain3"
  "Which service provides intelligent threat detection by analyzing logs using ML?|CloudTrail|GuardDuty|Inspector|Config|B|GuardDuty uses machine learning to analyze CloudTrail, VPC Flow Logs, and DNS logs to detect threats.|domain3"
  "What is the difference between SQS and SNS?|They are identical|SQS is a queue (pull); SNS is pub/sub (push to many)|SQS is for email; SNS for SMS|SNS is a queue; SQS is pub/sub|B|SQS = message queue (pull model). SNS = notification service (push to many subscribers).|domain3"
  "Which service provides real-time streaming data processing?|SQS|Athena|Kinesis|Redshift|C|Kinesis collects, processes, and analyzes real-time streaming data.|domain3"
  "Which AI service converts text into natural-sounding speech?|Transcribe|Lex|Polly|Comprehend|C|Polly turns text into lifelike speech in dozens of languages.|domain3"
  "Which AI service converts speech into text?|Polly|Transcribe|Translate|Comprehend|B|Transcribe automatically converts speech to text.|domain3"
  "Which AI service is used to build conversational chatbots?|Polly|Rekognition|Lex|Comprehend|C|Lex is the same technology behind Alexa — builds chatbots with speech and text.|domain3"
  "What is AWS Elastic Beanstalk?|A container service|A PaaS that handles deployment and scaling — you just upload code|A database|A security service|B|Elastic Beanstalk is PaaS — upload code and it handles everything else.|domain3"
  "Which Snow device holds up to 100 PB of data?|Snowcone|Snowball Edge|Snowmobile|Snowflake|C|Snowmobile is a 45-foot shipping container for up to 100 PB of data.|domain3"
  "What are the three ways to interact with AWS?|Web, mobile, desktop|AWS Console, CLI, and SDKs|Email, phone, chat|API Gateway, Lambda, EC2|B|You can use the Console (browser), CLI (command line), or SDKs (code).|domain3"
  "Which service orchestrates multiple AWS services into serverless workflows?|EventBridge|Step Functions|SQS|CloudFormation|B|Step Functions lets you build visual workflows coordinating Lambda and other services.|domain3"
  "What does VPC Peering allow?|Connection between VPC and internet|Private connectivity between two VPCs using AWS network|DNS routing|Data migration|B|VPC Peering connects two VPCs privately — traffic stays on AWS network.|domain3"
  "Which service lets you run serverless SQL queries on S3 data?|RDS|Redshift|Athena|DynamoDB|C|Athena is serverless — point at S3 data, write SQL, pay per query.|domain3"
  "What is AWS Outposts?|Migration service|AWS-managed infrastructure in your on-premises data center|Edge device|VPN service|B|Outposts brings AWS hardware and services into your data center.|domain3"

  # Domain 4: Billing & Pricing (additional)
  "Which of the following is an Always Free service?|EC2 t2.micro|Lambda (1 million requests/month)|RDS db.t2.micro|S3 5 GB|B|Lambda offers 1 million free requests per month as Always Free. EC2 and RDS are 12-month free.|domain4"
  "EC2 t2.micro is part of which Free Tier category?|Always Free|12-Month Free|Short-Term Trial|Enterprise Free|B|EC2 t2.micro gets 750 hours/month free for the first 12 months.|domain4"
  "What happens if you exceed Free Tier limits?|Account is suspended|You are charged standard pay-as-you-go rates|Nothing happens|AWS sends a warning only|B|Exceeding Free Tier limits means you pay normal on-demand prices for excess usage.|domain4"
  "Which tool visualizes past spending and can forecast future costs?|AWS Budgets|Pricing Calculator|Cost Explorer|Trusted Advisor|C|Cost Explorer lets you visualize spending over time and forecast future costs.|domain4"
  "What is the most detailed billing report from AWS?|Cost Explorer|Budgets report|Cost and Usage Report (CUR)|Dashboard summary|C|The CUR is the most detailed — granular data on every charge, downloadable as CSV.|domain4"
  "Which support plan offers 24/7 phone, email, and chat?|Basic|Developer|Business|Only Enterprise|C|Business support and above offers 24/7 phone, email, and chat.|domain4"
  "What is the response time for critical issues on Enterprise support?|1 hour|30 minutes|15 minutes|5 minutes|C|Enterprise offers less than 15-minute response for critical, system-down issues.|domain4"
  "How many core Trusted Advisor checks come with Basic and Developer support?|None|7|All|3|B|Basic and Developer get 7 core checks. Business and Enterprise get all checks.|domain4"
  "What is AWS Concierge Support?|A chatbot|Billing and account specialists available only with Enterprise support|Free for all|Third-party support|B|Concierge helps Enterprise customers with billing, account, and service-limit questions.|domain4"
  "Which pricing principle means you pay less per unit as usage increases?|Pay-as-you-go|Volume-based discounts|Reserve and save|Free Tier|B|Many AWS services offer tiered pricing where per-unit cost decreases with higher usage.|domain4"
  "Which of the following incurs data transfer charges?|Data transfer IN from internet|Data transfer between AZs in the same Region|Data within the same AZ|All data transfer is free|B|Data between AZs costs money. Data IN from internet is free.|domain4"
  "What is the difference between Reserved Instances and Savings Plans?|They are identical|Reserved lock to instance type; Savings Plans offer flexibility across types|Savings Plans cost more|Reserved are more flexible|B|Reserved commit to a specific instance type/Region. Savings Plans commit to $/hour and are more flexible.|domain4"
  "Why would a company use Dedicated Hosts?|Cheapest option|To use existing per-socket software licenses or meet compliance requirements|Serverless workloads|Temporary batch processing|B|Dedicated Hosts give you a physical server for certain licenses and compliance needs.|domain4"
  "What is right-sizing in AWS cost optimization?|Using the largest instance|Matching instance types to actual workload needs to avoid over-provisioning|Using only t2.micro|Running everything on Spot|B|Right-sizing means selecting the appropriate instance size so you don't pay for unused capacity.|domain4"
  "Which tool recommends optimal EC2 instance types based on usage?|Trusted Advisor|Compute Optimizer|Cost Explorer|Pricing Calculator|B|Compute Optimizer analyzes metrics and recommends optimal instance types.|domain4"
  "What is a cost allocation tag?|Physical tag on hardware|A label you attach to resources to track costs by project or department|A billing error|A discount code|B|Cost allocation tags help organize and track AWS costs by project, team, environment, etc.|domain4"
  "What is AWS Marketplace?|Online store for hardware|Digital catalog to find and deploy third-party software on AWS|Marketplace for selling data|Spot Instance auction|B|AWS Marketplace has thousands of third-party software listings deployable on your infrastructure.|domain4"
  "Which AWS service gives a personalized view of service health events affecting your resources?|Trusted Advisor|AWS Health Dashboard|CloudWatch|CloudTrail|B|AWS Health Dashboard shows how AWS service events may affect YOUR specific resources.|domain4"
)

CATEGORY="${1:-all}"
FILTERED=()

for q in "${QUESTIONS[@]}"; do
  domain=$(echo "$q" | awk -F'|' '{print $NF}')
  if [[ "$CATEGORY" == "all" ]] || [[ "$domain" == "$CATEGORY" ]]; then
    FILTERED+=("$q")
  fi
done

if [[ ${#FILTERED[@]} -eq 0 ]]; then
  echo -e "${RED}No questions found for: $CATEGORY${NC}"
  echo "Options: domain1, domain2, domain3, domain4, or no argument for all"
  exit 1
fi

# Shuffle
shuffled=()
temp=("${FILTERED[@]}")
while [[ ${#temp[@]} -gt 0 ]]; do
  idx=$((RANDOM % ${#temp[@]}))
  shuffled+=("${temp[$idx]}")
  temp=("${temp[@]:0:$idx}" "${temp[@]:$((idx+1))}")
done

# Limit to 20 for a mini exam when running all domains, or all if fewer
if [[ ${#shuffled[@]} -gt 20 && "$CATEGORY" == "all" ]]; then
  shuffled=("${shuffled[@]:0:20}")
fi

total=${#shuffled[@]}
correct=0
wrong=0
review=()

clear
echo -e "${BOLD}${CYAN}"
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║   AWS Cloud Practitioner — Practice Exam         ║"
echo "  ║                                                  ║"
echo "  ║   Category: $(printf '%-37s' "$CATEGORY")║"
echo "  ║   Questions: $(printf '%-36s' "$total")║"
echo "  ║   Passing score: 70%                             ║"
echo "  ║                                                  ║"
echo "  ║   Enter A, B, C, or D for each question          ║"
echo "  ║   Press Q to quit early                          ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
read -p "  Press Enter to start the exam..."

for i in "${!shuffled[@]}"; do
  IFS='|' read -r question optA optB optC optD answer explanation domain <<< "${shuffled[$i]}"

  num=$((i + 1))
  clear
  echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "  Question $num of $total  │  ${GREEN}✓ $correct${NC}  ${RED}✗ $wrong${NC}  │  Domain: ${CYAN}$domain${NC}"
  echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${BOLD}$question${NC}"
  echo ""
  echo -e "    ${BOLD}A)${NC} $optA"
  echo -e "    ${BOLD}B)${NC} $optB"
  echo -e "    ${BOLD}C)${NC} $optC"
  echo -e "    ${BOLD}D)${NC} $optD"
  echo ""

  while true; do
    read -p "  Your answer (A/B/C/D/Q): " user_answer
    user_answer=$(echo "$user_answer" | tr '[:lower:]' '[:upper:]')
    if [[ "$user_answer" =~ ^[ABCDQ]$ ]]; then
      break
    fi
    echo -e "  ${RED}Please enter A, B, C, D, or Q${NC}"
  done

  if [[ "$user_answer" == "Q" ]]; then
    break
  fi

  echo ""
  if [[ "$user_answer" == "$answer" ]]; then
    correct=$((correct + 1))
    echo -e "  ${GREEN}${BOLD}✓ CORRECT!${NC}"
  else
    wrong=$((wrong + 1))
    echo -e "  ${RED}${BOLD}✗ INCORRECT — The answer is $answer${NC}"
    review+=("${shuffled[$i]}")
  fi

  echo ""
  echo -e "  ${YELLOW}Explanation:${NC} $explanation"
  echo ""
  read -p "  Press Enter for next question..."
done

# Results
answered=$((correct + wrong))
if [[ $answered -gt 0 ]]; then
  pct=$((correct * 100 / answered))
else
  pct=0
fi

clear
echo -e "${BOLD}${CYAN}"
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║              EXAM RESULTS                        ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "  Questions:    $total"
echo -e "  Answered:     $answered"
echo -e "  ${GREEN}Correct:    $correct${NC}"
echo -e "  ${RED}Incorrect:  $wrong${NC}"
echo ""
echo -ne "  Score: ${BOLD}"

if [[ $pct -ge 70 ]]; then
  echo -ne "${GREEN}"
else
  echo -ne "${RED}"
fi
echo -e "$pct%${NC}"
echo ""

# Progress bar
bar_width=40
filled=$((pct * bar_width / 100))
empty=$((bar_width - filled))
echo -ne "  ["
if [[ $pct -ge 70 ]]; then
  color=$GREEN
else
  color=$RED
fi
for ((j=0; j<filled; j++)); do echo -ne "${color}█${NC}"; done
for ((j=0; j<empty; j++)); do echo -ne "░"; done
echo -e "]"
echo ""

echo -e "  Passing score: 70%"
if [[ $pct -ge 90 ]]; then
  echo -e "  ${GREEN}${BOLD}Outstanding! You're well prepared for the exam!${NC}"
elif [[ $pct -ge 70 ]]; then
  echo -e "  ${GREEN}${BOLD}PASS! Keep studying the areas below to strengthen your knowledge.${NC}"
elif [[ $pct -ge 50 ]]; then
  echo -e "  ${YELLOW}${BOLD}Almost there! Focus on the missed questions below.${NC}"
else
  echo -e "  ${RED}${BOLD}Keep studying! Review the cheat sheets and try again.${NC}"
fi

if [[ ${#review[@]} -gt 0 ]]; then
  echo ""
  echo -e "  ${BOLD}${YELLOW}═══ QUESTIONS TO REVIEW ═══${NC}"
  echo ""
  for q in "${review[@]}"; do
    IFS='|' read -r question optA optB optC optD answer explanation domain <<< "$q"
    echo -e "  ${BOLD}Q: $question${NC}"
    echo -e "  ${GREEN}Correct: $answer${NC} — $explanation"
    echo ""
  done
fi

echo ""
echo -e "  ${CYAN}Run specific domains:${NC}"
echo -e "  ${BOLD}bash practice-exam.sh domain1${NC}  → Cloud Concepts"
echo -e "  ${BOLD}bash practice-exam.sh domain2${NC}  → Security & Compliance"
echo -e "  ${BOLD}bash practice-exam.sh domain3${NC}  → Technology & Services"
echo -e "  ${BOLD}bash practice-exam.sh domain4${NC}  → Billing & Pricing"
echo ""
