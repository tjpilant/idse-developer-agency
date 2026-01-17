#!/bin/bash
# Run SQL migrations against Supabase database
# Usage: ./run_migrations.sh 008 009

set -e  # Exit on error

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -E "SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY" | xargs)
fi

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: SUPABASE_URL not set in .env"
    exit 1
fi

# Extract PostgreSQL connection string from Supabase URL
# Supabase URL format: https://xxxxx.supabase.co
# PostgreSQL format: postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
PROJECT_REF=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|.supabase.co||')

echo "============================================================"
echo "🚀 SUPABASE MIGRATION RUNNER"
echo "============================================================"
echo "Project: $PROJECT_REF"
echo "============================================================"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed"
    echo ""
    echo "Please install PostgreSQL client:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  macOS: brew install postgresql"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    echo ""
    echo "OR run migrations manually via Supabase SQL Editor:"
    echo "  1. Go to https://supabase.com/dashboard/project/$PROJECT_REF/sql"
    echo "  2. Copy contents of backend/supabase/migrations/008_add_session_state.sql"
    echo "  3. Paste and run"
    echo "  4. Repeat for 009_seed_blueprint_sessions.sql"
    exit 1
fi

# Run each migration passed as argument
for MIGRATION_NUM in "$@"; do
    MIGRATION_FILE=$(ls backend/supabase/migrations/${MIGRATION_NUM}_*.sql 2>/dev/null | head -1)

    if [ -z "$MIGRATION_FILE" ]; then
        echo "❌ Migration $MIGRATION_NUM not found"
        continue
    fi

    echo "📂 Running migration: $(basename $MIGRATION_FILE)"
    echo ""

    # Note: This requires the PostgreSQL password
    # Users should use Supabase SQL Editor for easier execution
    echo "⚠️  Direct PostgreSQL connection requires database password."
    echo "   Recommended: Use Supabase SQL Editor instead:"
    echo "   https://supabase.com/dashboard/project/$PROJECT_REF/sql"
    echo ""
    echo "   Or use this command with your DB password:"
    echo "   psql 'postgresql://postgres:[PASSWORD]@db.$PROJECT_REF.supabase.co:5432/postgres' -f $MIGRATION_FILE"
    echo ""
done

echo "============================================================"
echo "✅ Migration script complete"
echo "============================================================"
echo ""
echo "To run migrations via Supabase SQL Editor:"
echo "1. Visit: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
echo "2. Copy and paste contents of:"
echo "   - backend/supabase/migrations/008_add_session_state.sql"
echo "   - backend/supabase/migrations/009_seed_blueprint_sessions.sql"
echo "3. Click 'Run' for each migration"
echo ""
