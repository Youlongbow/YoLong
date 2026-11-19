# RAVEN — Independent Website (Migration Preview)

**Cloudflare preview:** https://yolong.bournelong511.workers.dev/

**Repository:** https://github.com/Youlongbow/YoLong

This is the independent bilingual RAVEN security research, professional portfolio and HEAT training website, built for Cloudflare Workers Static Assets with GitHub-connected automatic deployment.

## Deployment settings

| Setting | Value |
|---|---|
| Project | `yolong` |
| Worker config | `wrangler.jsonc` |
| Build command | `node scripts/build.mjs` |
| Deploy command | `npx wrangler deploy` |
| Static assets | `dist` |
| Git branch | `main` |

No Node dependencies are required for the production site build. GitHub Actions validates the build and tests HTTP endpoints; Playwright browser acceptance tests can be triggered manually.

## Content in the preview

- **Global security archive:** 125 source-preserved historical records in Chinese and English; each has its own link and complete original event assessment, source links, keyword search and category filters. Latest event in this imported dataset: **2026-11-17**.
- **Research:** 5 complete original Chinese research reports and 1 complete English research report; research index also retains links to previous PDF publications.
- **Core pages:** bilingual About, Experience, Contact and HEAT course introduction.
- **HEAT:** 10 complete modules and 1 comprehensive review in each language (22 localized lesson pages), with existing quiz links retained.
- **External applications:** links to existing security career listings, HEAT quizzes and the operations workspace. These independent applications are not yet consolidated.

## Authoring files

| File | Purpose |
|---|---|
| `content/site.json` | Brand copy, homepage and portfolio sections |
| `content/security-zh.json` / `security-en.json` | Localized security-event archive |
| `content/research-zh.json` / `research-en.json` | Original full-length research pages |
| `content/pages-zh.json` / `pages-en.json` | Core site content |
| `content/training-zh.json` / `training-en.json` | All HEAT module text |

The build materializes HTML routes under `dist`, publishes site assets, and generates a `_redirects` mapping for known legacy Notion page IDs.

## Important migration controls

1. **Preview, not production:** `robots.txt` disallows indexing until cutover. The existing `www.ravenlong.com` and all DNS entries remain unchanged.
2. **Automation remains on Notion:** the existing monitoring tasks have not been switched to GitHub publishing. Do not represent the static archive as live updates.
3. **Source preservation:** source titles, event assessments and citations are retained as imported. Research tables are rendered on the new site.
4. **Media and legacy publications:** images, charts, embedded videos, original attachments/PDFs and a subset of older articles still need migration. Media placeholders link readers to the original source during the interim.
5. **Production cutover:** confirm legacy URL redirects, verify Chinese mainland accessibility and mobile UX, transfer original branded logo and media, complete publishing automation, and only then connect `www.ravenlong.com`.
6. **Cost management:** keep the site on the static Cloudflare tier when feasible; monitor actual requests, build quotas and any third-party services before cancelling the paid Notion site.

## Test workflows

- `.github/workflows/verify-site.yml`: syntax and static build verification.
- `.github/workflows/live-smoke.yml`: checks currently deployed Cloudflare URLs and data.
- `.github/workflows/browser-preview.yml`: on-demand Chromium desktop/mobile interaction verification.

**Status:** substantial content and layouts are migrated; legacy media, automated publishing, custom-domain cutover and final production acceptance remain outstanding.
