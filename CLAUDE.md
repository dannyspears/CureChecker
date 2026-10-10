# Cure Checker

Static site: a landing page (`index.html`) plus one report page per condition/disease (`als.html`, `osteosarcoma.html`, ...).
No build step. Preview locally with the `site` config in `.claude/launch.json` (serves on http://localhost:5500).

## Files
- `about.html`: the About us page (purpose and mission; static, edit by hand).
- `assets/contact.js`: the Contact us form on about.html. The owner pastes a Formspree-style form address into the `endpoint` line at the top; empty means the form shows 'Opening soon'. Never edit or invent that address.
- `index.html`: landing page. Tiles and the drop-down are generated from `assets/diseases.js`. Don't hand-edit tiles.
- `assets/diseases.js`: the one list of conditions/diseases (slug, name, page, category, summary, updated, cadence).
- `assets/curechecker.css`: shared styles for every page.
- `assets/curechecker.js`: shared behavior: condition/disease drop-downs, landing tiles, study filters, live ClinicalTrials.gov panel.
- `<slug>.html`: one report per condition/disease.

## Adding a condition/disease (weekly)
1. Research the condition/disease to the same depth as the existing reports. Every claim needs a source link, and dates must be exact where the format shows them. Mark anything unverified as "—" or leave it out. Never guess.
2. Copy `osteosarcoma.html` to `<slug>.html` and keep the exact section order and markup:
   - Most recent cure information (`#verdict`): verdict paragraph + 4 numbered points
   - What causes it (`#cause`): 4-step pathway + 3 dated "clues"
   - Treatments that are working (`#treatments`): 6 cards + standard-treatment table
   - Where people find expert care (`.centers` list at the end of #treatments): 4 to 6 verified centers, official designation or published/trial evidence only, no rankings, each with its own source link, plus the not-a-ranking note (`.centers-note`). Add the same sources to #sources under "Expert care centers".
   - Latest studies (`#studies`): newest first, each with `data-k` = result | underway | science
   - Around the world (`#world`, set `data-condition` to the ClinicalTrials.gov search term): approvals table, 3 "available abroad" cards, timeline, live panel
   - Natural remedies & supplements (`#natural`): graded rows + caution box
   - Support groups & communities (`#support-groups`, marked `CURECHECKER:SUPPORT-GROUPS`): cards for organization-run groups, forums/online communities, the disease's Reddit community and a Facebook group search link, plus the "Before you join" caution. Only add a group after opening its link and confirming it's real and current; remove groups whose link has died. Note disease-specific safety rules (e.g. CF cross-infection: online only).
   - Sources (`#sources`): every source the report relies on, grouped by section (title, publisher, date where known). Any claim added later gets its source added here too. If a claim has no source, say so in the `.src-note` line rather than inventing one.
3. Set `<body data-disease="<slug>" data-palette="<palette>">`, the `<title>` ("Cure Checker: <Name>"), the masthead tag, and the headline strip.
4. Give every condition/disease its own color palette, different from the landing page's light blue and from every other condition/disease. Palettes are the `[data-palette="..."]` blocks at the end of `assets/curechecker.css` (light + dark variants; small text on `--signal` needs at least 4.5:1 contrast). Add a new block when none is free. Prefer the disease's awareness-ribbon color when it fits. In use: violet = ALS, gold = osteosarcoma (sarcoma's ribbon is yellow), teal = Parkinson's, plum = Alzheimer's (purple ribbon), orange = multiple sclerosis (orange ribbon), rose = cystic fibrosis ("65 Roses"), indigo = Huntington's (blue/purple), slate = glioblastoma (grey brain-cancer ribbon), forest = CJD, olive = FOP, cyan = COPD (its orange ribbon was already taken by MS), coral = Batten disease, sage = Tay-Sachs, lime = PKU, crimson = Marfan, umber = Ehlers-Danlos (zebra-brown), navy = Prader-Willi, brick = Duchenne, mint = type 1 diabetes, lavender = pancreatic cancer (purple ribbon; violet and plum were taken), bronze = FTD, magenta = lupus (purple ribbon), graphite = IPF, wine = HIV (red ribbon taken by crimson/brick), taupe = SMA, mauve = Crohn's (purple ribbon taken), heather = ME/CFS (blue ribbon; navy taken), sand = male pattern baldness (no ribbon color; a khaki tone unused elsewhere), fuchsia = autism (its awareness blue is the landing page's and magenta is lupus, so a violet-pink unused elsewhere), ultramarine = neuroblastoma (childhood-cancer gold is taken by osteosarcoma, so a vivid ultramarine blue unused elsewhere and far from the landing sky blue).
- When a news source and Drugs@FDA disagree on an FDA approval date, use the Drugs@FDA date.
5. Add one entry to `assets/diseases.js`, including `palette` and `cadence` (see Update cadence). The landing tile takes the same color.
6. Preview the landing page, the drop-down, and the new report (including the live trial panel) before committing.

## Registries & databases ("Every registry, checked" section, `#registries`)
- The section's markup is identical on every report. `assets/curechecker.js` fills it using the condition/disease's `search`, `pubmed`, `drugs` and `cancer` fields in `assets/diseases.js`. Set these for every new disease.
- Live in the browser: ClinicalTrials.gov, PubMed (NCBI E-utilities, ~3 requests/sec limit, so calls are sequential), Europe PMC (preprints), ISRCTN (XML API), Drugs@FDA via openFDA (search generic name + active ingredient).
- Snapshot: EU CTIS blocks browser requests, so `tools/update-registries.ps1` writes `assets/registry-snapshot.js`. Run it at least daily (part of the morning refresh) and after adding a disease.
- Links only (no usable API or bot-blocked): WHO ICTRP, Cochrane CENTRAL, EMA, OpenMD, NCI (cancers).
- When researching or refreshing a report, check these sources too: newest PubMed trials/Cochrane reviews, EU CTIS and ISRCTN registrations, and Drugs@FDA records. Add notable results to Latest studies with their PubMed link.

## Visit counts (GoatCounter)
- `assets/analytics.js` holds the owner's GoatCounter code and is loaded on every page before `assets/diseases.js`. Include it on any new page. Never edit the code unless the owner asks.
- The landing page's "Most popular reports" shows the 6 most-visited reports (from GoatCounter's public counter), with a "Show all" button for the rest.

## Donations (landing page)
- Every condition/disease page starts with a slim `<div class="donate-bar">` (first thing inside `.wrap`) and loads `assets/donate.js` after `curechecker.js`. Copy both into new disease pages.
- The owner sets their Venmo / Cash App / PayPal handles at the top of `assets/donate.js`. Never edit, add or change donation handles or links unless the owner explicitly asks in a direct request.

## Pathway diagrams (the small SVGs in "What causes")
- Put text labels outside/below shapes (not on outlines), keep every label inside the viewBox, and use font-size 10–11. On phones the diagrams render up to 150px tall, so check new ones at phone width (375px) for overlaps or clipped labels.

## Every page
- Every page (including new disease pages and blog posts) must carry these three icon link lines right after `</title>`: `<link rel="icon" href="/favicon.ico?v=3" sizes="any">`, `<link rel="shortcut icon" href="/favicon.ico?v=3">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3">`. `tools/build-blog.js` output needs them re-checked after a rebuild.
- Every page, including about, terms, the Newsroom index and every Newsroom post, starts with the slim `<div class="donate-bar">` (first thing inside `.wrap`) and loads `assets/donate.js`. `tools/build-blog.js` adds both to Newsroom pages.
- The footer link row also includes a Newsroom link (`blog.html`), right after "All conditions/diseases".
- The footer link row also includes a Contact link (`about.html#contact`), right after About us.
- The footer must include the `.foot-links` row with BOTH the About us link (`about.html`) and the Terms of Use link (`terms.html`). Copy the footer from an existing report.
- `terms.html` states that content is AI-gathered daily, isn't medical advice, and isn't reviewed by doctors. Keep the site's wording consistent with it. The Terms and About wording must stay consistent with each other.

## Daily refresh markers
`<!-- CURECHECKER:DATE -->`, `HEADLINE`, `STUDIES` and `WORLD-APPROVALS` comments mark the blocks that get updated each morning, on every report page.
- The masthead date and time (`#edition-date` and `#edition-time`) are part of that refresh: update both to the Eastern date and time of the commit.
- Expert care centers list: leave it alone during the daily refresh except to fix a dead link, remove a facility whose designation ended, or add a newly designated center, always with a source read that day.

## Page layout (reports)
- Section order on every report is: today strip, lead h1, sticky section menu, #verdict, #studies (the email signup box is moved to sit right after it by assets/layout.js), #treatments, #natural, #care (the expert-care `.centers` list), #support-groups, #world (approvals, abroad, timeline; keeps data-condition), #cause, #registries (titled 'Find a clinical trial'; the live recruiting-trials box with ids ct-status, ct-bars, ct-abroad, ct-more comes first), #financial-help (right before #sources), #sources.
- assets/layout.js folds long lists in the browser: the newest 5 studies stay visible and older ones sit behind 'Show N older studies'; registry panels and sources are folded away. Keep editing plain flat lists in the HTML (one `.study` per entry, newest first; sources inside `.sources`); never hand-wrap anything in <details>.
- The expert-care list now lives in #care, not at the end of #treatments, so the daily refresh edits it there.
- For a new condition/disease, copy a current report such as prader-willi.html, which already has this order and the layout.js script tag; the section order in the 'Adding a condition/disease' list above is superseded by this section.
- tools/relayout.js converts an old-order page and can be ignored otherwise.
- The section order and the collapsed drop-downs are driven by `data-order` on the `<body>` tag. It has the same value on every report page and lists section ids in display order, with `newsletter` for the email box. All sections start collapsed, and assets/layout.js shows their titles with each word capitalized. Every new disease page must copy the `data-order` attribute from als.html. The order is: Most Recent Cure Information (verdict), What Causes (cause), Treatments (treatments), Latest Studies (studies), Where To Get Care (care), How Other Countries Treat It (world), Natural Remedies (natural), Find A Clinical Trial (registries), Financial Help (financial-help), Support Groups (support-groups), Email signup (newsletter), Sources (sources). This supersedes the section order listed above.
- The daily refresh must keep editing the plain sections in the HTML. Never hand-wrap sections in details; layout.js does that in the browser.

## Update cadence
- Each entry in `assets/diseases.js` has `cadence`: `daily` (incurable diseases) or `weekly` (other conditions, and slow-moving chronic diseases the owner chose to refresh weekly, currently including male pattern baldness and autism; the owner may move any report between daily and weekly to manage usage).
- Decide when adding a new report: an incurable disease is `daily`; a condition that is not an incurable disease (cosmetic, quality-of-life, or otherwise manageable/curable) is `weekly`. If unsure, ask the owner by noting it in the final message and default to `daily`.
- The daily refresh updates every `daily` report every day. It updates `weekly` reports only on Mondays (Eastern time); on other days it must not touch them at all (leave their edition date, `updated` field and content alone).
- The masthead shows `Last updated`, the date in `#edition-date` (for example `Monday, October 5, 2026`) and the Eastern time in `#edition-time` (for example `7:41 AM ET`). Every refresh must update BOTH to the Eastern date and time at which it commits (run `TZ=America/New_York date` right before committing). Weekly reports keep ` · Updated weekly` after the time. 'Updated daily' no longer appears in any masthead.
- index.html's edition date still updates every day.
- This overrides any earlier line saying every report is updated every day.

## Social posts
- `node tools/social-posts.js [YYYY-MM-DD]` writes `social/<date>/posts.md` (Facebook, Instagram and X text for four reports) and four square image cards. It rotates through the reports and uses only text already on the pages (headline strip, newest study). Weekly reports are included on Mondays only. The owner reviews and posts by hand; never post for them.

## Newsroom (the blog; three posts a day)
- `blog.html` (index) and `blog/<slug>.html` (posts) are generated static pages. Never hand-edit them. Each post is a spec in `blog/src/<slug>.json` (fields are listed at the top of `tools/build-blog.js`). `node tools/build-blog.js` rebuilds the posts, the index, share images (`blog/img/`), `sitemap.xml` and `robots.txt`. Commit all of them.
- Daily, after the reports are refreshed: run `node tools/blog-candidates.js` to list the freshest studies across all reports. Pick the three best updates, from three different diseases: a real result, approval or major trial news beats an announcement, and anything marked "already blogged" is skipped. Never write two posts the same day about the same disease, and prefer diseases that have had no post recently. If fewer than three updates are meaningful, publish only those; if none is, publish none (never pad with weak news).
- Write the post only from the report and its linked sources. Open the source link and confirm every number and date before using it; company-reported results are said to be company-reported; early or one-patient results are never presented as proof. Never say a cure exists unless the report does. No treatment advice. Every post needs `sources`, a 160-character-or-less `description`, a `summary` ("In short"), 4 to 6 sections, 2 to 3 FAQ items phrased the way people search, and a plain title that names the disease and the news.
- SEO is built in: canonical URL, Open Graph and Twitter tags, Article, FAQ and Breadcrumb JSON-LD, sitemap and a link to the disease report. Keep titles unique and under about 70 characters.
- The post date is the Eastern date it is published. Posts are AI-written and not doctor-reviewed; the footer and post text say so, consistent with `terms.html`.

## Financial help (every report)
- Every report has a `<section id="financial-help">` placed right before `<section id="sources">`, copied from the markup on als.html: a TOC link `<a href="#financial-help">Financial help</a>` before the Sources link, `.groups` cards, a 'Before you apply' caution box, the same links also listed in #sources under a 'Financial help' group, and a `.src-note` sentence with the check date and any weaknesses.
- Scope (set by the owner): list ONLY nonprofit/charitable organizations (or a company's charity foundation) dedicated to giving direct financial assistance (grants, direct aid, or paying specific costs such as bills, equipment, home changes, caregiving, treatment travel/lodging, copays) to people living with that condition and their families. List disease-specific groups and chapters first, then medical-cost charities (HealthWell, PAN Foundation, Patient Advocate Foundation, CancerCare, etc.) only if they currently list a fund for that exact condition.
- NEVER link crowdfunding sites or fundraisers (GoFundMe etc.), government programs, insurers, drug-company assistance programs, loans, research-funding charities or generic hospital funds.
- Accuracy over volume: open and read each entry's own page; describe only what it says; never promise help (say 'funds are limited, contact each organization'); include only real organizations (even 1-2); skip the section if none qualify (the male-pattern-baldness page may have none).
- When adding a new disease, build this section as part of step 2 of 'Adding a condition/disease'.
- Daily/weekly refresh: on each update of a report that has the section, re-open each listed link. Remove or fix an organization whose page is gone, whose program ended, or whose fund closed; update stated open/closed status; add genuinely new qualifying organizations found; update the check date in the `.src-note`. Never add crowdfunding links. Mark sites that block automated checks as unverified rather than guessing.

## Social sharing images
- Shared links get their picture from Open Graph / Twitter tags. BASE is `https://www.curechecker.com` (the apex redirects to www).
- Every new disease page needs `share/<slug>.png` (1200x630, under 300 KB) and the og/twitter tags in its `<head>`, right after the meta description (copy them from an existing report and change title, description, url, image and alt). Generate the image with playwright the same way as the others: dark card (the palette's dark-mode `--paper` as background), `logo/cure-checker-logo-dark-bg.png`, the `name` from `assets/diseases.js`, the tagline 'Daily plain-language research on cures', 'curechecker.com', and the palette's dark-mode `--signal` as accent.
- Every new blog post needs og/twitter tags (including og:image:width/height/alt) with a 1200x630 share image: `share/<disease slug>.png`, or `share/default.png` when no disease fits. `tools/build-blog.js` still writes the old image URLs, so re-check the tags after a rebuild.
