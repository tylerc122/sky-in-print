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
