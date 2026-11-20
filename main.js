import * as THREE from 'three';

/* =========================================================
   StudySpot — showcase site
   ========================================================= */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const isMobile = () => matchMedia('(max-width: 900px)').matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
if (reduced) document.documentElement.classList.add('reduced');
if (!hasGsap) document.documentElement.classList.add('no-js');

/* ---------- Data (same spots as the app) ---------- */
const SPOTS = [
  { id: 'lab', name: 'The Lab Coworking', kind: 'Coworking', area: 'Paris 11e', img: 'lab.jpg', db: 24, seats: 3, price: 6, vibe: 'Cabines isolées' },
  { id: 'mazarine', name: 'Bibliothèque Mazarine', kind: 'Bibliothèque', area: 'Paris 6e', img: 'mazarine.jpg', db: 27, seats: 7, price: 0, vibe: 'Lampes vertes' },
  { id: 'sainte-genevieve', name: 'Bibliothèque Sainte-Geneviève', kind: 'Bibliothèque', area: 'Paris 5e', img: 'sainte-genevieve-hall.jpg', db: 28, seats: 12, price: 4, vibe: 'Voûtes XIXe' },
  { id: 'bnf', name: 'BNF François-Mitterrand', kind: 'Bibliothèque', area: 'Paris 13e', img: 'bnf.jpg', db: 29, seats: 64, price: 0, vibe: 'Immense' },
  { id: 'nationale', name: 'Bibliothèque Nationale', kind: 'Bibliothèque', area: 'Paris 2e', img: 'nationale.jpg', db: 30, seats: 28, price: 0, vibe: 'Salle Labrouste' },
  { id: 'archivolt', name: 'Archivolt Study Hall', kind: 'Bibliothèque', area: 'Paris 6e', img: 'archivolt-hall.jpg', db: 31, seats: 14, price: 0, vibe: 'Lumière zénithale' },
  { id: 'white-cube', name: 'The White Cube', kind: 'Coworking', area: 'Paris 3e', img: 'white-cube.jpg', db: 36, seats: 0, price: 6, vibe: 'Minimal' },
  { id: 'bpi', name: 'BPI Pompidou', kind: 'Bibliothèque', area: 'Paris 4e', img: 'bpi.jpg', db: 38, seats: 41, price: 0, vibe: 'Ouvert tard' },
  { id: 'atelier-verde', name: 'Atelier Verde', kind: 'Coworking', area: 'Paris 10e', img: 'green-atelier.jpg', db: 40, seats: 11, price: 5, vibe: 'Verrière' },
  { id: 'anticafe', name: 'Anticafé Beaubourg', kind: 'Café', area: 'Paris 3e', img: 'anticafe.jpg', db: 45, seats: 9, price: 4, vibe: 'Café illimité' },
  { id: 'urban-loft', name: 'Urban Loft Study', kind: 'Café', area: 'Paris 11e', img: 'urban-loft.jpg', db: 52, seats: 6, price: 3, vibe: 'Musique douce' },
];
const live = Object.fromEntries(SPOTS.map((s) => [s.id, { seats: s.seats, db: s.db }]));
const price = (p) => (p === 0 ? 'Gratuit' : `${p} €/h`);

/* ---------- Small SVG helpers ---------- */
const LOGO = (size, bg = '#0A0A0A', fg = '#fff') => `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true"><rect width="100" height="100" rx="28" fill="${bg}"/><path d="M50 24 L78 48 Q80 50 77 52 L72 52 L72 74 Q72 77 69 77 L58 77 L58 61 L42 61 L42 77 L31 77 Q28 77 28 74 L28 52 L23 52 Q20 50 22 48 Z" fill="${fg}"/></svg>`;
const ICON = {
  search: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  bell: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#0A0A0A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>',
};

/** Deterministic QR-style pattern (visual only), seeded by the booking code. */
function qrSVG(seed, n = 25) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967295;
  const finder = (x, y) => { for (const [fx, fy] of [[0, 0], [n - 7, 0], [0, n - 7]]) { const dx = x - fx, dy = y - fy; if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) return (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx > 1 && dx < 5 && dy > 1 && dy < 5)) ? 1 : 0; } return -1; };
  let rects = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const f = finder(x, y);
    const on = f === -1 ? ((x > 7 || y > 7) && !(x < 8 && y > n - 9) && !(x > n - 9 && y < 8) ? rnd() > 0.52 : 0) : f;
    if (on) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`;
  }
  return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" shape-rendering="crispEdges"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#fff"/><g fill="#0A0A0A">${rects}</g></svg>`;
}

/* ---------- App screens rendered inside the phones ---------- */
const now = new Date();
const todayLabel = now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' }).replace('.', '').toUpperCase();
const monthLabel = (() => { const s = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }); return s[0].toUpperCase() + s.slice(1); })();
const status = (dark) => `<div class="scr-status" ${dark ? 'style="color:#fff"' : ''}><span>9:41</span><span>●●● ▮</span></div>`;
const tabbar = '<div class="scr-tabbar"><i class="on"></i><i></i><i class="focus"></i><i></i><i></i></div>';

const SCREENS = {
  home: () => `<div class="scr">${status()}
    <div class="scr-row"><div class="scr-brand">${LOGO(20)} StudySpot</div><div class="scr-bell">${ICON.bell}</div></div>
    <div class="scr-over">BONJOUR ALEXANDRE · ${todayLabel}</div>
    <div class="scr-h">Trouve ton prochain espace de travail.</div>
    <div class="scr-search">${ICON.search} Bibliothèque, café, coworking…</div>
    <div class="scr-chips"><span class="scr-chip on">Tout voir</span><span class="scr-chip">Silencieux</span><span class="scr-chip">Cafés Wi‑Fi</span></div>
    <div class="scr-card"><img src="assets/archivolt-hall.jpg" alt=""><span class="rate">★ 4,8</span>
      <div class="cap"><span class="seat"><i></i><span data-live-seats="archivolt">14</span>&nbsp;PLACES LIBRES</span><b>Archivolt Study Hall</b></div></div>
    ${tabbar}</div>`,
  explore: () => `<div class="scr">${status()}
    <div class="scr-row"><div class="scr-h" style="font-size:20px">Explorer</div><div class="scr-bell" style="background:#0A0A0A;border-color:#0A0A0A">${ICON.sliders}</div></div>
    <div class="scr-search">${ICON.search} Bibliothèques à proximité</div>
    <div class="scr-map">
      <svg viewBox="0 0 268 140" preserveAspectRatio="none"><path d="M-10 96 C 60 70, 110 120, 170 92 S 260 60, 290 74" stroke="#CFD8DC" stroke-width="12" fill="none"/><path d="M0 40 H268 M0 118 H268 M60 0 V140 M150 0 V140 M220 0 V140" stroke="#fff" stroke-width="4"/></svg>
      <span class="scr-pin" style="left:16px;top:20px"><i></i><span data-live-seats="mazarine">7</span></span>
      <span class="scr-pin on" style="left:104px;top:52px"><i></i><span data-live-seats="archivolt">14</span></span>
      <span class="scr-pin" style="left:186px;top:22px"><i></i><span data-live-seats="bpi">41</span></span>
      <span class="scr-pin" style="left:200px;top:100px"><i></i><span data-live-seats="lab">3</span></span>
    </div>
    <div class="scr-lbl">11 ESPACES TROUVÉS</div>
    <div class="scr-list">
      ${['archivolt', 'sainte-genevieve', 'mazarine'].map((id) => { const s = SPOTS.find((x) => x.id === id); return `<div class="scr-item"><img src="assets/${s.img}" alt=""><div><span class="seat dark"><i></i><span data-live-seats="${id}">${s.seats}</span>&nbsp;PLACES</span><b>${s.name.replace('Bibliothèque ', 'Bibl. ')}</b><small>Silencieux · ${s.area}</small></div><span class="db"><span data-live-db="${id}">${s.db}</span> dB</span></div>`; }).join('')}
    </div></div>`,
  book: () => {
    const days = Array.from({ length: 5 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() + i); return d; });
    const dn = (d) => d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '').toUpperCase();
    return `<div class="scr">${status()}
    <div class="scr-row"><div class="scr-h" style="font-size:17px">‹&nbsp; Réserver</div><span style="font-weight:700;color:#8A8A8A">Sainte‑Geneviève</span></div>
    <b style="font-size:13px">${monthLabel}</b>
    <div class="scr-days">${days.map((d, i) => `<div class="scr-day ${i === 1 ? 'on' : ''}"><small>${dn(d)}</small>${d.getDate()}</div>`).join('')}</div>
    <div class="scr-err"><span class="ic">!</span><div><b>Ce créneau est complet.</b><p>15:00 est déjà réservé. Voici les créneaux libres les plus proches.</p></div></div>
    <div class="scr-lbl">CRÉNEAUX HORAIRES</div>
    <div class="scr-slots"><span class="scr-slot">10:00</span><span class="scr-slot full">11:00</span><span class="scr-slot">12:00</span><span class="scr-slot">13:00</span><span class="scr-slot on">14:00</span><span class="scr-slot err">15:00</span><span class="scr-slot full">16:00</span><span class="scr-slot">17:00</span><span class="scr-slot">18:00</span></div>
    <div class="scr-lbl green">DISPONIBILITÉS ALTERNATIVES</div>
    <div class="scr-slots"><span class="scr-slot alt">14:00</span><span class="scr-slot alt">17:00</span><span class="scr-slot alt">13:00</span></div>
    <div class="scr-btn">Confirmer · 8,00 €</div></div>`;
  },
  pass: () => `<div class="scr scr-pass">${status(true)}
    <div class="pass-check">✓</div>
    <div class="pass-title">Réservation confirmée</div>
    <div style="color:rgba(255,255,255,.6);margin-top:-6px">Ton pass t'attend. Bon focus !</div>
    <div class="pass-ticket">
      <div class="t-top"><b>Sainte‑Geneviève</b><span style="font-weight:800;color:#8A8A8A">#SS-6117</span></div>
      <div class="pass-grid"><div><small>DATE</small><span>${now.getDate() + 1} ${now.toLocaleDateString('fr-FR', { month: 'short' })}</span></div><div><small>CRÉNEAU</small><span>14:00 — 16:00</span></div><div><small>PLACE</small><span>B‑24</span></div><div><small>PERSONNES</small><span>1</span></div></div>
      <div class="pass-qr">${qrSVG('SS-6117')}</div>
    </div></div>`,
};
$$('[data-screen]').forEach((el) => { el.innerHTML = SCREENS[el.dataset.screen](); });

/* ---------- Live data simulation ---------- */
function renderLive() {
  $$('[data-live-seats]').forEach((el) => { el.textContent = live[el.dataset.liveSeats].seats; });
  $$('[data-live-db]').forEach((el) => { el.textContent = live[el.dataset.liveDb].db; });
  $$('[data-tick-seats]').forEach((el) => { const v = live[el.dataset.tickSeats].seats; el.textContent = v === 0 ? 'Complet' : `${v} places`; el.classList.toggle('full', v === 0); });
  $('#heroLive').textContent = Object.values(live).reduce((a, b) => a + b.seats, 0);
  $('#chipSeats').textContent = live['sainte-genevieve'].seats;
  $('#chipDb').textContent = live['sainte-genevieve'].db;
}
setInterval(() => {
  for (const s of SPOTS) {
    const l = live[s.id];
    if (s.seats > 0) l.seats = clamp(l.seats + Math.round((Math.random() - 0.5) * 2.4), 1, s.seats + 6);
    l.db = clamp(l.db + Math.round((Math.random() - 0.5) * 2.2), s.db - 2, s.db + 3);
  }
  renderLive();
}, 2500);

/* ---------- Ticker ---------- */
(() => {
  const items = SPOTS.map((s) => `<span class="tick"><span class="dot-live"></span><b>${s.name}</b><span class="seats" data-tick-seats="${s.id}"></span><span class="db"><span data-live-db="${s.id}"></span> dB</span></span>`).join('');
  $('#tickerTrack').innerHTML = items + items;
  renderLive();
})();

/* ---------- Smooth scroll (Lenis) + GSAP ---------- */
let lenis = null;
if (hasGsap) gsap.registerPlugin(ScrollTrigger);
if (!reduced && window.Lenis) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  if (hasGsap) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}

/* ---------- Nav, menu, progress, anchors ---------- */
const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks'), progress = $('#progress');
const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 20);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();
const setMenu = (open) => { links.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu'); };
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const target = id === '#top' ? document.body : $(id);
  if (!target) return;
  e.preventDefault();
  setMenu(false);
  if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset: -84, duration: 1.4 });
  else window.scrollTo({ top: id === '#top' ? 0 : target.getBoundingClientRect().top + scrollY - 84, behavior: reduced ? 'auto' : 'smooth' });
});

/* ---------- Loader → hero intro ---------- */
function intro() {
  const loader = $('#loader');
  loader.classList.add('is-done');
  document.body.classList.remove('is-loading');
  if (!hasGsap || reduced) { $$('.reveal').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero-title .line > span', { yPercent: 115, duration: 1.3, stagger: 0.1 }, 0.1)
    .from('.hero .reveal', { opacity: 0, y: 26, duration: 1.1, stagger: 0.08 }, 0.35)
    .from('.hero-phone', { y: 120, opacity: 0, duration: 1.6 }, 0.2)
    .from('.float-chip', { scale: 0.6, opacity: 0, duration: 1, stagger: 0.12, ease: 'back.out(2)' }, 0.9);
}
document.body.classList.add('is-loading');
const started = performance.now();
const finishLoad = () => setTimeout(intro, Math.max(0, (reduced ? 200 : 1150) - (performance.now() - started)));
if (document.readyState === 'complete') finishLoad(); else addEventListener('load', finishLoad, { once: true });
setTimeout(() => { if (!$('#loader').classList.contains('is-done')) intro(); }, 3500);

/* ---------- Pointer tracking (shared) ---------- */
const pointer = { x: 0.5, y: 0.5, active: false, last: 0 };
addEventListener('pointermove', (e) => { pointer.x = e.clientX / innerWidth; pointer.y = e.clientY / innerHeight; pointer.cx = e.clientX; pointer.cy = e.clientY; pointer.active = e.pointerType === 'mouse'; pointer.last = performance.now(); }, { passive: true });

/* ---------- Hero visibility ---------- */
const hero = $('#hero');
let heroVisible = true;
new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }, { threshold: 0 }).observe(hero);
const heroProgress = () => clamp(window.scrollY / (hero.offsetHeight || 1), 0, 1);

/* =========================================================
   WebGL "noise field": the city as a sound equaliser.
   Where you point, the bars flatten and turn green.
   ========================================================= */
(function noiseField() {
  const canvas = $('#field');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch { canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0xF5F5F3, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xF5F5F3, 10, 25);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfcfca, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5); sun.position.set(-4, 10, 6); scene.add(sun);

  const mobile = isMobile();
  const COLS = mobile ? 30 : 60, ROWS = mobile ? 26 : 30, GAP = 0.42;
  const geo = new THREE.BoxGeometry(GAP * 0.64, 1, GAP * 0.64); geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.08 });
  const count = COLS * ROWS;
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const px = new Float32Array(count), pz = new Float32Array(count);
  for (let j = 0, k = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++, k++) { px[k] = (i - (COLS - 1) / 2) * GAP; pz[k] = (j - (ROWS - 1) / 2) * GAP; }
  const m = new THREE.Matrix4(), col = new THREE.Color();
  const cLow = new THREE.Color('#D4D4CF'), cHigh = new THREE.Color('#141414'), cQuiet = new THREE.Color('#1F9D55'), cQuiet2 = new THREE.Color('#3DDC84');
  mesh.setColorAt(0, col); // allocate instanceColor

  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3(), ndc = new THREE.Vector2();
  const quiet = { x: 2, z: 0 }, quietTarget = { x: 2, z: 0 };
  let radius = 0; // grows in on first frames

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (isMobile()) { camera.fov = 46; camera.position.set(0, 9.5, 11.5); camera.lookAt(0, 0, -0.5); }
    else { camera.fov = 36; camera.position.set(0, 8.2, 11.5); camera.lookAt(0, 0, -2.2); }
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  const t0 = performance.now();
  function frame(now) {
    const t = ((now - t0) / 1000) * (reduced ? 0.3 : 1); // calm mode: slow city
    // where is the quiet zone? follow the mouse, or wander on touch / idle
    const idle = !pointer.active || (!reduced && now - pointer.last > 4000);
    if (!idle) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((pointer.cx - r.left) / r.width) * 2 - 1, -((pointer.cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) { quietTarget.x = hit.x; quietTarget.z = hit.z; }
    } else if (!reduced) {
      quietTarget.x = Math.sin(t * 0.32) * (isMobile() ? 3 : 6) + (isMobile() ? 0 : 1.5);
      quietTarget.z = Math.cos(t * 0.23) * 2.2;
    }
    quiet.x = lerp(quiet.x, quietTarget.x, 0.08);
    quiet.z = lerp(quiet.z, quietTarget.z, 0.08);
    radius = lerp(radius, 1, 0.03);
    const loud = 1 - (reduced ? 0 : heroProgress()) * 0.85;     // scrolling down calms the whole city
    const R0 = 0.6 * radius, R1 = 3.6 * radius;

    for (let k = 0; k < count; k++) {
      const x = px[k], z = pz[k];
      const dx = x - quiet.x, dz = z - quiet.z, d = Math.sqrt(dx * dx + dz * dz);
      const q = 1 - smoothstep(R0, R1, d);
      const n1 = 0.5 + 0.5 * Math.sin(x * 0.55 + t * 1.3) * Math.cos(z * 0.7 - t * 1.05);
      const n2 = 0.5 + 0.5 * Math.sin(x * 0.9 - z * 0.6 + t * 2.2);
      const n3 = 0.5 + 0.5 * Math.sin(x * 2.1 + z * 1.7 + t * 3.1);
      let h = 0.08 + loud * (1.25 * n1 * n1 + 0.55 * n2 * n2 + 0.18 * n3);
      const ripple = q > 0.02 && q < 0.98 ? Math.sin(d * 3 - t * 5) * 0.06 * q : 0;
      h = h * (1 - q) + (0.05 + ripple) * q;
      m.makeScale(1, Math.max(0.03, h), 1); m.setPosition(x, 0, z);
      mesh.setMatrixAt(k, m);
      col.copy(cLow).lerp(cHigh, clamp(h / 1.7, 0, 1));
      if (q > 0) col.lerp(q > 0.7 ? cQuiet2 : cQuiet, q);
      mesh.setColorAt(k, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    renderer.render(scene, camera);
  }
  const loop = (now) => { if (heroVisible && !document.hidden) frame(now); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
})();

/* ---------- 3D phone tilt (hero) ---------- */
(() => {
  const phone = $('#phone3d');
  let cx = 0, cy = 0;
  const loop = () => {
    if (heroVisible) {
      // calm mode: the phone only moves when you move the mouse, never on its own
      const tx = pointer.active ? pointer.x - 0.5 : reduced ? 0 : Math.sin(performance.now() / 2600) * 0.25;
      const ty = pointer.active ? pointer.y - 0.5 : reduced ? 0 : Math.cos(performance.now() / 3100) * 0.15;
      cx = lerp(cx, tx, 0.06); cy = lerp(cy, ty, 0.06);
      const p = reduced ? 0 : heroProgress();
      phone.style.transform = `translateY(${-p * 90}px) rotateY(${-18 + cx * 30 + p * 40}deg) rotateX(${8 - cy * 18 + p * 14}deg) rotateZ(${2 - p * 6}deg)`;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();

/* ---------- Manifesto: words light up as you scroll ---------- */
(() => {
  const el = $('#manifesto');
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  const words = $$('.w', el);
  if (!hasGsap || reduced) { words.forEach((w) => (w.style.color = '#0A0A0A')); return; }
  gsap.to(words, { color: '#0A0A0A', stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 42%', scrub: 0.6 } });
})();

/* ---------- Sticky story: 3 steps drive the phone ---------- */
(() => {
  const steps = $$('.step'), screens = $$('.story-screen'), dots = $$('.story-dots i');
  const set = (i) => {
    steps.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === i));
    screens.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === i));
    dots.forEach((d, j) => d.classList.toggle('is-active', j === i));
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && set(+e.target.dataset.step)), { rootMargin: '-48% 0px -48% 0px' });
  steps.forEach((s) => io.observe(s));
})();

/* ---------- Silence slider ---------- */
(() => {
  const grid = $('#spotGrid'), range = $('#dbRange'), val = $('#dbVal'), label = $('#dbLabel'), countEl = $('#dbCount'), bars = $('#meterBars');
  grid.innerHTML = SPOTS.map((s) => `
    <article class="spot" data-db="${s.db}">
      <div class="spot-img"><img src="assets/${s.img}" alt="${s.name}" loading="lazy"><span class="spot-db">${s.db} dB</span></div>
      <div class="spot-body">
        <span class="seat-badge ${s.seats === 0 ? 'full' : ''}"><i></i>${s.seats === 0 ? 'COMPLET' : `<span data-live-seats="${s.id}">${s.seats}</span>&nbsp;PLACES LIBRES`}</span>
        <h3>${s.name}</h3>
        <div class="spot-meta"><span>${s.kind} · ${s.area}</span><b>${price(s.price)}</b></div>
      </div>
    </article>`).join('');
  renderLive();
  const BARS = 16;
  bars.innerHTML = Array.from({ length: BARS }, (_, i) => `<i style="height:${18 + Math.abs(Math.sin(i * 1.7)) * 30 + i * 1.3}px"></i>`).join('');
  const barEls = $$('i', bars), cards = $$('.spot', grid);
  const colorAt = (t) => (t < 0.4 ? '#1F9D55' : t < 0.65 ? '#9ACD32' : t < 0.85 ? '#F4B400' : '#E53E3E');
  const describe = (v) => (v <= 26 ? 'Silence absolu' : v <= 31 ? 'Silence de bibliothèque' : v <= 38 ? 'Murmure' : v <= 46 ? 'Calme vivant' : 'Ambiance café');
  function update() {
    const v = +range.value;
    val.textContent = v;
    label.textContent = describe(v);
    let n = 0;
    cards.forEach((c) => { const ok = +c.dataset.db <= v; c.classList.toggle('is-out', !ok); n += ok; });
    countEl.textContent = n === 0 ? 'Aucun lieu aussi calme… pour l’instant' : `${n} lieu${n > 1 ? 'x' : ''} à ce niveau ou en dessous`;
    const t = (v - 24) / (55 - 24);
    const lit = Math.round(t * BARS);
    barEls.forEach((b, i) => { b.style.background = i < lit ? colorAt(i / BARS) : '#D9D9D6'; });
  }
  range.addEventListener('input', update);
  update();
})();

/* ---------- Coverflow ---------- */
(() => {
  const flow = $('#flow');
  flow.innerHTML = SPOTS.map((s) => `
    <article class="flow-card">
      <img src="assets/${s.img}" alt="${s.name}" loading="lazy" draggable="false">
      <span class="flow-tag">${s.kind}</span><span class="flow-db">${s.db} dB</span>
      <div class="flow-cap"><span class="seat"><i></i>${s.seats === 0 ? 'COMPLET' : `<span data-live-seats="${s.id}">${s.seats}</span>&nbsp;PLACES LIBRES`}</span><h3>${s.name}</h3><p>${s.vibe} · ${s.area} · ${price(s.price)}</p></div>
    </article>`).join('');
  renderLive();
  const cards = $$('.flow-card', flow);
  let raf = 0;
  const update = () => {
    raf = 0;
    const r = flow.getBoundingClientRect(), center = r.left + r.width / 2;
    for (const c of cards) {
      const b = c.getBoundingClientRect();
      const a = clamp((b.left + b.width / 2 - center) / b.width, -2.4, 2.4), abs = Math.abs(a);
      c.style.transform = `perspective(1200px) translateZ(${-abs * 150}px) rotateY(${-a * 34}deg) scale(${1 - Math.min(abs, 2) * 0.05})`;
      c.style.zIndex = String(100 - Math.round(abs * 10));
      c.style.opacity = String(1 - Math.min(abs, 2.4) * 0.2);
    }
  };
  const req = () => { if (!raf) raf = requestAnimationFrame(update); };
  flow.addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  const step = () => cards[0].offsetWidth - 20;
  $('#flowPrev').addEventListener('click', () => flow.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('#flowNext').addEventListener('click', () => flow.scrollBy({ left: step(), behavior: 'smooth' }));
  flow.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); flow.scrollBy({ left: step(), behavior: 'smooth' }); } if (e.key === 'ArrowLeft') { e.preventDefault(); flow.scrollBy({ left: -step(), behavior: 'smooth' }); } });
  // mouse drag
  let down = false, sx = 0, sl = 0;
  flow.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = flow.scrollLeft; flow.classList.add('is-drag'); flow.setPointerCapture(e.pointerId); });
  flow.addEventListener('pointermove', (e) => { if (down) flow.scrollLeft = sl - (e.clientX - sx); });
  const end = () => {
    if (!down) return; down = false; flow.classList.remove('is-drag');
    // snap to nearest card
    const r = flow.getBoundingClientRect(), center = r.left + r.width / 2;
    let best = cards[0], bd = Infinity;
    for (const c of cards) { const b = c.getBoundingClientRect(); const d = Math.abs(b.left + b.width / 2 - center); if (d < bd) { bd = d; best = c; } }
    const b = best.getBoundingClientRect();
    flow.scrollBy({ left: b.left + b.width / 2 - center, behavior: 'smooth' });
  };
  flow.addEventListener('pointerup', end); flow.addEventListener('pointercancel', end);
  // start on the 3rd card
  requestAnimationFrame(() => { const c = cards[2], r = flow.getBoundingClientRect(), b = c.getBoundingClientRect(); flow.scrollLeft += b.left + b.width / 2 - (r.left + r.width / 2); update(); });
})();

/* ---------- Bento tiles ---------- */
(() => {
  // live map
  const map = $('#miniMap');
  const pins = [
    ['mazarine', 18, 30], ['sainte-genevieve', 34, 64], ['archivolt', 30, 46], ['bpi', 56, 34], ['anticafe', 64, 22],
    ['lab', 82, 50], ['white-cube', 72, 40], ['atelier-verde', 70, 14], ['bnf', 74, 82], ['nationale', 44, 16],
  ];
  map.innerHTML = `
    <svg class="roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-5 58 C 15 50, 28 70, 45 60 S 70 40, 85 60 S 100 74, 110 70" stroke="#C9D6DC" stroke-width="5" fill="none"/>
      <g stroke="#fff" stroke-width="1.6" fill="none"><path d="M0 25 H100 M0 76 H100 M22 0 V100 M50 0 V100 M78 0 V100"/><path d="M0 0 L100 100 M100 8 L20 100"/></g>
      <g fill="#E2E6DB"><rect x="5" y="80" width="12" height="12" rx="2"/><rect x="86" y="4" width="10" height="14" rx="2"/></g>
    </svg>
    <span class="map-me" style="left:40%;top:52%"></span>
    ${pins.map(([id, x, y]) => { const s = SPOTS.find((p) => p.id === id); return `<button class="map-pin ${s.seats === 0 ? 'full' : ''}" style="left:${x}%;top:${y}%" aria-label="${s.name}"><i></i><span data-live-seats="${id}">${s.seats}</span><span class="pin-name">· ${s.name.replace('Bibliothèque ', '')}</span></button>`; }).join('')}`;
  renderLive();
  const pinEls = $$('.map-pin', map);
  let pi = 0, hover = false;
  map.addEventListener('pointerenter', () => { hover = true; pinEls.forEach((p) => p.classList.remove('on')); });
  map.addEventListener('pointerleave', () => { hover = false; });
  setInterval(() => { if (hover) return; pinEls.forEach((p, i) => p.classList.toggle('on', i === pi)); pi = (pi + 1) % pinEls.length; }, 2400);

  // pay card flip on tap (hover handles desktop)
  const pay = $('#payTile');
  pay.addEventListener('click', () => pay.classList.toggle('is-flipped'));

  // QR
  $('#qrTile').innerHTML = qrSVG('SS-6117');

  // notifications stack
  const NOTIFS = [
    ['⏰', 'Réservation imminente', 'Archivolt · dans 15 min'],
    ['🔇', 'Silence détecté à 26 dB', 'Mazarine · 7 places libres'],
    ['★', 'Nouveau badge débloqué', '« Early Bird » · 5 sessions avant 9h'],
  ];
  const stack = $('#notifStack');
  stack.innerHTML = NOTIFS.map(([i, t, s]) => `<div class="notif"><span class="n-ic">${i}</span><div><b>${t}</b><span>${s}</span></div></div>`).join('');
  const ns = $$('.notif', stack);
  let order = [0, 1, 2];
  const layout = () => order.forEach((idx, pos) => { const n = ns[idx]; n.style.transform = `translateY(${-pos * 16}px) scale(${1 - pos * 0.06})`; n.style.opacity = String(1 - pos * 0.35); n.style.zIndex = String(10 - pos); });
  layout();
  setInterval(() => { order = [order[2], order[0], order[1]]; layout(); }, 2800);

  // favourites
  const fav = $('#favBtn'), favCount = $('#favCount');
  fav.addEventListener('click', () => {
    const on = fav.getAttribute('aria-pressed') !== 'true';
    fav.setAttribute('aria-pressed', String(on));
    fav.setAttribute('aria-label', on ? 'Retirer des favoris' : 'Ajouter aux favoris');
    favCount.textContent = on ? 7 : 6;
    fav.classList.remove('pop'); void fav.offsetWidth; fav.classList.add('pop');
  });

  // focus week chart
  const week = $('#week'), hours = [1.6, 2.2, 1.0, 2.6, 1.8, 0.9, 0.5], days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  week.innerHTML = hours.map((h, i) => `<div class="bar ${i === 4 ? 'today' : ''}"><i data-h="${(h / 2.6) * 100}"></i><span>${days[i]}</span></div>`).join('');
  new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; $$('i', week).forEach((b, i) => setTimeout(() => { b.style.height = `${b.dataset.h}%`; }, i * 70)); o.disconnect(); }, { threshold: 0.4 }).observe(week);

  // 3D tilt on hover (desktop)
  if (finePointer) {
    $$('.tilt').forEach((t) => {
      t.addEventListener('pointermove', (e) => {
        const r = t.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        t.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(0)`;
      });
      t.addEventListener('pointerleave', () => { t.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1), box-shadow .4s'; t.style.transform = ''; setTimeout(() => (t.style.transition = ''), 600); });
    });
  }
})();

/* ---------- Focus demo ---------- */
(() => {
  const C = 2 * Math.PI * 130;
  const fg = $('#ringFg'), time = $('#dialTime'), sub = $('#dialSub'), play = $('#focusPlay'), dial = $('.focus-dial');
  fg.style.strokeDasharray = C;
  let total = 25 * 60, left = total, running = false, last = 0, startedAt = 0;
  const fmt = (s) => { s = Math.ceil(s); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const draw = () => { time.textContent = fmt(left); fg.style.strokeDashoffset = String(C * (left / total)); };
  const setRunning = (r) => {
    running = r; play.classList.toggle('is-playing', r); dial.classList.toggle('is-running', r);
    play.setAttribute('aria-label', r ? 'Pause' : 'Démarrer');
    if (r) { last = performance.now(); startedAt = last; requestAnimationFrame(tick); } else if (left > 0) sub.textContent = 'En pause';
  };
  const tick = (now) => {
    if (!running) return;
    left = Math.max(0, left - ((now - last) / 1000) * 60); last = now; // demo ×60
    sub.textContent = Math.floor((now - startedAt) / 4000) % 2 ? 'Expire…' : 'Inspire…';
    draw();
    if (left <= 0) { setRunning(false); sub.textContent = 'Bravo, session terminée ✓'; return; }
    requestAnimationFrame(tick);
  };
  play.addEventListener('click', () => { if (left <= 0) { left = total; } setRunning(!running); });
  $('#focusReset').addEventListener('click', () => { setRunning(false); left = total; sub.textContent = 'Prêt·e à te concentrer ?'; draw(); });
  $('#focusSkip').addEventListener('click', () => { setRunning(false); left = 0; draw(); sub.textContent = 'Bravo, session terminée ✓'; });
  $$('.preset').forEach((b) => b.addEventListener('click', () => {
    $$('.preset').forEach((x) => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-checked', String(x === b)); });
    setRunning(false); total = +b.dataset.min * 60; left = total; sub.textContent = 'Prêt·e à te concentrer ?'; draw();
  }));
  draw();
})();

/* ---------- Count-up numbers ---------- */
(() => {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, suf = el.dataset.suffix || '';
    io.unobserve(el);
    if (!hasGsap || reduced || to === 0) { el.textContent = to + suf; return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.6, ease: 'expo.out', onUpdate: () => { el.textContent = Math.round(o.v) + suf; } });
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => io.observe(el));
})();

/* ---------- FAQ: smooth open/close ---------- */
$$('.faq-list details').forEach((d) => {
  const s = $('summary', d), body = $('div', d);
  s.addEventListener('click', (e) => {
    if (reduced) return;
    e.preventDefault();
    if (d.open) {
      const h = body.offsetHeight;
      body.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => { d.open = false; };
    } else {
      d.open = true;
      const h = body.offsetHeight;
      body.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 460, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
  });
});

/* ---------- Waitlist (front-end only) ---------- */
(() => {
  const form = $('#waitlist'), input = $('#email'), msg = $('#formMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
    form.classList.remove('is-error'); void form.offsetWidth;
    if (!ok) { form.classList.add('is-error'); msg.className = 'form-msg err'; msg.textContent = 'Cette adresse e-mail ne semble pas valide.'; input.focus(); return; }
    msg.className = 'form-msg'; msg.textContent = 'Merci ! On te prévient dès le lancement. ✓';
    form.reset();
  });
})();

/* ---------- Magnetic buttons ---------- */
if (finePointer && !reduced) {
  $$('.magnetic').forEach((b) => {
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.32}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------- Scroll reveals + CTA logo ---------- */
if (hasGsap && !reduced) {
  const targets = '.section-head, .spot, .tile, .num, .faq-list details, .meter, .cta-card h2, .cta-card .lead, .waitlist';
  // elements rest visible; they animate in only as they cross the bottom edge of the screen
  ScrollTrigger.batch(targets, { start: 'top bottom', once: true, onEnter: (els) => { if (els[0].getBoundingClientRect().top < innerHeight * 0.85) return; gsap.from(els, { opacity: 0, y: 40, duration: 1.1, stagger: 0.07, ease: 'expo.out', clearProps: 'opacity,transform' }); } });
  gsap.fromTo('#ctaLogo svg', { rotateY: -200, scale: 0.5 }, { rotateY: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '#download', start: 'top 90%', end: 'top 30%', scrub: 0.8 } });
  gsap.fromTo('.focus-dial', { scale: 0.85, rotate: -10 }, { scale: 1, rotate: 0, ease: 'none', scrollTrigger: { trigger: '#focus', start: 'top bottom', end: 'center center', scrub: 0.8 } });
  addEventListener('load', () => ScrollTrigger.refresh());
}
