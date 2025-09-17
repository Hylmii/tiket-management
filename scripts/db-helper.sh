#!/bin/bash

# Database Helper Script for Ticket Management System
# Usage: ./scripts/db-helper.sh [command]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DB_FILE="prisma/dev.db"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_database_lock() {
    echo_info "Checking for database locks..."
    
    if lsof "$PROJECT_ROOT/$DB_FILE" 2>/dev/null; then
        echo_warn "Database is locked by the above processes"
        return 1
    else
        echo_info "Database is not locked"
        return 0
    fi
}

kill_database_processes() {
    echo_info "Killing processes that might lock the database..."
    
    pkill -f "prisma studio" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    sleep 2
    
    if check_database_lock; then
        echo_info "All database locks cleared successfully"
    else
        echo_error "Some processes are still locking the database"
        return 1
    fi
}

sync_database() {
    echo_info "Syncing database schema..."
    cd "$PROJECT_ROOT"
    npx prisma db push
    echo_info "Database schema synced successfully"
}

reset_database() {
    echo_warn "This will delete all data in the database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo_info "Resetting database..."
        cd "$PROJECT_ROOT"
        npx prisma migrate reset --force
        echo_info "Database reset successfully"
    else
        echo_info "Database reset cancelled"
    fi
}

seed_database() {
    echo_info "Seeding database..."
    cd "$PROJECT_ROOT"
    npx prisma db seed
    echo_info "Database seeded successfully"
}

fix_lock_issue() {
    echo_info "Attempting to fix database lock issue..."
    
    kill_database_processes
    sync_database
    
    echo_info "Starting development server..."
    cd "$PROJECT_ROOT"
    npm run dev &
    
    echo_info "Database lock issue should be resolved"
}

show_help() {
    echo "Database Helper Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  check-lock    Check if database is locked"
    echo "  kill-procs    Kill processes that might lock the database"
    echo "  sync          Sync database schema"
    echo "  reset         Reset database (deletes all data)"
    echo "  seed          Seed database with initial data"
    echo "  fix-lock      Fix database lock issue (recommended)"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 fix-lock   # Fix common database lock issues"
    echo "  $0 reset      # Reset database completely"
}

# Main script logic
case "${1:-help}" in
    "check-lock")
        check_database_lock
        ;;
    "kill-procs")
        kill_database_processes
        ;;
    "sync")
        sync_database
        ;;
    "reset")
        reset_database
        ;;
    "seed")
        seed_database
        ;;
    "fix-lock")
        fix_lock_issue
        ;;
    "help"|*)
        show_help
        ;;
esac
