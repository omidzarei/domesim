# Dome Sim | 3D — PWA for iPhone 15 Pro Max

## Install to iPhone Home Screen

1. Open Safari on iPhone 15 Pro Max
2. Navigate to `index.html` (via your web server or AirDrop)
3. Tap the Share button (□↑)  
4. Tap **"Add to Home Screen"**
5. Name it "Dome Sim" → Tap **Add**
6. Launch from home screen — runs full-screen, edge-to-edge

## Serving the file

### Option A — AirDrop (easiest)
AirDrop `index.html` to your iPhone → open in Safari → Add to Home Screen

### Option B — Local web server (Mac)
```bash
cd /path/to/pwa_package
python3 -m http.server 8080
# On iPhone (same WiFi): open Safari → http://YOUR_MAC_IP:8080
```

### Option C — Hosting
Upload `index.html` to any HTTPS host (GitHub Pages, Netlify, etc.)
PWA requires HTTPS for service worker and full-screen support.

## Features on iPhone
- Full-screen edge-to-edge (extends into Dynamic Island notch area)  
- Safe area handling (content avoids home indicator / notch)
- Offline support via Service Worker (works without internet after first load)
- SGI IRIX theme by default with Helvetica font at size 12
- Touch controls: 1-finger orbit/pan/zoom, 2-finger pinch zoom
- PS4 controller support via Bluetooth
- All desktop features available

## File sizes
- index.html: ~450KB (self-contained, all assets embedded)
- Icons, splash screens, manifest: included separately for server deployment
