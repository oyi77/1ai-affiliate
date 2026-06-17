(function () {
  const e = document.getElementById("chat-container");
  const t = document.getElementById("chat-input");
  const a = document.getElementById("send-chat-btn");
  if (!e || !t || !a) {
    return;
  }
  let n = [];
  async function i(i) {
    if (!window.checkApiKey()) {
      return;
    }
    if (!i.trim()) {
      return;
    }
    const r = i.trim();
    o(r, "user");
    n.push({
      role: "user",
      text: r
    });
    t.value = "";
    t.disabled = true;
    a.disabled = true;
    a.innerHTML = "<i class=\"fas fa-spinner fa-spin\"></i>";
    const l = function () {
      const t = document.createElement("div");
      const a = "thinking-" + Date.now();
      t.id = a;
      t.className = "chat-message assistant-message mb-4";
      t.innerHTML = "\n                <div class=\"flex items-start gap-3\">\n                    <div class=\"w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg\">\n                        <i class=\"fas fa-robot text-white\"></i>\n                    </div>\n                    <div class=\"bg-white rounded-2xl rounded-tl-none p-4 shadow-md border border-gray-100\">\n                        <div class=\"flex gap-2\">\n                            <div class=\"w-2 h-2 bg-purple-500 rounded-full animate-bounce\" style=\"animation-delay: 0s\"></div>\n                            <div class=\"w-2 h-2 bg-purple-500 rounded-full animate-bounce\" style=\"animation-delay: 0.2s\"></div>\n                            <div class=\"w-2 h-2 bg-purple-500 rounded-full animate-bounce\" style=\"animation-delay: 0.4s\"></div>\n                        </div>\n                    </div>\n                </div>\n            ";
      e.appendChild(t);
      e.scrollTop = e.scrollHeight;
      return a;
    }();
    try {
      const e = await async function (e) {
        const t = n.slice(-10).map(e => ({
          role: e.role,
          parts: [{
            text: e.text
          }]
        }));
        if (t.length === 0) {
          t.push({
            role: "user",
            parts: [{
              text: "Kamu adalah AI Assistant yang ramah dan helpful untuk \"1affiliate\" by 1affiliate.\n\nKamu adalah chatbot tanya jawab umum yang siap membantu user dengan berbagai pertanyaan dan topik. Kamu bisa:\n\n• Menjawab pertanyaan umum tentang berbagai topik\n• Memberikan penjelasan & informasi\n• Membantu brainstorming ide kreatif\n• Memberikan saran & tips\n• Mengobrol dengan ramah dan informatif\n\nGaya komunikasi:\n- Ramah, santai, dan mudah dipahami\n- Gunakan Bahasa Indonesia yang natural\n- Berikan jawaban yang jelas dan ringkas\n- Gunakan emoji secukupnya untuk membuat percakapan lebih hidup\n- Jika tidak tahu jawabannya, jujur saja dan tawarkan alternatif\n\nJawab pertanyaan user dengan helpful dan informatif!"
            }]
          });
          t.push({
            role: "model",
            parts: [{
              text: "Baik, saya siap membantu Anda dengan aplikasi 1affiliate!"
            }]
          });
        }
        t.push({
          role: "user",
          parts: [{
            text: e
          }]
        });
        const a = {
          contents: t,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        };
        const i = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=" + window.getGeminiApiKey(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(a)
        });
        if (!i.ok) {
          throw new Error(`HTTP Error: ${i.status}`);
        }
        const o = await i.json();
        if (o.candidates && o.candidates.length > 0) {
          return o.candidates[0].content.parts[0].text;
        }
        throw new Error("Tidak ada respon dari AI");
      }(r);
      s(l);
      o(e, "assistant");
      n.push({
        role: "model",
        text: e
      });
    } catch (e) {
      console.error("Error sending message:", e);
      s(l);
      o("⚠️ Maaf, terjadi kesalahan. Silakan coba lagi.", "assistant");
    } finally {
      t.disabled = false;
      a.disabled = false;
      a.innerHTML = "<i class=\"fas fa-paper-plane\"></i><span class=\"hidden sm:inline\">Kirim</span>";
      t.focus();
    }
  }
  function o(t, a) {
    const n = document.createElement("div");
    n.className = `chat-message ${a}-message mb-4`;
    if (a === "user") {
      n.innerHTML = `\n                    <div class="flex items-start gap-3 justify-end">\n                        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl rounded-tr-none p-4 shadow-md max-w-[80%]">\n                            <p class="text-white leading-relaxed">${function (e) {
        const t = document.createElement("div");
        t.textContent = e;
        return t.innerHTML;
      }(t)}</p>\n                        </div>\n                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-lg">\n                            <i class=\"fas fa-user text-white\"></i>\n                        </div>\n                    </div>\n                `;
    } else {
      let e = t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n- /g, "<br>• ").replace(/\n\d+\. /g, "<br>$&").replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>");
      n.innerHTML = `\n                    <div class="flex items-start gap-3\">\n                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">\n                            <i class=\"fas fa-robot text-white\"></i>\n                        </div>\n                        <div class="flex-1 bg-white rounded-2xl rounded-tl-none p-4 shadow-md border border-gray-100 max-w-[80%]\">\n                            <p class="text-gray-800 leading-relaxed">${e}</p>\n                        </div>\n                    </div>\n                `;
    }
    e.appendChild(n);
    e.scrollTop = e.scrollHeight;
  }
  function s(e) {
    const t = document.getElementById(e);
    if (t) {
      t.remove();
    }
  }
  a.addEventListener("click", () => {
    i(t.value);
  });
  t.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      i(t.value);
    }
  });
})();