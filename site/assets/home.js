// the homepage: a microfilm reader with all thirteen cases on the reel, the card catalogue of
// cases below it, and the tape of numbers. Scans come from data/scans.js (scripts/fetch_scans.py).
(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cases = window.SKY_CASES,
    scans = window.SKY_SCANS || {},
    D = window.SKY_DATA;

  // ---------- numbers on the tape, from the release ----------
  const articles = D.coverage.reduce((n, d) => n + (Number(d.articles) || 0), 0);
  if (articles) {
    $('[data-from="articles"]').textContent = `${(articles / 1e6).toFixed(1)} million`;
    $('[data-from="articles-short"]').textContent = `${Math.round(articles / 1e6)}M`;
  }
  $('[data-from="events"]').textContent = D.events.length.toLocaleString("en-US");
  $('[data-from="falls"]').textContent = D.falls.length;

  // a pencil bracket in the margin for each marked passage, in the clipping's own pixels
  const bracket = ([a, b]) => `<path pathLength="1" d="M34 ${a} C 18 ${a}, 22 ${a + 8}, 22 ${a + 22} L 22 ${b - 22} C 22 ${b - 8}, 18 ${b}, 34 ${b}" />`;
  const clip = (c, s) =>
    `<div class="clip" style="aspect-ratio:${s.w}/${s.h}"><img src="${s.src}" alt="Scan of the ${esc(s.paper)} report" loading="lazy"><svg viewBox="0 0 ${s.w} ${s.h}" preserveAspectRatio="none" aria-hidden="true">${s.brackets.map(bracket).join("")}</svg></div>`;
  // a case with no newspaper scan gets a typed card on the film instead
  const card = (c) =>
    `<div class="film-card"><p>${esc(c.place.toUpperCase())} · ${c.year}</p><p>No newspaper scan for this one. The story survives in ${esc(c.sources[0].label.split(",").slice(0, 2).join(","))}.</p></div>`;

  // ---------- the reader ----------
  const film = $(".film"),
    strip = $(".strip-inner"),
    counter = $(".counter"),
    slip = $(".slip"),
    crank = $(".crank"),
    stage = $(".reader-stage"),
    reels = document.querySelectorAll(".reel"),
    plateN = $(".plate-n"),
    platePlace = $(".plate-place");

  film.innerHTML = cases
    .map((c, i) => `<div class="frame" data-i="${i}" style="top:${i * 100}%">${scans[c.id] ? clip(c, scans[c.id]) : card(c)}</div>`)
    .join("");
  strip.innerHTML = cases
    .map(
      (c, i) =>
        `<button type="button" data-i="${i}" aria-label="${esc(c.place)}, ${c.year}" title="${esc(c.town)}, ${c.year}">${
          scans[c.id] ? `<img src="${scans[c.id].page}" alt="" loading="lazy">` : "<i></i>"
        }</button>`,
    )
    .join("");
  // a mechanical counter: four wheels of 0-9
  const wheel = `<span class="digit"><span>${[...Array(10).keys()].map((d) => `<i>${d}</i>`).join("")}</span></span>`;
  counter.innerHTML = wheel.repeat(4);
  const wheels = counter.querySelectorAll(".digit > span");
  const setYear = (y) => String(y).split("").forEach((d, i) => (wheels[i].style.transform = `translateY(${-d}em)`));

  crank.setAttribute("aria-valuemin", 1);
  crank.setAttribute("aria-valuemax", cases.length);

  let at = -1,
    turns = 0,
    timer = 0;
  function show(i, first = false) {
    if (i === at) return;
    const c = cases[i],
      s = scans[c.id];
    const dist = at < 0 ? 1 : Math.abs(i - at);
    at = i;
    const dur = reduce ? 1 : Math.min(2200, 900 + dist * 160);
    stage.style.setProperty("--run", `${dur}ms`);
    film.querySelectorAll(".frame.settled").forEach((f) => f.classList.remove("settled"));
    if (!first) film.classList.add("moving");
    film.style.transform = `translateY(${-i * 100}%)`;
    strip.querySelectorAll("button").forEach((b, j) => b.toggleAttribute("aria-current", j === i));
    const thumb = strip.children[i];
    strip.style.transform = `translateX(${-(thumb.offsetLeft + thumb.offsetWidth / 2 - strip.parentElement.clientWidth / 2)}px)`;
    turns += dist;
    reels.forEach((r) => r.style.setProperty("--spin", `${turns * 220}deg`));
    crank.style.setProperty("--turn", `${turns * 360}deg`);
    setYear(c.year);
    plateN.textContent = `Case ${String(i + 1).padStart(2, "0")} / ${cases.length}`;
    platePlace.textContent = c.place;
    crank.setAttribute("aria-valuenow", i + 1);
    crank.setAttribute("aria-valuetext", `${c.place}, ${c.date}: ${c.stamp}`);
    slip.classList.add("away");
    clearTimeout(timer);
    timer = setTimeout(
      () => {
        film.classList.remove("moving");
        film.querySelector(`[data-i="${i}"]`).classList.add("settled");
        slip.style.setProperty("--ink", `var(--v-${c.verdict})`);
        slip.innerHTML = `<p class="slip-head"><span>${esc(c.place.toUpperCase())}</span><span>${esc(c.date)}</span></p>
<p class="slip-paper">${esc(s ? s.paper : c.sources[0].label)}</p>
<span class="slip-verdict">Verdict: ${esc(c.stamp)}</span>
<p class="slip-ending">${esc(c.ending)}</p>
<a href="${c.href}">read the case →</a>`;
        slip.classList.remove("away");
      },
      first ? 0 : dur - 150,
    );
  }
  const step = (d) => {
    stage.classList.add("turned");
    show(Math.max(0, Math.min(cases.length - 1, at + d)));
  };

  // drag the handle round: each half turn moves the film one case
  let drag = null;
  crank.addEventListener("pointerdown", (e) => {
    const r = crank.getBoundingClientRect();
    drag = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, last: null, sum: 0, moved: 0 };
    crank.setPointerCapture(e.pointerId);
  });
  crank.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const a = (Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180) / Math.PI;
    if (drag.last !== null) {
      let d = a - drag.last;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      drag.sum += d;
      drag.moved += Math.abs(d);
      crank.style.setProperty("--turn", `${turns * 360 + drag.sum}deg`);
      if (Math.abs(drag.sum) > 180) {
        step(drag.sum > 0 ? 1 : -1);
        drag.sum = 0;
      }
    }
    drag.last = a;
  });
  crank.addEventListener("pointerup", () => {
    if (drag && drag.moved < 10) step(1); // a plain click turns it once
    drag = null;
  });
  crank.addEventListener("keydown", (e) => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (k) {
      e.preventDefault();
      step(k);
    }
    if (e.key === "Home") (e.preventDefault(), show(0));
    if (e.key === "End") (e.preventDefault(), show(cases.length - 1));
  });
  document.querySelectorAll("[data-step]").forEach((b) => (b.onclick = () => step(Number(b.dataset.step))));
  strip.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) {
      stage.classList.add("turned");
      show(Number(b.dataset.i));
    }
  });

  // ---------- the card catalogue ----------
  const groups = window.SKY_GROUPS;
  $(".tally").innerHTML = groups
    .map((g) => `<span class="v-${g.key}"><b>${cases.filter((c) => c.group === g.key).length}</b> ${g.plural}</span>`)
    .join("");
  $(".card-catalog").innerHTML = cases
    .map((c) => {
      const s = scans[c.id];
      return `<li class="index-card v-${c.verdict}">
  <div class="ic-scan">${s ? `<img src="${s.src}" alt="" loading="lazy" style="object-position:50% ${Math.round((s.brackets[0][0] / s.h) * 100)}%">` : `<span class="ic-noscan">No newspaper scan. The record is ${esc(c.sources[0].label.split(",").slice(0, 2).join(","))}.</span>`}</div>
  <div class="ic-body">
    <p class="ic-line">${esc(c.place)} · ${c.year}</p>
    <h3><a href="${c.href}">${esc(c.headline)}</a></h3>
    <span class="stamp">${esc(c.stamp)}</span>
  </div>
</li>`;
    })
    .join("");

  // open on Thomson, the one that changed the record
  show(Math.max(0, cases.findIndex((c) => c.id === "thomson")), true);
})();
