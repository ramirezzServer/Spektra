import os

import httpx


async def search_books(query: str, page: int = 1):
    base_url = os.getenv("OPENLIBRARY_BASE_URL", "https://openlibrary.org")
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(f"{base_url}/search.json", params={"q": query, "page": page})
        response.raise_for_status()
        return response.json().get("docs", [])
