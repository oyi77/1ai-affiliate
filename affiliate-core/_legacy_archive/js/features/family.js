(function () {
  const e = document.getElementById("family-file-input-area");
  const t = document.getElementById("family-add-photo-btn");
  const a = document.getElementById("content-family");
  const n = document.getElementById("family-ratio-options");
  const i = document.getElementById("family-custom-theme-input");
  const o = document.getElementById("family-generate-btn");
  const s = document.getElementById("loading-indicator");
  const r = document.getElementById("result-image-container");
  const l = document.getElementById("family-results-placeholder");
  const d = document.getElementById("family-results-header");
  const c = document.getElementById("family-download-all-btn");
  const m = document.getElementById("family-random-theme-btn");
  const u = document.getElementById("family-custom-modal");
  const g = document.getElementById("family-modal-message");
  let p = [null, null];
  let h = [null, null];
  let f = null;
  let y = "3:4";
  let b = [];
  let w = "";
  const v = document.getElementById("family-background-input");
  const k = document.getElementById("family-background-upload-area");
  const E = document.getElementById("family-background-preview");
  const I = document.getElementById("family-background-preview-container");
  const L = document.getElementById("family-remove-background");
  function x(e) {
    if (g) {
      g.textContent = e;
    }
    if (u) {
      u.style.display = "flex";
    }
  }
  function T() {
    if (e) {
      e.innerHTML = "";
      p.forEach((t, a) => {
        const n = document.createElement("div");
        n.className = "file-input-wrapper";
        if (t) {
          n.classList.add("has-photo");
        }
        const i = document.createElement("input");
        i.type = "file";
        i.accept = "image/*";
        i.className = "file-input";
        i.dataset.index = a;
        i.addEventListener("change", $);
        const o = document.createElement("img");
        o.className = "file-preview";
        if (t) {
          o.src = `data:${h[a]};base64,${t}`;
        } else {
          o.classList.add("hidden");
        }
        const s = document.createElement("span");
        s.className = "text-gray-500 text-center text-sm";
        if (!t) {
          s.textContent = "Tambahkan Foto";
        }
        const r = document.createElement("button");
        r.className = "delete-btn";
        r.innerHTML = "×";
        r.onclick = e => familyDeletePhoto(e, a);
        n.append(i, o, s, r);
        e.appendChild(n);
      });
    }
  }
  function $(e) {
    const t = parseInt(e.target.dataset.index, 10);
    const a = e.target.files[0];
    if (a) {
      const e = new FileReader();
      e.onload = e => {
        p[t] = e.target.result.split(",")[1];
        h[t] = a.type;
        T();
      };
      e.readAsDataURL(a);
    }
  }
  async function A(e, t, a = 3, n = 1000) {
    for (let i = 0; i < a; i++) {
      try {
        const a = await fetch(e, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(t)
        });
        if (!a.ok) {
          const e = await a.text();
          throw new Error(`API Error (${a.status}): ${e}`);
        }
        return await a.json();
      } catch (e) {
        console.error(`Attempt ${i + 1} failed:`, e);
        if (i === a - 1) {
          throw e;
        }
        await new Promise(e => setTimeout(e, n * Math.pow(2, i)));
      }
    }
  }
  async function S(e) {
    const t = r.querySelector(`[data-index="${e}"]`);
    if (!t) {
      return;
    }
    const a = t.querySelector(".generated-image");
    const n = a.src;
    a.style.opacity = "0.5";
    a.style.filter = "blur(4px)";
    try {
      const t = p.map((e, t) => ({
        base64: e,
        mimeType: h[t]
      })).filter(e => e.base64);
      const n = [{
        text: `PENTING: Buat foto keluarga yang sangat realistis dan fotorealistis. Gabungkan semua orang dari semua foto yang diunggah ke dalam satu adegan yang kohesif. Pastikan semua wajah terlihat jelas dan menyerupai orang di foto aslinya. Tema foto adalah: '${w}'. Gunakan pencahayaan sinematik dan komposisi profesional.`
      }];
      t.forEach(e => {
        n.push({
          inlineData: {
            mimeType: e.mimeType,
            data: e.base64
          }
        });
      });
      const i = {
        contents: [{
          parts: n
        }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: y
          }
        }
      };
      const o = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=" + window.getGeminiApiKey();
      const s = await A(o, i);
      const r = s?.candidates?.[0]?.content?.parts?.find(e => e.inlineData)?.inlineData?.data;
      if (r) {
        const t = `data:image/png;base64,${r}`;
        a.src = t;
        b[e].url = t;
      }
    } catch (e) {
      console.error("Error regenerating image:", e);
      a.src = n;
      x("Gagal regenerate gambar. Silakan coba lagi.");
    } finally {
      a.style.opacity = "1";
      a.style.filter = "none";
    }
  }
  window.familyCloseModal = () => {
    if (u) {
      u.style.display = "none";
    }
  };
  window.familyDeletePhoto = (e, t) => {
    e.stopPropagation();
    p[t] = null;
    h[t] = null;
    if (p.length > 2) {
      p.splice(t, 1);
      h.splice(t, 1);
    }
    T();
  };
  if (t) {
    t.addEventListener("click", () => {
      if (p.length < 10) {
        p.push(null);
        h.push(null);
        T();
      } else {
        x("Anda hanya dapat menambahkan maksimal 10 foto.");
      }
    });
  }
  if (v) {
    v.addEventListener("change", async e => {
      const t = e.target.files[0];
      if (t) {
        try {
          let e = t;
          if (t.type === "image/heic" || t.name.toLowerCase().endsWith(".heic")) {
            const a = window.heic2any;
            if (a) {
              const n = await a({
                blob: t,
                toType: "image/jpeg",
                quality: 0.9
              });
              e = new File([n], t.name.replace(/\.heic$/i, ".jpg"), {
                type: "image/jpeg"
              });
            }
          }
          const a = new FileReader();
          a.onloadend = () => {
            f = a.result;
            if (E && I && k) {
              E.src = a.result;
              k.classList.add("hidden");
              I.classList.remove("hidden");
            }
          };
          a.readAsDataURL(e);
        } catch (e) {
          console.error("Error processing background image:", e);
          x("Gagal memproses gambar background");
        }
      }
    });
  }
  if (L) {
    L.addEventListener("click", e => {
      e.stopPropagation();
      f = null;
      if (v) {
        v.value = "";
      }
      if (k) {
        k.classList.remove("hidden");
      }
      if (I) {
        I.classList.add("hidden");
      }
      if (E) {
        E.src = "";
      }
    });
  }
  if (a) {
    a.addEventListener("click", e => {
      if (e.target.classList.contains("theme-btn") && e.target.id !== "family-random-theme-btn") {
        a.querySelectorAll(".theme-btn").forEach(e => e.classList.remove("active"));
        e.target.classList.add("active");
      }
    });
  }
  if (m) {
    m.addEventListener("click", () => {
      if (a) {
        const e = Array.from(a.querySelectorAll(".theme-btn:not(#family-random-theme-btn)"));
        if (e.length > 0) {
          a.querySelectorAll(".theme-btn").forEach(e => e.classList.remove("active"));
          e[Math.floor(Math.random() * e.length)].classList.add("active");
        }
      }
    });
  }
  if (n) {
    n.addEventListener("click", e => {
      const t = e.target.closest(".option-btn-family");
      if (t) {
        n.querySelectorAll(".option-btn-family").forEach(e => e.classList.remove("selected"));
        t.classList.add("selected");
        y = t.dataset.value;
      }
    });
  }
  if (o) {
    o.addEventListener("click", async () => {
      if (!window.checkApiKey()) {
        return;
      }
      const e = p.map((e, t) => ({
        base64: e,
        mimeType: h[t]
      })).filter(e => e.base64);
      if (e.length < 2) {
        x("Silakan unggah minimal 2 foto keluarga.");
        return;
      }
      const t = i ? i.value.trim() : "";
      const n = a ? a.querySelector(".theme-btn.active") : null;
      let o;
      let c = "";
      if (t) {
        c = t;
      } else {
        if (!n) {
          x("Silakan pilih tema atau tulis tema custom terlebih dahulu.");
          return;
        }
        c = n.dataset.theme;
      }
      if (l) {
        l.classList.add("hidden");
      }
      if (d) {
        d.classList.add("hidden");
      }
      s.style.display = "flex";
      r.style.display = "none";
      r.innerHTML = "";
      b = [];
      w = c;
      const m = [];
      if (f) {
        const t = f.split(",")[1];
        o = `CRITICAL: Create an EXTREMELY PHOTOREALISTIC family photo that looks 100% NATURAL and REAL, NOT AI-GENERATED.\n\nTASK: Seamlessly composite ALL people from ALL uploaded photos into the background location from the last image.\n\nULTRA-NATURAL REQUIREMENTS (MOST IMPORTANT):\n✓ Photo must look like it was taken by a REAL CAMERA with REAL PEOPLE at a REAL LOCATION\n✓ NO AI-generated look - must be indistinguishable from genuine photography\n✓ Natural camera imperfections: slight motion blur, natural noise/grain, authentic depth of field\n✓ Real-world lighting with natural color temperature variations\n✓ Authentic human expressions and body language (NO stiff poses, NO artificial smiles)\n✓ Natural skin texture with pores, imperfections, and realistic color\n✓ Genuine shadows and highlights matching the environment\n✓ Realistic clothing wrinkles and fabric behavior\n\nPEOPLE COUNT & IDENTITY (ABSOLUTELY CRITICAL - MOST IMPORTANT RULE):\n- ONLY use people from the uploaded photos - DO NOT add any other people\n- Number of people in result MUST EXACTLY MATCH the number of uploaded photos (${e.length} people ONLY)\n- If ${e.length} photos uploaded = ${e.length} people in result (NO MORE, NO LESS)\n- DO NOT generate children, babies, or additional family members if they are not in the uploaded photos\n- ONLY the people whose photos were uploaded should appear in the final image\n- Keep EVERY person's face, features, skin tone, hair EXACTLY identical to their original photo\n- Preserve each person's unique characteristics: facial structure, expressions, eye color, etc.\n- No face morphing or blending - each person must be 100% recognizable\n\nBACKGROUND INTEGRATION:\n- Use the LOCATION from the background image as the setting\n- Match exact lighting direction, color temperature, and intensity from background\n- Align perspective and camera angle to match background\n- Create natural shadows from environment light sources\n- Ensure all people fit naturally into t...`;
        m.push({
          text: o
        });
        m.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: t
          }
        });
        e.forEach(e => {
          m.push({
            inlineData: {
              mimeType: e.mimeType,
              data: e.base64
            }
          });
        });
      } else {
        o = `CRITICAL: Create an EXTREMELY PHOTOREALISTIC family photo that looks 100% NATURAL and REAL, NOT AI-GENERATED.\n\nSCENE: ${c}\n\nULTRA-NATURAL REQUIREMENTS (MOST IMPORTANT):\n✓ Photo must look like it was taken by a REAL CAMERA with REAL PEOPLE at a REAL LOCATION\n✓ NO AI-generated appearance - must be indistinguishable from authentic photography\n✓ Natural camera characteristics: slight motion blur on moving elements, authentic grain/noise, realistic depth of field\n✓ Real-world lighting with natural variations (NOT perfect studio lighting)\n✓ Genuine human expressions and body language (NO stiff poses, NO forced smiles)\n✓ Natural skin texture showing pores, slight blemishes, realistic skin tone variations\n✓ Authentic shadows, reflections, and light interaction with surfaces\n✓ Realistic clothing with natural wrinkles, textures, and how fabric actually drapes\n\nPEOPLE COUNT & IDENTITY (ABSOLUTELY CRITICAL - MOST IMPORTANT RULE):\n- ONLY use people from the uploaded photos - DO NOT add any other people\n- Number of people in result MUST EXACTLY MATCH the number of uploaded photos (${e.length} people ONLY)\n- If ${e.length} photos uploaded = ${e.length} people in result (NO MORE, NO LESS)\n- DO NOT generate children, babies, or additional family members if they are not in the uploaded photos\n- ONLY the people whose photos were uploaded should appear in the final image\n- Keep EVERY person's face, features, skin tone, hair, body type EXACTLY identical to their original photo\n- Preserve each person's unique characteristics completely\n- Each person must be 100% recognizable as themselves\n- NO face morphing, blending, or alterations\n\nCOMPOSITION & POSING:\n- Natural family grouping appropriate to the scene\n- Authentic interaction between family members (hugs, hands on shoulders, natural proximity)\n- Varied poses - not everyone staring at camera (some looking at each other, environment)\n- Realistic hand placement and natural gestures\n- Proper spat...`;
        m.push({
          text: o
        });
        e.forEach(e => {
          m.push({
            inlineData: {
              mimeType: e.mimeType,
              data: e.base64
            }
          });
        });
      }
      const u = {
        contents: [{
          parts: m
        }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: y
          }
        }
      };
      try {
        const e = [];
        for (let t = 0; t < 6; t++) {
          e.push(A("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=" + window.getGeminiApiKey(), u));
        }
        (await Promise.all(e)).forEach((e, t) => {
          const a = e?.candidates?.[0]?.content?.parts?.find(e => e.inlineData)?.inlineData?.data;
          if (a) {
            const e = `data:image/png;base64,${a}`;
            b.push({
              url: e,
              filename: `family_photo_${t + 1}.png`,
              index: t
            });
            const n = document.createElement("div");
            n.className = "image-card group relative";
            n.style.animationDelay = t * 0.1 + "s";
            n.dataset.index = t;
            n.innerHTML = `\n                                <img src="${e}" alt="Generated family photo ${t + 1}" class="generated-image w-full rounded-lg"/>\n                                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-4 gap-2">\n                                    <div class="flex gap-2">\n                                        <button data-action="family-preview" data-index="${t}" class="action-btn flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1">\n                                            <i class="fas fa-eye"></i>\n                                            <span class="hidden sm:inline">Preview</span>\n                                        </button>\n                                        <button data-action="family-edit" data-index="${t}" class="action-btn flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1">\n                                            <i class="fas fa-edit"></i>\n                                            <span class="hidden sm:inline">Edit</span>\n                                        </button>\n                                    </div>\n                                    <div class="flex gap-2">\n                                        <button data-action="family-regenerate" data-index="${t}" class="action-btn flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1">\n                                            <i class="fas fa-sync-alt"></i>\n                                            <span class="hidden sm:inline">Regenerate</span>\n                                        </button>\n           ...`;
            r.appendChild(n);
          }
        });
        if (r.children.length > 0) {
          r.style.display = "grid";
          if (d) {
            d.classList.remove("hidden");
          }
        } else {
          x("Maaf, tidak ada gambar yang dapat dihasilkan. Silakan coba lagi.");
        }
      } catch (e) {
        console.error("Error generating images:", e);
        x(`Terjadi kesalahan: ${e.message}. Silakan coba lagi.`);
      } finally {
        s.style.display = "none";
      }
    });
  }
  if (c) {
    c.addEventListener("click", async () => {
      for (let e = 0; e < b.length; e++) {
        const t = b[e];
        if (window.downloadDataURINew) {
          await window.downloadDataURINew(t.url, t.filename);
          await new Promise(e => setTimeout(e, 200));
        } else if (window.downloadImage) {
          await window.downloadImage(t.url, t.filename);
          await new Promise(e => setTimeout(e, 200));
        }
      }
    });
    if (window.addMobileTouchSupport) {
      window.addMobileTouchSupport(c);
    }
  }
  if (r) {
    r.addEventListener("click", async e => {
      e.stopPropagation();
      const t = e.target.closest(".action-btn[data-action]");
      if (!t) {
        return;
      }
      const a = t.dataset.action;
      const n = parseInt(t.dataset.index, 10);
      const i = b[n];
      if (a === "family-preview") {
        if (window.showPreviewModal) {
          window.showPreviewModal(i.url);
        }
      } else if (a === "family-edit") {
        (function (e) {
          const t = document.createElement("div");
          t.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4";
          t.innerHTML = `\n                <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">\n                    <h3 class="text-xl font-bold mb-4" style="color: #0d9488;">Edit Tema</h3>\n                    <textarea id="edit-theme-input" rows="4" class="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-none" placeholder="Tulis tema baru...">${w}</textarea>\n                    <div class="flex gap-3 mt-4">\n                        <button id="confirm-edit-btn" class="flex-1 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition" style="background: linear-gradient(135deg, #14b8a6, #0d9488);">\n                            <i class="fas fa-check mr-2"></i>Regenerate\n                        </button>\n                        <button id="cancel-edit-btn" class="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold text-gray-700 transition">\n                            Batal\n                        </button>\n                    </div>\n                </div>\n            `;
          document.body.appendChild(t);
          document.getElementById("confirm-edit-btn").addEventListener("click", async () => {
            const a = document.getElementById("edit-theme-input").value.trim();
            if (a) {
              w = a;
              document.body.removeChild(t);
              await S(e);
            }
          });
          document.getElementById("cancel-edit-btn").addEventListener("click", () => {
            document.body.removeChild(t);
          });
        })(n);
      } else if (a === "family-regenerate") {
        await S(n);
      } else if (a === "family-download") {
        if (window.downloadDataURINew) {
          await window.downloadDataURINew(i.url, i.filename);
        } else if (window.downloadImage) {
          await window.downloadImage(i.url, i.filename);
        }
      }
    });
  }
  T();
})();