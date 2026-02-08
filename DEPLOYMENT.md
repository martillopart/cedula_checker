# Deployment Guide - Deploy to a Real Domain

This guide covers multiple deployment options to get your application live on a real domain.

## 🚀 Option 1: Vercel (Recommended - Easiest for Next.js)

Vercel is made by the Next.js team and offers the easiest deployment experience.

### Step 1: Prepare Your Code

1. **Create a Git repository** (if you haven't already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub/GitLab/Bitbucket**:
   - Create a new repository on GitHub
   - Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/cedula.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Sign up for Vercel**: https://vercel.com/signup
   - You can sign up with GitHub (recommended)

2. **Import your project**:
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**:
   In the Vercel dashboard, go to your project → Settings → Environment Variables:
   ```
   NEXTAUTH_SECRET=generate-a-random-string-here-use-openssl-rand-base64-32
   NEXTAUTH_URL=https://your-domain.vercel.app
   
   # Optional: Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at: `https://your-project.vercel.app`

### Step 3: Add Custom Domain

1. **In Vercel Dashboard**:
   - Go to your project → Settings → Domains
   - Add your domain (e.g., `cedula-checker.com`)
   - Follow DNS instructions (add CNAME or A records)

2. **Update Environment Variables**:
   - Update `NEXTAUTH_URL` to your custom domain
   - Redeploy if needed

**Cost**: Free tier includes:
- Unlimited deployments
- Custom domains
- SSL certificates (automatic)
- 100GB bandwidth/month

---

## 🌐 Option 2: Netlify

### Step 1: Deploy

1. **Sign up**: https://app.netlify.com/signup
2. **Connect GitHub** and import your repository
3. **Build settings** (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `.next`

### Step 2: Environment Variables

In Netlify Dashboard → Site settings → Environment variables:
```
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-site.netlify.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 3: Custom Domain

- Go to Domain settings
- Add your domain
- Configure DNS as instructed

**Cost**: Free tier available

---

## 🚂 Option 3: Railway

Good for apps that need persistent file storage.

### Step 1: Deploy

1. **Sign up**: https://railway.app
2. **New Project** → Deploy from GitHub
3. **Add PostgreSQL** (optional, for future database upgrade)

### Step 2: Environment Variables

In Railway dashboard → Variables:
```
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.up.railway.app
```

**Cost**: $5/month for hobby plan

---

## 🐳 Option 4: Self-Hosted (VPS)

For full control, deploy on a VPS (DigitalOcean, Linode, AWS EC2, etc.)

### Step 1: Set Up Server

1. **Create a VPS** (Ubuntu 22.04 recommended)
2. **SSH into server**:
   ```bash
   ssh root@your-server-ip
   ```

### Step 2: Install Dependencies

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2 (process manager)
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   ```

### Step 3: Deploy Application

   ```bash
   # Clone your repository
   git clone https://github.com/yourusername/cedula.git
   cd cedula
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env
   # Add:
   # NEXTAUTH_SECRET=your-secret-key
   # NEXTAUTH_URL=https://yourdomain.com
   
   # Build the application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "cedula" -- start
   pm2 save
   pm2 startup
   ```

### Step 4: Configure Nginx

   ```bash
   sudo nano /etc/nginx/sites-available/cedula
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/cedula /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Step 5: SSL Certificate (Let's Encrypt)

   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

**Cost**: $5-20/month depending on VPS provider

---

## 🔐 Important: Security Checklist

Before going live, ensure:

1. **Strong NEXTAUTH_SECRET**:
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```

2. **Update NEXTAUTH_URL** to your production domain

3. **Google OAuth Setup**:
   - Go to https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`

4. **File Upload Limits**:
   - Check your hosting provider's file size limits
   - Current limit: 10MB per file

5. **Rate Limiting**:
   - Consider upgrading to Redis-based rate limiting for production
   - Current in-memory rate limiting works but resets on server restart

---

## 📝 Pre-Deployment Checklist

- [ ] Code is in a Git repository
- [ ] All environment variables documented
- [ ] `NEXTAUTH_SECRET` is a strong random string
- [ ] `NEXTAUTH_URL` matches your production domain
- [ ] Google OAuth credentials configured (if using)
- [ ] Test build locally: `npm run build`
- [ ] Test production build: `npm start`
- [ ] Domain DNS configured
- [ ] SSL certificate installed (HTTPS)

---

## 🎯 Quick Start: Vercel (5 minutes)

**Fastest way to get online:**

1. Push code to GitHub
2. Sign up at vercel.com
3. Import GitHub repository
4. Add environment variables
5. Deploy!

You'll have a live URL in minutes: `https://your-project.vercel.app`

---

## 🔄 Continuous Deployment

All platforms above support automatic deployments:
- **Vercel/Netlify**: Auto-deploy on every git push
- **Railway**: Auto-deploy on every git push
- **VPS**: Set up GitHub Actions or use PM2 with git hooks

---

## 💡 Recommendations

- **For MVP/Demo**: Use **Vercel** (free, easiest)
- **For Production**: Use **Vercel** or **Netlify** (managed, reliable)
- **For Full Control**: Use **VPS** (more setup, more control)
- **For Database Upgrade**: Consider **Railway** or **Render** (easier database integration)

---

## 🆘 Troubleshooting

### Build Fails
- Check Node.js version (need 18+)
- Check environment variables are set
- Review build logs in deployment dashboard

### Domain Not Working
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Verify SSL certificate is installed

### Authentication Issues
- Verify `NEXTAUTH_URL` matches your domain exactly
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

---

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Netlify Docs: https://docs.netlify.com
