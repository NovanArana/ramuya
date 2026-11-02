/* RAMUYA — penentu mode halaman (dimuat di <head>, sebelum halaman tampil)
   Hasilnya ditulis ke <html> dan dipakai oleh CSS + script lain:
     data-intro="on"   → preloader diputar (website baru dibuka, atau halaman di-reload)
     .vz-arriving      → baru pindah halaman dari dalam website (tirai transisi dilepas oleh motion.js)
     .story-on         → animasi scroll GSAP aktif (mati kalau pengunjung memilih "reduce motion") */
(function () {
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = performance.getEntriesByType("navigation")[0];
  const isReload = !!nav && nav.type === "reload";

  let isFirstVisit = true, arriving = false;
  try {
    isFirstVisit = !sessionStorage.getItem("ramuya-intro-seen");
    sessionStorage.setItem("ramuya-intro-seen", "1");
    arriving = sessionStorage.getItem("ramuya-arriving") === "1";
    sessionStorage.removeItem("ramuya-arriving");
  } catch (e) { /* storage diblokir */ }

  if (reduceMotion) return;
  root.classList.add("story-on");
  if (isReload || isFirstVisit) root.dataset.intro = "on";
  else if (arriving) root.classList.add("vz-arriving");
})();
