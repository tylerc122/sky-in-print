// the thirteen followed falls, as the gallery and case pages show them. Place, date, coordinates and
// sources come from data/catalog.js; the wording here is written from the release summaries and the
// case write-ups. verdict is one of: real, hoax, maybe (probably a hoax), rock, open.
(() => {
  const WRITTEN = [
    {
      id: "northport",
      verdict: "rock",
      stamp: "Copper slag",
      headline: "Pieces of an 1850 fireball, picked up thirty years later",
      hook: "People on Penobscot Bay remembered a fireball dropping into the water, so when odd lumps turned up on the shore in the 1880s everyone knew what they were. A chemist at Bowdoin had other ideas.",
    },
    {
      id: "saco",
      verdict: "open",
      stamp: "Still open",
      headline: "A meteor lands behind Capt. Doe's house",
      hook: "He found it the next morning by poking the scorched ground with a pitchfork, gave it to the local museum, and the museum still has the paperwork.",
    },
    {
      id: "laclede",
      verdict: "open",
      stamp: "Still open",
      headline: "A mystery hole in a hay meadow, thirteen feet deep",
      hook: "They dug it out and found a metal ball the size of a cannonball, which was supposed to go to a library in St. Louis and then just vanishes from the record.",
    },
    {
      id: "homestead",
      verdict: "real",
      stamp: "Real meteorite",
      headline: "A fireball breaks apart over Iowa City",
      hook: "It split into pieces in front of everyone and the booms came three minutes later. A real fall, and one of the ways I checked the search works.",
    },
    {
      id: "rochester",
      verdict: "real",
      stamp: "Real meteorite",
      headline: "One fireball, overhead in seven towns",
      hook: "Put the seven towns on a map and they line up, and the line runs 17 km from where the Rochester meteorite came down.",
      more: { href: "/fireball", label: "How the line was drawn" },
    },
    {
      id: "newton",
      verdict: "hoax",
      stamp: "Hoax",
      headline: "Farmer killed in his bed by a meteorite",
      hook: "A twenty-pound stone through the roof, dug up from five feet under the floor \"stained with blood\". Papers everywhere ran it and none of it happened.",
    },
    {
      id: "estherville",
      verdict: "real",
      stamp: "Real meteorite",
      headline: "Yankton watches a meteor land in the wrong river",
      hook: "People in Yankton were sure it dropped into the Jim River outside town. It came down more than a hundred miles east, in Iowa.",
    },
    {
      id: "schroon",
      verdict: "hoax",
      stamp: "Hoax",
      headline: "A red-hot stone lands beside a lake cottage",
      hook: "The room lit up like daytime, the house shook, and there was a 125-pound stone in the yard. Two months later it turned out to be quartz soaked in kerosene.",
    },
    {
      id: "st-joseph",
      verdict: "maybe",
      stamp: "Probably a hoax",
      headline: "Two tons, going by the size of the hole",
      hook: "Twenty-odd papers ran a giant aerolite near Evansville, and as far as I can tell nobody ever actually saw the stone.",
    },
    {
      id: "amsterdam",
      verdict: "hoax",
      stamp: "Fell off a wagon",
      headline: "A three-ton aerolite lands outside a bank",
      hook: "A heavy stone fell off a wagon, and by the next morning papers across the country had it falling from the sky.",
    },
    {
      id: "middleburg",
      verdict: "rock",
      stamp: "Iron ore",
      headline: "A 206-pound stone in the middle of the road",
      hook: "Everyone figured the thunderstorm dropped it, so it got shipped to the Jacksonville exposition, where a mineralogist took one look and called it iron ore.",
    },
    {
      id: "thomson",
      verdict: "real",
      stamp: "Real, and now an observed fall",
      headline: "A stone lands thirty yards from a man picking cotton",
      quote: "heard it whizzing as a minnie ball",
      hook: "The catalogue had it as a find for over a century, even though the guy who dug it up watched it land. That got fixed on November 11.",
    },
    {
      id: "jonesboro",
      verdict: "open",
      stamp: "Still open",
      headline: "A meteorite for the Cairo library",
      hook: "A. V. Cook said he watched it fall and gave it to the library in 1914. Where it went after that, nobody knows yet.",
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
  const sourceUrl = (u) => (u.startsWith("evidence/") ? "/data/" + u : u);
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
      href: `/cases/${c.id}`,
    };
  });
})();
