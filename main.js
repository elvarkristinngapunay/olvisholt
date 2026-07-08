// Canned beer lineup — bottle-only beers (Lava) removed.
// Descriptions verbatim from olvisholt.is; colors sampled from the can artwork.
const beers = [
  { name: "Lite",          abv: "4.2%", img: "assets/beers/lite.png",          color: "#6f9fc4",
    desc: "Mjúkur og léttur bjór. Svalandi og auðdrekkandi." },
  { name: "Classic",       abv: "4.7%", img: "assets/beers/classic.png",       color: "#c2933f",
    desc: "Classic Lager inniheldur ríkan keim af maltríkri karamellu og ristuðu brauði. Sætleiki úr malti, miðlungs fyllingu og gott eftirbragð." },
  { name: "Vægur",         abv: "1.9%", img: "assets/beers/vaegur.png",         color: "#b0a052",
    desc: "Svalandi léttur og auðdrekkandi lager bjór með lága áfengisprósentu." },
  { name: "White Ale",     abv: "4.5%", img: "assets/beers/whiteale.png",       color: "#2f86b0",
    desc: "Sítrus og kóríander skapa grípandi bragð. Frískandi bjór með karakter." },
  { name: "Premium Lager", abv: "5.0%", img: "assets/beers/premium-lager.png",  color: "#c9772f",
    desc: "Blanda af amerískum og evrópskum humlum. Maltríkur. Ölvisholt Premium Lager er bragðmikill bjór." },
  { name: "Red Ale",       abv: "5.5%", img: "assets/beers/redale.png",         color: "#b23b34",
    desc: "Ríkt maltbragð af kexi og karamellu af þessu hágerjaða öli, með blöndu af breskum og amerískum humlum. Vel fylltur bjór." },
  { name: "Lager",         abv: "4.6%", img: "assets/beers/lager.png",          color: "#d6a83a",
    desc: "Hreinn, maltaður, gulllitaður lager í þýskum stíl með mjúku, kornuðu og sætu maltbragði og mjúkri, þurri áferð. Létt kryddaðir og blómlegir humlar, frískandi og auðdrekkanlegur." },
  { name: "Session IPA",   abv: "4.6%", img: "assets/beers/session-ipa.png",    color: "#6aa84f",
    desc: "Bragðmikill en léttur IPA með sterkan humlakarakter ásamt apríkósu og mangó. Ósíaður fyrir aukið bragð en samt léttur og auðveldur að drekka." },
];

const N = beers.length;

/* ---------- Build carousel (circular coverflow) ---------- */
const carousel = document.getElementById("carousel");
const dotsWrap = document.getElementById("car-dots");
const exp = document.getElementById("beer-exp");
const panel = document.getElementById("beer-panel");

carousel.innerHTML = beers
  .map(
    (b, i) => `
    <button class="cslide" data-index="${i}" style="--brand:${b.color}" aria-label="${b.name} – nánar">
      <span class="cslide-name">${b.name}</span>
      <span class="cslide-tile"><img src="${b.img}" alt="${b.name}" draggable="false" /></span>
      <span class="cslide-abv">${b.abv}</span>
    </button>`
  )
  .join("");

dotsWrap.innerHTML = beers
  .map((_, i) => `<button class="car-dot" data-index="${i}" aria-label="Bjór ${i + 1}"></button>`)
  .join("");

const slides = [...carousel.querySelectorAll(".cslide")];
const dots = [...dotsWrap.querySelectorAll(".car-dot")];

let active = 0;
let openIndex = -1;

function spacing() {
  const w = window.innerWidth;
  if (w <= 420) return 168;
  if (w <= 720) return 210;
  if (w <= 1024) return 260;
  return 300;
}

// How far the cans slide apart to open the gap for the text card.
function spreadAmount() {
  const w = window.innerWidth;
  if (w <= 420) return 82;
  if (w <= 560) return 88;
  if (w <= 720) return 96;
  if (w <= 1024) return 150;
  return 182;
}

// Size + place the info card so it matches the can's tile (same height, a bit narrower).
function positionPanel() {
  if (openIndex < 0) return;
  const tile = slides[active].querySelector(".cslide-tile");
  const tw = tile.offsetWidth;
  const th = tile.offsetHeight;
  const gap = 14;
  const leftRel = -spreadAmount() + tw / 2 + gap; // just right of the shifted can
  panel.style.left = `calc(50% + ${leftRel}px)`;
  panel.style.width = Math.round(tw * 0.8) + "px";
  panel.style.height = th + "px";
  // Align the card's vertical centre to the tile's (the name above the tile offsets it).
  const expRect = exp.getBoundingClientRect();
  const tileRect = tile.getBoundingClientRect();
  panel.style.top = Math.round(tileRect.top + tileRect.height / 2 - expRect.top) + "px";
}

// Shortest circular offset of slide i from the active slide (…-2,-1,0,1,2…).
function offset(i) {
  let d = (i - active + N) % N;
  if (d > N / 2) d -= N;
  return d;
}

function render(extra = 0, instant = false) {
  const SP = spacing();
  // When the info is open, spread the cans apart to open a gap for the text.
  const spread = openIndex >= 0 ? spreadAmount() : 0;
  slides.forEach((s, i) => {
    const d = offset(i);
    const ad = Math.abs(d);
    const prev = s._d;
    // A slide that jumps to the far side (wrap-around) teleports while invisible.
    const wrapped = prev !== undefined && Math.abs(d - prev) >= 5;
    s.style.transition = instant || wrapped || dragging ? "none" : "";

    const scale = d === 0 ? 1 : ad === 1 ? 0.82 : ad === 2 ? 0.64 : 0.55;
    const op = ad === 0 ? 1 : ad === 1 ? 0.6 : ad === 2 ? 0.32 : 0;
    let x = d * SP + extra;
    if (spread) x += d <= 0 ? -spread : spread; // active + left slide left, right cans slide right
    s.style.transform = `translate(calc(-50% + ${x}px), -50%) scale(${scale})`;
    s.style.opacity = op;
    s.style.zIndex = String(10 - ad);
    s.style.pointerEvents = ad <= 2 ? "auto" : "none";
    s._d = d;

    if (wrapped) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!dragging) s.style.transition = "";
        })
      );
    }
  });
  slides.forEach((s, i) => s.classList.toggle("is-active", i === active));
  dots.forEach((dt, i) => dt.classList.toggle("is-active", i === active));
}

function fillPanel(i) {
  const b = beers[i];
  panel.style.setProperty("--brand", b.color);
  document.getElementById("panel-abv").textContent = b.abv;
  document.getElementById("panel-name").textContent = b.name;
  document.getElementById("panel-desc").textContent = b.desc;
}

/* Panel: cans spread apart and the info pops up beside the can (bottom sheet on mobile) */
function openPanel(i) {
  if (openIndex >= 0 && openIndex !== i) slides[openIndex].classList.remove("is-open");
  openIndex = i;
  slides[i].classList.add("is-open");
  exp.classList.add("panel-open");
  fillPanel(i);
  render();
  positionPanel();
}
function closePanel(rerender = true) {
  if (openIndex < 0) return;
  slides[openIndex].classList.remove("is-open");
  openIndex = -1;
  exp.classList.remove("panel-open");
  if (rerender) render();
}
document.getElementById("panel-close").addEventListener("click", () => closePanel());

/* Navigate the ring — always wraps, both directions, forever */
function go(dir) {
  closePanel(false);
  active = (active + dir + N) % N;
  render();
}
function goTo(i) {
  closePanel(false);
  active = ((i % N) + N) % N;
  render();
}

document.getElementById("car-prev").addEventListener("click", () => go(-1));
document.getElementById("car-next").addEventListener("click", () => go(1));
dots.forEach((d, i) => d.addEventListener("click", () => goTo(i)));

carousel.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
  else if (e.key === "Escape") closePanel();
});

/* Click a can: centre it and reveal its info (does not leave the page) */
slides.forEach((s) => {
  s.addEventListener("click", () => {
    if (suppressClick) return;
    const i = +s.dataset.index;
    if (i === active) {
      openIndex === i ? closePanel() : openPanel(i);
    } else {
      active = i;
      openPanel(i);
    }
  });
});

/* Drag / swipe (touch + mouse) — release past threshold moves one beer */
let dragging = false;
let startX = 0;
let dragDX = 0;
let moved = 0;
let suppressClick = false;

function onDown(x) {
  dragging = true;
  startX = x;
  dragDX = 0;
  moved = 0;
}
function onMove(x) {
  if (!dragging) return;
  dragDX = x - startX;
  moved = Math.max(moved, Math.abs(dragDX));
  render(dragDX);
}
function onUp() {
  if (!dragging) return;
  dragging = false;
  const threshold = Math.min(80, spacing() * 0.28);
  if (dragDX <= -threshold) go(1);
  else if (dragDX >= threshold) go(-1);
  else render(0);
  if (moved > 8) {
    suppressClick = true;
    setTimeout(() => (suppressClick = false), 60);
  }
}

carousel.addEventListener("pointerdown", (e) => {
  onDown(e.clientX);
});
window.addEventListener("pointermove", (e) => onMove(e.clientX));
window.addEventListener("pointerup", onUp);
carousel.addEventListener("dragstart", (e) => e.preventDefault());

/* Trackpad horizontal swipe */
let wheelLock = false;
carousel.addEventListener(
  "wheel",
  (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 12) {
      e.preventDefault();
      if (!wheelLock) {
        go(e.deltaX > 0 ? 1 : -1);
        wheelLock = true;
        setTimeout(() => (wheelLock = false), 380);
      }
    }
  },
  { passive: false }
);

window.addEventListener("resize", () => {
  render(0, true);
  positionPanel();
});

/* Init */
render(0, true);

/* Sódavatn — subtle fizzy sparkling particles around and above the cans */
(function fizz() {
  const box = document.querySelector(".aqua-fizz");
  if (!box) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const N = window.innerWidth <= 640 ? 20 : 34;
  const rnd = (a, b) => a + Math.random() * (b - a);
  let html = "";
  for (let i = 0; i < N; i++) {
    const left = rnd(28, 72);          // concentrated around the cans
    const size = rnd(2, 5).toFixed(1);
    const bottom = rnd(48, 150);       // start near the cans
    const rise = -rnd(150, 340);       // drift up and above
    const dx = rnd(-26, 26);
    const dur = rnd(5, 9).toFixed(1);
    const delay = (-Math.random() * dur).toFixed(1);
    html += `<span style="left:${left.toFixed(1)}%;bottom:${bottom.toFixed(0)}px;width:${size}px;height:${size}px;--rise:${rise.toFixed(0)}px;--dx:${dx.toFixed(0)}px;animation-duration:${dur}s;animation-delay:${delay}s"></span>`;
  }
  box.innerHTML = html;
})();

document.getElementById("year").textContent = new Date().getFullYear();
