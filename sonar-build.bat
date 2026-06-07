@echo off
REM SonarQube Analysis Script for Contact Management System
REM This script builds the project and runs SonarQube analysis

setlocal enabledelayedexpansion

REM Step 1: Clean and build the project (skip tests for speed)
echo [Step 1] Cleaning and building the project (tests disabled)...
call mvnw.cmd clean install -Dmaven.test.skip=true

if errorlevel 1 (
    echo [ERROR] Build failed!
    exit /b 1
)

echo [SUCCESS] Build completed successfully!

REM Step 2: Run SonarQube analysis
echo.
echo [Step 2] Running SonarQube analysis...
call mvnw.cmd org.sonarsource.scanner.maven:sonar-maven-plugin:sonar ^
  -Dsonar.projectKey=Contact-Management-System ^
  -Dsonar.projectName="Contact Management System" ^
  -Dsonar.host.url=http://localhost:9000 ^
  -Dsonar.token=sqp_e9de16dc0a1cd2269c9de60850d4ffc3ffab0099

if errorlevel 1 (
    echo [ERROR] SonarQube analysis failed!
    echo Check if SonarQube server is running at http://localhost:9000
    exit /b 1
)

echo.
echo [SUCCESS] SonarQube analysis completed!
echo View results at: http://localhost:9000/dashboard?id=Contact-Management-System

endlocal
