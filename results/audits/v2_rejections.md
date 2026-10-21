# Audit: v2 model rejections (fresh seeded samples)

Seed `v2-audit-20261021`; 100 rejections drawn from each population. Read by Claude; Tyler's spot-check is pending.

| Population | Rejected | Sampled | Clear misses | Possible misses |
|---|---|---|---|---|
| falls_1870s window | 11,999 | 100 | 0 | 1 (1872-11: streams of light "across the starry heavens", meteor shower or aurora) |
| ordinary windows (pooled) | 14,685 | 100 | 0 | 0 |

- The rejected sets are dominated by the expected noise: ships, horses and products named Meteor or Eclipse, the town
  of Aurora, figures of speech, poetry, forecasts and astronomy essays.
- 0 of 100 gives a 95% upper bound of about 3.7% on the miss rate. Because rejections vastly outnumber real reports,
  that bound still allows up to about 440 missed reports in the 1870s window and about 540 in the ordinary windows.
- So this sample shows that misses are **rare**, but it **cannot bound recall tightly** for rare events, as expected.
  Recall evidence instead comes from the known-fall recovery test (5/7, both misses upstream of the model) and the
  manual-issue search (running).
