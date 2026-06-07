# Class Harmony - Deployment Guide

## Overview

This guide covers deploying Class Harmony to production on various platforms.

## Platform Comparison

| Platform | Cost | Setup Time | Scalability | Recommendation |
|----------|------|-----------|-------------|-----------------|
| **Cloudflare Workers** | Free tier available | 5 min | Global edge | ⭐ Best for global |
| **Vercel** | Free tier available | 5 min | Good auto-scaling | ⭐ Easiest setup |
| **Netlify** | Free tier available | 5 min | Good | Good alternative |
| **Heroku** | $7+/month | 10 min | Limited | For learning |
| **AWS Lambda** | Pay-per-use | 20 min | Excellent | Enterprise |
| **DigitalOcean** | $5+/month | 15 min | Good | VPS alternative |

## Deploy to Cloudflare Workers (Recommended)

### Prerequisites
```bash
npm install -g @cloudflare/wrangler
wrangler login
```

### Step 1: Update Configuration

Edit `wrangler.jsonc`:

```jsonc
{
  "name": "class-harmony-production",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "src/server.ts",
  "env": {
    "production": {
      "vars": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "your-anon-key"
      },
      "routes": [
        {
          "pattern": "your-domain.com/*",
          "zone_name": "your-domain.com"
        }
      ]
    }
  }
}
```

### Step 2: Build

```bash
npm run build
```

### Step 3: Deploy

```bash
wrangler deploy --env production
```

### Step 4: Custom Domain (Optional)

1. Go to Cloudflare Dashboard
2. Select your domain/zone
3. Go to Workers & Pages
4. Click "Add custom domain"
5. Enter your domain (e.g., timetable.university.edu)
6. Wait for DNS to propagate

### Step 5: Verify

```bash
curl https://your-domain.com/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## Deploy to Vercel

### Step 1: Connect GitHub

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" > "Project"
4. Select your GitHub repository
5. Click "Import"

### Step 2: Configure Environment

In Vercel dashboard:
1. Go to Settings > Environment Variables
2. Add:
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_KEY=your-key
   ```

### Step 3: Configure Build

In Vercel dashboard:
1. Go to Settings > General
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Install Command: `npm install`

### Step 4: Deploy

```bash
vercel deploy --prod
```

Or push to GitHub to auto-deploy.

### Step 5: Add Custom Domain

1. In Vercel project settings
2. Domains > Add Domain
3. Configure DNS records
4. Done!

---

## Deploy to Netlify

### Step 1: Connect GitHub

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site"
3. Select "Connect to Git"
4. Choose your repository
5. Click "Deploy site"

### Step 2: Configure Build

Netlify will auto-detect:
- Build command: `npm run build`
- Publish directory: `dist`

### Step 3: Environment Variables

1. Site Settings > Build & Deploy > Environment
2. Add environment variables:
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_KEY=your-key
   ```

### Step 4: Rebuild

1. Deploys > Trigger Deploy > Deploy Site
2. Wait for build to complete

### Step 5: Custom Domain

1. Domain Settings > Add Custom Domain
2. Point DNS to Netlify nameservers
3. Wait for DNS propagation

---

## Deploy to Docker (Self-Hosted)

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Step 2: Create .dockerignore

```
node_modules
dist
.git
.env.local
.env.*.local
```

### Step 3: Build Docker Image

```bash
docker build -t class-harmony:latest .
```

### Step 4: Run Docker Container

```bash
docker run -d \
  --name class-harmony \
  -p 3000:3000 \
  -e SUPABASE_URL=https://xxx.supabase.co \
  -e SUPABASE_KEY=your-key \
  class-harmony:latest
```

### Step 5: Access Application

Visit: `http://localhost:3000`

---

## Deploy to DigitalOcean App Platform

### Step 1: Connect GitHub

1. Go to [digitalocean.com](https://digitalocean.com)
2. Create account or login
3. Click "Apps" in sidebar
4. Click "Create Apps"
5. Select GitHub repository

### Step 2: Configure

1. Select branch (main)
2. Build command: `npm run build`
3. Run command: `npm start`
4. Click "Next"

### Step 3: Environment Variables

Add:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-key
```

### Step 4: Deploy

1. Review settings
2. Click "Create Resources"
3. Wait for deployment
4. Get live URL from dashboard

---

## Deploy to AWS Lambda

### Prerequisites

```bash
npm install -g serverless
serverless login
```

### Step 1: Create serverless.yml

```yaml
service: class-harmony

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    SUPABASE_URL: ${env:SUPABASE_URL}
    SUPABASE_KEY: ${env:SUPABASE_KEY}

functions:
  api:
    handler: dist/server.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

plugins:
  - serverless-plugin-tracing
```

### Step 2: Build & Deploy

```bash
npm run build
serverless deploy
```

### Step 3: Get Endpoint

```bash
serverless info
```

Will show your API endpoint.

---

## Environment-Specific Deployment

### Development
```bash
npm run dev
# Runs on http://localhost:5173
```

### Staging
```bash
wrangler deploy --env staging
# Add staging env to wrangler.jsonc
```

### Production
```bash
wrangler deploy --env production
# Fully optimized for production
```

---

## Post-Deployment Checklist

- [ ] API health check: `GET /api/health` returns 200
- [ ] Database connectivity verified
- [ ] Environment variables set correctly
- [ ] HTTPS enabled and working
- [ ] Custom domain configured (if applicable)
- [ ] DNS propagated (wait 24-48 hours)
- [ ] Monitoring/logging enabled
- [ ] Backups configured
- [ ] Rate limiting set up
- [ ] CORS properly configured
- [ ] Load testing completed
- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Performance monitoring set up
- [ ] Documentataion updated with live URL
- [ ] Team notified

---

## Monitoring & Logging

### Cloudflare
```bash
# View real-time logs
wrangler tail

# View specific environment
wrangler tail --env production
```

### Supabase
1. Dashboard > Logs
2. Check query performance
3. Monitor database activity
4. Review real-time subscriptions

### General
- Set up error tracking (Sentry, Rollbar)
- Configure log aggregation (LogRocket)
- Monitor performance (New Relic, DataDog)
- Set up uptime monitoring (Pingdom, UptimeRobot)

---

## Scaling Strategies

### Small Traffic (< 1000 req/day)
- Single Cloudflare Worker
- Supabase free tier
- No caching needed

### Medium Traffic (1000-10000 req/day)
- Multiple Cloudflare Workers
- Supabase Pro
- Add Redis caching
- Enable CDN caching

### High Traffic (> 10000 req/day)
- Cloudflare Workers + Load Balancing
- Supabase Business tier
- Dedicated Redis instance
- Database read replicas
- CDN for static assets

---

## Troubleshooting Deployments

### "Connection refused"
- Check Supabase credentials
- Verify database is running
- Check network connectivity
- Review firewall rules

### "Database timeout"
- Check database query performance
- Increase timeout limits
- Add database indexes
- Scale database resources

### "Out of memory"
- Check Node.js memory limits
- Optimize large data operations
- Implement pagination
- Use streaming for large responses

### "High latency"
- Add caching layer
- Use CDN for static assets
- Optimize database queries
- Consider edge computing

### "SSL/TLS errors"
- Ensure HTTPS is enabled
- Check certificate validity
- Verify DNS configuration
- Update certificate if expired

---

## Rollback Procedure

### Cloudflare Workers
```bash
# View deployment history
wrangler rollback --dry-run

# Rollback to previous version
wrangler rollback
```

### Vercel
1. Deployments tab
2. Click previous deployment
3. Click "..." > "Promote to production"

### Docker
```bash
# List images
docker images

# Run previous image
docker run -d class-harmony:v1.0.0
```

---

## Security in Production

### Essential Checklist
- [ ] .env file not committed
- [ ] Credentials rotated regularly
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation required
- [ ] Database backups automated
- [ ] Monitoring alerts set up
- [ ] Security headers added
- [ ] SQL injection prevention verified

### Cloudflare Settings
1. Enable WAF (Web Application Firewall)
2. Set rate limiting rules
3. Enable DDoS protection
4. Configure security headers
5. Enable HSTS

---

## Cost Estimation

| Service | Monthly Cost | Notes |
|---------|------------|-------|
| Cloudflare | $20+/month | Plus domain |
| Supabase | Free-$99/month | Based on usage |
| Vercel | Free-$50/month | Bandwidth-based |
| Netlify | Free-$20/month | Build minutes |
| **Total** | **$20-150+** | Varies by scale |

---

## Support During Deployment

- Check deployment logs for errors
- Review environment variables
- Verify database schema is created
- Test API endpoints manually
- Check browser console for JS errors
- Review server logs
- Contact platform support if stuck

---

**Recommended**: Start with **Cloudflare Workers** or **Vercel** for easiest deployment.

See other documentation files for complete guides.
