# Base Mini App Setup Guide

## Opening the App as a Base Mini App

This 2048 game is configured to run as a mini app within the Base app. Follow these steps to open it:

### For End Users

1. **Open the Base App** on your mobile device
2. **Search for or scan** the mini app link: `https://2048-farcaster-mini-app.vercel.app`
3. The app will automatically open within the Base app interface (not in browser)
4. **Connect your wallet** when prompted
5. **Pay the gaming fee** (0.001 USDC) to start playing

### Technical Configuration

The app is configured with the following components for Base mini app support:

#### 1. **OnchainKit MiniKit** (`app/providers.tsx`)
- Initialized with `OnchainKitProvider` with `miniKit: { enabled: true }`
- Provides automatic authentication context and user FID
- Handles all Base-specific functionality

#### 2. **MiniKit Context Hook** (`app/page.tsx`)
- Uses `useMiniKit()` from `@coinbase/onchainkit`
- Extracts authenticated user FID automatically
- Calls `setFrameReady()` to signal app is loaded

#### 3. **Manifest Configuration** (`public/.well-known/farcaster.json`)
- Contains `"base:app_id": "696282498a6eeb04b568dccb"`
- Registers app as a Base mini app
- Includes Farcaster account association for authenticity

#### 4. **Layout Meta Tags** (`app/layout.tsx`)
- Added `"base:app_id"` meta tag
- Added `"farcaster:frame": "vNext"` for Frame support
- Proper Open Graph tags for sharing

### Environment Variables Required

\`\`\`
NEXT_PUBLIC_ONCHAINKIT_API_KEY=<your-api-key>
\`\`\`

Get your API key from: https://keys.coinbase.com/

### How It Works

1. User opens the link in Base app
2. Base detects the `.well-known/farcaster.json` manifest
3. OnchainKit MiniKit SDK initializes automatically
4. User context (FID, address) is provided via `useMiniKit()` hook
5. App renders within Base mini app container
6. Payment integration handles in-app transactions on Base network

### Troubleshooting

- **App opens in browser instead of Base app**: Ensure you're using the Base mobile app and the manifest is correctly deployed
- **No user context**: Check that `NEXT_PUBLIC_ONCHAINKIT_API_KEY` is set correctly
- **Payment fails**: Verify user has sufficient USDC balance on Base network

### Related Files

- `.well-known/farcaster.json` - Farcaster frame manifest
- `app/providers.tsx` - OnchainKit configuration
- `app/page.tsx` - MiniKit initialization
- `app/layout.tsx` - Meta tags and layout
