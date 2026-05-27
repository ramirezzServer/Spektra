import json
import os

import httpx

from db.connection import get_pool


async def sync_trending_job():
    pool = await get_pool()
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            "https://api.themoviedb.org/3/trending/all/week",
            params={"api_key": os.getenv("TMDB_API_KEY")},
        )
        response.raise_for_status()
        items = response.json().get("results", [])

    for item in items:
        media_type = item.get("media_type")
        if media_type not in ("movie", "tv"):
            continue
        content_type = "film" if media_type == "movie" else "series"
        release = item.get("release_date") or item.get("first_air_date") or ""
        release_year = int(release[:4]) if release[:4].isdigit() else None
        poster_path = item.get("poster_path")
        await pool.execute(
            """
            INSERT INTO content_items
              (id, external_id, type, title, poster_url, release_year, metadata, created_at, updated_at)
            VALUES
              (gen_random_uuid(), $1, $2, $3, $4, $5, $6::jsonb, now(), now())
            ON CONFLICT (external_id, type) DO UPDATE SET
              title = EXCLUDED.title,
              poster_url = EXCLUDED.poster_url,
              release_year = EXCLUDED.release_year,
              metadata = EXCLUDED.metadata,
              updated_at = now()
            """,
            str(item.get("id")),
            content_type,
            item.get("title") or item.get("name"),
            f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
            release_year,
            json.dumps({"source": "tmdb", "popularity": item.get("popularity")}),
        )
