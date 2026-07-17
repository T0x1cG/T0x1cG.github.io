(() => {
  const storageKey = "t0x1cg-theme";
  const root = document.documentElement;

  const readSavedTheme = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved === "light" || saved === "dark" ? saved : "dark";
    } catch {
      return "dark";
    }
  };

  const applyTheme = (theme, persist = false) => {
    const isDark = theme === "dark";
    root.dataset.theme = isDark ? "dark" : "light";

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = isDark ? "#0c1213" : "#edf2ef";

    const toggle = document.querySelector("#themeToggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
      const label = toggle.querySelector(".theme-toggle-label");
      if (label) label.textContent = isDark ? "DARK" : "LIGHT";
    }

    if (persist) {
      try {
        localStorage.setItem(storageKey, root.dataset.theme);
      } catch {
        // The selected theme still applies when storage is unavailable.
      }
    }
  };

  applyTheme(readSavedTheme());

  window.addEventListener("DOMContentLoaded", () => {
    applyTheme(root.dataset.theme);
    document.querySelector("#themeToggle")?.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
    });
    requestAnimationFrame(() => root.classList.add("theme-ready"));
  });
})();
