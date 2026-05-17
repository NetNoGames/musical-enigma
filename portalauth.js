// portal-auth.js - Modern Web Firebase Auth Engine (Google + Password Standard)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Sourced directly from your verified credentials
const firebaseConfig = {
  apiKey: "AIzaSyBoM6X--8Hhl9imrtYtgNeyomHLwk1RO6w",
  authDomain: "netno-games-d8580.firebaseapp.com",
  projectId: "netno-games-d8580",
  storageBucket: "netno-games-d8580.firebasestorage.app",
  messagingSenderId: "571332011408",
  appId: "1:571332011408:web:b40acafe4f258e4183bf15"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// UI Elements Visibility Mapping
window.openLoginPanel = function() {
  document.getElementById("loginOverlay").style.display = "flex";
  document.getElementById("downloadBtn").style.display = "none";
  document.getElementById("portalBtn").style.display = "none";
  document.getElementById("sidebar").style.left = "-220px";
};

window.closeLoginPanel = function() {
  document.getElementById("loginOverlay").style.display = "none";
  if (!auth.currentUser) {
    document.getElementById("downloadBtn").style.display = "block";
    document.getElementById("portalBtn").style.display = "block";
  }
};

// Form toggles (Sign In vs Create Account views)
window.toggleAuthView = function(view) {
  const emailForm = document.getElementById("emailFormView");
  const userSetup = document.getElementById("usernameSetupView");
  const formTitle = document.getElementById("authBoxTitle");
  const submitBtn = document.getElementById("emailSubmitBtn");
  const toggleText = document.getElementById("toggleAuthText");

  document.getElementById("loginError").style.display = "none";

  if (view === 'register') {
    formTitle.innerText = "Create Account";
    submitBtn.innerText = "Register & Continue";
    toggleText.innerHTML = "Already have an account? <span onclick='toggleAuthView(\"login\")'>Login</span>";
    emailForm.dataset.mode = "register";
  } else if (view === 'username_setup') {
    emailForm.style.display = "none";
    document.getElementById("googleAuthBtn").style.display = "none";
    document.getElementById("authSeparator").style.display = "none";
    userSetup.style.display = "block";
    formTitle.innerText = "Set Username";
  } else {
    formTitle.innerText = "Developer Terminal";
    submitBtn.innerText = "Verify Access";
    toggleText.innerHTML = "New Developer? <span onclick='toggleAuthView(\"register\")'>Create Account</span>";
    emailForm.style.display = "block";
    document.getElementById("googleAuthBtn").style.display = "block";
    document.getElementById("authSeparator").style.display = "block";
    userSetup.style.display = "none";
    emailForm.dataset.mode = "login";
  }
};

// Handle Email/Password Actions (Login or Registration)
window.handleEmailAuth = function(event) {
  event.preventDefault();
  const email = document.getElementById("authEmail").value;
  const password = document.getElementById("authPassword").value;
  const alertText = document.getElementById("loginError");
  const mode = document.getElementById("emailFormView").dataset.mode || "login";

  alertText.style.display = "none";

  if (mode === "register") {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Automatically redirects to username setup via auth state observer
      })
      .catch(err => {
        alertText.style.display = "block";
        alertText.innerText = "Registration Error: " + err.message;
      });
  } else {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Success handler processed by onAuthStateChanged
      })
      .catch(err => {
        alertText.style.display = "block";
        alertText.innerText = "Access Denied: Invalid credentials.";
      });
  }
};

// Google Single Sign-On Option Trigger
window.handleGoogleAuth = function() {
  const alertText = document.getElementById("loginError");
  alertText.style.display = "none";

  signInWithPopup(auth, googleProvider)
    .then((result) => {
      // If a brand new Google user handles login, require profile tracking updates
      if (!result.user.displayName) {
        toggleAuthView('username_setup');
      }
    })
    .catch(err => {
      alertText.style.display = "block";
      alertText.innerText = "Google Authentication Failed.";
    });
};

// Profile Username Submission Handler
window.handleUsernameSubmission = function(event) {
  event.preventDefault();
  const username = document.getElementById("profileUsername").value;
  const alertText = document.getElementById("loginError");

  if (auth.currentUser) {
    updateProfile(auth.currentUser, { displayName: username })
      .then(() => {
        alertText.style.display = "none";
        completePostAuthRedirection();
      })
      .catch(err => {
        alertText.style.display = "block";
        alertText.innerText = "Error updating database entry.";
      });
  }
};

function completePostAuthRedirection() {
  window.closeLoginPanel();
  // Safe validation fallback connection directly to your main script pipeline
  if (typeof openPanel === "function") {
    openPanel('developerportal.png', false);
  }
}

// Persistent Auth Observer Channel
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (!user.displayName) {
      toggleAuthView('username_setup');
    } else {
      // User is verified and profile username is initialized
      if (document.getElementById("loginOverlay").style.display === "flex") {
        completePostAuthRedirection();
      }
    }
  } else {
    // Session state clean placeholder reset logs
    console.log("No authenticated terminal credentials matched.");
  }
});
