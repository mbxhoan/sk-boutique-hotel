/* SK Boutique Blog — shared scripts */
(function () {
  const root = document.documentElement;

  /* ----- Theme ----- */
  const THEME_KEY = "sk-blog-theme";
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") root.setAttribute("data-theme", "dark");

  window.toggleTheme = function () {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    if (next === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    localStorage.setItem(THEME_KEY, next);
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
  };

  /* ----- Language ----- */
  const LANG_KEY = "sk-blog-lang";
  const savedLang = localStorage.getItem(LANG_KEY) || "vi";
  root.setAttribute("data-lang", savedLang);

  window.setLang = function (lang) {
    root.setAttribute("data-lang", lang);
    localStorage.setItem(LANG_KEY, lang);
    document.querySelectorAll("[data-vi]").forEach((el) => {
      const next = el.getAttribute(lang === "vi" ? "data-vi" : "data-en");
      if (next != null) el.textContent = next;
    });
    document.querySelectorAll(".lang-toggle button").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.lang === lang);
    });
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  };

  /* ----- Reveal on scroll ----- */
  function initReveal() {
    root.classList.add("js-ready");
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ----- Init ----- */
  document.addEventListener("DOMContentLoaded", () => {
    // Apply persisted language to all data-vi elements
    document.querySelectorAll("[data-vi]").forEach((el) => {
      const next = el.getAttribute(savedLang === "vi" ? "data-vi" : "data-en");
      if (next != null) el.textContent = next;
    });
    document.querySelectorAll(".lang-toggle button").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.lang === savedLang);
    });
    initReveal();
  });
})();
