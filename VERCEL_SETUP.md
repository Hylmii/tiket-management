# Vercel Environment Variables Setup Guide

## Required Environment Variables for Vercel Deployment:

### 1. Database
- `DATABASE_URL` - Use Vercel Postgres or external database URL
  Example: `postgres://user:password@host:port/database`

### 2. NextAuth
- `NEXTAUTH_SECRET` - Generate a strong secret
  Run: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your Vercel deployment URL
  Example: `https://your-app-name.vercel.app`

### 3. Email (Optional)
If you want email functionality, configure these:
- `EMAIL_FROM`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

If not using email, leave them empty or remove them.

### 4. App Configuration
- `APP_NAME` - "EventHub - Ticket Management"
- `APP_URL` - Your Vercel deployment URL

## Setup Steps:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with production values
4. Redeploy your application

## Database Options:

### Option 1: Vercel Postgres (Recommended)
1. Add Vercel Postgres to your project
2. Use the provided DATABASE_URL

### Option 2: External Database
Use any PostgreSQL database (Railway, Supabase, etc.)

## Important Notes:
- SQLite (file:./dev.db) won't work on Vercel
- Make sure to use PostgreSQL for production
- The app will automatically run migrations on deployment
