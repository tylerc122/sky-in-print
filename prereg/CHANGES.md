# Changes after pre-registration

## 2026-10-20: local triage model fixed (before any held-out window was triaged)
- **Model:** a shared Ollama endpoint (DGX Spark), alias `financial-qwen3.6:35b-a3b`
  (digest `a0a6328748a1b69d1930395bdde61ffd53595a6fc309d18db9ef32f214d3b500`; Qwen3.6-35B-A3B Q4_K_M, temperature 0, thinking off, JSON mode). The existing model alias was retained so triage would not force a model swap on the shared server. The spec's "local
  open-weights LLM filter" is unchanged in role; only the host is now named.
- **Prompt:** `prereg/triage_prompt.md`, SHA-256 `8a7763a7a1bbb1853bd1e8838ec9e29ea470cb3a1f0e3f807e386b238ca3f1be`. Developed on 40 randomly sampled
  candidates from the debug_1859 window only (`results/dev/triage_1859_dev40.jsonl`). Reviewer
  agreement on that sample: 38-39 of 40; 4 of 40 extracted fields failed the exact-text check and are flagged,
  not trusted.
- **Courtesy rules** (`src/skyinprint/flint.py`): one request at a time; read-only lane check; yield to
  estate demand; wait if another model is loaded; fail closed if unreachable.
- Any later prompt or model change is logged here and re-run on every window.

## 2026-10-20: triage prompt v2 (passing mentions)
- **Why:** the early audit of v1 rejections in ordinary_1844_09 (`results/audits/1844_model_rejections.md`)
  found sightings missed when mentioned in passing inside articles about something else. Disclosure: this
  held-out window motivated the change. The prompt itself was revised and tested on debug_1859 data only.
- **Change:** `prereg/triage_prompt_v2.md`, SHA-256 `468f03fd8d3c4978e7b5f2d4cf4bd0cd3c2de8798359f900f004578c056eefd2`. It adds instructions to count passing, distant,
  translated and "recent event" sightings and observed comets, and to answer true when unsure. Exclusions
  are unchanged. v1 (`triage_prompt.md`) is kept for the record. Same model and settings.
- **Dev test** (340 seeded 1859 candidates, seed 1859, `results/dev/triage_1859_dev340_v{1,2}.jsonl`):
  - v1 accepted 94; v2 accepted 108, with 14 newly accepted and 0 newly rejected.
  - Of the 14: 4 real reports v1 missed (a frost note citing the recent aurora; the Havana aurora letter; aurora
    disrupting London telegraphs; a meteoric stone that fell in Linn Co., Iowa) and 10 non-observations
    (Merriam jokes, the Everett comet essay, names).
- **Rerun:** v2 runs on every pilot window, output `triage_v2.jsonl`. v1 outputs are kept for comparison.
  The 1844 v1 audit stays as the measurement of v1. v2 gets its own audits, on samples drawn fresh by seed.

## 2026-10-21: manual issue search (rule 2), method adjusted after the draw
- The 20 pre-drawn issues (2 per ordinary window, drawn by seed before reading) contain 2,775 articles. Reading every
  article in full would cost far more than the expected yield of about 1-3 sky reports justifies.
- **Adjusted method:**
  - v2 triage is run on **every** article in those issues, with no keyword filter. This tests keyword-filter recall.
  - Claude reads every model-accepted article, plus every article containing broad sky vocabulary
    (sky, heavens, star, meteor, light in the, stone, explosion, ...), plus a random sample of the rest.
- **Limitation:** model recall on these issues is measured only through the vocabulary screen and the random
  sample, not by a full read.

## 2026-10-21: tools added after the pilot, before the full sweep
None of these change what the model reads or how it decides. The keyword filter, prompt v2, model and triage
excerpt (`triage.excerpt`) stay exactly as validated in the pilot.
- **Reader excerpts** (`excerpts.py`): text shown to people now starts and ends on sentence boundaries, with an
  ellipsis where it is cut. This fixes eye-check item D18, which was cut at "A meteoric stone weighing...".
- **Review timing** (`review_page.py`, `review_template.html`, `review_log.py`):
  - Human review pages record seconds per answer (capped at 15 minutes for breaks) and scan opens.
  - Claude's reading is timed by batch.
  - Both go to spec §10 output 4, which the pilot only estimated.
- **Fireball grouping and vetting** (`fireballs.py`, `results/fireballs/vetting.json`): copies are now matched on
  OCR-tolerant character n-grams near the sighting. Hand decisions are stored by report key and re-applied on every
  run.
- **Specimen-destination ranker** (`specimen_rank.py`): it orders fall reports for reading and does not accept or
  reject any. It was tuned on the pilot. Two of the four known trail leads (Saco, Cairo) motivated rules in it, so
  its pilot ranking is not a blind test. The sweep adds a held-out check: a seeded random sample of low-scoring fall
  reports is read in full for destinations it missed.

## 2026-10-21: full sweep configuration (before any non-pilot year was read)
- **Config:** `prereg/sweep.json` covers every archive in the frozen manifest, 1770-1964 (180 years).
- **Layers:** fireball, fall and the descriptive net, the same layers as the pilot's falls_1870s window. Aurora,
  comet and eclipse layers come later.
- **Unchanged:** prompt v2 (sha 468f03fd), the same model digest, and the same patterns (sha recorded).
- **Reuse:** 1870-1879 are taken from the pilot unchanged, since they were filtered in full with these layers and
  triaged with v2. For other pilot years, pilot v2 records are reused by article key, marked `from_pilot`.
- **Where it runs:** download, filter and triage all run on Cygnus (`run_sweep.py`). Archives are SHA-256 checked
  against the manifest and deleted after filtering.

## 2026-10-26: post-sweep pass (after the sweep finished; no triage changed)
- **Ranker patch 3** (`specimen_rank.py`), from the third blind check (`results/falls/sweep_leads_1914_1964.md`):
  - line-end-hyphen rejoining;
  - "sent to X for analysis/examination";
  - "collected by Prof.";
  - "scientists at X college";
  - "purchaser ... museum".

  It only reorders reading. The 53 reports it added were all read. The holdout sample was drawn and saved before
  any 1914-1964 report was read.
- **Targeted rescan** (`rescan_names.py`): a `saco_doe` term set, and `--only <prefix>` so a lead can be rescanned in a
  year that already has a rescan file. It was run on 1870, 1871 and 1891 for the Saco lead.
- **Fireball grouping** (`fireballs.py --workdir all`): runs on the full sweep plus the reused pilot 1870s. The method
  and thresholds are unchanged.
