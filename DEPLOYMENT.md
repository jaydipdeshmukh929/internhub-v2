# InternHub Deployment Guide

## Architecture
- **Backend** → Railway (Spring Boot JAR)
- **Database** → Railway MySQL plugin
- **Frontend** → Vercel (React static build)

---

## STEP 1 — Push code to GitHub

1. Create a new repo on github.com — name it `internhub`
2. Open terminal in your project folder and run:

```bash
cd portal-v2
git init
git add .
git commit -m "Initial commit - InternHub full stack"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/internhub.git
git push -u origin main
```

---

## STEP 2 — Deploy Database on Railway

1. Go to **https://railway.app** → Sign up with GitHub
2. Click **New Project** → **Provision MySQL**
3. Click the MySQL service → **Variables** tab
4. Copy these values:
    - `MYSQL_URL` (looks like `mysql://user:pass@host:port/railway`)
    - `MYSQLHOST`
    - `MYSQLPORT`
    - `MYSQLUSER`
    - `MYSQLPASSWORD`
    - `MYSQLDATABASE`
5. Click **Connect** → copy the **MySQL Public URL**

---

## STEP 3 — Deploy Backend on Railway

1. In Railway, click **New** → **GitHub Repo** → select `internhub`
2. Set **Root Directory** to `backend`
3. Railway detects the Dockerfile automatically
4. Go to **Variables** tab and add these:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `jdbc:mysql://HOST:PORT/DATABASE?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `DATABASE_USERNAME` | Your MySQL username from Step 2 |
| `DATABASE_PASSWORD` | Your MySQL password from Step 2 |
| `JWT_SECRET` | `InternHubSuperSecretKeyForJWTTokenGeneration2025MustBe256BitsLong` |
| `JWT_EXPIRATION` | `86400000` |
| `MAIL_USERNAME` | Your Gmail address |
| `MAIL_PASSWORD` | Your Gmail App Password |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` (update after Step 4) |
| `ANTHROPIC_API_KEY` | Your Claude API key (optional) |
| `UPLOAD_DIR` | `uploads/` |

5. Click **Deploy** → wait for build to complete (5-10 mins)
6. Go to **Settings** → **Domains** → click **Generate Domain**
7. Copy your backend URL: `https://internhub-backend.railway.app`

---

## STEP 4 — Deploy Frontend on Vercel

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **New Project** → Import `internhub` repo
3. Set **Root Directory** to `frontend`
4. Set **Framework Preset** to `Create React App`
5. Under **Environment Variables** add:

| Variable | Value |
|---|---|
| `REACT_APP_API_URL` | `https://internhub-backend.railway.app/api` |

6. Click **Deploy** → wait 2-3 minutes
7. Copy your frontend URL: `https://internhub.vercel.app`

---

## STEP 5 — Update CORS on Backend

1. Go to Railway → your backend service → **Variables**
2. Update `FRONTEND_URL` to your actual Vercel URL:
   ```
   FRONTEND_URL=https://internhub.vercel.app
   ```
3. Railway auto-redeploys

---

## STEP 6 — Run Database Migrations

Connect to your Railway MySQL using a MySQL client and run all the CREATE TABLE statements from the project setup guide.

Or easier — since `spring.jpa.hibernate.ddl-auto=update`, Hibernate will auto-create all tables on first startup.

---

## STEP 7 — Create First Admin

Since there's no public admin registration, create your first admin directly in the database:

```sql
INSERT INTO users (name, email, password, role, verified, created_at)
VALUES ('Admin', 'admin@yourdomain.com', 'yourpassword', 'ADMIN', 1, NOW());
```

Then login at `https://internhub.vercel.app/login`

---

## Costs

| Service | Free Tier |
|---|---|
| Railway | $5 free credit/month (enough for hobby projects) |
| Vercel | Completely free for hobby projects |
| Railway MySQL | Included in free credit |

**Total cost: $0 for small projects**

---

## Troubleshooting

**Backend not starting?**
- Check Railway logs for errors
- Verify all environment variables are set correctly
- Make sure DATABASE_URL format is correct

**CORS errors on frontend?**
- Make sure FRONTEND_URL in Railway matches your exact Vercel URL
- Check backend logs for CORS messages

**Database connection failed?**
- Railway MySQL needs `useSSL=true` in the connection URL
- Make sure your DATABASE_URL uses the public host, not internal

**Build failed on Railway?**
- Java 17 is required — check the Dockerfile uses `eclipse-temurin:17`
- Maven build can take 5-10 minutes on first run

