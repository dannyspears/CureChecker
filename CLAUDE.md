# Cure Checker

Static site: a landing page (`index.html`) plus one report page per disease (`als.html`, `osteosarcoma.html`, ...).
No build step. Preview locally with the `site` config in `.claude/launch.json` (serves on http://localhost:5500).

## Files
- `about.html`: the About us page (purpose and mission; static, edit by hand).
- `index.html`: landing page. Tiles and the drop-down are generated from `assets/diseases.js`. Don't hand-edit tiles.
- `assets/diseases.js`: the one list of diseases (slug, name, page, category, summary, updated).
- `assets/curechecker.css`: shared styles for every page.
- `assets/curechecker.js`: shared behavior: disease drop-downs, landing tiles, study filters, live ClinicalTrials.gov panel.
- `<slug>.html`: one report per disease.

## Adding a disease (weekly)
1. Research the disease to the same depth as the existing reports. Every claim needs a source link, and dates must be exact where the format shows them. Mark anything unverified as "—" or leave it out. Never guess.
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
4. Give every disease its own color palette, different from the landing page's light blue and from every other disease. Palettes are the `[data-palette="..."]` blocks at the end of `assets/curechecker.css` (light + dark variants; small text on `--signal` needs at least 4.5:1 contrast). Add a new block when none is free. Prefer the disease's awareness-ribbon color when it fits. In use: violet = ALS, gold = osteosarcoma (sarcoma's ribbon is yellow), teal = Parkinson's, plum = Alzheimer's (purple ribbon), orange = multiple sclerosis (orange ribbon), rose = cystic fibrosis ("65 Roses"), indigo = Huntington's (blue/purple), slate = glioblastoma (grey brain-cancer ribbon), forest = CJD, olive = FOP, cyan = COPD (its orange ribbon was already taken by MS), coral = Batten disease, sage = Tay-Sachs, lime = PKU, crimson = Marfan, umber = Ehlers-Danlos (zebra-brown), navy = Prader-Willi.
- When a news source and Drugs@FDA disagree on an FDA approval date, use the Drugs@FDA date.
5. Add one entry to `assets/diseases.js`, including `palette`. The landing tile takes the same color.
6. Preview the landing page, the drop-down, and the new report (including the live trial panel) before committing.

## Registries & databases ("Every registry, checked" section, `#registries`)
- The section's markup is identical on every report. `assets/curechecker.js` fills it using the disease's `search`, `pubmed`, `drugs` and `cancer` fields in `assets/diseases.js`. Set these for every new disease.
- Live in the browser: ClinicalTrials.gov, PubMed (NCBI E-utilities, ~3 requests/sec limit, so calls are sequential), Europe PMC (preprints), ISRCTN (XML API), Drugs@FDA via openFDA (search generic name + active ingredient).
- Snapshot: EU CTIS blocks browser requests, so `tools/update-registries.ps1` writes `assets/registry-snapshot.js`. Run it at least daily (part of the morning refresh) and after adding a disease.
- Links only (no usable API or bot-blocked): WHO ICTRP, Cochrane CENTRAL, EMA, OpenMD, NCI (cancers).
- When researching or refreshing a report, check these sources too: newest PubMed trials/Cochrane reviews, EU CTIS and ISRCTN registrations, and Drugs@FDA records. Add notable results to Latest studies with their PubMed link.

## Visit counts (GoatCounter)
- `assets/analytics.js` holds the owner's GoatCounter code and is loaded on every page before `assets/diseases.js`. Include it on any new page. Never edit the code unless the owner asks.
- The landing page's "Most popular reports" shows the 6 most-visited reports (from GoatCounter's public counter), with a "Show all" button for the rest.

## Donations (landing page)
- Every disease page starts with a slim `<div class="donate-bar">` (first thing inside `.wrap`) and loads `assets/donate.js` after `curechecker.js`. Copy both into new disease pages.
- The owner sets their Venmo / Cash App / PayPal handles at the top of `assets/donate.js`. Never edit, add or change donation handles or links unless the owner explicitly asks in a direct request.

## Pathway diagrams (the small SVGs in "What causes")
- Put text labels outside/below shapes (not on outlines), keep every label inside the viewBox, and use font-size 10–11. On phones the diagrams render up to 150px tall, so check new ones at phone width (375px) for overlaps or clipped labels.

## Every page
- The footer must include the `.foot-links` row with BOTH the About us link (`about.html`) and the Terms of Use link (`terms.html`). Copy the footer from an existing report.
- `terms.html` states that content is AI-gathered daily, isn't medical advice, and isn't reviewed by doctors. Keep the site's wording consistent with it. The Terms and About wording must stay consistent with each other.

## Daily refresh markers
`<!-- CURECHECKER:DATE -->`, `HEADLINE`, `STUDIES` and `WORLD-APPROVALS` comments mark the blocks that get updated each morning, on every report page.
- Expert care centers list: leave it alone during the daily refresh except to fix a dead link, remove a facility whose designation ended, or add a newly designated center, always with a source read that day.
