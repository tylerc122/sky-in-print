(() => {
  const t = SKY_DATA.track;
  const features = topojson
    .feature(SKY_GEOGRAPHY, SKY_GEOGRAPHY.objects.states)
    .features.filter(
      (d) => !["02", "15", "72"].includes(String(d.id).padStart(2, "0")),
    );
  const projection = d3
    .geoConicConformal()
    .parallels([33, 45])
    .rotate([90, 0])
    .center([0, 40])
    .scale(3900)
    .translate([490, 280]);
  const path = d3.geoPath(projection),
    svg = d3.select("#track-map");
  svg
    .selectAll(".state")
    .data(features)
    .join("path")
    .attr("class", "state")
    .attr("d", path);
  const mq = matchMedia("(max-width: 760px)");
  const resize = () =>
    svg.attr("viewBox", mq.matches ? "320 160 530 255" : "0 0 1200 520");
  resize();
  mq.addEventListener("change", resize);
  const stateLabels = [
    ["MISSOURI", -92.4, 38.2],
    ["ILLINOIS", -89.4, 38.8],
    ["INDIANA", -86, 39.5],
    ["IOWA", -92.2, 41.9],
    ["OHIO", -83.4, 40.3],
  ];
  svg
    .selectAll(".state-label")
    .data(stateLabels)
    .join("text")
    .attr("x", (d) => projection([d[1], d[2]])[0])
    .attr("y", (d) => projection([d[1], d[2]])[1])
    .attr("fill", "var(--muted)")
    .attr("font-size", 11)
    .attr("letter-spacing", 3)
    .text((d) => d[0]);
  const geo = { type: "LineString", coordinates: t.coordinates };
  svg.append("path").attr("class", "track-halo").attr("d", path(geo));
  const line = svg
    .append("path")
    .attr("class", "track-line")
    .attr("d", path(geo));
  const offsets = [
    [-20, 29],
    [-50, -19],
    [-62, -36],
    [-72, 23],
    [-45, -25],
    [-5, 38],
    [-15, -24],
  ];
  const sourceLinks = [
    "https://www.loc.gov/resource/sn89067274/1876-12-28/ed-1/?sp=1",
    "https://www.loc.gov/resource/sn83025667/1877-01-20/ed-1/?sp=1",
    "https://www.loc.gov/resource/sn83030272/1876-12-31/ed-1/?sp=6",
    "https://www.loc.gov/resource/sn83025667/1877-01-20/ed-1/?sp=1",
    "https://www.loc.gov/resource/sn83025667/1877-01-20/ed-1/?sp=1",
    "https://www.loc.gov/resource/sn84027670/1876-12-28/ed-1/?sp=1",
    "https://www.loc.gov/resource/sn83025667/1877-01-20/ed-1/?sp=1",
  ];
  t.witnesses.forEach((d, i) => {
    const [x, y] = projection([d.lon, d.lat]);
    svg
      .append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 5)
      .attr("fill", "var(--accent)");
    svg
      .append("line")
      .attr("x1", x)
      .attr("y1", y)
      .attr("x2", x + offsets[i][0] + 10)
      .attr("y2", y + offsets[i][1] - 4)
      .attr("stroke", "var(--muted)")
      .attr("stroke-width", 0.5);
    svg
      .append("text")
      .attr("class", "point-label")
      .attr("x", x + offsets[i][0])
      .attr("y", y + offsets[i][1])
      .text(d.place.split(",")[0]);
    const row = document.createElement("tr");
    const residual = t.fit_residuals_km[d.place];
    row.innerHTML = `<th scope="row">${d.place}</th><td>${Math.abs(residual)} km ${residual < 0 ? "south" : "north"}</td><td><a href="${sourceLinks[i]}" target="_blank" rel="noopener">${d.source} ↗</a></td>`;
    document.getElementById("witness-rows").append(row);
  });
  const r = projection([t.rochester.lon, t.rochester.lat]);
  svg
    .append("path")
    .attr("d", d3.symbol().type(d3.symbolDiamond).size(115)())
    .attr("transform", `translate(${r})`)
    .attr("fill", "var(--aqua)");
  svg
    .append("text")
    .attr("class", "point-label")
    .attr("x", r[0] + 13)
    .attr("y", r[1] + 27)
    .text("Rochester");
  svg
    .append("text")
    .attr("x", r[0] + 13)
    .attr("y", r[1] + 45)
    .attr("fill", "var(--aqua)")
    .attr("font-size", 11)
    .text("17 km south · held out of fit");
  const meteor = svg
    .append("circle")
    .attr("class", "track-marker")
    .attr("r", 5)
    .attr("opacity", 0);
  let frame;
  document.getElementById("replay").onclick = () => {
    cancelAnimationFrame(frame);
    const announce = document.getElementById("track-announcement");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      announce.textContent =
        "Full path shown. Animation disabled for reduced motion.";
      return;
    }
    announce.textContent = "Following the fitted ground track";
    const len = line.node().getTotalLength(),
      start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / 4000),
        point = line.node().getPointAtLength(progress * len);
      meteor
        .attr("cx", point.x)
        .attr("cy", point.y)
        .attr("opacity", progress < 1 ? 1 : 0);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else
        announce.textContent =
          "Path complete. Rochester remains an independent check.";
    }
    frame = requestAnimationFrame(tick);
  };
})();
