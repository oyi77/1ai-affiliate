(function () {
  const e = document.getElementById("food-selfie-food-image-uploader");
  const t = document.getElementById("food-selfie-food-file-input");
  const a = document.getElementById("food-selfie-food-upload-prompt");
  const n = document.getElementById("food-selfie-food-image-preview");
  const i = document.getElementById("food-selfie-style-image-uploader");
  const o = document.getElementById("food-selfie-style-file-input");
  const s = document.getElementById("food-selfie-style-upload-prompt");
  const r = document.getElementById("food-selfie-style-image-preview");
  const l = document.getElementById("food-selfie-background-input");
  const d = document.getElementById("food-selfie-background-upload-area");
  const c = document.getElementById("food-selfie-background-preview");
  const m = document.getElementById("food-selfie-background-preview-container");
  const u = document.getElementById("food-selfie-remove-background");
  const g = document.getElementById("food-selfie-model-input");
  const p = document.getElementById("food-selfie-model-upload-area");
  const h = document.getElementById("food-selfie-model-preview");
  const f = document.getElementById("food-selfie-model-preview-container");
  const y = document.getElementById("food-selfie-remove-model");
  const b = document.getElementById("food-selfie-theme-selection");
  const w = document.getElementById("food-selfie-custom-theme-container");
  const v = document.getElementById("food-selfie-custom-theme-input");
  const k = document.getElementById("food-selfie-ratio-selection");
  const E = document.getElementById("food-selfie-count-selection");
  const I = document.getElementById("food-selfie-count-text");
  const L = document.getElementById("food-selfie-generate-btn");
  const x = document.getElementById("food-selfie-loader");
  const T = document.getElementById("food-selfie-progress-text");
  const $ = document.getElementById("food-selfie-progress-bar");
  const A = document.getElementById("food-selfie-current-task");
  const S = document.getElementById("food-selfie-placeholder-result");
  const C = document.getElementById("food-selfie-result-content");
  const M = document.getElementById("food-selfie-error-message");
  const B = document.getElementById("food-selfie-results-header");
  const N = document.getElementById("food-selfie-result-count");
  const R = document.getElementById("food-selfie-download-all-btn");
  let P = null;
  let D = null;
  let O = null;
  let H = null;
  let j = null;
  let U = null;
  let G = "";
  let F = "1:1";
  let q = 6;
  let K = [];
  let V = {};
  function Y(e, t, a, n, i) {
    if (e) {
      e.addEventListener("click", () => t.click());
      e.addEventListener("dragover", t => {
        t.preventDefault();
        e.classList.add("border-green-400", "bg-green-50");
      });
      e.addEventListener("dragleave", () => {
        e.classList.remove("border-green-400", "bg-green-50");
      });
      e.addEventListener("drop", o => {
        o.preventDefault();
        e.classList.remove("border-green-400", "bg-green-50");
        const s = o.dataTransfer.files;
        if (s.length > 0) {
          t.files = s;
          z({
            target: t
          }, a, n, i);
        }
      });
      t.addEventListener("change", e => z(e, a, n, i));
    }
  }
  function z(e, t, a, n) {
    const i = e.target.files[0];
    if (i && i.type.startsWith("image/")) {
      const e = new FileReader();
      e.onloadend = () => {
        const [i, o] = e.result.split(",");
        const s = i.match(/:(.*?);/)[1];
        n(o, s);
        t.src = e.result;
        t.classList.remove("hidden");
        a.classList.add("hidden");
        J();
      };
      e.readAsDataURL(i);
    }
  }
  function J() {
    if (L) {
      L.disabled = !P;
    }
  }
  function _(e) {
    if (e) {
      if (S) {
        S.classList.add("hidden");
      }
      if (x) {
        x.classList.remove("hidden");
      }
      if (B) {
        B.classList.add("hidden");
      }
      if (C) {
        C.classList.add("hidden");
      }
    } else if (x) {
      x.classList.add("hidden");
    }
  }
  function W(e) {
    if (M && e) {
      M.textContent = e;
      M.classList.remove("hidden");
    } else if (M) {
      M.classList.add("hidden");
    }
  }
  Y(e, t, n, a, (e, t) => {
    P = e;
    j = t;
  });
  Y(i, o, r, s, (e, t) => {
    D = e;
    U = t;
    J();
  });
  if (l) {
    l.addEventListener("change", async e => {
      const t = e.target.files[0];
      if (!t) {
        return;
      }
      let a = t;
      if (t.type === "image/heic" || t.name.toLowerCase().endsWith(".heic")) {
        try {
          const e = await heic2any({
            blob: t,
            toType: "image/jpeg",
            quality: 0.9
          });
          a = new File([e], t.name.replace(/\.heic$/i, ".jpg"), {
            type: "image/jpeg"
          });
        } catch (e) {
          console.error("HEIC conversion failed:", e);
          alert("Gagal mengkonversi gambar HEIC");
          return;
        }
      }
      const n = new FileReader();
      n.onloadend = () => {
        O = n.result;
        if (c && m && d) {
          c.src = n.result;
          d.classList.add("hidden");
          m.classList.remove("hidden");
        }
      };
      n.readAsDataURL(a);
    });
  }
  if (u) {
    u.addEventListener("click", () => {
      O = null;
      if (l) {
        l.value = "";
      }
      if (d) {
        d.classList.remove("hidden");
      }
      if (m) {
        m.classList.add("hidden");
      }
      if (c) {
        c.src = "";
      }
    });
  }
  if (g) {
    g.addEventListener("change", async e => {
      const t = e.target.files[0];
      if (!t) {
        return;
      }
      let a = t;
      if (t.type === "image/heic" || t.name.toLowerCase().endsWith(".heic")) {
        try {
          const e = await heic2any({
            blob: t,
            toType: "image/jpeg",
            quality: 0.9
          });
          a = new File([e], t.name.replace(/\.heic$/i, ".jpg"), {
            type: "image/jpeg"
          });
        } catch (e) {
          console.error("HEIC conversion failed:", e);
          alert("Gagal mengkonversi gambar HEIC");
          return;
        }
      }
      const n = new FileReader();
      n.onloadend = () => {
        H = n.result;
        if (h && f && p) {
          h.src = n.result;
          p.classList.add("hidden");
          f.classList.remove("hidden");
          setTimeout(() => {
            if (window.innerWidth < 768 && k) {
              k.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
            }
          }, 300);
        }
      };
      n.readAsDataURL(a);
    });
  }
  if (y) {
    y.addEventListener("click", e => {
      e.stopPropagation();
      H = null;
      if (g) {
        g.value = "";
      }
      if (p) {
        p.classList.remove("hidden");
      }
      if (f) {
        f.classList.add("hidden");
      }
      if (h) {
        h.src = "";
      }
    });
  }
  if (p) {
    p.addEventListener("touchstart", e => {
      p.style.transform = "scale(0.98)";
    }, {
      passive: true
    });
    p.addEventListener("touchend", e => {
      setTimeout(() => {
        p.style.transform = "";
      }, 100);
    }, {
      passive: true
    });
  }
  if (b) {
    b.addEventListener("click", e => {
      const t = e.target.closest(".theme-btn-food");
      if (t) {
        document.querySelectorAll("#food-selfie-theme-selection .theme-btn-food").forEach(e => e.classList.remove("selected"));
        t.classList.add("selected");
        G = t.dataset.theme;
        if (w) {
          if (G === "custom") {
            w.classList.remove("hidden");
          } else {
            w.classList.add("hidden");
          }
        }
      }
    });
  }
  if (k) {
    k.addEventListener("click", e => {
      const t = e.target.closest(".option-btn-food");
      if (t) {
        document.querySelectorAll("#food-selfie-ratio-selection .option-btn-food").forEach(e => e.classList.remove("selected"));
        t.classList.add("selected");
        F = t.dataset.ratio;
      }
    });
  }
  if (E) {
    E.addEventListener("click", e => {
      const t = e.target.closest("[data-count]");
      if (t) {
        document.querySelectorAll("#food-selfie-count-selection .count-btn").forEach(e => {
          e.classList.remove("count-selected", "bg-gradient-to-r", "from-indigo-600", "to-purple-600", "text-white", "border-indigo-600", "font-bold", "shadow-md");
          e.classList.add("bg-gray-50", "hover:bg-gray-100", "text-gray-700", "border-gray-300", "font-medium");
        });
        t.classList.remove("bg-gray-50", "hover:bg-gray-100", "text-gray-700", "border-gray-300", "font-medium");
        t.classList.add("count-selected", "bg-gradient-to-r", "from-indigo-600", "to-purple-600", "text-white", "border-indigo-600", "font-bold", "shadow-md");
        q = parseInt(t.dataset.count, 10);
        if (I) {
          I.textContent = q;
        }
      }
    });
  }
  if (L) {
    L.addEventListener("click", async () => {
      if (!window.checkApiKey()) {
        return;
      }
      J();
      if (L.disabled) {
        W("Unggah foto makanan dan pilih tema atau gambar referensi.");
        return;
      }
      K = [];
      if (B) {
        B.classList.add("hidden");
      }
      V = {
        foodBase64Image: P,
        foodMimeType: j,
        styleBase64Image: D,
        styleMimeType: U,
        selectedTheme: G,
        selectedFoodSelfieRatio: F
      };
      const e = L.innerHTML;
      L.disabled = true;
      L.innerHTML = "<i class=\"fas fa-spinner fa-spin mr-2\"></i>Generating...";
      L.classList.add("opacity-75", "cursor-not-allowed");
      _(true);
      W("");
      C.innerHTML = "";
      const t = ["Top-Down Flat Lay", "Classic 45-Degree Angle", "Dynamic Action Shot (e.g., pouring, steam)", "Close-up Macro Shot", "Minimalist Studio Shot (Clean Background)", "Bright Natural Window Light", "Moody Dark Background", "Diagonal Angle with Depth", "Side Profile View", "Overhead Birds Eye View", "Rustic Natural Lighting"].slice(0, q);
      const a = Array.from({
        length: q
      }, (e, a) => async function (e, t) {
        try {
          if (T) {
            T.textContent = `${e}/${q}`;
          }
          if ($) {
            const t = e / q * 100;
            $.style.width = `${t}%`;
          }
          if (A) {
            const a = H ? `Creating photo ${e} with person and ${t} style...` : `Creating photo ${e} with ${t} style...`;
            A.textContent = a;
          }
          if (e === 1 && window.innerWidth < 768 && x) {
            setTimeout(() => {
              x.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
            }, 200);
          }
          let a = "";
          const n = [];
          let i = G;
          if (G === "custom" && v && v.value.trim()) {
            i = v.value.trim();
          } else if (G === "custom") {
            i = "Professional food photography";
          }
          if (O || H) {
            const e = O ? O.split(",")[1] : null;
            const o = H ? H.split(",")[1] : null;
            let s = "";
            let r = 1;
            if (e) {
              s += `IMAGE ${r} (Background Reference) = The LOCATION/ENVIRONMENT where the food will be photographed\n`;
              r++;
            }
            s += `IMAGE ${r} (Food Subject) = The FOOD ITEM to be featured in the photo\n`;
            r++;
            if (o) {
              s += `IMAGE ${r} (Model/Person Reference) = The PERSON/MODEL who will appear in the photo with the food\n`;
            }
            a = `Create a PHOTOREALISTIC food photography by seamlessly integrating these ${e && o ? "three" : "two"} images:\n\n${s}\n\nYOUR TASK: Create a single, natural-looking photograph that ${o ? "MUST SHOW the PERSON from the Model image appearing with the food, holding, presenting, or enjoying it" : "appears as if the food was actually photographed in this location"}${e ? " in the location from the background reference" : ""}. The result must be completely seamless and photorealistic.\n\n${o ? "\n⚠️ CRITICAL REQUIREMENT - MODEL/PERSON MUST BE VISIBLE:\n- The final photo MUST show the PERSON/MODEL from the Model image (not just hands)\n- The person should be visible from chest-up (upper body) or full body, depending on composition\n- The person should be naturally holding, presenting, or enjoying the food\n- DO NOT show only hands - the PERSON's face, body, and presence must be clearly visible\n- The person should occupy 40-60% of the frame, with food taking 30-40%\n- Think lifestyle food photography or food blogger content - person with food, not just food alone\n- The person's identity, face, clothing, and appearance from the original image must be preserved\n" : ""}\n\nPHOTOGRAPHY STYLE: ${t}\nSCENE SETTING: ${i || "Professional food photography"}\n\nCRITICAL PHOTOREALISM REQUIREMENTS:\n\n${o ? "0. MODEL/PERSON INTEGRATION (MANDATORY - THIS IS THE MOST IMPORTANT REQUIREMENT):\n   - ⚠️ THE PERSON FROM THE MODEL IMAGE MUST BE CLEARLY VISIBLE IN THE FINAL PHOTO\n   - PRESERVE THE PERSON'S EXACT IDENTITY: Face, facial features, skin tone, hair, clothing style from original image\n   - Show the person from chest-up (upper body portrait) or full body depending on scene\n   - DO NOT crop to only show hands - the PERSON must be recognizable in the photo\n   - Position the person naturally in the scene: sitting at table, holding food, or presenting dish\n   - The person should be interacting with the food in a natural, lifestyle way\n   - Match the person's clothi...
            n.push({
              text: a
            });
            if (e) {
              n.push({
                inlineData: {
                  mimeType: "image/jpeg",
                  data: e
                }
              });
            }
            n.push({
              inlineData: {
                mimeType: j,
                data: P
              }
            });
            if (o) {
              n.push({
                inlineData: {
                  mimeType: "image/jpeg",
                  data: o
                }
              });
            }
          } else if (D) {
            a = "IMPORTANT: Your task is to place the food from the first image into the exact scene of the second image. The final output MUST perfectly replicate the composition, camera angle, and lighting from the second uploaded image. The setting and photographic style must be identical. The food from the first image is the new subject, but it must be integrated photorealistically into the replicated scene.";
            if (i) {
              a += ` The overall mood should have a '${i}' feel.`;
            }
            n.push({
              text: a
            });
            n.push({
              inlineData: {
                mimeType: j,
                data: P
              }
            });
            n.push({
              inlineData: {
                mimeType: U,
                data: D
              }
            });
          } else {
            a = `Create a professional, aesthetic photograph featuring the exact food from the uploaded image.\n\nPHOTOGRAPHY STYLE: ${t}\nSETTING: ${i || "Professional food photography"}\nREQUIREMENTS:\n- High quality, sharp focus with beautiful lighting\n- Cinematic composition suitable for ${i || "professional food content"}\n- Make the food look appetizing and Instagram-worthy\n- Perfect for social media content (Instagram, TikTok, Pinterest)\n- Maintain the food's authentic appearance\n- ${F} aspect ratio composition`;
            n.push({
              text: a
            });
            n.push({
              inlineData: {
                mimeType: j,
                data: P
              }
            });
          }
          const o = {
            contents: [{
              parts: n
            }],
            generationConfig: {
              responseModalities: ["IMAGE"],
              imageConfig: {
                aspectRatio: F
              }
            }
          };
          const s = await async function (e, t = 3, a = 1000) {
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
                    const t = JSON.parse(n);
                    e = t.error?.message || e;
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
                  console.error("Failed to parse successful response:", n);
                  throw new Error("Received an invalid JSON response from the server.");
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
          }(o);
          const r = s?.candidates?.[0]?.content?.parts?.find(e => e.inlineData);
          const l = r?.inlineData?.data;
          if (l) {
            const a = `data:image/png;base64,${l}`;
            const n = `food_${t.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${e}.png`;
            K.push({
              url: a,
              filename: n,
              style: t
            });
            (function (e, t, a, n) {
              if (!C) {
                return;
              }
              const i = document.createElement("div");
              i.className = "relative group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white";
              i.innerHTML = `\n                <img src="${e}" class="w-full h-full object-cover aspect-square" alt="${n}">\n                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">\n                    <button data-action="preview" data-index="${a}" class="action-btn bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full font-semibold shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2">\n                        <i class="fas fa-eye"></i>\n                        <span class="hidden sm:inline">Preview</span>\n                    </button>\n                    <button data-action="download" data-index="${a}" class="action-btn bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-full font-semibold shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2">\n                        <i class="fas fa-download"></i>\n                        <span class="hidden sm:inline">Download</span>\n                    </button>\n                </div>\n                <div class="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">\n                    ${n}\n                </div>\n            `;
              C.appendChild(i);
            })(a, 0, e - 1, t);
          }
        } catch (t) {
          console.error(`Error generating food image ${e}:`, t);
          (function () {
            if (!C) {
              return;
            }
            const e = document.createElement("div");
            e.className = "relative rounded-xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center aspect-square";
            e.innerHTML = "\n                <div class=\"text-center p-4\">\n                    <i class=\"fas fa-exclamation-circle text-red-500 text-3xl mb-2\"></i>\n                    <p class=\"text-xs text-red-500\">Gagal generate</p>\n                </div>\n            ";
            C.appendChild(e);
          })();
        }
      }(a + 1, t[a]));
      await Promise.allSettled(a);
      _(false);
      if ($) {
        $.style.width = "0%";
      }
      if (T) {
        T.textContent = "0/6";
      }
      if (A) {
        A.textContent = "";
      }
      L.disabled = false;
      L.innerHTML = e;
      L.classList.remove("opacity-75", "cursor-not-allowed");
      if (K.length > 0) {
        if (B) {
          B.classList.remove("hidden");
        }
        if (N) {
          N.textContent = K.length;
        }
        C.classList.remove("hidden");
        setTimeout(() => {
          if (window.innerWidth < 768 && B) {
            B.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        }, 300);
      } else {
        S.classList.remove("hidden");
        W("Gagal generate gambar. Silakan coba lagi.");
      }
    });
  }
  if (C) {
    C.addEventListener("click", async e => {
      e.stopPropagation();
      const t = e.target.classList.contains("action-btn") ? e.target : e.target.closest(".action-btn[data-action]");
      if (!t) {
        return;
      }
      const a = t.dataset.action;
      const n = parseInt(t.dataset.index, 10);
      const i = K[n];
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
  if (R) {
    R.addEventListener("click", async e => {
      e.stopPropagation();
      if (K.length === 0 || R.disabled) {
        return;
      }
      const t = R.innerHTML;
      R.disabled = true;
      try {
        for (let e = 0; e < K.length; e++) {
          const t = K[e];
          R.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i><span>Downloading ${e + 1}/${K.length}...</span>`;
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
        R.innerHTML = "<i class=\"fas fa-check mr-2\"></i><span>Selesai!</span>";
        setTimeout(() => {
          R.disabled = false;
          R.innerHTML = t;
        }, 2000);
      } catch (e) {
        console.error("Download all error:", e);
      }
    });
  }
})();