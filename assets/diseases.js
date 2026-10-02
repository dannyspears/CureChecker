// The list of disease reports on Cure Checker.
// To add a disease: create its page (copy an existing report), then add one entry here.
// The landing page tiles and every "Switch disease" drop-down are built from this list.
window.CURECHECKER_DISEASES = [
  {
    slug: "als",
    name: "ALS (Lou Gehrig's disease)",
    page: "als.html",
    palette: "violet",
    category: "Neurological",
    summary: "Gene-silencing drugs are changing inherited ALS. TDP-43 is the target for everyone else.",
    updated: "Oct 2, 2026"
  },
  {
    slug: "osteosarcoma",
    name: "Osteosarcoma",
    page: "osteosarcoma.html",
    palette: "gold",
    category: "Cancer · Bone",
    summary: "Survival has been flat for 40 years. Two new immune and antibody-drug approaches just posted wins.",
    updated: "Oct 2, 2026"
  },
  {
    slug: "parkinsons",
    name: "Parkinson's disease",
    page: "parkinsons.html",
    palette: "teal",
    category: "Neurological",
    summary: "Japan approved the first stem-cell therapy. Drugs to slow the disease are now in Phase 3.",
    updated: "Oct 2, 2026"
  },
  {
    slug: "alzheimers",
    name: "Alzheimer's disease",
    page: "alzheimers.html",
    palette: "plum",
    category: "Neurological · Dementia",
    summary: "Two drugs now slow early disease, and blood tests can catch it years before symptoms.",
    updated: "Oct 2, 2026"
  }
];
