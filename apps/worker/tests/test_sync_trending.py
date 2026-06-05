import asyncio

from jobs import sync_trending


def test_normalize_tmdb_maps_movie_to_film():
    item = sync_trending._normalize_tmdb(
        {
            "id": 42,
            "media_type": "movie",
            "title": "Arrival",
            "poster_path": "/arrival.jpg",
            "release_date": "2016-11-11",
            "vote_average": 8.2,
            "vote_count": 1200,
        }
    )

    assert item["external_id"] == "42"
    assert item["type"] == "film"
    assert item["title"] == "Arrival"
    assert item["poster_url"] == "https://image.tmdb.org/t/p/w500/arrival.jpg"
    assert item["release_year"] == 2016
    assert item["metadata"]["source"] == "tmdb"


def test_normalize_tmdb_ignores_unsupported_media_type():
    assert sync_trending._normalize_tmdb({"media_type": "person", "id": 10}) is None


def test_sync_trending_skips_without_api_key(monkeypatch):
    monkeypatch.delenv("TMDB_API_KEY", raising=False)

    async def fail_get_pool():
        raise AssertionError("database should not be touched without TMDB_API_KEY")

    monkeypatch.setattr(sync_trending, "get_pool", fail_get_pool)

    assert asyncio.run(sync_trending.sync_trending_job()) == 0
