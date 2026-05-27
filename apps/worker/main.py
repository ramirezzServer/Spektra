from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI

from jobs.refresh_ratings import refresh_ratings_job
from jobs.sync_trending import sync_trending_job

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(sync_trending_job, "interval", hours=6, id="sync_trending")
    scheduler.add_job(refresh_ratings_job, "interval", hours=1, id="refresh_ratings")
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="Spektra Worker", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok", "jobs": [str(job) for job in scheduler.get_jobs()]}


@app.post("/jobs/sync-trending")
async def trigger_sync():
    await sync_trending_job()
    return {"triggered": "sync_trending"}
