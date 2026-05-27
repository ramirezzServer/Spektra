from db.connection import get_pool


async def refresh_ratings_job():
    pool = await get_pool()
    await pool.execute(
        """
        UPDATE content_items
        SET avg_rating = stats.avg_rating,
            ratings_count = stats.ratings_count,
            updated_at = now()
        FROM (
            SELECT content_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(rating) AS ratings_count
            FROM user_entries
            WHERE rating IS NOT NULL
            GROUP BY content_id
        ) stats
        WHERE content_items.id = stats.content_id
        """
    )
