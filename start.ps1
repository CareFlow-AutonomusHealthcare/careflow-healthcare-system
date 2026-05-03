# CareFlow startup script for Windows (PowerShell)
# Run: .\start.ps1

Write-Host "Starting CareFlow..." -ForegroundColor Cyan

# 1. Check for .env
if (-not (Test-Path ".env")) {
    Write-Host "X .env file not found! Creating default .env..." -ForegroundColor Yellow
    "MYSQL_USER=root`nMYSQL_PASSWORD=`nMYSQL_HOST=localhost`nMYSQL_DATABASE=careflow_db" | Out-File -FilePath .env -Encoding utf8
}

# 2. Check for venv
if (-not (Test-Path "backend\venv")) {
    Write-Host "Building Python Virtual Environment..." -ForegroundColor Cyan
    python -m venv backend\venv
}

# 3. Activate and Run Backend in a new window
Write-Host "✓ Launching Backend in new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "backend\venv\Scripts\activate; pip install -r backend\requirements.txt; pip install pymysql; uvicorn backend.main:app --host 0.0.0.0 --port 8000"

# 4. Launch Frontend in a new window
Write-Host "✓ Launching Frontend in new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm install; npm run dev"

Write-Host ""
Write-Host "CareFlow is starting up!" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8000"
Write-Host "  Frontend: http://localhost:5173"
Write-Host ""
Write-Host "Credentials:"
Write-Host "  admin       / admin123"
Write-Host "  dr_smith    / doctor123"
Write-Host "  staff_coord / staff123"
Write-Host ""
