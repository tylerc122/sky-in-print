// the homepage: Thomson painted across the top, then all thirteen cases oldest first, each with
// its own painting, filterable by how they turned out
(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const D = window.SKY_DATA;
  const cases = [...window.SKY_CASES].sort((a, b) => a.year - b.year);
  const groups = window.SKY_GROUPS;
  const scenes = window.SKY_SCENES || {};

  // numbers from the release
  const articles = D.coverage.reduce((n, d) => n + (Number(d.articles) || 0), 0);
  if (articles) $('[data-from="articles"]').textContent = `${Math.round(articles / 1e6)} million`;

  // the big painting
  const hero = $("#hero");
  const t = scenes.thomson;
  if (t) {
    hero.setAttribute("aria-label", `Painting: ${t.alt}`);
    document.querySelector(".plate figcaption").innerHTML = t.caption.map((x) => `<span>${esc(x)}</span>`).join("");
    paintScene(hero, "thomson", { duration: 7500 });
  }

  // the list
  const list = $(".case-list");
  list.innerHTML = cases
    .map(
      (c) => `<li class="case-row v-${c.verdict}" data-group="${c.group}">
  <a class="thumb" href="${c.href}" tabindex="-1" aria-hidden="true"><canvas width="840" height="400" data-scene="${c.id}"></canvas></a>
  <div>
    <p class="row-meta"><b>${c.year}</b> ${esc(c.place)}</p>
    <h3><a href="${c.href}">${esc(c.headline)}</a></h3>
    <p class="outcome">${esc(c.stamp)}</p>
    <p>${esc(c.hook)}</p>
  </div>
</li>`,
    )
    .join("");
  list.querySelectorAll("canvas[data-scene]").forEach((cv) => paintScene(cv, cv.dataset.scene, { animate: false, lazy: true, density: 0.6, maxWidth: 1100 }));

  // filter by outcome
  const filter = $(".case-filter");
  const count = (key) => cases.filter((c) => key === "all" || c.group === key).length;
  filter.innerHTML = [{ key: "all", label: "All" }, ...groups]
    .map((g) => `<button type="button" data-key="${g.key}" aria-pressed="${g.key === "all"}">${esc(g.key === "all" ? "All" : g.plural[0].toUpperCase() + g.plural.slice(1))} <b>${count(g.key)}</b></button>`)
    .join("");
  filter.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    filter.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    list.querySelectorAll(".case-row").forEach((row) => (row.hidden = b.dataset.key !== "all" && row.dataset.group !== b.dataset.key));
  });
})();
