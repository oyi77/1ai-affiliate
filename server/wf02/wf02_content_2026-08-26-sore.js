// WF02 content pack — 2026-08-26 evening batch 3 — Kursi Lipat Camping Portabel
// Minted: offer 737 / link 409 / slug kursicamping-wf02-0826-sore / aff_id=13
// Niche rotation: household storage (AM) -> home decor lighting (noon) -> outdoor/camping (PM)
// Research note: tikwm CF-blocked, tokpee API 404, Google Trends ID = news only.
// Grounding: tokpee morning data (household #1 Shopee category), historical WF02 click
// history (gear/accessories = top raw clickers), 80-page roster has 5+ dedicated outdoor pages.
const SMARTLINK = 'https://affiliate.berkahkarya.org/go/kursicamping-wf02-0826-sore';

const tiktokScript = {
  title: 'Kursi Lipat Camping Portabel — Review 40 detik',
  hook: 'Kursi camping keliatan mahal di toko outdoor — ini versi Rp puluhan ribuan yang quality-nya nggak kalah.',
  beats: [
    '0-3s HOOK: lempar tas kursi ke tanah -> kibaskan satu tangan -> langsung berdiri jadi kursi',
    '3-10s PROBLEM: kursi camping brand ternama 300rb+, cuma buat duduk santai doang sayang budgetnya',
    '10-22s DEMO: bongkar dari tas -> unfold 3 detik; duduki penuh (test badan dewasa); lipat balik masuk tas punggung',
    '22-32s BENEFIT: rangka baja ringan, kain oxford anti sobek, muat di sela motor, cocok buat mancing/nonton konser/piknik',
    '32-40s CTA: "Viral di FYP buat weekend outdoor, cek link di bio sebelum stok habis!"',
  ],
  caption_tiktok: 'Duduk manis di mana aja 🏕️✨ #kursicamping #camping #racunshopee #shopeefinds #outdoorgear #piknik #wajibpunya',
};

const fbPosts = [
  {
    page: '1164672033402210', // Alat Camping Supply
    persona: 'alat_camping',
    message: `🏕 KURSI CAMPING PORTABEL — barang yang selalu ditanyain pas kita post spot camping.

Yang bikin worth it:
✅ Unfold 3 detik, nggak perlu rakit — keluarkan dari tas, kibaskan, langsung berdiri
✅ Rangka baja ringan tapi pegang beban dewasa dengan stabil
✅ Kain oxford tebal, anti sobek walau dipakai di tanah kasar
✅ Dilipat jadi ukuran tas punggung — gampang diselipin di motor

Buat yang rencana weekend mau ke gunung atau curug, ini upgrade duduk-duduk paling murah. Info produknya di sini: ${SMARTLINK}

#perlengkapanCamping #KursiLipat #RacunShopee #OutdoorGear`,
  },
  {
    page: '1269331122921676', // Joran Mancing Gear
    persona: 'joran_mancing',
    message: `🎣 MANCING LAMA BADAN PEGAL? Ini solusi paling murah.

Kursi lipat portabel buat teman mancing:
• Ringan — digantung di bahu atau diselipin di motor bareng alat mancing
• Buka-tutup 3 detik, pindah spot tinggal lipat
• Kaki stabil di tanah pinggir kolam/empang
• Kain cepat kering, nggak masalah kena cipratan

Harga mulai puluhan ribuan — lebih murah dari umpan sekali beli. Detail produk: ${SMARTLINK}

#alatMancing #KursiLipat #MancingMania #RacunShopee`,
  },
  {
    page: '1177055325492228', // Hobi Praktis Go
    persona: 'hobi_praktis',
    message: `🧗 HOBI OUTDOOR NGGAK HARUS MAHAL — mulai dari cara duduknya.

Review singkat kursi lipat camping portabel yang lagi sering muncul di FYP:

1. Praktis — sekali kibas langsung siap pakai, nggak ada tiang yang harus dipasang
2. Portabel — setelah dilipat sekecil tas selempang besar
3. Serbaguna — piknik, kamping, nonton konser tunggu artis, antre test pack
4. Mudah dibersihkan — lap basah langsung bersih

Buat yang baru mau mulai hobi outdoor, ini biasanya pembelian pertama yang paling sering kepake. Link produk: ${SMARTLINK}

#HobiOutdoor #Piknik #KursiLipat #RacunShopee`,
  },
];

module.exports = { SMARTLINK, tiktokScript, fbPosts };
