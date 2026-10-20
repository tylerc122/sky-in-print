# Changes after pre-registration

## 2026-10-20: local triage model fixed (before any held-out window was triaged)
- **Model:** Tyler's shared Ollama on Flint (DGX Spark), alias `financial-qwen3.6:35b-a3b`
  (digest `a0a6328748a1b69d1930395bdde61ffd53595a6fc309d18db9ef32f214d3b500`; Qwen3.6-35B-A3B Q4_K_M, temperature 0, thinking off, JSON mode). The same alias
  Financial Memory uses, so triage never forces a model swap on the shared server. The spec's "local
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
