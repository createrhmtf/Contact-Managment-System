# Run backend with optional credential prompts
# Usage: .\scripts\run-local.ps1
# If DB_PASSWORD and JWT_SECRET env vars are already set, uses those.
# Otherwise falls back to application.properties defaults.

if (-not $env:DB_PASSWORD) {
    $securePassword = Read-Host "Enter the SQL Server password (or press Enter to use default)" -AsSecureString
    $plain = [System.Net.NetworkCredential]::new("", $securePassword).Password
    if ($plain) {
        $env:DB_PASSWORD = $plain
    }
}

if (-not $env:JWT_SECRET) {
    $env:JWT_SECRET = "MyContactManagementSystemSecretKey2024!!"
}

try {
    & "$PSScriptRoot\..\mvnw.cmd" spring-boot:run
}
finally {
    Remove-Item Env:DB_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:JWT_SECRET  -ErrorAction SilentlyContinue
}
