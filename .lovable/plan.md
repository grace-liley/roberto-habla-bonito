

## Issue: "How Roberto Works" link missing from menu on live site

### What I found

The code is correct — `src/components/Header.tsx` already includes the "How Roberto Works" link in the hamburger menu (line 38-39), and the Index page uses this Header. So the link should appear when you tap the menu icon on the chat page.

### Most likely cause

The live site at robertocon.me hasn't received the latest deployment. Lovable shows "up to date" but the custom domain may be serving a cached version.

### Steps to resolve

1. **Hard refresh the live site** — On your browser, do a hard refresh (Ctrl+Shift+R on desktop, or clear cache on mobile) on robertocon.me to bypass any cached version.

2. **Re-publish** — In Lovable, click the **Share** button (top right), then click **Publish**. Even if it says "up to date," click **Update** to force a fresh deployment.

3. **Verify** — After publishing, open robertocon.me in an incognito/private window, tap the hamburger menu, and confirm "How Roberto Works" appears.

### If the link is missing in the preview too

If you're saying the link doesn't appear even in the Lovable preview (not just the live site), there may be a build issue. Let me know and I can investigate further.

