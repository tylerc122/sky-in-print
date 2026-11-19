# Sky In Print

In November 2026 the [Meteoritical Bulletin](https://www.lpi.usra.edu/meteor/metbull.cfm?code=23973) changed the Thomson, Georgia (1888) meteorite from a find to an observed fall, after I sent them the 1888 newspaper reports of it coming down. It's a known meteorite getting its history fixed, not a new one, but it's the first thing this project actually changed in the record.

Sky In Print is me reading about two hundred years of American newspapers for fireballs and meteorite falls, then chasing every claimed stone forward to find out what really happened to it. The results live at **[skyinprint.com](https://www.skyinprint.com)**: thirteen cases told through the original scans, a map of every fireball printed in more than one town, and a reconstruction of the great fireball of 21 December 1876.

## How I did it

**Finding the reports.** The text comes from [American Stories](https://huggingface.co/datasets/dell-research-harvard/AmericanStories), a research group's OCR of the Library of Congress newspaper scans. Keyword patterns pull out anything that might be about the sky, and then a local model (Flint, running on my own machine) sorts real sky reports from the pile of horse races, ads and fiction. The model only narrows things down, it never decides whether something came from space. Before the full run I did a pilot on pre-registered windows, with the rules and prompts committed in `prereg/` before I'd read any of the evaluation data, so I couldn't quietly tune it to look good.

The full sweep covers 1770 to 1964 (with plenty of gaps). For falls it triaged 245,249 candidate articles down to 6,250 fall reports, and on the fireball side it ended up with 24,391 reports grouped into 11,307 events, 807 of them printed in two or more cities.

**Reading them.** Papers reprinted each other constantly, so a dozen clippings can be one guy's story, and the paper's hometown usually isn't where the witness was standing. Reports get grouped into reprint families with OCR-tolerant copy detection, and then I read the families myself and graded them.

**Chasing the stones.** Any report that says a stone was picked up gets followed through later papers, science journals, museum accession records and a lot of emails to small-town historical societies and librarians. Most trails die. The Seaford, Delaware stone turned out to be chalcedony, Middleburg, Florida was limonite, the Smithsonian has no record of three stones that supposedly went there, and others just vanish. A few are still open, like the Saco, Maine stone that went to what's now the Saco Museum. The running record is in `results/falls/`.

**Checking what it misses.** I tested recall against the 114 recorded US falls in the years I swept. 48 of them have a real report somewhere in the keyword candidates, and the model caught 47 of those. The other 66 never reached the model at all, mostly because the papers aren't in the corpus or the OCR mangled them. In a blind check I agreed with the model on 22 of 24 calls. The details are in `results/validation/` and `results/eyecheck/`.

**The 1876 fireball.** It's the biggest event in the data, 25 independent sources. Fitting a ground track from seven towns that saw it pass overhead gives a path that runs 17 km from the Rochester, Indiana meteorite site, which I didn't use in the fit. That's the reconstruction on the [fireball page](https://www.skyinprint.com/fireball).

## What's in here

- `site/` is the website, plus the downloadable data ([data dictionary](site/data/README.md)).
- `src/skyinprint/` has the pipeline: filtering, model triage, reprint grouping, fireball tracks and follow-up tools.
- `prereg/` has the pre-registration, keyword patterns, triage prompts and pinned corpus manifests.
- `results/` has the pilot report, recall checks, fall trails and the outreach log.
- `reference/` has the meteorite catalogue snapshot and other reference lists.

This is a curated snapshot, so raw newspaper downloads, private emails and working review queues aren't here, and the triage step is wired to my own model server. It's mostly here to show the work rather than to rerun it.

## Caveats

The map shows what got printed and survived, which tracks how many papers were digitized a lot more than how often things fell. Publishing towns aren't witness locations, fireball groupings can still mix unrelated reports, and none of the open stone leads is a confirmed meteorite.

## Credits and license

Newspaper text from [American Stories](https://huggingface.co/datasets/dell-research-harvard/AmericanStories) (Dell et al., 2023), built on Library of Congress [Chronicling America](https://chroniclingamerica.loc.gov) scans. Known meteorites from NASA's Meteorite Landings dataset and the Meteoritical Bulletin. Code is MIT ([LICENSE](LICENSE)), derived data is CC BY 4.0, and third-party data keeps its own terms.
