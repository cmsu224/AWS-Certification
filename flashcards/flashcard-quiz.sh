#!/bin/bash
# ============================================================
#  AWS Cloud Practitioner - Interactive Flashcard Quiz
#  Run: bash flashcard-quiz.sh
#  Options:
#    bash flashcard-quiz.sh          → All categories
#    bash flashcard-quiz.sh compute  → Compute only
#    bash flashcard-quiz.sh storage  → Storage only
#    bash flashcard-quiz.sh database → Database only
#    bash flashcard-quiz.sh network  → Networking only
#    bash flashcard-quiz.sh security → Security only
#    bash flashcard-quiz.sh billing  → Billing only
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Flashcard data: "TERM|DEFINITION|CATEGORY"
CARDS=(
  # Compute
  "EC2|Virtual servers in the cloud — you rent computing power by the hour or second|compute"
  "Lambda|Serverless compute — run code without managing servers, pay per request|compute"
  "Elastic Beanstalk|PaaS — upload your code and AWS handles deployment, scaling, monitoring|compute"
  "ECS|Elastic Container Service — run and manage Docker containers on AWS|compute"
  "EKS|Elastic Kubernetes Service — managed Kubernetes for running containers|compute"
  "Fargate|Serverless container engine — run containers without managing servers|compute"
  "Lightsail|Simple virtual private server — easy starter option, fixed monthly price|compute"
  "Auto Scaling|Automatically adds or removes EC2 instances based on demand|compute"
  "Elastic Load Balancer (ELB)|Distributes incoming traffic across multiple EC2 instances|compute"
  "AMI|Amazon Machine Image — a template/blueprint to launch EC2 instances|compute"

  # Storage
  "S3|Simple Storage Service — object storage for files, unlimited capacity|storage"
  "S3 Glacier|Very cheap archive storage with slow retrieval (minutes to hours)|storage"
  "S3 Intelligent-Tiering|Automatically moves data between access tiers to save money|storage"
  "EBS|Elastic Block Store — hard drive for EC2 (attached to one instance)|storage"
  "EFS|Elastic File System — shared file storage across multiple EC2 instances|storage"
  "Storage Gateway|Hybrid storage bridge between on-premises and AWS cloud|storage"
  "Snowball Edge|Physical device to transfer large amounts of data to AWS (up to 80TB)|storage"
  "Snowmobile|A literal shipping container truck to move up to 100PB of data to AWS|storage"

  # Database
  "RDS|Relational Database Service — managed SQL databases (MySQL, PostgreSQL, etc.)|database"
  "Aurora|AWS's own relational database — 5x faster than MySQL, auto-scales|database"
  "DynamoDB|Fully managed NoSQL key-value database — single-digit millisecond performance|database"
  "ElastiCache|In-memory caching service (Redis or Memcached) for ultra-fast data access|database"
  "Redshift|Data warehouse for analytics and business intelligence on petabytes of data|database"
  "Neptune|Graph database for highly connected datasets like social networks|database"
  "DMS|Database Migration Service — helps move databases to AWS|database"

  # Networking
  "VPC|Virtual Private Cloud — your own isolated private network within AWS|network"
  "Subnet|A range of IP addresses within a VPC (public or private)|network"
  "Internet Gateway|Connects a VPC to the public internet|network"
  "NAT Gateway|Allows private subnet resources to access the internet (outbound only)|network"
  "Route 53|AWS DNS service — translates domain names to IP addresses|network"
  "CloudFront|Content Delivery Network (CDN) — caches content at 400+ edge locations|network"
  "Direct Connect|Dedicated private connection from your data center to AWS (not internet)|network"
  "API Gateway|Fully managed service to create, publish, and manage REST APIs|network"
  "Global Accelerator|Routes traffic to the nearest AWS endpoint for better performance|network"

  # Security
  "IAM|Identity and Access Management — controls who can access what in AWS|security"
  "IAM Policy|A JSON document that defines permissions (allow or deny actions)|security"
  "IAM Role|Temporary credentials assigned to a service or application (not a person)|security"
  "MFA|Multi-Factor Authentication — requires two or more verification methods|security"
  "KMS|Key Management Service — create and manage encryption keys|security"
  "CloudTrail|Records all API calls in your account — the audit log of who did what|security"
  "GuardDuty|Intelligent threat detection — uses ML to find suspicious activity|security"
  "Security Group|Instance-level firewall that only has ALLOW rules (stateful)|security"
  "NACL|Network Access Control List — subnet-level firewall with ALLOW and DENY rules (stateless)|security"
  "WAF|Web Application Firewall — protects against SQL injection, XSS, and other web attacks|security"
  "Shield|DDoS protection — Standard (free) and Advanced (paid)|security"
  "Inspector|Automated vulnerability scanning for EC2 instances and containers|security"
  "AWS Config|Tracks configuration changes to your resources over time|security"
  "Artifact|Self-service portal to download AWS compliance reports (SOC, PCI, ISO)|security"
  "Shared Responsibility Model|AWS secures the cloud infrastructure; YOU secure what you put IN the cloud|security"
  "Principle of Least Privilege|Give users only the minimum permissions they need — nothing more|security"
  "IAM Identity Center (SSO)|Single sign-on to access multiple AWS accounts and business apps|security"

  # Billing & Support
  "Free Tier|Some services are free (always free, 12-month free, or short-term trials)|billing"
  "On-Demand Pricing|Pay per hour/second with no commitment — most flexible, no discount|billing"
  "Reserved Instances|1 or 3 year commitment for up to 72% discount on EC2|billing"
  "Savings Plans|Commit to a $/hour spend for 1-3 years — flexible across instance types|billing"
  "Spot Instances|Use spare AWS capacity at up to 90% discount — can be interrupted with 2 min notice|billing"
  "Dedicated Hosts|A physical server dedicated to you — most expensive, for compliance/licensing|billing"
  "Cost Explorer|Visualize, understand, and forecast your AWS spending over time|billing"
  "AWS Budgets|Set custom spending thresholds and get alerts when you approach or exceed them|billing"
  "Pricing Calculator|Estimate the cost of AWS services BEFORE you deploy|billing"
  "Trusted Advisor|Checks your account against best practices (cost, performance, security, fault tolerance, service limits)|billing"
  "Consolidated Billing|One bill for all accounts in an AWS Organization — get volume discounts|billing"
  "TAM|Technical Account Manager — a dedicated AWS expert, only with Enterprise support|billing"
  "AWS Organizations|Manage multiple AWS accounts centrally with consolidated billing and SCPs|billing"
  "SCP|Service Control Policy — guardrails that restrict what accounts in an Organization can do|billing"
)

# Filter by category if argument provided
CATEGORY="${1:-all}"
FILTERED_CARDS=()

for card in "${CARDS[@]}"; do
  cat_field=$(echo "$card" | cut -d'|' -f3)
  if [[ "$CATEGORY" == "all" ]] || [[ "$cat_field" == "$CATEGORY" ]]; then
    FILTERED_CARDS+=("$card")
  fi
done

if [[ ${#FILTERED_CARDS[@]} -eq 0 ]]; then
  echo -e "${RED}No cards found for category: $CATEGORY${NC}"
  echo "Available categories: compute, storage, database, network, security, billing"
  exit 1
fi

# Shuffle cards
shuffled=()
while [[ ${#FILTERED_CARDS[@]} -gt 0 ]]; do
  idx=$((RANDOM % ${#FILTERED_CARDS[@]}))
  shuffled+=("${FILTERED_CARDS[$idx]}")
  FILTERED_CARDS=("${FILTERED_CARDS[@]:0:$idx}" "${FILTERED_CARDS[@]:$((idx+1))}")
done

clear
echo -e "${BOLD}${CYAN}"
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║   AWS Cloud Practitioner - Flashcard Quiz        ║"
echo "  ║                                                  ║"
echo "  ║   Category: $(printf '%-37s' "$CATEGORY")║"
echo "  ║   Cards: $(printf '%-40s' "${#shuffled[@]}")║"
echo "  ║                                                  ║"
echo "  ║   Controls:                                      ║"
echo "  ║   [Enter] → Reveal answer                        ║"
echo "  ║   [y]     → I knew it! (correct)                 ║"
echo "  ║   [n]     → I didn't know (review later)         ║"
echo "  ║   [q]     → Quit                                 ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
read -p "Press Enter to start..."

correct=0
incorrect=0
review=()
total=${#shuffled[@]}

for i in "${!shuffled[@]}"; do
  card="${shuffled[$i]}"
  term=$(echo "$card" | cut -d'|' -f1)
  definition=$(echo "$card" | cut -d'|' -f2)
  category=$(echo "$card" | cut -d'|' -f3)

  clear
  num=$((i + 1))
  echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  Card $num of $total${NC}  │  ${CYAN}$category${NC}  │  ${GREEN}✓ $correct${NC}  ${RED}✗ $incorrect${NC}"
  echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${BOLD}${YELLOW}What is:  $term  ?${NC}"
  echo ""
  echo -e "  ${CYAN}(Think about it, then press Enter to reveal)${NC}"
  echo ""

  read -s -n 1 key
  if [[ "$key" == "q" ]]; then
    break
  fi

  echo -e "  ${BOLD}${GREEN}Answer:${NC}"
  echo -e "  $definition"
  echo ""
  echo -e "  ─────────────────────────────────────────────────"
  echo -e "  Did you know it?  ${GREEN}[y] Yes${NC}  │  ${RED}[n] No${NC}  │  [q] Quit"
  echo ""

  while true; do
    read -s -n 1 answer
    case "$answer" in
      y|Y)
        correct=$((correct + 1))
        echo -e "  ${GREEN}✓ Nice!${NC}"
        sleep 0.5
        break
        ;;
      n|N)
        incorrect=$((incorrect + 1))
        review+=("$card")
        echo -e "  ${RED}✗ Added to review pile${NC}"
        sleep 0.5
        break
        ;;
      q|Q)
        break 2
        ;;
    esac
  done
done

# Results
clear
echo -e "${BOLD}${CYAN}"
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║               QUIZ RESULTS                       ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

answered=$((correct + incorrect))
if [[ $answered -gt 0 ]]; then
  pct=$((correct * 100 / answered))
else
  pct=0
fi

echo -e "  Total cards:     $total"
echo -e "  Answered:        $answered"
echo -e "  ${GREEN}Correct:       $correct${NC}"
echo -e "  ${RED}Missed:        $incorrect${NC}"
echo ""

if [[ $answered -gt 0 ]]; then
  echo -e "  Score: ${BOLD}$pct%${NC}"
  echo ""

  # Progress bar
  bar_width=40
  filled=$((pct * bar_width / 100))
  empty=$((bar_width - filled))
  echo -ne "  ["
  for ((j=0; j<filled; j++)); do echo -ne "${GREEN}█${NC}"; done
  for ((j=0; j<empty; j++)); do echo -ne "░"; done
  echo -e "]"
  echo ""

  if [[ $pct -ge 90 ]]; then
    echo -e "  ${GREEN}${BOLD}Excellent! You're exam ready for this section!${NC}"
  elif [[ $pct -ge 70 ]]; then
    echo -e "  ${YELLOW}${BOLD}Good progress! Review the missed terms below.${NC}"
  else
    echo -e "  ${RED}${BOLD}Keep studying! Review the terms below and try again.${NC}"
  fi
fi

# Show review pile
if [[ ${#review[@]} -gt 0 ]]; then
  echo ""
  echo -e "  ${BOLD}${YELLOW}═══ TERMS TO REVIEW ═══${NC}"
  echo ""
  for card in "${review[@]}"; do
    term=$(echo "$card" | cut -d'|' -f1)
    definition=$(echo "$card" | cut -d'|' -f2)
    echo -e "  ${BOLD}$term${NC}"
    echo -e "  $definition"
    echo ""
  done
fi

echo ""
echo -e "  ${CYAN}Tip: Run again with a specific category:${NC}"
echo -e "  ${BOLD}bash flashcard-quiz.sh compute${NC}"
echo -e "  ${BOLD}bash flashcard-quiz.sh security${NC}"
echo ""
