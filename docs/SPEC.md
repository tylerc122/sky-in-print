# The American Sky in Print, 1774–1963: Spec v0.4

Status: final pre-pilot revision after three independent reviews · 2026-10-20 · Owner: Tyler Collo
Changes from v0.2 are in Section 12; v0.4 changes are in Section 13. Further revision
waits for pilot results.

## 1. Goal

A systematic, scan-linked reconstruction of the sky observations reported in US local
newspapers, 1774–1963. It is built from the American Stories corpus (Library of Congress
Chronicling America, about 280M articles). It gets published as an open dataset and an
interactive timeline and map.

The project succeeds without a spectacular discovery: the dataset and the public atlas
are useful on their own. Discoveries are a bonus, and we claim them only at the strength
the evidence supports.

### Focus
1. **Fireballs and meteorite falls: the discovery focus.**
   - Fireballs: connect scattered accounts into documented events, using physically
     informative details (direction of travel, start and end points, timing, breakup,
     sound delays), not just map pins.
   - Falls: find credible historical fall reports, then **follow the specimen trail**
     (named finders, sales, donations, museum accessions, corrections and retractions).
     That trail is the route to a genuinely new result.
2. **Auroras: a descriptive sighting map only.**
   - Show where people reported seeing the aurora on each storm night. Capture simple
     fields so the map reads correctly: overhead or near the horizon, direction, time,
     color.
   - No boundary reconstruction, no "climatology", no "missed storm" claims.
3. **Eclipses: a control layer** for date accuracy (not for recall of other layers).
4. **Comets and meteor showers: timeline features only.**

## 2. Novelty, stated narrowly

**What we claim:** a systematic, open, scan-linked catalog of sky observations across
**many US local newspapers**, with source chains and witness-level independence tracked,
plus a public atlas. Narrower priority claims (for example "events absent from searched
catalogs") come only after the pilot, with evidence.

**Prior work we build on or must cite:**

| Work | Relation to us |
|---|---|
| UCM "Historical Fireballs" ([arXiv:1511.00464](https://arxiv.org/abs/1511.00464)) | Uses the New York Times as its main reference: 377 fireballs from 1800–2000 from that sample (verified, Section 3 of the PDF), plus Spanish papers. A close predecessor for fireballs. Our difference is many local US titles, scan links, witness tracking and reconstruction. Its NYT list also becomes an independent recall test (Section 6) |
| Nininger papers (ASU finding aid); Monnig clipping files (TCU) | Newspaper solicitations, witness correspondence and investigations of US falls. **Both prior work and a cross-check** for every fall candidate |
| Meteoritical Bulletin; Grady catalogue; doubtful-fall case studies | The reference record for falls |
| Silverman archive (NSSDC; about 12.7k US aurora days); Lovering 1868; Signal Service list; MWR | Aurora references. Silverman 2006 (*Adv. Space Res.* 38(2)) already related great-aurora boundaries to half-daily aa (r = 0.84 per its abstract) |
| Per-storm aurora studies (1859, 1872, 1909, 1921, …) | Great storms in depth |
| `shmanubhav/aurora-catalog` (Oct 2026) | Aurora methods test on 1859 and 1872. Reusable code and labels, with citation |
| Kronk, *Cometography* and *Unconfirmed Comets*; 1833 Leonid literature | Comets and showers. Timeline only |
| Viral Texts; Dell lab **Newswire**; Newspaper Navigator | Reprint and paraphrase methods we use |

## 3. Data and access (verified)
- **Corpus:** American Stories (Hugging Face, CC-BY-4.0), 180 tarballs, 340 GB, about
  280M articles.
- **Newspaper metadata:** `lccn` in each record. City and coordinates come from
  `loc.gov/item/{lccn}/?fo=json`. Scans come from `scan.raw_data_loc`, with the page
  sequence taken from the filename.
- **Reference set (frozen in Phase 0, with dates and versions):**
  - MetBull (including doubtful and pseudometeorites) and Grady
  - the Nininger and Monnig finding aids
  - UCM fireballs, and AMS and literature fireball lists
  - Silverman, Lovering, Signal Service list, MWR
  - the NASA eclipse canon and Kronk
- **Chronicling America is a selected collection, not a random sample.** Selection
  favors historical significance and geographic representation. Every product shows
  coverage, and no claim treats newspaper counts as counts of what happened in the sky.

## 4. Pipeline (MacBook plus Claude subscription, no API)

### 4.1 Stream and filter (local)
- Stream one tarball at a time, filter, delete. Keep a manifest of each year's file hash
  and Hugging Face revision, so any year can be re-fetched exactly.
- **Targeted rescans support follow-up.** Rescanning one year (2–5 GB) for a finder's
  name, a place or a museum takes minutes, so follow-up searches (Section 5) re-stream
  the relevant years instead of keeping a 340 GB index. If follow-up volume grows, add a
  compact local full-text index for the decades that matter (there's about 515 GB free).
- Per-layer strict and OCR-tolerant patterns, plus a net for descriptive language with no
  keyword ("ball of fire", "the heavens were lit"). Size the net by sampling.

### 4.2 Triage
1. Rules drop obvious noise (the towns named Aurora, newspaper names, ships, metaphors).
2. A local open-weights LLM filter runs on the Mac (Ollama).
3. Claude adjudicates in-session: positives, ambiguous cases, and everything used in a
   claim. Prompts, inputs, outputs and the model version are archived.
- A fine-tuned classifier is optional, as a recall booster.

### 4.3 Extraction, per report
- **Common fields:** event type, claimed observation place, observation time, the quote,
  and the scan link.
- **Fireballs:** direction of travel, apparent start and end positions, duration,
  brightness comparison, color, fragmentation, sound and the delay before it, and whether
  stones were reported.
- **Falls:** the finder's name, landowner, mass or description, where the stones went
  (sold, kept, sent to a college or museum), and named experts.
- **Auroras:** overhead or near the horizon, direction, time, duration, color, form.
  Also cloud conditions or failed attempts to observe, when stated.

### 4.4 Source chain and independence
Track **four separate things** for each report:
1. **Publication or reprint family:** paraphrase-level clustering, Newswire-style.
2. **Underlying witness or source:** who saw it, and who reported it.
3. **Claimed observation location.**
4. **Independence confidence:** independent / same source / **unknown** (an allowed
   outcome).

Distinct places in one syndicated story are not independent witnesses. Two observers in
one town can be.

### 4.5 Dates through the source chain
Resolve "last night" or "Sunday evening" against the **original dispatch date**, not the
reprint's print date. Follow the reprint family back to the earliest version.
Calendar-consistent but chain-ambiguous dates are flagged as low confidence and excluded
from claims.

### 4.6 Cross-matching
- Match against the frozen reference set. A non-match is labeled **"absent from the
  searched reference set (list, date)"**. It is never labeled "new" automatically.
- Chance-match rates are reported to show how informative a match is. They are computed
  with season- and region-appropriate random comparisons, and kept separate from any
  assessment of how complete the reference is.
- A stronger novelty statement requires a targeted literature search for that specific
  event.

## 5. Fall follow-up (the discovery engine)
For each credible fall report:
1. **Search the corpus forward in two stages,** using targeted rescans for the same
   place, names and alternate place names:
   - **Screening:** 0–5 years, for every credible report.
   - **Deep follow-up:** for strong candidates, through 1963. Specimen trails can take
     decades; Baxter took 22 years.
   - Look for corrections, retractions, scientific examination, sales, donations and
     correspondence.
2. **Check the Nininger and Monnig finding aids,** MetBull, Grady and museum catalogs for
   matching names, places or dates. Record the status as one of:
   - **recognized meteorite:** listed in MetBull or Grady
   - **previously investigated, unresolved:** appears in Nininger or Monnig but never
     became a recognized meteorite. **Treat this as a lead, not a rejection.** New
     evidence or a located specimen makes it the strongest kind of finding.
   - **no prior record found.**
3. **Grade it:** documented trail / partial trail / report only / refuted (hoax, hail,
   slag, lightning, retraction).
4. **Strongest cases** get a written case file with every scan, the trail, the
   alternatives considered, and suggested next steps (museum or collection inquiry).
   The Baxter (1916 fall, reached Nininger in 1938) precedent shows the trail can lead to
   a real specimen.

## 6. Validation (designed to catch what we miss, not just confirm the easy cases)
- **Held-out ordinary periods:** about 10 windows of 1–3 months, including quiet ones,
  chosen and recorded **before** looking at their yield.
- **Independent manual search:** for selected newspaper issues in those windows, read
  pages without the filter. Measure what the pipeline missed.
- **Rejection audits:** sample what each stage threw away (regex, rules, local LLM,
  Claude). Report the losses **with uncertainty** (for example an upper bound on the miss
  rate). For rare events, "insufficient evidence to estimate recall" is an allowed
  result. Finding none in a small sample doesn't prove high recall.
- **Independent recovery test for obscure events:** take fireballs and falls located
  **without** our pipeline, then check whether the pipeline recovers local US coverage of
  them. Sources: UCM's NYT list (1800–1963 portion), the Monnig clippings, and literature
  or AMS historical fireballs. The NYT itself isn't in Chronicling America, which makes
  this a fair test.
- **Evaluation split by event and reprint family,** not by article.
- **Scan checks:** every consequential record (anything in a claim or case file) is
  checked against the page image, not just the transcription.
- **Easy-case checks kept as debugging only:** eclipses (date accuracy), famous storms,
  and known US falls (MetBull recall).
- **Benchmark:** precision and recall on aurora-catalog's 1859 and 1872 sets.
- **Human audit:** stratified by layer and tier, by Tyler plus at least one outside
  reader. Report precision per tier.

## 7. Evidence tiers

| Layer | Public wording | Requirement |
|---|---|---|
| All | "report" | Classifier or LLM positive, scan checked if shown publicly |
| Fireball | "documented fireball event" | ≥2 reports with independence ≥ "likely independent", the date resolved through the source chain, physical fields extracted |
| Fireball | "fireball absent from searched catalogs" | the above + documented non-match against the frozen set + a targeted literature search |
| Fall | "credible historical fall report" | An eyewitness account of stones seen falling, plus a named finder or mass or specimen destination, passing the plausibility rubric, scan checked |
| Fall | "**reported fall absent from the Meteoritical Bulletin, with a documented specimen trail**" | the above + a Section 5 trail graded "documented" or "partial" + not a recognized meteorite (no MetBull or Grady match) + human reading. Prior investigation by Nininger or Monnig is reported alongside ("previously investigated, unresolved") and doesn't disqualify it |
| Aurora | "reported sighting" (map only) | Report-level fields; independence shown; no extent or gap claims |

## 8. Defensible vs. speculative

**Defensible:**
- scan-checked quotes
- witness-level independence, with "unknown" allowed
- dates resolved through the source chain
- "absent from searched set" wording
- measured miss rates
- specimen trails

**Speculative:**
- counting reprints or places as witnesses
- treating newspaper counts as sky frequency
- inferring "new" from a non-match
- a fall without a trail
- approving transcriptions without the scan
- trends that ignore coverage

## 9. Compute and usage
- **Download:** about 1–2 days. **Regex:** about a day, parallelized. **Local LLM
  filtering:** overnight runs.
- **Claude:** triage adjudication, extraction review, fall follow-up and audits.
  Measured per accepted event in the pilot.

## 10. Phases

| Phase | Work | Exit criterion |
|---|---|---|
| 0 | Freeze the reference set; LCCN table; choose and record the held-out ordinary windows | Frozen set and windows on record |
| 1: **Pilot** | One famous event for debugging (for example 1859), the pre-chosen ordinary windows, and one fall-rich decade | The five pilot outputs (below) |
| 2 | Full sweep of fireballs and falls; aurora sighting map | Event tables |
| 3 | Fall follow-up and case files; audits | Vetted claims |
| 4 | Public atlas, data release, write-ups | Live |

**The pilot must produce (success depends on the method, not on a lucky find):**
1. **Fireballs:** the reconstruction procedure applied end to end to every fireball event
   found in the pilot windows (independence, timing, physical fields), with the yield
   reported, even if few.
2. **Falls:** a completed, documented search and follow-up of every credible fall report
   in the pilot windows, with each graded. The yield is reported **even if zero**.
3. **Miss-rate evidence:** the manual-search and rejection-audit results with
   uncertainty, plus the independent recovery test. "Insufficient evidence" is allowed if
   stated honestly.
4. **Measured human and Claude review time** per accepted event.
5. *Optional:* what newspaper evidence adds to existing aurora records for the pilot
   windows.

**Go/no-go after the pilot:**
- **Scale up** if the method works (procedures run end to end, recovery test passed or
  honestly bounded) and the review time is manageable.
- **Fall yield** decides how prominent falls are, not whether to continue. If there are
  no trails, ship the fireball catalog and atlas without fall claims.

## 11. Risks
- **Coverage changes mistaken for sky changes:** no frequency or trend claims; coverage
  shown everywhere.
- **Filter losses hide the unusual wording where discoveries live:** the descriptive-
  language net, rejection audits, and the manual search.
- **Hoaxes and erroneous fall reports:** the plausibility rubric, forward follow-up, and
  the retraction search.
- **Syndication masquerading as independent witnesses:** the four-part source tracking.
- **Usage limits:** local LLM triage first; Claude only where it decides a claim.
- **Overlap:** UCM (fireballs), Nininger and Monnig (falls), aurora-catalog. All cited
  and used as cross-checks.

## 12. Changes from v0.2
- **Novelty:** reworded to "systematic, scan-linked reconstruction across US local
  newspapers". "First ever" and "machine-built" claims dropped. UCM and the Nininger
  papers elevated as close prior work. Unverified figures are flagged, not relied on.
- **Auroras:** reduced to a descriptive sighting map. Extent, climatology and gap claims
  removed. Boundary reconstruction and the Canadian 1848–53 logs parked as stretch ideas.
- **Fireballs:** physical fields extracted for reconstruction, not just map pins.
- **Falls:** the specimen-trail follow-up (Section 5) is now the discovery engine.
- **Independence:** four-part source tracking, with "unknown" allowed. Dates are
  resolved through the reprint source chain.
- **Cross-matching:** "absent from searched set" wording. Chance-match rates
  reinterpreted and kept separate from reference completeness.
- **Validation:** held-out ordinary windows chosen in advance, an independent manual
  search, rejection audits, splits by event and family, scan checks.
- **The pilot's five required outputs** and go/no-go criteria added.

## 13. Changes from v0.3 (third review)
- **Nininger and Monnig** investigation no longer disqualifies a fall. A new status,
  "previously investigated, unresolved", is treated as a lead.
- **Fall follow-up** is now two-stage: a 0–5 year screen, then deep follow-up through 1963
  for strong candidates.
- **Follow-up after deletion** is solved with targeted rescans plus a year manifest,
  rather than a full index (pushback: rescanning one year takes minutes, so keeping
  340 GB isn't needed). A compact index is optional if volume grows.
- **Recall:** reported with uncertainty, and "insufficient evidence" is allowed. Added an
  independent recovery test using UCM's NYT fireballs, the Monnig clippings and
  literature events.
- **Pilot success** depends on the method. The fall yield can be zero, and the aurora
  comparison is optional.
- **Facts:** the UCM NYT claim was verified from the PDF (377 fireballs, 1800–2000).
  Silverman 2006's r = 0.84 is cited from its abstract.
