# Vercel Deployment Guide for T-System

This guide will help you deploy your T-System project to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [GitHub account](https://github.com/signup) (recommended for easier deployment)

## Environment Variables

Based on the codebase analysis, you'll need to set up the following environment variables in your Vercel project:

### Required Environment Variables

```
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Optional Environment Variables (if using Stripe)

```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Deployment Steps

### Option 1: Deploy from GitHub

1. Push your code to a GitHub repository
2. Log in to your Vercel account
3. Click "Add New..." > "Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: next build
   - Output Directory: .next
6. Add all the required environment variables in the "Environment Variables" section
7. Click "Deploy"

### Option 2: Deploy using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to your project directory and run:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project
5. Add environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_CONVEX_URL
   # Repeat for each environment variable
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

## Post-Deployment Configuration

### Update Clerk Configuration

Make sure to add your Vercel deployment URL to your Clerk application's allowed URLs.

### Update Convex Configuration

Ensure your Convex deployment is properly configured to work with your Vercel deployment URL.

### Update Razorpay/Stripe Webhook URLs

If you're using payment processing, update the webhook URLs in your Razorpay/Stripe dashboard to point to your Vercel deployment.

## Troubleshooting

- If you encounter build errors, check the Vercel build logs for details
- Ensure all environment variables are correctly set
- Verify that your Clerk and Convex configurations are correctly set up
- Check that your Next.js version is compatible with Vercel

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Clerk Documentation](https://clerk.dev/docs)
- [Convex Documentation](https://docs.convex.dev/)