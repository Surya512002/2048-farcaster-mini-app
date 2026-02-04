# Deployment Troubleshooting Guide

## Current Status
Your pull request adds smart contract functionality for game fee collection. The preview environment shows Analytics SDK warnings which are non-critical.

## Known Issues & Fixes Applied

### 1. Analytics SDK Errors (Fixed ✓)
- **Issue**: "Analytics SDK: Failed to fetch" errors in preview
- **Root Cause**: Vercel Analytics tries to fetch in restricted preview environment
- **Fix Applied**: Analytics component only runs in production (`process.env.NODE_ENV === "production"`)

### 2. TypeScript Path Resolution (Fixed ✓)
- **Issue**: Import resolution failures during Vercel build
- **Root Cause**: Incorrect tsconfig.json path mapping
- **Fix Applied**: Updated path aliases in tsconfig.json with explicit mappings for app/, components/, lib/

### 3. Hardhat Dependencies (Fixed ✓)
- **Issue**: Hardhat in production dependencies causes build bloat
- **Root Cause**: Hardhat should only be for development
- **Fix Applied**: Moved hardhat to devDependencies

### 4. Next.js Configuration (Fixed ✓)
- **Issue**: Build errors were masked by ignoreBuildErrors flag
- **Root Cause**: TypeScript errors not visible during build
- **Fix Applied**: Removed ignoreBuildErrors and added proper webpack fallbacks

## If Build Still Fails

### Step 1: Check Vercel Build Logs
1. Go to your Vercel project dashboard
2. Click on the failed deployment
3. View the "Build Logs" section
4. Look for error messages like:
   - `Module not found`
   - `Cannot find module`
   - `Type error`
   - `SyntaxError`

### Step 2: Common Build Issues

**Issue: "Module not found" errors**
\`\`\`
Solution: Ensure all imports use correct @/ path aliases
Check: app/layout.tsx, app/providers.tsx, app/page.tsx
\`\`\`

**Issue: "@coinbase/onchainkit" import errors**
\`\`\`
Solution: Verify package.json has correct version
Command: npm list @coinbase/onchainkit
\`\`\`

**Issue: Wagmi or viem import errors**
\`\`\`
Solution: Check versions are compatible
Ensure: wagmi, viem, @coinbase/onchainkit versions match
\`\`\`

### Step 3: Local Build Test
\`\`\`bash
# Clear cache and rebuild locally
rm -rf .next
npm run build

# If that works, it's likely a Vercel environment issue
# Try redeploying
\`\`\`

## Smart Contract Integration

The smart contract files are properly excluded from Vercel deployment:
- `.vercelignore` excludes `/contracts` and `/scripts`
- Smart contract ABI is integrated via constants in `/lib/constants.ts`
- Payment function in `PaymentModal.tsx` handles USDC transfers to your wallet

## Environment Variables Required

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
POSTGRES_URL=your_url
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key
\`\`\`

All set in your Vercel project's Settings > Environment Variables.

## Next Steps

1. **Check the exact Vercel error** - Share the specific error message from Vercel logs
2. **Test locally** - Run `npm run build` to catch errors before deployment
3. **Verify all env vars** are set in Vercel dashboard
4. **Check package versions** - Ensure dependency compatibility
