# Dual Network Hosting Guide

Your application is configured to work on **both** of your connected networks simultaneously.

## How it works

1.  **Configuration**: Your backend (Port 1234) and Frontend (Port 3000) bind to `0.0.0.0` (All interfaces).
2.  **Dynamic Discovery**: The frontend automatically detects which network the user is connecting from and routes API requests to the corresponding IP.

## Access URLs

Refer to your `.env` file for your specific network IP addresses.

| Network Interface | Application URL |
| :--- | :--- |
| **Corp Network** | `http://<CORP_IP>:3000` |
| **SE Network** | `http://<SE_IP>:3000` |

*Share the appropriate URL with users on the respective networks.*

## Critical Requirements

For this to work for other users on these networks, you must ensure **Windows Firewall** allows traffic on both ports.

### 1. Allow Port 3000 (Frontend)
Run this command in PowerShell as Admin:
```powershell
New-NetFirewallRule -DisplayName "Model Garden - Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### 2. Allow Port 1234 (Backend Models)
Run this command in PowerShell as Admin:
```powershell
New-NetFirewallRule -DisplayName "Model Garden - Backend API" -Direction Inbound -LocalPort 1234 -Protocol TCP -Action Allow
```

## Troubleshooting

If users can load the page but **cannot see models**:
1.  Ask them to open the browser console (F12).
2.  Look for connection errors to the API.
3.  This usually means Port 3000 is open but Port 1234 is blocked by the firewall.
