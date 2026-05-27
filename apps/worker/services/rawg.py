import os

import httpx


async def fetch_trending_games():
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            "https://api.rawg.io/api/games",
            params={"key": os.getenv("RAWG_API_KEY"), "ordering": "-rating"},
        )
        response.raise_for_status()
        return response.json().get("results", [])
