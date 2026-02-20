# Deploy Your Website to Vercel

Your website is ready to deploy! Follow these steps to get your site live.

## Prerequisites
- GitHub account (https://github.com/signup)
- Vercel account (https://vercel.com) - can use GitHub to sign up

## Step 1: Authenticate with GitHub CLI

Open your terminal and run:

```bash
gh auth login
```

Follow the prompts:
1. Select `HTTPS` for protocol
2. Confirm GitHub credentials authentication
3. Copy the one-time code that appears
4. Visit https://github.com/login/device
5. Paste your code and authorize
6. Return to terminal - authentication complete

## Step 2: Create GitHub Repository

After authenticating, run:

```bash
cd "/Users/philipsun/Documents/personal websit"
gh repo create personal-website --source=. --remote=origin --push
```

This will:
- Create a new repository called `personal-website` on your GitHub account
- Push your code to GitHub
- Set GitHub as your remote

**Expected output:**
```
✓ Created repository your-username/personal-website on GitHub
✓ Added remote https://github.com/your-username/personal-website.git
✓ Pushed commits to https://github.com/your-username/personal-website.git
```

## Step 3: Deploy to Vercel

### Method 1: Automatic (Recommended)

After pushing to GitHub:

1. Visit https://vercel.com
2. Sign in with GitHub
3. Click **"Add New"** → **"Project"**
4. Select **"Import Git Repository"**
5. Choose **`personal-website`** from your repositories
6. Click **"Import"**
7. Framework: **Next.js** (should auto-detect)
8. Click **"Deploy"**

Vercel will automatically build and deploy your site. You'll get a URL like:
```
https://personal-website-xxx.vercel.app
```

### Method 2: Using Vercel CLI

Alternatively, you can deploy using the Vercel CLI:

```bash
npm install -g vercel
vercel

# Follow the prompts to link your project and deploy
```

## Step 4: View Your Live Site

Once deployed, visit your Vercel URL to see your website live!

## What Happens Next

- **Future updates**: Every time you push to GitHub, Vercel automatically redeploys
- **Preview URLs**: Create pull requests to get preview deployments
- **Custom domain**: You can add a custom domain in Vercel settings
- **Environment variables**: Manage secrets in Vercel dashboard

## Troubleshooting

**"gh repo create" fails with auth error:**
- Run `gh auth status` to verify you're logged in
- Run `gh auth login` again if needed

**Vercel deployment fails:**
- Check your Next.js build locally: `npm run build`
- Review Vercel's build logs in dashboard
- Ensure all environment variables are set in Vercel

**Site is blank or showing errors:**
- Check browser console (F12) for errors
- Review Vercel deployment logs
- Ensure next.config.ts is properly configured

## Need Help?

- GitHub CLI: https://cli.github.com/
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Ready to deploy?** Start with Step 1 above! 🚀
