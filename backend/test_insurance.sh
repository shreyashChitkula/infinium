#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# Base URL
BASE_URL="http://localhost:3001/api"

# Test counter
PASS=0
FAIL=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        FAIL=$((FAIL + 1))
    fi
}

echo -e "\n${BLUE}Starting Insurance API Tests...${NC}\n"

# Generate unique email for test user
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_USERNAME="testuser${TIMESTAMP}"

# 1. Register a test user
echo -e "${BLUE}Test 1: Register Test User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$TEST_USERNAME\",
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"password123\"
    }")

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -n "$TOKEN" ]; then
    print_result 0 "User Registration"
else
    print_result 1 "User Registration"
    exit 1
fi

# 2. Get all insurance plans
echo -e "\n${BLUE}Test 2: Get All Insurance Plans${NC}"
PLANS_RESPONSE=$(curl -s -X GET "$BASE_URL/insurance/plans" \
    -H "Authorization: Bearer $TOKEN")

if [[ $PLANS_RESPONSE == *"\"success\":true"* ]]; then
    print_result 0 "Get All Insurance Plans"
    echo "Available Plans:"
    echo "$PLANS_RESPONSE" | grep -o '"name":"[^"]*' | cut -d'"' -f4
else
    print_result 1 "Get All Insurance Plans"
    exit 1
fi

# 3. Get specific plan details
echo -e "\n${BLUE}Test 3: Get Specific Plan Details${NC}"
PLAN_ID=$(echo $PLANS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')

if [ -n "$PLAN_ID" ]; then
    PLAN_RESPONSE=$(curl -s -X GET "$BASE_URL/insurance/plans/$PLAN_ID" \
        -H "Authorization: Bearer $TOKEN")
    
    if [[ $PLAN_RESPONSE == *"\"success\":true"* ]]; then
        print_result 0 "Get Specific Plan Details"
        echo "Plan Details:"
        echo "$PLAN_RESPONSE" | grep -o '"name":"[^"]*\|"premium":[0-9.]*\|"coverage":[0-9.]*' | tr '\n' ' ' | sed 's/\"//g'
        echo
    else
        print_result 1 "Get Specific Plan Details"
    fi
else
    print_result 1 "Get Specific Plan Details (No plan ID found)"
fi

# 4. Record some activities to affect discount
echo -e "\n${BLUE}Test 4: Record Activities for Discount${NC}"

# Record exercise event
EXERCISE_RESPONSE=$(curl -s -X POST "$BASE_URL/events" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "eventType": "exercise",
        "metadata": {
            "duration": 30,
            "type": "running"
        }
    }')

# Record health score
HEALTH_SCORE_RESPONSE=$(curl -s -X POST "$BASE_URL/events" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "eventType": "health_score",
        "metadata": {
            "score": 85
        }
    }')

# Record checkup
CHECKUP_RESPONSE=$(curl -s -X POST "$BASE_URL/events" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "eventType": "checkup",
        "metadata": {
            "type": "annual",
            "completed": true
        }
    }')

if [[ $EXERCISE_RESPONSE == *"\"success\":true"* ]] && 
   [[ $HEALTH_SCORE_RESPONSE == *"\"success\":true"* ]] && 
   [[ $CHECKUP_RESPONSE == *"\"success\":true"* ]]; then
    print_result 0 "Record Activities for Discount"
else
    print_result 1 "Record Activities for Discount"
fi

# 5. Calculate potential discounts
echo -e "\n${BLUE}Test 5: Calculate Potential Discounts${NC}"
DISCOUNT_RESPONSE=$(curl -s -X GET "$BASE_URL/insurance/calculate-discount" \
    -H "Authorization: Bearer $TOKEN")

if [[ $DISCOUNT_RESPONSE == *"\"success\":true"* ]]; then
    print_result 0 "Calculate Potential Discounts"
    echo "Calculated Discount:"
    echo "$DISCOUNT_RESPONSE" | grep -o '"discountPercentage":"[^"]*' | cut -d'"' -f4
else
    print_result 1 "Calculate Potential Discounts"
fi

# 6. Enroll in insurance plan
echo -e "\n${BLUE}Test 6: Enroll in Insurance Plan${NC}"
if [ -n "$PLAN_ID" ]; then
    ENROLL_RESPONSE=$(curl -s -X POST "$BASE_URL/insurance/enroll" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"planId\": \"$PLAN_ID\"}")
    
    if [[ $ENROLL_RESPONSE == *"\"success\":true"* ]]; then
        print_result 0 "Enroll in Insurance Plan"
        echo "Enrollment Details:"
        echo "$ENROLL_RESPONSE" | grep -o '"initialDiscount":[0-9.]*' | cut -d':' -f2
    else
        print_result 1 "Enroll in Insurance Plan"
    fi
else
    print_result 1 "Enroll in Insurance Plan (No plan ID found)"
fi

# 7. Get current insurance details
echo -e "\n${BLUE}Test 7: Get Current Insurance Details${NC}"
CURRENT_INSURANCE_RESPONSE=$(curl -s -X GET "$BASE_URL/insurance/current" \
    -H "Authorization: Bearer $TOKEN")

if [[ $CURRENT_INSURANCE_RESPONSE == *"\"success\":true"* ]]; then
    print_result 0 "Get Current Insurance Details"
    echo "Current Insurance Details:"
    echo "$CURRENT_INSURANCE_RESPONSE" | grep -o '"name":"[^"]*\|"currentDiscount":[0-9.]*\|"premium":[0-9.]*' | tr '\n' ' ' | sed 's/\"//g'
    echo
else
    print_result 1 "Get Current Insurance Details"
fi

# Print summary
echo -e "\n${BLUE}Test Summary:${NC}"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo -e "Total: $((PASS + FAIL))\n"

# Exit with status code based on failures
if [ $FAIL -gt 0 ]; then
    exit 1
else
    exit 0
fi