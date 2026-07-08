/* Panta drykki — 3-step ordering flow (front-end prototype) */
(function () {
  // Placeholder prices — edit freely.
  const BEER_PRICE = 450;
  const WATER_PRICE = 250;

  const products = [
    { id: "lite", name: "Lite", cat: "bjor", price: BEER_PRICE, img: "assets/beers/lite.png" },
    { id: "classic", name: "Classic", cat: "bjor", price: BEER_PRICE, img: "assets/beers/classic.png" },
    { id: "vaegur", name: "Vægur", cat: "bjor", price: BEER_PRICE, img: "assets/beers/vaegur.png" },
    { id: "whiteale", name: "White Ale", cat: "bjor", price: BEER_PRICE, img: "assets/beers/whiteale.png" },
    { id: "premium", name: "Premium Lager", cat: "bjor", price: BEER_PRICE, img: "assets/beers/premium-lager.png" },
    { id: "redale", name: "Red Ale", cat: "bjor", price: BEER_PRICE, img: "assets/beers/redale.png" },
    { id: "lager", name: "Lager", cat: "bjor", price: BEER_PRICE, img: "assets/beers/lager.png" },
    { id: "ipa", name: "Session IPA", cat: "bjor", price: BEER_PRICE, img: "assets/beers/session-ipa.png" },
    { id: "vatn", name: "Kolsýrt vatn", cat: "vatn", price: WATER_PRICE, img: "assets/img/vatn-plain.png" },
    { id: "vatn-lime", name: "Kolsýrt vatn — Lime", cat: "vatn", price: WATER_PRICE, img: "assets/img/vatn-lime.png" },
  ];
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));

  const cart = {}; // id -> qty
  let filter = "all";
  let verified = false;
  let pickupDay = null;
  let pickupTime = null;

  const $ = (s) => document.querySelector(s);
  const kr = (n) => n.toLocaleString("de-DE") + " kr"; // 1.350 kr
  const totalCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = () =>
    Object.entries(cart).reduce((a, [id, q]) => a + byId[id].price * q, 0);

  /* ---------- Step 1: grid ---------- */
  const grid = $("#order-grid");
  function renderGrid() {
    grid.innerHTML = products
      .filter((p) => filter === "all" || p.cat === filter)
      .map((p) => {
        const q = cart[p.id] || 0;
        return `
        <article class="prod${q ? " has-qty" : ""}" data-id="${p.id}">
          <div class="prod-img"><img src="${p.img}" alt="${p.name}" loading="lazy" /></div>
          <h3 class="prod-name">${p.name}</h3>
          <p class="prod-price">${kr(p.price)}</p>
          <div class="qty">
            <button class="qty-btn" type="button" data-act="dec" aria-label="Fækka">&minus;</button>
            <span class="qty-num">${q}</span>
            <button class="qty-btn" type="button" data-act="inc" aria-label="Fjölga">&plus;</button>
          </div>
        </article>`;
      })
      .join("");
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".qty-btn");
    if (!btn) return;
    const id = btn.closest(".prod").dataset.id;
    const cur = cart[id] || 0;
    const next = btn.dataset.act === "inc" ? cur + 1 : Math.max(0, cur - 1);
    if (next) cart[id] = next;
    else delete cart[id];
    renderGrid();
    updateBar();
  });

  $("#order-filters").addEventListener("click", (e) => {
    const b = e.target.closest(".filt");
    if (!b) return;
    filter = b.dataset.cat;
    document.querySelectorAll(".filt").forEach((f) => f.classList.toggle("is-active", f === b));
    renderGrid();
  });

  /* ---------- bottom bar ---------- */
  function updateBar() {
    const c = totalCount();
    $("#bar-count").textContent = c + (c === 1 ? " drykkur" : " drykkir");
    $("#bar-total").textContent = kr(totalPrice());
    $("#to-step2").disabled = c === 0;
  }

  /* ---------- Step 2: summary ---------- */
  function summaryHTML(withRemove) {
    const rows = Object.entries(cart)
      .map(([id, q]) => {
        const p = byId[id];
        return `<div class="sum-row" data-id="${id}">
          <img src="${p.img}" alt="" />
          <span class="sum-name">${p.name}</span>
          <span class="sum-qty">${q} ×</span>
          <span class="sum-line">${kr(p.price * q)}</span>
          ${withRemove ? `<button class="sum-remove" type="button" aria-label="Fjarlægja">&times;</button>` : ""}
        </div>`;
      })
      .join("");
    return `${rows}<div class="sum-total"><span>Samtals</span><span>${kr(totalPrice())}</span></div>`;
  }
  function renderSummary() {
    $("#order-summary").innerHTML = summaryHTML(true);
  }
  $("#order-summary").addEventListener("click", (e) => {
    const rm = e.target.closest(".sum-remove");
    if (!rm) return;
    delete cart[rm.closest(".sum-row").dataset.id];
    renderGrid();
    updateBar();
    if (totalCount() === 0) return goTo(1);
    renderSummary();
  });

  /* ---------- Step 2: simulated electronic-ID verification ---------- */
  const verifyBtn = $("#verify-btn");
  const verifyStatus = $("#verify-status");
  verifyBtn.addEventListener("click", () => {
    if (verified) return;
    verifyBtn.disabled = true;
    verifyBtn.textContent = "Augnablik — auðkenning í gangi…";
    verifyStatus.hidden = false;
    verifyStatus.className = "verify-status pending";
    verifyStatus.textContent = "Opnaðu Auðkennis-appið í símanum þínum…";
    setTimeout(() => {
      verified = true;
      verifyBtn.hidden = true;
      verifyStatus.className = "verify-status ok";
      verifyStatus.textContent = "✓ Auðkenning tókst — aldur staðfestur (20+).";
      $("#to-step3").disabled = false;
    }, 1800);
  });

  /* ---------- Step 3: pickup ---------- */
  const IS_DAYS = ["Sun", "Mán", "Þri", "Mið", "Fim", "Fös", "Lau"];
  const IS_MON = ["jan", "feb", "mar", "apr", "maí", "jún", "júl", "ágú", "sep", "okt", "nóv", "des"];
  function buildPickup() {
    const daysBox = $("#pickup-days");
    const days = [];
    const now = new Date();
    for (let i = 1; days.length < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      if (d.getDay() === 0) continue; // closed Sundays
      days.push(d);
    }
    daysBox.innerHTML = days
      .map(
        (d, i) =>
          `<button class="chip" type="button" data-day="${d.toISOString()}">${IS_DAYS[d.getDay()]} ${d.getDate()}. ${IS_MON[d.getMonth()]}</button>`
      )
      .join("");

    const times = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    $("#pickup-times").innerHTML = times
      .map((t) => `<button class="chip" type="button" data-time="${t}">${t}</button>`)
      .join("");
  }
  $("#pickup-days").addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    pickupDay = c.dataset.day;
    document.querySelectorAll("#pickup-days .chip").forEach((x) => x.classList.toggle("is-active", x === c));
    checkPickup();
  });
  $("#pickup-times").addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    pickupTime = c.dataset.time;
    document.querySelectorAll("#pickup-times .chip").forEach((x) => x.classList.toggle("is-active", x === c));
    checkPickup();
  });
  function checkPickup() {
    $("#finish-order").disabled = !(pickupDay && pickupTime);
  }
  function pickupLabel() {
    const d = new Date(pickupDay);
    return `${IS_DAYS[d.getDay()]} ${d.getDate()}. ${IS_MON[d.getMonth()]} kl. ${pickupTime}`;
  }

  $("#finish-order").addEventListener("click", () => {
    $("#done-summary").innerHTML = summaryHTML(false);
    $("#done-msg").textContent = `Sæktu drykkina ${pickupLabel()} í Ölvisholti. Greitt við afhendingu.`;
    goTo("done");
  });

  /* ---------- step navigation ---------- */
  function goTo(step) {
    document.querySelectorAll(".order-panel").forEach((p) => (p.hidden = p.dataset.panel !== String(step)));
    document.querySelectorAll(".order-steps li").forEach((li) => {
      li.classList.toggle("is-active", li.dataset.goto === String(step));
      const done = ["1", "2", "3"].indexOf(li.dataset.goto) < ["1", "2", "3"].indexOf(String(step));
      li.classList.toggle("is-done", done);
    });
    $("#order-bar").style.display = step === 1 ? "" : "none";
    if (step === 2) renderSummary();
    if (step === 3) buildPickup();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $("#to-step2").addEventListener("click", () => goTo(2));
  $("#to-step3").addEventListener("click", () => goTo(3));
  $("#order-steps").addEventListener("click", (e) => {
    const li = e.target.closest("li[data-goto]");
    if (!li) return;
    const target = li.dataset.goto;
    // only allow going back to already-reachable steps
    if (target === "1") goTo(1);
    else if (target === "2" && totalCount() > 0) goTo(2);
  });
  document.querySelectorAll("[data-goto]").forEach((el) => {
    if (el.tagName === "BUTTON") el.addEventListener("click", () => goTo(el.dataset.goto));
  });

  /* init */
  renderGrid();
  updateBar();
})();
