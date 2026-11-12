// one case page, from ?c=<id>: the painting, the headline and outcome, the story (or the summary),
// the clipping, a locator map, the record for cases that have one, sources, and the cases either side
(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const cases = [...window.SKY_CASES].sort((a, b) => a.year - b.year);
  const id = new URLSearchParams(location.search).get("c");
  const i = cases.findIndex((c) => c.id === id);

  if (i < 0) {
    $("h1").textContent = "That case isn't here";
    $(".lede").innerHTML = 'Try the <a href="index.html#cases">list of all 13 cases</a>.';
    $(".case-body").remove();
    $(".case-sources").remove();
    return;
  }
  const c = cases[i];
  const story = (window.SKY_STORIES || {})[c.id];
  const scene = (window.SKY_SCENES || {})[c.id];
  document.title = `${c.town}, ${c.year} · Sky In Print`;
  document.body.classList.add(`v-${c.verdict}`);

  // the painting
  if (scene) {
    const plate = $(".plate");
    plate.hidden = false;
    const cv = $("#sky");
    cv.setAttribute("aria-label", `Painting: ${scene.alt}`);
    const cap = plate.querySelectorAll("figcaption span");
    cap[0].textContent = scene.caption[0];
    cap[1].textContent = scene.caption[1];
    paintScene(cv, c.id, { duration: 6500 });
  }

  $("h1").textContent = story ? story.title : c.headline;
  const metbull = c.sources.find((s) => /metbull/.test(s.url));
  $(".status-line").innerHTML =
    `<b>${esc(c.stamp)}.</b> ${esc(c.place)}, ${esc(c.date)}.` +
    (metbull ? ` <a href="${esc(metbull.url)}" target="_blank" rel="noopener">The Bulletin entry</a>` : "");
  $(".lede").textContent = story ? story.lede : c.ending;

  // the clipping
  const scan = (window.SKY_SCANS || {})[c.id];
  const paper = c.sources.find((s) => /loc\.gov|galileo/i.test(s.url)) || c.sources[0];
  const clipping = scan
    ? `<a href="${esc(scan.url)}" target="_blank" rel="noopener"><img src="${scan.src}" width="${scan.w}" height="${scan.h}" alt="Scan of the ${esc(scan.paper)} report"></a><p class="cap">${esc(scan.paper)}. Library of Congress, Chronicling America.</p>`
    : `<p class="cap">No newspaper scan for this one. The record is ${esc(paper.label)}.</p>`;

  // the long story with the clipping beside it, or for the shorter cases the clipping itself in the main column
  if (story) {
    $(".story").innerHTML = story.body;
    $(".scan").innerHTML = clipping;
  } else {
    $(".story").innerHTML =
      `<p>${esc(c.summary)}</p>${c.quote ? `<blockquote><p>“${esc(c.quote)}”</p></blockquote>` : ""}` +
      (c.more ? `<p><a href="${c.more.href}">${esc(c.more.label)}</a></p>` : "") +
      `<h2>What the paper printed</h2><div class="scan">${clipping}</div>`;
    $(".case-side .scan").remove();
  }

  // the record, where a case has one
  if (story && story.record) {
    const rec = $(".record");
    rec.hidden = false;
    rec.querySelector("ol").innerHTML = story.record
      .map(([d, t], n) => `<li${n === story.record.length - 1 ? ' class="now"' : ""}><time>${esc(d)}</time><span>${esc(t)}</span></li>`)
      .join("");
  }

  $(".case-sources ul").innerHTML = c.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join("");

  const fall = window.SKY_DATA.falls.find((f) => f.id === c.id);
  $(".facts").innerHTML = [
    ["Where", c.place],
    ["When", c.date],
    ["Outcome", c.stamp],
    ["Location", fall.location_basis],
  ]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`)
    .join("");

  // locator map
  const states = topojson
    .feature(SKY_GEOGRAPHY, SKY_GEOGRAPHY.objects.states)
    .features.filter((d) => !["02", "15", "72"].includes(String(d.id).padStart(2, "0")));
  const projection = d3.geoAlbersUsa().fitExtent(
    [
      [6, 6],
      [394, 244],
    ],
    { type: "FeatureCollection", features: states },
  );
  const map = d3.select(".locator svg").attr("viewBox", "0 0 400 250").attr("aria-label", `Map of the United States with ${c.place} marked`);
  map.selectAll("path").data(states).join("path").attr("class", "case-state").attr("d", d3.geoPath(projection));
  const p = projection([c.lon, c.lat]);
  if (p) {
    map.append("circle").attr("class", "case-ring").attr("cx", p[0]).attr("cy", p[1]).attr("r", 11);
    map.append("circle").attr("class", "case-dot").attr("cx", p[0]).attr("cy", p[1]).attr("r", 4.5);
  }

  const link = (x, dir) =>
    x ? `<a href="${x.href}"><span>${dir === "prev" ? "Earlier case" : "Later case"}</span>${esc(x.town)}, ${x.year}</a>` : "<span></span>";
  $(".pager").innerHTML = link(cases[i - 1], "prev") + link(cases[i + 1], "next");
})();
