from fastapi.testclient import TestClient

import main


def test_health_endpoint_reports_worker_status(monkeypatch):
    async def fake_check_database():
        return True

    monkeypatch.setattr(main, "check_database", fake_check_database)

    with TestClient(main.app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "spektra-worker"
    assert body["database"] is True
    assert "jobs" in body
