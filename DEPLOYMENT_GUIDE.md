# EASY CARS BIEL — HOSTING & DEPLOYMENT GUIDE

This package contains everything needed to host and run the **Easy Cars Biel** car rental platform in production.

---

## 📦 What is in the ZIP Packages?

1. **`easycars-frontend-dist.zip`**
   - Pure, optimized static frontend distribution (HTML, CSS, JS, real vehicle photography, 3D models, video assets).
   - Ready for drag-and-drop deployment on **Netlify**, **Vercel**, **Cloudflare Pages**, or traditional cPanel `public_html`.

2. **`easycars-biel-full-hosting.zip`**
   - Complete full-stack package:
     - `dist/`: Compiled production frontend application.
     - `server/`: Production Node.js / Express backend with SQLite database pre-seeded with vehicles, rates, extras, and locations.
     - `ecosystem.config.cjs`: PM2 process manager configuration for automatic background service and reboot recovery.
     - `docker-compose.yml` & `Dockerfile`: For one-command Docker container deployment.

---

## 🚀 Deployment Options

### OPTION A: Static Hosting (Netlify / Vercel / Cloudflare Pages)

#### 1. Netlify (Drag & Drop)
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop).
2. Unzip `easycars-frontend-dist.zip`.
3. Drag the extracted `dist` folder into the Netlify drop zone.
4. Your luxury car rental website is live immediately with HTTPS!

#### 2. Vercel
1. Install Vercel CLI or import via Git.
2. If uploading `dist`, run:
   ```bash
   npx vercel --prod dist
   ```

---

### OPTION B: Cloud VPS / Ubuntu Server (Nginx + PM2)

Recommended for full production with instant booking, SQLite database, and admin dashboard.

#### Step 1: Upload and Unzip
```bash
# Upload easycars-biel-full-hosting.zip to your server
unzip easycars-biel-full-hosting.zip -d /var/www/easycars
cd /var/www/easycars/server
```

#### Step 2: Install Production Dependencies
```bash
npm install --omit=dev
```

#### Step 3: Configure Environment Variables
```bash
cp .env.example .env
nano .env
```
Set your production settings:
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.ch
JWT_SECRET=your-secure-random-jwt-key
```

#### Step 4: Start with PM2 (Auto-Restart on Reboot)
```bash
npm install -g pm2
pm2 start ../ecosystem.config.cjs
pm2 save
pm2 startup
```

#### Step 5: Nginx Reverse Proxy & SSL Configuration
Add to `/etc/nginx/sites-available/easycars`:
```nginx
server {
    server_name yourdomain.ch www.yourdomain.ch;

    # Serve static frontend
    location / {
        root /var/www/easycars/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/easycars /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.ch -d www.yourdomain.ch
```

---

### OPTION C: Docker Deployment

To launch the complete application in an isolated container:
```bash
docker compose up -d --build
```
The application will be accessible at `http://your-server-ip:3001` with both frontend and backend automatically served!

---

## 🔐 Default Credentials (Pre-Seeded)

The database comes pre-configured with the actual rental fleet in Pieterlen:
- **Audi A5 Sportback 3.0 TDI quattro S-Line** (CHF 100/day, 200 km)
- **Audi A3 Sportback 1.8 TFSI quattro** (CHF 65/day, 150 km)

### Default Owner Account:
- **Email:** `owner@easycarsbiel.ch`
- **Password:** `Owner2026!Secure`
- **Dashboard URL:** `https://yourdomain.ch/owner/overview`

*(Remember to change this password after your initial login!)*
