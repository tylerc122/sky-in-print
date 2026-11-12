// the write-up for every case, from the clippings and the follow-up sources. Case pages read these;
// the 1876 fireball page reads trackBody.
(() => {
  const S = {
    saco: "https://www.loc.gov/resource/sn82014248/1873-11-20/ed-1/?sp=3",
    middleburg: "https://www.loc.gov/resource/sn89070049/1888-01-07/ed-1/?sp=4",
    kunz: "https://archive.org/details/transactionsofne78788newy/page/135/mode/1up",
    schroon: "https://www.loc.gov/resource/sn84024738/1880-09-28/ed-1/?sp=2",
    doubts: "https://www.loc.gov/resource/sn83045462/1880-10-09/ed-1/?sp=5",
    retraction: "https://www.loc.gov/resource/sn87076843/1880-11-26/ed-1/?sp=3",
    late: "https://www.loc.gov/resource/sn84022770/1881-02-04/ed-1/?sp=3",
    track: "/data/evidence/tracks.md",
    museum: "/data/evidence/public_updates.md",
    fort: "https://www.gutenberg.org/ebooks/22472",
    merrill: "https://archive.org/details/smithsonianmisce521910smit/page/473/mode/1up",
    savannah: "https://www.loc.gov/resource/sn86063034/1888-11-07/ed-1/?sp=6",
    lincolnton: "https://gahistoricnewspapers.galileo.usg.edu/lccn/sn90052031/1888-10-19/ed-1/seq-3/",
    metbull: "https://www.lpi.usra.edu/meteor/metbull.cfm?code=23973",
    robinson: "https://doi.org/10.2475/ajs.s3-35.207.212",
    laclede: "https://www.loc.gov/resource/sn84024670/1872-08-10/ed-1/?sp=3",
    homestead: "https://www.loc.gov/resource/sn84031492/1875-02-14/ed-1/?sp=2",
    rochester: "https://www.loc.gov/resource/sn84026844/1876-12-22/ed-1/?sp=1",
    newton: "https://www.loc.gov/resource/sn87056243/1879-01-23/ed-1/?sp=1",
    vatican: "https://www.vaticanobservatory.org/sacred-space-astronomy/1879-hoosiers-and-humility-death-and-deception/",
    yankton: "https://www.loc.gov/resource/sn84022144/1879-05-13/ed-1/?sp=4",
    stjoseph: "https://www.loc.gov/resource/sn99068076/1887-06-24/ed-1/?sp=1",
    amsterdam: "https://www.loc.gov/resource/sn86091092/1888-01-28/ed-1/?sp=3",
    cairo: "https://www.loc.gov/resource/sn93055779/1914-12-11/ed-1/?sp=2",
  };
  const cite = (k, label) => ` <a href="${S[k]}" target="_blank" rel="noopener">${label}</a>`;
  const quote = (text, from) => `<blockquote><p>“${text}”</p><footer>${from}</footer></blockquote>`;

  const stories = [
    {
      id: "northport",
      title: "Northport, Maine",
      body: `
<p>Back in 1850 people around Northport, on Penobscot Bay, saw a fireball come down into the water. Thirty-some years later lumps of something heavy and glassy started turning up along that shore, and by 1884 the papers were saying a scientist had a 20-pound piece of the Northport meteorite and was studying it. Five more stories followed it into 1885.</p>
<p>The scientist was F. C. Robinson, a chemist at Bowdoin, and when he published in 1888 it wasn't the answer anyone wanted. Under the microscope and in the lab his pieces were nearly identical to slag from the Revere Copper Works, most likely ballast some ship had dumped. He was fine believing the 1850 fireball happened, he just didn't think these rocks had anything to do with it.${cite("robinson", "Robinson, 1888")}</p>`,
    },
    {
      id: "saco",
      title: "Saco, Maine",
      body: `
<p>Capt. Ira Doe lived about two and a half miles out on the Portland road. One evening in October 1870 he saw a meteor that looked like it was heading straight for his place, heard it whizz, then heard it hit the meadow out back with a bang "like that of a rocket".${cite("saco", "The 1873 article")}</p>
<p>The next morning the grass was scorched and the ground torn up, so he poked around with a pitchfork and found a stone, about fifteen pounds, dull lead color, shaped like somebody had squeezed it before it cooled. In 1873 he gave it to the York Institute.</p>
${quote("It looks as though some one had clasped and squeezed it before it had time to cool.", "Daily Kennebec Journal, November 20, 1873")}
<h2>Where it might be now</h2>
<p>The York Institute is the Saco Museum now, and in October 2026 they found the accession record for that gift, plus a second "meteorite" Doe gave them in 1891. So the paperwork's there. Nobody's found the actual stones yet, and until somebody does a magnet test and gets them in front of a specialist, there's no way to know if either one is real.${cite("museum", "The museum update")}</p>`,
    },
    {
      id: "laclede",
      title: "Laclede Station, Missouri",
      body: `
<p>In the summer of 1871 John J. Murdoch found a weird hole in the hay meadow by his house near Laclede Station, a foot or so across. A friend said it was an aerolite and got laughed at. To mark the spot they shoved a fence rail in, and eight feet of rail went down before it hit bottom.</p>
<p>The next summer, after the hay was cut, Murdoch let some workmen dig. Thirteen feet down they hit a ball of metal "about the size of a large 12-pound cannon ball", flattened at the ends and crusted over like it had burned on the way in. They brought it into St. Louis, where it "excited considerable curiosity", and the paper said it was going to the Mercantile Library.${cite("laclede", "The St. Louis story, reprinted")}</p>
<p>That's the last I can find of it. Nine papers ran the story and none of them followed up, and there's no Missouri meteorite in the catalogue that matches.</p>`,
    },
    {
      id: "homestead",
      title: "Homestead, Iowa",
      body: `
<p>At 10:30 on a Friday night in February 1875 a fireball about half the size of the moon went over Iowa City, the color of molten iron, and broke into pieces while people watched. Around three minutes later came three explosions that sounded like thunder, louder west of town than in it.${cite("homestead", "The report")}</p>
<p>Those pieces came down around the Amana villages and became the Homestead meteorite, which has been in the catalogue ever since. I didn't need to chase this one. Finding it in the papers was one of the checks that the search actually catches real falls.</p>`,
    },
    {
      id: "rochester",
      title: "Rochester, Indiana",
      body: `
<p>On the evening of December 21, 1876 a fireball crossed Missouri, Illinois and Indiana, and the next day it was in papers everywhere. In Lawrence, Kansas it went over "about 8 o'clock" and stayed in sight for close to a minute. Seven towns in Missouri and Illinois said it passed right overhead.${cite("rochester", "The Wheeling report")}</p>
<p>If you put those seven towns on a map they fall on a line, and the line runs 17 km from where the Rochester meteorite was picked up. I left Rochester out when I fit the line, so that lining up is a real check and not something I forced.</p>
<p><a href="/fireball">How the line was drawn</a></p>`,
    },
    {
      id: "newton",
      title: "Newtown, Indiana",
      body: `
<p>Leonidas Grover was a widower on a farm near Newtown, in Fountain County. One Tuesday night his daughter and her husband got home late and went to bed figuring he was asleep. In the morning she went to call him for breakfast and found him dead in his bed, with a ragged hole in the roof right above him and more holes through the bed and the floor.</p>
<p>Digging under the house turned up a twenty-pound stone, pyramid shaped, from almost five feet down.${cite("newton", "Plymouth Democrat, January 23, 1879")}</p>
${quote("pyramidal in shape and weighing twenty pounds and a few ounces, avoirdupois, and stained with blood", "Plymouth Democrat, from the Indianapolis Journal")}
<p>It went everywhere, copied from the Indianapolis Journal into papers all over the country, and none of it happened. It was a hoax and the papers ended up retracting it.${cite("vatican", "How it came apart")}</p>`,
    },
    {
      id: "estherville",
      title: "Estherville, Iowa",
      body: `
<p>Late on a Saturday afternoon in May 1879, people in Yankton, in Dakota Territory, watched a meteor come down and were sure it went into the mouth of the Jim River just outside town. By Tuesday the Yankton paper had to report that it had "been heard from" over in Iowa, where it blew up with a bang loud enough to hear in Sioux City.${cite("yankton", "Yankton, May 13, 1879")}</p>
<p>It actually came down near Estherville, Iowa, more than a hundred miles east of Yankton. That's the Estherville meteorite, already in the catalogue, and the search picked it up all over the papers that spring.</p>`,
    },
    {
      id: "schroon",
      title: "Schroon Lake, New York",
      body: `
<p>About 10 on a Wednesday night in September 1880, M. E. Granger was sitting at the table in Lake-Side Cottage on Schroon Lake writing a letter, and the room lit up "as though the sun had abandoned his usual course". The night was pitch black and overcast. Then a noise shook the house, and outside next to the cottage was a red-hot stone.${cite("schroon", "The first report")}</p>
<p>By October the papers had it at about 125 pounds and triangular, with a piece headed off to scientists, and some people were already saying it never fell at all.${cite("doubts", "The doubts")}</p>
${quote("merely a piece of quartz covered with kerosene oil and sulphur", "Perrysburg Journal, November 26, 1880")}
<p>That's how the Perrysburg Journal put it in November, along with a lawsuit somebody was threatening over who owned the thing.${cite("retraction", "The retraction")} The Washington Standard ran the original story again in February 1881, three months after it had been called a fake.${cite("late", "The late reprint")}</p>`,
    },
    {
      id: "st-joseph",
      title: "St. Joseph, Indiana",
      body: `
<p>In June 1887 a short item went around: an aerolite "of vast dimensions" had come down near St. Joseph, about ten miles from Evansville and three miles from the nearest railroad station. Nobody weighed it. The paper worked out from the size of the hole that it "cannot weigh less than two tons".${cite("stjoseph", "Kimball Graphic, June 24, 1887")}</p>
<p>It showed up in twenty-odd papers, and that's where it stops. I never found a stone, an analysis, a museum, or a retraction, so I'm calling it probably a hoax, though I can't prove that.</p>`,
    },
    {
      id: "amsterdam",
      title: "Amsterdam, New York",
      body: `
<p>In November 1887 papers across the country reported that a three-ton aerolite had come down in Amsterdam, New York, right outside a bank.</p>
<p>The clipping here is the correction from a couple of months later, and honestly it's a better story than the original.${cite("amsterdam", "Caldwell Tribune, January 28, 1888")}</p>
${quote("a heavy stone fell from a wagon, and the next morning nearly every newspaper in the country contained accounts of the fall of a three-ton aerolite in that city", "Caldwell Tribune, January 28, 1888")}`,
    },
    {
      id: "middleburg",
      title: "Middleburg, Florida",
      body: `
<p>In January 1888 a stone turned up in the middle of a road near Middleburg, in Clay County, half buried in a dent it looked like it had made, and broken in two: 206 pounds and about eight. It looked like iron ore covered in little white crystals. Nobody saw it fall, but there'd been a thunderstorm the night before, so that settled it for everyone.${cite("middleburg", "Palatka Daily News, January 7, 1888")}</p>
<p>The finder, A. S. Chalker, handed it to the steamer Twilight to haul up to the Sub-Tropical Exposition in Jacksonville. In February the mineralogist George F. Kunz told the New York Academy of Sciences that the big Middleburg "meteorite" at the exposition was limonite, a common iron ore.${cite("kunz", "Kunz, 1888")}</p>
${quote("only a mass of limonite", "G. F. Kunz, February 1888")}
<p>The exposition's own catalogue lists a "Sample Iron Rock, from Middleburg" under Clay County, which is probably the same rock.${cite("museum", "The catalogue check")} Charles Fort retold the whole thing in 1919 as "a block of limestone", which got the mineral wrong too.${cite("fort", "Fort's version")} Where it went after the exposition, nobody knows.</p>`,
    },
    {
      id: "thomson",
      title: "Thomson, Georgia",
      body: `
<p>Thomson has been a known meteorite for a long time, but the catalogue had it down as a find, a stone somebody picked up later with nobody seeing it come down. The man who dug it up told a different story.</p>
<p>On November 26, 1888 B. F. Wilson wrote that on October 15 the stone fell within thirty yards of him while he was picking cotton, and that he dug it out with a spade. G. P. Merrill quoted the letter in 1910.${cite("merrill", "Merrill, 1910")}</p>
<p>The Savannah Morning News of November 7 had already run a piece saying Ben Wilson had brought in a stone to be analysed. In the same column there's a loose paragraph about a man in a cotton field who heard a stone coming before it buried itself three or four inches in the dirt. The Religio-Philosophical Journal printed the whole thing as one item on November 24, which ties the two paragraphs together.${cite("savannah", "The Savannah page")}</p>
${quote("heard it whizzing as a minnie ball", "Savannah Morning News, November 7, 1888")}
<h2>A second report</h2>
<p>The Lincolnton News, 36 km north, said that around 1 p.m. on Monday, October 15, folks there were "startled by a heavy thundering report accompanied by a rushing noise". It names no fireball and no witness, and the area was still getting aftershocks from the 1886 Charleston earthquake, but the day and the place line up.${cite("lincolnton", "Lincolnton News, October 19, 1888")}</p>
<h2>Getting it changed</h2>
<p>I sent all of this to the Meteoritical Bulletin Database editors in October. The database editor took it to the Nomenclature Committee with his own sources, including Wilson's original letters, and the vote came back 6 to 0. I'd also worked out roughly where the Wilson farm was from the county deed books and an 1871 map of McDuffie County. The new entry went up on November 11, 2026 with Thomson listed as an observed fall, the first time anything out of this project has changed the official record.${cite("metbull", "The entry")}</p>`,
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
      id: "jonesboro",
      title: "Jonesboro, Illinois",
      body: `
<p>In December 1914 the Cairo Bulletin ran the list of gifts to the Cairo Public Library: a $10 check from the Fortnightly club, nine volumes of an encyclopedia annual, twenty-five books including twenty volumes of Scott, and a meteorite.${cite("cairo", "Cairo Bulletin, December 11, 1914")}</p>
${quote("a large meteorite from A. V. Cook of Jonesboro, Ill. Mr. Cook saw this meteorite fall", "Cairo Bulletin, December 11, 1914")}
<p>That one line is all there is. No date for the fall, nothing about what the stone looked like. The catalogue does have a "Jonesboro", but it's a 30-gram iron that's probably from Tennessee, so it isn't this one. I've asked around about what the library did with it and I'm still waiting to hear.</p>`,
    },
  ];

  const trackBody = `<p>On the evening of December 21, 1876 papers in several states reported a brilliant meteor. Seven towns in Missouri and Illinois said it went overhead or close to it: Mexico, Quincy, Lewistown, Havana, Bloomington, Mansfield and Gilman.${cite("track", "The sources")}</p>
<h3>The fit</h3>
<p>The line on this page is the great circle that comes closest to those seven towns, using town centers as their positions. It runs west-southwest to east-northeast, at about 68°, and the towns sit about 26 km off it on average (root mean square).${cite("track", "Fit notes")}</p>
${quote("overhead, a little north of the zenith", "Mansfield, as reprinted by the Inter Ocean")}
<h3>The check</h3>
<p>This fireball dropped the Rochester, Indiana meteorite. I left Rochester out of the fit, and the line still passes about 17 km from it.${cite("track", "Rochester check")}</p>
<h3>What didn't work</h3>
<p>Further east it falls apart: Bucyrus, Ohio is about 132 km off the extended line. A height worked out from one Indianapolis observer's angle came to 156 km, which is way too high to be right, so I'm not claiming any altitude. The animation shows the ground path and nothing about speed, height or timing.${cite("track", "Details")}</p>`;

  window.SKY_STORIES = Object.fromEntries(stories.map((s) => [s.id, s]));
  const track = document.getElementById("track-story");
  if (track) track.innerHTML = trackBody;
})();
