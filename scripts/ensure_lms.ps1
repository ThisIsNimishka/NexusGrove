# LM Studio Auto-Restart & Auto-Load Script
# Goal: Ensure LM Studio server and a default model are always running.

# Config
$DEFAULT_MODEL = "nvidia/nemotron-3-nano"
$PORT = 1234
$CHECK_INTERVAL = 60 # Seconds

Write-Host "--- LM Studio Monitor Started ---" -ForegroundColor Cyan
Write-Host "Target Model: $DEFAULT_MODEL"
Write-Host "Target Port: $PORT"
Write-Host "-------------------------------"

while($true) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Checking status..." -NoNewline
    
    # 1. Check Server Status
    $status = lms status
    $isServerOn = $status -match "Server: ON"
    
    if (-not $isServerOn) {
        Write-Host " [RESTARTING SERVER]" -ForegroundColor Yellow
        lms server start
        Start-Sleep -Seconds 5
        $status = lms status # Refresh status
    } else {
        Write-Host " [SERVER ON]" -ForegroundColor Green -NoNewline
    }

    # 2. Check Loaded Models
    # Look for "  · " in status lines to identify loaded models list
    $hasModel = $status -match "Loaded Models" -and $status -match "  · "
    
    if (-not $hasModel) {
        Write-Host " [LOADING MODEL: $DEFAULT_MODEL]" -ForegroundColor Yellow
        lms load $DEFAULT_MODEL --yes
    } else {
        # Optional: Check if the *specific* default model is loaded
        # Since the user wants "models" loaded, if *any* is loaded, we're good?
        # Let's check for the default. 
        if ($status -match $DEFAULT_MODEL) {
             Write-Host " [MODEL LOADED]" -ForegroundColor Green
        } else {
             Write-Host " [REPLACING WITH DEFAULT]" -ForegroundColor Cyan
             lms load $DEFAULT_MODEL --yes
        }
    }

    Start-Sleep -Seconds $CHECK_INTERVAL
}
