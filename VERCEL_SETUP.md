# Vercel Environment Variables Setup Guide

## CRITICAL: You MUST set these environment variables in your Vercel dashboard

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com
2. Log in and go to your project: `thysia-buy-and-selling-website-main`
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### Step 2: Add These 3 Environment Variables

For EACH variable, make sure to select ALL THREE environments:
- ✅ Production
- ✅ Preview  
- ✅ Development

#### Variable 1: DATABASE_URL
```
Name: DATABASE_URL
Value: mongodb+srv://Thysia:Craze09.@cluster0.ystyc.mongodb.net/thysia-ecommerce?retryWrites=true&w=majority
Environments: Production, Preview, Development
```

#### Variable 2: NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: your-super-secret-key-change-this-in-production-12345
Environments: Production, Preview, Development
```

#### Variable 3: NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://thysia-buy-and-selling-website-main.vercel.app
Environments: Production, Preview, Development
```

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the "..." menu
4. Click **Redeploy**

### Step 4: Test
After redeployment, test these URLs:
- https://thysia-buy-and-selling-website-main.vercel.app/api/env-check
- https://thysia-buy-and-selling-website-main.vercel.app/api/test-mongodb
- https://thysia-buy-and-selling-website-main.vercel.app/api/diagnostics

## Common Issues:

1. **404 errors**: Environment variables not set correctly
2. **401 auth errors**: NEXTAUTH_URL or NEXTAUTH_SECRET wrong
3. **500 database errors**: DATABASE_URL not set or incorrect

## MongoDB Atlas Setup:
1. Make sure your MongoDB cluster is running
2. Whitelist IP: 0.0.0.0/0 (to allow Vercel connections)
3. Check database user permissions

## If still not working:
1. Check Vercel function logs in dashboard
2. Verify environment variables are saved
3. Make sure you selected all 3 environments for each variable
