/* ═══════════════════════════════════════════
   CORE.JS — PHP + MySQL Backend (XAMPP compatible)
═══════════════════════════════════════════ */

const API_BASE = 'api_index.php';

const api = {

    async get(endpoint) {
        const [path, query] = endpoint.split('?');
        const parts  = path.replace(/^\//, '').split('/');
        const table  = parts[0];
        const id     = parts[1] || '';

        let url = `${API_BASE}/${table}`;
        if (id) url += `/${id}`;
        if (query) url += `?${query}`;

        const res = await fetch(url);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'خطأ في الخادم');
        }
        return res.json();
    },

    async post(endpoint, body) {
        const table = endpoint.replace(/^\//, '').split('/')[0];
        const res = await fetch(`${API_BASE}/${table}`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'خطأ في الخادم');
        }
        return res.json();
    },

    async patch(endpoint, body) {
        const parts = endpoint.replace(/^\//, '').split('/');
        const table = parts[0];
        const id    = parts[1];
        const res = await fetch(`${API_BASE}/${table}/${id}`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(body)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'خطأ في الخادم');
        }
        return res.json();
    },

    async delete(endpoint) {
        const parts = endpoint.replace(/^\//, '').split('/');
        const table = parts[0];
        const id    = parts[1];
        const res = await fetch(`${API_BASE}/${table}/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'خطأ في الخادم');
        }
        return res.json();
    }
};

/* AUTH */
const auth = {
    get user() {
        const u = localStorage.getItem('lib_user');
        return u ? JSON.parse(u) : null;
    },
    login(user)    { localStorage.setItem('lib_user', JSON.stringify(user)); },
    logout()       { localStorage.removeItem('lib_user'); window.location.href = 'login.html'; },
    require()      { if (!this.user) { window.location.href = 'login.html'; return false; } return true; },
    requireAdmin() { if (!this.user || this.user.role !== 'admin') { window.location.href = 'index.html'; return false; } return true; }
};

/* TOAST */
function toast(msg, type = 'info') {
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    let c = document.getElementById('toastContainer');
    if (!c) { c = document.createElement('div'); c.id = 'toastContainer'; c.className = 'toast-container'; document.body.appendChild(c); }
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

/* DATE UTILS */
const dateUtil = {
    format(d) {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric' });
    },
    daysUntil(d) { return Math.ceil((new Date(d) - new Date()) / 86400000); },
    isOverdue(d) { return d && new Date(d) < new Date(); },
    addDays(n)   { const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString(); }
};

/* STATUS LABELS */
const statusLabel = {
    pending:  '<span class="status-badge status-pending">⏳ معلق</span>',
    active:   '<span class="status-badge status-active">📖 نشط</span>',
    returned: '<span class="status-badge status-returned">✅ مُرجع</span>',
    rejected: '<span class="status-badge status-rejected">❌ مرفوض</span>',
    waiting:  '<span class="status-badge status-waiting">🕐 انتظار</span>',
};

/* NAVBAR */
async function renderNavbar() {
    const user = auth.user;
    const navLinks   = document.getElementById('navLinks');
    const navActions = document.getElementById('navActions');
    if (!navLinks || !navActions) return;

    navLinks.innerHTML = user?.role === 'admin' ? `
        <li><a href="index.html">🏠 الرئيسية</a></li>
        <li><a href="books.html">📚 الكتب</a></li>
        <li><a href="borrow.html">📖 استعارة</a></li>
        <li><a href="rules.html">📜 القواعد</a></li>
        <li><a href="admin.html">⚙️ لوحة التحكم</a></li>` : `
        <li><a href="index.html">🏠 الرئيسية</a></li>
        <li><a href="books.html">📚 الكتب</a></li>
        <li><a href="borrow.html">📖 استعارة</a></li>
        <li><a href="rules.html">📜 القواعد</a></li>
        ${user ? '<li><a href="dashboard.html">📋 حسابي</a></li>' : ''}
        ${user ? '<li><a href="donate.html">🎁 أعر كتابك</a></li>' : ''}`;

    navLinks.querySelectorAll('a').forEach(a => {
        if (a.href.includes(location.pathname.split('/').pop())) a.classList.add('active');
    });

    if (user) {
        let notifCount = 0;
        try {
            const notifs = await api.get(`/notifications?user_id=${user.id}&is_read=0`);
            notifCount = notifs.length;
        } catch(e) {}

        navActions.innerHTML = `
            <div style="position:relative">
                <button class="btn-notif" id="notifBtn">🔔
                    ${notifCount > 0 ? `<span class="notif-badge">${notifCount}</span>` : ''}
                </button>
                <div class="notif-panel" id="notifPanel"></div>
            </div>
            <div class="user-menu">
                <button class="user-btn" id="userBtn">👤 ${user.name.split(' ')[0]} <span style="font-size:0.7rem">▼</span></button>
                <div class="user-dropdown" id="userDropdown">
                    ${user.role==='admin' ? `<a href="admin.html">⚙️ لوحة الأدمن</a>` : `<a href="dashboard.html">📋 حسابي</a>`}
                    <a href="profile.html">👤 الملف الشخصي</a>
                    <button class="logout-btn" onclick="auth.logout()">🚪 تسجيل الخروج</button>
                </div>
            </div>`;

        document.getElementById('userBtn').addEventListener('click', e => {
            e.stopPropagation();
            document.getElementById('userDropdown').classList.toggle('open');
        });

        document.getElementById('notifBtn').addEventListener('click', async e => {
            e.stopPropagation();
            const panel = document.getElementById('notifPanel');
            panel.classList.toggle('open');
            if (panel.classList.contains('open')) await loadNotifPanel(user.id);
        });

        document.addEventListener('click', () => {
            document.getElementById('userDropdown')?.classList.remove('open');
            document.getElementById('notifPanel')?.classList.remove('open');
        });
    } else {
        navActions.innerHTML = `
            <a href="login.html" class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,0.3)">تسجيل الدخول</a>
            <a href="register.html" class="btn btn-accent">إنشاء حساب</a>`;
    }
}

async function loadNotifPanel(userId) {
    const panel = document.getElementById('notifPanel');
    panel.innerHTML = `<div class="notif-header">🔔 الإشعارات
        <button onclick="markAllRead(${userId})" style="font-size:0.75rem;background:none;border:none;color:var(--primary);cursor:pointer;font-weight:700">قراءة الكل</button>
    </div>`;
    try {
        const notifs = await api.get(`/notifications?user_id=${userId}&_sort=created_at&_order=desc&_limit=10`);
        if (!notifs.length) {
            panel.innerHTML += `<div style="padding:2rem;text-align:center;color:var(--muted);font-size:0.85rem">لا توجد إشعارات</div>`;
            return;
        }
        notifs.forEach(n => {
            panel.innerHTML += `
                <div class="notif-item ${!n.is_read ? 'unread' : ''}">
                    ${!n.is_read ? '<div class="notif-dot"></div>' : '<div style="width:8px"></div>'}
                    <div><div class="notif-text">${n.message}</div><div class="notif-time">${dateUtil.format(n.created_at)}</div></div>
                </div>`;
        });
    } catch(e) {}
}

async function markAllRead(userId) {
    const notifs = await api.get(`/notifications?user_id=${userId}&is_read=0`);
    for (const n of notifs) await api.patch(`/notifications/${n.id}`, { is_read: 1 });
    document.getElementById('notifPanel')?.classList.remove('open');
    renderNavbar();
    toast('تم تعليم كل الإشعارات كمقروءة', 'success');
}

async function sendNotification(userId, type, message) {
    await api.post('/notifications', {
        user_id: userId, type, message,
        is_read: 0, created_at: new Date().toISOString()
    });
}

/* HELPERS */
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});

let _catMap = null;
async function getCategoryMap() {
    if (_catMap) return _catMap;
    const cats = await api.get('/categories');
    _catMap = {};
    cats.forEach(c => { _catMap[c.id] = c; });
    return _catMap;
}

function confirmAction(msg, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = `
        <div class="modal" style="max-width:360px">
            <div class="modal-header"><div class="modal-title">⚠️ تأكيد</div></div>
            <div class="modal-body"><p style="font-size:0.95rem">${msg}</p></div>
            <div class="modal-footer">
                <button class="btn btn-outline cancel-btn">إلغاء</button>
                <button class="btn btn-danger confirm-btn">تأكيد</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.cancel-btn').onclick = () => overlay.remove();
    overlay.querySelector('.confirm-btn').onclick = () => { overlay.remove(); onConfirm(); };
}

document.addEventListener('DOMContentLoaded', renderNavbar);
