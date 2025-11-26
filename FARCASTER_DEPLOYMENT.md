# Deploying to Farcaster

This 2048 game is ready to be deployed as a Farcaster Mini App on Base Network. Follow these steps to enable Farcaster features:

## Step 1: Deploy to Vercel

Click the "Publish" button in v0 to deploy your app.

## Step 2: Add Farcaster SDK Packages

After deployment, add these dependencies to your `package.json`:

\`\`\`json
"@farcaster/frame-sdk": "latest",
"@farcaster/miniapp-sdk": "latest",
"@farcaster/miniapp-wagmi-connector": "latest"
\`\`\`

Then run:
\`\`\`bash
npm install
\`\`\`

## Step 3: Create Farcaster Manifest

Create `public/.well-known/farcaster.json`:

\`\`\`json
{
  "accountAssociation": {
    "header": "your-signature-header",
    "payload": "your-signature-payload",
    "signature": "your-signature"
  },
  "frame": {
    "version": "next",
    "name": "2048 Game",
    "iconUrl": "https://your-domain.com/icon.png",
    "homeUrl": "https://your-domain.com",
    "imageUrl": "https://your-domain.com/preview.png",
    "buttonTitle": "Play 2048",
    "splashImageUrl": "https://your-domain.com/splash.png",
    "splashBackgroundColor": "#faf8ef",
    "webhookUrl": "https://your-domain.com/api/webhook"
  }
}
\`\`\`

Replace `your-domain.com` with your actual Vercel deployment URL.

## Step 4: Update WagmiProvider

In `components/providers/WagmiProvider.tsx`, import and add the Farcaster connector:

\`\`\`tsx
import { farcasterFrame } from '@farcaster/miniapp-wagmi-connector'

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [farcasterFrame()],
})
\`\`\`

## Step 5: Enable SDK in app/page.tsx

The SDK initialization code is already in place. Once deployed, it will:
- Call `sdk.actions.ready()` when the app loads
- Display the user's Farcaster ID (FID)
- Enable share-to-Farcaster functionality

## Step 6: Test Your Mini App

1. Go to Warpcast
2. Use the Mini App Preview Tool
3. Enter your deployed URL
4. Test the game and wallet connection

## Features

- ✅ 2048 game with touch and keyboard controls
- ✅ Base Network wallet integration via Wagmi
- ✅ Share scores to Farcaster
- ✅ User FID display
- ✅ Responsive design

## Troubleshooting

**"Ready not called" error**: Make sure `sdk.actions.ready()` is called after your app fully loads. This is already handled in `app/page.tsx`.

**Wallet not connecting**: Ensure the Farcaster connector is properly configured in WagmiProvider and you're testing in an actual Farcaster frame, not a browser.

**Origin errors**: These only occur in development/preview. They will not appear on your deployed domain.
