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

/* Footer bubbles — generate a livelier field of rising bubbles at the very
   bottom of every page. Replaces the previous 9 hand-authored spans; ~28 with
   varied size/speed/delay gives real movement without being noisy. */
(function () {
  const box = document.querySelector(".footer-bubbles");
  if (!box) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rand = (a, b) => a + Math.random() * (b - a);
  const N = 28;
  let html = "";
  for (let i = 0; i < N; i++) {
    const left = rand(2, 98);                 // spread edge to edge
    const size = rand(3, 9).toFixed(1);       // px
    const rise = -rand(120, 260).toFixed(0);  // how high it drifts
    const dur  = rand(4.5, 9).toFixed(1);
    const delay = (-Math.random() * dur).toFixed(1);
    html += `<span style="left:${left.toFixed(1)}%;width:${size}px;height:${size}px;--rise:${rise}px;animation-duration:${dur}s;animation-delay:${delay}s"></span>`;
  }
  box.innerHTML = html;
})();
