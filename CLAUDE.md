# Cure Checker

Static site: a landing page (`index.html`) plus one report page per disease (`als.html`, `osteosarcoma.html`, ...).
No build step. Preview locally with the `site` config in `.claude/launch.json` (serves on http://localhost:5500).

## Files
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
   - Latest studies (`#studies`): newest first, each with `data-k` = result | underway | science
   - Around the world (`#world`, set `data-condition` to the ClinicalTrials.gov search term): approvals table, 3 "available abroad" cards, timeline, live panel
   - Natural remedies & supplements (`#natural`): graded rows + caution box
   - Sources (`#sources`): every source the report relies on, grouped by section (title, publisher, date where known). Any claim added later gets its source added here too. If a claim has no source, say so in the `.src-note` line rather than inventing one.
3. Set `<body data-disease="<slug>" data-palette="<palette>">`, the `<title>` ("Cure Checker: <Name>"), the masthead tag, and the headline strip.
4. Give every disease its own color palette, different from the landing page's light blue and from every other disease. Palettes are the `[data-palette="..."]` blocks at the end of `assets/curechecker.css` (light + dark variants; small text on `--signal` needs at least 4.5:1 contrast). Add a new block when none is free. Prefer the disease's awareness-ribbon color when it fits. In use: violet = ALS, gold = osteosarcoma (sarcoma's ribbon is yellow), teal = Parkinson's, plum = Alzheimer's (purple ribbon).
5. Add one entry to `assets/diseases.js`, including `palette`. The landing tile takes the same color.
6. Preview the landing page, the drop-down, and the new report (including the live trial panel) before committing.

## Every page
- The footer must include the `.foot-links` row with the link to `terms.html` (Terms of Use). Copy the footer from an existing report.
- `terms.html` states that content is AI-gathered daily, isn't medical advice, and isn't reviewed by doctors. Keep the site's wording consistent with it.

## Daily refresh markers
`<!-- CURECHECKER:DATE -->`, `HEADLINE`, `STUDIES` and `WORLD-APPROVALS` comments mark the blocks that get updated each morning, on every report page.
