// WF02 content pack — 2026-08-26 morning — Rak Dapur Multifungsi
const SMARTLINK = 'https://affiliate.berkahkarya.org/go/rak-dapur-multifungsi-wf02-0826';

const tiktokScript = {
  title: 'Rak Dapur Multifungsi — Review 35 detik',
  hook: 'Dapur kecil tapi barang numpuk? Rak Rp 50ribuan ini yang bikin dapur aku rapi kayak pantry kafe.',
  beats: [
    '0-3s HOOK: tunjukin dapur sebelum-sesudah (before-after paling nyolok)',
    '3-10s PROBLEM: bumbu, toples, spice jar berserakan di meja',
    '10-20s DEMO: pasang rak susun 2 tingkat -> muat 2x lipat di space yang sama; ada lubang drainase jadi bisa buat ngeringin cuci piring',
    '20-28s BENEFIT: rakitan tanpa alat, bahan besi anti karat + coating, nggak goyang ditest dorong',
    '28-35s CTA: "Sold 10rb+ di Shopee, harga masih di bawah 100rb. Cek link di bio!"',
  ],
  caption_tiktok: 'Dapur rapi gak harus mahal 🧽✨ #rakdapur #dapurrapi #racunshopee #shopeefinds #organizerdapur #wajibpunya',
};

const fbPosts = [
  {
    page: '1100348683171135', // Dapur Mbak Maya — niche match
    persona: 'mbak_maya',
    message: `Dapur berasa sesek? 😅 Mbak Maya kemarin beresin sudut bumbu pakai rak susun multifungsi ini — toples bumbu, botol minyak, sampoel sabun cuci piring semua masuk satu rak.

Yang bikin nagih:
✅ Susun 2 tingkat → meja yang sama kapasitasnya dobel
✅ Ada talang airnya → bisa buat ngeringkan piring gelas
✅ Rakitan gampang, nggak perlu bor atau tukang

Harganya di bawah 100rb, dapur kelihatan jauh lebih rapi. Yang mau intip modelnya:
${SMARTLINK}

#dapurrapi #rakdapur #racunshopee #organizerdapur`,
  },
  {
    page: '1261383173717210', // Pak Dimas Mengulas
    persona: 'pak_dimas',
    message: `Review jujur: Rak Dapur Susun Multifungsi 🔍

Kubeli buat naruh 14 toples bumbu + 4 botol minyak. Kesimpulan 1 minggu pemakaian:

1. Kapasitas — susun 2 tingkat benar-benar hemat tempat, area kompor jadi lega.
2. Build quality — besi dengan coating, sampai sekarang belum ada karat walau sering kena cipratan air.
3. Perakitan — 5 menit beres, cukup tangan.

Nilai plus: ada saluran airnya, jadi dobel fungsi buat peniring piring.

Buat yang tanya-tanya di kolom komentar, ini toko yang kubeli: ${SMARTLINK}

#reviewjujur #pakdismengulas #rakdapur`,
  },
  {
    page: '1223844200805915', // Catatan Kak Sari
    persona: 'kak_sari',
    message: `📝 CATATAN BELANJA MINGGU INI — Rak Dapur Multifungsi

Masalah: meja daput sempit, bumbu numpuk, nyari micin aja kelamaan.
Solusi: rak susun 2 tingkat multifungsi.

Catatan penting:
• Muat ±14 toples ukuran sedang
· Bahan besi coating, ada lubang drainasenya
• Rakitan sendiri 5 menit, aman buat yang gaprek
• Harga masih di bawah seratus ribuan

Sudah seminggu dipakai dan meja dapur akhirnya lega. Link tokonya Kaka simpan di sini ya:
${SMARTLINK}

#catatankaksari #belanjahemat #dapurrapi`,
  },
];

module.exports = { SMARTLINK, tiktokScript, fbPosts };
