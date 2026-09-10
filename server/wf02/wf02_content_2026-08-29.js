// WF02 content pack — 2026-08-29 — Vacuum Bag Plastik Vakum Pakaian
// Minted: offer 738 / link 455 / slug vacbag-wf02-20260829 / aff_id=13
// Niche rotation (continuity from 08-26 household->decor->camping): home storage/organizing
// Research grounding: tokpee 2026 top Shopee category = household/daily-use #1;
//   vacuum storage = evergreen high-reorder organizer item; prior WF02 home pages = top clickers.
// MONETIZATION FLAG: tracking_url is plain shopee.co.id/search?utm_* (NO affiliate attribution
//   -> clicks log but conversions=0 structurally). See WF02 root-cause audit 2026-08-26.
const SMARTLINK = 'https://affiliate.berkahkarya.org/go/vacbag-wf02-20260829';

const tiktokScript = {
  title: 'Vacuum Bag Vakum Pakaian — Review 40 detik',
  hook: 'Lemari udah penuh tapi baju makin numpuk? Barang seharga kopi ini ngubah cara kamu nyimpen baju.',
  beats: [
    '0-3s HOOK: buka lemari sesak -> lempar 1 vacuum bag ke frame',
    '3-10s PROBLEM: baju musiman, selimut, jaket tebal makan tempat. Plastik biasa gak kedap udara, bau apek & gampang rayap',
    '10-22s DEMO: masukin baju/selimut -> tutup rapat -> hisap pakai vacum atau sepapan -> volume susut jadi 1/3',
    '22-32s BENEFIT: kedap udara, anti debu, anti bau, anti rayap; transparan jadi gampang cari; stackable di lemari',
    '32-40s CTA: "Nyimpen baju jadi rapi dalam 1 menit — cek link di bio sebelum promo habis!"',
  ],
  caption_tiktok: 'Lemari yang tadinya sesak, sekarang bisa napas 🫧✨ #vacumbag #organizerlemari #racunshopee #shopeefinds #homesolution #declutter #wajibpunya',
};

const fbPosts = [
  {
    page: '1180635355135195', // Ruang Rapi Daily
    persona: 'ruang_rapi',
    message: `🧺 LEMARI SESAK? Ini trik penyimpanan paling murah yang sering kelewat.\n\nVacuum Bag Plastik Vakum buat pakaian:\n✅ Masukin baju/selimut → hisap → volume susut jadi 1/3\n✅ Kedap udara — anti debu, anti bau apek, anti rayap\n✅ Transparan — gampang cari tanpa buka semua\n✅ Bisa di-stack rapi di lemari atau bawah kasur\n\nBuat yang suka de-clutter tapi tempat terbatas, ini game changer di bawah harga seblak. Detail produknya di sini: ${SMARTLINK}\n\n#organizerLemari #Declutter #RacunShopee #HomeSolution`,
  },
  {
    page: '1180497218477425', // Sudut Nyaman Go
    persona: 'sudut_nyaman',
    message: `🛏️ SELIMUT TEBAAL MUAT DI POJOKAN KECIL — kalau tahu ini.\n\nVacuum bag vakum pakaian:\n• Hemat 70% ruang lemari\n• Plastik tebal, seal kuat — tahan lama dipakai berulang\n• Isi 6–10 pcs sekali beli, cocok buat baju musiman & perlengkapan kasur\n• Simpan di bawah tempat tidur, di atas lemari, di bagasi — bebas\n\nRumah jadi lebih nyaman mulai dari cara nyimpen. Cek link: ${SMARTLINK}\n\n#SudutNyaman #VacumBag #RumahRapi #RacunShopee`,
  },
  {
    page: '1213521515173715', // Rekomendasi Homeliving Shopee
    persona: 'homeliving',
    message: `📦 REKOMENDASI HOMELIVING: Vacuum Bag Vakum Pakaian\n\nKenapa worth it:\n1. Ruang lemari langsung longgar — baju tebal jadi setipis bantal\n2. Proteksi maksimal — debu, kelembapan, & rayap gak nembus\n3. Reusable — beli sekali dipakai bertahun-tahun\n4. Travel-friendly — bawa baju lebih banyak di koper yang sama\n\nHarga mulai belasan ribu per set. Link produk: ${SMARTLINK}\n\n#RekomendasiHomeliving #VacumBag #ShopeeFinds #Organizer`,
  },
];

module.exports = { SMARTLINK, offer: 738, link: 455, tiktokScript, fbPosts };
