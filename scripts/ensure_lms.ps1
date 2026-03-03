# LM Studio Auto-Restart & Auto-Load Script
# Goal: Ensure LM Studio server and ALL configured models are always running 24/7.

# =============================================================================
# CONFIG - Edit this list to change which models are always kept loaded.
# Use the exact modelKey from: lms ls --json
# =============================================================================
$MODELS_TO_KEEP = @(
    "google/gemma-3-4b",
    "qwen/qwen3-vl-4b",
    "openai/gpt-oss-20b"
)
# NOTE: nvidia/nemotron-3-nano (30B, 24GB) is excluded as it fails to load
# when other models are already using VRAM. Load it manually when needed.

$PORT           = 1234
$API_URL        = "http://127.0.0.1:$PORT/v1/models"
$CHECK_INTERVAL = 60  # Seconds between health checks
# =============================================================================

function Write-Status($msg, $color = "White") {
    Write-Host "  $msg" -ForegroundColor $color
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LM Studio 24/7 Monitor - STARTED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Port   : $PORT"
Write-Host "  Models :"
$MODELS_TO_KEEP | ForEach-Object { Write-Host "    · $_" -ForegroundColor White }
Write-Host "  Interval: ${CHECK_INTERVAL}s"
Write-Host "========================================"
Write-Host ""

while ($true) {
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Write-Host "[$timestamp] Health check..." -ForegroundColor DarkGray

    # ------------------------------------------------------------------
    # STEP 1: Ensure the LM Studio server is running
    # ------------------------------------------------------------------
    $status = lms status 2>&1 | Out-String

    if (-not ($status -match "Server: ON")) {
        Write-Status "[!] Server is DOWN — starting..." Red
        lms server start 2>&1 | Out-Null
        Start-Sleep -Seconds 8
        $status = lms status 2>&1 | Out-String
        if ($status -match "Server: ON") {
            Write-Status "[✓] Server started on port $PORT." Green
        } else {
            Write-Status "[✗] Server failed to start. Retrying in ${CHECK_INTERVAL}s..." Red
            Start-Sleep -Seconds $CHECK_INTERVAL
            continue
        }
    } else {
        Write-Status "[✓] Server: ON (port $PORT)" Green
    }

    # ------------------------------------------------------------------
    # STEP 2: Query loaded models via API
    # ------------------------------------------------------------------
    try {
        $apiResponse   = curl.exe -s $API_URL | ConvertFrom-Json
        $loadedIds     = @($apiResponse.data | ForEach-Object { $_.id })
    } catch {
        Write-Status "[!] Could not reach /v1/models — retrying in ${CHECK_INTERVAL}s..." Yellow
        Start-Sleep -Seconds $CHECK_INTERVAL
        continue
    }

    # ------------------------------------------------------------------
    # STEP 3: Load any missing models
    # ------------------------------------------------------------------
    $allGood = $true
    foreach ($model in $MODELS_TO_KEEP) {
        if ($loadedIds -contains $model) {
            Write-Status "[✓] $model" Green
        } else {
            Write-Status "[!] $model not loaded — loading now..." Yellow
            lms load $model --yes 2>&1 | Out-Null
            Start-Sleep -Seconds 3

            # Verify it loaded
            $check = curl.exe -s $API_URL | ConvertFrom-Json
            $nowLoaded = @($check.data | ForEach-Object { $_.id })
            if ($nowLoaded -contains $model) {
                Write-Status "[✓] $model loaded successfully." Green
            } else {
                Write-Status "[✗] $model failed to load." Red
                $allGood = $false
            }
        }
    }

    if ($allGood) {
        Write-Host "  All good. Next check in ${CHECK_INTERVAL}s." -ForegroundColor DarkGray
    } else {
        Write-Host "  Some models failed. Next check in ${CHECK_INTERVAL}s." -ForegroundColor Yellow
    }

    Write-Host ""
    Start-Sleep -Seconds $CHECK_INTERVAL
}
