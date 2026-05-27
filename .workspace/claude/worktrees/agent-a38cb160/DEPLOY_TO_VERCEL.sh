#!/bin/bash

# Deploy Personal Website to Vercel
# This script automates the GitHub and Vercel deployment process

set -e

echo "=========================================="
echo "Personal Website Deployment Setup"
echo "=========================================="
echo ""

# Step 1: Authenticate with GitHub
echo "Step 1: GitHub Authentication"
echo "--------"
echo "Checking GitHub CLI authentication..."

if ! gh auth status &> /dev/null; then
    echo ""
    echo "⚠️  GitHub CLI is not authenticated."
    echo "Starting GitHub login in your browser..."
    echo ""
    gh auth login --web
fi

echo "✅ GitHub authenticated"
echo ""

# Step 2: Create GitHub Repository
echo "Step 2: Creating GitHub Repository"
echo "--------"

REPO_NAME="personal-website"
GITHUB_USER=$(gh api user -q '.login')

echo "Creating repository: $REPO_NAME"
echo "GitHub user: $GITHUB_USER"
echo ""

if gh repo view "$REPO_NAME" &> /dev/null; then
    echo "✅ Repository already exists"
else
    echo "📦 Creating new repository..."
    gh repo create "$REPO_NAME" \
        --source=. \
        --remote=origin \
        --push \
        --private
    echo "✅ Repository created and code pushed"
fi

echo ""

# Step 3: Provide Vercel deployment instructions
echo "Step 3: Deploy to Vercel"
echo "--------"
echo ""
echo "Your code is now on GitHub! ✅"
echo "Repository: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "To complete the deployment to Vercel:"
echo ""
echo "1. Go to: https://vercel.com"
echo "2. Sign in with GitHub (or create account)"
echo "3. Click 'Add New' → 'Project'"
echo "4. Select 'Import Git Repository'"
echo "5. Choose '$REPO_NAME' from your repositories"
echo "6. Click 'Import'"
echo "7. Framework: Next.js (auto-detected)"
echo "8. Click 'Deploy'"
echo ""
echo "Your site will be live in 2-3 minutes!"
echo ""
echo "=========================================="
echo "Deployment Setup Complete! 🚀"
echo "=========================================="
