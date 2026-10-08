# PatNav emergency page

The public page that opens when hospital staff scan a PatNav Emergency Mode
QR code. Served by GitHub Pages at https://attayah.github.io/patnav-emergency/.

- This repo holds **no health data and no secrets** — only the page's code.
- The access token is in the URL fragment (`#t=…`), which browsers never
  send to GitHub. The page's script sends it only to PatNav's
  `emergency-view` function, which checks it on every request and returns
  only what the person approved for emergency sharing.

**Source of truth:** `emergency-page/` in the main PatNav repo. To update
this page, copy those three files here and push. If this page's address
ever changes, also update `EMERGENCY_PAGE_URL` (lib/emergencyAccess.ts) and
`PAGE_ORIGIN` (supabase/functions/emergency-view/index.ts) in PatNav.
