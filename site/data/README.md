# Sky In Print · public release

This repository includes the published data snapshot and upstream research code. The private release exporter is not included. New candidate groupings require review before inclusion in the published dataset.

## Files and columns
- fall_reports.csv / .json: curated public-brief cases.
- fireball_events.csv / .json: full-sweep groups with independent_cities >= 2 or vetted.
- coverage.json: year, newspapers (digitized titles in the available sweep statistics), articles (processed corpus articles). Absent years are unknown, never zero.
- track.json: fitted great-circle coordinates [longitude, latitude], seven overhead witnesses, Rochester holdout coordinates, azimuth_deg (degrees clockwise from north), fit_rms_km, fit_residuals_km, checks_km_north_of_track, and the failed single-observer height estimate.
- catalog.js: browser bundle of the same records for serverless file opening.
- geography.js: US Atlas 3.0.1 state boundaries for the local map.

Shared fields: id (stable record identifier); kind (fall or fireball); place (display locality); date_lo/date_hi (ISO date or partial year/month, with original precision retained); year (filter year from date_lo); lat/lon (decimal degrees, nullable); location_basis (coordinate meaning); status (see below); summary (curated description); sources (JSON array of label and URL).
Fall-only: quote (short historical excerpt), story (article anchor or null).
Fireball-only: reports (articles), papers (newspaper titles), independent_cities (upstream grouped publishing-city proxy, NOT verified independent witnesses), dated (upstream date-resolution flag), vetted (upstream human-review flag), quotes (JSON array of short uncorrected OCR excerpts, URL, label, publication date and reported place), cities (upstream city labels).
CSV nested values are JSON. Blank coordinates mean unresolved, not 0,0. Fall coordinates are approximate localities, not exact recovery sites. A fireball marker is one representative publishing town, selected as the medoid of resolved newspaper coordinates, NOT an observation, trajectory, or impact location. Events without coordinates remain in the list/download. Selection by independent_cities does not establish true witness independence. Fireball dates may span a window; filtering uses interval overlap. Some grouped records contain other sky phenomena; this remains a pilot candidate catalogue.

## Status definitions
- **recognized:** Matches a meteorite in the Meteoritical Bulletin.
- **not a meteorite:** Identified as a terrestrial object by a contemporary or modern examination.
- **hoax:** Retracted or documented as invented.
- **likely hoax:** Has the hoax pattern, but no retraction has been found.
- **unresolved:** Credible report; no outcome found.
- **under investigation:** An institution is currently checking records or objects.

Fireball review labels are separate: human reviewed or candidate grouping. They are not fall outcomes.

## Coverage and limits
More dots in a year can reflect more digitized newspapers, changing selection, or reprints, not more meteors. This release cannot measure meteor frequency. A fall case and a fireball group may refer to the same event; record totals are not unique event totals. The 1770–1964 axis is a research scope, not a claim of continuous coverage. No new meteorite is confirmed. Saco accession information is attributed to the institution on the case page; correspondence and institution-supplied attachments are not distributed. The statements about current investigation are a dated snapshot, not live updates.

## Sources and credit
Newspapers: Library of Congress / Chronicling America through American Stories (Dell et al., 2023), CC BY 4.0. Derived data: CC BY 4.0. Reference meteorites: NASA frozen Meteorite Landings snapshot / Meteoritical Bulletin. Geography: US Atlas 3.0.1 (ISC), derived from US Census Bureau cartography. D3 7.9.0 and topojson-client 3.1.0 (ISC) are vendored in assets; their license notices are included there. The source project documents are included only through an explicit public evidence allowlist.
