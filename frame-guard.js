(() => {
  let allowed = false;
  try {
    allowed = window.self === window.top;
  } catch {
    // Keep the page hidden if its embedding context cannot be determined.
  }
  document.documentElement.dataset.frameState = allowed ? "allowed" : "blocked";
  if (allowed) {
    document.addEventListener("DOMContentLoaded", () => {
      document.body.hidden = false;
    }, { once: true });
  }
})();
