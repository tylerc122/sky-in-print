# Audit: local-model rejections, ordinary_1844_09 (early check)

Seeded sample (seed 20261020) of 100 of the 336 articles the model rejected; 15 were accepted.
Prompt `8a7763a7a1bb`, model `financial-qwen3.6:35b-a3b` (`a0a6328748a1`). Read in full context by Claude;
to be spot-checked by Tyler. Item-level verdicts: `1844_model_rejections.json`.

| Verdict | Count |
|---|---|
| Correct rejection | 97 |
| Clear miss | 1 |
| Borderline miss | 2 |

- **Clear miss (#64):** Vermont, Oct 1844. Millerite crowds praying on the mountains "at the appearance of the
  Northern Lights which they mistook for the Saviour coming in the clouds". A real aurora sighting buried in
  an article about the Adventists (the Great Disappointment, Oct 22, 1844).
- **Borderline (#70, #87):** the comet then visible. One astronomer's computed orbit, one news note with viewing
  advice. Comets are a timeline-only layer.

Miss rate among rejections: 1% (95% CI 0.2–5.4%), about 3 (1–18) missed in the 336. Counting the
borderlines: 3% (1.0–8.5%), about 10 (3–28). Against 15 accepted, recall for this window could be as low as
roughly 50–85%, so the uncertainty is wide.

**Failure pattern:** sightings mentioned in passing inside an article about something else.
**Not tested here:** fireballs and falls (1844 had almost no fireball candidates). The 1870s decade audit
covers those.
