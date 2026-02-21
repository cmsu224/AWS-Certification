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

# Limit to 20 for a mini exam, or all if fewer
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
