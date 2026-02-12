# Quick Testing Guide - Splash Screen

## 🚀 How to See the Changes

### Method 1: Clear Session Storage
1. Run: `npm run dev` (you may need to run PowerShell as Administrator)
2. Open http://localhost:3000
3. Press F12 (DevTools)
4. Go to **Application** tab → **Session Storage**
5. Delete the `splashShown` key
6. Refresh the page (F5)

### Method 2: Incognito/Private Window
1. Run: `npm run dev`
2. Open http://localhost:3000 in **Incognito/Private window**
3. Splash will show automatically

---

## ✅ What to Test

### 1. Responsive Design
- **F12** → Toggle device toolbar (Ctrl+Shift+M)
- Try these sizes:
  - **375px** (iPhone) - Text should be readable, no overflow
  - **768px** (iPad) - Centered layout, good spacing
  - **1920px** (Desktop) - Horizontal layout, impressive scale

### 2. Theme Consistency
- Proceed to main app (click button or press Enter)
- Change theme in **Settings** (right sidebar) → **Theme**
- Try: Dark, Midnight, Cyberpunk, Forest
- Refresh page (splash should match the theme colors)

### 3. Keyboard Accessibility
- Load splash screen
- Press **Tab** → Button should have white ring focus
- Press **Enter** or **Space** → Should proceed to app

### 4. Animation Smoothness
- Refresh the page
- Watch elements fade in sequentially:
  1. Logo (with pulsing glow)
  2. "Model" title
  3. "Garden." title
  4. Tagline
  5. Connection status (if server is connected)
  6. Button
- Should look smooth, no jank

### 5. Button Hover Effect
- Hover over "Start Exploring" button
- Should see gradient background appear
- Slight scale up effect
- Smooth transitions

---

## 🎨 Visual Checklist

✅ Logo has **Sparkles** icon (not Sprout)  
✅ Logo has **animated glow** (pulsing shimmer)  
✅ Text scales smoothly when resizing window  
✅ No horizontal scrollbar on any size  
✅ Button has **gradient** on hover  
✅ Background gradient **matches active theme**  
✅ Green dot shows "Server Connected" (if LM Studio running)  
✅ Pressing Enter proceeds to app  

---

## 💡 Expected Behavior

### Mobile (< 1024px)
```
┌─────────────────┐
│   Press Enter   │
│                 │
│     ╔════╗      │  ← Centered
│     ║ ✨ ║      │
│     ╚════╝      │
│                 │
│     Model       │  ← Centered
│     Garden.     │
│   Your local... │
│                 │
│ [Start Explor→] │  ← Centered
└─────────────────┘
```

### Desktop (≥ 1024px)
```
┌──────────────────────────────┐
│ Press Enter         Intel... │
│                              │
│ ╔════╗                       │
│ ║ ✨ ║        (Logo left)    │
│ ╚════╝                       │
│                              │
│ Model                        │
│ Garden.                      │
│ Your local...                │
│              [Start Explor→] │ ← Bottom right
└──────────────────────────────┘
```

---

## 🎭 Theme Colors Reference

| Theme | Gradient Colors |
|-------|----------------|
| **Dark** | Violet → Purple → Indigo |
| **Midnight** | Blue → Indigo → Purple |
| **Cyberpunk** | Pink → Purple → Fuchsia |
| **Forest** | Emerald → Green → Teal |

---

## ⚠️ If PowerShell Blocks npm

Run in **PowerShell as Administrator**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try `npm run dev` again.

---

**Everything should look polished, smooth, and professional! 🎨✨**
