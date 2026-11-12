// shared by every page: light or dark (the system's choice unless someone picks), and marking
// the current page in the masthead
(() => {
  const root = document.documentElement;
  let saved = null;
  try {
    saved = localStorage.getItem("sky-theme-v2");
  } catch {}
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;

  document.addEventListener("DOMContentLoaded", () => {
    const here = location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
    document.querySelectorAll(".mast nav a").forEach((a) => {
      const to = a.getAttribute("href");
      if (to === here || (to === "/#cases" && here.startsWith("/cases"))) a.setAttribute("aria-current", "page");
    });
    const b = document.querySelector(".theme");
    if (!b) return;
    const dark = () => (root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
    const label = () => (b.textContent = dark() ? "Light pages" : "Dark pages");
    label();
    b.addEventListener("click", () => {
      root.dataset.theme = dark() ? "light" : "dark";
      try {
        localStorage.setItem("sky-theme-v2", root.dataset.theme);
      } catch {}
      label();
    });
  });

  // paint a canvas from the scene list; small ones wait until they're near the screen
  window.paintScene = (canvas, id, opts = {}) => {
    const s = (window.SKY_SCENES || {})[id];
    if (!s || !window.Painter) return;
    const go = () => Painter.paint(canvas, s.scene, { seed: s.seed, ...opts });
    if (!opts.lazy || !("IntersectionObserver" in window)) return go();
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        (window.requestIdleCallback || setTimeout)(go);
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(canvas);
  };
})();
