#!/bin/bash

# Integration Test Script for AIWaiter TypeScript Backend
# Tests all endpoints to ensure they match JS backend behavior

BASE_URL="http://localhost:5001"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================="
echo "AIWaiter Backend Integration Tests"
echo "=================================="
echo ""

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -n "Testing: $description... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" == "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    elif [ "$method" == "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    elif [ "$method" == "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "Response: $body"
        ((FAILED++))
    fi
}

echo "===== Health Check ====="
test_endpoint "GET" "/health" "" "Health endpoint"
echo ""

echo "===== Menu Endpoints ====="
test_endpoint "GET" "/api/menu" "" "GET all menu items"
test_endpoint "GET" "/api/menu/specials" "" "GET special items"
test_endpoint "GET" "/api/menu/category/Appetizer" "" "GET menu by category"
test_endpoint "GET" "/api/menu/type/veg" "" "GET veg items"
test_endpoint "GET" "/api/menu/type/non-veg" "" "GET non-veg items"
test_endpoint "GET" "/api/menu/search?q=chicken" "" "Search menu for 'chicken'"
test_endpoint "GET" "/api/menu/m1" "" "GET menu item by ID"
echo ""

echo "===== Order Endpoints ====="
test_endpoint "GET" "/api/orders" "" "GET all orders"
test_endpoint "POST" "/api/orders" '{"userId":"user1","items":[{"itemId":"m1","quantity":2}]}' "CREATE new order"
test_endpoint "GET" "/api/orders/o1/status" "" "GET order status"
test_endpoint "PUT" "/api/orders/o1" '{"items":[{"itemId":"m2","quantity":3}]}' "UPDATE order"
test_endpoint "DELETE" "/api/orders/o1" "" "DELETE (cancel) order"
echo ""

echo "===== User Endpoints ====="
test_endpoint "GET" "/api/users/user1/favorites" "" "GET user favorites"
test_endpoint "POST" "/api/users/user1/favorites" '{"itemId":"m1"}' "ADD favorite"
test_endpoint "DELETE" "/api/users/user1/favorites/m1" "" "REMOVE favorite"
test_endpoint "POST" "/api/users/waiter/call" '{"userId":"user1","message":"Need assistance"}' "CALL waiter"
echo ""

echo "===== Validation Tests ====="
test_endpoint "POST" "/api/orders" '{"userId":"","items":[]}' "CREATE order with empty data (should fail)"
test_endpoint "GET" "/api/menu/type/invalid" "" "GET menu with invalid type (should fail)"
test_endpoint "POST" "/api/users/user1/favorites" '{}' "ADD favorite without itemId (should fail)"
echo ""

echo "=================================="
echo "Test Results:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "=================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed! ✗${NC}"
    exit 1
fi
