# Farcaster Mini App Launch Checklist

## Pre-Deployment Setup

Your 2048 game is now ready to deploy as a Farcaster Mini App! Follow these steps:

### 1. Deploy to Vercel

Click the **Publish** button in v0 to deploy your app to Vercel.

### 2. Update Farcaster Manifest

After deployment, update `public/.well-known/farcaster.json` with your actual domain:

Replace all instances of `your-domain.com` with your actual Vercel deployment URL (e.g., `2048-game.vercel.app`).

### 3. Test the App

1. Visit your deployed URL directly to ensure the game works
2. The SDK will automatically initialize with `sdk.actions.ready()`
3. The splash screen will dismiss after ready() is called

### 4. Submit to Farcaster

1. Go to [Warpcast Developer Portal](https://warpcast.com/~/developers)
2. Submit your Mini App with your deployment URL
3. Wait for approval

## Features Ready for Launch

- ✅ Farcaster SDK integrated with `sdk.actions.ready()` call
- ✅ Dynamic SDK loading (works in preview + production)
- ✅ Share functionality via Farcaster composer
- ✅ Base network support (ready for wallet integration)
- ✅ Manifest file configured
- ✅ CORS headers set up

## Post-Launch

After deployment, the "origins don't match" error in preview will disappear because:
- Your app will run on its own domain
- The manifest domain will match the deployment domain
- Farcaster's origin validation will pass

The game works perfectly in preview mode - the origin error is expected and only affects the v0 preview environment!
