import os

import httpx


async def fetch_trending():
    api_key = os.getenv("TMDB_API_KEY")
    if not api_key:
        return []

    async with httpx.AsyncClient(timeout=20) as client:
      response = await client.get(
          os.getenv("TMDB_BASE_URL", "https://api.themoviedb.org/3") + "/trending/all/week",
          params={"api_key": api_key},
      )
      response.raise_for_status()
      return response.json().get("results", [])
