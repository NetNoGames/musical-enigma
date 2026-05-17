import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// FIREBASE INITIALIZATION CONFIG
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
const provider = new GoogleAuthProvider();

// Google Account Select Prompt Config (Isse saari Google IDs screen par aa jayengi)
provider.setCustomParameters({
  prompt: 'select_account'
});

// --- GLOBAL ATTACHMENTS FOR OVERLAYS ---

window.openLoginPanel = function() {
  document.getElementById("loginOverlay").style.display = "flex";
  document.getElementById("downloadBtn").style.display = "none";
  document.getElementById("portalBtn").style.display = "none";
  document.getElementById("sidebar").style.left = "-220px";
  resetAuthViews();
};

window.closeLoginPanel = function() {
  document.getElementById("loginOverlay").style.display = "none";
  document.getElementById("downloadBtn").style.display = "block";
  document.getElementById("portalBtn").style.display = "block";
};

function resetAuthViews() {
  document.getElementById("authForm").style.display = "block";
  document.getElementById("googleAuthBtn").style.display = "block";
  document.getElementById("usernameSection").style.display = "none";
  document.getElementById("loginError").innerText = "";
}

// --- METHOD 1: GOOGLE SIGN-IN SYSTEM ---
window.handleGoogleAuth = async function() {
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check authentication flow metadata state
    if (!user.displayName) {
      // Naya user hai - UI forms switch karein username config ke liye
      document.getElementById("authForm").style.display = "none";
      document.getElementById("googleAuthBtn").style.display = "none";
      document.getElementById("usernameSection").style.display = "block";
    } else {
      // Purana verified user hai, direct entry trigger karein
      loginSuccess();
    }
  } catch (error) {
    errorDiv.innerText = "Google Setup Failed: " + error.message;
  }
};

// Save custom username parameters
window.saveUsername = async function() {
  const usernameInput = document.getElementById("usernameInput").value.trim();
  const errorDiv = document.getElementById("loginError");
  
  if (!usernameInput) {
    errorDiv.innerText = "Please configuration a unique identity tag.";
    return;
  }
  
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: usernameInput
      });
      loginSuccess();
    }
  } catch (error) {
    errorDiv.innerText = "Profile Sync Error: " + error.message;
  }
};

// --- METHOD 2: DIRECT EMAIL & PASSWORD VERIFICATION ---
document.getElementById("authForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";

  try {
    // Phase 1: Try Logging In directly
    await signInWithEmailAndPassword(auth, email, password);
    loginSuccess();
  } catch (loginError) {
    // Firebase Code Validation for existing bad password credentials
    if (loginError.code === "auth/wrong-password" || loginError.code === "auth/invalid-credential") {
      errorDiv.innerText = "Account already exists! Please input correct protection key.";
    } else {
      // Phase 2: User doesn't exist, execute instant registration
      try {
        const registrationResult = await createUserWithEmailAndPassword(auth, email, password);
        // Switch interfaces to acquire Display Profile Metadata configuration
        document.getElementById("authForm").style.display = "none";
        document.getElementById("googleAuthBtn").style.display = "none";
        document.getElementById("usernameSection").style.display = "block";
      } catch (regError) {
        errorDiv.innerText = "Access Matrix Error: " + regError.message;
      }
    }
  }
});

function loginSuccess() {
  document.getElementById("loginOverlay").style.display = "none";
  if (typeof window.openPanel === "function") {
    window.openPanel('developerportal.png', false);
  }
}
