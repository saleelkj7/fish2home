# Running Fish2Home locally

This is a 3-part project: a React (Vite) client, an Express server, and a
Prisma-managed PostgreSQL database. I test-installed and built everything in
my sandbox to confirm it's healthy — the only thing I *couldn't* do there is
run Prisma's own installer, because it needs to download an engine binary
from `binaries.prisma.sh`, a host my sandbox can't reach. On your own machine
this step is normal and will just work.

## 0. Prerequisites
- Node.js 18+ (you're fine with anything recent)
- PostgreSQL running locally (or a connection string to a hosted Postgres,
  e.g. Supabase/Neon/Railway)

## 1. Install dependencies
```bash
cd fish2home-main/client && npm install
cd ../server && npm install
cd ../prisma && npm install
```

## 2. Configure environment variables
Create `prisma/.env` (this one file is read by the server, the seed
scripts, and Prisma CLI):

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/fish2home?schema=public"
JWT_SECRET="pick-any-long-random-string"
FRONTEND_URL="http://localhost:5173"
EMAIL_USER=""
EMAIL_PASS=""
PORT=5000
```
- If you leave `EMAIL_USER`/`EMAIL_PASS` blank, registration still works —
  the server just prints the email-verification link to its console instead
  of emailing it (see `server/utils/emailService.js`).
- To actually send email, use a Gmail address + an App Password (not your
  normal password) in `EMAIL_PASS`.

If you have a local Postgres with no password set up yet:
```bash
createdb fish2home
```

## 3. Create the database schema
```bash
cd prisma
npx prisma migrate dev --name init
```
This will download Prisma's engine binaries the first time — needs internet.

## 4. Seed sample data (fish products + an admin account)
```bash
node seed.js          # 6 sample fish/seafood products
node seed-admin.cjs    # admin@fish2home.com / Admin@123
```

## 5. Run the server and client (two terminals)
```bash
# Terminal 1
cd server
npm run dev      # http://localhost:5000

# Terminal 2
cd client
npm run dev      # http://localhost:5173
```

Open **http://localhost:5173** in your browser. The admin dashboard is at
`/admin` — log in with the seeded admin account above.

## Notes / things I noticed while verifying the build
- `npm run build` in `client/` succeeds, but Tailwind's `@tailwind` directives
  in `App.css` aren't being processed (no PostCSS/Tailwind Vite plugin is
  wired up in `vite.config.js`) — so Tailwind utility classes likely won't
  actually apply. If your site looks unstyled when you run it, that's why.
  Happy to fix this (add `@tailwindcss/vite` or a `postcss.config.js`) if
  you'd like.
- The client talks to the API at a hardcoded `http://localhost:5000`
  (`client/src/main.jsx`) — fine for local dev, but you'd want to swap this
  for an env var before deploying anywhere else.
