# RAVEN Website

Independent bilingual website for **RAVEN — Security Architecture / Risk Governance / Field Practice**.

## Hosting

Designed for Cloudflare Pages via GitHub integration. The initial release is a **preview**: the existing Notion site and live monitoring automations remain unchanged until migration validation is complete.

- Repository: `Youlongbow/YoLong`
- Build command: `node scripts/build.mjs`
- Build output directory: `dist`
- Root directory: `/`
- Framework preset: `None`

No third-party npm dependencies are needed for the static site build.

## Content operations

Localized website copy and event records live in `content/site.json`. The generator produces localized HTML pages with functional navigation and search/filter controls. Updating `content/site.json` then committing to `main` triggers a Cloudflare Pages deployment after Git integration is configured.

## Migration guardrails

1. Preserve original Notion URLs, media and article attachments before changing DNS.
2. Publish the preview to a `*.pages.dev` address and verify Chinese/English layouts, mobile navigation and search.
3. Transition event publication automations only after their new publish target and post-write checks are configured.
4. Keep `www.ravenlong.com` pointing to the existing website until the new site passes acceptance checks.
5. Create redirects for the legacy Notion `/p/<id>` URLs during production cutover.

## Status

**Phase 1:** design system and static previews underway. **No DNS changes, no production migration.**
