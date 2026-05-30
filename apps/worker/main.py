from contextlib import asynccontextmanager
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI

from db.connection import check_database
from jobs.refresh_ratings import refresh_ratings_job
from jobs.sync_trending import sync_trending_job

scheduler = AsyncIOScheduler()
logger = logging.getLogger(__name__)


async def run_job(name, job):
    try:
        return await job()
    except Exception:
        logger.exception("%s failed", name)
        return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(run_job, "interval", hours=6, id="sync_trending", args=["sync_trending", sync_trending_job])
    scheduler.add_job(run_job, "interval", hours=1, id="refresh_ratings", args=["refresh_ratings", refresh_ratings_job])
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="Spektra Worker", lifespan=lifespan)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "spektra-worker",
        "jobs": [job.id for job in scheduler.get_jobs()],
        "database": await check_database(),
    }


@app.post("/jobs/sync-trending")
async def trigger_sync():
    synced = await run_job("sync_trending", sync_trending_job)
    return {"triggered": "sync_trending", "synced": synced}
