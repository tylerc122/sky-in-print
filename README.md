# Sky In Print

**The American sky in print, 1774–1963.**

For almost two centuries, when something strange appeared in the sky (a fireball, stones falling from
space, the northern lights reaching unusually far south), people wrote to their local newspaper about it.
Sky In Print reconstructs those observations from the Library of Congress's digitized newspapers
(the [American Stories](https://huggingface.co/datasets/dell-research-harvard/AmericanStories) corpus,
about 280M articles), links every report to its original page scan, and checks it against the scientific
record.

Focus:
1. **Fireballs and meteorite falls** (the discovery focus). Reconstruct fireball events from scattered
   reports, and follow reported meteorite falls through later records (finders, sales, donations,
   museum accessions) to see whether any match no recognized meteorite.
2. **Auroras**: a descriptive map of where people reported seeing them.
3. **Eclipses**: a control layer for date accuracy.
4. **Comets and meteor showers**: timeline features.

Status: **pilot** (see [`docs/SPEC.md`](docs/SPEC.md), sections 6 and 10).

## Layout

- `docs/SPEC.md`: the reviewed project spec
- `prereg/`: pilot windows and rules, committed before the data in them was examined
- `reference/`: frozen reference catalogs, with their source and retrieval date
- `src/skyinprint/`: pipeline code
- `results/`: pilot outputs
- `data/` (git-ignored): downloaded newspaper archives and intermediate files

## Reproducing

```bash
uv venv && uv pip install -e .
```

Newspaper archives are downloaded one year at a time from Hugging Face at a pinned revision
(see `prereg/`), filtered, then deleted.

## Licenses and credit

Newspaper text: American Stories (Dell et al. 2023), CC BY 4.0, built from Library of Congress Chronicling
America scans. Code: MIT. Derived data: CC BY 4.0.

## Public site

The static public site is in `site/`. Open `site/index.html` directly, or serve that directory with any static web server. It includes the interactive atlas, four sourced stories, the 1876 reconstruction, methods and downloadable data.

Regenerate the release with `python -m skyinprint.export_public`. Run release integrity checks with `python -m unittest discover -s tests -v`. See `site/README.md` for editing and reproduction notes. Only `site/` is intended for hosting.
