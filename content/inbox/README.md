# RAVEN — Bilingual security-event publishing inbox

This directory is a publishing **input**, not the live archive. The GitHub `Publish bilingual RAVEN intelligence` workflow validates any `*.json` file committed to this directory, updates both `content/security-zh.json` and `content/security-en.json` in one commit, and removes processed inbox files.

## Submit a new event

Create a descriptive JSON file in this directory and commit it to `main`. Use this structure:

```json
{
  "slug": "2026-11-20-location-concise-topic",
  "date": "2026-11-20",
  "category": "security",
  "zh": {
    "title": "事件标题（中文）",
    "summary": "简明事实摘要。",
    "region": "国家 / 地区",
    "eventDate": "2026-11-20",
    "body": "事实摘要、分析、运营影响、行动建议、后续指标和来源。来源：https://example.org/original-source",
    "sourceUrls": ["https://example.org/original-source"]
  },
  "en": {
    "title": "Full incident headline in English",
    "summary": "Concise factual overview.",
    "region": "Country / Region",
    "eventDate": "2026-11-20",
    "body": "Facts, assessment, operational implications, action points and follow-up indicators. Source: https://example.org/original-source",
    "sourceUrls": ["https://example.org/original-source"]
  }
}
```

The example addresses above are **placeholders**, not sources for a real report. Replace them with actual, accessible references.

**Required:** identical event slug and reporting date for both languages, valid category, titles, summary, region, substantive body, and a source URL. Use the original report date in `date`, and the actual incident date in `eventDate` when established. The publisher preserves existing incidents, deduplicates by slug and checks language alignment.

Accepted categories: `personnel`, `energy`, `maritime`, `transport`, `regulatory`, `security`.

To revise an existing event, submit the same slug with the updated bilingual text. Avoid silently replacing a verified record with a shorter version.

**Workflow operations:** successful runs write both archives and remove the input. Failed validation leaves the input file in GitHub for correction. The separate site-build and live HTTP checks verify that Cloudflare accepted the updated content.

**Current migration state:** the ongoing ChatGPT global safety monitor still writes to Notion. Its production publishing destination must be changed only after the new GitHub pipeline has been tested and explicitly approved for cutover.
