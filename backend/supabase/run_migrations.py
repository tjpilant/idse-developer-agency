#!/usr/bin/env python3
"""
Run SQL migrations against Supabase database.

Usage:
    python3 backend/supabase/run_migrations.py 008
    python3 backend/supabase/run_migrations.py 009
    python3 backend/supabase/run_migrations.py 008 009  # Run multiple
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    sys.exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def run_migration(migration_number: str):
    """Run a specific migration file."""
    migrations_dir = Path(__file__).parent / "migrations"
    migration_file = migrations_dir / f"{migration_number}_*.sql"

    # Find the migration file (handles wildcard)
    matching_files = list(migrations_dir.glob(f"{migration_number}_*.sql"))

    if not matching_files:
        print(f"❌ Migration {migration_number} not found in {migrations_dir}")
        return False

    migration_path = matching_files[0]

    print(f"\n📂 Running migration: {migration_path.name}")
    print(f"   Path: {migration_path}")

    # Read SQL file
    try:
        sql_content = migration_path.read_text()
    except Exception as e:
        print(f"❌ Failed to read migration file: {e}")
        return False

    # Split by semicolons to execute statements separately
    statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]

    # Execute each statement
    for i, statement in enumerate(statements, 1):
        # Skip comments and empty statements
        if statement.startswith('--') or not statement:
            continue

        print(f"   Executing statement {i}/{len(statements)}...")

        try:
            # Use rpc to execute raw SQL (Supabase client doesn't have direct SQL execution)
            # We'll use the REST API directly via the client
            result = supabase.rpc('exec_sql', {'sql': statement}).execute()
            print(f"   ✅ Statement {i} executed successfully")
        except Exception as e:
            # If rpc doesn't exist, try direct query execution
            try:
                # For ALTER TABLE and CREATE statements, we need to use the underlying connection
                from supabase._sync.client import SyncClient

                # Direct SQL execution via PostgREST admin API
                # This is a workaround - in production, use psql or a proper migration tool
                print(f"   ⚠️  Warning: Direct SQL execution may not work via Supabase client")
                print(f"   ℹ️  Consider using psql: psql $SUPABASE_URL -c \"{statement[:50]}...\"")
                print(f"   Error: {e}")
                return False
            except Exception as inner_e:
                print(f"   ❌ Failed to execute statement: {inner_e}")
                return False

    print(f"✅ Migration {migration_number} completed successfully!\n")
    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 run_migrations.py <migration_number> [migration_number ...]")
        print("\nExample:")
        print("  python3 run_migrations.py 008")
        print("  python3 run_migrations.py 008 009")
        sys.exit(1)

    migration_numbers = sys.argv[1:]

    print("=" * 60)
    print("🚀 SUPABASE MIGRATION RUNNER")
    print("=" * 60)
    print(f"Database: {SUPABASE_URL}")
    print(f"Migrations to run: {', '.join(migration_numbers)}")
    print("=" * 60)

    success_count = 0

    for migration_num in migration_numbers:
        if run_migration(migration_num):
            success_count += 1

    print("\n" + "=" * 60)
    print(f"✅ Successfully ran {success_count}/{len(migration_numbers)} migrations")
    print("=" * 60)

    if success_count < len(migration_numbers):
        sys.exit(1)

if __name__ == "__main__":
    main()
