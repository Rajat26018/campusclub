# 🚀 Campusclub - Online Deployment Guide

Convert your local `http://localhost:3000` project into an online, hosted website accessible from **any device (phone, laptop, tablet) and any browser worldwide**.

---

## ⚡ Method 1: Instant Online Link (Powered by Cloudflare)

If you need a live public URL immediately to open on any mobile phone, tablet, or external computer:

1. Double-click [`start-online.bat`](file:///c:/Users/rajat/Desktop/campusclub/start-online.bat) in this project folder.
2. It starts your Node server and launches Cloudflare Tunnel:
   ```
   +--------------------------------------------------------------------------------------------+
   |  Your quick Tunnel has been created! Visit it at:                                          |
   |  https://palace-stops-elimination-strikes.trycloudflare.com                                |
   +--------------------------------------------------------------------------------------------+
   ```
3. Open that link on **any phone, tablet, or computer anywhere in the world**!
   - ⚡ Fast Cloudflare Global CDN
   - 🔒 Official HTTPS encryption
   - 🚫 No password or interstitial screen required

---

## ☁️ Method 2: Permanent 24/7 Cloud Hosting (100% Free, Always Online)

If you want the website to stay online **24/7 forever**, even when your computer is shut down:

This application consists of two parts:
1. **Node.js Express Server** (Backend & Frontend UI)
2. **MySQL Database** (`campushub`)

Here is how to deploy both for free with zero errors:

---

### Step 1: Create a Free Cloud MySQL Database (TiDB Cloud)
1. Go to [https://tidbcloud.com](https://tidbcloud.com) and sign up for a **Free Serverless Tier** (No credit card required, 5 GB free).
2. Click **Create Cluster** -> Select **Serverless** (Free).
3. Once created, click **Connect**:
   - Choose **Node.js** or **Standard Connection**.
   - Copy the connection string / credentials:
     - `DATABASE_URL`: `mysql://<username>:<password>@<host>:4000/<dbname>?ssl={"rejectUnauthorized":true}`
4. **Good News:** You don't even need to manually import tables! The application code in [`db.js`](file:///c:/Users/rajat/Desktop/campusclub/db.js) will **automatically create all tables and sample data** on first run using [`schema.sql`](file:///c:/Users/rajat/Desktop/campusclub/schema.sql).

---

### Step 2: Deploy the Web App on Render.com (Free)
1. Push this project folder to your **GitHub** account:
   - Create a new repository on GitHub (e.g. `campusclub`).
   - Upload the project files to GitHub.
2. Go to [https://render.com](https://render.com) and create a free account.
3. In the Render Dashboard, click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Fill in these settings:
   - **Name:** `campusclub` (or your chosen name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free`
6. Click **Advanced** -> **Add Environment Variable**:
   - **Key:** `DATABASE_URL`
   - **Value:** *(Paste your TiDB Cloud database connection string from Step 1)*
7. Click **Create Web Service**.

🎉 **That's it!** Render will deploy your site in ~1 minute and give you a permanent live HTTPS link like:
`https://campusclub.onrender.com`

---

## 📁 Key Deployment Files Included in This Project
- [`schema.sql`](file:///c:/Users/rajat/Desktop/campusclub/schema.sql): Complete database table definitions + all sample data.
- [`db.js`](file:///c:/Users/rajat/Desktop/campusclub/db.js): Production-ready connection pool with automatic `DATABASE_URL` support, SSL support, and auto-table initialization.
- [`Procfile`](file:///c:/Users/rajat/Desktop/campusclub/Procfile) & [`render.yaml`](file:///c:/Users/rajat/Desktop/campusclub/render.yaml): Standard cloud deployment configuration.
- [`tunnel.js`](file:///c:/Users/rajat/Desktop/campusclub/tunnel.js) & [`start-online.bat`](file:///c:/Users/rajat/Desktop/campusclub/start-online.bat): 1-click instant public online tunneling.
