# Kill all node.exe processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Killed all node.exe processes"

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start API server in background
Write-Host "Starting API server..."
$apiJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\ASUS\projects\agent-consensus"
    pnpm --filter @consensus/api dev 2>&1
}

# Wait for API to be ready
$ready = $false
$timeout = 30
$timer = 0
while (-not $ready -and $timer -lt $timeout) {
    Start-Sleep -Seconds 1
    $timer++
    $output = Receive-Job -Job $apiJob
    if ($output -match "Agent Consensus API running on http://localhost:8888") {
        $ready = $true
        Write-Host "API server is ready!"
        Write-Host $output
    }
}

if (-not $ready) {
    Write-Host "Warning: API server may not be ready yet, but continuing..."
}

# Show API output
Receive-Job -Job $apiJob -Keep

# Start web server
Write-Host "Starting web server..."
$webJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\ASUS\projects\agent-consensus"
    pnpm --filter @consensus/web dev 2>&1
}

# Wait a bit for web server to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=========================================="
Write-Host "Both servers have been started!"
Write-Host "API: http://localhost:8888"
Write-Host "Web: http://localhost:5173"
Write-Host "=========================================="
Write-Host ""
Write-Host "Press Ctrl+C to stop, or keep this window open to view logs."
Write-Host ""

# Keep showing logs
while ($true) {
    Receive-Job -Job $apiJob
    Receive-Job -Job $webJob
    Start-Sleep -Seconds 2
}
