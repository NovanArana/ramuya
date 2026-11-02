/* RAMUYA — interaksi GSAP: transisi halaman, tombol magnetik, kursor "View", animasi menu mobile.
   (Animasi yang mengikuti scroll ada di scroll-story.js) */
(function () {
  const root = document.documentElement;
  if (!window.gsap || !root.classList.contains("story-on")) return;

  const body = document.body;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Transisi pindah halaman ----------
     Klik link → tirai hijau naik menutupi layar → halaman baru dibuka → tirai naik lagi meninggalkan layar. */
  const wipe = document.createElement("div");
  wipe.className = "page-wipe";
  wipe.setAttribute("aria-hidden", "true");
  wipe.innerHTML = "<span>ramuya<b>.</b></span>";
  body.appendChild(wipe);
  // Posisi tirai (yPercent):  0 = di bawah layar · -100 = menutupi layar · -200 = di atas layar
  if (root.classList.contains("vz-arriving")) {         // baru tiba dari halaman lain
    gsap.set(wipe, { yPercent: -100 });
    root.classList.remove("vz-arriving");
    gsap.to(wipe, { yPercent: -200, duration: 0.9, delay: 0.1, ease: "power3.inOut" });
  }

  document.querySelectorAll("a[href]").forEach(a => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href) || !/\.html($|[?#])/.test(href)) return;
    a.addEventListener("click", e => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || a.target === "_blank") return;
      e.preventDefault();
      try { sessionStorage.setItem("ramuya-arriving", "1"); } catch (err) { /* abaikan */ }
      gsap.fromTo(wipe, { yPercent: 0 }, { yPercent: -100, duration: 0.8, ease: "power3.inOut", onComplete: () => { location.href = href; } });
    });
  });
  window.addEventListener("pageshow", e => { if (e.persisted) gsap.set(wipe, { yPercent: 0 }); });   // tombol back/forward

  /* ---------- Tombol magnetik (mouse saja) ---------- */
  if (finePointer) {
    document.querySelectorAll(".magnetic").forEach(el => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "elastic.out(1, 0.45)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "elastic.out(1, 0.45)" });
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });

    /* ---------- Kursor "View" di atas kartu proyek ---------- */
    const label = document.createElement("div");
    label.className = "cursor-label";
    body.appendChild(label);
    gsap.set(label, { xPercent: -50, yPercent: -50, scale: 0.6 });
    const lx = gsap.quickTo(label, "x", { duration: 0.35, ease: "power3" });
    const ly = gsap.quickTo(label, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("pointermove", e => { lx(e.clientX + 28); ly(e.clientY + 28); });
    document.querySelectorAll("[data-cursor]").forEach(el => {
      el.addEventListener("pointerenter", () => {
        label.textContent = el.dataset.cursor;
        gsap.to(label, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)", overwrite: true });
      });
      el.addEventListener("pointerleave", () => gsap.to(label, { opacity: 0, scale: 0.6, duration: 0.25, overwrite: true }));
    });
  }

  /* ---------- Navbar modern ----------
     • masuk meluncur dari atas
     • "pill" penanda mengikuti link yang di-hover (dan kembali ke halaman aktif)
     • mengecil (compact) saat halaman di-scroll
     • tema terang/gelap mengikuti latar di bawahnya (diatur scroll-story.js lewat class .on-dark) */
  const bar = document.querySelector(".header-bar");
  const nav = document.querySelector(".nav");
  if (bar && nav) {
    const playIn = (delay = 0.1) => gsap.fromTo(bar, { y: -90, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, delay, ease: "expo.out", clearProps: "transform,opacity" });   // clearProps: transform memenjarakan menu mobile
    if (root.dataset.intro === "on") {
      gsap.set(bar, { opacity: 0 });
      window.addEventListener("intro:reveal", () => playIn(0.3), { once: true });
    } else playIn();

    const pill = document.createElement("span");
    pill.className = "nav-pill";
    nav.prepend(pill);
    const links = [...nav.querySelectorAll("a:not(.nav-cta)")];
    const active = links.find(a => a.classList.contains("active"));
    const moveTo = (a, instant) => {
      if (!a || innerWidth <= 850) { gsap.to(pill, { opacity: 0, duration: 0.3 }); return; }
      const nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
      const vars = { x: r.left - nr.left, y: r.top - nr.top, width: r.width, height: r.height, opacity: 1 };
      instant ? gsap.set(pill, vars) : gsap.to(pill, { ...vars, duration: 0.55, ease: "expo.out" });
    };
    links.forEach(a => a.addEventListener("pointerenter", () => moveTo(a)));
    nav.addEventListener("pointerleave", () => moveTo(active));
    const place = () => { gsap.set(pill, { opacity: 0 }); moveTo(active, true); };
    window.addEventListener("load", place);
    window.addEventListener("resize", place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);

    window.addEventListener("scroll", () => bar.classList.toggle("is-compact", window.scrollY > 60), { passive: true });

    const cta = nav.querySelector(".nav-cta");           // tombol "Let's talk" sedikit magnetik
    if (cta && finePointer) {
      const xTo = gsap.quickTo(cta, "x", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
      const yTo = gsap.quickTo(cta, "y", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
      cta.addEventListener("pointermove", e => { const r = cta.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.25); });
      cta.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    }
  }

  /* ---------- Menu mobile: link muncul bergantian ---------- */
  window.addEventListener("nav:toggle", e => {
    if (!e.detail.open || innerWidth > 850) return;
    gsap.fromTo(".nav > a", { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.07, delay: 0.25, clearProps: "transform,opacity" });
  });
})();
