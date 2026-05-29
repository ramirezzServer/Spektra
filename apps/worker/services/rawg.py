import os

import httpx


async def fetch_trending_games():
    api_key = os.getenv("RAWG_API_KEY")
    if not api_key:
        return []

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            os.getenv("RAWG_BASE_URL", "https://api.rawg.io/api") + "/games",
            params={"key": api_key, "ordering": "-rating"},
        )
        response.raise_for_status()
        return response.json().get("results", [])
