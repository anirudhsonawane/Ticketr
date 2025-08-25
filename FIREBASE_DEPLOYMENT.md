# Firebase Deployment Guide for T-System

> **IMPORTANT**: Firebase static hosting is incompatible with Next.js middleware. Please read the `MIDDLEWARE_DEPLOYMENT.md` file for details on this limitation and deployment options.

This guide will help you deploy your Next.js application to Firebase Hosting as a static site.

## Prerequisites

1. **Firebase CLI**: Install the Firebase CLI globally
   ```
   npm install -g firebase-tools
   ```

2. **Firebase Account**: Make sure you have a Firebase account and access to the project `ticketr-968af`

## Deployment Steps

### 1. Login to Firebase

Run the following command to log in to your Firebase account:

```bash
npm run firebase:login
```

This will open a browser window where you can authenticate with your Google account.

### 2. Configure for Static Export

Before building, you need to enable static export in your `next.config.ts` file:

1. Open `next.config.ts`
2. Uncomment the static export configuration:
   ```typescript
   // Change from:
   // output: 'export',
   // distDir: 'out',
   
   // To:
   output: 'export',
   distDir: 'out',
   ```

3. **Important**: You must also address the middleware compatibility issue by either:
   - Removing the middleware implementation in `src/middleware.ts`
   - Or implementing a client-side only authentication solution

### 3. Build Your Application

Build your Next.js application with static export:

```bash
npm run build
```

This will create a static export in the `out` directory as configured in your `next.config.ts`.

### 4. Deploy to Firebase

Deploy your application to Firebase Hosting:

```bash
npm run firebase:deploy
```

This will upload your static files to Firebase Hosting.

## Configuration Files

The following configuration files have been set up for Firebase deployment:

1. **firebase.json**: Configures Firebase Hosting settings
2. **.firebaserc**: Specifies the Firebase project ID
3. **next.config.ts**: Modified to support static export for Firebase Hosting

## Environment Variables

Since Firebase Hosting serves static files, you need to handle environment variables differently:

1. **Build-time Environment Variables**: These are embedded during the build process
2. **Runtime Environment Variables**: For variables that need to be accessed at runtime, consider using Firebase Remote Config or Firebase Functions

## Limitations with Firebase Hosting

Since Firebase Hosting only serves static files, there are some limitations:

1. **Server-side Features**: Server-side rendering (SSR), API routes, and server actions won't work with static hosting
2. **Dynamic Routes**: All dynamic routes must be pre-rendered at build time
3. **Authentication**: Client-side authentication with Clerk will work, but server-side authentication flows may need adjustments

## Alternative Deployment Options

If you need server-side functionality:

1. **Firebase Functions + Hosting**: Use Firebase Functions to handle server-side logic
2. **Vercel**: Consider using Vercel for full Next.js support including SSR and API routes

## Accessing Your Deployed Site

After deployment, your site will be available at:

- https://ticketr-968af.web.app
- https://ticketr-968af.firebaseapp.com

## Troubleshooting

1. **Build Errors**: If you encounter build errors, check the console output for specific issues
2. **Deployment Errors**: Run `firebase deploy --debug` for more detailed error information
3. **Missing Dependencies**: Ensure all required dependencies are installed

## Continuous Deployment

The GitHub Actions workflows in `.github/workflows` are already set up for continuous deployment:

1. **firebase-hosting-merge.yml**: Deploys on merges to the main branch
2. **firebase-hosting-pull-request.yml**: Creates preview deployments for pull requests