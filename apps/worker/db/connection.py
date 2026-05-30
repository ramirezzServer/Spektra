import os
from urllib.parse import quote

import asyncpg
from dotenv import load_dotenv

load_dotenv()

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        dsn = os.getenv("DATABASE_URL") or os.getenv("DB_URL")
        if not dsn:
            user = quote(os.getenv("DB_USERNAME", "spektra_user"))
            password = quote(os.getenv("DB_PASSWORD", "spektra_pass"))
            host = os.getenv("DB_HOST", "127.0.0.1")
            port = os.getenv("DB_PORT", "5432")
            database = os.getenv("DB_DATABASE", "spektra")
            dsn = f"postgresql://{user}:{password}@{host}:{port}/{database}"

        _pool = await asyncpg.create_pool(
            dsn=dsn,
            min_size=1,
            max_size=5,
        )
    return _pool


async def check_database() -> bool:
    try:
        pool = await get_pool()
        async with pool.acquire() as connection:
            await connection.fetchval("select 1")
        return True
    except Exception:
        return False
