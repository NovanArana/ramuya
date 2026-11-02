/* RAMUYA — main script: navigasi, kontak, filter proyek.
   Animasi ada di: intro.js (preloader), motion.js (interaksi), scroll-story.js (animasi scroll). */

/* =====================================================================
   PENGATURAN KONTAK — ubah di sini saja, berlaku untuk seluruh website
   ===================================================================== */
const CONTACT = {
  whatsapp: "6281977529310",          // nomor WhatsApp, format internasional tanpa + atau 0 di depan
  email: "ramuya2026@gmail.com",    // email tujuan form di halaman Contact
  whatsappMessage: "Halo Ramuya, saya tertarik membuat website. Boleh minta info lebih lanjut?"
};

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /* ---------- Tombol CTA -> WhatsApp ---------- */
  document.querySelectorAll("a[data-whatsapp]").forEach(a => {
    a.href = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(a.dataset.waText || CONTACT.whatsappMessage)}`;   // data-wa-text = pesan khusus tombol ini
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- Form kontak -> Gmail ----------
     Saat disubmit, pengunjung dibawa ke Gmail (tab baru) dengan penerima, subjek,
     dan pesan yang sudah terisi. Tinggal menekan "Send". */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = form.querySelector(".form-status");

    function showFallback(gmail, mailto) {
      status.append(" Didn't open? ");
      [["Open Gmail", gmail, "_blank"], ["Use email app", mailto, "_self"]].forEach(([label, href, target], i) => {
        if (i) status.append(" · ");
        const a = document.createElement("a");
        a.textContent = label; a.href = href; a.target = target; a.rel = "noopener";
        status.append(a);
      });
    }

    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const data = Object.fromEntries(new FormData(form));
      if (data._honey) return;                       // bot terdeteksi

      const subject = `Ramuya inquiry — ${data.project_type} (${data.name})`;
      const text = `Hi Ramuya,\n\n${data.message}\n\n—\nName: ${data.name}\nEmail: ${data.email}\nProject: ${data.project_type}`;
      const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

      const tab = window.open(gmail, "_blank");      // harus dipanggil langsung dari klik pengunjung
      status.classList.remove("is-error");
      if (tab) {
        tab.opener = null;
        status.textContent = "Gmail is opening with your message ready — just press Send there.";
      } else {
        status.textContent = "Your browser blocked the Gmail tab.";
        status.classList.add("is-error");
        showFallback(gmail, mailto);
      }
    });
  }

  /* ---------- Menu mobile (layar penuh) ----------
     Animasi isi menu ada di motion.js (mendengarkan event "nav:toggle"). */
  const menu = document.querySelector(".menu-toggle"), nav = document.querySelector(".nav");
  function setNav(open) {
    if (!menu || !nav) return;
    menu.classList.toggle("open", open);
    nav.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    body.classList.toggle("nav-open", open);
    window.dispatchEvent(new CustomEvent("nav:toggle", { detail: { open } }));
  }
  if (menu && nav) {
    menu.addEventListener("click", () => setNav(!nav.classList.contains("open")));
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setNav(false)));
    document.addEventListener("keydown", e => { if (e.key === "Escape") setNav(false); });
    window.addEventListener("resize", () => { if (innerWidth > 850) setNav(false); });
  }

  /* ---------- Filter proyek (halaman Work) ----------
     Tombol punya data-filter="Travel", kartu punya data-category="Travel". "all" = semua. */
  const filterButtons = document.querySelectorAll(".portfolio-filter button");
  const workItems = document.querySelectorAll(".work-grid .work-item");
  const workGrid = document.querySelector(".work-grid");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      workGrid.classList.toggle("is-filtered", filter !== "all");
      workItems.forEach(item => item.classList.toggle("is-hidden", filter !== "all" && item.dataset.category !== filter));
      window.dispatchEvent(new Event("layout:changed"));   // scroll-story.js menghitung ulang posisi animasi
    });
  });

  /* ---------- Cadangan tanpa GSAP: header sembunyi saat scroll turun ---------- */
  if (!window.gsap) {
    const header = document.querySelector(".site-header");
    let last = 0;
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (header && !body.classList.contains("nav-open")) {
        if (y > 120 && y > last + 8) header.classList.add("is-hidden");
        else if (y < last - 5) header.classList.remove("is-hidden");
      }
      last = y;
    }, { passive: true });
    const io = "IntersectionObserver" in window && new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("is-visible")), { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("is-visible"));
  }
});
