// one case page, from /cases/<id> (or ?c=<id>): the painting, the headline and outcome, the story,
// the clipping with the part to read marked in the margin, a locator map, sources, and the cases either side
(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const cases = [...window.SKY_CASES].sort((a, b) => a.year - b.year);
  const fromPath = location.pathname.match(/^\/cases\/([^/]+)/);
  const id = fromPath ? decodeURIComponent(fromPath[1]) : new URLSearchParams(location.search).get("c");
  const i = cases.findIndex((c) => c.id === id);

  if (i < 0) {
    const lost = (window.SKY_SCENES || {}).lost;
    if (lost) {
      $(".plate").hidden = false;
      $(".plate figcaption").innerHTML = lost.caption.map((t) => `<span>${esc(t)}</span>`).join("");
      $("#sky").setAttribute("aria-label", `Painting: ${lost.alt}`);
      paintScene($("#sky"), "lost", { duration: 7000 });
    }
    $("h1").textContent = "That case came down somewhere I never found";
    $(".lede").innerHTML = 'There are thirteen, and they\'re all <a href="/#cases">on the front page</a>.';
    $(".case-body").remove();
    $(".case-sources").remove();
    return;
  }
  const c = cases[i];
  const story = (window.SKY_STORIES || {})[c.id];
  const scene = (window.SKY_SCENES || {})[c.id];
  document.title = `${c.town}, ${c.year} · Sky In Print`;
  document.body.classList.add(`v-${c.verdict}`);
  // old ?c= links settle on the clean address
  if (!fromPath && location.protocol !== "file:") history.replaceState(null, "", `/cases/${c.id}`);

  // the painting
  if (scene) {
    const plate = $(".plate");
    plate.hidden = false;
    const cv = $("#sky");
    cv.setAttribute("aria-label", `Painting: ${scene.alt}`);
    plate.querySelector("figcaption").innerHTML = scene.caption.map((t) => `<span>${esc(t)}</span>`).join("");
    paintScene(cv, c.id, { duration: 6500 });
  }

  $("h1").textContent = c.headline;
  const metbull = c.sources.find((s) => /metbull/.test(s.url));
  $(".status-line").innerHTML =
    `<b>${esc(c.stamp)}.</b> ${esc(c.place)}, ${esc(c.date)}.` +
    (metbull ? ` <a href="${esc(metbull.url)}" target="_blank" rel="noopener">The Bulletin entry</a>` : "");
  $(".lede").textContent = c.hook;

  // the clipping, with a line in the margin beside each passage worth reading
  const scan = (window.SKY_SCANS || {})[c.id];
  const paper = c.sources.find((s) => /loc\.gov|galileo/i.test(s.url)) || c.sources[0];
  const marks = scan
    ? scan.brackets
        .map(([a, b]) => `<span class="mark" style="top:${((a / scan.h) * 100).toFixed(2)}%;height:${(((b - a) / scan.h) * 100).toFixed(2)}%"></span>`)
        .join("")
    : "";
  const clipping = scan
    ? `<a class="clip" href="${esc(scan.url)}" target="_blank" rel="noopener">${marks}<img src="/${scan.src}?v=3" width="${scan.w}" height="${scan.h}" alt="Scan of the ${esc(scan.paper)} report"></a><p class="cap">${esc(scan.paper)}. The line in the margin marks the part to read, and clicking opens the whole page at the Library of Congress.</p>`
    : `<p class="cap">No newspaper scan for this one. The record is ${esc(paper.label)}.</p>`;

  $(".story").innerHTML = story ? story.body : `<p>${esc(c.summary)}</p>`;
  $(".scan").innerHTML = clipping;
  // tall clippings read better in the main column than squeezed into the side
  if (scan && scan.h / scan.w > 1.8) {
    $(".story").insertAdjacentHTML("beforeend", `<h2>The clipping</h2><div class="scan wide">${clipping}</div>`);
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

  $(".facts").innerHTML = [
    ["Where", c.place],
    ["When", c.date],
    ["Outcome", c.stamp],
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
