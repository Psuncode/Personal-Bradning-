# Quick Start: Deploy to Vercel in 3 Commands

Your website is ready! Just 3 commands to get it live.

## Command 1: Authenticate GitHub

```bash
gh auth login
```

- Choose: `HTTPS`
- Choose: `Y` to authenticate with GitHub
- Copy the code and visit the URL shown
- Paste your code at https://github.com/login/device
- Come back to terminal - you're authenticated!

## Command 2: Create GitHub Repo & Push

```bash
gh repo create personal-website --source=. --remote=origin --push
```

This creates a GitHub repo and uploads your code.

## Command 3: Deploy to Vercel

Visit https://vercel.com and:
1. Click "Add New" → "Project"  
2. Select "personal-website" repo
3. Click "Deploy"

**Done!** Your site is now live. Vercel will show you the URL. 🎉

---

Every time you update your code and push to GitHub, Vercel automatically redeploys!

For detailed help: Read `VERCEL_DEPLOYMENT_GUIDE.md`
