(function () {
  const e = document.getElementById("tryon-product-upload-box");
  const t = document.getElementById("tryon-product-input");
  const a = document.getElementById("tryon-product-preview");
  const n = document.getElementById("tryon-product-placeholder");
  const i = document.getElementById("tryon-model-upload-box");
  const o = document.getElementById("tryon-model-input");
  const s = document.getElementById("tryon-model-preview");
  const r = document.getElementById("tryon-model-placeholder");
  const l = document.getElementById("tryon-angle-selection");
  const d = document.getElementById("tryon-custom-angle-container");
  const c = document.getElementById("tryon-custom-angle");
  const m = document.getElementById("tryon-count-selection");
  const u = document.getElementById("tryon-count-text");
  const g = document.getElementById("tryon-generate-btn");
  const p = document.getElementById("tryon-placeholder");
  const h = document.getElementById("tryon-loading");
  const f = document.getElementById("tryon-progress-text");
  const y = document.getElementById("tryon-results-header");
  const b = document.getElementById("tryon-results-count");
  const w = document.getElementById("tryon-results-grid");
  const v = document.getElementById("tryon-download-all-btn");
  let k = null;
  let E = null;
  let I = "Front View";
  let L = 4;
  let x = [];
  function T(e, t, a, n, i) {
    if (e && t) {
      e.addEventListener("click", () => t.click());
      e.addEventListener("dragover", t => {
        t.preventDefault();
        e.style.borderColor = "#14b8a6";
      });
      e.addEventListener("dragleave", () => {
        e.style.borderColor = "";
      });
      e.addEventListener("drop", t => {
        t.preventDefault();
        e.style.borderColor = "";
        if (t.dataTransfer.files[0]) {
          $(t.dataTransfer.files[0], a, n, i);
        }
      });
      t.addEventListener("change", e => {
        if (e.target.files[0]) {
          $(e.target.files[0], a, n, i);
        }
      });
    }
  }
  async function $(e, t, a, n) {
    try {
      let i = e;
      if (e.type === "image/heic" || e.name.toLowerCase().endsWith(".heic")) {
        const t = window.heic2any;
        if (t) {
          const a = await t({
            blob: e,
            toType: "image/jpeg",
            quality: 0.9
          });
          i = new File([a], e.name.replace(/\.heic$/i, ".jpg"), {
            type: "image/jpeg"
          });
        }
      }
      const o = new FileReader();
      o.onload = e => {
        t.src = e.target.result;
        t.classList.remove("hidden");
        a.classList.add("hidden");
        const o = {
          mimeType: i.type,
          base64: e.target.result.split(",")[1]
        };
        if (n === "product") {
          k = o;
        } else {
          E = o;
        }
        if (g) {
          g.disabled = !k || !E;
        }
      };
      o.readAsDataURL(i);
    } catch (e) {
      console.error("Error processing file:", e);
      alert("Gagal memproses gambar. Silakan coba lagi.");
    }
  }
  T(e, t, a, n, "product");
  T(i, o, s, r, "model");
  if (l) {
    l.addEventListener("click", e => {
      const t = e.target.closest("[data-angle]");
      if (t) {
        l.querySelectorAll(".option-btn-tryon").forEach(e => e.classList.remove("selected"));
        t.classList.add("selected");
        I = t.dataset.angle;
        if (I === "custom" && d) {
          d.classList.remove("hidden");
        } else if (d) {
          d.classList.add("hidden");
        }
      }
    });
  }
  if (m) {
    m.addEventListener("click", e => {
      const t = e.target.closest("[data-count]");
      if (t) {
        document.querySelectorAll("#tryon-count-selection .count-btn").forEach(e => {
          e.classList.remove("count-selected", "bg-gradient-to-r", "from-teal-500", "to-lime-500", "text-white", "border-teal-500", "font-bold", "shadow-md");
          e.classList.add("bg-gray-50", "hover:bg-gray-100", "text-gray-700", "border-gray-300", "font-medium");
        });
        t.classList.remove("bg-gray-50", "hover:bg-gray-100", "text-gray-700", "border-gray-300", "font-medium");
        t.classList.add("count-selected", "bg-gradient-to-r", "from-teal-500", "to-lime-500", "text-white", "border-teal-500", "font-bold", "shadow-md");
        L = parseInt(t.dataset.count, 10);
        if (u) {
          u.textContent = L;
        }
      }
    });
  }
  if (g) {
    g.addEventListener("click", async () => {
      if (!window.checkApiKey()) {
        return;
      }
      if (!k || !E) {
        alert("Silakan unggah foto produk dan model terlebih dahulu.");
        return;
      }
      let e = I;
      if (I === "custom" && c) {
        const t = c.value.trim();
        if (!t) {
          alert("Silakan isi deskripsi custom angle atau pilih angle lain.");
          return;
        }
        e = t;
      }
      await async function (e) {
        const t = g.innerHTML;
        g.disabled = true;
        if (p) {
          p.classList.add("hidden");
        }
        if (h) {
          h.classList.remove("hidden");
        }
        if (y) {
          y.classList.add("hidden");
        }
        if (w) {
          w.classList.add("hidden");
          w.innerHTML = "";
        }
        x = [];
        const a = Array.from({
          length: L
        }, (t, a) => async function (e, t) {
          try {
            if (f) {
              f.textContent = `${e}/${L}`;
            }
            const a = `Create a professional photorealistic image of the model wearing or using the product.\n\nCAMERA ANGLE: ${t}\n\nRequirements:\n- The model MUST be wearing or using the product from the first image\n- Maintain the model's identity and appearance from the second image\n- Professional fashion photography quality\n- Natural lighting and realistic composition\n- High resolution, 4K quality\n- Camera angle: ${t}\n- Make it look like a professional product photoshoot\n\nCRITICAL: The model must be clearly wearing/using the product in the specified angle.`;
            const n = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=" + window.getGeminiApiKey();
            const i = {
              contents: [{
                parts: [{
                  text: a
                }, {
                  inlineData: {
                    mimeType: k.mimeType,
                    data: k.base64
                  }
                }, {
                  inlineData: {
                    mimeType: E.mimeType,
                    data: E.base64
                  }
                }]
              }],
              generationConfig: {
                responseModalities: ["IMAGE"],
                imageConfig: {
                  aspectRatio: "3:4"
                }
              }
            };
            const o = await fetch(n, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(i)
            });
            if (!o.ok) {
              throw new Error(`API Error: ${o.status}`);
            }
            const s = await o.json();
            const r = s?.candidates?.[0]?.content?.parts?.find(e => e.inlineData)?.inlineData?.data;
            if (!r) {
              throw new Error("Invalid API response");
            }
            {
              const a = `data:image/png;base64,${r}`;
              const n = `tryon_${t.replace(/\s+/g, "_")}_${e}.png`;
              x[e - 1] = {
                url: a,
                filename: n
              };
              (function (e, t, a) {
                if (!w) {
                  return;
                }
                const n = document.createElement("div");
                n.className = "relative group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white";
                n.innerHTML = `\n                <img src="${e}" class="w-full h-full object-cover aspect-[3/4]" alt="Try-On ${a}">\n                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">\n                    <button data-action="preview" data-index="${a - 1}" class="action-btn bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full font-semibold shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2">\n                        <i class="fas fa-eye"></i>\n                        <span class="hidden sm:inline">Preview</span>\n                    </button>\n                    <button data-action="download" data-index="${a - 1}" class="action-btn bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2">\n                        <i class="fas fa-download"></i>\n                        <span class="hidden sm:inline">Download</span>\n                    </button>\n                </div>\n            `;
                w.appendChild(n);
              })(a, 0, e);
            }
          } catch (t) {
            console.error(`Error generating try-on ${e}:`, t);
            (function () {
              if (!w) {
                return;
              }
              const e = document.createElement("div");
              e.className = "relative rounded-xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center aspect-[3/4]";
              e.innerHTML = "\n                <div class=\"text-center p-4\">\n                    <i class=\"fas fa-exclamation-circle text-red-500 text-3xl mb-2\"></i>\n                    <p class=\"text-xs text-red-500\">Gagal generate</p>\n                </div>\n            ";
              w.appendChild(e);
            })();
          }
        }(a + 1, e));
        await Promise.allSettled(a);
        if (h) {
          h.classList.add("hidden");
        }
        if (x.length > 0) {
          if (y) {
            y.classList.remove("hidden");
          }
          if (b) {
            b.textContent = x.length;
          }
          if (w) {
            w.classList.remove("hidden");
          }
        } else {
          if (p) {
            p.classList.remove("hidden");
          }
          alert("Gagal generate gambar. Silakan coba lagi.");
        }
        g.disabled = false;
        g.innerHTML = t;
      }(e);
    });
  }
  if (w) {
    w.addEventListener("click", async e => {
      e.stopPropagation();
      const t = e.target.classList.contains("action-btn") ? e.target : e.target.closest(".action-btn[data-action]");
      if (!t) {
        return;
      }
      const a = t.dataset.action;
      const n = parseInt(t.dataset.index, 10);
      const i = x[n];
      if (i) {
        if (a === "preview") {
          if (window.showPreviewModal) {
            window.showPreviewModal(i.url);
          }
        } else if (a === "download") {
          if (window.downloadDataURINew) {
            await window.downloadDataURINew(i.url, i.filename);
          } else if (window.downloadImage) {
            await window.downloadImage(i.url, i.filename);
          }
        }
      }
    });
  }
  if (v) {
    v.addEventListener("click", async e => {
      e.stopPropagation();
      if (x.length === 0 || v.disabled) {
        return;
      }
      const t = v.innerHTML;
      v.disabled = true;
      try {
        for (let e = 0; e < x.length; e++) {
          const t = x[e];
          v.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i><span>Downloading ${e + 1}/${x.length}...</span>`;
          try {
            if (window.downloadDataURINew) {
              await window.downloadDataURINew(t.url, t.filename);
            } else if (window.downloadImage) {
              await window.downloadImage(t.url, t.filename);
            }
            await new Promise(e => setTimeout(e, 500));
          } catch (t) {
            console.error(`Error downloading image ${e + 1}:`, t);
          }
        }
        v.innerHTML = "<i class=\"fas fa-check mr-2\"></i><span>Selesai!</span>";
        setTimeout(() => {
          v.disabled = false;
          v.innerHTML = t;
        }, 2000);
      } catch (e) {
        console.error("Download all error:", e);
        v.innerHTML = "<i class=\"fas fa-times mr-2\"></i><span>Error</span>";
        setTimeout(() => {
          v.disabled = false;
          v.innerHTML = t;
        }, 2000);
      }
    });
  }
})();