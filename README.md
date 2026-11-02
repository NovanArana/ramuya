# Ramuya — Freelance Web Design Studio

Website multi-page static untuk brand Ramuya.

## Pages
- index.html — Home
- services.html — Services
- work.html — Portfolio (3 proyek, dengan filter)
- project-nusa-trail.html, project-enviora.html, project-gracie-efata-house.html, project-mi-baguetto.html — halaman detail proyek
- about.html — About
- contact.html — Contact

## Stack
HTML, CSS, vanilla JavaScript.
Font: Playfair Display + DM Sans (Google Fonts).

## Run
Buka `index.html` langsung di browser, atau gunakan Live Server di VS Code.

## Catatan
- Form contact masih frontend-only. Sambungkan ke Formspree, EmailJS, backend PHP, atau service pilihanmu untuk benar-benar mengirim inquiry.
- Link Instagram/Behance masih placeholder.

## Logo & Google
- Logo lengkap: `assets/images/ramuya-logo.png`
- Ikon tab/Google: `assets/images/favicon-*.png`, `favicon.ico`, `apple-touch-icon.png`
- Blok `<head>` (ikon + data `Organization` untuk Google) ada di setiap halaman, diawali komentar "Brand icons".
- Ganti `https://ramuya.com` di blok itu dengan domain asli saat website online.

## Menambah proyek baru
1. Salin salah satu `project-*.html`, ganti teks dan link live-nya.
2. Tambahkan kartu di `work.html` dan `index.html` (salin kartu yang ada, ubah `href` dan `data-category`).
3. Kalau kategori baru, tambahkan tombol `data-filter` di `work.html`.

## Kontak
- Nomor WhatsApp & email tujuan diatur di bagian `CONTACT` paling atas `assets/js/main.js`.
- Semua tombol CTA (link bertanda `data-whatsapp`) membuka WhatsApp dengan pesan otomatis.
- Form di halaman Contact tidak dikirim ke server: saat disubmit, pengunjung dibuka tab Gmail dengan penerima, subjek, dan pesan yang sudah terisi, tinggal menekan Send. Kalau tab diblokir browser, muncul link cadangan (Gmail / aplikasi email).


## Desain (Ramuya — gaya halaman produk Apple)
- Gaya ada di `assets/css/style.css` (daftar isi di bagian atas). Palet dan font diatur di blok `:root`.
- Font: SF Pro (bawaan perangkat Apple), otomatis memakai Inter di perangkat lain.
- Logo & ikon (`assets/images/ramuya-logo.png`, `favicon-*.png`, `apple-touch-icon.png`) masih sementara — ganti dengan logo resmi.
- Ganti `https://ramuya.com` di blok "Brand icons" setiap halaman dengan domain asli.

## Animasi (GSAP)
GSAP, ScrollTrigger, dan Lenis disimpan lokal di `assets/js/vendor/` (tidak perlu internet).
- `intro-check.js` — menentukan apakah preloader diputar (website baru dibuka / reload) dan apakah animasi scroll aktif.
- `intro.js` — preloader (huruf muncul, hitung 0–100%, huruf mencar).
- `scroll-story.js` — semua animasi scroll: hero zoom, services horizontal, work berganti, quote, paket, phone 3D, dll. Animasi mengikuti posisi scroll (berhenti saat scroll berhenti, mundur saat scroll naik).
- `motion.js` — transisi pindah halaman, tombol magnetik, kursor "View", animasi menu mobile.
- `smooth-scroll.js` — scroll halus memakai Lenis (kecepatan: `lerp` dan `wheelMultiplier` di atas file).
- Pengunjung dengan "reduce motion" otomatis mendapat versi tanpa animasi scroll.

## Paket & special offer (beranda & halaman Services)
- Isinya ada di fungsi `packages()` pada bagian HTML. Di file HTML, cari komentar "Ganti Custom quote dengan harga paket kamu".
- Teks special offer: cari komentar "Special offer".
- Tombol paket membuka WhatsApp dengan pesan khusus lewat atribut `data-wa-text`.

## Navbar
- Logo asli: `assets/images/logo-lockup-dark.png` (latar terang) dan `logo-lockup-light.png` (latar gelap). Navbar bertukar logo & warna otomatis saat melewati bagian gelap.
- Gaya navbar ada di bagian "4. HEADER" pada `style.css`, animasinya di `motion.js`.
"# ramuya" 
