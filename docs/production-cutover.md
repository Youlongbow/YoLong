# RAVEN production cutover — controlled migration runbook

## 2026-11-20 launch authorization and current blocker

The site owner authorized moving the public website to `www.ravenlong.com` and enabling public search indexing. The canonical domain and search-discovery build are prepared in `scripts/seo.mjs`, with English/Chinese per-page HTML, sitemap, robots, social metadata and JSON-LD. `wrangler.production.jsonc` contains the isolated production-domain configuration.

**Domain is NOT YET switched.** A domain configuration check returned authoritative name servers `launch1.spaceship.net` and `launch2.spaceship.net`. Cloudflare Workers Custom Domains require the zone to be configured in the Cloudflare account serving `yolong`. There is no connected Spaceship or Cloudflare DNS editor, so the DNS change cannot be executed from the current session.

**Current Vercel overlap:** `ravenlong-heat-quizzes` still has `www.ravenlong.com` and apex `ravenlong.com` attached, in addition to `quiz.ravenlong.com`. Preserve the quiz app and its `quiz` hostname. Remove the main-domain associations from this Vercel project only during the verified Cloudflare cutover.

### Exact cutover sequence

1. Add `ravenlong.com` to the Cloudflare account containing `yolong`; copy the entire Spaceship DNS zone, including `careers`, `ops`, `quiz`, MX and email-verification TXT records. Keep the existing mail routing intact.
2. Change the apex domain nameservers in Spaceship to the exact pair shown by this Cloudflare zone and confirm activation. Do not change registrar ownership.
3. Deploy using `npx wrangler deploy --config wrangler.production.jsonc` or bind `www.ravenlong.com` to `yolong` in Workers → Domains & Routes → Custom Domain. Validate TLS and the response from the actual `www` hostname.
4. Redirect `https://ravenlong.com/*` to `https://www.ravenlong.com/*` with a 301 rule. Preserve all other subdomains. Remove old `www` and apex bindings from `ravenlong-heat-quizzes` when the new hostname is serving successfully.
5. Verify redirects from old `/p/<id>` links, all bilingual pages, PDF/image assets, email links, and the first automated security-news publication. The existing news-monitoring automation still targets Notion and must be switched or dual-published to GitHub before retiring its original destination.
6. Verify `https://www.ravenlong.com/robots.txt` and `https://www.ravenlong.com/sitemap.xml`, then submit the XML sitemap to Google Search Console and Bing Webmaster Tools. Confirm successful crawl/indexing in each console.

**Photo status:** An image was supplied inline in the conversation but did not expose a downloadable original asset to the current repository editing environment. The exact photograph was not committed. Obtain an attachable full-resolution image before replacing profile imagery.


_Last reviewed: 2026-11-20. Public launch authorized; DNS transfer and publication-pipeline cutover remain outstanding._

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
