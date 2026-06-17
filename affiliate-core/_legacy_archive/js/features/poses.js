(function () {
  const e = document.getElementById("poses-uploadArea");
  const t = document.getElementById("poses-imageUpload");
  const a = document.getElementById("poses-previewContainer");
  const n = document.getElementById("poses-imagePreview");
  const i = document.getElementById("poses-fileName");
  const o = document.getElementById("poses-selectPoseBtn");
  const s = document.getElementById("poses-generateBtn");
  const r = document.getElementById("poses-resultsContainer");
  const l = document.getElementById("poses-resultsGrid");
  const d = document.getElementById("poses-errorContainer");
  const c = document.getElementById("poses-errorMessage");
  const m = document.getElementById("poses-poseModal");
  const u = document.getElementById("poses-cancelModalBtn");
  const g = document.getElementById("poses-poseListContainer");
  const p = document.getElementById("poses-selectionCounter");
  const h = document.getElementById("poses-customPoseInput");
  const f = document.getElementById("poses-download-all-btn");
  let y = null;
  let b = [];
  function w(e) {
    if (c) {
      c.textContent = e;
      d.classList.remove("hidden");
    }
  }
  function v() {
    if (d) {
      d.classList.add("hidden");
    }
  }
  function k(e) {
    if (!t) {
      return;
    }
    const s = e.target.files[0];
    if (s) {
      v();
      r.classList.add("hidden");
      l.innerHTML = "";
      const e = new FileReader();
      e.onload = e => {
        y = e.target.result;
        n.src = y;
      };
      e.readAsDataURL(s);
      i.textContent = s.name;
      a.classList.remove("hidden");
      o.disabled = false;
    }
  }
  async function E(e, t, a) {
    const n = {
      contents: [{
        parts: [{
          text: `Dari gambar yang diberikan, ubah pose model sesuai instruksi: '${a}'. Penting: Jangan ubah pakaian, latar belakang, atau tema foto asli. Pertahankan semuanya, hanya ubah pose model.`
        }, {
          inlineData: {
            mimeType: t,
            data: e
          }
        }]
      }],
      generationConfig: {
        responseModalities: ["IMAGE"]
      }
    };
    const i = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=" + window.getGeminiApiKey(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(n)
    });
    if (!i.ok) {
      const e = await i.json();
      throw new Error(`API Error: ${e.error.message}`);
    }
    const o = await i.json();
    const s = o.candidates?.[0]?.content?.parts?.find(e => e.inlineData)?.inlineData?.data;
    if (!s) {
      throw new Error("Tidak ada data gambar dari API.");
    }
    return s;
  }
  function I(e, t) {
    const a = document.createElement("div");
    a.id = e;
    a.className = "bg-gray-100/50 rounded-lg overflow-hidden border border-gray-300";
    a.setAttribute("data-pose", t);
    return a;
  }
  function L(e, t, a) {
    const n = document.getElementById(e);
    const i = a.replace(/\s/g, "_").replace(/[^a-z0-9_]/gi, "");
    b.push({
      url: t,
      filename: `${i}.png`
    });
    if (b.length > 0 && f) {
      f.classList.remove("hidden");
    }
    if (n) {
      n.innerHTML = `<img src="${t}" alt="Generated ${a}" class="w-full h-auto object-cover aspect-[3/4]"><div class="p-3 text-center"><button data-action="poses-download" data-image-url="${t}" data-filename="${i}.png" class="btn-primary text-sm font-semibold py-2 px-4 rounded-md">Unduh</button></div>`;
    }
  }
  function x(e, t, a) {
    const n = document.getElementById(e);
    if (n) {
      n.innerHTML = `<div class="w-full aspect-[3/4] flex flex-col items-center justify-center bg-red-100/30 text-red-600 p-4"><p class="text-sm font-semibold text-center">Gagal</p></div><div class="p-3 text-center"><button onclick="window.retryPosesGenerationForCard('${e}', \`${t}\`)" class="bg-yellow-400 text-sm font-semibold py-2 px-4 rounded-md">Ulangi</button></div>`;
    }
  }
  window.retryPosesGenerationForCard = async function (e, t) {
    const a = document.getElementById(e);
    if (a && y) {
      a.innerHTML = "<div class=\"w-full aspect-[3/4] flex items-center justify-center bg-gray-100/50\"><div class=\"loader card-loader\"></div></div><div class=\"p-3 text-center\"><p class=\"text-sm text-gray-500\">Mencoba lagi...</p></div>";
      try {
        const a = y.split(",")[1];
        const n = y.split(",")[0].split(":")[1].split(";")[0];
        L(e, `data:image/png;base64,${await E(a, n, t)}`, t);
      } catch (a) {
        x(e, t, a.message);
      }
    }
  };
  if (e) {
    e.addEventListener("dragover", t => {
      t.preventDefault();
      e.classList.add("border-cyan-500");
    });
  }
  if (e) {
    e.addEventListener("dragleave", () => e.classList.remove("border-cyan-500"));
  }
  if (e) {
    e.addEventListener("drop", a => {
      a.preventDefault();
      e.classList.remove("border-cyan-500");
      if (a.dataTransfer.files[0]) {
        t.files = a.dataTransfer.files;
        k({
          target: t
        });
      }
    });
  }
  if (t) {
    t.addEventListener("change", k);
  }
  if (o) {
    o.addEventListener("click", () => {
      if (!window.checkApiKey()) {
        return;
      }
      const e = h ? h.value.trim() : "";
      if (e) {
        (async function (e) {
          if (!y) {
            w("Silakan unggah gambar terlebih dahulu.");
            return;
          }
          b = [];
          if (f) {
            f.classList.add("hidden");
          }
          o.disabled = true;
          v();
          a.classList.add("hidden");
          r.classList.remove("hidden");
          r.querySelector("h2").textContent = "AI sedang bekerja...";
          l.innerHTML = "";
          const t = y.split(",")[1];
          const n = y.split(",")[0].split(":")[1].split(";")[0];
          const i = [`${e}, variation 1: slightly different angle`, `${e}, variation 2: different perspective`, `${e}, variation 3: alternative view`, `${e}, variation 4: slightly adjusted position`, `${e}, variation 5: different angle`, `${e}, variation 6: unique perspective`];
          i.forEach((e, t) => {
            const a = I(`poses-loader-${t}`, e);
            a.innerHTML = "<div class=\"w-full aspect-[3/4] flex items-center justify-center bg-gray-100/50\"><div class=\"loader card-loader\"></div></div><div class=\"p-3 text-center\"><p class=\"text-sm text-gray-500\">Membuat pose...</p></div>";
            l.appendChild(a);
          });
          for (let e = 0; e < i.length; e++) {
            const a = i[e];
            try {
              L(`poses-loader-${e}`, `data:image/png;base64,${await E(t, n, a)}`, `Custom Pose ${e + 1}`);
            } catch (t) {
              x(`poses-loader-${e}`, `Custom Pose ${e + 1}`, t.message);
            }
          }
          r.querySelector("h2").textContent = "Hasil Pose Telah Siap!";
          o.disabled = false;
        })(e);
      } else {
        m.classList.remove("hidden");
      }
    });
  }
  if (u) {
    u.addEventListener("click", () => m.classList.add("hidden"));
  }
  if (s) {
    s.addEventListener("click", async function () {
      if (!window.checkApiKey()) {
        return;
      }
      if (!y) {
        w("Silakan unggah gambar.");
        return;
      }
      const e = Array.from(g.querySelectorAll("input[type=\"checkbox\"]:checked")).map(e => e.value);
      if (e.length === 0) {
        w("Pilih setidaknya satu pose.");
        return;
      }
      b = [];
      if (f) {
        f.classList.add("hidden");
      }
      m.classList.add("hidden");
      o.disabled = true;
      s.disabled = true;
      v();
      a.classList.add("hidden");
      r.classList.remove("hidden");
      r.querySelector("h2").textContent = "AI sedang bekerja...";
      l.innerHTML = "";
      const t = y.split(",")[1];
      const n = y.split(",")[0].split(":")[1].split(";")[0];
      e.forEach((e, t) => {
        const a = I(`poses-loader-${t}`, e);
        a.innerHTML = "<div class=\"w-full aspect-[3/4] flex items-center justify-center bg-gray-100/50\"><div class=\"loader card-loader\"></div></div><div class=\"p-3 text-center\"><p class=\"text-sm text-gray-500\">Membuat pose...</p></div>";
        l.appendChild(a);
      });
      for (let a = 0; a < e.length; a++) {
        const i = e[a];
        try {
          L(`poses-loader-${a}`, `data:image/png;base64,${await E(t, n, i)}`, i);
        } catch (e) {
          x(`poses-loader-${a}`, i, e.message);
        }
      }
      r.querySelector("h2").textContent = "Hasil Pose Telah Siap!";
      o.disabled = false;
    });
  }
  if (f) {
    f.addEventListener("click", async () => {
      if (b.length !== 0) {
        f.disabled = true;
        f.innerHTML = "<i class=\"fas fa-spinner fa-spin mr-2\"></i>Downloading...";
        for (let e = 0; e < b.length; e++) {
          const t = b[e];
          if (window.downloadDataURINew) {
            await window.downloadDataURINew(t.url, t.filename);
            await new Promise(e => setTimeout(e, 500));
          }
        }
        f.disabled = false;
        f.innerHTML = "<i class=\"fas fa-download mr-2\"></i>Download Semua";
      }
    });
  }
  if (l) {
    l.addEventListener("click", async e => {
      const t = e.target.closest("[data-action=\"poses-download\"]");
      if (t) {
        e.stopPropagation();
        const a = t.dataset.imageUrl;
        const n = t.dataset.filename;
        if (a && n && window.downloadDataURINew) {
          await window.downloadDataURINew(a, n);
        }
      }
    });
  }
  if (g) {
    g.innerHTML = "";
    ["Pose fashion dinamis dengan satu tangan di pinggul dan tangan lainnya diangkat ke atas", "Pose klasik dengan tangan di saku celana", "Menyender ke dinding dengan santai, satu kaki ditekuk", "Pose fashion dinamis membentuk huruf S dengan tubuh", "Berdiri tegak dengan tatapan kuat, tangan menyilang di dada", "Pose contrapposto, berat badan pada satu kaki, pinggul miring", "Berdiri dengan kaki terbuka lebar, pose yang kuat dan percaya diri", "Pose dari belakang (standing backpose), menoleh sedikit ke kamera", "Pose dari samping (side profile), menatap lurus ke depan", "Satu tangan di pinggul, tangan lain memegang kerah baju atau aksesori", "Pose asimetris, satu bahu lebih tinggi dari yang lain", "Pose minimalis, berdiri lurus menatap kamera dengan ekspresi netral", "Pose berjalan, seolah-olah tertangkap kamera sedang melangkah", "Pose melompat kecil dengan ekspresi ceria", "Pose berputar (spinning), dengan gaun atau rambut yang bergerak", "Pose berlari kecil dengan gaya candid", "Duduk di kursi dengan elegan, satu kaki menyilang di atas yang lain", "Duduk di lantai dengan santai, satu lutut ditekuk ke atas", "Duduk di tangga, menatap ke arah atas atau bawah", "Duduk di lantai dengan kaki lurus ke depan, menonjolkan sepatu", "Beauty shot close-up, fokus pada wajah dan riasan, dengan senyuman lembut", "Tangan membingkai wajah atau menyentuh rambut dengan lembut", "Pose half-body yang elegan, satu tangan diangkat ke dekat dagu", "Menatap tajam ke kamera dengan ekspresi serius (fierce)", "Tertawa lepas, candid close-up", "Satu tangan di bahu, tubuh sedikit miring ke samping", "Melihat ke belakang lewat bahu (over-the-shoulder)", "Pose dramatis dengan permainan bayangan yang kuat pada wajah atau tubuh", "Berinteraksi dengan properti (misal: memegang topi, kacamata, atau tas)", "Pose berbaring di lantai atau sofa dengan gaya high fashion"].forEach(e => {
      const t = document.createElement("div");
      t.className = "flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors";
      const a = `pose-${e.replace(/[^a-zA-Z0-9]/g, "-")}`;
      t.innerHTML = `<input type="checkbox" id="${a}" value="${e}" class="w-5 h-5 bg-gray-200 border-gray-300 rounded text-cyan-600 focus:ring-cyan-600 cursor-pointer"><label for="${a}" class="ml-3 text-gray-700 cursor-pointer">${e}</label>`;
      g.appendChild(t);
    });
    g.addEventListener("change", function () {
      if (!g) {
        return;
      }
      const e = g.querySelectorAll("input[type=\"checkbox\"]:checked").length;
      p.textContent = e;
      s.disabled = e === 0;
      g.querySelectorAll("input[type=\"checkbox\"]").forEach(t => {
        t.disabled = e >= 6 && !t.checked;
      });
    });
  }
 })();