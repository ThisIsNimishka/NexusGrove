# LM Studio Auto-Restart & Auto-Load Script
# Goal: Ensure LM Studio server and ALL configured models are always running 24/7.

# =============================================================================
# CONFIG - Edit this list to change which models are always kept loaded
# =============================================================================
$MODELS_TO_KEEP = @(
    "nvidia/nemotron-3-nano",
    "qwen/qwen3-vl-4b",
    "openai/gpt-oss-20b",
    "google/gemma-3-4b"
)
$PORT          = 1234
$CHECK_INTERVAL = 60  # Seconds between health checks
# =============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LM Studio 24/7 Monitor - STARTED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Models to maintain:"
$MODELS_TO_KEEP | ForEach-Object { Write-Host "    · $_" -ForegroundColor White }
Write-Host "  Check interval: ${CHECK_INTERVAL}s"
Write-Host "========================================"
Write-Host ""

while ($true) {
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Write-Host "[$timestamp] Running health check..." -ForegroundColor DarkGray

    # ------------------------------------------------------------------
    # STEP 1: Ensure the LM Studio server is running
    # ------------------------------------------------------------------
    $status = lms status 2>&1 | Out-String
    $isServerOn = $status -match "Server: ON"

    if (-not $isServerOn) {
        Write-Host "  [!] Server is DOWN — attempting to start..." -ForegroundColor Red
        lms server start
        Start-Sleep -Seconds 8  # Give LM Studio time to start up
        $status = lms status 2>&1 | Out-String  # Refresh status after start
        if ($status -match "Server: ON") {
            Write-Host "  [✓] Server started successfully." -ForegroundColor Green
        } else {
            Write-Host "  [✗] Server failed to start! Will retry next cycle." -ForegroundColor Red
            Start-Sleep -Seconds $CHECK_INTERVAL
            continue
        }
    } else {
        Write-Host "  [✓] Server: ON (port $PORT)" -ForegroundColor Green
    }

    # ------------------------------------------------------------------
    # STEP 2: Check each required model and load if it's not running
    # ------------------------------------------------------------------
    # Get list of currently loaded model IDs from the API
    try {
        $apiResponse = curl.exe -s "http://127.0.0.1:$PORT/v1/models" | ConvertFrom-Json
        $loadedModelIds = $apiResponse.data | ForEach-Object { $_.id }
    } catch {
        Write-Host "  [!] Could not query /v1/models API — server may still be warming up." -ForegroundColor Yellow
        Start-Sleep -Seconds $CHECK_INTERVAL
        continue
    }

    $allGood = $true
    foreach ($model in $MODELS_TO_KEEP) {
        if ($loadedModelIds -contains $model) {
            Write-Host "  [✓] $model — loaded" -ForegroundColor Green
        } else {
            Write-Host "  [!] $model — NOT loaded, loading now..." -ForegroundColor Yellow
            lms load $model --yes 2>&1 | Out-Null
            # Verify it loaded
            Start-Sleep -Seconds 3
            $apiResponse2 = curl.exe -s "http://127.0.0.1:$PORT/v1/models" | ConvertFrom-Json
            $loadedNow = $apiResponse2.data | ForEach-Object { $_.id }
            if ($loadedNow -contains $model) {
                Write-Host "  [✓] $model — loaded successfully." -ForegroundColor Green
            } else {
                Write-Host "  [✗] $model — failed to load! Will retry next cycle." -ForegroundColor Red
                $allGood = $false
            }
        }
    }

    if ($allGood) {
        Write-Host "  All systems good. Next check in ${CHECK_INTERVAL}s." -ForegroundColor DarkGray
    } else {
        Write-Host "  Some models failed to load. Next check in ${CHECK_INTERVAL}s." -ForegroundColor Yellow
    }

    Write-Host ""
    Start-Sleep -Seconds $CHECK_INTERVAL
}
