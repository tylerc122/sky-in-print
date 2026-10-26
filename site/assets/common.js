(() => {
  const root = document.documentElement;
  const meta = () => document.querySelector('meta[name="theme-color"]');
  const paint = () => {
    const m = meta();
    if (m) m.content = root.dataset.theme === "dark" ? "#0b1020" : "#f6f1e7";
  };
  // a saved choice wins; otherwise follow the system (newsprint by day, night sky by night)
  let saved = null;
  try {
    saved = localStorage.getItem("sky-theme");
  } catch {}
  root.dataset.theme =
    saved ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

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

    // scroll reveal: sections set in as they reach the viewport, siblings staggered
    const targets = document.querySelectorAll(
      ".latest, .section-head, .atlas-intro, .toolbar, .atlas-layout, .legend, .timeline-box, .results, .feature, .story-row, .article, .method-grid > *, .method-step, .track-stage, .track-facts > *, .evidence-wrap, footer",
    );
    if (
      !("IntersectionObserver" in window) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      root.classList.add("no-reveal");
      return;
    }
    const seen = new Map();
    for (const el of targets) {
      const parent = el.parentElement;
      const i = seen.get(parent) || 0;
      seen.set(parent, i + 1);
      el.style.setProperty("--d", Math.min(i, 5) * 70 + "ms");
      el.classList.add("reveal");
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    targets.forEach((el) => io.observe(el));
  });
})();
