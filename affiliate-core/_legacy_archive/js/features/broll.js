(function () {
  const e = document.getElementById("broll-image-input");
  const t = document.getElementById("broll-image-upload-area");
  const a = document.getElementById("broll-image-preview-container");
  document.getElementById("broll-image-preview");
  document.getElementById("broll-remove-image-btn");
  const n = document.getElementById("broll-model-image-input");
  const i = document.getElementById("broll-model-image-upload-area");
  const o = document.getElementById("broll-model-image-preview-container");
  const s = document.getElementById("broll-model-image-preview");
  const r = document.getElementById("broll-remove-model-image-btn");
  const l = document.getElementById("broll-background-image-input");
  const d = document.getElementById("broll-background-image-upload-area");
  const c = document.getElementById("broll-background-image-preview-container");
  const m = document.getElementById("broll-background-image-preview");
  const u = document.getElementById("broll-remove-background-image-btn");
  const g = document.getElementById("broll-product-desc-input");
  const p = document.getElementById("broll-generate-btn");
  const h = document.getElementById("broll-b-roll-grid");
  const f = document.getElementById("broll-generate-desc-btn");
  const y = document.getElementById("broll-results-header");
  const b = document.getElementById("broll-result-count");
  const w = document.getElementById("broll-download-all-btn");
  const v = document.getElementById("broll-count-selection");
  const k = document.getElementById("broll-count-text");
  const E = document.getElementById("broll-theme-options");
  const I = document.getElementById("broll-custom-theme-container");
  const L = document.getElementById("broll-photo-theme-input");
  let x = [];
  let T = null;
  let $ = null;
  let A = null;
  let S = null;
  const C = document.getElementById("broll-ratio-selection");
  let M = "16:9";
  let B = 7;
  let N = "";
  let R = [];
  function P() {
    if (p) {
      p.disabled = x.length === 0 || !g.value.trim();
    }
    if (f) {
      f.disabled = x.length === 0;
    }
  }
  var D;
  var O;
  var H;
  var j;
  var U;
  if (e) {
    e.addEventListener("change", n => {
      (function (n) {
        if (!n || n.length === 0) {
          return;
        }
        t.classList.add("hidden");
        a.classList.remove("hidden");
        let i = n.length;
        Array.from(n).forEach(n => {
          const o = new FileReader();
          o.onload = n => {
            const [o, s] = n.target.result.split(",");
            const r = o.match(/:(.*?);/)[1];
            const l = {
              id: Date.now() + Math.random(),
              base64: s,
              mimeType: r
            };
            x.push(l);
            const d = document.createElement("div");
            d.className = "relative group";
            d.innerHTML = `\n                        <img src="${n.target.result}" alt="Pratinjau Produk" class="rounded-lg w-full h-24 object-cover">\n                        <button data-id="${l.id}" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">\n                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>\n                        </button>\n                    `;
            a.appendChild(d);
            d.querySelector("button").addEventListener("click", e => {
              const n = parseFloat(e.currentTarget.getAttribute("data-id"));
              x = x.filter(e => e.id !== n);
              d.remove();
              if (x.length === 0) {
                t.classList.remove("hidden");
                a.classList.add("hidden");
                const e = document.getElementById("broll-add-more-button");
                if (e) {
                  e.remove();
                }
              }
              P();
            });
            P();
            i--;
            if (i === 0) {
              (function () {
                const t = document.getElementById("broll-add-more-button");
                if (t) {
                  t.remove();
                }
                const n = document.createElement("div");
                n.id = "broll-add-more-button";
                n.className = "relative group cursor-pointer";
                n.innerHTML = "\n                <div class=\"rounded-lg w-full h-24 border-2 border-dashed border-gray-400 hover:border-cyan-500 bg-gray-50 hover:bg-cyan-50 transition-colors flex items-center justify-center\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"h-8 w-8 text-gray-400 group-hover:text-cyan-500\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 4v16m8-8H4\"></path></svg>\n                </div>\n            ";
                n.addEventListener("click", () => {
                  e.click();
                });
                a.appendChild(n);
              })();
            }
          };
          o.readAsDataURL(n);
        });
      })(n.target.files);
      n.target.value = null;
    });
  }
  O = i;
  H = o;
  j = s;
  U = r;
  if (D = n) {
    D.addEventListener("change", e => {
      const t = e.target.files[0];
      if (!t) {
        return;
      }
      const a = new FileReader();
      a.onload = e => {
        j.src = e.target.result;
        const [t, a] = e.target.result.split(",");
        const n = t.match(/:(.*?);/)[1];
        T = a;
        $ = n;
        O.classList.add("hidden");
        H.classList.remove("hidden");
      };
      a.readAsDataURL(t);
    });
    U.addEventListener("click", () => {
      T = null;
      $ = null;
      D.value = "";
      O.classList.remove("hidden");
      H.classList.add("hidden");
    });
  }
  (function (e, t, a, n, i) {
    if (e) {
      e.addEventListener("change", e => {
        const i = e.target.files[0];
        if (!i) {
          return;
        }
        const o = new FileReader();
        o.onload = e => {
          n.src = e.target.result;
          const [i, o] = e.target.result.split(",");
          const s = i.match(/:(.*?);/)[1];
          A = o;
          S = s;
          t.classList.add("hidden");
          a.classList.remove("hidden");
        };
        o.readAsDataURL(i);
      });
      i.addEventListener("click", () => {
        A = null;
        S = null;
        e.value = "";
        t.classList.remove("hidden");
        a.classList.add("hidden");
      });
    }
  })(l, d, c, m, u);
  if (g) {
    g.addEventListener("input", P);
  }
  if (C) {
    C.addEventListener("click", e => {
      const t = e.target.closest(".ratio-btn-broll");
      if (t) {
        document.querySelectorAll("#broll-ratio-selection .ratio-btn-broll").forEach(e => e.classList.remove("selected"));
        t.classList.add("selected");
        M = t.dataset.ratio;
      }
    });
  }
  if (v) {
    v.addEventListener("click", e => {
      const t = e.target.closest("[data-count]");
      if (t) {
        document.querySelectorAll("#broll-count-selection [data-count]").forEach(e => e.classList.remove("selected"));
        t.classList.add("selected");
        B = parseInt(t.dataset.count, 10);
        if (k) {
          k.textContent = B;
        }
      }
    });
  }
  if (E) {
    E.addEventListener("click", e => {
      const t = e.target.closest("[data-theme]");
      if (t) {
        document.querySelectorAll("#broll-theme-options .theme-btn-broll").forEach(e => e.classList.remove("selected"));
        t.classList.add("selected");
        N = t.dataset.theme;
        if (N === "custom") {
          if (I) {
            I.classList.remove("hidden");
          }
        } else if (I) {
          I.classList.add("hidden");
        }
      }
    });
  }
  if (h) {
    h.innerHTML = Array.from({
      length: 20
    }, () => "\n                <div class=\"result-card card p-4 flex flex-col justify-between animate-pulse\">\n                    <div><div class=\"h-6 bg-gray-200 rounded w-3/4 mb-4\"></div></div>\n                    <div class=\"mt-4 aspect-video bg-gray-300 rounded-md\"></div>\n                </div>").join("");
  }
  if (p) {
    p.addEventListener("click", async () => {
      if (!window.checkApiKey()) {
        return;
      }
      if (!p.disabled) {
        p.disabled = true;
        p.innerHTML = "<div class=\"loader\"></div><span class=\"ml-2\">Menganalisa...</span>";
        R = [];
        if (y) {
          y.classList.add("hidden");
        }
        try {
          const e = await async function () {
            let e;
            e = T ? `You are a professional product photographer's AI assistant. Analyze product image(s), description, and a model's photo. Generate ${B} distinct, creative, professional shots. If multiple product images are provided (e.g., a shirt and pants), generate prompts that show model wearing or using ALL products together in a complete outfit/setup. The model MUST naturally interact with or wear ALL products. ${A ? "A custom background image is provided - use it as the setting/backdrop for photos." : ""} For each, provide a short, descriptive title (in Indonesian) and a detailed prompt (in English) for an AI image generator, emphasizing a high-end commercial aesthetic. Respond ONLY with a valid JSON array of ${B} objects.` : `You are a professional product photographer's AI assistant. Analyze product image(s) and description. Generate ${B} distinct, creative, professional product-only shots with NO human models. If multiple products are provided, show them together in creative compositions. ${A ? "A custom background image is provided - use it as setting/backdrop for product photos." : ""} Focus on creative backgrounds, lighting, and product arrangements. For each, provide a short, descriptive title (in Indonesian) and a detailed prompt (in English) for an AI image generator, emphasizing a high-end commercial aesthetic. Respond ONLY with a valid JSON array of ${B} objects.`;
            let t = "";
            if (N === "custom") {
              t = L ? L.value.trim() : "";
            } else if (N) {
              t = N;
            }
            const a = [{
              text: `Product Description: "${g.value.trim()}" ${t ? `\nPhoto Theme: "${t}"` : ""} ${A ? "\nNote: A custom background image is provided for product photos." : ""} \nAspect Ratio: "${M}"`
            }];
            x.forEach(e => {
              a.push({
                inlineData: {
                  mimeType: e.mimeType,
                  data: e.base64
                }
              });
            });
            if (T) {
              a.push({
                inlineData: {
                  mimeType: $,
                  data: T
                }
              });
            }
            if (A) {
              a.push({
                inlineData: {
                  mimeType: S,
                  data: A
                }
              });
            }
            const n = {
              contents: [{
                parts: a
              }],
              systemInstruction: {
                parts: [{
                  text: e
                }]
              },
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      title: {
                        type: "STRING"
                      },
                      prompt: {
                        type: "STRING"
                      }
                    },
                    required: ["title", "prompt"]
                  }
                }
              }
            };
            const i = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" + window.getGeminiApiKey(), {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(n)
            });
            if (!i.ok) {
              const e = await i.json();
              throw new Error(e.error?.message || i.statusText);
            }
            const o = await i.json();
            return JSON.parse(o.candidates[0].content.parts[0].text);
          }();
          p.innerHTML = "<div class=\"loader\"></div><span class=\"ml-2\">Membuat Visual...</span>";
          G(e);
          await Promise.allSettled(e.map((e, t) => async function (e, t, a) {
            const n = document.getElementById(`broll-card-${e}`).querySelector(".aspect-video");
            try {
              const i = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=" + window.getGeminiApiKey();
              const o = [{
                text: `${a}, elegant, cinematic, professional product photography, dramatic lighting, 8k, photorealistic, aspect ratio ${M}`
              }];
              x.forEach(e => {
                o.push({
                  inlineData: {
                    mimeType: e.mimeType,
                    data: e.base64
                  }
                });
              });
              if (T) {
                o.push({
                  inlineData: {
                    mimeType: $,
                    data: T
                  }
                });
              }
              if (A) {
                o.push({
                  inlineData: {
                    mimeType: S,
                    data: A
                  }
                });
              }
              const s = {
                contents: [{
                  parts: o
                }],
                generationConfig: {
                  responseModalities: ["IMAGE"],
                  imageConfig: {
                    aspectRatio: M
                  }
                }
              };
              const r = await fetch(i, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(s)
              });
              if (!r.ok) {
                throw new Error(`API error: ${r.statusText}`);
              }
              const l = await r.json();
              const d = l?.candidates?.[0]?.content?.parts?.find(e => e.inlineData)?.inlineData?.data;
              if (!d) {
                throw new Error("No image data from API.");
              }
              const c = `data:image/png;base64,${d}`;
              const m = t.replace(/[^a-z0-9]/gi, "_").toLowerCase();
              R.push({
                url: c,
                filename: `1affiliate_${e}_${m}.png`
              });
              window.brollGenerationParams ||= [];
              window.brollGenerationParams[e - 1] = {
                prompt: a,
                title: t,
                productImages: x,
                modelImage: T ? {
                  base64: T,
                  mimeType: $
                } : null,
                ratio: M
              };
              n.innerHTML = `<div class="relative w-full h-full group"><img src="${c}" class="w-full h-full object-cover rounded-md" alt="${t}"><div class="absolute bottom-2 right-2 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button data-action="broll-preview" data-image-url="${c}" class="action-btn bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600" title="Preview"><i class="fas fa-search-plus"></i></button><button data-action="broll-edit" data-index="${e - 1}" data-prompt="${a.replace(/"/g, "&quot;")}" class="action-btn bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600" title="Edit Prompt"><i class="fas fa-edit"></i></button><button data-action="broll-regenerate" data-index="${e - 1}" class="action-btn bg-green-500 text-white p-2 rounded-full hover:bg-green-600" title="Regenerate"><i class="fas fa-sync-alt"></i></button><button data-action="broll-video" data-image-url="${c}" data-title="${t.replace(/"/g, "&quot;")}" class="action-btn bg-fuchsia-500 text-white p-2 rounded-full hover:bg-fuchsia-600" title="Buat Prompt Video"><i class="fas fa-film"></i></button><button data-action="broll-caption" data-image-url="${c}" data-title="${t.replace(/"/g, "&quot;")}" class="action-btn bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600" title="Buat Caption"><i class="fas fa-pencil-alt"></i></button><button data-action="broll-download" data-image-url="${c}" data-filename="1affiliate_${e}_${m}.png" class="action-btn bg-cyan-600 text-white p-2 rounded-full hover:bg-cyan-700" title="Unduh"><i class="fas fa-download"></i></button></div></div>`;
            } catch (e) {
              n.innerHTML = "<div class=\"text-xs text-red-500 p-2 text-center\">Gagal.</div>";
            }
          }(t + 1, e.title, e.prompt)));
          if (R.length > 0) {
            if (y) {
              y.classList.remove("hidden");
            }
            if (b) {
              b.textContent = R.length;
            }
          }
        } catch (e) {
          console.error("Error:", e);
          h.innerHTML = `<p class="text-red-500 col-span-full text-center">Gagal membuat ide: ${e.message}</p>`;
        } finally {
          p.disabled = false;
          p.innerHTML = `<span>Buat <span id="broll-count-text">${B}</span> Pose Produk</span>`;
          P();
        }
      }
    });
  }
  if (w) {
    w.addEventListener("click", async () => {
      if (R.length !== 0) {
        w.disabled = true;
        w.innerHTML = "<i class=\"fas fa-spinner fa-spin mr-2\"></i>Downloading...";
        for (let e = 0; e < R.length; e++) {
          const t = R[e];
          if (window.downloadDataURINew) {
            await window.downloadDataURINew(t.url, t.filename);
            await new Promise(e => setTimeout(e, 500));
          }
        }
        w.disabled = false;
        w.innerHTML = "<i class=\"fas fa-download mr-2\"></i>Download Semua";
      }
    });
  }
  const G = e => {
    h.innerHTML = e.map((e, t) => `\n                <div id="broll-card-${t + 1}" class="result-card card p-4 flex flex-col justify-between">\n                    <div><h3 class="text-lg font-semibold text-gray-800 mb-4">${e.title}</h3></div>\n                    <div class="aspect-video bg-gray-100 rounded-md flex items-center justify-center"><div class="loader"></div></div>\n                </div>`).join("");
  };
  if (f) {
    f.addEventListener("click", async () => {
      const e = f.innerHTML;
      f.innerHTML = "<div class=\"loader !w-4 !h-4 !border-2\"></div>";
      f.disabled = true;
      try {
        const e = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" + window.getGeminiApiKey();
        const t = "You are a professional copywriter. Analyze product(s) in image(s) and write a concise, compelling, and SEO-friendly product description in Indonesian. Highlight key features and potential benefits for customers. Keep it under 500 characters.";
        const a = [{
          text: "Buatkan deskripsi produk untuk gambar ini."
        }];
        if (x.length > 0) {
          a.push({
            inlineData: {
              mimeType: x[0].mimeType,
              data: x[0].base64
            }
          });
        }
        const n = {
          contents: [{
            parts: a
          }],
          systemInstruction: {
            parts: [{
              text: t
            }]
          }
        };
        const i = await fetch(e, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(n)
        });
        if (!i.ok) {
          const e = await i.json();
          throw new Error(e.error?.message || `HTTP error! status: ${i.status}`);
        }
        const o = (await i.json()).candidates[0].content.parts[0].text;
        g.value = o.trim();
        P();
      } catch (e) {
        console.error("Error generating description:", e);
        g.value = "Gagal membuat deskripsi. Coba lagi.";
      } finally {
        f.innerHTML = e;
        f.disabled = false;
      }
    });
  }
  window.handleAffiliateCaption = async (e, t) => {
    try {
      const a = document.createElement("div");
      a.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto";
      a.style.WebkitOverflowScrolling = "touch";
      a.innerHTML = "\n                    <div class=\"bg-white rounded-xl p-6 max-w-2xl w-full my-8\" onclick=\"event.stopPropagation()\">\n                        <h3 class=\"text-xl font-bold mb-4 text-gray-800\">\n                            <i class=\"fas fa-pencil-alt text-rose-500 mr-2\"></i>Membuat Caption...\n                        </h3>\n                        <div class=\"flex items-center justify-center py-8\">\n                            <div class=\"loader !border-l-rose-500\"></div>\n                        </div>\n                    </div>\n                ";
      document.body.appendChild(a);
      a.addEventListener("click", e => {
        if (e.target === a) {
          a.remove();
        }
      });
      const n = await fetch(e);
      const i = await n.blob();
      const o = new FileReader();
      const s = new Promise(e => {
        o.onloadend = () => {
          const t = o.result.split(",")[1];
          e(t);
        };
        o.readAsDataURL(i);
      });
      const r = await s;
      const l = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" + window.getGeminiApiKey();
      const d = {
        contents: [{
          parts: [{
            text: `Analyze this product image titled "${t}" and create 3 engaging Instagram captions in Indonesian for different audiences.`
          }, {
            inlineData: {
              mimeType: "image/png",
              data: r
            }
          }]
        }],
        systemInstruction: {
          parts: [{
            text: "You are an expert social media copywriter and content strategist. Analyze this product image and create 3 engaging, conversion-focused Instagram captions in Indonesian.\n\nEach caption should:\n1. Hook attention in first line\n2. Highlight product benefits or create desire\n3. Include relevant emojis naturally\n4. End with a clear call-to-action (CTA)\n5. Be optimized for engagement and sales\n6. Have different tones: Professional, Casual/Fun, and Inspirational\n\nFormat your response as JSON with this structure:\n{\n  \"professional\": \"caption text\",\n  \"casual\": \"caption text\",\n  \"inspirational\": \"caption text\"\n}"
          }]
        },
        generationConfig: {
          responseMimeType: "application/json"
        }
      };
      const c = await fetch(l, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(d)
      });
      if (!c.ok) {
        const e = await c.json();
        throw new Error(e.error?.message || "API request failed");
      }
      const m = (await c.json()).candidates[0].content.parts[0].text;
      const u = JSON.parse(m);
      const g = "🎯";
      const p = "😊";
      const h = "✨";
      const f = a.querySelector(".bg-white");
      f.innerHTML = `\n                    <div class="flex items-center justify-between mb-4\">\n                        <h3 class="text-xl font-bold text-gray-800\">\n                            <i class="fas fa-pencil-alt text-rose-500 mr-2\"></i>Caption Instagram\n                        </h3>\n                        <button data-action="close-modal" class="text-gray-500 hover:text-gray-700 text-2xl leading-none" title="Tutup">\n                            <i class="fas fa-times"></i>\n                        </button>\n                    </div>\n\n                    <div class="space-y-4 mb-6 max-h-[60vh] overflow-y-auto" style="-webkit-overflow-scrolling: touch;">\n                        ${Object.entries(u).map(([e, t]) => `\n                            <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">\n                                <div class="flex items-center justify-between mb-2">\n                                    <label class="text-sm font-bold text-gray-700 uppercase">${e === "professional" ? g + " Profesional" : e === "casual" ? p + " Casual & Fun" : h + " Inspiratif"}</label>\n                                    <button data-action="copy-caption" data-caption="${t.replace(/"/g, "&quot;")}"\n                                        class="caption-copy-btn text-xs bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded-full transition-colors flex-shrink-0\">\n                                        <i class="fas fa-copy mr-1"></i>Salin\n                                    </button>\n                                </div>\n                                <p class="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">${t}</p>\n                            </div>\n                        `).join("")}\n                    </div>\n\n                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">\n                        <p class="text-xs text-blue-800">\n                            <i class="fas fa-info-circle ...
      f.addEventListener("click", async e => {
        e.stopPropagation();
        const t = e.target.closest("[data-action=\"copy-caption\"]");
        const n = e.target.closest("[data-action=\"close-modal\"]");
        if (t) {
          const e = t.dataset.caption;
          try {
            await navigator.clipboard.writeText(e);
            const a = t.innerHTML;
            t.innerHTML = "<i class=\"fas fa-check mr-1\"></i>Tersalin!";
            t.classList.remove("bg-rose-500");
            t.classList.add("bg-green-500");
            setTimeout(() => {
              t.innerHTML = a;
              t.classList.remove("bg-green-500");
              t.classList.add("bg-rose-500");
            }, 2000);
          } catch (e) {
            console.error("Failed to copy:", e);
            alert("Caption berhasil dipilih. Salin dengan Ctrl+C atau Command+C");
          }
        } else if (n) {
          a.remove();
        }
      });
    } catch (e) {
      console.error("Error generating caption:", e);
      const t = document.createElement("div");
      t.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
      t.innerHTML = `\n                    <div class="bg-white rounded-xl p-6 max-w-md w-full">\n                        <h3 class="text-xl font-bold mb-4 text-red-600">\n                            <i class="fas fa-exclamation-triangle mr-2\"></i>Error\n                        </h3>\n                        <p class="text-gray-700 mb-4">${e.message}</p>\n                        <button onclick="this.closest('.fixed').remove()"\n                            class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">\n                            Tutup\n                        </button>\n                    </div>\n                `;
      document.body.appendChild(t);
      const a = document.querySelector(".fixed.inset-0");
      if (a && a !== t) {
        a.remove();
      }
    }
  };
  window.handleAffiliateVideoPrompt = async (e, t) => {
    try {
      const a = document.createElement("div");
      a.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
      a.innerHTML = "\n                    <div class=\"bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto\">\n                        <h3 class=\"text-xl font-bold mb-4 text-gray-800\">\n                            <i class=\"fas fa-film text-fuchsia-500 mr-2\"></i>Membuat Prompt Video...\n                        </h3>\n                        <div class=\"flex items-center justify-center py-8\">\n                            <div class=\"loader !border-l-fuchsia-500\"></div>\n                        </div>\n                    </div>\n                ";
      document.body.appendChild(a);
      const n = await fetch(e);
      const i = await n.blob();
      const o = new FileReader();
      const s = new Promise(e => {
        o.onloadend = () => {
          const t = o.result.split(",")[1];
          e(t);
        };
        o.readAsDataURL(i);
      });
      const r = await s;
      const l = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" + window.getGeminiApiKey();
      const d = {
        contents: [{
          parts: [{
            text: `Create a cinematic video prompt for this product image titled "${t}". Make it dynamic and engaging for image-to-video AI.`
          }, {
            inlineData: {
              mimeType: "image/png",
              data: r
            }
          }]
        }],
        systemInstruction: {
          parts: [{
            text: "You are an expert video prompt engineer. Analyze this product image and create a detailed, cinematic prompt for an AI image-to-video generator (like Runway, Pika, or Stable Video Diffusion).\n\nThe prompt should:\n1. Describe product's visual appearance and key features\n2. Suggest natural, engaging camera movements (zoom in, pan, rotation, etc.)\n3. Include dynamic elements (floating particles, light effects, product rotation)\n4. Specify lighting and atmosphere\n5. Be optimized for text-to-video AI models\n6. Be in English for maximum compatibility\n7. Keep it under 200 words but highly detailed\n\nOutput ONLY the video prompt, nothing else."
          }]
        }
      };
      const c = await fetch(l, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(d)
      });
      if (!c.ok) {
        const e = await c.json();
        throw new Error(e.error?.message || "Failed to generate prompt");
      }
      const m = (await c.json()).candidates[0].content.parts[0].text.trim();
      a.innerHTML = `\n                    <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto\">\n                        <div class="flex items-center justify-between mb-4">\n                            <h3 class="text-xl font-bold text-gray-800\">\n                                <i class="fas fa-film text-fuchsia-500 mr-2"></i>Prompt Video untuk: ${t}\n                            </h3>\n                            <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">\n                                <i class="fas fa-times text-xl"></i>\n                            </button>\n                        </div>\n\n                        <div class="mb-4">\n                            <img src="${e}" alt="${t}" class="w-full rounded-lg mb-3 max-h-64 object-contain bg-gray-100">\n                        </div>\n\n                        <div class="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">\n                            <div class="flex items-center justify-between mb-2">\n                                <label class="text-sm font-semibold text-gray-700">Video Prompt:</label>\n                                <button id="copyPromptBtn" class="text-xs bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-3 py-1 rounded-full transition-colors">\n                                    <i class="fas fa-copy mr-1"></i>Copy\n                                </button>\n                            </div>\n                            <textarea id="videoPromptText" rows="8" readonly class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500">${m}</textarea>\n                        </div>\n\n                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">\n                            <p class="text-xs text-blue-800">\n                                <i class="fas fa-info-circle mr-1...
      const u = a.querySelector("#copyPromptBtn");
      const g = a.querySelector("#videoPromptText");
      u.addEventListener("click", () => {
        g.select();
        document.execCommand("copy");
        u.innerHTML = "<i class=\"fas fa-check mr-1\"></i>Copied!";
        u.classList.remove("bg-fuchsia-500", "hover:bg-fuchsia-600");
        u.classList.add("bg-green-500");
        setTimeout(() => {
          u.innerHTML = "<i class=\"fas fa-copy mr-1\"></i>Copy";
          u.classList.remove("bg-green-500");
          u.classList.add("bg-fuchsia-500", "hover:bg-fuchsia-600");
        }, 2000);
      });
    } catch (e) {
      console.error("Error generating video prompt:", e);
      const t = document.createElement("div");
      t.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
      t.innerHTML = `\n                    <div class="bg-white rounded-xl p-6 max-w-md w-full\">\n                        <h3 class="text-xl font-bold mb-4 text-red-600\">\n                            <i class=\"fas fa-exclamation-triangle mr-2\"></i>Error\n                        </h3>\n                        <p class="text-gray-700 mb-4">${e.message}</p>\n                        <button onclick="this.closest('.fixed').remove()" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">\n                            Tutup\n                        </button>\n                    </div>\n                `;
      document.body.appendChild(t);
      const a = document.querySelector(".fixed.inset-0");
      if (a && a !== t) {
        a.remove();
      }
    }
  };
  if (h) {
    async function F(e) {
      const t = document.getElementById(`broll-card-${e + 1}`);
      if (!t) {
        return;
      }
      const a = window.brollGenerationParams ? window.brollGenerationParams[e] : null;
      if (!a) {
        return;
      }
      const n = t.querySelector(".aspect-video, .relative");
      if (n) {
        n.innerHTML = "\n                    <div class=\"flex flex-col items-center justify-center h-full min-h-[200px]\">\n                        <div class=\"loader !border-l-purple-500\"></div>\n                        <p class=\"mt-4 text-sm text-gray-600\">Regenerating...</p>\n                    </div>\n                ";
        try {
          const t = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=" + window.getGeminiApiKey();
          const i = [", slightly different angle", ", alternative perspective", ", different composition", ", varied lighting mood", ", alternative styling", ", different camera angle"];
          const o = i[Math.floor(Math.random() * i.length)];
          const s = [{
            text: a.prompt + o
          }];
          a.productImages.forEach(e => {
            s.push({
              inlineData: {
                mimeType: e.mimeType,
                data: e.base64
              }
            });
          });
          if (a.modelImage) {
            s.push({
              inlineData: {
                mimeType: a.modelImage.mimeType,
                data: a.modelImage.base64
              }
            });
          }
          const r = {
            contents: [{
              parts: s
            }],
            generationConfig: {
              responseModalities: ["IMAGE"],
              imageConfig: {
                aspectRatio: a.ratio
              }
            }
          };
          const l = await fetch(t, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(r)
          });
          if (!l.ok) {
            throw new Error(`API error: ${l.statusText}`);
          }
          const d = await l.json();
          const c = d?.candidates?.[0]?.content?.parts?.find(e => e.inlineData)?.inlineData?.data;
          if (!c) {
            throw new Error("Failed to generate image");
          }
          {
            const t = `data:image/png;base64,${c}`;
            const i = a.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
            const o = a.prompt.replace(/"/g, "&quot;");
            if (R[e]) {
              R[e].url = t;
            }
            n.innerHTML = `<div class="relative w-full h-full group"><img src="${t}" class="w-full h-full object-cover rounded-md" alt="${a.title}"><div class="absolute bottom-2 right-2 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button data-action="broll-preview" data-image-url="${t}" class="action-btn bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600" title="Preview"><i class="fas fa-search-plus"></i></button><button data-action="broll-edit" data-index="${e}" data-prompt="${o}" class="action-btn bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600" title="Edit Prompt"><i class="fas fa-edit"></i></button><button data-action="broll-regenerate" data-index="${e}" class="action-btn bg-green-500 text-white p-2 rounded-full hover:bg-green-600" title="Regenerate"><i class="fas fa-sync-alt"></i></button><button data-action="broll-video" data-image-url="${t}" data-title="${a.title.replace(/"/g, "&quot;")}" class="action-btn bg-fuchsia-500 text-white p-2 rounded-full hover:bg-fuchsia-600" title="Buat Prompt Video"><i class="fas fa-film"></i></button><button data-action="broll-caption" data-image-url="${t}" data-title="${a.title.replace(/"/g, "&quot;")}" class="action-btn bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600" title="Buat Caption"><i class="fas fa-pencil-alt"></i></button><button data-action="broll-download" data-image-url="${t}" data-filename="1affiliate_${e + 1}_${i}.png" class="action-btn bg-cyan-600 text-white p-2 rounded-full hover:bg-cyan-700" title="Unduh"><i class="fas fa-download"></i></button></div></div>`;
          }
        } catch (e) {
          console.error("Regenerate error:", e);
          n.innerHTML = "\n                        <div class=\"flex flex-col items-center justify-center h-full min-h-[200px] text-red-600\">\n                            <i class=\"fas fa-exclamation-triangle text-3xl mb-2\"></i>\n                            <p class=\"text-sm\">Gagal regenerate</p>\n                            <button onclick=\"location.reload()\" class=\"mt-2 text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600\">\n                                Refresh\n                            </button>\n                        </div>\n                    ";
        }
      }
    }
    h.addEventListener("click", async e => {
      e.stopPropagation();
      const t = e.target.closest(".action-btn[data-action]");
      if (!t) {
        return;
      }
      const a = t.dataset.action;
      const n = t.dataset.imageUrl;
      const i = t.dataset.title;
      const o = t.dataset.filename;
      const s = t.dataset.index;
      if (a === "broll-preview" && n) {
        showPreviewModal(n);
      } else if (a === "broll-edit" && s !== undefined) {
        (function (e, t) {
          const a = document.createElement("div");
          a.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
          a.innerHTML = `\n                    <div class="bg-white rounded-xl p-6 max-w-2xl w-full">\n                        <h3 class="text-xl font-bold mb-4 text-gray-800">\n                            <i class="fas fa-edit text-purple-500 mr-2"></i>Edit Scene Prompt\n                        </h3>\n                        <div class="mb-4">\n                            <label class="block text-sm font-semibold text-gray-700 mb-2">Scene Description:</label>\n                            <textarea id="edit-broll-input" rows="4" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none" placeholder="Contoh: A serene mountain landscape with a river flowing through, vibrant flowers in foreground, golden hour lighting...">${t}</textarea>\n                            <p class="text-xs text-gray-500 mt-2">\n                                <i class="fas fa-info-circle mr-1\"></i>\n                                Edit deskripsi scene/style untuk hasil yang berbeda\n                            </p>\n                        </div>\n                        <div class="flex gap-2\">\n                            <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">\n                                Batal\n                            </button>\n                            <button id="confirm-edit-broll-btn" class="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">\n                                <i class="fas fa-check mr-2\"></i>Generate Ulang\n                            </button>\n                        </div>\n                    </div>\n                `;
          document.body.appendChild(a);
          const n = a.querySelector("#confirm-edit-broll-btn");
          const i = a.querySelector("#edit-broll-input");
          n.addEventListener("click", async () => {
            const t = i.value.trim();
            if (t) {
              a.remove();
              if (window.brollGenerationParams && window.brollGenerationParams[e]) {
                window.brollGenerationParams[e].prompt = t;
              }
              await F(e);
            }
          });
        })(parseInt(s), t.dataset.prompt);
      } else if (a === "broll-regenerate" && s !== undefined) {
        await F(parseInt(s));
      } else if (a === "broll-video" && n && i) {
        window.handleAffiliateVideoPrompt(n, i);
      } else if (a === "broll-caption" && n && i) {
        window.handleAffiliateCaption(n, i);
      } else if (a === "broll-download" && n && o && window.downloadDataURINew) {
        await window.downloadDataURINew(n, o);
      }
    });
  }
})();