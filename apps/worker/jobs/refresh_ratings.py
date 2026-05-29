from db.connection import get_pool


async def refresh_ratings_job():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                """
                WITH stats AS (
                    SELECT
                        content_id,
                        ROUND(AVG(rating)::numeric, 2) AS avg_rating,
                        COUNT(rating) AS ratings_count
                    FROM user_entries
                    WHERE rating IS NOT NULL
                    GROUP BY content_id
                )
                UPDATE content_items c
                SET avg_rating = stats.avg_rating,
                    ratings_count = stats.ratings_count,
                    updated_at = now()
                FROM stats
                WHERE c.id = stats.content_id
                """
            )
            await conn.execute(
                """
                UPDATE content_items
                SET avg_rating = NULL,
                    ratings_count = 0,
                    updated_at = now()
                WHERE id NOT IN (
                    SELECT DISTINCT content_id
                    FROM user_entries
                    WHERE rating IS NOT NULL
                )
                """
            )

    return {"refreshed": True}
