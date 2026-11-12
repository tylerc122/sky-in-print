# Sky In Print

[Sky In Print](https://www.skyinprint.com) follows American newspaper reports of fireballs and alleged meteorite falls through original scans, scientific literature and museum records.

The public site presents thirteen cases, a map of newspaper reports, and a reconstruction of the 21 December 1876 fireball. The first published catalogue correction is **Thomson, Georgia (1888)**: the [Meteoritical Bulletin](https://www.lpi.usra.edu/meteor/metbull.cfm?code=23973) now records it as an observed fall. This is a correction to a recognized meteorite's history, not the discovery of a new meteorite. Other specimen leads remain unresolved.

## View the site locally

Python 3.12 or later:

```sh
python3 scripts/serve_site.py
```

Open http://localhost:8766. The static website needs no package installation or build step. Deploy only `site/`; its Vercel configuration supplies clean URLs and case-page routing.

## Repository contents

- `site/`: website, downloadable data and public evidence summaries.
- `src/skyinprint/`: newspaper filtering, model triage, grouping and follow-up research tools.
- `prereg/`: research rules, prompts and pinned input manifests. Some historical notes reference working artifacts not distributed in this release.
- `reference/`: reference catalogs and source notices.
- `results/`: selected research outputs and sanitized institutional inquiry summaries.
- `tests/`: checks of the distributed data, evidence links and reconstruction.

The public release is a curated snapshot. Raw newspaper downloads, private correspondence, deployment configuration and working review queues are not included. The original release exporter is also omitted; this repository does not claim a one-command rebuild of the full published release.

## Research tools

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e .
python -m unittest discover -s tests -v
```

Download and triage jobs are separate from viewing the site. They require the newspaper inputs described in `prereg/` and can take substantial storage and computation. Module docstrings describe their inputs and commands; some tools expect intermediate outputs from earlier stages.

Model triage requires `SKY_MODEL_BASE_URL`, `SKY_MODEL_NAME` and `SKY_LANE_URL` in the environment or an untracked `local.env` at the repository root. The included client expects an OpenAI-compatible model API and a private-network availability service exposing `/lane`; it is specific to that shared-compute workflow. Neither service nor credentials are supplied. The client checks private addresses and yields to other workloads; actual network access must be controlled at the server.

## Interpretation and credit

Newspaper coverage, OCR errors and reprinting affect what appears in the data. Publishing towns are not necessarily witness locations. Candidate groupings and reported stones are not confirmed meteorites. See the [data dictionary](site/data/README.md) and site methods page for limitations.

Newspaper text: [American Stories](https://huggingface.co/datasets/dell-research-harvard/AmericanStories), Dell et al. (2023), based on Library of Congress / Chronicling America scans. Code: MIT, see [LICENSE](LICENSE). Derived data: CC BY 4.0. Third-party reference data and libraries retain their source notices and applicable terms.
