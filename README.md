# UBIKParallax — Deploy to GitHub Pages

## Quick Deploy

```bash
cd UBIKParallax-deploy
git init
git checkout -b main
git add -A
git commit -m "Deploy UBIKParallax Digital Garden"
git remote add origin https://github.com/gasu04/UBIKParallax.git
git push -u origin main --force
```

Then go to **Settings → Pages** in your repo and set:
- Source: **Deploy from a branch**
- Branch: **main** / **(root)**
- Click **Save**

Your site will be live at: `https://gasu04.github.io/UBIKParallax/`

## Note on SPA Routing

The `404.html` file is a copy of `index.html` — this enables client-side routing on GitHub Pages so that direct links to notes (e.g., `/note/euler-identity`) work correctly.
