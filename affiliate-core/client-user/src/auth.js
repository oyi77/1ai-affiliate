// Patched Auth for Backend API
const API_URL = import.meta.env.PROD ? 'https://1affiliate-backend.fly.dev/api/auth' : '/api/auth';

// Attach functions to window for legacy compatibility
window.generateToken = function () {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
};

window.prosesLogin = function () {
    const email = document.getElementById("emailInput").value.trim(),
        loadingMsg = document.getElementById("loadingMsg"),
        errorMsg = document.getElementById("errorMsg"),
        loginBtn = document.querySelector(".login-btn");

    if (!email) return void (errorMsg.innerText = "⚠️ Email wajib diisi!");
    // Basic password prompt for now since legacy UI only has email input (?)
    // Actually legacy UI might have password input in component?
    // Let's assume for now we use a default password or prompt.
    // The legacy code doesn't show password input in `prosesLogin`.
    // It sends `email` and `token` (generated).

    // We should show a custom modal instead of prompt.
    window.showPasswordModal("Masukkan Password:", (password) => {
        if (!password) {
            errorMsg.innerText = "⚠️ Password wajib diisi!";
            loadingMsg.style.display = "none", loginBtn.disabled = !1, loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> MASUK APLIKASI';
            return;
        }

        loadingMsg.style.display = "block", errorMsg.innerText = "", loginBtn.disabled = !0, loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> MEMVERIFIKASI...';

        fetch(API_URL + "/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        }).then(res => res.json()).then(i => {
            loadingMsg.style.display = "none", loginBtn.disabled = !1, loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> MASUK APLIKASI';
            if (i.token) {
                localStorage.setItem("1affiliate_email", email);
                localStorage.setItem("1affiliate_token", i.token); // Store Backend JWT as token
                localStorage.setItem("1affiliate_name", i.user.role || "User");
                window.bukaAplikasi(i.user.role || "User");
            } else {
                errorMsg.innerText = "❌ " + (i.error || "Login gagal.");
            }
        }).catch(e => {
            loadingMsg.style.display = "none", loginBtn.disabled = !1, loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> MASUK APLIKASI', errorMsg.innerText = "❌ Gagal koneksi ke server.", console.error("Login error:", e)
        });
    });
};

window.bukaAplikasi = function (e) {
    const overlay = document.getElementById("login-overlay");
    if (overlay) overlay.style.display = "none";

    document.getElementById("main-app").classList.add("unlocked");
    const badge = document.getElementById("userInfoBadge");
    if (badge) badge.classList.add("active");

    const nameDisplay = document.getElementById("userNameDisplay");
    if (nameDisplay) nameDisplay.innerText = e;

    setInterval(window.jagaSesi, 10000);
};

window.jagaSesi = function () {
    // We don't really need to ping continuously if we rely on API 401s, 
    // but to keep legacy behavior of "kicked out", we can ping /me
    const token = localStorage.getItem("1affiliate_token");
    if (!token) return;

    fetch(API_URL + "/me", {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
        if (res.status === 401) {
            window.showToast("⚠️ SESI BERAKHIR! Akun Anda sedang digunakan di perangkat lain.");
            setTimeout(() => window.logout(), 3000);
        }
    }).catch(console.error);
};

window.logout = function () {
    localStorage.removeItem("1affiliate_email");
    localStorage.removeItem("1affiliate_token");
    localStorage.removeItem("1affiliate_name");
    location.reload();
};

window.addEventListener("load", function () {
    const token = localStorage.getItem("1affiliate_token");
    const name = localStorage.getItem("1affiliate_name");

    if (token) {
        // Verify token
        fetch(API_URL + "/me", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.ok) {
                window.bukaAplikasi(name || "User");
            } else {
                localStorage.clear();
            }
        }).catch(err => {
            // offline? assume logged in if token exists? or fail safe
            console.log("Offline or error", err);
            // Logic to show offline mode?
            window.bukaAplikasi(name || "User");
        });
    }
});

// Original legacy event listeners
// We can leave them or move them here if they were in the original file.
// The original file had DOMContentLoaded listeners.


// Register Logic
window.prosesRegister = function () {
    const email = document.getElementById("emailInput").value.trim();
    const loadingMsg = document.getElementById("loadingMsg");
    const errorMsg = document.getElementById("errorMsg");

    if (!email) return void (errorMsg.innerText = "⚠️ Email wajib diisi!");

    window.showPasswordModal("Buat Password Baru:", (password) => {
        if (!password) {
            errorMsg.innerText = "⚠️ Password wajib diisi untuk pendaftaran!";
            loadingMsg.style.display = "none";
            return;
        }

        loadingMsg.style.display = "block";
        errorMsg.innerText = "";

        fetch(API_URL + "/register", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        }).then(res => res.json()).then(data => {
            loadingMsg.style.display = "none";
            if (data.payment) {
                window.showGlobalQRIS(data.payment.qr_url, data.payment.amount, data.payment.reference);
            } else {
                errorMsg.innerText = "❌ " + (data.error || "Register gagal.");
            }
        }).catch(err => {
            loadingMsg.style.display = "none";
            errorMsg.innerText = "❌ Gagal koneksi ke server.";
            console.error("Register error:", err);
        });
    });
};

window.showGlobalQRIS = function (url, amount, ref) {
    const modalId = 'qris-modal';
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;justify-content:center;align-items:center;";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:white;padding:20px;border-radius:10px;text-align:center;max-width:90%;">
            <h3 style="margin-top:0;">Scan QRIS untuk Membayar</h3>
            <p>Total: Rp ${parseInt(amount).toLocaleString('id-ID')}</p>
            <img src="${url}" style="max-width:300px;width:100%;margin:10px 0;">
            <p style="font-size:0.8em;color:gray;">Ref: ${ref}</p>
            <p>Setelah bayar, silakan Login kembali.</p>
            <button onclick="document.getElementById('${modalId}').remove()" style="background:#dc2626;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;">Tutup</button>
        </div>
    `;
};
window.showPasswordModal = function (title, callback) {
    const modalId = 'password-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'custom-modal-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="custom-modal-content">
            <div class="custom-modal-header">
                <i class="fas fa-shield-alt modal-icon"></i>
                <h3>${title}</h3>
            </div>
            <div class="custom-modal-body">
                <input type="password" id="modalPasswordInput" class="modal-input" placeholder="••••••••">
            </div>
            <div class="custom-modal-footer">
                <button id="modalCancelBtn" class="modal-btn cancel">Batal</button>
                <button id="modalConfirmBtn" class="modal-btn confirm">Lanjutkan</button>
            </div>
        </div>
    `;

    const input = modal.querySelector('#modalPasswordInput');
    const cancelBtn = modal.querySelector('#modalCancelBtn');
    const confirmBtn = modal.querySelector('#modalConfirmBtn');

    const handleConfirm = () => {
        const val = input.value;
        modal.remove();
        callback(val);
    };

    const handleCancel = () => {
        modal.remove();
        callback(null);
    };

    confirmBtn.onclick = handleConfirm;
    cancelBtn.onclick = handleCancel;
    input.onkeypress = (e) => { if (e.key === 'Enter') handleConfirm(); };

    setTimeout(() => input.focus(), 100);
};

window.showToast = function (message) {
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `<i class="fas fa-info-circle"></i> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

window.showConfirmModal = function (text, callback) {
    const modalId = 'confirm-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'custom-modal-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="custom-modal-content">
            <div class="custom-modal-header">
                <i class="fas fa-question-circle modal-icon" style="color:#f59e0b;"></i>
                <h3>Konfirmasi</h3>
            </div>
            <div class="custom-modal-body text-center">
                <p>${text}</p>
            </div>
            <div class="custom-modal-footer">
                <button id="confirmCancelBtn" class="modal-btn cancel">Batal</button>
                <button id="confirmOkBtn" class="modal-btn confirm" style="background:#f59e0b;">Ya, Lanjutkan</button>
            </div>
        </div>
    `;

    modal.querySelector('#confirmCancelBtn').onclick = () => { modal.remove(); callback(false); };
    modal.querySelector('#confirmOkBtn').onclick = () => { modal.remove(); callback(true); };
};
