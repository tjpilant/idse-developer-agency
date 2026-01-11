"""
Supabase client helper

Provides a singleton Supabase client for backend modules.
"""

import os
from functools import lru_cache
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env if present
load_dotenv()


class SupabaseConfigError(RuntimeError):
    """Raised when Supabase configuration is missing."""


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Return a shared Supabase client instance."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        raise SupabaseConfigError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")

    return create_client(supabase_url, supabase_key)
