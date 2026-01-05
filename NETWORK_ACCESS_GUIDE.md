# Model Garden - Network Access Guide

## Problem: Models Not Showing When Accessing via IP Address

When you access the Model Garden web app from a different device using an IP address (e.g., `http://192.168.1.100:3000`), the models don't appear because the app can't connect to LM Studio.

## Why This Happens

By default, browsers restrict connections where the frontend is on one origin (your network IP) but tries to connect to a different origin (localhost/127.0.0.1). The app was previously hardcoded to connect to `http://127.0.0.1:1234`, which only works when accessed locally.

## ✅ Solution

I've updated the code with **automatic detection** and **manual configuration** options:

### Option 1: Automatic Detection (Recommended)

The app now automatically detects your network access and adjusts the API URL:

- **Accessing via `localhost`**: Uses `http://127.0.0.1:1234`
- **Accessing via IP** (e.g., `http://192.168.1.100:3000`): Uses `http://192.168.1.100:1234`

**This works automatically** - just ensure LM Studio is running and listening on the same machine at port 1234.

### Option 2: Manual Configuration

If you need to specify a custom LM Studio URL:

1. Open Model Garden
2. Go to the **Settings** sidebar (right panel)
3. Scroll down to **API Configuration**
4. Click **Change URL**
5. Enter your LM Studio URL (e.g., `http://192.168.1.100:1234`)
6. Click **Apply**

The app will reconnect and load models from the new URL.

### Option 3: Environment Variable

For permanent configuration, create a `.env` file in the project root:

```env
VITE_LM_STUDIO_URL=http://YOUR_SERVER_IP:1234
```

Replace `YOUR_SERVER_IP` with your actual IP address.

Then rebuild:
```bash
npm run build
# or restart dev server
npm run dev
```

## Priority Order

The app determines the API URL in this order:

1. **Custom URL** (set in Settings)
2. **Environment Variable** (`VITE_LM_STUDIO_URL`)
3. **Auto-Detection** (based on hostname)
4. **Fallback** (`http://127.0.0.1:1234`)

## Configuration via Settings UI

The Settings sidebar now includes:

- ⚙️ **API Configuration** section
- Current URL display
- Change URL button
- Reset to auto-detect option

## Troubleshooting

### Still No Models?

1. **Check LM Studio is running**
   - Open LM Studio
   - Go to **Local Server** tab
   - Ensure a model is loaded
   - Click **Start Server**

2. **Verify the IP address**
   - Make sure LM Studio is on the same machine as the web app
   - The IP should match your server's network IP

3. **Check the connection status**
   - Look at the bottom of the Settings sidebar
   - Green dot = Connected
   - Red dot = Disconnected
   - Click the refresh icon to retry

4. **Firewall**
   - Ensure port 1234 (LM Studio) is not blocked
   - Check Windows Firewall or any security software

5. **Same Network**
   - Both devices must be on the same local network

### CORS Errors?

LM Studio automatically handles CORS. If you see CORS errors:
- Restart LM Studio
- Check LM Studio's server settings
- Make sure you're using a compatible LM Studio version

## Example Scenarios

### Scenario 1: Running on Same Machine
- Access: `http://localhost:3000`
- LM Studio: `http://127.0.0.1:1234`
- **Action**: Nothing needed - works automatically

### Scenario 2: Accessing from Another Device
- Server IP: `192.168.1.100`
- Access: `http://192.168.1.100:3000`
- LM Studio on server: Port 1234
- **Detected URL**: `http://192.168.1.100:1234`
- **Action**: Nothing needed - works automatically

### Scenario 3: LM Studio on Different Machine
- Web App: `192.168.1.100:3000`
- LM Studio: `192.168.1.50:1234`
- **Action**: Manually set URL to `http://192.168.1.50:1234` in Settings

## Testing Your Setup

1. Start LM Studio and load a model
2. Start the web app: `npm run dev`
3. Access from another device: `http://YOUR_IP:3000`
4. Check the Settings sidebar - should show "Connected to Server"
5. Models should appear in the History sidebar

## What Changed in the Code

### Files Modified:
- [`src/services/api.ts`](file:///c:/Code/modelgarden-master/modelgarden-master/src/services/api.ts) - Dynamic URL detection
- [`src/stores/settingsStore.ts`](file:///c:/Code/modelgarden-master/modelgarden-master/src/stores/settingsStore.ts) - API URL state management
- [`src/components/SettingsSidebar.tsx`](file:///c:/Code/modelgarden-master/modelgarden-master/src/components/SettingsSidebar.tsx) - UI for URL configuration

### Key Features Added:
- ✅ Automatic hostname-based URL detection
- ✅ Manual URL override in Settings
- ✅ Persistent URL storage (localStorage)
- ✅ Runtime URL updates without restart
- ✅ Reset to auto-detect functionality

---

**Need Help?** Check the connection indicator at the bottom of Settings sidebar, or try the refresh button to reconnect.
