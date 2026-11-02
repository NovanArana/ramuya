/* RAMUYA — animasi scroll (GSAP + ScrollTrigger)
   ---------------------------------------------------------------------
   Prinsip: animasi "dipegang" oleh posisi scroll (scrub).
     • Scroll turun  → animasi maju
     • Scroll berhenti di tengah → animasi ikut berhenti (pause)
     • Scroll naik   → animasi berjalan mundur (reverse)
   Bagian "scene" di-pin (ditahan di layar) selama animasinya berjalan.
   Setelah animasi selesai, baru halaman lanjut turun ke bagian berikutnya.

   Isi file:
     1. Persiapan & alat bantu (splitWords, pin)
     2. Scene beranda: hero (zoom mockup), services (horizontal), work (berganti), quote
     3. Scene bersama: paket & special offer, ambient (phone 3D), cta, process
     4. Efek umum: reveal, teks kata-per-kata, judul halaman, grid proyek, preview proyek, strip produk
     5. Ticker, progress bar, hero (masuk + melayang + mouse)
     6. Start & refresh
   --------------------------------------------------------------------- */
(function () {
  const root = document.documentElement;
  if (!root.classList.contains("story-on")) return;                       // reduced-motion
  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove("story-on"); return; }   // GSAP gagal dimuat

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;

  // Kalau scroll halus aktif (desktop), animasi mengikuti persis. Di HP diberi sedikit "menyusul".
  const SCRUB = root.classList.contains("smooth-scroll") ? true : 0.4;

  /* =====================================================================
     1. ALAT BANTU
     ===================================================================== */
  // Memecah teks jadi kata (<span class="grad"> dan <br> tetap dipertahankan). Mengembalikan elemen .word
  function splitWords(el, { mask = false } = {}) {
    if (el.dataset.splitDone) return $$(".word", el);
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(" ")); return; }
          const w = document.createElement("span"); w.className = "word";
          const inner = document.createElement("span"); inner.className = "word-in"; inner.textContent = part;
          w.append(inner); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
    });
    walk(el);
    el.dataset.splitDone = "1";
    if (mask) el.classList.add("is-mask");
    return $$(".word", el);
  }

  // Timeline yang di-pin: bagian tertahan di layar sampai timeline selesai
  function pin(trigger, end, extra = {}) {
    return gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger, start: "top top", end, pin: true, scrub: SCRUB, anticipatePin: 1, invalidateOnRefresh: true, ...extra }
    });
  }

  // Tema navbar: gelap saat berada di atas bagian berlatar hitam
  const header = $(".site-header");
  const darkNow = new Set();
  function setDark(key, on) {
    on ? darkNow.add(key) : darkNow.delete(key);
    if (header) header.classList.toggle("on-dark", darkNow.size > 0);
  }
  const darkToggle = key => ({ onToggle: self => setDark(key, self.isActive) });

  /* =====================================================================
     2. SCENE BERANDA
     ===================================================================== */

  /* ---- Scene 1: hero ----
     Teks bergeser keluar, mockup produk menyebar, browser utama (Nusa Trail) membesar sampai memenuhi layar.
     Urutan sengaja berjalan satu per satu:
       1) layar MENGGELAP PENUH dulu (semua teks proyek tertutup)
       2) baru kalimat "Not just a website. A feeling." muncul kata per kata. */
  function sceneHero() {
    const s = $(".scene-hero"); if (!s) return;
    const copy = $(".hero-copy-wrap", s);
    const main = $(".dv-main", s), left = $(".dv-left", s), right = $(".dv-right", s);
    const phones = $$(".dv-phone-1, .dv-phone-2", s);
    const dim = $(".hero-dim", s);
    const statement = $(".hero-statement", s);
    const words = splitWords($(".statement", statement));

    gsap.set(statement, { visibility: "hidden" });
    gsap.set([$(".eyebrow", statement), $(".statement-sub", statement), $(".text-link", statement)], { opacity: 0, y: 30 });

    const tl = pin(s, "+=380%", {
      onUpdate: self => setDark("hero", self.isActive && self.progress > 0.45),
      onToggle: self => { if (!self.isActive) setDark("hero", false); }
    });
    tl.to(copy, { x: -90, opacity: 0, duration: 2.8 }, 0)
      .to(left, { xPercent: -55, yPercent: 25, duration: 3.2 }, 0.2)
      .to(right, { xPercent: 55, yPercent: -25, duration: 3.2 }, 0.2)
      .to(phones, { y: 180, duration: 3 }, 0.2)
      .to([left, right, ...phones], { opacity: 0, duration: 1.2 }, 2.2);          // memudar belakangan, setelah menyebar

    if (main) {
      // browser utama membesar & bergerak ke tengah layar (dihitung ulang saat ukuran layar berubah)
      const target = () => {
        const sr = s.getBoundingClientRect(), mr = main.getBoundingClientRect();
        const cx = mr.left - sr.left + mr.width / 2, cy = mr.top - sr.top + mr.height / 2;
        return {
          scale: Math.max(window.innerWidth * 1.08 / main.offsetWidth, 1.3),
          dx: window.innerWidth / 2 - cx + gsap.getProperty(main, "x"),
          dy: window.innerHeight / 2 - cy + gsap.getProperty(main, "y")
        };
      };
      tl.to(main, { x: () => target().dx, y: () => target().dy, scale: () => target().scale, borderRadius: 0, duration: 3.6, ease: "power1.inOut" }, 0.8)
        .to($(".browser-bar", main), { height: 0, duration: 2, ease: "power1.in" }, 1.2);   // bar (titik-titik) browser hilang, screenshot memenuhi layar
    }

    tl.to(dim, { opacity: 1, duration: 1.4 }, 3.6)                 // 1) layar menghitam penuh (selesai di t = 5.0)
      .set(statement, { visibility: "visible" }, 5.2)               // 2) baru teks muncul
      .to($(".eyebrow", statement), { opacity: 1, y: 0, duration: 0.6 }, 5.3)
      .fromTo(words, { opacity: 0.1, yPercent: 40 }, { opacity: 1, yPercent: 0, stagger: 0.28, duration: 0.8 }, 5.5)
      .to($(".statement-sub", statement), { opacity: 1, y: 0, duration: 1 }, 7.4)
      .to($(".text-link", statement), { opacity: 1, y: 0, duration: 1 }, 7.8)
      .to({}, { duration: 1.4 });
  }

  /* ---- Scene 2: services — kartu bergeser horizontal ---- */
  function sceneServices() {
    const s = $(".scene-services"); if (!s) return;
    const track = $(".h-track", s);
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 1);
    const slide = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: s, start: "top top", end: () => "+=" + dist(), pin: true, scrub: SCRUB, anticipatePin: 1, invalidateOnRefresh: true, ...darkToggle("services") }
    });
    gsap.to($(".h-progress span", s), { scaleX: 1, ease: "none",
      scrollTrigger: { trigger: s, start: "top top", end: () => "+=" + dist(), scrub: true, invalidateOnRefresh: true } });

    // tiap kartu membesar saat masuk layar, gambarnya bergeser berlawanan arah (kedalaman)
    $$(".h-card", s).forEach(card => {
      gsap.fromTo(card, { scale: 0.92, opacity: 0.55 }, { scale: 1, opacity: 1, ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: slide, start: "left 95%", end: "left 55%", scrub: true } });
      const im = $(".h-img", card);
      if (im) gsap.fromTo(im, { xPercent: 14 }, { xPercent: -10, ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: slide, start: "left right", end: "right left", scrub: true } });
    });
  }

  /* ---- Scene 3: selected work — teks & mockup proyek berganti saat scroll ---- */
  function sceneWork() {
    const s = $(".scene-work"); if (!s) return;
    const texts = $$(".work-text", s), visuals = $$(".work-visual", s), dots = $$(".work-dots i", s);
    if (!texts.length) return;
    const n = texts.length, STEP = 1.6;

    gsap.set(texts, { autoAlpha: 0, y: 40 });
    gsap.set(visuals, { opacity: 0, scale: 1.08, filter: "blur(10px)" });
    gsap.set(dots, { width: 8, backgroundColor: "#c7c7cc" });
    gsap.set(texts[0], { autoAlpha: 1, y: 0 });
    gsap.set(visuals[0], { opacity: 1, scale: 1, filter: "blur(0px)" });
    gsap.set(dots[0], { width: 28, backgroundColor: "#1d1d1f" });

    const tl = pin(s, "+=" + (n - 1) * 110 + "%");
    for (let i = 1; i < n; i++) {
      const t = (i - 1) * STEP + 0.4;
      tl.to(texts[i - 1], { autoAlpha: 0, y: -40, duration: 0.45 }, t)
        .fromTo(texts[i], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8 }, t + 0.5)
        .to(visuals[i - 1], { opacity: 0, scale: 0.92, filter: "blur(10px)", duration: 0.9 }, t)
        .fromTo(visuals[i], { opacity: 0, scale: 1.08, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1 }, t + 0.5)
        .to(dots[i - 1], { width: 8, backgroundColor: "#c7c7cc", duration: 0.5 }, t + 0.4)
        .to(dots[i], { width: 28, backgroundColor: "#1d1d1f", duration: 0.5 }, t + 0.4);
    }
    tl.to({}, { duration: 0.6 });
  }

  /* ---- Scene 4: quote — kata menyala satu per satu ---- */
  function sceneQuote() {
    const s = $(".scene-quote"); if (!s) return;
    const words = splitWords($("blockquote", s));
    pin(s, "+=220%", darkToggle("quote"))
      .fromTo(words, { opacity: 0.24, yPercent: 0 }, { opacity: 1, stagger: 0.3, duration: 0.8 }, 0.2)
      .fromTo($("blockquote", s), { scale: 0.94 }, { scale: 1, duration: 3 }, 0)
      .to({}, { duration: 1 });
  }

  /* =====================================================================
     3. SCENE BERSAMA (muncul di beberapa halaman)
     ===================================================================== */
  /* Paket & special offer: kartu naik satu per satu, daftar fitur muncul berurutan */
  function packages() {
    const s = $(".packages"); if (!s) return;
    const head = $(".packages-head", s);
    const words = splitWords($(".title", head));
    gsap.fromTo(words, { opacity: 0.12, yPercent: 40 }, { opacity: 1, yPercent: 0, stagger: 0.12, ease: "none",
      scrollTrigger: { trigger: head, start: "clamp(top 85%)", end: "clamp(bottom 55%)", scrub: SCRUB } });
    gsap.fromTo([$(".eyebrow", head), $(".page-lead", head)], { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: head, start: "clamp(top 92%)", end: "clamp(top 60%)", scrub: SCRUB } });
    gsap.fromTo($(".offer", s), { opacity: 0, y: 70, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, ease: "none",
      scrollTrigger: { trigger: $(".offer", s), start: "clamp(top 95%)", end: "clamp(top 65%)", scrub: SCRUB } });
    $$(".plan", s).forEach(plan => {
      gsap.fromTo(plan, { opacity: 0, y: 110, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, ease: "none",
        scrollTrigger: { trigger: plan, start: "clamp(top 98%)", end: "clamp(top 60%)", scrub: SCRUB } });
      gsap.fromTo($$("li", plan), { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.15, ease: "none",
        scrollTrigger: { trigger: plan, start: "clamp(top 70%)", end: "clamp(top 30%)", scrub: SCRUB } });
    });
    gsap.fromTo($$(".included li", s), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.12, ease: "none",
      scrollTrigger: { trigger: $(".included", s), start: "clamp(top 96%)", end: "clamp(top 76%)", scrub: SCRUB } });
  }

  /* Phone berputar 3D mengikuti scroll, chip melayang masuk */
  function sceneAmbient() {
    const s = $(".ambient-section.scene"); if (!s) return;
    const words = splitWords($(".title", s));
    const phone = $(".phone3d", s);
    gsap.set(phone, { transformPerspective: 1400 });
    pin(s, "+=240%", darkToggle("ambient"))
      .fromTo($(".eyebrow", s), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0)
      .fromTo(words, { opacity: 0.25, yPercent: 40 }, { opacity: 1, yPercent: 0, stagger: 0.22, duration: 0.8 }, 0.2)
      .fromTo(phone, { rotationY: -70, rotationX: 18, y: 160, scale: 0.8, opacity: 0 },
                     { rotationY: 25, rotationX: 0, y: 0, scale: 1, opacity: 1, duration: 4 }, 0)
      .to(phone, { rotationY: -18, duration: 2 }, 4)
      .fromTo($$(".chip", s), { opacity: 0, y: 60, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, stagger: 0.6, duration: 1 }, 1.6)
      .to({}, { duration: 0.8 });
  }

  /* CTA akhir: BUKAN scene pinned — muncul langsung saat masuk layar, jadi tidak ada layar kosong sebelum footer */
  function sceneCta() {
    const s = $(".cta-section"); if (!s) return;
    const title = $(".cta-title", s);
    splitWords(title, { mask: true });
    const t = (start, end) => ({ trigger: s, start: `clamp(top ${start}%)`, end: `clamp(top ${end}%)`, scrub: SCRUB });
    gsap.fromTo($(".eyebrow", s), { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: "none", scrollTrigger: t(92, 70) });
    gsap.fromTo(title, { scale: 0.86 }, { scale: 1, ease: "none", scrollTrigger: t(95, 35) });
    gsap.fromTo($$(".word-in", title), { yPercent: 115 }, { yPercent: 0, stagger: 0.2, ease: "none", scrollTrigger: t(88, 45) });
    gsap.fromTo($(".btn", s), { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: "none", scrollTrigger: t(70, 40) });
  }

  function sceneProcess() {
    const s = $(".process.scene"); if (!s) return;
    const tl = pin(s, "+=240%");
    tl.fromTo($(".process-head", s), { opacity: 0.25, y: 40 }, { opacity: 1, y: 0, duration: 1.2 }, 0);
    $$(".process-card", s).forEach((c, i) => tl.fromTo(c, { opacity: 0, y: 140, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 1 }, 1 + i * 0.8));
    tl.to({}, { duration: 0.8 });
  }

  /* =====================================================================
     4. EFEK UMUM (di luar scene yang di-pin)
     ===================================================================== */
  const inScene = el => !!el.closest(".scene");

  // Elemen .reveal naik + muncul mengikuti scroll (bukan berdasarkan waktu)
  function reveals() {
    $$(".reveal").filter(el => !inScene(el) && !el.matches(".work-item")).forEach(el => {
      gsap.fromTo(el, { y: 60, opacity: 0 }, { y: 0, opacity: 1, ease: "none",
        scrollTrigger: { trigger: el, start: "clamp(top 92%)", end: "clamp(top 66%)", scrub: SCRUB } });
    });
  }

  // Teks [data-split] terisi kata per kata saat di-scroll
  function scrubText() {
    $$("[data-split]").filter(el => !inScene(el)).forEach(el => {
      const words = splitWords(el);
      gsap.fromTo(words, { opacity: 0.15, yPercent: 30 }, { opacity: 1, yPercent: 0, ease: "none", stagger: 0.12,
        scrollTrigger: { trigger: el, start: "clamp(top 85%)", end: "clamp(bottom 55%)", scrub: SCRUB } });
    });
  }

  // Judul halaman: muncul per kata saat dibuka, lalu mengecil & memudar saat di-scroll
  function pageHeroes() {
    $$(".page-hero, .project-hero").forEach(h => {
      const title = $(".page-title", h); if (!title) return;
      splitWords(title, { mask: true });
      gsap.from($$(".word-in", title), { yPercent: 115, duration: 1.3, ease: "expo.out", stagger: 0.08, delay: 0.15 });
      gsap.to(h, { y: -70, opacity: 0.1, scale: 0.97, ease: "none", scrollTrigger: { trigger: h, start: "top top", end: "bottom top", scrub: SCRUB } });
    });
  }

  // Halaman Work: kartu naik + gambar zoom-out & bergeser (paralaks)
  function workGrid() {
    $$(".work-grid .work-item").forEach(item => {
      const media = $(".work-media", item), img = $("img", media), cap = $(".work-caption", item);
      gsap.set(item, { opacity: 1 });
      gsap.fromTo(media, { y: 90, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, ease: "none",
        scrollTrigger: { trigger: item, start: "clamp(top 95%)", end: "clamp(top 60%)", scrub: SCRUB } });
      if (img) gsap.fromTo(img, { scale: 1.22, yPercent: 5 }, { scale: 1, yPercent: -5, ease: "none",
        scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: SCRUB } });
      gsap.fromTo(cap, { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: "none",
        scrollTrigger: { trigger: item, start: "clamp(top 70%)", end: "clamp(top 50%)", scrub: SCRUB } });
    });
  }

  // Halaman proyek: mockup desktop membesar, phone naik dari bawah
  function projectPreviews() {
    const box = $(".project-preview");
    if (box) {
      const desk = $(".pv-desk", box), mob = $(".pv-mob", box);
      const trig = { trigger: box, start: "clamp(top 90%)", end: "clamp(top 30%)", scrub: SCRUB };
      if (desk) gsap.fromTo(desk, { y: 120, scale: 0.82 }, { y: 0, scale: 1, ease: "none", scrollTrigger: trig });
      if (mob) gsap.fromTo(mob, { y: 260 }, { y: 0, ease: "none", scrollTrigger: trig });
    }
    $$(".project-highlights li").forEach(li => {
      gsap.fromTo(li, { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: "none", scrollTrigger: { trigger: li, start: "clamp(top 94%)", end: "clamp(top 76%)", scrub: SCRUB } });
    });
  }

  // Strip produk: dua baris mockup bergeser berlawanan arah saat scroll
  function productStrips() {
    $$(".product-strip").forEach(strip => {
      $$(".strip-row", strip).forEach(row => {
        const dir = +row.dataset.dir;
        const shift = () => Math.max(0, row.scrollWidth - window.innerWidth);
        gsap.fromTo(row, { x: () => (dir < 0 ? 0 : -shift()) }, { x: () => (dir < 0 ? -shift() : 0), ease: "none",
          scrollTrigger: { trigger: strip, start: "top bottom", end: "bottom top", scrub: SCRUB, invalidateOnRefresh: true } });
      });
    });
  }

  /* =====================================================================
     5. TICKER · PROGRESS · HERO
     ===================================================================== */
  // Ticker berjalan terus; scroll mempercepatnya dan membaliknya sesuai arah scroll
  function marquee() {
    const track = $(".marquee div"); if (!track) return;
    ScrollTrigger.create({ trigger: ".marquee-section", start: "top 90%", end: "bottom 40px", ...darkToggle("marquee") });
    const tween = gsap.to(track, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate(self) {
        const sign = self.direction > 0 ? 1 : -1;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 180, 7);
        gsap.killTweensOf(tween);
        gsap.timeline().to(tween, { timeScale: sign * boost, duration: 0.25 }).to(tween, { timeScale: sign, duration: 1.2 });
      }
    });
  }

  // Garis progress scroll di paling atas layar
  function progressBar() {
    const bar = document.createElement("div"); bar.className = "scroll-progress"; body.appendChild(bar);
    gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
  }

  // Hero: teks & mockup masuk, lalu melayang pelan + bergeser mengikuti mouse
  // (animasi masuk memakai properti yang BERBEDA dari animasi scroll, supaya tidak bentrok)
  function heroLife() {
    const s = $(".scene-hero"); if (!s) return;
    const title = $(".hero-title", s);
    splitWords(title, { mask: true });

    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro.from($(".eyebrow", s), { opacity: 0, y: 20, duration: 0.8 }, 0.1)
         .from($$(".word-in", title), { yPercent: 115, duration: 1.3, ease: "expo.out", stagger: 0.08 }, 0.2)
         .from([$(".hero-sub", s), $(".hero-actions", s)], { opacity: 0, y: 30, duration: 1, stagger: 0.12 }, 0.7);

    const devices = $$(".device", s);
    devices.forEach((d, i) => {
      gsap.from(d, { opacity: 0, yPercent: 40, duration: 1.5, delay: 0.5 + i * 0.1, ease: "expo.out" });
      if (!d.matches(".dv-main")) {                                             // melayang pelan (rotasi kecil)
        gsap.to(d, { rotation: (i % 2 ? 1 : -1) * 1.6, duration: 3 + i * 0.5, yoyo: true, repeat: -1, ease: "sine.inOut" });
      }
    });

    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {             // paralaks mouse
      const movers = devices.map((d, i) => ({ to: gsap.quickTo(d, "x", { duration: 1.2, ease: "power3" }), depth: 10 + i * 8 }));
      s.addEventListener("pointermove", e => {
        const nx = e.clientX / window.innerWidth - 0.5;
        movers.forEach(m => m.to(nx * -m.depth * 2));
      });
    }
  }

  /* =====================================================================
     6. START & REFRESH
     ===================================================================== */
  function build() {
    /* PENTING: scene yang di-pin harus dibuat SESUAI URUTAN DI HALAMAN (atas → bawah).
       Setiap pin menambah ruang scroll; kalau scene di bawah dihitung lebih dulu, posisinya meleset
       dan layar bisa kosong / loncat. Karena itu urutannya mengikuti DOM, bukan urutan tulisan di sini. */
    const scenes = [
      [".scene-hero", sceneHero], [".scene-services", sceneServices], [".scene-work", sceneWork],
      [".scene-quote", sceneQuote], [".process.scene", sceneProcess], [".ambient-section.scene", sceneAmbient]
    ];
    $$(".scene").forEach(el => { const hit = scenes.find(([sel]) => el.matches(sel)); if (hit) hit[1](); });

    packages(); sceneCta();
    reveals(); scrubText(); pageHeroes(); workGrid(); projectPreviews(); productStrips();
    marquee(); progressBar(); heroLife();
  }

  // Pembungkus pin (pin-spacer) diberi warna yang sama dengan scene-nya, supaya tidak ada celah putih di antara dua bagian gelap
  function paintSpacers() {
    $$(".scene").forEach(sc => {
      const sp = sc.parentElement;
      if (sp && sp.classList.contains("pin-spacer")) sp.style.background = sc.classList.contains("scene-hero") ? "#000" : getComputedStyle(sc).backgroundColor;
    });
  }

  /* Elemen yang SUDAH terlihat saat halaman dibuka (mis. form kontak di HP) punya rentang animasi nol/negatif,
     sehingga ScrollTrigger tidak pernah menjalankannya dan elemen tertinggal tak terlihat (opacity 0).
     Untuk kasus itu animasi langsung diselesaikan ke kondisi akhirnya. */
  function settleZeroLength() {
    ScrollTrigger.getAll().forEach(st => {
      if (st.pin || !st.animation || st.end - st.start >= 2) return;
      const anim = st.animation;
      st.kill();
      anim.progress(1).kill();
    });
  }

  function start() {
    build();
    ScrollTrigger.addEventListener("refresh", () => { settleZeroLength(); paintSpacers(); });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  // Preloader sedang diputar → tunggu sampai selesai (posisi pin harus dihitung setelah layout final)
  if (root.dataset.intro === "on") window.addEventListener("intro:done", start, { once: true });
  else start();

  window.addEventListener("load", () => ScrollTrigger.refresh());
  let imgTimer;
  $$("img").forEach(im => { if (!im.complete) im.addEventListener("load", () => { clearTimeout(imgTimer); imgTimer = setTimeout(() => ScrollTrigger.refresh(), 120); }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  let t;
  window.addEventListener("layout:changed", () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 60); });
})();
