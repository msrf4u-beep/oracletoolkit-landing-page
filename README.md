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


## v14 Premium Consistency Update

This version standardizes OracleToolkit around 5 live accelerators everywhere:

1. COA Transformation Accelerator
2. BCEA Design Accelerator
3. Journal Approvals Accelerator
4. AP Invoice Approvals Accelerator
5. Per Diem Transformation Engine

Consistency fixes included:
- Sidebar shows all 5 live tools
- Dashboard count shows 5 live tools
- Hero section offers all live accelerator launch paths
- Member dashboard includes all 5 live tool cards
- Finance module shows Journal Approvals under GL & BCEA
- Payables module shows AP Invoice Approvals as live
- Feedback wording replaces Request Demo


## v15 Trust + Monetization Upgrade

This release adds the missing trust and monetization foundation:

- Implementation credibility layer
- Real project pain framing
- Implementation use-case matrix
- Consultant productivity metrics
- Product roadmap
- Release notes
- Controlled early-access positioning
- Premium documentation roadmap

The focus is no longer only adding tools. The platform now supports:
- perceived product quality
- implementation usefulness
- workflow continuity
- consultant trust
- easier future monetization
