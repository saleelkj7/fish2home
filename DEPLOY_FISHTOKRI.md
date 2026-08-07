# Deploying Fish2Home to fishtokri.co.in (free tier)

Stack: **Neon** (Postgres) → **Render** (Express API) → **Vercel** (React
frontend) → **GoDaddy** (DNS for fishtokri.co.in)

Push this folder to a GitHub repo first — Render and Vercel both deploy by
connecting to a GitHub repo, not by file upload.

```bash
cd fish2home-main
git init
git add .
git commit -m "Initial commit"
# create a repo on github.com, then:
git remote add origin https://github.com/<you>/fish2home.git
git push -u origin main
```

---

## 1. Database — Neon (free Postgres)

1. Go to **neon.tech** → sign up → **New Project**.
2. Once created, copy the **connection string** it gives you (starts with
   `postgresql://...`). Use the "Pooled connection" string.
3. Keep this tab open — you'll paste it into Render next.

*(Why Neon over Render's own free Postgres: Render's free Postgres database
expires after 90 days. Neon's free tier doesn't.)*

---

## 2. Backend — Render

1. **render.com** → sign up → **New +** → **Web Service** → connect your
   GitHub repo.
2. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate --schema=../prisma/schema.prisma && npx prisma migrate deploy --schema=../prisma/schema.prisma`
   - **Start Command**: `npm start` (or `node index.js` — check
     `server/package.json`'s `scripts.start`; add one if missing:
     `"start": "node index.js"`)
   - **Instance Type**: Free
3. **Environment variables** (Render dashboard → Environment):
   ```
   DATABASE_URL=<paste the Neon pooled connection string>
   JWT_SECRET=<generate a long random string>
   FRONTEND_URL=https://fishtokri.co.in
   ALLOWED_ORIGINS=https://fishtokri.co.in,https://www.fishtokri.co.in
   EMAIL_USER=<your gmail, or leave blank>
   EMAIL_PASS=<gmail App Password, or leave blank>
   PORT=5000
   ```
   Note: Render sets its own `PORT` automatically at runtime — the app
   already does `process.env.PORT || 5000`, so this is fine either way.
4. Deploy. Render gives you a URL like `https://fish2home-api.onrender.com`
   — **copy this**, you'll need it for Vercel.
5. **Free-tier heads up**: Render's free web services spin down after 15
   minutes of no traffic, and the next request takes ~30-50s to wake back
   up. Fine for a low-traffic launch; annoying for demos. (A free
   uptime-pinger like UptimeRobot hitting the API every 10 min avoids this,
   though it eats into free-tier hours — mention if you want that set up.)

---

## 3. Frontend — Vercel

1. **vercel.com** → sign up → **Add New** → **Project** → import the same
   GitHub repo.
2. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
3. **Environment variable**:
   ```
   VITE_API_URL=https://fish2home-api.onrender.com
   ```
   (use the actual Render URL from step 2.4)
4. Deploy. Vercel gives you a `*.vercel.app` URL — confirm the site loads
   and can hit the API before moving to DNS.

---

## 4. Point fishtokri.co.in at Vercel (via GoDaddy)

1. In Vercel: your project → **Settings** → **Domains** → add
   `fishtokri.co.in` and `www.fishtokri.co.in`. Vercel will show you the DNS
   records it needs.
2. In **GoDaddy** → **My Products** → find `fishtokri.co.in` → **DNS** →
   **Manage DNS**, add/edit:

   | Type  | Name | Value                  |
   |-------|------|------------------------|
   | A     | @    | `76.76.21.21`          |
   | CNAME | www  | `cname.vercel-dns.com` |

   (Vercel's domain settings page shows you the exact current values to use
   — double check against what it displays, these change occasionally.)
3. GoDaddy's default records (usually a **Parked** A record, or GoDaddy's
   own CNAME forwarding) need to be **deleted**, not just added alongside —
   conflicting records will break resolution.
4. DNS propagation: usually 10–30 minutes, can take a few hours. Vercel's
   Domains page will show a green checkmark once it sees the records.
5. Vercel auto-issues an SSL certificate once DNS resolves — no extra step.

---

## 5. Backend on a subdomain (optional but recommended)

Right now the frontend calls Render's `onrender.com` URL directly, which
works fine. If you'd rather the API live at `api.fishtokri.co.in`:

1. GoDaddy DNS → add:

   | Type  | Name | Value                             |
   |-------|------|------------------------------------|
   | CNAME | api  | `fish2home-api.onrender.com`      |

2. Render → your service → **Settings** → **Custom Domain** → add
   `api.fishtokri.co.in`.
3. Update Vercel's `VITE_API_URL` env var to `https://api.fishtokri.co.in`
   and redeploy the frontend.
4. Update Render's `ALLOWED_ORIGINS`/`FRONTEND_URL` if needed (they already
   point at the main domain, not the API subdomain, so no change needed
   there).

---

## 6. After DNS is live — seed the production database

Run these **locally**, pointed at the Neon database (one-time):

```bash
cd prisma
# temporarily set DATABASE_URL in prisma/.env to the Neon connection string
node seed.js
node seed-admin.cjs
```

Admin login: `admin@fish2home.com` / `Admin@123` — **change this password**
once you've deployed, since it's a known default now.

---

## Checklist
- [ ] Repo pushed to GitHub
- [ ] Neon project created, connection string copied
- [ ] Render web service deployed, env vars set, migration ran successfully
- [ ] Vercel project deployed, `VITE_API_URL` set, site loads and calls API
- [ ] GoDaddy DNS updated (A + CNAME), old parked records removed
- [ ] fishtokri.co.in resolves to the Vercel site over HTTPS
- [ ] Production DB seeded, admin password changed
