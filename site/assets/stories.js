(() => {
  const S = {
    saco: "https://www.loc.gov/resource/sn82014248/1873-11-20/ed-1/?sp=3",
    middleburg: "https://www.loc.gov/resource/sn89070049/1888-01-07/ed-1/?sp=4",
    kunz: "https://archive.org/details/transactionsofne78788newy/page/135/mode/1up",
    schroon: "https://www.loc.gov/resource/sn84024738/1880-09-28/ed-1/?sp=2",
    doubts: "https://www.loc.gov/resource/sn83045462/1880-10-09/ed-1/?sp=5",
    retraction: "https://www.loc.gov/resource/sn87076843/1880-11-26/ed-1/?sp=3",
    late: "https://www.loc.gov/resource/sn84022770/1881-02-04/ed-1/?sp=3",
    track: "data/evidence/tracks.md",
    museum: "data/evidence/public_updates.md",
    fort: "https://www.gutenberg.org/ebooks/22472",
    merrill: "https://archive.org/details/smithsonianmisce521910smit/page/473/mode/1up",
    savannah: "https://www.loc.gov/resource/sn86063034/1888-11-07/ed-1/?sp=6",
    lincolnton: "https://gahistoricnewspapers.galileo.usg.edu/lccn/sn90052031/1888-10-19/ed-1/seq-3/",
    metbull: "https://www.lpi.usra.edu/meteor/metbull.cfm?code=23973",
  };
  const cite = (k, label = "Read the source") =>
    ` <a href="${S[k]}" target="_blank" rel="noopener">${label}</a>`;
  const stories = [
    {
      id: "thomson",
      lede: "Ben Wilson was picking cotton when a stone came down thirty yards from him and buried itself in the row. The catalogue spent more than a century calling it a find, meaning nobody saw it fall. That's fixed now.",
      number: "01",
      status: "Recognized · Observed fall since November 2026 · October 1888",
      title: "Thomson, Georgia, 1888",
      body: `
<p>Thomson has been a recognized meteorite for a long time, but the catalogue had it down as a find, a stone somebody picked up later with no fall on record. The record from 1888 says otherwise.</p>
<p>On November 26, 1888 the finder, B. F. Wilson, wrote that on October 15 the stone fell within thirty yards of him while he was picking cotton, and that he dug it out with a spade. G. P. Merrill quoted the letter in 1910.${cite("merrill", "Merrill, 1910")}</p>
<p>The Savannah Morning News of November 7 ran a piece headed "A Meteor Found Near Thomson", saying Ben Wilson had brought a stone in to be analysed. The same column has a loose paragraph about a man in a cotton field who heard a stone coming before it buried itself three or four inches in the ground. The Religio-Philosophical Journal printed the whole item in one piece on November 24, which ties the two paragraphs together.${cite("savannah", "The Savannah page")}</p>
<blockquote><p>“heard it whizzing as a minnie ball”</p><footer>Savannah Morning News, November 7, 1888</footer></blockquote>
<h2>A second report</h2>
<p>The Lincolnton News, 36 km to the north, said that around 1 p.m. on Monday, October 15, its citizens were "startled by a heavy thundering report accompanied by a rushing noise". It names no fireball and no witness, and the area was still getting aftershocks from the 1886 Charleston earthquake, but the day and the place line up.${cite("lincolnton", "Lincolnton News, October 19, 1888")}</p>
<h2>Getting it changed</h2>
<p>I sent all of this to the Meteoritical Bulletin Database editors in October. The database editor took it to the Nomenclature Committee along with his own sources, including Wilson's original letters, and the vote came back 6 to 0. I also worked out roughly where the Wilson farm was from the county deed books and an 1871 map of McDuffie County. The new entry went up on November 11, 2026 with Thomson listed as an observed fall.${cite("metbull", "The entry")}</p>
<p>It's a correction to a meteorite people already knew about. It's still the first time something out of this project has changed the official record.</p>`,
      record: [
        ["Oct 15, 1888", "The stone comes down near Wilson in the early afternoon."],
        ["Oct 19, 1888", "Lincolnton News reports a thundering noise at about 1 p.m. that Monday."],
        ["Nov 7, 1888", "Savannah Morning News: Wilson brings the stone in to be analysed."],
        ["Nov 24, 1888", "Religio-Philosophical Journal prints the whole item together."],
        ["Nov 26, 1888", "Wilson writes that it fell within thirty yards of him."],
        ["1910", "Merrill quotes the letter. The catalogue still lists Thomson as a find."],
        ["Oct 2026", "I send the newspaper trail to the Bulletin editors, and the committee votes."],
        ["Nov 11, 2026", "Republished as an observed fall."],
      ],
    },
    {
      id: "saco",
      lede: "Captain Ira Doe watched a meteor come down near his house, dug up a stone the next morning, and gave it to the local museum. The museum still has the paperwork.",
      number: "02",
      status: "Under investigation · October 1870",
      title: "Saco, Maine, 1870",
      body: `
<p>In November 1873 the Daily Kennebec Journal reported that Captain Ira C. Doe had given the York Institute in Saco "a meteoric stone". The article described an evening in October 1870: Doe saw a meteor approach his property, heard a whizzing sound and an explosion, and the next morning found scorched grass and broken ground in the meadow behind his house, where he dug up the stone.${cite("saco")}</p>
<blockquote><p>“presented to the York Institute a meteoric stone”</p></blockquote>
<p>The stone was said to weigh about fifteen pounds, dull lead-coloured, with a pebbled or shrivelled surface. It appears in no meteorite catalogue.${cite("saco")}</p>
<h3>The museum record</h3>
<p>The York Institute is now the Saco Museum. In October 2026 the museum found two accession records for Doe: 1873.111, which matches the 1873 gift, and 1891.68, a second item also described as a meteorite.${cite("museum", "Project update")}</p>
<p>An accession record shows that a gift was recorded under a description. It does not show the description was correct. Neither stone has yet been located or examined.${cite("museum")}</p>
<div class="update"><h2>Update · October 2026</h2><p>Accession records located. Objects not yet located or examined. No meteorite identification is confirmed. ${cite("museum", "Public update")}</p></div>`,
    },
    {
      id: "middleburg",
      lede: "A 200-pound “meteorite” went on show at the 1888 Exposition in Jacksonville. A mineralogist said it was iron ore.",
      number: "03",
      status: "Not a meteorite · January 1888",
      title: "Middleburg, Florida, 1888",
      body: `
<p>In January 1888 the Palatka Daily News reported a stone "believed to be meteoric" found in a road near Middleburg, Florida. It had broken in two: about 200 pounds and 8 pounds. It looked like iron ore covered with small white crystals. A thunderstorm the night before was assumed to be when it fell; nobody saw it fall.${cite("middleburg")}</p>
<p>The finder, A. S. Chalker, gave it to Sweeny and Allen of the steamer Twilight to take to the Sub-Tropical Exposition in Jacksonville.${cite("middleburg")}</p>
<h3>The verdict</h3>
<p>In February 1888 George F. Kunz told the New York Academy of Sciences that the supposed meteorite shown at the exposition, weighing two hundred pounds and said to have fallen at Middleburg, was limonite, a common iron ore.${cite("kunz", "Transactions, vol. 7, p. 135")}</p>
<blockquote><p>“only a mass of limonite”</p></blockquote>
<p>The exposition's own catalogue lists a "Sample Iron Rock, from Middleburg" among the Clay County exhibits.${cite("museum", "Catalogue update")}</p>
<p>Charles Fort retold the story in 1919 as "a block of limestone", which turned the iron-ore verdict into a different mineral.${cite("fort", "Fort's retelling")}</p>
<p>Where the stone went after the exposition is unknown.</p>`,
    },
    {
      id: "schroon",
      lede: "A red-hot stone landed beside a lakeside cottage. Two months later the papers called it a fake.",
      number: "04",
      status: "Hoax · September 1880",
      title: "Schroon Lake, New York, 1880",
      body: `
<p>In September 1880 newspapers reported that a red-hot stone had landed beside Lakeside Cottage on Schroon Lake, after a bright light and a noise that shook the house.${cite("schroon")}</p>
<p>By October a follow-up described the stone as triangular and about 125 pounds, said a fragment would be shown to scientists, and noted that some people doubted it had fallen at all.${cite("doubts")}</p>
<h3>The retraction</h3>
<p>On November 26 the Perrysburg Journal reported that the "aerolite" had been faked, and mentioned a threatened lawsuit over who owned it.${cite("retraction")}</p>
<blockquote><p>“merely a piece of quartz covered with kerosene oil and sulphur”</p></blockquote>
<p>The original story kept circulating. The Washington Standard printed it again in February 1881, three months after the retraction.${cite("late", "The later reprint")}</p>`,
    },
  ];
  const trackBody = `<p>On the evening of December 21, 1876, newspapers in several states reported a brilliant meteor. Seven towns in Missouri and Illinois said it passed overhead or nearly so: Mexico, Quincy, Lewistown, Havana, Bloomington, Mansfield and Gilman.${cite("track")}</p>
<h3>The fit</h3>
<p>The track on this page is the great circle that comes closest to those seven towns, using town centres as positions. It runs west-southwest to east-northeast at an azimuth of about 68°. The towns scatter about 26 km from the line (root-mean-square).${cite("track", "Method and fit notes")}</p>
<blockquote><p>“overhead, a little north of the zenith”</p></blockquote>
<p>That is the Mansfield report, as reprinted by the Inter Ocean.${cite("track", "Mansfield source")}</p>
<h3>The check</h3>
<p>The fireball dropped the Rochester, Indiana meteorite. Rochester was left out of the fit, and the fitted line passes about 17 km from it.${cite("track", "Rochester check")}</p>
<h3>What did not work</h3>
<p>Further east the line fails: Bucyrus, Ohio is about 132 km from the extended track. A height estimate from an Indianapolis observer's elevation angle gave 156 km, which is implausible, so no altitude is claimed. The animation shows the fitted ground path only, not the fireball's speed, height or timing.${cite("track")}</p>`;
  // case pages read the long stories from here
  window.SKY_STORIES = Object.fromEntries(stories.map((s) => [s.id, s]));
  const root = document.getElementById("stories");
  if (root)
    root.innerHTML = stories
      .map(
        (s) =>
          `<article class="article" id="${s.id}"><p class="eyebrow">Case ${s.number}</p><span class="status">${s.status}</span><h2>${s.title}</h2><p class="lede">${s.lede}</p>${s.body}<a class="back" href="#main">↑ All case studies</a></article>`,
      )
      .join("");
  const track = document.getElementById("track-story");
  if (track) track.innerHTML = trackBody;
})();
