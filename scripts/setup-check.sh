#!/bin/bash

# Setup Verification Script for Ticket Management System
# This script verifies that the development environment is properly configured

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo_info() {
    echo -e "${GREEN}✓${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo_error() {
    echo -e "${RED}✗${NC} $1"
}

echo_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

check_file_exists() {
    if [ -f "$PROJECT_ROOT/$1" ]; then
        echo_info "$1 exists"
        return 0
    else
        echo_error "$1 missing"
        return 1
    fi
}

check_directory_exists() {
    if [ -d "$PROJECT_ROOT/$1" ]; then
        echo_info "$1/ directory exists"
        return 0
    else
        echo_error "$1/ directory missing"
        return 1
    fi
}

check_npm_packages() {
    cd "$PROJECT_ROOT"
    if npm list > /dev/null 2>&1; then
        echo_info "All npm packages installed"
        return 0
    else
        echo_error "Missing npm packages. Run: npm install"
        return 1
    fi
}

check_database() {
    cd "$PROJECT_ROOT"
    
    if [ -f "prisma/dev.db" ]; then
        echo_info "Database file exists"
    else
        echo_warn "Database file not found. Run: npm run db:sync"
    fi
    
    # Check if database is locked
    if lsof "prisma/dev.db" 2>/dev/null > /dev/null; then
        echo_warn "Database is currently locked by running processes"
        echo "         You may need to run: npm run db:fix"
    else
        echo_info "Database is not locked"
    fi
}

check_environment() {
    if [ -f "$PROJECT_ROOT/.env.local" ]; then
        echo_info ".env.local exists"
    else
        echo_warn ".env.local not found. Copy .env.example to .env.local"
    fi
}

run_basic_tests() {
    cd "$PROJECT_ROOT"
    
    echo_header "Running Basic Checks"
    
    # Check if we can import Prisma client
    if npx prisma version > /dev/null 2>&1; then
        echo_info "Prisma CLI working"
    else
        echo_error "Prisma CLI not working"
    fi
    
    # Check TypeScript compilation
    if npx tsc --noEmit > /dev/null 2>&1; then
        echo_info "TypeScript compilation successful"
    else
        echo_error "TypeScript compilation errors found"
    fi
}

main() {
    echo_header "Ticket Management System - Setup Verification"
    echo ""
    
    echo_header "File Structure Check"
    check_file_exists "package.json"
    check_file_exists "next.config.ts"
    check_file_exists "tsconfig.json"
    check_file_exists "postcss.config.mjs"
    check_file_exists "prisma/schema.prisma"
    check_file_exists ".env.example"
    
    check_directory_exists "src"
    check_directory_exists "src/app"
    check_directory_exists "src/components"
    check_directory_exists "prisma"
    check_directory_exists "scripts"
    
    echo ""
    echo_header "Dependencies Check"
    check_npm_packages
    
    echo ""
    echo_header "Environment Check"
    check_environment
    
    echo ""
    echo_header "Database Check"
    check_database
    
    echo ""
    run_basic_tests
    
    echo ""
    echo_header "Summary"
    echo ""
    echo "If all checks passed, your development environment is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Copy .env.example to .env.local and configure it"
    echo "2. Run: npm run db:sync"
    echo "3. Run: npm run db:seed"
    echo "4. Run: npm run dev"
    echo ""
    echo "For database issues, run: npm run db:fix"
    echo "For detailed help, check: DATABASE_TROUBLESHOOTING.md"
}

main "$@"
