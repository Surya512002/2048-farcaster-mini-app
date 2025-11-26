# 2048 Farcaster Mini App with Base Network

A fully functional 2048 game built as a Farcaster Mini App with Base Network integration.

## Features

- Classic 2048 gameplay with keyboard and touch controls
- Farcaster Mini App SDK integration
- Base Network wallet connection via wagmi
- Share scores directly to Farcaster
- Responsive design optimized for mobile

## Deployment Instructions

1. **Deploy to Vercel**: Click the "Publish" button in v0
2. **Update Farcaster Manifest**: Replace `your-domain.com` in `public/.well-known/farcaster.json` with your deployed URL
3. **Test in Farcaster**: Use the [Mini App Preview Tool](https://miniapps.farcaster.xyz/preview) to test your app
4. **Submit to Farcaster**: Once tested, submit your Mini App for review

## Local Development

Since Farcaster SDK requires proper domain origins, local development will show origin errors. The game works perfectly in preview mode, and all Farcaster features will work after deployment.

## Base Network Integration

The app includes wagmi integration for Base Network. Users can connect their wallets directly through the Farcaster Mini App SDK's Ethereum provider.
