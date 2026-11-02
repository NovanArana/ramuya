/* RAMUYA — scroll halus (Lenis)
   Lenis membuat scroll mouse/trackpad meluncur pelan, dan bekerja rapi bersama GSAP ScrollTrigger
   (bagian yang di-pin tidak loncat, posisi tetap sinkron saat ukuran halaman berubah).
   - Di HP/tablet tetap scroll bawaan (gerakan jari sudah halus).
   - Mati otomatis kalau pengunjung memilih "reduce motion".
   Kecepatan: ubah `lerp` (kecil = lebih pelan & mewah) dan `wheelMultiplier`. */
(function () {
  const root = document.documentElement;
  if (!window.Lenis || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const lenis = new Lenis({
    lerp: 0.085,              // 0.05 = sangat pelan · 0.15 = lebih responsif
    wheelMultiplier: 0.9,
    smoothWheel: true
  });
  window.lenis = lenis;
  root.classList.add("smooth-scroll");

  if (window.gsap && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);                   // ScrollTrigger selalu tahu posisi terbaru
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const loop = t => { lenis.raf(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  // Link anchor (#bagian) ikut meluncur pelan
  document.addEventListener("click", e => {
    const link = e.target.closest('a[href^="#"]');
    const id = link && link.getAttribute("href").slice(1);
    const el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el, { offset: -90 });
  });

  // Preloader / menu mobile terbuka → scroll dikunci
  const sync = () => (document.body.classList.contains("loader-active") || document.body.classList.contains("nav-open")) ? lenis.stop() : lenis.start();
  sync();
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
})();
