/* Header hamburger menu — shared across all pages */
(function () {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("site-menu");
  if (!toggle || !menu) return;
  const closeBtn = menu.querySelector(".menu-close");

  function open() {
    document.body.classList.add("menu-open");
    menu.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
  }
  function close() {
    document.body.classList.remove("menu-open");
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () =>
    document.body.classList.contains("menu-open") ? close() : open()
  );
  if (closeBtn) closeBtn.addEventListener("click", close);
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

/* Reveal-on-scroll — weightier scroll feel as new sections enter. Skipped on the
   order flow (panta.html): its panels are shown/hidden by panta.js, not scrolled into. */
(function () {
  if (document.querySelector(".order")) return;
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => io.observe(el));
})();
