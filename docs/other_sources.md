# Other sources past American Stories (2026-11-12)

American Stories is a snapshot of Chronicling America, so we only see what LoC had digitized when Dell's group built it,
and nothing after 1963. Recall on known falls was 34/71 for 1807-1922 and 13/43 for 1923-1963
(`results/validation/known_falls_sweep.md`), and it was corpus coverage, not the filter, losing them. So the question is
what else has newspaper text we can actually run the pipeline over, roughly best bang for the buck first.

## Bulk text we could sweep with the same pipeline

1. **Newswire** (Dell lab, `dell-research-harvard/newswire` on Hugging Face, CC-BY). 2.7M de-duplicated wire stories,
   **1878-1977**, pulled from 138M front-page articles across all 50 states, each with the list of papers and dates that
   ran it. Stops at 1977 because papers before the 1978 copyright change mostly never renewed. Only wire copy, so it
   misses purely local items, but plenty of falls went out on AP/UP (the Mathwig stone ran in the Omaha Bee from an
   Estherville dateline). It's the only bulk source here that runs 14 years past 1963, and it's already in a format close
   to American Stories, so this is the cheap first move. Related: the same group's Southern Newswire Corpus (mid-century
   wire stories beyond the front page, arXiv 2502.11866), worth a look after.
   - https://arxiv.org/abs/2406.09490
2. **Chronicling America pages added after the American Stories snapshot.** CA was ~20M pages in Sept 2022 and ~23.7M
   (1736-1963) by Apr 2026, so roughly 3.7M pages we've never seen, plus ~245k reprocessed pages with better OCR. LoC
   offers bulk OCR per batch and the loc.gov JSON API. Same era as what we have, but it's more papers.
   - https://www.loc.gov/collections/chronicling-america/about-this-collection/technical-information/
3. **State sites running Open ONI (the Chronicling America software) with a bulk OCR page.** These include titles and
   years CA doesn't have, and some go well past 1963:
   - Georgia Historic Newspapers: full OCR XML+text as compressed archives; collection runs into the 1980s (one recent
     batch is 1882-1985). https://gahistoricnewspapers.galileo.usg.edu/about/api
   - Nebraska: https://nebnewspapers.unl.edu/ocr
   - South Carolina: https://historicnewspapers.sc.edu/ocr
   - Still need to check which other states run Open ONI with an /ocr page (Oregon, Pennsylvania, etc.), and how much of
     each is outside CA.

## Big collections, search only (no bulk text that I found)

Usable for targeted keyword searches on specific leads or for spot-checking recall, not for a full sweep. Asking for bulk
access might work for the library-run ones.
- **Utah Digital Newspapers** (U of Utah): ~8.7M pages from 392 papers, a lot of it post-1923. A Marriott Library blog post
  mentions bulk .txt downloads, so it's worth emailing them.
- **California Digital Newspaper Collection** (UC Riverside): ~17M pages, 52M articles; had funding trouble and outages.
- **Portal to Texas History / Texas Digital Newspaper Program** (UNT): OpenSearch full-text API, OAI-PMH is metadata
  only; Mark Phillips at UNT is the API contact if we want bulk OCR.
- Colorado Historic Newspapers, NYS Historic Newspapers, Washington Digital Newspapers (1M pages), Virginia Chronicle,
  Hoosier State Chronicles, Fultonhistory.com (huge for NY, no API).
- Paid: newspapers.com, NewspaperArchive, GenealogyBank, ProQuest. Best 1923+ coverage, but only for chasing a lead by
  hand (like the Nobles County volunteer did with the 1937 Globe).

## Not newspapers

Fall reports people sent to meteorite researchers, which would cover the 1923-1963 hole and after:
- **Nininger** (ASU) and **Monnig** (TCU) are already in the spec.
- **Lincoln LaPaz / UNM Institute of Meteoritics**: UNM's Center for Southwest Research has Institute records (a 1965
  catalog, 15 boxes); LaPaz collected fireball and fall reports from the 1940s on. Need the full finding aid.
  https://nmarchives.unm.edu/repositories/22/archival_objects/340468
- **"Fire ball phenomena," Muriel Haskell, 1936-1940** at the NM History Museum's Chávez History Library.
  https://nmarchives.unm.edu/repositories/10/archival_objects/17555
- After 1963: Prairie Network (1964-75) and Smithsonian SEAN bulletins (1975+) for fireballs, though falls from then
  are much more likely to already be in MetBull.

## What I'd do first

Sweep Newswire with the current triage, since it's one download and covers 1878-1977, then pull the post-snapshot CA
batches, then Georgia/Nebraska/SC bulk OCR. Score each against the known-falls list the same way so we can see which one
actually moves the 1923-1963 number.

**Update 2026-11-12:** Newswire swept, results in `results/falls/newswire_sweep_2026-11-12.md`. It added one known fall
for 1923-1963 (Norton County 1948) and turned up a few new leads (Crescent City, Ill. 1899, north-central N.M. 1962,
Sequoia 1964). Since wire copy only catches big stories, the post-snapshot CA batches and the state bulk OCR are still
the way to move recall.
