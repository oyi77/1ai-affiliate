const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzPixa15u3SyndcKTcusIpxChqepUsgGfxTm1_nIaD1RHo-3TpLRbkHmesm-p2QkgWjEA/exec";

function generateToken() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

function prosesLogin() {
    const e = document.getElementById("emailInput").value.trim(),
        n = document.getElementById("loadingMsg"),
        t = document.getElementById("errorMsg"),
        a = document.querySelector(".login-btn");
    if (!e) return void(t.innerText = "⚠️ Email wajib diisi!");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return void(t.innerText = "⚠️ Format email tidak valid!");
    n.style.display = "block", t.innerText = "", a.disabled = !0, a.innerHTML = '<i class="fas fa-spinner fa-spin"></i> MEMVERIFIKASI...';
    const o = generateToken();
    fetch(SCRIPT_URL + "?action=login&email=" + encodeURIComponent(e) + "&token=" + encodeURIComponent(o)).then(e => e.json()).then(i => {
        n.style.display = "none", a.disabled = !1, a.innerHTML = '<i class="fas fa-sign-in-alt"></i> MASUK APLIKASI', "SUKSES" === i.status ? (localStorage.setItem("1affiliate_email", e), localStorage.setItem("1affiliate_token", o), localStorage.setItem("1affiliate_name", i.nama || "User"), bukaAplikasi(i.nama || "User")) : t.innerText = "❌ " + (i.message || "Email tidak terdaftar. Pastikan sudah membeli 1affiliate.")
    }).catch(e => {
        n.style.display = "none", a.disabled = !1, a.innerHTML = '<i class="fas fa-sign-in-alt"></i> MASUK APLIKASI', t.innerText = "❌ Gagal koneksi ke server. Periksa koneksi internet Anda.", console.error("Login error:", e)
    })
}

function bukaAplikasi(e) {
    document.getElementById("login-overlay").style.display = "none", document.getElementById("main-app").classList.add("unlocked"), document.getElementById("userInfoBadge").classList.add("active"), document.getElementById("userNameDisplay").innerText = e, setInterval(jagaSesi, 1e4)
}

function jagaSesi() {
    const e = localStorage.getItem("1affiliate_email"),
        n = localStorage.getItem("1affiliate_token");
    e && n && fetch(SCRIPT_URL + "?action=cek&email=" + encodeURIComponent(e) + "&token=" + encodeURIComponent(n)).then(e => e.json()).then(e => {
        "INVALID" === e.status && (alert("⚠️ SESI BERAKHIR!\n\nAkun Anda sedang digunakan di perangkat lain.\nAnda akan dikembalikan ke halaman login."), logout())
    }).catch(e => {
        console.log("Session check skipped due to connection issue")
    })
}

function logout() {
    localStorage.removeItem("1affiliate_email"), localStorage.removeItem("1affiliate_token"), localStorage.removeItem("1affiliate_name"), location.reload()
}
window.addEventListener("load", function() {
    const e = localStorage.getItem("1affiliate_email"),
        n = localStorage.getItem("1affiliate_token"),
        t = localStorage.getItem("1affiliate_name");
    e && n && t && (document.getElementById("loadingMsg").style.display = "block", fetch(SCRIPT_URL + "?action=cek&email=" + encodeURIComponent(e) + "&token=" + encodeURIComponent(n)).then(e => e.json()).then(e => {
        document.getElementById("loadingMsg").style.display = "none", "VALID" === e.status ? bukaAplikasi(t) : (localStorage.clear(), document.getElementById("errorMsg").innerText = "⚠️ Sesi telah berakhir. Silakan login kembali.")
    }).catch(e => {
        document.getElementById("loadingMsg").style.display = "none", console.log("Auto-login verification failed, opening anyway"), bukaAplikasi(t)
    }))
}), document.addEventListener("DOMContentLoaded", function() {
    const e = document.getElementById("emailInput");
    e && e.addEventListener("keypress", function(e) {
        "Enter" === e.key && prosesLogin()
    })
})