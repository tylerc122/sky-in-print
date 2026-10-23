(() => {
  const root = document.documentElement;
  try {
    root.dataset.theme = localStorage.getItem("sky-theme") || "dark";
  } catch {}
  document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector(".theme");
    const update = () => {
      button.textContent =
        root.dataset.theme === "dark" ? "☼ Light mode" : "☾ Dark mode";
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
    });
  });
})();
