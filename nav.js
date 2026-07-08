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
