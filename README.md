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


## OracleToolkit Workspace v1

This release adds the first implementation operating system layer:

- Create / update project workspace
- Resume previous work
- Project phase tracker
- Current workspace dashboard
- Contextual tool recommendations
- Saved notes
- Recent workspace activity
- Saved accelerator run history

Current storage:
- Browser localStorage
- No backend database yet
- Ideal for MVP validation before Supabase/Firebase integration

Future upgrade:
- Clerk user ID based cloud storage
- Multi-project workspace
- Team collaboration
- Saved output files
- Subscription-based project history


## OracleToolkit Cloud Workspace v1 — GitHub Ready

This package adds Supabase cloud persistence.

### New Files
- `supabase-config.js`
- `cloud-workspace.js`

### Supabase Project URL
`https://qhptsxmsebhsfqzjuqrd.supabase.co`

### Supabase Publishable Key
`sb_publishable_reZtzPTOQCGTnIzIRva4ww_3T6u5Vbs`

### Important Clerk Requirement
Clerk must have a JWT template named `supabase`.

The site uses:
`window.Clerk.session.getToken({ template: "supabase" })`

### Test Flow
1. Login to OracleToolkit
2. Open Dashboard
3. Create Project Workspace
4. Click `Save Current Workspace to Cloud`
5. Confirm project appears under Cloud Workspace
6. Refresh browser
7. Click `Refresh Cloud Projects`
8. Confirm saved project loads from Supabase

### Security
Never add Supabase secret key, service role key, or Clerk secret key to frontend/GitHub.


## OracleToolkit Cloud Workspace Engine v2

This release upgrades the workspace from a simple cloud save panel into a proper workspace engine:

- Create multiple cloud projects
- Update existing cloud projects
- Project switcher
- Resume selected project
- Save accelerator runs under selected project
- Load runs by project
- Launch related tools from saved runs
- Supabase cloud persistence
- Clerk user-based authentication

### Required Supabase Tables

- `projects`
- `accelerator_runs`

### Required Clerk Setup

JWT template name must be:

`supabase`

### Test Flow

1. Login
2. Create Project A and save
3. Click New Project
4. Create Project B and save
5. Use Project Switcher to move between Project A and Project B
6. Save accelerator runs under each project
7. Refresh browser
8. Confirm projects and runs reload from Supabase


## Cloud Workspace Engine v3 Navigation Fix

This release fixes the confusing inactive dashboard controls:

- Member Workspace button now scrolls to the Cloud Workspace Engine
- All Tools button now scrolls to Tool Library
- Calendar button scrolls to phase tracker
- Notification button scrolls to saved runs/activity
- Added top project switcher
- Sidebar Workspace OS now points to the Cloud Workspace Engine
- Old browser-only local workspace is hidden to avoid confusion
- Multi-project switching is clearer and visible


## Phase 1 Billion-Dollar Positioning Upgrade

Added:
- New positioning headline
- Category vision: Jira manages tasks, OracleToolkit manages implementation intelligence
- Early Access lead capture form
- GA4 custom events for early access and audience CTAs
- Audience sections: Consultants, Solution Architects, PMO / Delivery Leaders


## Billion-Dollar Vision v2

This version upgrades OracleToolkit from a tools/platform positioning into a category-defining implementation operating system narrative.

Major positioning upgrades:
- Oracle Cloud Implementation Operating System for Finance & Public Sector Delivery Teams
- Jira manages tasks. OracleToolkit manages implementation intelligence.
- Implementation memory layer
- Methodology engine concept
- Platform layer architecture
- Operating system capabilities: discovery, design decisions, testing, cutover, accelerators, audit evidence
- Stronger narrative around lost implementation intelligence and institutional memory


## BCEA Playbook v1 Website Integration

This release adds the BCEA Playbook into OracleToolkit as a website experience.

Added:
- Main BCEA Playbook section
- BCEA lifecycle: Discovery, Design, Build, SIT, UAT, Go-Live, Hypercare
- Decision framework
- Risk library
- Connected accelerators
- Standalone `bcea-playbook.html`
- Navigation link to Playbooks

Strategic goal:
Turn OracleToolkit from a tool platform into an Oracle implementation methodology operating system.


## COA Playbook v1 Website Integration

This release adds the COA Playbook as the second major methodology asset.

Added:
- COA Playbook section
- COA lifecycle: Discovery, Design, Crosswalk, Validation, Build, SIT/UAT, Go-Live
- COA Decision Framework
- COA Risk Library
- COA Deliverables
- Connected accelerators
- Standalone `coa-playbook.html`

Strategic goal:
Position OracleToolkit as the implementation intelligence platform for Oracle COA and BCEA architecture, not just a collection of tools.


## Discovery Command Center v1

This release adds Priority 3: Discovery Command Center.

Added:
- Discovery Command Center section
- Standalone `discovery-command-center.html`
- Discovery workstreams:
  - COA Discovery
  - BCEA Discovery
  - Approval Discovery
  - Migration Discovery
  - Testing Discovery
  - Cutover Discovery
- Decision capture framework
- Required client inputs
- Discovery risk radar
- Links to COA Playbook, BCEA Playbook, Workspace Engine, and accelerators

Strategic goal:
Move OracleToolkit from tool/playbook platform into Oracle implementation operating system behavior.


## Navigation Dropdown Optimization

Added:
- Live Tools dropdown with all 5 active tools
- Playbooks dropdown
- Discovery dropdown
- Platform dropdown
- Sticky quick navigation bar
- Quick index section after hero
- Click/touch-friendly dropdown JS
- Scroll-margin optimization for long pages


## Clean Header Navigation Fix

This release removes duplicate navigation headings by replacing the entire header nav with one controlled dropdown structure.

Fixed:
- Removed duplicated flat menu
- Kept one dropdown nav only
- Preserved Login/Profile, Launch COA, and Feedback buttons
- Added responsive behavior for smaller screens


## Auth + Navigation Consistency Fix

This release repairs issues caused by the navigation redesign.

Fixed:
- Dashboard button restored
- Login button preserved
- Logout button restored
- Auth state updates when user signs in/out
- Member Workspace requires login
- Dropdown navigation retained
- Duplicate headings remain removed

Important:
This file intentionally keeps auth placeholders in the header:
- `login-button`
- `logout-button`
- `dashboard-button`
- `user-pill`


## v16 Common Design Path Update

Added the Enterprise Structure Intelligence Engine live link:

https://enterprise-structure-intelligence-fgps56livskgqsfixq7psw.streamlit.app/

Recommended Common Design flow:
1. Enterprise Structure Intelligence
2. COA Transformation Accelerator
3. BCEA Design Accelerator

This release adds a new Common Design navigation dropdown and updates live accelerator count from 5 to 6.


## Added Live Tool

- Discovery Command Center Pro: https://discoverycommandcenterpro-fu9jxdqbb4qtc28jexi7ul.streamlit.app/
- Enterprise Structure Intelligence: https://enterprise-structure-intelligence-fgps56livskgqsfixq7psw.streamlit.app/


## Phase 1 Trust + SOW/RICE Update

This package adds:
- SOW to RICE Intelligence under Common Design
- Configuration Readiness Engine under Build & Configure
- Scenario Intelligence Engine under Testing / Build execution flow
- Phase 1 PHI/PII/SPI safe-use guidance
- Upload restriction section
- Terms and privacy notice foundation
- Live tool count updated to 10


## Latest Update — Guided Workflow Onboarding

This package adds a homepage guided workflow launcher: “What are you trying to solve?” It routes first-time users by Oracle Cloud implementation problem and lifecycle phase, while preserving Phase 1 PHI/PII/SPI safe-use guidance, SOW to RICE Intelligence, and all existing auth/dashboard behavior.
