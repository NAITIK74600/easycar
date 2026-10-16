## 🚀 Deploying via Hostinger "Web Applications" (Node.js / Express)

If you are using Hostinger's **Web Applications** deployment tab (which runs Node.js):

### The Previous Error & Why It Happened:
Hostinger runs **Node.js v18.20.8**. Vite 8 / Rolldown requires Node 20+ (`styleText` in `node:util`), which threw:
`SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'`

### The Solution:
1. The frontend client is now **pre-compiled** locally into `dist/`.
2. `package.json` now provides a lightweight build command that validates the pre-compiled bundle in 0.1s without running Vite on Node 18.
3. Production dependencies are trimmed down to `express` and `cors`, eliminating all EBADENGINE warnings.
4. `server.js` serves both the API and the static client seamlessly on Hostinger.

### Upload Step:
1. In Hostinger Web Applications, upload:
   ```
   easycars-hostinger-webapp.zip
   ```
2. Set the configuration (or let Hostinger auto-detect):
   - **Application type**: Express / Node.js
   - **Entry file**: `server.js`
   - **Build command**: `npm run build`
   - **Start command**: `node server.js`
3. Click **Deploy**. It will install dependencies in seconds, verify the bundle, and start immediately!

---

## ✅ Verification Checklist

Ensure that the files inside `public_html` look like this:
```
public_html/
├── .htaccess            <-- CRITICAL for routing & page refreshes (ensure "Show Hidden Files" is ON in File Manager settings)
├── index.html           <-- Main entry point
├── favicon.svg
├── easy-car.jpeg
├── hero-video.mp4
├── assets/              <-- CSS, JavaScript, and optimized media
├── vehicles/            <-- Audi A5 & A3 high-res photography
└── sequences/           <-- Interactive 360 exploration assets
```

---

## 🛠️ Key Fixes Included in this Build

1. **Direct Root Structure**:
   - Files are at the root of the archive—no nested `dist/` subfolder, preventing 403 Forbidden or empty site issues.

2. **Full Apache/LiteSpeed `.htaccess` Included**:
   - Automatically handles single-page routing (`RewriteEngine On`, `RewriteRule ^ index.html [L]`).
   - Prevents **404 Not Found** errors when refreshing pages like `/fleet/audi-a5-sportback`, `/booking`, or `/locations`.
   - Pre-configured MIME types for `.mp4`, `.webm`, `.woff2`, `.svg`.
   - Gzip compression and caching headers for high speed.

3. **Autonomous Client-Side Engine**:
   - If your Hostinger plan is shared hosting without a Node.js daemon running, the application automatically uses the embedded high-performance fallback engine.
   - All vehicle data, pricing tables, live quotes, booking submissions, and offline admin demos work 100% reliably.

4. **SSL / HTTPS**:
   - In Hostinger hPanel under **Security** → **SSL**, make sure your Let's Encrypt SSL certificate is **Active** and **Force HTTPS** is turned **ON**.
