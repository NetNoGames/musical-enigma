/* app.js - NetNo Games Common Script & Database Utilities */

// 1. Initial Default Database Mockups
const DEFAULT_GAMES = [];

const DEFAULT_REVIEWS = {};

// 2. Storage Setup Wrapper
window.db = {
  _cache: {
    games: [],
    users: {},
    reviews: {},
    support_queries: [],
    announcements: [],
    dev_profile: null
  },
  _ready: false,
  _readyPromise: null,
  _fsAvailable: false,

  // ─── Init ───

  init() {
    // Ensure localStorage defaults exist (fallback)
    if (!localStorage.getItem("netno_games")) localStorage.setItem("netno_games", "[]");
    if (!localStorage.getItem("netno_reviews")) localStorage.setItem("netno_reviews", "{}");
    if (!localStorage.getItem("netno_support_queries")) localStorage.setItem("netno_support_queries", "[]");
    if (!localStorage.getItem("netno_announcements")) localStorage.setItem("netno_announcements", "[]");
    if (!localStorage.getItem("netno_users")) localStorage.setItem("netno_users", "{}");
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

    // Seed cache from localStorage for instant reads
    this._cache.games = JSON.parse(localStorage.getItem("netno_games") || "[]");
    this._cache.users = JSON.parse(localStorage.getItem("netno_users") || "{}");
    this._cache.reviews = JSON.parse(localStorage.getItem("netno_reviews") || "{}");
    this._cache.support_queries = JSON.parse(localStorage.getItem("netno_support_queries") || "[]");
    this._cache.announcements = JSON.parse(localStorage.getItem("netno_announcements") || "[]");
    this._cache.dev_profile = JSON.parse(localStorage.getItem("netno_dev_profile") || "null");

    if (typeof firebase !== 'undefined' && firebase.firestore) {
      this._fsAvailable = true;
      this._readyPromise = this._loadFromFirestore().catch(err => {
        console.error('[DB] Firestore init failed:', err);
      }).finally(() => {
        this._ready = true;
      });
    } else {
      this._ready = true;
      this._readyPromise = Promise.resolve();
    }
  },

  async _loadFromFirestore() {
    const db = firebase.firestore();
    try { await db.enablePersistence(); } catch (_) {}

    const [gamesSnap, usersSnap, queriesSnap, announcementsSnap, devSnap] = await Promise.all([
      db.collection('games').get(),
      db.collection('users').get(),
      db.collection('support_queries').get(),
      db.collection('announcements').get(),
      db.collection('dev_profile').doc('data').get()
    ]);

    // Games
    const games = [];
    gamesSnap.forEach(doc => games.push({ id: doc.id, ...doc.data() }));
    if (games.length) this._cache.games = games;

    // Users
    const users = {};
    usersSnap.forEach(doc => { users[doc.id] = doc.data(); });
    if (Object.keys(users).length) this._cache.users = users;

    // Support queries
    const queries = [];
    queriesSnap.forEach(doc => queries.push({ id: doc.id, ...doc.data() }));
    if (queries.length) this._cache.support_queries = queries;

    // Announcements
    const anns = [];
    announcementsSnap.forEach(doc => anns.push({ id: doc.id, ...doc.data() }));
    if (anns.length) this._cache.announcements = anns;

    // Dev profile
    if (devSnap.exists) this._cache.dev_profile = devSnap.data();

    // Reviews
    const reviewsSnap = await db.collection('reviews').get();
    if (!reviewsSnap.empty) {
      const reviews = {};
      reviewsSnap.forEach(doc => {
        const d = doc.data();
        if (!reviews[d.gameId]) reviews[d.gameId] = [];
        reviews[d.gameId].push(d);
      });
      this._cache.reviews = reviews;
    }

    // Load admin config from Firestore (overrides hardcoded defaults)
    await this._loadAdminConfig(db);

    // If Firestore was empty but localStorage had data, migrate it up
    if (!games.length && this._cache.games.length) await this._migrateToFirestore(db);
    else if (!Object.keys(users).length && Object.keys(this._cache.users).length) await this._migrateToFirestore(db);

    // Keep localStorage in sync for offline/fast next load
    this._syncToLocal();
  },

  async _migrateToFirestore(db) {
    try {
      const batch = db.batch();
      this._cache.games.forEach(g => {
        const { id, ...data } = g;
        batch.set(db.collection('games').doc(id || "game_" + Date.now()), data);
      });
      Object.entries(this._cache.users).forEach(([email, data]) => {
        batch.set(db.collection('users').doc(email), data);
      });
      this._cache.support_queries.forEach(q => {
        const { id, ...data } = q;
        batch.set(db.collection('support_queries').doc(id), data);
      });
      this._cache.announcements.forEach(a => {
        const { id, ...data } = a;
        batch.set(db.collection('announcements').doc(id), data);
      });
      if (this._cache.dev_profile) {
        batch.set(db.collection('dev_profile').doc('data'), this._cache.dev_profile);
      }
      Object.entries(this._cache.reviews).forEach(([gameId, items]) => {
        items.forEach(r => {
          batch.set(db.collection('reviews').doc(), { ...r, gameId });
        });
      });
      await batch.commit();
    } catch (err) {
      console.error('[DB] Migration to Firestore failed:', err);
    }
  },

  async _loadAdminConfig(db) {
    try {
      const snap = await db.collection('admin_config').doc('settings').get();
      if (snap.exists) {
        const data = snap.data();
        if (data.owner) OWNER_EMAIL = data.owner;
        if (Array.isArray(data.whitelist) && data.whitelist.length) ADMIN_WHITELIST = [...data.whitelist];
      }
    } catch (err) {
      console.warn('[DB] Could not load admin config from Firestore:', err);
    }
  },

  isAdminConfigured() {
    return OWNER_EMAIL !== "" && ADMIN_WHITELIST.length > 0;
  },

  getAdminConfig() {
    return { owner: OWNER_EMAIL, whitelist: [...ADMIN_WHITELIST] };
  },

  async saveAdminConfig(config) {
    if (!this._fsAvailable) return false;
    try {
      await firebase.firestore().collection('admin_config').doc('settings').set(config);
      if (config.owner) OWNER_EMAIL = config.owner;
      if (Array.isArray(config.whitelist)) ADMIN_WHITELIST = [...config.whitelist];
      return true;
    } catch (err) {
      console.error('[DB] Failed to save admin config:', err);
      return false;
    }
  },

  _syncToLocal() {
    localStorage.setItem("netno_games", JSON.stringify(this._cache.games));
    localStorage.setItem("netno_users", JSON.stringify(this._cache.users));
    localStorage.setItem("netno_reviews", JSON.stringify(this._cache.reviews));
    localStorage.setItem("netno_support_queries", JSON.stringify(this._cache.support_queries));
    localStorage.setItem("netno_announcements", JSON.stringify(this._cache.announcements));
    localStorage.setItem("netno_dev_profile", JSON.stringify(this._cache.dev_profile));
  },

  // ─── Firestore async helpers (fire-and-forget with error log) ───

  _fsWrite(col, id, data) {
    if (!this._fsAvailable) return Promise.resolve();
    return firebase.firestore().collection(col).doc(id).set(data, { merge: true })
      .catch(err => console.error(`[DB] Firestore write ${col}/${id}:`, err));
  },
  _fsDelete(col, id) {
    if (!this._fsAvailable) return Promise.resolve();
    return firebase.firestore().collection(col).doc(id).delete()
      .catch(err => console.error(`[DB] Firestore delete ${col}/${id}:`, err));
  },

  // ─── Getters (synchronous from cache) ───

  getGames() { return this._cache.games; },
  getGame(id) { return this._cache.games.find(g => g.id === id); },
  getSupportQueries() { return this._cache.support_queries; },
  getAnnouncements() { return this._cache.announcements; },
  getReviews(gameId) { return this._cache.reviews[gameId] || []; },
  getDevProfile() { return this._cache.dev_profile; },
  getUsers() { return this._cache.users; },
  getUser(email) { return this._cache.users[email.toLowerCase()] || null; },
  getUserTickets(userEmail) {
    const u = this.getUser(userEmail);
    return u && u.tickets ? u.tickets : [];
  },
  isInWishlist(userEmail, gameId) {
    const u = this.getUser(userEmail);
    return u && u.wishlist && u.wishlist.includes(gameId);
  },
  hasPurchased(userEmail, gameId) {
    const u = this.getUser(userEmail);
    return u && u.purchases && u.purchases.includes(gameId);
  },

  // ─── Mutators (update cache + Firestore) ───

  saveGame(gameData) {
    const games = this._cache.games;
    const idx = games.findIndex(g => g.id === gameData.id);
    if (idx > -1) {
      games[idx] = { ...games[idx], ...gameData };
    } else {
      games.push({ views: 0, downloads: 0, createdDate: new Date().toISOString().split('T')[0], ...gameData });
    }
    this._syncToLocal();
    this._fsWrite('games', gameData.id, gameData);
    return true;
  },

  deleteGame(id) {
    this._cache.games = this._cache.games.filter(g => g.id !== id);
    this._syncToLocal();
    this._fsDelete('games', id);
    return true;
  },

  saveSupportQuery(query) {
    const q = { id: "query_" + Date.now(), date: new Date().toLocaleString(), ...query };
    this._cache.support_queries.push(q);
    this._syncToLocal();
    this._fsWrite('support_queries', q.id, q);
    return true;
  },

  saveAnnouncement(data) {
    const anns = this._cache.announcements;
    const idx = anns.findIndex(a => a.id === data.id);
    if (idx > -1) {
      anns[idx] = { ...anns[idx], ...data };
      this._syncToLocal();
      this._fsWrite('announcements', data.id, data);
    } else {
      const a = { id: "announce_" + Date.now(), createdDate: new Date().toISOString().split('T')[0], ...data };
      anns.push(a);
      this._syncToLocal();
      this._fsWrite('announcements', a.id, a);
    }
    return true;
  },

  deleteAnnouncement(id) {
    this._cache.announcements = this._cache.announcements.filter(a => a.id !== id);
    this._syncToLocal();
    this._fsDelete('announcements', id);
    return true;
  },

  saveReview(gameId, review) {
    if (!this._cache.reviews[gameId]) this._cache.reviews[gameId] = [];
    const r = { date: new Date().toISOString().split('T')[0], ...review, gameId };
    this._cache.reviews[gameId].push(r);
    this._syncToLocal();
    this._fsWrite('reviews', "rev_" + Date.now(), r);
    return true;
  },

  saveDevProfile(profile) {
    this._cache.dev_profile = profile;
    this._syncToLocal();
    this._fsWrite('dev_profile', 'data', profile);
    return true;
  },

  saveUser(userData) {
    const key = userData.email.toLowerCase();
    this._cache.users[key] = { ...this._cache.users[key], ...userData, email: key };
    this._syncToLocal();
    this._fsWrite('users', key, this._cache.users[key]);
    return true;
  },

  addToWishlist(userEmail, gameId) {
    const u = this.getUser(userEmail);
    if (!u) return false;
    if (!u.wishlist) u.wishlist = [];
    if (!u.wishlist.includes(gameId)) { u.wishlist.push(gameId); this.saveUser(u); }
    return true;
  },

  removeFromWishlist(userEmail, gameId) {
    const u = this.getUser(userEmail);
    if (!u || !u.wishlist) return false;
    u.wishlist = u.wishlist.filter(id => id !== gameId);
    this.saveUser(u);
    return true;
  },

  recordDownload(userEmail, gameId) {
    const u = this.getUser(userEmail);
    if (!u) return false;
    if (!u.downloads) u.downloads = [];
    if (!u.downloads.includes(gameId)) u.downloads.push(gameId);
    if (!u.purchases) u.purchases = [];
    if (!u.purchases.includes(gameId)) u.purchases.push(gameId);
    this.saveUser(u);
    return true;
  },

  purchaseGame(userEmail, gameId, price) {
    const u = this.getUser(userEmail);
    if (!u) return false;
    if (!u.purchases) u.purchases = [];
    if (!u.purchases.includes(gameId)) u.purchases.push(gameId);
    this.saveUser(u);
    return true;
  },

  addUserTicket(userEmail, ticket) {
    const u = this.getUser(userEmail);
    if (!u) return false;
    if (!u.tickets) u.tickets = [];
    u.tickets.push({ id: "ticket_" + Date.now(), date: new Date().toLocaleString(), ...ticket });
    this.saveUser(u);
    return true;
  },

  setUserAdmin(userEmail, isAdmin) {
    const u = this.getUser(userEmail);
    if (!u) return false;
    u.isAdmin = isAdmin;
    this.saveUser(u);
    const idx = ADMIN_WHITELIST.findIndex(e => e.toLowerCase() === userEmail.toLowerCase());
    if (isAdmin && idx === -1) ADMIN_WHITELIST.push(userEmail);
    else if (!isAdmin && idx > -1) ADMIN_WHITELIST.splice(idx, 1);
    // Persist whitelist change to Firestore
    this.saveAdminConfig({ owner: OWNER_EMAIL, whitelist: ADMIN_WHITELIST });
    return true;
  }
};

// 3. Firebase Configuration & Auth Helpers
const firebaseConfig = {
  apiKey: "AIzaSyBoM6X--8Hhl9imrtYtgNeyomHLwk1RO6w",
  authDomain: "netno-games-d8580.firebaseapp.com",
  databaseURL: "https://netno-games-d8580-default-rtdb.firebaseio.com/",
  projectId: "netno-games-d8580",
  storageBucket: "netno-games-d8580.firebasestorage.app",
  messagingSenderId: "571332011408",
  appId: "1:571332011408:web:b40acafe4f258e4183bf15"
};

// Initialize Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Admin config — loaded exclusively from Firestore admin_config/settings
let OWNER_EMAIL = "";
let ADMIN_WHITELIST = [];

window.auth = {
  _user: null,
  _listeners: [],

  // Initialize auth state listener
  init() {
    if (typeof firebase === 'undefined') {
      console.warn("Firebase SDK not loaded.");
      return;
    }
    firebase.auth().onAuthStateChanged((user) => {
      this._user = user;
      if (user) {
        const email = user.email.toLowerCase();
        const isAdmin = this._checkIsAdmin(email);
        sessionStorage.setItem("netno_user_session", "true");
        sessionStorage.setItem("netno_user_email", email);
        sessionStorage.setItem("netno_user_name", user.displayName || "");
        sessionStorage.setItem("netno_user_photo", user.photoURL || "");
        sessionStorage.setItem("netno_user_admin", isAdmin ? "true" : "false");
        // Create/update user record in DB
        const existing = window.db.getUser(email);
        window.db.saveUser({
          email: email,
          displayName: user.displayName || email.split('@')[0],
          photoURL: user.photoURL || "",
          isAdmin: isAdmin || (existing && existing.isAdmin) ? true : false,
          joinDate: existing ? existing.joinDate : new Date().toISOString().split('T')[0],
          wishlist: existing ? existing.wishlist || [] : [],
          purchases: existing ? existing.purchases || [] : [],
          downloads: existing ? existing.downloads || [] : [],
          tickets: existing ? existing.tickets || [] : []
        });
      } else {
        sessionStorage.removeItem("netno_user_session");
        sessionStorage.removeItem("netno_user_email");
        sessionStorage.removeItem("netno_user_name");
        sessionStorage.removeItem("netno_user_photo");
        sessionStorage.removeItem("netno_user_admin");
      }
      // Notify listeners
      this._listeners.forEach(fn => fn(user));
    });
  },

  // Subscribe to auth state changes
  onAuthChange(callback) {
    this._listeners.push(callback);
    if (this._user !== null) callback(this._user);
  },

  isLoggedIn() {
    return sessionStorage.getItem("netno_user_session") === "true";
  },

  // Private: check whitelist or DB admin flag
  _checkIsAdmin(email) {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();
    if (ADMIN_WHITELIST.some(e => e.toLowerCase() === lowerEmail)) return true;
    const user = window.db.getUser(email);
    return user && user.isAdmin === true;
  },

  // Check if current user is an admin
  isAdmin() {
    if (this._user && this._checkIsAdmin(this._user.email)) return true;
    return this.getUserAdmin();
  },

  getUser() {
    return this._user;
  },

  getUserEmail() {
    return sessionStorage.getItem("netno_user_email") || "";
  },

  getUserName() {
    return sessionStorage.getItem("netno_user_name") || "";
  },

  getUserPhoto() {
    return sessionStorage.getItem("netno_user_photo") || "";
  },

  getUserAdmin() {
    return sessionStorage.getItem("netno_user_admin") === "true";
  },

  // Sign in with Google popup
  async loginWithGoogle() {
    if (typeof firebase === 'undefined') {
      throw new Error("Firebase SDK not loaded. Check your internet connection.");
    }
    if (!firebase.apps.length) {
      throw new Error("Firebase not initialized. Check firebaseConfig.");
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    try {
      const result = await firebase.auth().signInWithPopup(provider);
      console.log("[Firebase] Popup sign-in successful:", result.user.email);
      return result.user;
    } catch (err) {
      console.error("[Firebase] signInWithPopup failed:", err.code, err.message);
      if (err.code === "auth/popup-blocked") {
        console.log("[Firebase] Popup blocked, falling back to redirect...");
        await firebase.auth().signInWithRedirect(provider);
        return null;
      }
      throw err;
    }
  },

  // Sign out
  async logout() {
    if (typeof firebase !== 'undefined') {
      await firebase.auth().signOut();
    }
    sessionStorage.removeItem("netno_user_session");
    sessionStorage.removeItem("netno_user_email");
    sessionStorage.removeItem("netno_user_name");
    sessionStorage.removeItem("netno_user_photo");
    sessionStorage.removeItem("netno_user_admin");
    window.location.href = "portal.html";
  }
};

// Initialize Firebase auth listener
window.auth.init();

// Initialize DB on page script load
window.db.init();

// ─── Imgur Image Upload ───
// Get your free Client-ID at https://api.imgur.com/oauth2/addclient
// (Select "OAuth 2 without a callback URL", name it anything)
const IMGUR_CLIENT_ID = "YOUR_IMGUR_CLIENT_ID";

// Upload a file to Imgur, returns the direct image URL
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

// 4. Toast Notification System
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

// Mobile menu toggle
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

// Copy to clipboard helper
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

// 6. Common Layout Injector (Navbar & Footer)
document.addEventListener("DOMContentLoaded", () => {
  // Inject Header
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
                <a href="portal.html" class="btn-glow-primary bg-primary-color text-blue-800 font-display font-semibold text-[11px] uppercase tracking-wider px-4 py-2 inline-block">
                  ${isAdmin ? 'Dashboard' : 'My Library'}
                </a>
                <button onclick="window.auth.logout()" class="w-9 h-9 flex items-center justify-center border border-outline-variant/20 hover:border-red-500/40 text-on-surface-variant hover:text-red-400 transition-all duration-200" title="Sign out">
                  <span class="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ` : `
              <a href="portal.html" class="hidden md:inline-block btn-glow-primary bg-primary-color text-blue-800 font-display font-semibold text-[11px] uppercase tracking-wider px-4 py-2 inline-block">
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
      <div id="mobile-menu" class="md:hidden hidden fixed inset-0 z-40 flex flex-col items-center justify-center px-margin-mobile" style="background: transparent;">
        <div class="flex flex-col items-center gap-2 w-full max-w-xs">
          <a class="w-full text-center font-body text-xl font-medium py-4 px-6 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-200 ${currentPage === 'index.html' ? 'text-primary-color bg-white/5' : ''}" href="index.html" onclick="toggleMobileMenu()">Home</a>
          <a class="w-full text-center font-body text-xl font-medium py-4 px-6 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-200 ${currentPage.startsWith('games.html') || currentPage.startsWith('game-detail.html') ? 'text-primary-color bg-white/5' : ''}" href="games.html" onclick="toggleMobileMenu()">Game Library</a>
          <a class="w-full text-center font-body text-xl font-medium py-4 px-6 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-200 ${currentPage === 'community.html' ? 'text-primary-color bg-white/5' : ''}" href="community.html" onclick="toggleMobileMenu()">About Us</a>
          <a class="w-full text-center font-body text-xl font-medium py-4 px-6 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-200 ${currentPage === 'support.html' ? 'text-primary-color bg-white/5' : ''}" href="support.html" onclick="toggleMobileMenu()">Support</a>
          <div class="w-full mt-6 pt-6 border-t border-white/10 flex flex-col items-center gap-2">
            ${loggedIn ? `
              <div class="flex items-center gap-3 mb-2">
                <span class="w-10 h-10 rounded-full bg-primary-color/20 flex items-center justify-center text-primary-color font-display font-bold text-sm">${(window.auth.getUserName() || window.auth.getUserEmail())[0].toUpperCase()}</span>
                <div class="flex flex-col">
                  <span class="font-body text-sm text-on-surface font-medium">${window.auth.getUserName() || 'User'}</span>
                  <span class="font-body text-xs text-on-surface-variant/60">${window.auth.getUserEmail()}</span>
                </div>
              </div>
              <a href="portal.html" class="w-full text-center font-body text-base font-semibold py-4 px-6 rounded-xl bg-primary-color text-blue-800 hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2" onclick="toggleMobileMenu()">
                <span class="material-symbols-outlined text-[20px]">${isAdmin ? 'dashboard' : 'library_books'}</span> ${isAdmin ? 'Dashboard' : 'My Library'}
              </a>
              <button onclick="window.auth.logout()" class="w-full text-center font-body text-base font-medium py-4 px-6 rounded-xl text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[20px]">logout</span> Sign Out
              </button>
            ` : `
              <a href="portal.html" class="w-full text-center font-body text-base font-semibold py-4 px-6 rounded-xl bg-primary-color text-blue-800 hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2" onclick="toggleMobileMenu()">
                <span class="material-symbols-outlined text-[20px]">login</span> Login
              </a>
            `}
          </div>
        </div>
      </div>
    `;
    
    // Close mobile menu on link click (backup for any elements without onclick)
    document.querySelectorAll('#mobile-menu a, #mobile-menu button:not([onclick])').forEach(el => {
      el.addEventListener('click', () => window.toggleMobileMenu());
    });
  }

  // Inject Footer
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
