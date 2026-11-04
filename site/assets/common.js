(() => {
  const root = document.documentElement;
  const meta = () => document.querySelector('meta[name="theme-color"]');
  const paint = () => {
    const m = meta();
    if (m) m.content = root.dataset.theme === "dark" ? "#0b1020" : "#f6f1e7";
  };
  // a saved choice wins; otherwise the day edition, warm paper
  let saved = null;
  try {
    saved = localStorage.getItem("sky-theme");
  } catch {}
  root.dataset.theme = saved || "light";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // split a heading into words that rise out of a mask, one after another
  function split(el) {
    const words = [];
    const walk = (node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.append(" ");
            const w = document.createElement("span"),
              inner = document.createElement("span");
            w.className = "w";
            inner.className = "wi";
            inner.textContent = part;
            w.append(inner);
            words.push(inner);
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      }
    };
    walk(el);
    words.forEach((w, i) => w.style.setProperty("--wi", i));
    // once the words have landed, drop the masks so glows and descenders aren't clipped
    new MutationObserver((_, mo) => {
      if (!el.classList.contains("is-in")) return;
      mo.disconnect();
      setTimeout(() => el.classList.add("landed"), words.length * 55 + 1300);
    }).observe(el, { attributes: true, attributeFilter: ["class"] });
  }

  // count a number up from zero when it scrolls in
  function count(el) {
    const end = Number(el.dataset.count),
      dec = Number(el.dataset.decimals || 0),
      suffix = el.dataset.suffix || "",
      fmt = (v) =>
        v.toLocaleString("en-US", {
          minimumFractionDigits: dec,
          maximumFractionDigits: dec,
        }) + suffix;
    if (reduce || !end) return (el.textContent = fmt(end));
    const t0 = performance.now(),
      dur = 1800;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur),
        e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(dec ? end * e : Math.round(end * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  document.addEventListener("DOMContentLoaded", () => {
    paint();
    const button = document.querySelector(".theme");
    const update = () => {
      button.textContent =
        root.dataset.theme === "dark" ? "☼ Day edition" : "☾ Night edition";
      button.setAttribute(
        "aria-label",
        "Switch to " +
          (root.dataset.theme === "dark" ? "light" : "dark") +
          " mode",
      );
    };
    update();
    button.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("sky-theme", root.dataset.theme);
      } catch {}
      update();
      paint();
    });

    // the masthead turns to frosted glass once the page leaves the sky; a hairline tracks progress
    const bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.append(bar);
    const onScroll = () => {
      document.body.classList.toggle("scrolled", scrollY > 24);
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    document.querySelectorAll("[data-split]").forEach(split);
    // the opening title plays on load rather than on scroll
    setTimeout(
      () =>
        document
          .querySelectorAll(".page-head [data-split], .case-head [data-split]")
          .forEach((el) => el.classList.add("is-in")),
      reduce ? 0 : 250,
    );

    // scroll reveal: sections set in as they reach the viewport, siblings staggered
    const targets = document.querySelectorAll(
      ".thomson-story > *, .all-cases > h2, .index-card, .how > *, .also > a, .case-main > section, .case-side, .section-head, .toolbar, .atlas-layout, .legend, .timeline-box, .results, .feature, .story-row, .article, .method-grid > *, .method-step, .track-stage, .track-facts > *, .evidence-wrap, footer",
    );
    const splits = document.querySelectorAll("main [data-split]:not(.page-head [data-split], .case-head [data-split])");
    const counts = document.querySelectorAll("[data-count]");
    if (!("IntersectionObserver" in window) || reduce) {
      root.classList.add("no-reveal");
      splits.forEach((el) => el.classList.add("is-in"));
      counts.forEach(count);
      return;
    }
    const seen = new Map();
    for (const el of targets) {
      const parent = el.parentElement;
      const i = seen.get(parent) || 0;
      seen.set(parent, i + 1);
      el.style.setProperty("--d", Math.min(i, 5) * 90 + "ms");
      el.classList.add("reveal");
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          e.target.querySelectorAll?.("[data-count]").forEach(count);
          if (e.target.matches("[data-count]")) count(e.target);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    targets.forEach((el) => io.observe(el));
    splits.forEach((el) => io.observe(el));
    // if the observer is slow to report (background tabs, some embedded browsers), never leave on-screen content hidden
    setTimeout(() => {
      for (const el of [...targets, ...splits])
        if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < innerHeight) {
          el.classList.add("is-in");
          io.unobserve(el);
        }
    }, 1600);
  });
})();
