import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_super_admin():
    response = client.post("/api/auth/login", json={
        "email": "admin1@polarisedu.in",
        "password": "Polaris@2026"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "super_admin"
    assert data["user"]["employee_id"] == "ADM-001"

def test_login_telecaller():
    response = client.post("/api/auth/login", json={
        "email": "emp01@polarisedu.in",
        "password": "Polaris@2026"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "telecaller"
    assert data["user"]["employee_id"] == "EMP-001"

def test_invalid_login():
    response = client.post("/api/auth/login", json={
        "email": "admin1@polarisedu.in",
        "password": "WrongPassword123"
    })
    assert response.status_code == 400
    assert "Invalid email or password" in response.json()["detail"]

def test_admin_dashboard_stats():
    # Login as admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin1@polarisedu.in",
        "password": "Polaris@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/reports/dashboard/admin", headers=headers)
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_employees"] == 10
    assert stats["total_admins"] == 3

def test_excel_export():
    login_res = client.post("/api/auth/login", json={
        "email": "admin1@polarisedu.in",
        "password": "Polaris@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/reports/export/calls/excel", headers=headers)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    assert len(res.content) > 1000

def test_telecaller_cannot_access_admin_dashboard():
    login_res = client.post("/api/auth/login", json={
        "email": "emp01@polarisedu.in",
        "password": "Polaris@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/reports/dashboard/admin", headers=headers)
    assert res.status_code == 403

def test_telephony_initiate_demo_call():
    login_res = client.post("/api/auth/login", json={
        "email": "emp01@polarisedu.in",
        "password": "Polaris@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/calls/initiate", json={
        "customer_number": "+919988776655",
        "customer_name": "Test Student Parent"
    }, headers=headers)
    assert res.status_code == 200
    call = res.json()
    assert call["status"] == "ringing"
    assert call["is_demo"] is True
    assert call["caller_id"] == "+918047190000"
