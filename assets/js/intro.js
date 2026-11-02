/* RAMUYA — preloader (GSAP)
   Diputar hanya jika intro-check.js menandai <html data-intro="on">
   (website baru dibuka atau halaman di-reload).
   Urutan: huruf muncul + hitung 0→100% → huruf mencar → tirai memudar → isi halaman naik dari bawah. */
(function () {
  const root = document.documentElement;
  if (root.dataset.intro !== "on") return;

  if (!window.gsap) {                       // GSAP gagal dimuat: lewati preloader
    delete root.dataset.intro; return;
  }

  const body = document.body;
  const letters = "ramuya".split("").map(c => `<span class="letter">${c}</span>`).join("");
  body.insertAdjacentHTML("afterbegin", `
    <div class="cinematic-loader" aria-hidden="true">
      <div class="loader-code code-a">&lt;ramuya /&gt;</div>
      <div class="loader-code code-b">010 / 011 / 001</div>
      <div class="loader-center">
        <img class="loader-mark" src="assets/images/logo-mark-light.png" alt="" width="211" height="261">
        <div class="loader-word">${letters}</div>
        <div class="loader-sub">web / design / development</div>
      </div>
      <div class="loader-bottom"><span>building something thoughtful</span><strong><i>0</i>%</strong></div>
      <div class="loader-progress"><span></span></div>
    </div>`);

  const loader = body.querySelector(".cinematic-loader");
  const letterEls = loader.querySelectorAll(".letter");
  const fades = loader.querySelectorAll(".loader-sub, .loader-code, .loader-bottom, .loader-progress, .loader-mark");
  const count = loader.querySelector(".loader-bottom strong i");
  const bar = loader.querySelector(".loader-progress span");
  const counter = { value: 0 };
  body.classList.add("loader-active");
  window.scrollTo(0, 0);

  // Arah terbang tiap huruf saat mencar (jarak dalam vw/vh)
  const fly = [[-110,-45,-20],[-60,60,16],[-20,-75,-12],[25,70,14],[65,-60,-17],[110,35,20]];

  gsap.set(letterEls, { yPercent: 70, opacity: 0, filter: "blur(12px)" });
  gsap.from(".loader-mark", { opacity: 0, y: 30, scale: 0.8, duration: 1.2, ease: "expo.out" });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(letterEls, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 1, stagger: 0.07 }, 0.1)
    .from(".loader-sub", { opacity: 0, y: 12, letterSpacing: "0.6em", duration: 1 }, 0.7)
    .to(counter, {                                              // hitung 0 → 100%
      value: 100, duration: 2.8, ease: "power1.inOut",
      onUpdate() { count.textContent = Math.round(counter.value); bar.style.width = counter.value + "%"; }
    }, 0.2)
    // 1) huruf mencar ke segala arah
    .to(letterEls, {
      x: i => fly[i][0] + "vw", y: i => fly[i][1] + "vh", rotation: i => fly[i][2],
      opacity: 0, filter: "blur(10px)", duration: 1.1, ease: "power3.in", stagger: { each: 0.03, from: "center" }
    }, 3.1)
    .to(fades, { opacity: 0, duration: 0.4, ease: "none" }, 3.1)
    // 2) tirai memudar, isi halaman naik dari bawah
    .add(() => {
      gsap.set("main", { opacity: 0, y: 110, filter: "blur(10px)" });
      delete root.dataset.intro;                                // tampilkan isi halaman
      window.dispatchEvent(new Event("intro:reveal"));          // navbar masuk sekarang
      gsap.to("main", { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.6, ease: "expo.out", clearProps: "transform,filter,opacity" });
    }, 3.9)
    .to(loader, { opacity: 0, duration: 0.8, ease: "none" }, 3.9)
    .add(() => {
      loader.remove();
      body.classList.remove("loader-active");
      window.dispatchEvent(new Event("intro:done"));            // scroll-story.js mulai setelah ini
    }, 5.6);
})();
