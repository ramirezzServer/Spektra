import asyncio

from jobs import refresh_ratings


class FakeTransaction:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return False


class FakeConnection:
    def __init__(self):
        self.statements = []

    def transaction(self):
        return FakeTransaction()

    async def execute(self, statement):
        self.statements.append(statement)


class FakeAcquire:
    def __init__(self, connection):
        self.connection = connection

    async def __aenter__(self):
        return self.connection

    async def __aexit__(self, exc_type, exc, traceback):
        return False


class FakePool:
    def __init__(self):
        self.connection = FakeConnection()

    def acquire(self):
        return FakeAcquire(self.connection)


def test_refresh_ratings_executes_aggregate_and_reset_sql(monkeypatch):
    pool = FakePool()

    async def fake_get_pool():
        return pool

    monkeypatch.setattr(refresh_ratings, "get_pool", fake_get_pool)

    assert asyncio.run(refresh_ratings.refresh_ratings_job()) == {"refreshed": True}
    assert len(pool.connection.statements) == 2
    assert "ROUND(AVG(rating)::numeric, 2)" in pool.connection.statements[0]
    assert "ratings_count = 0" in pool.connection.statements[1]
