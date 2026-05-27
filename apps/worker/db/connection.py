import os

import asyncpg
from dotenv import load_dotenv

load_dotenv()

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=os.getenv("DATABASE_URL", "postgresql://spektra_user:spektra_pass@127.0.0.1:5432/spektra"),
            min_size=1,
            max_size=5,
        )
    return _pool
