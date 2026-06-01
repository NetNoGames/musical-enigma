/* app.js - NetNo Games Common Script */

// Storage Wrapper (localStorage only)
window.db = {
  init() {
    if (!localStorage.getItem("netno_games")) localStorage.setItem("netno_games", "[]");
    if (!localStorage.getItem("netno_reviews")) localStorage.setItem("netno_reviews", "{}");
    if (!localStorage.getItem("netno_support_queries")) localStorage.setItem("netno_support_queries", "[]");
    if (!localStorage.getItem("netno_announcements")) localStorage.setItem("netno_announcements", "[]");
    if (!localStorage.getItem("netno_dev_profile")) {
      localStorage.setItem("netno_dev_profile", JSON.stringify({
        displayName: "NetNo Dev Studio",
        bio: "Designing atmospheric, high-concept interactive projects where organic elements blend with digital decay.",
        avatar: "https://www.w3schools.com/howto/img_avatar.png",
        socials: {
          youtube: "youtube.com/netnogames",
          reddit: "reddit.com/r/NetNoGamesCommunity",
          discord: "discord.gg/PTbxu9nPZq",
          twitter: "twitter.com/netnogames",
          website: "netnogames.com"
        }
      }));
    }
  },

  getGames() { return JSON.parse(localStorage.getItem("netno_games") || "[]"); },
  getGame(id) { return this.getGames().find(g => g.id === id); },
  getSupportQueries() { return JSON.parse(localStorage.getItem("netno_support_queries") || "[]"); },
  getAnnouncements() { return JSON.parse(localStorage.getItem("netno_announcements") || "[]"); },
  getReviews(gameId) {
    const all = JSON.parse(localStorage.getItem("netno_reviews") || "{}");
    return all[gameId] || [];
  },
  getDevProfile() { return JSON.parse(localStorage.getItem("netno_dev_profile") || "null"); },

  saveGame(gameData) {
    let games = this.getGames();
    const idx = games.findIndex(g => g.id === gameData.id);
    if (idx > -1) {
      games[idx] = { ...games[idx], ...gameData };
    } else {
      games.push({ views: 0, downloads: 0, createdDate: new Date().toISOString().split('T')[0], ...gameData });
    }
    localStorage.setItem("netno_games", JSON.stringify(games));
    return true;
  },

  deleteGame(id) {
    let games = this.getGames().filter(g => g.id !== id);
    localStorage.setItem("netno_games", JSON.stringify(games));
    return true;
  },

  saveSupportQuery(query) {
    const queries = this.getSupportQueries();
    queries.push({ id: "query_" + Date.now(), date: new Date().toLocaleString(), ...query });
    localStorage.setItem("netno_support_queries", JSON.stringify(queries));
    return true;
  },

  saveAnnouncement(data) {
    let anns = this.getAnnouncements();
    const idx = anns.findIndex(a => a.id === data.id);
    if (idx > -1) {
      anns[idx] = { ...anns[idx], ...data };
    } else {
      anns.push({ id: "announce_" + Date.now(), createdDate: new Date().toISOString().split('T')[0], ...data });
    }
    localStorage.setItem("netno_announcements", JSON.stringify(anns));
    return true;
  },

  deleteAnnouncement(id) {
    let anns = this.getAnnouncements().filter(a => a.id !== id);
    localStorage.setItem("netno_announcements", JSON.stringify(anns));
    return true;
  },

  saveReview(gameId, review) {
    const all = JSON.parse(localStorage.getItem("netno_reviews") || "{}");
    if (!all[gameId]) all[gameId] = [];
    all[gameId].push({ date: new Date().toISOString().split('T')[0], ...review, gameId });
    localStorage.setItem("netno_reviews", JSON.stringify(all));
    return true;
  },

  saveDevProfile(profile) {
    localStorage.setItem("netno_dev_profile", JSON.stringify(profile));
    return true;
  }
};

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBoM6X--8Hhl9imrtYtgNeyomHLwk1RO6w",
  authDomain: "netno-games-d8580.firebaseapp.com",
  databaseURL: "https://netno-games-d8580-default-rtdb.firebaseio.com/",
  projectId: "netno-games-d8580",
  storageBucket: "netno-games-d8580.firebasestorage.app",
  messagingSenderId: "571332011408",
  appId: "1:571332011408:web:b40acafe4f258e4183bf15"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Single admin email
const OWNER_EMAIL = "talwarkhushal825@gmail.com";

window.auth = {
  _user: null,
  _listeners: [],

  init() {
    if (typeof firebase === 'undefined') {
      console.warn("Firebase SDK not loaded.");
      return;
    }
    firebase.auth().onAuthStateChanged((user) => {
      this._user = user;
      if (user) {
        const email = user.email.toLowerCase();
        const isAdmin = email === OWNER_EMAIL.toLowerCase();
        const data = { email, name: user.displayName || email.split('@')[0], photo: user.photoURL || "", admin: isAdmin };
        const serialized = JSON.stringify(data);
        sessionStorage.setItem("netno_user_data", serialized);
        localStorage.setItem("netno_user_data", serialized);
      } else {
        sessionStorage.removeItem("netno_user_data");
        localStorage.removeItem("netno_user_data");
      }
      this._listeners.forEach(fn => fn(user));
    });
  },

  onAuthChange(callback) {
    this._listeners.push(callback);
    if (this._user !== null) callback(this._user);
  },

  isLoggedIn() {
    return !!this._getUserData();
  },

  isAdmin() {
    const d = this._getUserData();
    return d && d.admin === true;
  },

  _getUserData() {
    try {
      const raw = sessionStorage.getItem("netno_user_data") || localStorage.getItem("netno_user_data");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  getUser() { return this._user; },
  getUserEmail() { const d = this._getUserData(); return d ? d.email : ""; },
  getUserName() { const d = this._getUserData(); return d ? d.name : ""; },
  getUserPhoto() { const d = this._getUserData(); return d ? d.photo : ""; },
  getUserAdmin() { return this.isAdmin(); },

  async loginWithGoogle() {
    if (typeof firebase === 'undefined') throw new Error("Firebase SDK not loaded.");
    if (!firebase.apps.length) throw new Error("Firebase not initialized.");
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    try {
      const result = await firebase.auth().signInWithPopup(provider);
      return result.user;
    } catch (err) {
      if (err.code === "auth/popup-blocked") {
        await firebase.auth().signInWithRedirect(provider);
        return null;
      }
      throw err;
    }
  },

  async logout() {
    if (typeof firebase !== 'undefined') {
      await firebase.auth().signOut();
    }
    sessionStorage.removeItem("netno_user_data");
    localStorage.removeItem("netno_user_data");
    window.location.href = "portal.html";
  }
};

window.auth.init();
window.db.init();

// Imgur upload
const IMGUR_CLIENT_ID = "YOUR_IMGUR_CLIENT_ID";

window.uploadToImgur = async function(file) {
  if (IMGUR_CLIENT_ID === "YOUR_IMGUR_CLIENT_ID") {
    throw new Error("Imgur Client-ID not configured. Set IMGUR_CLIENT_ID in app.js");
  }
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: { Authorization: "Client-ID " + IMGUR_CLIENT_ID },
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error("Imgur upload failed: " + (err.data?.error || res.statusText));
  }
  const json = await res.json();
  return json.data.link;
};

// Toast system
window.toast = function(message, type = 'info') {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm";
    document.body.appendChild(container);
  }
  const colors = {
    success: { bg: "bg-surface-high border-primary-container text-primary-color", icon: "check_circle" },
    error: { bg: "bg-surface-high border-error-container text-error-color", icon: "error" },
    info: { bg: "bg-surface-high border-outline text-secondary-color", icon: "info" },
    warning: { bg: "bg-surface-high border-outline text-amber-500", icon: "warning" }
  };
  const toastStyle = colors[type] || colors.info;
  const item = document.createElement("div");
  item.className = `flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl ${toastStyle.bg} fade-in`;
  item.innerHTML = `
    <span class="material-symbols-outlined text-[20px]">${toastStyle.icon}</span>
    <span class="font-label-sm text-sm uppercase tracking-wide font-medium">${message}</span>
  `;
  container.appendChild(item);
  setTimeout(() => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(10px)';
    item.style.transition = 'all 0.3s ease';
    setTimeout(() => item.remove(), 300);
  }, 4000);
};

// Mobile menu
window.toggleMobileMenu = function() {
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-overlay');
  const btn = document.getElementById('mobile-menu-btn');
  if (!menu || !btn) return;
  const icon = btn.querySelector('.material-symbols-outlined');
  const isOpen = !menu.classList.contains('hidden');
  menu.classList.toggle('hidden');
  if (overlay) overlay.classList.toggle('hidden');
  icon.textContent = isOpen ? 'menu' : 'close';
  document.body.style.overflow = isOpen ? '' : 'hidden';
};

// Copy to clipboard
window.copyToClipboard = function(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined text-[14px]">check</span> Copied!';
    btn.classList.add('ring-2', 'ring-primary-color/50');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('ring-2', 'ring-primary-color/50');
    }, 1500);
    window.toast('Copied to clipboard!', 'success');
  }).catch(() => {
    window.toast('Failed to copy', 'error');
  });
};

// Common Layout Injector (Navbar & Footer)
document.addEventListener("DOMContentLoaded", () => {
  const headerPlaceholder = document.getElementById("global-header");
  if (headerPlaceholder) {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const loggedIn = window.auth.isLoggedIn();
    const isAdmin = window.auth.getUserAdmin();

    headerPlaceholder.innerHTML = `
      <nav class="w-full sticky top-0 z-50 backdrop-blur-md border-b border-outline-variant/15" style="background-color: var(--surface-color); opacity: 0.95;">
        <div class="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-screen-2xl mx-auto">
          <a href="index.html" class="font-display font-extrabold text-lg tracking-tight text-on-surface flex items-center gap-2">
            <img src="logo.webp" alt="NetNo Games" class="h-7 w-7 rounded object-cover"/>
            NETNO GAMES
          </a>
          <div class="hidden md:flex space-x-8 items-center">
            <a class="font-body text-sm font-medium ${currentPage === 'index.html' ? 'text-primary-color' : 'text-on-surface-variant hover:text-on-surface'} transition-colors duration-200" href="index.html">Home</a>
            <a class="font-body text-sm font-medium ${currentPage.startsWith('games.html') || currentPage.startsWith('game-detail.html') ? 'text-primary-color' : 'text-on-surface-variant hover:text-on-surface'} transition-colors duration-200" href="games.html">Game Library</a>
            <a class="font-body text-sm font-medium ${currentPage === 'community.html' ? 'text-primary-color' : 'text-on-surface-variant hover:text-on-surface'} transition-colors duration-200" href="community.html">About Us</a>
            <a class="font-body text-[13px] font-medium ${currentPage === 'support.html' ? 'text-primary-color' : 'text-on-surface-variant hover:text-on-surface'} transition-colors duration-200" href="support.html">Support</a>
          </div>
          <div class="flex items-center gap-2 md:gap-3">
            ${loggedIn ? `
              <div class="hidden md:flex items-center gap-2">
                <span class="text-[11px] font-body text-on-surface-variant truncate max-w-[120px]">${window.auth.getUserName() || window.auth.getUserEmail()}</span>
                <a href="portal.html" class="btn-glow-primary bg-primary-color text-white font-display font-semibold text-[11px] uppercase tracking-wider px-4 py-2 inline-block">
                  ${isAdmin ? 'Dashboard' : 'My Library'}
                </a>
                <button onclick="window.auth.logout()" class="w-9 h-9 flex items-center justify-center border border-outline-variant/20 hover:border-red-500/40 text-on-surface-variant hover:text-red-400 transition-all duration-200" title="Sign out">
                  <span class="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ` : `
              <a href="portal.html" class="hidden md:inline-block btn-glow-primary bg-primary-color text-white font-display font-semibold text-[11px] uppercase tracking-wider px-4 py-2 inline-block">
                Login
              </a>
            `}
            <button id="mobile-menu-btn" class="md:hidden w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-primary-color transition-colors" onclick="toggleMobileMenu()" aria-label="Toggle menu">
              <span class="material-symbols-outlined text-[22px]">menu</span>
            </button>
          </div>
        </div>
      </nav>
      <div id="mobile-overlay" class="md:hidden hidden fixed inset-0 z-40" style="background: #000;" onclick="toggleMobileMenu()"></div>
      <div id="mobile-menu" class="md:hidden hidden fixed inset-0 z-40 flex flex-col px-margin-mobile pt-6" style="background: #000;">
        <div class="flex items-center justify-between w-full mb-8">
          <span class="font-display text-sm font-extrabold text-white flex items-center gap-2">
            <img src="logo.webp" alt="NetNo Games" class="h-6 w-6 rounded object-cover"/>
            DEV
          </span>
          <button onclick="toggleMobileMenu()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors duration-200">
            <span class="material-symbols-outlined text-white text-[24px]">close</span>
          </button>
        </div>

        <h2 class="font-display text-4xl font-bold text-white mb-8 tracking-tight">Menu</h2>

        <div class="flex flex-col gap-1 w-full">
          <a class="w-full font-body text-[17px] font-medium py-3 text-on-surface-variant hover:text-white transition-colors duration-200 ${currentPage === 'index.html' ? 'text-primary-color' : ''}" href="index.html" onclick="toggleMobileMenu()">Home</a>
          <a class="w-full font-body text-[17px] font-medium py-3 text-on-surface-variant hover:text-white transition-colors duration-200 ${currentPage.startsWith('games.html') || currentPage.startsWith('game-detail.html') ? 'text-primary-color' : ''}" href="games.html" onclick="toggleMobileMenu()">Game Library</a>
          <a class="w-full font-body text-[17px] font-medium py-3 text-on-surface-variant hover:text-white transition-colors duration-200 ${currentPage === 'community.html' ? 'text-primary-color' : ''}" href="community.html" onclick="toggleMobileMenu()">About Us</a>
          <a class="w-full font-body text-[17px] font-medium py-3 text-on-surface-variant hover:text-white transition-colors duration-200 ${currentPage === 'support.html' ? 'text-primary-color' : ''}" href="support.html" onclick="toggleMobileMenu()">Support</a>
        </div>

        <div class="w-full mt-auto mb-8 pt-6 border-t border-white/10">
          ${loggedIn ? `
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="w-10 h-10 rounded-full bg-primary-color/20 flex items-center justify-center text-primary-color font-display font-bold text-sm">${(window.auth.getUserName() || window.auth.getUserEmail())[0].toUpperCase()}</span>
                <div class="flex flex-col">
                  <span class="font-body text-sm text-white font-medium">${window.auth.getUserName() || 'User'}</span>
                  <span class="font-body text-xs text-on-surface-variant/60">${window.auth.getUserEmail()}</span>
                </div>
              </div>
              <button onclick="window.auth.logout()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors duration-200">
                <span class="material-symbols-outlined text-on-surface-variant text-[20px]">logout</span>
              </button>
            </div>
            <a href="portal.html" class="w-full mt-4 font-body text-sm font-medium py-3 px-4 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors duration-200 flex items-center gap-2" onclick="toggleMobileMenu()">
              <span class="material-symbols-outlined text-[18px]">${isAdmin ? 'dashboard' : 'library_books'}</span> ${isAdmin ? 'Dashboard' : 'My Library'}
            </a>
          ` : `
            <a href="portal.html" class="w-full font-body text-sm font-medium py-3 px-4 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors duration-200 flex items-center gap-2" onclick="toggleMobileMenu()">
              <span class="material-symbols-outlined text-[18px]">login</span> Sign in
            </a>
          `}
        </div>
      </div>
    `;

    document.querySelectorAll('#mobile-menu a, #mobile-menu button:not([onclick])').forEach(el => {
      el.addEventListener('click', () => window.toggleMobileMenu());
    });
  }

  const footerPlaceholder = document.getElementById("global-footer");
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = `
      <footer class="w-full py-12 mt-16 border-t border-outline-variant/15" style="background-color: var(--surface-dim);">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 px-margin-mobile md:px-margin-desktop max-w-screen-2xl mx-auto">
          <div class="flex flex-col gap-3">
            <span class="font-display text-sm font-extrabold text-on-surface flex items-center gap-2">
              <img src="logo.webp" alt="NetNo Games" class="h-6 w-6 rounded object-cover"/>
              NETNO GAMES
            </span>
            <p class="font-body text-[11px] text-on-surface-variant/60">
              © 2026 NetNo Games. All rights reserved.
            </p>
            <hr class="border-t border-outline-variant/15 my-1"/>
            <p class="font-body text-[10px] text-on-surface-variant/40">
              Website design credits to <strong class="font-bold text-on-surface-variant/60">Kd_Plays</strong>
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <span class="font-display text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">Ecosystem</span>
            <a class="font-body text-xs text-on-surface-variant hover:text-primary-color transition-colors" href="https://discord.gg/PTbxu9nPZq" target="_blank">Discord Community</a>
            <a class="font-body text-xs text-on-surface-variant hover:text-primary-color transition-colors" href="https://www.reddit.com/r/NetNoGamesCommunity/" target="_blank">Subreddit</a>
            <a class="font-body text-xs text-on-surface-variant hover:text-primary-color transition-colors" href="https://youtube.com/@netnogames" target="_blank">YouTube Channel</a>
          </div>
          <div class="flex flex-col gap-2">
            <span class="font-display text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">Developer</span>
            <a class="font-body text-xs text-on-surface-variant hover:text-primary-color transition-colors" href="portal.html">Developer Portal</a>
            <a class="font-body text-xs text-on-surface-variant hover:text-primary-color transition-colors" href="support.html">Contact Support</a>
          </div>
        </div>
      </footer>
    `;
  }
});
