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
      title: "The stone in the cabinet",
      body: `
<p>The useful clue was not a blazing sky. It was a donation. In November 1873, the <em>Daily Kennebec Journal</em> reported that Captain Ira C. Doe had given a stone to the York Institute. The account looked back three years, to an evening in October 1870 near Saco, Maine. That gap matters: the newspaper was recording a remembered fall in the course of announcing a gift, rather than reporting the event the next morning.${cite("saco")}</p>
<p>According to the article, Doe saw a meteor approaching and heard a whizzing sound followed by an explosion. The following morning he investigated the meadow behind his house. The report describes disturbed ground and scorched grass, and says he found the stone by probing with a fork. These are claims in a historical account, not observations we can independently repeat. They tell us what Doe's story was when the gift entered the public record.${cite("saco")}</p>
<blockquote>“presented to the York Institute a meteoric stone”</blockquote>
<p>The stone was said to weigh about fifteen pounds. Its dull leaden colour and unusual, pebbled or shrivelled surface made it memorable enough to describe in detail. A modern reader may find that description suggestive. But a description does not identify a material, and the report's language about heat should not become a laboratory result simply because it is vivid. The decisive question is whether there is still an object to examine.${cite("saco")}</p>
<h3>A destination changes the search</h3>
<p>A report that ends with an unnamed person keeping a stone leaves few obvious next steps. Here the newspaper named both the donor and the receiving institution. That gave the search an address in the historical record: the York Institute, now the Saco Museum. The investigation could move beyond variations on the word “meteor” and ask about a particular donation by a particular person.${cite("saco")}${cite("museum", "Dated project update")}</p>
<p>As of October 22, 2026, the Saco Museum had confirmed two accession records associated with Doe: 1873.111 and 1891.68. The first aligns with the donation reported in 1873. The second records another donation described as a meteorite. The existence of a second entry is useful, but it does not establish whether there were two different objects, two pieces of one object, or some other relationship between the donations.${cite("museum", "Institutional update")}</p>
<p>That is a real step forward in the trail, with a clear limit. An accession record demonstrates that an institution recorded a gift under a description. It does not establish that the description was scientifically correct. Neither stone had been located or examined for this investigation at the time of the update. The public status is therefore <strong>under investigation</strong>, and neither donation is a confirmed meteorite.${cite("museum", "What is and is not confirmed")}</p>
<h3>The next piece of evidence is physical</h3>
<p>The search now has two accession numbers to work with. Locating an object bearing one of those numbers would connect the paper record to something that can be inspected. An examination would then have to establish what the material actually is. Until that happens, a satisfying newspaper narrative and an encouraging museum record remain two parts of a promising trail, rather than a completed identification.${cite("museum")}</p>
<p>This is also why the story can matter without a new meteorite at its end. The newspaper preserved a donor, a destination, an approximate date and a description. The museum's records provide a second kind of evidence, created for a different purpose. Read together, they turn a loose historical claim into a question narrow enough to investigate. They do not tell us the answer in advance.${cite("saco")}${cite("museum")}</p>
<div class="update"><h3>Update · October 22, 2026</h3><p>Accession records located. Objects not yet located or examined. This section will carry the result of the investigation when there is evidence to report. <strong>No meteorite identification is confirmed.</strong> ${cite("museum", "Public update and attribution")}</p></div>`,
    },
    {
      id: "middleburg",
      number: "02",
      status: "Not a meteorite · January 1888 reports",
      title: "Iron rock from Middleburg",
      body: `
<p>The Middleburg story had somewhere to go. In January 1888, a Florida newspaper described a large stone destined for the Sub-Tropical Exposition in Jacksonville. A named finder, a named steamer and a public exhibition make a much stronger trail than an isolated claim that something fell from the sky. They create places where another record, or the object itself, might turn up.${cite("middleburg")}</p>
<p>The <em>Palatka Daily News</em> account was cautious in ways that later summaries could lose. It said a stone believed to be meteoric had been found about two weeks earlier in a road near Middleburg. The stone lay partly buried in a depression and had broken into two pieces. Its appearance was described as iron ore covered with small opaque white crystals. The larger piece reportedly weighed about two hundred pounds, the smaller about eight.${cite("middleburg")}</p>
<p>The timing was an inference. There had been a thunderstorm the preceding night, and the newspaper said this was when the stone was supposed to have fallen. That is different from describing a witnessed impact. Keeping the distinction visible matters: a reader moving quickly through a newspaper column can easily turn a proposed explanation for a find into a confirmed account of a fall.${cite("middleburg")}</p>
<h3>A steamer, an exhibition, a verdict</h3>
<p>The article named A. S. Chalker as the finder and said he gave the stone to Sweeny and Allen of the steamer <em>Twilight</em> to take to the exposition. This is the part of the story that made follow-up possible. The question was no longer simply what happened near Middleburg. It was what a public exhibition, or someone examining its exhibits, had to say about this particular object.${cite("middleburg")}</p>
<p>The answer was already in contemporary scientific print. At the New York Academy of Sciences in February 1888, G. F. Kunz described the supposed meteorite exhibited at the Florida Sub-Tropical Exposition. He matched it to the Middleburg story and its reported two-hundred-pound weight. Then he supplied the identification that the early newspaper report lacked. The material, he said, was limonite.${cite("kunz", "Transactions, volume 7, page 135")}</p>
<blockquote>“only a mass of limonite”</blockquote>
<p>That short verdict changes the site's label from an open meteorite lead to <strong>not a meteorite</strong>. It does not require us to guess what every early observer saw, or to reconstruct precisely how the stone came to rest in the road. The published identification addresses the object at the exhibition. That is the point where the specimen trail yields an answer to the mineralogical question.${cite("kunz")}</p>
<h3>How a correction becomes another mystery</h3>
<p>Charles Fort later retold the episode in <em>The Book of the Damned</em>. His version referred to a block of limestone and treated the rejection of its celestial origin as part of a larger argument about excluded evidence. Compare that wording with Kunz's limonite. The change in the name of the material is not a small detail when the material is the reason the stone was rejected as a meteorite.${cite("fort", "Fort’s retelling")}${cite("kunz", "Compare the original verdict")}</p>
<p>Reading the newspaper and scientific notice together produces a less mysterious, but more instructive ending. The initial report established the claimed circumstances and the route to Jacksonville. The scientific notice identified the exhibited material. A later retelling preserved the disagreement while changing a key term. Following the chain back makes it possible to separate those three things instead of inheriting the most dramatic version.${cite("middleburg")}${cite("kunz")}${cite("fort")}</p>
<p>A further institutional check, recorded in the project's October 22 update, found an exposition catalogue entry for a sample of iron rock from Middleburg. It is consistent with Kunz's conclusion, although the identification of that entry with this stone is an inference. The institution's supplied scans are not republished here. The scientific verdict is independently available in the public journal citation.${cite("museum", "Catalogue update")}${cite("kunz")}</p>
<p>One question remains open: where did the stone go after the exposition? That is a collection-history question, distinct from the claim that it was a meteorite. The trail need not answer every question to settle one of them. For this site, the ending is limonite, and the route to that ending is visible in the sources.${cite("museum")}${cite("kunz")}</p>`,
    },
    {
      id: "schroon",
      number: "03",
      status: "Hoax · September 1880",
      title: "Quartz, kerosene and sulphur",
      body: `
<p>The Schroon Lake report had the ingredients of a lead worth following. There was a named occupant, a cottage, a sudden light, a noise and a stone close to the house. A dispatch printed in September 1880 described a narrow escape at Lakeside Cottage. On a first reading, the apparent specificity makes it tempting to treat the account as stronger evidence than an anonymous paragraph about a distant town.${cite("schroon")}</p>
<p>In that telling, the cottage's occupant was writing when the surroundings suddenly became bright. The report placed a red-hot object near the building after a house-shaking disturbance. It supplied a scene a reader could imagine and a locality an investigator could search. Neither quality, by itself, established what the object was or how it arrived there. They made the story investigable, not verified.${cite("schroon")}</p>
<h3>The detail that needed a later page</h3>
<p>The story did not stop with the first dispatch. By October, a newspaper item said a fragment was to be submitted to a meeting of scientists. It described the stone as triangular and about 125 pounds, and acknowledged that some people doubted the claim that it had fallen from the sky while intensely hot. That item matters because it shows uncertainty inside the contemporary record, rather than imposing doubt on the story only in hindsight.${cite("doubts")}</p>
<p>The announcement of a proposed examination was still not a published identification. It told readers that a check might happen. Treating the proposed next step as if it were already a successful test would repeat the original problem: turning a claim about evidence into evidence of the claim. The useful response was to keep reading beyond the first promising article and beyond the announcement that scientists might become involved.${cite("doubts")}</p>
<p>The decisive change appeared in a later, much less spectacular newspaper paragraph. On November 26, the <em>Perrysburg Journal</em> explained that the supposed aerolite was a piece of quartz dressed up with combustible material. The source is still a newspaper, and its account should be attributed as such. But it is a direct contemporary correction of the same affair, rather than silence or a modern reader's suspicion.${cite("retraction")}</p>
<blockquote>“merely a piece of quartz covered with kerosene oil and sulphur”</blockquote>
<p>The correction also mentioned a threatened lawsuit over possession of the supposed aerolite. That detail helps connect the quiet follow-up to the object that had drawn attention earlier. The story's public status on this site is <strong>hoax</strong>, because a contemporary retraction explains the supposed meteorite as an artificial display. The spectacular opening survives in the archive, but it no longer gets the final word.${cite("retraction")}</p>
<h3>A story can outlive its correction</h3>
<p>Even after that explanation appeared, the earlier dramatic account continued to circulate. A February 1881 item in the <em>Washington Standard</em> again described the cottage's narrow escape and the glowing object. Set beside the November correction, the later printing is a compact demonstration of why the date of a newspaper page is not always the date of a new observation. A paper can be printing an old story whose outcome is already known elsewhere.${cite("late", "The later retelling")}${cite("retraction", "The earlier correction")}</p>
<p>For a catalogue built from newspaper text, that creates two separate tasks. First, accounts that repeat one another need to be connected instead of counted as new witnesses. Second, the story needs to be followed forward to find corrections. Schroon Lake shows why a plausible place, named people and several printed versions cannot replace that second step. All can survive inside a story that later reporting dismantles.${cite("schroon")}${cite("late")}${cite("retraction")}</p>
<p>The point of keeping this case in an atlas of reported falls is not to make the newspaper seem foolish. It is to preserve the difference between a report and its outcome. If the atlas contained only the opening dispatch, it would make the archive less accurate by omitting the part that answers the question. Here the ending is ordinary quartz, and finding that ending is a useful result.${cite("retraction")}</p>`,
    },
  ];
  const trackBody = `<p>On the evening of December 21, 1876, newspapers recorded a brilliant meteor seen across several states. The pilot's grouped event includes many reports, but the reconstruction does not begin by treating every newspaper as a new witness. It asks a narrower question: which accounts say the fireball passed overhead, and where were those observers? A description of direction can become a geographic constraint when its place is known.${cite("track")}</p>
<p>Seven towns in Missouri and Illinois supply those constraints: Mexico, Quincy, Lewistown, Havana, Bloomington, Mansfield and Gilman. Some accounts use the language of a zenith point; others say overhead or nearly directly over the town. Their newspaper references are listed above. The coordinates used here are town centres, so even a perfectly understood account would not locate the observer with the precision of a modern instrument.${cite("track")}</p>
<h3>Fit the towns, then test somewhere else</h3>
<p>The calculation finds the great circle that comes closest to the seven overhead points. A great circle is the geometry used for a path across the curved Earth; its appearance on a flat map depends on the map projection. The line on this page is sampled from that fitted circle. It is not a straight decorative stroke drawn between the first and last towns.${cite("track", "Method and fit notes")}</p>
<p>The fitted line has an azimuth of about 68 degrees, running west-southwest to east-northeast. The reports provide the direction of travel along it. The seven towns do not fall exactly on the line: their root-mean-square scatter is about 26 kilometres. That spread belongs in the result. It reflects a reconstruction from verbal accounts and approximate locations, rather than a measurement by synchronized cameras.${cite("track")}</p>
<p>Rochester, Indiana, supplies the most useful independent check. A recognized meteorite fell there from this fireball. Its location was not one of the seven points used to choose the track. The fit passes about seventeen kilometres north of the meteorite site. That agreement is informative precisely because the calculation was not allowed to use Rochester to improve its own answer.${cite("track", "The Rochester holdout check")}</p>
<blockquote>“overhead, a little north of the zenith”</blockquote>
<p>That phrase from the Mansfield report illustrates both the usefulness and the limitations of witness language. “Overhead” supplies an approximate point beneath the path, while “a little north” immediately qualifies it. The reconstruction retains the town as a constraint but does not pretend that the observer measured an exact angle. The source chain for this description runs through the <em>Inter Ocean</em> to the Salina newspaper account.${cite("track", "Mansfield source and residual")}</p>
<h3>Keep the failed checks</h3>
<p>The extended line does not agree equally well everywhere. Bucyrus, Ohio, sits about 132 kilometres south of the extrapolated track, and the notes conclude that the simple great-circle reconstruction stops working there. A report of a bend in the path is relevant context, not permission to silently redraw the line until every account agrees. The Missouri-to-Indiana result is stronger than a claim to reconstruct the whole visible journey.${cite("track")}</p>
<p>A separate height calculation also failed. An Indianapolis observer placed the fireball to the north at an elevation of about 45 degrees. Combining that angle with the fitted ground distance yielded a height of 156 kilometres, which the research notes reject as implausible for this reconstruction. One uncertain elevation estimate does not support a reliable altitude. The failure is retained in the downloadable data rather than hidden behind the successful ground-track check.${cite("track")}</p>
<p>The animation therefore makes a deliberately limited claim. It helps you follow the fitted ground path and see which towns constrain it. Its moving point does not reconstruct flight time, speed, altitude, radiant or orbit. The newspaper accounts support a geographic comparison, and Rochester provides a useful test of that comparison. That is already a remarkable thing to recover from a set of printed descriptions, without making the evidence do more than it can.${cite("track")}</p>`;
  const root = document.getElementById("stories");
  if (root)
    root.innerHTML = stories
      .map(
        (s) =>
          `<article class="article" id="${s.id}"><p class="eyebrow">Field notes / ${s.number}</p><span class="status">${s.status}</span><h2>${s.title}</h2>${s.body}<a class="back" href="#main">↑ Back to all stories</a></article>`,
      )
      .join("");
  const track = document.getElementById("track-story");
  if (track) track.innerHTML = trackBody;
})();
