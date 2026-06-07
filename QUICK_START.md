# ⚡ QUICK START - SonarQube Setup

## Prerequisites Checklist
- [ ] Java 17+ installed (`java -version`)
- [ ] SonarQube running at `http://localhost:9000`
- [ ] Network access to localhost:9000
- [ ] Valid token: `sqp_e9de16dc0a1cd2269c9de60850d4ffc3ffab0099`

---

## 🚀 Option 1: Automated Script (Recommended)

### For Windows CMD:
```bash
sonar-build.bat
```

### For Windows PowerShell:
```powershell
.\sonar-build.ps1
```

**This will automatically:**
1. ✓ Clean everything
2. ✓ Build the project
3. ✓ Run SonarQube analysis
4. ✓ Show results URL

---

## 🔧 Option 2: Manual Step-by-Step

### Step A: Build the Project (NO TESTS)
```bash
mvnw.cmd clean install -Dmaven.test.skip=true
```
**Expected:** `BUILD SUCCESS`
**Time:** ~1-2 minutes (much faster without tests!)

### If you WANT to run tests:
```bash
mvnw.cmd clean install -DskipTests  # Skips test execution only
mvnw.cmd clean install              # Runs all tests (slowest)
```

### Step B: Run SonarQube Analysis
```bash
mvnw.cmd sonar:sonar ^
  -Dsonar.projectKey=Contact-Management-System ^
  -Dsonar.host.url=http://localhost:9000 ^
  -Dsonar.token=sqp_e9de16dc0a1cd2269c9de60850d4ffc3ffab0099
```
**Expected:** `[INFO] ANALYSIS SUCCESSFUL` and `[INFO] Analysis of project 'Contact Management System' is complete`
**Time:** ~2 minutes

---

## 📊 View Results

After successful analysis, open:
```
http://localhost:9000/dashboard?id=Contact-Management-System
```

You'll see:
- Code Quality Score
- Bugs & Vulnerabilities
- Code Smells
- Test Coverage

---

## ❌ Troubleshooting

### Problem: Connection Refused
```
Error: java.net.ConnectException: Connection refused
```
**Solution:** Start SonarQube server (port 9000 must be accessible)

### Problem: Invalid Token
```
Error: Not authorized. Please log in. Project key: Contact-Management-System
```
**Solution:** 
1. Go to http://localhost:9000
2. Generate new token
3. Update token in command

### Problem: BUILD FAILURE
```
Error: [ERROR] COMPILATION ERROR
```
**Solution:**
1. Run: `mvnw.cmd clean compile -e`
2. Fix the Java errors shown
3. Try again

### Problem: Timeout
```
Connection timeout after 30 seconds
```
**Solution:**
- Firewall blocking port 9000?
- Network issues?
- Try again with patience (~2-5 min total)

---

## 📝 What Gets Analyzed

Your code will be analyzed for:
- 🐛 **Bugs** - Logic errors
- 🔒 **Security** - Vulnerability issues  
- 💨 **Code Smells** - Poor code quality
- 🧪 **Tests** - Test coverage gaps
- 📏 **Metrics** - Lines of code, complexity, etc.

---

## ✅ Success Indicators

When you see these in terminal:
```
[INFO] Analysis of project 'Contact Management System' is complete
[INFO] Project Configuration Stored
[INFO] Analysis complete
```

**Then visit:** http://localhost:9000/dashboard?id=Contact-Management-System

---

## 💾 Files Created for You

- `sonar-build.bat` - Windows batch script
- `sonar-build.ps1` - PowerShell script  
- `SONARQUBE_GUIDE.md` - Detailed guide
- `QUICK_START.md` - This file

---

**Having issues? Check SONARQUBE_GUIDE.md for detailed troubleshooting!**
