import json
import logging
import os

import httpx

from db.connection import get_pool

logger = logging.getLogger(__name__)


def _year_from_date(value: str | None) -> int | None:
    if value and len(value) >= 4 and value[:4].isdigit():
        return int(value[:4])
    return None


def _normalize_tmdb(item: dict) -> dict | None:
    media_type = item.get("media_type")
    if media_type not in ("movie", "tv"):
        return None

    content_type = "film" if media_type == "movie" else "series"
    poster_path = item.get("poster_path")

    return {
        "external_id": str(item.get("id")),
        "type": content_type,
        "title": item.get("title") or item.get("name") or "Untitled",
        "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
        "release_year": _year_from_date(item.get("release_date") or item.get("first_air_date")),
        "genres": [],
        "metadata": {
            "source": "tmdb",
            "overview": item.get("overview"),
            "voteAverage": item.get("vote_average"),
            "voteCount": item.get("vote_count"),
            "popularity": item.get("popularity"),
            "originalLanguage": item.get("original_language"),
        },
    }


async def sync_trending_job():
    api_key = os.getenv("TMDB_API_KEY")
    if not api_key:
        logger.info("Skipping TMDB trending sync because TMDB_API_KEY is not configured")
        return 0

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                os.getenv("TMDB_BASE_URL", "https://api.themoviedb.org/3") + "/trending/all/week",
                params={"api_key": api_key},
            )
            response.raise_for_status()
            items = response.json().get("results", [])
    except Exception:
        logger.exception("Failed to fetch TMDB weekly trending")
        return 0

    pool = await get_pool()
    synced = 0

    for item in items:
        normalized = _normalize_tmdb(item)
        if normalized is None:
            continue

        try:
            await pool.execute(
                """
                INSERT INTO content_items
                  (id, external_id, type, title, poster_url, release_year, genres, metadata, created_at, updated_at)
                VALUES
                  (gen_random_uuid(), $1, $2, $3, $4, $5, $6::text[], $7::jsonb, now(), now())
                ON CONFLICT (external_id, type) DO UPDATE SET
                  title = EXCLUDED.title,
                  poster_url = EXCLUDED.poster_url,
                  release_year = EXCLUDED.release_year,
                  genres = EXCLUDED.genres,
                  metadata = EXCLUDED.metadata,
                  updated_at = now()
                """,
                normalized["external_id"],
                normalized["type"],
                normalized["title"],
                normalized["poster_url"],
                normalized["release_year"],
                normalized["genres"],
                json.dumps(normalized["metadata"]),
            )
            synced += 1
        except Exception:
            logger.exception("Failed to upsert trending content item", extra={"external_id": normalized["external_id"], "type": normalized["type"]})

    return synced
