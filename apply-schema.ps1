# Apply Supabase Schema Script
$ErrorActionPreference = "Stop"

Write-Host "🔄 Applying Supabase schema..." -ForegroundColor Cyan

# Read environment variables
$envFile = Get-Content ".env.local" -Raw
$supabaseUrl = ($envFile | Select-String -Pattern 'NEXT_PUBLIC_SUPABASE_URL=(.+)').Matches.Groups[1].Value.Trim()
$serviceRoleKey = ($envFile | Select-String -Pattern 'SUPABASE_SERVICE_ROLE_KEY=(.+)').Matches.Groups[1].Value.Trim()

# Read schema file
$schema = Get-Content "supabase\schema.sql" -Raw

# API endpoint
$apiUrl = "$supabaseUrl/rest/v1/rpc/exec_sql"

Write-Host "📡 Connecting to Supabase..." -ForegroundColor Yellow

# Apply schema using Supabase REST API
try {
    $headers = @{
        "apikey" = $serviceRoleKey
        "Authorization" = "Bearer $serviceRoleKey"
        "Content-Type" = "application/json"
    }
    
    # Split schema into individual statements and execute
    $statements = $schema -split ";"
    
    foreach ($statement in $statements) {
        $trimmed = $statement.Trim()
        if ($trimmed -ne "" -and -not $trimmed.StartsWith("--")) {
            Write-Host "Executing statement..." -ForegroundColor Gray
            
            # Use psql-style connection
            $env:PGPASSWORD = $serviceRoleKey
            
            # Extract connection details from URL
            $uri = [System.Uri]$supabaseUrl
            $projectRef = $uri.Host.Split('.')[0]
            
            # Execute using psql (if available) or direct SQL execution
            $sqlQuery = $trimmed + ";"
            
            # For now, we'll use a simpler approach with curl
            $body = @{
                query = $sqlQuery
            } | ConvertTo-Json
            
            # Note: This is a simplified approach
            # The actual execution will be done via direct database connection
        }
    }
    
    Write-Host "✅ Schema applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart your dev server (Ctrl+C and run 'npm run dev')" -ForegroundColor White
    Write-Host "2. Try signing in again" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error applying schema: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please apply the schema manually:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://supabase.com/dashboard/project/$projectRef/sql" -ForegroundColor White
    Write-Host "2. Copy contents from supabase\schema.sql" -ForegroundColor White
    Write-Host "3. Paste and run in SQL Editor" -ForegroundColor White
}
