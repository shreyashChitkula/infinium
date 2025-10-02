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

# Function to verify JSON response
verify_json_response() {
    local response=$1
    if echo "$response" | grep -q "\"success\":true"; then
        return 0
    else
        return 1
    fi
}

echo -e "\n${BLUE}Starting API Tests...${NC}\n"

# Generate unique email for test
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_USERNAME="testuser${TIMESTAMP}"

# 1. Register a new user
echo -e "${BLUE}Test 1: Register New User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$TEST_USERNAME\",
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"password123\"
    }")

echo "Registration Response: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -n "$TOKEN" ]; then
    print_result 0 "User Registration"
else
    print_result 1 "User Registration (Token not found in response)"
fi

# 2. Login with the created user
echo -e "\n${BLUE}Test 2: User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"password123\"
    }")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
print_result $? "User Login"

# 3. Get user profile
echo -e "\n${BLUE}Test 3: Get User Profile${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $TOKEN")
print_result $? "Get User Profile"

# 4. Record workout event
echo -e "\n${BLUE}Test 4: Record Workout Event${NC}"
EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/events" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "eventType": "LOG_WORKOUT",
        "metadata": {
            "workoutType": "cardio",
            "duration": 30
        }
    }')
print_result $? "Record Workout Event"

# 5. Get event history
echo -e "\n${BLUE}Test 5: Get Event History${NC}"
HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/events/history" \
    -H "Authorization: Bearer $TOKEN")
print_result $? "Get Event History"

# 6. Test invalid login
echo -e "\n${BLUE}Test 6: Invalid Login Test${NC}"
INVALID_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "wrong@example.com",
        "password": "wrongpassword"
    }')
ERROR_MESSAGE=$(echo $INVALID_LOGIN_RESPONSE | grep -o '"message":"[^"]*' | grep -o '[^"]*$')
if [[ $ERROR_MESSAGE == *"Invalid credentials"* ]]; then
    print_result 0 "Invalid Login Rejection"
else
    print_result 1 "Invalid Login Rejection"
fi

# 7. Test unauthorized access
echo -e "\n${BLUE}Test 7: Unauthorized Access Test${NC}"
UNAUTH_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile")
ERROR_MESSAGE=$(echo $UNAUTH_RESPONSE | grep -o '"message":"[^"]*' | grep -o '[^"]*$')
if [[ $ERROR_MESSAGE == *"No authentication token"* ]]; then
    print_result 0 "Unauthorized Access Rejection"
else
    print_result 1 "Unauthorized Access Rejection"
fi

# 8. Test Challenge Creation
echo -e "\n${BLUE}Test 8: Create Challenge${NC}"
CHALLENGE_RESPONSE=$(curl -s -X GET "$BASE_URL/challenges/personalized" \
    -H "Authorization: Bearer $TOKEN")
print_result $? "Create Personalized Challenge"

# 9. Test Leaderboard
echo -e "\n${BLUE}Test 9: Get Leaderboard${NC}"
LEADERBOARD_RESPONSE=$(curl -s -X GET "$BASE_URL/leaderboard" \
    -H "Authorization: Bearer $TOKEN")
print_result $? "Get Leaderboard"

# 10. Test Analytics
echo -e "\n${BLUE}Test 10: Get User Analytics${NC}"
ANALYTICS_RESPONSE=$(curl -s -X GET "$BASE_URL/analytics/user/$USER_ID" \
    -H "Authorization: Bearer $TOKEN")
print_result $? "Get User Analytics"

# Insurance Tests
echo -e "\n${BLUE}Testing Insurance Endpoints${NC}"

# 11. Get all insurance plans
echo -e "\n${BLUE}Test 11: Get All Insurance Plans${NC}"
PLANS_RESPONSE=$(curl -s -X GET "$BASE_URL/insurance/plans" \
    -H "Authorization: Bearer $TOKEN")
if [[ $PLANS_RESPONSE == *"\"success\":true"* ]]; then
    print_result 0 "Get All Insurance Plans"
else
    print_result 1 "Get All Insurance Plans"
fi

# 12. Get specific plan details
echo -e "\n${BLUE}Test 12: Get Specific Plan Details${NC}"
PLAN_ID=$(echo $PLANS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | grep -o '[^"]*$')
if [ -n "$PLAN_ID" ]; then
    PLAN_RESPONSE=$(curl -s -X GET "$BASE_URL/insurance/plans/$PLAN_ID" \
        -H "Authorization: Bearer $TOKEN")
    if [[ $PLAN_RESPONSE == *"\"success\":true"* ]]; then
        print_result 0 "Get Specific Plan Details"
    else
        print_result 1 "Get Specific Plan Details"
    fi
else
    print_result 1 "Get Specific Plan Details (No plan ID found)"
fi

# 13. Calculate potential discounts
echo -e "\n${BLUE}Test 13: Calculate Potential Discounts${NC}"
DISCOUNT_RESPONSE=$(curl -s -X GET "$BASE_URL/insurance/calculate-discount" \
    -H "Authorization: Bearer $TOKEN")
if [[ $DISCOUNT_RESPONSE == *"\"success\":true"* ]]; then
    print_result 0 "Calculate Potential Discounts"
else
    print_result 1 "Calculate Potential Discounts"
fi

# 14. Enroll in insurance plan
echo -e "\n${BLUE}Test 14: Enroll in Insurance Plan${NC}"
if [ -n "$PLAN_ID" ]; then
    ENROLL_RESPONSE=$(curl -s -X POST "$BASE_URL/insurance/enroll" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"planId\": \"$PLAN_ID\"}")
    if [[ $ENROLL_RESPONSE == *"\"success\":true"* ]]; then
        print_result 0 "Enroll in Insurance Plan"
    else
        print_result 1 "Enroll in Insurance Plan"
    fi
else
    print_result 1 "Enroll in Insurance Plan (No plan ID found)"
fi

# 15. Get current insurance details
echo -e "\n${BLUE}Test 15: Get Current Insurance Details${NC}"
CURRENT_INSURANCE_RESPONSE=$(curl -s -X GET "$BASE_URL/insurance/current" \
    -H "Authorization: Bearer $TOKEN")
if [[ $CURRENT_INSURANCE_RESPONSE == *"\"success\":true"* ]]; then
    print_result 0 "Get Current Insurance Details"
else
    print_result 1 "Get Current Insurance Details"
fi

# Print summary
echo -e "\n${BLUE}Test Summary:${NC}"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo -e "Total: $((PASS + FAIL))\n"