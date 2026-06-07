#!/usr/bin/env pwsh
# SonarQube Analysis Script for Contact Management System
# Usage: .\sonar-build.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "SonarQube Analysis Script" -ForegroundColor Cyan
Write-Host "Contact Management System" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if SonarQube is running
Write-Host "[Step 1] Checking if SonarQube server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/api/system/status" -ErrorAction Stop
    Write-Host "[✓] SonarQube is running!" -ForegroundColor Green
} catch {
    Write-Host "[✗] ERROR: SonarQube server not responding!" -ForegroundColor Red
    Write-Host "    Please start SonarQube at http://localhost:9000" -ForegroundColor Yellow
    exit 1
}

# Step 2: Clean and build
Write-Host ""
Write-Host "[Step 2] Cleaning and building project (tests disabled)..." -ForegroundColor Yellow
& .\mvnw.cmd clean install -Dmaven.test.skip=true

if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[✓] Build successful!" -ForegroundColor Green

# Step 3: Run SonarQube analysis
Write-Host ""
Write-Host "[Step 3] Running SonarQube analysis..." -ForegroundColor Yellow
& .\mvnw.cmd org.sonarsource.scanner.maven:sonar-maven-plugin:sonar `
  -Dsonar.projectKey=Contact-Management-System `
  -Dsonar.projectName="Contact Management System" `
  -Dsonar.host.url=http://localhost:9000 `
  -Dsonar.token=sqp_e9de16dc0a1cd2269c9de60850d4ffc3ffab0099

if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] SonarQube analysis failed!" -ForegroundColor Red
    exit 1
}

# Success
Write-Host ""
Write-Host "[✓] SonarQube analysis completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "View your results at:" -ForegroundColor Cyan
Write-Host "  http://localhost:9000/dashboard?id=Contact-Management-System" -ForegroundColor Cyan
Write-Host ""
