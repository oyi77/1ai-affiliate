(function () {
  const e = document.getElementById("miniature-person-image-uploader");
  const t = document.getElementById("miniature-person-file-input");
  const a = document.getElementById("miniature-person-upload-prompt");
  const n = document.getElementById("miniature-person-image-preview");
  const i = document.getElementById("miniature-ratio-selection");
  const o = document.getElementById("miniature-manual-prompt");
  const s = document.getElementById("miniature-generate-btn");
  const r = document.getElementById("miniature-loader");
  const l = document.getElementById("miniature-placeholder-result");
  const d = document.getElementById("miniature-result-content");
  const c = document.getElementById("miniature-error-message");
  let m = null;
  let u = "16:9";
  function g(e, t, a, n) {
    const i = e.target.files[0];
    if (i && i.type.startsWith("image/")) {
      const e = new FileReader();
      e.onloadend = () => {
        n(e.result.split(",")[1]);
        t.src = e.result;
        t.classList.remove("hidden");
        a.classList.add("hidden");
        w();
      };
      e.readAsDataURL(i);
    }
  }
  var p;
  var h;
  var f;
  var y;
  var b;
  function w() {
    s.disabled = !m;
  }
  function v(e) {
    r.classList.toggle("hidden", !e);
    r.classList.toggle("flex", e);
    l.classList.toggle("hidden", e);
    d.classList.toggle("hidden", !d.children.length > 0 || e);
    s.disabled = e;
  }
  function k(e) {
    c.textContent = e;
    c.classList.toggle("hidden", !e);
    if (e) {
      l.classList.add("hidden");
      d.classList.add("hidden");
    }
  }
  h = t;
  f = n;
  y = a;
  b = e => {
    m = e;
  };
  (p = e).addEventListener("click", () => h.click());
  p.addEventListener("dragover", e => {
    e.preventDefault();
    p.classList.add("border-indigo-400", "bg-indigo-50");
  });
  p.addEventListener("dragleave", () => p.classList.remove("border-indigo-400", "bg-indigo-50"));
  p.addEventListener("drop", e => {
    e.preventDefault();
    p.classList.remove("border-indigo-400", "bg-indigo-50");
    if (e.dataTransfer.files.length > 0) {
      h.files = e.dataTransfer.files;
      g({
        target: h
      }, f, y, b);
    }
  });
  h.addEventListener("change", e => g(e, f, y, b));
  i.addEventListener("click", e => {
    const t = e.target.closest(".ratio-btn-mini");
    if (t) {
      document.querySelectorAll("#miniature-ratio-selection .ratio-btn-mini").forEach(e => e.classList.remove("selected"));
      t.classList.add("selected");
      u = t.dataset.ratio;
    }
  });
  [t, o].forEach(e => e.addEventListener("input", w));
  s.addEventListener("click", async () => {
    if (!window.checkApiKey()) {
      return;
    }
    if (s.disabled) {
      k("Silakan unggah foto Anda.");
      return;
    }
    v(true);
    k("");
    d.innerHTML = "";
    const e = ["figur skala 1/7 realistis di meja komputer.", "berdiri di atas layar HP raksasa.", "gantungan kunci action figure.", "mockup produk figur miniatur.", "memegang figur miniatur dirinya di studio.", "action figure di dalam lemari kaca.", "miniatur duduk di atas buku tebal.", "figur kecil di atas keyboard laptop.", "action figure di dashboard mobil.", "miniatur berdiri di atas cangkir kopi.", "figur kecil di dalam botol kaca.", "miniatur di atas tumpukan koin.", "action figure pose superhero di meja kerja.", "figur kecil dengan latar cityscape miniatur.", "miniatur di atas tanaman pot kecil.", "action figure di rak display koleksi.", "figur kecil sedang naik tangga pensil.", "miniatur dengan lighting studio profesional.", "action figure di antara makanan miniatur.", "figur kecil di landscape diorama."].map(e => {
      let t = `Based on the uploaded image, create a photorealistic image of the person as a miniature figure. Aspect ratio: ${u}. Scene: ${e}.`;
      if (o.value.trim()) {
        t += ` Additional style: ${o.value.trim()}.`;
      }
      return async function (e, t = 3, a = 1000) {
        for (let n = 0; n < t; n++) {
          try {
            const t = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=" + window.getGeminiApiKey();
            const a = await fetch(t, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(e)
            });
            const n = await a.text();
            if (!a.ok) {
              let e = a.statusText;
              try {
                e = JSON.parse(n).error?.message || e;
              } catch (t) {
                if (n) {
                  e = n;
                }
              }
              throw new Error(`API Error: ${e}`);
            }
            try {
              return JSON.parse(n);
            } catch (e) {
              throw new Error("Invalid JSON response.");
            }
          } catch (e) {
            console.error(`Attempt ${n + 1} failed:`, e);
            if (n === t - 1) {
              return null;
            }
            await new Promise(e => setTimeout(e, a * Math.pow(2, n)));
          }
        }
        return null;
      }({
        contents: [{
          parts: [{
            text: t
          }, {
            inlineData: {
              mimeType: "image/jpeg",
              data: m
            }
          }]
        }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: u
          }
        }
      });
    });
    try {
      (await Promise.all(e)).forEach((e, t) => {
        const a = document.createElement("div");
        a.className = "text-center";
        const n = e?.candidates?.[0]?.content?.parts?.find(e => e.inlineData)?.inlineData?.data;
        const i = u === "1:1" ? "aspect-square" : u === "16:9" ? "aspect-video" : u === "3:4" ? "aspect-[3/4]" : "aspect-[9/16]";
        if (n) {
          const e = `data:image/png;base64,${n}`;
          a.innerHTML = `<img src="${e}" class="rounded-lg shadow-md w-full h-auto ${i} object-cover"><a href="#" data-base64="${n}" data-filename="miniature-${t}.png" class="download-btn mt-2 inline-block bg-[#4f46e5] text-white py-1 px-4 rounded-full text-xs hover:bg-[#4338ca]"><i class="fas fa-download mr-1"></i> Download</a>`;
        } else {
          a.innerHTML = `<div class="rounded-lg shadow-md w-full ${i} bg-gray-200 flex items-center justify-center p-2 text-xs text-gray-600"><i class="fas fa-exclamation-triangle mr-1"></i> Gagal</div>`;
        }
        d.appendChild(a);
      });
      d.classList.remove("hidden");
    } catch (e) {
      k(`Kesalahan: ${e.message}`);
    } finally {
      v(false);
    }
  });
  d.addEventListener("click", async function (e) {
    const t = e.target.closest(".download-btn");
    if (t) {
      e.preventDefault();
      e.stopPropagation();
      const a = t.dataset.base64;
      const n = t.dataset.filename;
      if (a && n) {
        const e = `data:image/png;base64,${a}`;
        if (window.downloadDataURINew) {
          await window.downloadDataURINew(e, n);
        } else if (window.downloadImage) {
          await window.downloadImage(e, n);
        }
      }
    }
  });
  w();
})();