# RAVEN production cutover — controlled migration runbook

_Last reviewed: 2026-11-20. This document records the pre-cutover conditions, not authorization to change production DNS._

## Current production and preview

- Independent Cloudflare Workers preview: `https://yolong.bournelong511.workers.dev/`
- GitHub source repository: `Youlongbow/YoLong`
- Existing public site still loads at `www.ravenlong.com` and serves the original Notion pages.
- GitHub -> Cloudflare automatic deployment is working for the preview.
- Existing security monitoring automation still publishes to Notion. The new GitHub inbox/publisher is implemented, but scheduled task cutover has not occurred.
- Do **not** cancel Notion subscription or repoint the production hostname during preview testing.

## External applications and hostname boundaries

The connected Vercel account currently reports:
- `raven-security-operations`: `ops.ravenlong.com`, plus its `vercel.app` hostname
- `ravenlong-careers`: `careers.ravenlong.com`, plus its `vercel.app` hostname
- `ravenlong-heat-quizzes`: `quiz.ravenlong.com`; also lists `www.ravenlong.com` and an apex-domain redirect
- `ravenlong-heat-directory`: `ravenlong-heat-directory.vercel.app`

Domain assignment in a Vercel project is not proof of the current DNS target. Confirm actual DNS and any Vercel alias or redirect conflict before cutover. Preserve the three independent subdomains `ops`, `careers`, and `quiz` during the main-site transition.

## Cutover acceptance gates

1. **Content parity.** Confirm historical safety-event count and bilingual alignment; complete remaining original research, articles and publications. Keep all source attributions, incident/report dates, and original analysis.
2. **Media parity.** Audit every original Notion image/file; all required site images must be served from new independent URLs. Verify HEAT case graphics, project photographs, certificate graphics, BLA diagrams and PDF publications at reading size.
3. **Automation.** Validate one GitHub publishing transaction using the bilingual inbox; verify both localized files and a Cloudflare deployment. Then update the existing global monitoring task, preserving its schedule, monitoring geography and quality controls. Run dual-write and post-publication verification before decommissioning the Notion destination.
4. **Routes and SEO.** Verify `/zh/`, `/en/`, research and incident detail pages, HEAT modules, old `/p/<id>` 301 redirects and sitemap. Current preview `robots.txt` disallows indexing intentionally; replace it with a production policy only at cutover.
5. **Cross-region reliability.** Test desktop and mobile, including mainland China networks, without reliance on Google-hosted assets. Confirm published articles, figures, quiz endpoints, contact page and accessibility.
6. **Domain and rollback.** Save existing DNS/host mappings. Set up a separate canary hostname if available. Only after canary acceptance, route `www.ravenlong.com` to the new Worker. Confirm SSL, DNS, HTTP redirects, latency, canonical URLs and links. Keep a documented rollback target for the original website.
7. **Cost control.** Confirm Cloudflare resource tier and any optional database/storage costs. Check that separate career, quiz and operations app hosting costs have not been accidentally added to the main website plan.

## Post-cutover

- Read back the first two scheduled bilingual incident updates and verify on both site paths.
- Monitor 404s for old article URLs and restore missing redirects.
- Release the preview's robots restriction, generate a sitemap and indexable metadata, then check search indexing.
- Cancel paid Notion site hosting only after all site features, attachments and automation publishing paths no longer depend on it.

## Normal publishing

Use `content/inbox/*.json` with the schema in `content/inbox/README.md`; the `Publish bilingual RAVEN intelligence` GitHub workflow validates the event and writes both language archives. Avoid direct manual edits to just one language file.
