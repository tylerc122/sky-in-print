(() => {
  "use strict";
  const D = window.SKY_DATA,
    all = [...D.falls, ...D.events],
    $ = (s) => document.querySelector(s);
  let layer = "all",
    status = "all",
    query = "",
    lo = 1770,
    hi = 1964,
    selected = "saco";
  const colors = {
    "under investigation": "var(--accent)",
    recognized: "var(--aqua)",
    hoax: "var(--red)",
    "likely hoax": "var(--violet)",
    "not a meteorite": "var(--muted)",
    unresolved: "var(--muted)",
  };
  const color = (d) =>
    d.kind === "fireball" ? "var(--text)" : colors[d.status];
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const url = (s) => (s.startsWith("evidence/") ? "data/" + s : s);
  const features = topojson
    .feature(SKY_GEOGRAPHY, SKY_GEOGRAPHY.objects.states)
    .features.filter(
      (d) => !["02", "15", "72"].includes(String(d.id).padStart(2, "0")),
    );
  const projection = d3.geoAlbersUsa().fitExtent(
    [
      [35, 55],
      [965, 510],
    ],
    { type: "FeatureCollection", features },
  );
  const path = d3.geoPath(projection),
    svg = d3.select("#atlas-map"),
    g = svg.append("g");
  g.selectAll(".state")
    .data(features)
    .join("path")
    .attr("class", "state")
    .attr("d", path);
  const dots = g.append("g");
  const zoom = d3
    .zoom()
    .scaleExtent([1, 5])
    .translateExtent([
      [-200, -150],
      [1200, 710],
    ])
    .on("zoom", (e) => g.attr("transform", e.transform));
  svg.call(zoom).on("dblclick.zoom", null).on("wheel.zoom", null);
  $("#zoom-in").onclick = () => svg.call(zoom.scaleBy, 1.5);
  $("#zoom-out").onclick = () => svg.call(zoom.scaleBy, 1 / 1.5);
  $("#zoom-reset").onclick = () => svg.call(zoom.transform, d3.zoomIdentity);
  Object.keys(D.statuses).forEach((s) => {
    const o = document.createElement("option");
    o.value = s;
    o.textContent = s[0].toUpperCase() + s.slice(1);
    $("#status-filter").append(o);
  });
  function select(d, focus = false) {
    selected = d.id;
    const detail = $("#detail");
    detail.innerHTML = `<span class="status" style="--status-color:${color(d)}">${esc(d.status)}</span><h3>${esc(d.place)}</h3><div class="date">${esc(d.date_lo)}${d.date_hi !== d.date_lo ? " to " + esc(d.date_hi) : ""} · ${d.kind === "fall" ? "Fall case" : "Fireball group"}</div><p>${esc(d.summary)}</p>${d.quote ? `<blockquote>“${esc(d.quote)}”</blockquote>` : ""}${d.sources
      .slice(0, 3)
      .map(
        (s) =>
          `<a class="source-link" href="${esc(url(s.url))}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`,
      )
      .join("")}${
      d.quotes?.length
        ? `<details><summary>Read witness excerpts</summary>${d.quotes
            .slice(0, 3)
            .map(
              (q) =>
                `<blockquote>“${esc(q.quote)}”</blockquote><p class="date">Uncorrected OCR · ${esc(q.date)}</p><a class="source-link" href="${esc(q.url)}" target="_blank" rel="noopener">Read the newspaper page ↗</a>`,
            )
            .join("")}</details>`
        : ""
    }${d.story ? `<a class="button-link" href="stories.html#${d.story}">Follow the whole story ↗</a>` : ""}${d.kind === "fireball" && d.date_lo === "1876-12-21" ? '<a class="button-link" href="fireball.html">Explore the reconstruction ↗</a>' : ""}<p class="location-note">${esc(d.location_basis)}${d.kind === "fireball" && !d.dated ? " Date not securely resolved." : ""}</p>`;
    const nearby = filtered().filter((x) => x.lat === d.lat && x.lon === d.lon);
    if (nearby.length > 1) {
      const next = document.createElement("button");
      next.className = "same-town";
      next.textContent = `${nearby.findIndex((x) => x.id === d.id) + 1} of ${nearby.length} at this map point · Next →`;
      next.onclick = () =>
        select(
          nearby[(nearby.findIndex((x) => x.id === d.id) + 1) % nearby.length],
        );
      detail.append(next);
    }
    dots.selectAll(".map-dot").classed("selected", (x) => x.id === selected);
    if (focus) {
      detail.focus({ preventScroll: true });
      detail.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "nearest",
      });
    }
  }
  function filtered() {
    return all.filter(
      (d) =>
        d.year <= hi &&
        Number(d.date_hi.slice(0, 4)) >= lo &&
        (layer === "all" || d.kind === layer) &&
        (status === "all" || (d.kind === "fall" && d.status === status)) &&
        (!query ||
          [d.place, d.date_lo, d.summary, ...(d.cities || [])]
            .join(" ")
            .toLowerCase()
            .includes(query)),
    );
  }
  function render() {
    const rows = filtered(),
      mapped = rows.filter((d) => d.lat !== null && projection([d.lon, d.lat]));
    $("#result-count").textContent =
      `${rows.length} records · ${mapped.length} mapped`;
    $("#list-summary").textContent =
      `Browse ${rows.length} reports · keyboard-friendly list`;
    const sorted = [...mapped].sort(
      (a, b) => (a.kind === "fall") - (b.kind === "fall"),
    );
    const marks = dots
      .selectAll("g.pin")
      .data(sorted, (d) => d.id)
      .join((enter) => {
        // dots set in chronologically on first draw (style.css .map-dot uses --i as a delay step)
        const p = enter
          .append("g")
          .attr("class", "pin")
          .style("--i", (d) => Math.round(((d.year - 1770) / 194) * 110));
        p.append("circle").attr("class", "point-target").attr("r", 12);
        p.append("circle").attr("class", "map-dot");
        p.append("title");
        return p;
      })
      .attr("transform", (d) => `translate(${projection([d.lon, d.lat])})`)
      .attr("role", "button")
      .attr("tabindex", 0)
      .attr("aria-label", (d) => `${d.place}, ${d.date_lo}, ${d.status}`)
      .on("click", (e, d) => select(d))
      .on("keydown", (e, d) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select(d, true);
        }
      });
    marks
      .select(".map-dot")
      .attr("r", (d) =>
        d.kind === "fall"
          ? 6
          : Math.min(14, 2.8 + Math.sqrt(d.independent_cities) * 1.5),
      )
      .attr("fill", color)
      .attr("opacity", (d) => (d.kind === "fall" ? 1 : 0.6))
      .classed("selected", (d) => d.id === selected);
    marks
      .select("title")
      .text((d) => `${d.place} · ${d.date_lo} · ${d.status}`);
    const list = $("#result-list");
    list.replaceChildren();
    for (const d of [...rows].sort((a, b) =>
      a.date_lo.localeCompare(b.date_lo),
    )) {
      const b = document.createElement("button");
      b.className = "result-row";
      b.innerHTML = `<span>${esc(d.place)}<small>${esc(d.date_lo)} · ${esc(d.status)}${d.lat === null ? " · not mapped" : ""}</small></span><span class="arrow" aria-hidden="true">↗</span>`;
      b.onclick = () => select(d, true);
      list.append(b);
    }
    if (!rows.length) {
      list.innerHTML =
        '<p class="empty">No reports match these filters. Try a wider date range or reset the filters.</p>';
      $("#detail").innerHTML =
        "<h3>No matching reports</h3><p>Change the filters to explore the archive.</p>";
    } else select(rows.find((d) => d.id === selected) || rows[0]);
  }
  $(".segmented").addEventListener("click", (e) => {
    const b = e.target.closest("[data-layer]");
    if (!b) return;
    layer = b.dataset.layer;
    if (layer === "fireball") {
      status = "all";
      $("#status-filter").value = "all";
    }
    document
      .querySelectorAll("[data-layer]")
      .forEach((x) => x.setAttribute("aria-pressed", x === b));
    render();
  });
  $("#status-filter").onchange = (e) => {
    status = e.target.value;
    if (status !== "all") {
      layer = "fall";
      document
        .querySelectorAll("[data-layer]")
        .forEach((x) =>
          x.setAttribute("aria-pressed", x.dataset.layer === layer),
        );
    }
    render();
  };
  $("#search").oninput = (e) => {
    query = e.target.value.trim().toLowerCase();
    render();
  };
  const x = d3.scaleLinear().domain([1770, 1965]).range([8, 1092]),
    timeline = d3.select("#timeline");
  const hist = d3.rollup(
      all,
      (v) => v.length,
      (d) => d.year,
    ),
    y = d3
      .scaleSqrt()
      .domain([0, d3.max(hist.values()) || 1])
      .range([75, 7]);
  timeline
    .selectAll(".bar")
    .data([...hist])
    .join("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d[0]))
    .attr("y", (d) => y(d[1]))
    .attr("width", Math.max(2, x(1771) - x(1770) - 1))
    .attr("height", (d) => 75 - y(d[1]))
    .attr("fill", "var(--accent)")
    .append("title")
    .text((d) => `${d[0]}: ${d[1]} records; not a meteor frequency`);
  const axisGroup = timeline
    .append("g")
    .attr("transform", "translate(0,81)")
    .call(
      d3
        .axisBottom(x)
        .tickValues([1770, 1800, 1830, 1860, 1890, 1920, 1964])
        .tickFormat(d3.format("d"))
        .tickSize(0),
    );
  const brush = d3
    .brushX()
    .extent([
      [8, 0],
      [1092, 78],
    ])
    .on("end", (e) => {
      if (!e.sourceEvent) return;
      if (e.selection) {
        lo = Math.max(1770, Math.floor(x.invert(e.selection[0])));
        hi = Math.min(1964, Math.floor(x.invert(e.selection[1])));
      } else {
        lo = 1770;
        hi = 1964;
      }
      sync(false);
      render();
    });
  const brushG = timeline.append("g").call(brush);
  function sync(move = true) {
    $("#year-from").value = lo;
    $("#year-to").value = hi;
    if (move)
      brushG.call(
        brush.move,
        lo === 1770 && hi === 1964 ? null : [x(lo), x(hi + 1)],
      );
  }
  const applyYears = () => {
    lo = Math.max(
      1770,
      Math.min(1964, Math.round(Number($("#year-from").value) || 1770)),
    );
    hi = Math.max(
      lo,
      Math.min(1964, Math.round(Number($("#year-to").value) || 1964)),
    );
    sync();
    render();
  };
  for (const selector of ["#year-from", "#year-to"]) {
    const input = $(selector);
    input.onchange = applyYears;
    input.oninput = () => {
      if (input.value.length === 4 && input.validity.valid) applyYears();
    };
  }
  $("#reset-filters").onclick = () => {
    lo = 1770;
    hi = 1964;
    layer = status = "all";
    query = "";
    $("#search").value = "";
    $("#status-filter").value = "all";
    document
      .querySelectorAll("[data-layer]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", b.dataset.layer === "all"),
      );
    sync();
    render();
  };
  const coverage = d3.select("#coverage"),
    byYear = new Map(D.coverage.map((d) => [d.year, d]));
  const coverageRows = d3
    .range(1770, 1965)
    .map((year) => byYear.get(year) || { year, newspapers: null });
  const cy = d3
    .scaleLinear()
    .domain([0, d3.max(D.coverage, (d) => d.newspapers) || 1])
    .range([37, 5]);
  coverage
    .append("path")
    .datum(coverageRows)
    .attr(
      "d",
      d3
        .line()
        .defined((d) => d.newspapers !== null)
        .x((d) => x(d.year))
        .y((d) => cy(d.newspapers)),
    )
    .attr("fill", "none")
    .attr("stroke", "var(--muted)")
    .attr("stroke-width", 1.5);
  coverage
    .selectAll("circle")
    .data(D.coverage)
    .join("circle")
    .attr("cx", (d) => x(d.year))
    .attr("cy", (d) => cy(d.newspapers))
    .attr("r", 2)
    .attr("fill", "var(--muted)")
    .append("title")
    .text(
      (d) =>
        `${d.year}: ${d.newspapers} newspaper titles; ${Number(d.articles).toLocaleString()} articles`,
    );
  if (!D.coverage.length)
    coverage
      .append("text")
      .attr("x", 8)
      .attr("y", 25)
      .text("Coverage statistics unavailable in this local export.");
  let chartWidth = 0;
  function sizeCharts() {
    const width = Math.max(280, Math.round($("#timeline").clientWidth));
    if (width === chartWidth) return;
    chartWidth = width;
    x.range([16, width - 16]);
    timeline.attr("viewBox", `0 0 ${width} 105`);
    coverage.attr("viewBox", `0 0 ${width} 45`);
    timeline
      .selectAll(".bar")
      .attr("x", (d) => x(d[0]))
      .attr("width", Math.max(1, x(1771) - x(1770) - 0.5));
    axisGroup.call(
      d3
        .axisBottom(x)
        .tickValues(
          width < 600
            ? [1770, 1820, 1870, 1920, 1964]
            : [1770, 1800, 1830, 1860, 1890, 1920, 1964],
        )
        .tickFormat(d3.format("d"))
        .tickSize(0),
    );
    brush.extent([
      [16, 0],
      [width - 16, 78],
    ]);
    brushG.call(brush);
    coverage.select("path").attr(
      "d",
      d3
        .line()
        .defined((d) => d.newspapers !== null)
        .x((d) => x(d.year))
        .y((d) => cy(d.newspapers)),
    );
    coverage.selectAll("circle").attr("cx", (d) => x(d.year));
    sync();
  }
  sizeCharts();
  new ResizeObserver(sizeCharts).observe($("#timeline").parentElement);
  render();
})();
