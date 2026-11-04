// one case page, filled from ?c=<id>: what the papers said, what it was, the long story if there is
// one, sources, a locator map and links to the cases either side
(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const cases = window.SKY_CASES,
    id = new URLSearchParams(location.search).get("c"),
    i = cases.findIndex((c) => c.id === id);

  if (i < 0) {
    $(".case-title").textContent = "That case isn't here";
    $(".case-dateline").textContent = "Not found";
    $(".case-body").innerHTML = '<p class="case-missing">Try the <a href="index.html">list of all 13 cases</a>.</p>';
    return;
  }
  const c = cases[i],
    story = (window.SKY_STORIES || {})[c.id];
  document.title = `${c.town}, ${c.year} · Sky In Print`;
  document.body.classList.add(`v-${c.verdict}`);

  $(".case-dateline").textContent = `Case ${String(c.n).padStart(2, "0")} · ${c.place} · ${c.date}`;
  $(".case-title").textContent = c.headline;
  $(".case-stamp").textContent = c.stamp;

  // the clipping itself, from the Library of Congress scan, with the passage bracketed in pencil
  const scan = (window.SKY_SCANS || {})[c.id];
  const paper = c.sources.find((s) => /loc\.gov|galileo|newspaper/i.test(s.url)) || c.sources[0];
  const bracket = ([a, b]) => `<path d="M34 ${a} C 18 ${a}, 22 ${a + 8}, 22 ${a + 22} L 22 ${b - 22} C 22 ${b - 8}, 18 ${b}, 34 ${b}" />`;
  $(".case-said").innerHTML =
    (scan
      ? `<figure class="paper-clip case-clip"><div class="clip-wrap"><img src="${scan.src}" alt="Scan of the ${esc(scan.paper)} report"><svg viewBox="0 0 ${scan.w} ${scan.h}" preserveAspectRatio="none" aria-hidden="true">${scan.brackets.map(bracket).join("")}</svg></div></figure>`
      : "") +
    (c.quote ? `<blockquote>“${esc(c.quote)}”</blockquote>` : "") +
    `<a class="text-link" href="${esc(scan ? scan.url : paper.url)}" target="_blank" rel="noopener">${esc(scan ? scan.paper : paper.label)}, on the Library of Congress site ↗</a>`;

  const status = window.SKY_DATA.statuses[c.status];
  $(".case-was").innerHTML =
    `<p class="case-verdict"><span class="stamp">${esc(c.stamp)}</span></p>` +
    `<p class="case-ending">${esc(c.ending)}</p>` +
    (c.more ? `<a class="text-link" href="${c.more.href}">${esc(c.more.label)} →</a>` : "") +
    (status ? `<p class="case-def">What “${esc(c.status)}” means here: ${esc(status)}</p>` : "");

  if (story) {
    $(".case-story").hidden = false;
    $(".case-article").innerHTML = `<p class="lede">${story.lede}</p>${story.body}`;
  } else {
    $(".case-story").hidden = false;
    $("#story").textContent = "In more detail";
    $(".case-article").innerHTML = `<p>${esc(c.summary)}</p>`;
  }

  $(".case-sources").innerHTML = c.sources
    .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a></li>`)
    .join("");

  const fall = window.SKY_DATA.falls.find((f) => f.id === c.id);
  $(".case-facts").innerHTML = [
    ["Where", c.place],
    ["When", c.date],
    ["Verdict", c.stamp],
    ["Location", fall.location_basis],
  ]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`)
    .join("");

  // locator map: the whole country, one glowing dot
  const states = topojson
    .feature(SKY_GEOGRAPHY, SKY_GEOGRAPHY.objects.states)
    .features.filter((d) => !["02", "15", "72"].includes(String(d.id).padStart(2, "0")));
  const projection = d3.geoAlbersUsa().fitExtent(
      [
        [10, 10],
        [390, 240],
      ],
      { type: "FeatureCollection", features: states },
    ),
    map = d3.select(".case-map").attr("viewBox", "0 0 400 250").attr("aria-label", `Map of the United States with ${c.place} marked`);
  map.selectAll("path").data(states).join("path").attr("class", "case-state").attr("d", d3.geoPath(projection));
  const p = projection([c.lon, c.lat]);
  if (p) {
    map.append("circle").attr("class", "case-ring").attr("cx", p[0]).attr("cy", p[1]).attr("r", 5);
    map.append("circle").attr("class", "case-dot").attr("cx", p[0]).attr("cy", p[1]).attr("r", 5);
  }

  // previous / next case
  const link = (x, dir) =>
    x
      ? `<a class="pager-${dir}" href="${x.href}"><small>${dir === "prev" ? "← Earlier" : "Later →"}</small><span>${esc(x.town)}, ${x.year}</span><em>${esc(x.stamp)}</em></a>`
      : "<span></span>";
  $(".case-pager").innerHTML = link(cases[i - 1], "prev") + link(cases[i + 1], "next");
})();
