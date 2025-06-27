# Database Setup Guide

## Option 1: Free Cloud Database (Recommended)

### Using Neon (Free PostgreSQL)
1. Go to https://neon.tech/
2. Sign up for a free account
3. Create a new project
4. Copy the connection string
5. Replace the DATABASE_URL in .env with your connection string

### Using Supabase (Free PostgreSQL)
1. Go to https://supabase.com/
2. Sign up for a free account  
3. Create a new project
4. Go to Settings > Database
5. Copy the connection string
6. Replace the DATABASE_URL in .env with your connection string

### Using Railway (Free PostgreSQL)
1. Go to https://railway.app/
2. Sign up for a free account
3. Create a new PostgreSQL service
4. Copy the connection string
5. Replace the DATABASE_URL in .env with your connection string

## Option 2: Local PostgreSQL
If you have PostgreSQL installed locally:
```
DATABASE_URL="postgresql://username:password@localhost:5432/thysia_db"
```

## After setting up the database:
1. Run: `npm run db:push`
2. Run: `npm run db:seed`
3. Start the app: `npm run dev`

## Current Status
The app is configured to work with PostgreSQL. You need to provide a valid DATABASE_URL in the .env file.
