# SonarQube Setup & Troubleshooting Guide

## Problem: Build Fails with Error Exit Code 1

### Root Causes to Check:

1. **SonarQube Server Not Running**
   - Port 9000 is not responding
   - Network connectivity issues

2. **Invalid Token**
   - Token may have expired
   - Token doesn't have proper permissions

3. **Project Name Mismatch**
   - Project key already exists
   - Conflicting project configuration

---

## ✅ Step-by-Step Solution

### Step 1: Verify SonarQube is Running
```bash
# Test if SonarQube is accessible
curl http://localhost:9000/api/system/status
```
Expected response: `{"status":"UP"}`

If this fails, **start your SonarQube server first**.

---

### Step 2: Clean Build (Skip Tests for Speed)
```bash
# Run this command in CMD from project directory:
mvnw.cmd clean install -Dmaven.test.skip=true
```

This will:
- Clean all build artifacts
- Compile Java code
- Package the application
- Skip ALL tests (fastest option)

**Expected output:** `BUILD SUCCESS`

**Alternative - If you want to keep test compilation but skip execution:**
```bash
mvnw.cmd clean install -DskipTests
```

**Time Comparison:**
- `-Dmaven.test.skip=true` → 1-2 minutes (FASTEST)
- `-DskipTests` → 2-3 minutes
- No flag → 5-10 minutes (runs all tests)

---

### Step 3: Run SonarQube Analysis (Simpler Command)
```bash
.\mvnw clean install sonar:sonar
mvnw.cmd sonar:sonar ^
  -Dsonar.projectKey=Contact-Management-System ^
  -Dsonar.host.url=http://localhost:9000 ^
  -Dsonar.token=sqp_e9de16dc0a1cd2269c9de60850d4ffc3ffab0099
```

**Note:** Use `^` on Windows to continue lines.

---

### Step 4: Verify Results
Check: `http://localhost:9000/dashboard?id=Contact-Management-System`

---

## 🚀 Easy Way: Use the Provided Script

A batch file has been created for you:

```bash
# Simply run:
sonar-build.bat
```

This script automatically:
1. Cleans the build
2. Compiles everything
3. Runs SonarQube analysis
4. Shows you the results URL

---

## ❌ If Still Getting Errors:

### Error: "Connection refused"
```
Solution: Make sure SonarQube is running at http://localhost:9000
```

### Error: "Invalid token"
```
Solution: 
1. Go to http://localhost:9000
2. Login with admin account
3. Go to User Profile → Security → Tokens
4. Generate a new token
5. Replace the token in your command
```

### Error: "Access Denied"
```
Solution:
1. Verify you're using the correct admin token
2. Check token has "Execute Analysis" permission
3. Try using different project key name
```

### Error: "BUILD FAILURE"
```
Solution:
1. Run: mvnw.cmd clean compile -e
2. Look for red [ERROR] lines in output
3. Fix the Java compilation errors shown
4. Try again
```

---

## 🏃 How to Disable Tests (For Faster Builds)

You can skip tests to speed up the build significantly:

### Option 1: Skip Test Execution ONLY (Compiles tests)
```batch
mvnw.cmd clean install -DskipTests
```
- **Time:** ~2-3 minutes
- **When to use:** When you want fast builds but still compile tests

### Option 2: Skip Tests Completely (FASTEST - Recommended)
```batch
mvnw.cmd clean install -Dmaven.test.skip=true
```
- **Time:** ~1-2 minutes
- **When to use:** When you want fastest possible build (best for SonarQube analysis)

### Option 3: Run Tests (Default)
```batch
mvnw.cmd clean install
```
- **Time:** ~5-10 minutes
- **When to use:** When you want to verify everything works

### Add to SonarQube Analysis Command
You can combine with SonarQube:
```batch
mvnw.cmd clean install -Dmaven.test.skip=true ^
  && mvnw.cmd sonar:sonar ^
  -Dsonar.projectKey=Contact-Management-System ^
  -Dsonar.host.url=http://localhost:9000 ^
  -Dsonar.token=sqp_e9de16dc0a1cd2269c9de60850d4ffc3ffab0099
```

---

## Complete Working Command (Copy-Paste)

**On Windows CMD:**
```batch
mvnw.cmd clean verify sonar:sonar ^
  -Dsonar.projectKey=Contact-Management-System ^
  -Dsonar.projectName="Contact Management System" ^
  -Dsonar.host.url=http://localhost:9000 ^
  -Dsonar.token=sqp_e9de16dc0a1cd2269c9de60850d4ffc3ffab0099
```

**On Windows PowerShell:**
```powershell
.\mvnw.cmd clean verify sonar:sonar `
  -Dsonar.projectKey=Contact-Management-System `
  -Dsonar.projectName="Contact Management System" `
  -Dsonar.host.url=http://localhost:9000 `
  -Dsonar.token=sqp_e9de16dc0a1cd2269c9de60850d4ffc3ffab0099
```

---

## What Happens at Each Stage:

| Stage | Time | What It Does |
|-------|------|-------------|
| Clean | 2-5s | Removes old build files |
| Compile | 10-30s | Converts .java to .class |
| Test | 20-60s | Runs unit tests |
| Package | 5-10s | Creates JAR file |
| Analyze | 30-120s | SonarQube scans code |
| Upload | 10-20s | Uploads to SonarQube server |

**Total Time:** 2-5 minutes

---

## After Successful Build:

1. **View Dashboard:**
   - Go to: http://localhost:9000
   - Find your project: "Contact Management System"

2. **Fix Issues:**
   - Check "Code Smells" tab
   - Review "Security Hotspots"
   - Read "Bugs" and "Vulnerabilities"

3. **Apply Fixes:**
   - Each issue has a description
   - Follow SonarQube's recommendations
   - Update your code
   - Re-run analysis

---

## Quick Diagnostics Checklist:

- [ ] SonarQube running? (test: `http://localhost:9000`)
- [ ] Token valid and not expired?
- [ ] Project can compile? (run: `mvnw clean compile`)
- [ ] All dependencies downloaded? (maven cache OK?)
- [ ] Java 17+ installed? (check: `java -version`)
- [ ] Firewall allowing port 9000?

✓ Check all items, then try the build again!
