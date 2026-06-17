(function () {
  const e = document.getElementById("halu-image-input");
  const t = document.getElementById("halu-image-upload-area");
  const a = document.getElementById("halu-image-preview-container");
  const n = document.getElementById("halu-image-preview");
  const i = document.getElementById("halu-remove-image-btn");
  const o = document.getElementById("halu-idol-image-input");
  const s = document.getElementById("halu-idol-image-upload-area");
  const r = document.getElementById("halu-idol-image-preview-container");
  const l = document.getElementById("halu-idol-image-preview");
  const d = document.getElementById("halu-remove-idol-image-btn");
  const c = document.getElementById("halu-moment-desc-input");
  const m = document.getElementById("halu-photo-style-input");
  const u = document.getElementById("halu-generate-btn");
  const g = document.getElementById("halu-b-roll-grid");
  const p = document.getElementById("halu-ratio-selection");
  let h = null;
  let f = null;
  let y = null;
  let b = null;
  let w = "16:9";
  function v() {
    u.disabled = !h || !y;
  }
  function k(e, t, a, n, i, o) {
    e.addEventListener("change", e => {
      const i = e.target.files[0];
      if (i) {
        const e = new FileReader();
        e.onload = e => {
          n.src = e.target.result;
          const [i, s] = e.target.result.split(",");
          const r = i.match(/:(.*?);/)[1];
          o(s, r);
          t.classList.add("hidden");
          a.classList.remove("hidden");
          v();
        };
        e.readAsDataURL(i);
      }
    });
    i.addEventListener("click", () => {
      o(null, null);
      e.value = "";
      t.classList.remove("hidden");
      a.classList.add("hidden");
      v();
    });
  }
  k(e, t, a, n, i, (e, t) => {
    h = e;
    f = t;
  });
  k(o, s, r, l, d, (e, t) => {
    y = e;
    b = t;
  });
  if (p) {
    p.addEventListener("click", e => {
      const t = e.target.closest(".ratio-btn-halu");
      if (t) {
        document.querySelectorAll("#halu-ratio-selection .ratio-btn-halu").forEach(e => e.classList.remove("selected"));
        t.classList.add("selected");
        w = t.dataset.ratio;
      }
    });
  }
  (() => {
    g.innerHTML = "";
    for (let e = 1; e <= 6; e++) {
      const e = document.createElement("div");
      e.className = "b-roll-card card p-4 flex flex-col justify-between animate-pulse";
      e.innerHTML = "<div class=\"h-6 bg-pink-200 rounded w-3/4 mb-4\"></div><div class=\"mt-4 aspect-square bg-pink-100 rounded-md\"></div>";
      g.appendChild(e);
    }
  })();
  u.addEventListener("click", async () => {
    if (!window.checkApiKey()) {
      return;
    }
    if (h && y) {
      u.disabled = true;
      u.innerHTML = "<div class=\"loader\"></div><span class=\"ml-2\">Mencari Ide...</span>";
      try {
        const e = await async function () {
          const e = {
            contents: [{
              parts: [{
                text: `Moment: "${c.value.trim()}"\nStyle: "${m.value.trim()}"\nAspect Ratio: "${w}"`
              }, {
                inlineData: {
                  mimeType: f,
                  data: h
                }
              }, {
                inlineData: {
                  mimeType: b,
                  data: y
                }
              }]
            }],
            systemInstruction: {
              parts: [{
                text: "You are an AI photo blending assistant. Analyze a fan's photo and an idol's photo. Generate 6 distinct, creative photo concepts where they appear together as a couple. For each, provide a short title (in Indonesian) and a detailed prompt (in English) for an AI image generator. Respond ONLY with a valid JSON array of 6 objects with 'title' and 'prompt' keys."
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
                  }
                }
              }
            }
          };
          const t = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" + window.getGeminiApiKey(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(e)
          });
          if (!t.ok) {
            throw new Error(`HTTP error! status: ${t.status}`);
          }
          const a = await t.json();
          return JSON.parse(a.candidates[0].content.parts[0].text);
        }();
        u.innerHTML = "<div class=\"loader\"></div><span class=\"ml-2\">Membuat Foto...</span>";
        E(e);
        const t = e.map((e, t) => async function (e, t, a) {
          const n = document.getElementById(`halu-card-${e}`);
          if (!n) {
            return;
          }
          const i = n.querySelector(".aspect-square");
          try {
            const n = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=" + window.getGeminiApiKey();
            const o = {
              contents: [{
                parts: [{
                  text: `${a}, realistic photo, romantic, candid moment, high quality, detailed faces, cinematic lighting, 8k, aspect ratio ${w}`
                }, {
                  inlineData: {
                    mimeType: f,
                    data: h
                  }
                }, {
                  inlineData: {
                    mimeType: b,
                    data: y
                  }
                }]
              }],
              generationConfig: {
                responseModalities: ["IMAGE"],
                imageConfig: {
                  aspectRatio: w
                }
              }
            };
            const s = await fetch(n, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(o)
            });
            if (!s.ok) {
              throw new Error(`API error: ${s.statusText}`);
            }
            const r = await s.json();
            const l = r?.candidates?.[0]?.content?.parts?.find(e => e.inlineData)?.inlineData?.data;
            if (!l) {
              throw new Error("No image data from API.");
            }
            {
              const a = `data:image/png;base64,${l}`;
              const n = t.replace(/[^a-z0-9]/gi, "_").toLowerCase();
              i.innerHTML = `\n                        <div class="relative w-full h-full group">\n                            <img src="${a}" class="w-full h-full object-cover rounded-md" alt="${t}">\n                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out rounded-b-md">\n                                <div class="flex gap-2 justify-end">\n                                    <button data-action="halu-download" data-image-url="${a}" data-filename="halu_${e}_${n}.png" class="action-btn bg-pink-600 text-white px-3 py-2 rounded-lg hover:bg-pink-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm font-medium" title="Unduh Gambar">\n                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>\n                                        <span class="hidden sm:inline">Unduh</span>\n                                    </button>\n                                </div>\n                            </div>\n                        </div>`;
            }
          } catch (e) {
            i.innerHTML = "<div class=\"text-xs text-red-500 p-2 text-center\">Gagal.</div>";
          }
        }(t + 1, e.title, e.prompt));
        await Promise.allSettled(t);
      } catch (e) {
        console.error("Error:", e);
      } finally {
        u.disabled = false;
        u.innerHTML = "<span>Buat 6 Foto Halu</span>";
      }
    }
  });
  const E = e => {
    g.innerHTML = "";
    e.forEach((e, t) => {
      const a = document.createElement("div");
      a.id = `halu-card-${t + 1}`;
      a.className = "b-roll-card card p-4 flex flex-col justify-between";
      a.innerHTML = `<div><h3 class="text-lg font-semibold text-gray-800 mb-4">${e.title}</h3></div> <div class="aspect-square bg-pink-100 rounded-md flex items-center justify-center"><div class="loader"></div></div>`;
      g.appendChild(a);
    });
  };
  const I = document.querySelector("#content-halu .hearts-container");
  if (I) {
    for (let e = 0; e < 20; e++) {
      const e = document.createElement("div");
      e.className = "heart";
      e.style.left = Math.random() * 100 + "vw";
      e.style.animationDuration = 8 + Math.random() * 10 + "s";
      e.style.animationDelay = Math.random() * 7 + "s";
      I.appendChild(e);
    }
  }
  if (g) {
    g.addEventListener("click", async e => {
      const t = e.target.closest("[data-action=\"halu-download\"]");
      if (t) {
        e.stopPropagation();
        const a = t.dataset.imageUrl;
        const n = t.dataset.filename;
        if (a && n) {
          if (window.downloadDataURINew) {
            await window.downloadDataURINew(a, n);
          } else if (window.downloadImage) {
            await window.downloadImage(a, n);
          }
        }
      }
    });
  }
})();