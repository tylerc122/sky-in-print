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
  };
  const cite = (k, label = "Read the source") =>
    ` <a href="${S[k]}" target="_blank" rel="noopener">${label} ↗</a>`;
  const stories = [
    {
      id: "saco",
      number: "01",
      status: "Under investigation · October 1870",
      title: "Saco, Maine, 1870",
      body: `
<p>In November 1873 the <em>Daily Kennebec Journal</em> reported that Captain Ira C. Doe had given the York Institute in Saco "a meteoric stone". The article described an evening in October 1870: Doe saw a meteor approach his property, heard a whizzing sound and an explosion, and the next morning found scorched grass and broken ground in the meadow behind his house, where he dug up the stone.${cite("saco")}</p>
<blockquote>“presented to the York Institute a meteoric stone”</blockquote>
<p>The stone was said to weigh about fifteen pounds, dull lead-coloured, with a pebbled or shrivelled surface. It appears in no meteorite catalogue.${cite("saco")}</p>
<h3>The museum record</h3>
<p>The York Institute is now the Saco Museum. In October 2026 the museum found two accession records for Doe: 1873.111, which matches the 1873 gift, and 1891.68, a second item also described as a meteorite.${cite("museum", "Project update")}</p>
<p>An accession record shows that a gift was recorded under a description. It does not show the description was correct. Neither stone has yet been located or examined.${cite("museum")}</p>
<div class="update"><h3>Update · October 2026</h3><p>Accession records located. Objects not yet located or examined. No meteorite identification is confirmed. ${cite("museum", "Public update")}</p></div>`,
    },
    {
      id: "middleburg",
      number: "02",
      status: "Not a meteorite · January 1888",
      title: "Middleburg, Florida, 1888",
      body: `
<p>In January 1888 the <em>Palatka Daily News</em> reported a stone "believed to be meteoric" found in a road near Middleburg, Florida. It had broken in two: about 200 pounds and 8 pounds. It looked like iron ore covered with small white crystals. A thunderstorm the night before was assumed to be when it fell; nobody saw it fall.${cite("middleburg")}</p>
<p>The finder, A. S. Chalker, gave it to Sweeny and Allen of the steamer <em>Twilight</em> to take to the Sub-Tropical Exposition in Jacksonville.${cite("middleburg")}</p>
<h3>The verdict</h3>
<p>In February 1888 George F. Kunz told the New York Academy of Sciences that the supposed meteorite shown at the exposition, weighing two hundred pounds and said to have fallen at Middleburg, was limonite, a common iron ore.${cite("kunz", "Transactions, vol. 7, p. 135")}</p>
<blockquote>“only a mass of limonite”</blockquote>
<p>The exposition's own catalogue lists a "Sample Iron Rock, from Middleburg" among the Clay County exhibits.${cite("museum", "Catalogue update")}</p>
<p>Charles Fort retold the story in 1919 as "a block of limestone", which turned the iron-ore verdict into a different mineral.${cite("fort", "Fort's retelling")}</p>
<p>Where the stone went after the exposition is unknown.</p>`,
    },
    {
      id: "schroon",
      number: "03",
      status: "Hoax · September 1880",
      title: "Schroon Lake, New York, 1880",
      body: `
<p>In September 1880 newspapers reported that a red-hot stone had landed beside Lakeside Cottage on Schroon Lake, after a bright light and a noise that shook the house.${cite("schroon")}</p>
<p>By October a follow-up described the stone as triangular and about 125 pounds, said a fragment would be shown to scientists, and noted that some people doubted it had fallen at all.${cite("doubts")}</p>
<h3>The retraction</h3>
<p>On November 26 the <em>Perrysburg Journal</em> reported that the "aerolite" had been faked, and mentioned a threatened lawsuit over who owned it.${cite("retraction")}</p>
<blockquote>“merely a piece of quartz covered with kerosene oil and sulphur”</blockquote>
<p>The original story kept circulating. The <em>Washington Standard</em> printed it again in February 1881, three months after the retraction.${cite("late", "The later reprint")}</p>`,
    },
  ];
  const trackBody = `<p>On the evening of December 21, 1876, newspapers in several states reported a brilliant meteor. Seven towns in Missouri and Illinois said it passed overhead or nearly so: Mexico, Quincy, Lewistown, Havana, Bloomington, Mansfield and Gilman.${cite("track")}</p>
<h3>The fit</h3>
<p>The track on this page is the great circle that comes closest to those seven towns, using town centres as positions. It runs west-southwest to east-northeast at an azimuth of about 68°. The towns scatter about 26 km from the line (root-mean-square).${cite("track", "Method and fit notes")}</p>
<blockquote>“overhead, a little north of the zenith”</blockquote>
<p>That is the Mansfield report, as reprinted by the <em>Inter Ocean</em>.${cite("track", "Mansfield source")}</p>
<h3>The check</h3>
<p>The fireball dropped the Rochester, Indiana meteorite. Rochester was left out of the fit, and the fitted line passes about 17 km from it.${cite("track", "Rochester check")}</p>
<h3>What did not work</h3>
<p>Further east the line fails: Bucyrus, Ohio is about 132 km from the extended track. A height estimate from an Indianapolis observer's elevation angle gave 156 km, which is implausible, so no altitude is claimed. The animation shows the fitted ground path only, not the fireball's speed, height or timing.${cite("track")}</p>`;
  const root = document.getElementById("stories");
  if (root)
    root.innerHTML = stories
      .map(
        (s) =>
          `<article class="article" id="${s.id}"><p class="eyebrow">Case ${s.number}</p><span class="status">${s.status}</span><h2>${s.title}</h2>${s.body}<a class="back" href="#main">↑ All case studies</a></article>`,
      )
      .join("");
  const track = document.getElementById("track-story");
  if (track) track.innerHTML = trackBody;
})();
