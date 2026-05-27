import os

import httpx


async def fetch_trending():
    async with httpx.AsyncClient(timeout=20) as client:
      response = await client.get(
          "https://api.themoviedb.org/3/trending/all/week",
          params={"api_key": os.getenv("TMDB_API_KEY")},
      )
      response.raise_for_status()
      return response.json().get("results", [])
