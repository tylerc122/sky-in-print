// the thirteen followed falls, as the gallery and case pages show them. Place, date, coordinates and
// sources come from data/catalog.js; the wording here is written from the release summaries and the
// case write-ups. verdict is one of: real, hoax, maybe (probably a hoax), rock, open.
(() => {
  const WRITTEN = [
    {
      id: "northport",
      verdict: "rock",
      stamp: "Copper slag",
      headline: "A fireball over Maine, and fragments picked up decades later",
      ending: "A Bowdoin chemist tested the fragments in 1888. Copper slag, probably ship's ballast.",
    },
    {
      id: "saco",
      verdict: "open",
      stamp: "Still open",
      headline: "A meteor, a bang, and a stone in the meadow by morning",
      ending: "Capt. Ira Doe gave the stone to the York Institute in 1873. The museum it became found the accession records in 2026. The stones haven't turned up yet.",
    },
    {
      id: "laclede",
      verdict: "open",
      stamp: "Still open",
      headline: "A 12-pound stone with a black crust, dug up from 13 feet down",
      ending: "The finder meant to give it to the Mercantile Library in St. Louis. Whether it ever got there is still unknown.",
    },
    {
      id: "homestead",
      verdict: "real",
      stamp: "Real meteorite",
      headline: "Stones fall across Iowa County",
      ending: "A real fall, already in the meteorite catalogue. Finding it in the papers is one of the ways I checked the search actually works.",
    },
    {
      id: "rochester",
      verdict: "real",
      stamp: "Real meteorite",
      headline: "One fireball, seen overhead in seven towns",
      ending: "Put the seven towns on a map and they line up. The line passes 17 km from where the Rochester meteorite came down, and Rochester wasn't used to draw it.",
      more: { href: "fireball.html", label: "See how the line was drawn" },
    },
    {
      id: "newton",
      verdict: "hoax",
      stamp: "Hoax",
      headline: "Farmer killed in his bed by a meteorite",
      ending: "The story was widely reprinted. It never happened.",
    },
    {
      id: "estherville",
      verdict: "real",
      stamp: "Real meteorite",
      headline: "A meteorite comes down near Estherville, Iowa",
      ending: "A real fall, already in the meteorite catalogue, and all over the papers that spring.",
    },
    {
      id: "schroon",
      verdict: "hoax",
      stamp: "Hoax",
      headline: "A red-hot, 125-pound stone lands beside a lakeside cottage",
      ending: "Two months later the papers called it a fake.",
    },
    {
      id: "st-joseph",
      verdict: "maybe",
      stamp: "Probably a hoax",
      headline: "A two-ton aerolite, in twenty-odd papers",
      ending: "No stone, no analysis and no retraction ever turned up.",
    },
    {
      id: "amsterdam",
      verdict: "hoax",
      stamp: "Fell off a wagon",
      headline: "A three-ton aerolite lands outside a bank",
      ending: "It was a big stone that fell off a wagon.",
    },
    {
      id: "middleburg",
      verdict: "rock",
      stamp: "Iron ore",
      headline: "A 200-pound “meteorite” heads to the Jacksonville Exposition",
      ending: "The mineralogist G. F. Kunz looked at it and called it iron ore.",
    },
    {
      id: "thomson",
      verdict: "real",
      stamp: "Real, and now listed as a fall",
      headline: "A stone falls thirty yards from a man picking cotton",
      quote: "heard it whizzing as a minnie ball",
      ending: "The catalogue had Thomson as found, not seen falling. The finder's 1888 letter said otherwise, and on November 11, 2026 the record was changed to an observed fall.",
    },
    {
      id: "jonesboro",
      verdict: "open",
      stamp: "Still open",
      headline: "A. V. Cook gives the library a meteorite he saw fall",
      ending: "Where the stone went after that is still unknown.",
    },
  ];

  // the filter groups on the gallery; "probably a hoax" sits with the hoaxes
  const GROUPS = [
    { key: "real", label: "Real meteorite", plural: "real meteorites", verdicts: ["real"] },
    { key: "hoax", label: "Hoax", plural: "hoaxes", verdicts: ["hoax", "maybe"] },
    { key: "rock", label: "Just a rock", plural: "ordinary rocks", verdicts: ["rock"] },
    { key: "open", label: "Still open", plural: "still open", verdicts: ["open"] },
  ];

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dateLabel = (d) => {
    const [y, m, day] = d.split("-").map(Number);
    if (!m) return String(y);
    return day ? `${MONTHS[m - 1]} ${day}, ${y}` : `${MONTHS[m - 1]} ${y}`;
  };
  const sourceUrl = (u) => (u.startsWith("evidence/") ? "data/" + u : u);
  const byId = new Map(window.SKY_DATA.falls.map((f) => [f.id, f]));

  window.SKY_GROUPS = GROUPS;
  window.SKY_CASES = WRITTEN.filter((c) => byId.has(c.id)).map((c, i) => {
    const f = byId.get(c.id);
    return {
      ...c,
      n: i + 1,
      place: f.place,
      town: f.place.split(",")[0],
      date: dateLabel(f.date_lo),
      year: Number(f.date_lo.slice(0, 4)),
      lat: f.lat,
      lon: f.lon,
      summary: f.summary,
      status: f.status,
      quote: c.quote || f.quote || "",
      sources: f.sources.map((s) => ({ ...s, url: sourceUrl(s.url) })),
      group: GROUPS.find((g) => g.verdicts.includes(c.verdict)).key,
      href: `case.html?c=${c.id}`,
    };
  });
})();
