/* app.js - NetNo Games Common Script & Database Utilities */

// 1. Initial Default Database Mockups
const DEFAULT_GAMES = [];

const DEFAULT_REVIEWS = {};

// 2. Storage Setup Wrapper
window.db = {
  // Initialize Database
  init() {
    if (!localStorage.getItem("netno_games")) {
      localStorage.setItem("netno_games", JSON.stringify(DEFAULT_GAMES));
    }
    if (!localStorage.getItem("netno_reviews")) {
      localStorage.setItem("netno_reviews", JSON.stringify(DEFAULT_REVIEWS));
    }
    if (!localStorage.getItem("netno_support_queries")) {
      localStorage.setItem("netno_support_queries", JSON.stringify([]));
    }
    if (!localStorage.getItem("netno_announcements")) {
      localStorage.setItem("netno_announcements", JSON.stringify([]));
    }
    if (!localStorage.getItem("netno_users")) {
      localStorage.setItem("netno_users", JSON.stringify({}));
    }
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

  // Game Handlers
  getGames() {
    this.init();
    return JSON.parse(localStorage.getItem("netno_games"));
  },
  
  getGame(id) {
    const games = this.getGames();
    return games.find(g => g.id === id);
  },

  saveGame(gameData) {
    const games = this.getGames();
    const index = games.findIndex(g => g.id === gameData.id);
    
    if (index > -1) {
      games[index] = { ...games[index], ...gameData };
    } else {
      games.push({
        views: 0,
        downloads: 0,
        createdDate: new Date().toISOString().split('T')[0],
        ...gameData
      });
    }
    
    localStorage.setItem("netno_games", JSON.stringify(games));
    return true;
  },

  deleteGame(id) {
    let games = this.getGames();
    games = games.filter(g => g.id !== id);
    localStorage.setItem("netno_games", JSON.stringify(games));
    return true;
  },

  // Support Request Handlers
  getSupportQueries() {
    this.init();
    return JSON.parse(localStorage.getItem("netno_support_queries"));
  },

  saveSupportQuery(query) {
    const queries = this.getSupportQueries();
    queries.push({
      id: "query_" + Date.now(),
      date: new Date().toLocaleString(),
      ...query
    });
    localStorage.setItem("netno_support_queries", JSON.stringify(queries));
    return true;
  },

  // Announcement Handlers
  getAnnouncements() {
    this.init();
    return JSON.parse(localStorage.getItem("netno_announcements"));
  },

  saveAnnouncement(data) {
    const announcements = this.getAnnouncements();
    const index = announcements.findIndex(a => a.id === data.id);
    if (index > -1) {
      announcements[index] = { ...announcements[index], ...data };
    } else {
      announcements.push({
        id: "announce_" + Date.now(),
        createdDate: new Date().toISOString().split('T')[0],
        ...data
      });
    }
    localStorage.setItem("netno_announcements", JSON.stringify(announcements));
    return true;
  },

  deleteAnnouncement(id) {
    let announcements = this.getAnnouncements();
    announcements = announcements.filter(a => a.id !== id);
    localStorage.setItem("netno_announcements", JSON.stringify(announcements));
    return true;
  },

  // Reviews Handlers
  getReviews(gameId) {
    this.init();
    const allReviews = JSON.parse(localStorage.getItem("netno_reviews"));
    return allReviews[gameId] || [];
  },

  saveReview(gameId, review) {
    this.init();
    const allReviews = JSON.parse(localStorage.getItem("netno_reviews"));
    if (!allReviews[gameId]) allReviews[gameId] = [];
    allReviews[gameId].push({
      date: new Date().toISOString().split('T')[0],
      ...review
    });
    localStorage.setItem("netno_reviews", JSON.stringify(allReviews));
    return true;
  },

  // Developer Profile Handlers
  getDevProfile() {
    this.init();
    return JSON.parse(localStorage.getItem("netno_dev_profile"));
  },

  saveDevProfile(profile) {
    localStorage.setItem("netno_dev_profile", JSON.stringify(profile));
    return true;
  },

  // User Handlers
  getUsers() {
    this.init();
    return JSON.parse(localStorage.getItem("netno_users"));
  },

  saveUser(userData) {
    const users = this.getUsers();
    users[userData.email] = {
      ...users[userData.email],
      ...userData,
      email: userData.email
    };
    localStorage.setItem("netno_users", JSON.stringify(users));
    return true;
  },

  getUser(email) {
    const users = this.getUsers();
    return users[email] || null;
  },

  addToWishlist(userEmail, gameId) {
    const user = this.getUser(userEmail);
    if (!user) return false;
    if (!user.wishlist) user.wishlist = [];
    if (!user.wishlist.includes(gameId)) {
      user.wishlist.push(gameId);
      this.saveUser(user);
    }
    return true;
  },

  removeFromWishlist(userEmail, gameId) {
    const user = this.getUser(userEmail);
    if (!user || !user.wishlist) return false;
    user.wishlist = user.wishlist.filter(id => id !== gameId);
    this.saveUser(user);
    return true;
  },

  isInWishlist(userEmail, gameId) {
    const user = this.getUser(userEmail);
    return user && user.wishlist && user.wishlist.includes(gameId);
  },

  recordDownload(userEmail, gameId) {
    const user = this.getUser(userEmail);
    if (!user) return false;
    if (!user.downloads) user.downloads = [];
    if (!user.downloads.includes(gameId)) {
      user.downloads.push(gameId);
    }
    if (!user.purchases) user.purchases = [];
    if (!user.purchases.includes(gameId)) {
      user.purchases.push(gameId);
    }
    this.saveUser(user);
    return true;
  },

  purchaseGame(userEmail, gameId, price) {
    const user = this.getUser(userEmail);
    if (!user) return false;
    if (!user.purchases) user.purchases = [];
    if (!user.purchases.includes(gameId)) {
      user.purchases.push(gameId);
    }
    this.saveUser(user);
    return true;
  },

  hasPurchased(userEmail, gameId) {
    const user = this.getUser(userEmail);
    return user && user.purchases && user.purchases.includes(gameId);
  },

  addUserTicket(userEmail, ticket) {
    const user = this.getUser(userEmail);
    if (!user) return false;
    if (!user.tickets) user.tickets = [];
    user.tickets.push({
      id: "ticket_" + Date.now(),
      date: new Date().toLocaleString(),
      ...ticket
    });
    this.saveUser(user);
    return true;
  },

  getUserTickets(userEmail) {
    const user = this.getUser(userEmail);
    return user && user.tickets ? user.tickets : [];
  },

  setUserAdmin(userEmail, isAdmin) {
    const user = this.getUser(userEmail);
    if (!user) return false;
    user.isAdmin = isAdmin;
    this.saveUser(user);
    // Update whitelist too
    const idx = ADMIN_WHITELIST.indexOf(userEmail);
    if (isAdmin && idx === -1) {
      ADMIN_WHITELIST.push(userEmail);
    } else if (!isAdmin && idx > -1) {
      ADMIN_WHITELIST.splice(idx, 1);
    }
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

// Owner email - cannot be removed from admin
const OWNER_EMAIL = "talwarkhushal285@gmail.com";

// Admin whitelist - these emails have admin dashboard access
const ADMIN_WHITELIST = [
  "blogger.defence.anylysis@gmail.com","kshitij.daksh13348@gmail.com","netnogames45@gmail.com","talwarkhushal285@gmail.com"
];

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
        const isAdmin = this._checkIsAdmin(user.email);
        sessionStorage.setItem("netno_user_session", "true");
        sessionStorage.setItem("netno_user_email", user.email);
        sessionStorage.setItem("netno_user_name", user.displayName || "");
        sessionStorage.setItem("netno_user_photo", user.photoURL || "");
        sessionStorage.setItem("netno_user_admin", isAdmin ? "true" : "false");
        // Create/update user record in DB
        const existing = window.db.getUser(user.email);
        window.db.saveUser({
          email: user.email,
          displayName: user.displayName || "",
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
    if (ADMIN_WHITELIST.includes(email)) return true;
    const user = window.db.getUser(email);
    return user && user.isAdmin === true;
  },

  // Check if current user is an admin
  isAdmin() {
    if (!this._user) return false;
    return this._checkIsAdmin(this._user.email);
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

// Initialize Firebase Storage
if (typeof firebase !== 'undefined' && firebase.storage) {
  window.storage = firebase.storage();
}

// Upload a file to Firebase Storage, returns { url, path }
window.uploadToStorage = async function(file, storagePath) {
  if (!window.storage) throw new Error("Firebase Storage not initialized.");
  const ref = window.storage.ref(storagePath);
  const snapshot = await ref.put(file);
  const url = await snapshot.ref.getDownloadURL();
  return { url, path: storagePath };
};

// Delete a file from Firebase Storage by path
window.deleteFromStorage = async function(storagePath) {
  if (!window.storage) return;
  try {
    await window.storage.ref(storagePath).delete();
  } catch (e) {
    if (e.code !== 'storage/object-not-found') {
      console.warn("Storage delete failed:", storagePath, e);
    }
  }
};

// Delete multiple files from Firebase Storage
window.deleteStoragePaths = async function(paths) {
  if (!paths || paths.length === 0) return;
  await Promise.allSettled(paths.map(p => window.deleteFromStorage(p)));
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
  const btn = document.getElementById('mobile-menu-btn');
  if (!menu || !btn) return;
  const icon = btn.querySelector('.material-symbols-outlined');
  const isOpen = !menu.classList.contains('hidden');
  menu.classList.toggle('hidden');
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
                <a href="portal.html" class="btn-glow-primary ${isAdmin ? 'bg-primary-color' : 'bg-secondary-color'} text-blue-800 font-display font-semibold text-[11px] uppercase tracking-wider px-4 py-2 inline-block">
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
        <div id="mobile-menu" class="md:hidden hidden border-t border-outline-variant/15" style="background-color: var(--surface-color);">
          <div class="px-margin-mobile py-4 flex flex-col gap-1">
            <a class="font-body text-base font-medium py-3 px-4 rounded transition-colors ${currentPage === 'index.html' ? 'text-primary-color bg-primary-color/5' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/20'}" href="index.html">Home</a>
            <a class="font-body text-base font-medium py-3 px-4 rounded transition-colors ${currentPage.startsWith('games.html') || currentPage.startsWith('game-detail.html') ? 'text-primary-color bg-primary-color/5' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/20'}" href="games.html">Game Library</a>
            <a class="font-body text-base font-medium py-3 px-4 rounded transition-colors ${currentPage === 'community.html' ? 'text-primary-color bg-primary-color/5' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/20'}" href="community.html">About Us</a>
            <a class="font-body text-sm font-medium py-3 px-4 rounded transition-colors ${currentPage === 'support.html' ? 'text-primary-color bg-primary-color/5' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/20'}" href="support.html">Support</a>
            <div class="border-t border-outline-variant/15 my-2 pt-3">
              ${loggedIn ? `
                <div class="px-4 py-2 flex items-center gap-3 mb-2">
                  <span class="w-8 h-8 rounded-full bg-primary-color/20 flex items-center justify-center text-primary-color font-display font-bold text-xs">${(window.auth.getUserName() || window.auth.getUserEmail())[0].toUpperCase()}</span>
                  <div class="flex flex-col">
                    <span class="font-body text-xs text-on-surface font-medium">${window.auth.getUserName() || 'User'}</span>
                    <span class="font-body text-[10px] text-on-surface-variant/60 truncate max-w-[180px]">${window.auth.getUserEmail()}</span>
                  </div>
                </div>
                <a href="portal.html" class="font-body text-sm font-medium py-3 px-4 rounded text-primary-color hover:bg-primary-color/10 transition-colors flex items-center gap-3">
                  <span class="material-symbols-outlined text-[18px]">${isAdmin ? 'dashboard' : 'library_books'}</span> ${isAdmin ? 'Dashboard' : 'My Library'}
                </a>
                <button onclick="window.auth.logout()" class="w-full text-left font-body text-sm font-medium py-3 px-4 rounded text-on-surface-variant hover:text-red-400 hover:bg-red-500/5 transition-colors flex items-center gap-3">
                  <span class="material-symbols-outlined text-[18px]">logout</span> Sign Out
                </button>
              ` : `
                <a href="portal.html" class="font-body text-sm font-medium py-3 px-4 rounded text-primary-color hover:bg-primary-color/10 transition-colors flex items-center gap-3">
                  <span class="material-symbols-outlined text-[18px]">login</span> Login
                </a>
              `}
            </div>
          </div>
        </div>
      </nav>
    `;
    
    // Close mobile menu on link click
    document.querySelectorAll('#mobile-menu a, #mobile-menu button').forEach(el => {
      el.addEventListener('click', () => {
        const menu = document.getElementById('mobile-menu');
        const btn = document.getElementById('mobile-menu-btn');
        if (menu && btn && !menu.classList.contains('hidden')) {
          menu.classList.add('hidden');
          const icon = btn.querySelector('.material-symbols-outlined');
          if (icon) icon.textContent = 'menu';
          document.body.style.overflow = '';
        }
      });
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
