# RAVEN | Google Analytics 4 (GA4) Setup

## Connection state

The GA4 tracking implementation is present on the bilingual RAVEN website, but it remains **inactive** until an actual GA4 Web Stream Measurement ID is configured.

The measurement ID is a public identifier (e.g. `G-XXXXXXXXXX`), not an API secret.

## Enable collection

1. In [Google Analytics](https://analytics.google.com/), create or open a GA4 property for **RAVEN**, then open **Admin > Data streams > Web**.
2. Set the website URL to `https://www.ravenlong.com` and copy the **Measurement ID** (`G-...`).
3. Set `analytics.measurementId` inside `content/site.json` to that exact value and deploy the `main` branch.
4. Confirm activity under **Reports > Realtime** in Google Analytics after opening a production page.
5. Optionally use [Tag Assistant](https://tagassistant.google.com/) to validate the Google tag.

The assistant can update step 3 on request once the Measurement ID is supplied.

## Collection behavior

- The Google tag is initialized only on `www.ravenlong.com` and `ravenlong.com`. The Cloudflare Workers preview does not send test visits.
- One explicit `page_view` is recorded for each visited URL with the proper localized page title, page path, language and section.
- Additional useful events: `language_switch`, `contact_click`, `book_retailer_click`, `outbound_resource_click`.
- Search fields, form content, email addresses and user identifiers are not included in custom event parameters.
- GA4 enhanced measurement can provide further built-in engagement and outbound click metrics. Avoid using built-in outbound clicks and `outbound_resource_click` interchangeably in reporting, or you may double count the same user action.
- Production traffic can only begin after the GA4 Measurement ID is configured; historical visitors from before installation cannot be retroactively measured.
- Tracking can be blocked by browsers, content blockers, network filters and visitors' consent preferences. Publish suitable privacy disclosures and configure consent management where legally required.

## Verification

`node scripts/test-analytics.mjs` tests disabled/no-ID behavior, hostname filtering, one-time setup, page views and language switching. The GitHub Verify RAVEN website workflow runs this test on each push.
