# OracleToolkit Version 11 — Modular SaaS Architecture

Upload/replace these files in your GitHub repo root:

- index.html
- styles.css
- auth.js
- dashboard.js

Vercel will redeploy automatically.

## Includes
- Modular landing page
- Premium member dashboard
- Clerk login integration
- COA Accelerator live link
- Per Diem Engine live link
- AI assistant coming-soon section
- Trust/authority section
- Dashboard search
- Google Analytics event hooks

## Important
The Clerk key inside index.html is a publishable key and is safe in frontend code. Never paste your Clerk Secret Key in frontend files.


## v12 Member Project Workspace

This version adds a browser-based project workspace and saved-run history:

- Create a project/client workspace entry
- Select module and accelerator used
- Add status and notes
- Save local run history
- Export saved runs as JSON
- Delete individual runs
- Clear saved history

Important: this v12 workspace uses `localStorage`, so history is saved in the user's browser only. It is not yet synced to a cloud database. This is intentional for the current static Vercel setup.

Future upgrade:
- Supabase/Firebase user database
- Cloud saved history by Clerk user ID
- Saved files/output links
- Workspace sharing
- Subscription-based project storage
