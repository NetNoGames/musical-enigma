import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

let registrationEmail = "";
let registrationPassword = "";
let isRegistrationProcess = false;

// Global Auth State Observer Matrix
onAuthStateChanged(auth, (user) => {
  if (user && !isRegistrationProcess) {
    // Agar user logged in hai aur uski profile complete hai (displayName runtime custom exist karti hai)
    if (user.displayName && user.displayName.trim() !== "" && !user.displayName.includes("@")) {
      applyUserUIData(user);
    } else {
      // Background verification checks logic context handler
      const checkedMarker = localStorage.getItem("netno_setup_done_" + user.email);
      if (checkedMarker) {
        applyUserUIData(user);
      }
    }
  } else if (!user) {
    resetGlobalSessionUI();
  }
});

window.openLoginPanel = function() {
  const user = auth.currentUser;
  // Dynamic validation flow control system rule
  if (user && user.displayName && !isRegistrationProcess && !user.displayName.includes("@")) {
    executeLoginSuccess();
    return;
  }
  document.getElementById("loginOverlay").style.display = "flex";
  restoreInitialAuthView();
};

window.closeLoginPanel = function() {
  document.getElementById("loginOverlay").style.display = "none";
};

function restoreInitialAuthView() {
  document.getElementById("authGateways").style.display = "block";
  document.getElementById("credentialsStep").style.display = "none";
  document.getElementById("avatarStep").style.display = "none";
  document.getElementById("loginError").innerText = "";
  document.getElementById("usernameInput").value = "";
  document.getElementById("setupPasswordInput").value = "";
  isRegistrationProcess = false;
}

// 1. PATHWAY A: DIRECT EMAIL/PASSWORD LOGIN ENGINE (Strictly Verified Profiles)
window.handleDirectLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";

  try {
    isRegistrationProcess = false;
    await signInWithEmailAndPassword(auth, email, password);
    executeLoginSuccess();
  } catch (err) {
    console.error("Direct Login Pipeline Failure Exception: ", err.code);
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
      errorDiv.innerText = "Incorrect account details or invalid password specified.";
    } else {
      errorDiv.innerText = "Error structural trace: " + err.message;
    }
  }
};

// 2. PATHWAY B: CONTINUE WITH GOOGLE GATEWAY (Intelligent Routing System)
window.handleGoogleAuth = async function() {
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    registrationEmail = user.email;

    // RULE TRACE CHECK: Kya is user ka account pehle se bana hua hai?
    const accountFinishedBefore = localStorage.getItem("netno_setup_done_" + user.email);
    
    if ((user.displayName && !user.displayName.includes("@") && user.displayName.trim() !== "") || accountFinishedBefore) {
      // Account exists! Bypass directly into operational layouts dashboard screens
      isRegistrationProcess = false;
      executeLoginSuccess();
    } else {
      // New Account! Open registration setup workflow steps sequence wizards
      isRegistrationProcess = true; 
      document.getElementById("authGateways").style.display = "none";
      document.getElementById("credentialsStep").style.display = "block";
    }
  } catch (error) {
    isRegistrationProcess = false;
    errorDiv.innerText = "Authentication Error Encountered: " + error.message;
  }
};

// 3. REGISTRATION STEP 1: CAPTURE USERNAME (MAX 15 CHR LIMIT) & PASSWORD SETUP
window.submitCredentialsStep = function() {
  const username = document.getElementById("usernameInput").value.trim();
  const chosenPassword = document.getElementById("setupPasswordInput").value;
  const errorDiv = document.getElementById("loginError");

  if (!username) {
    errorDiv.innerText = "Please specify a unique username.";
    return;
  }
  if (username.length > 15) {
    errorDiv.innerText = "Username is too long! Strict maximum limit is 15 characters.";
    return;
  }
  if (!chosenPassword || chosenPassword.length < 6) {
    errorDiv.innerText = "Please set a strong password (at least 6 characters long).";
    return;
  }

  registrationPassword = chosenPassword;
  errorDiv.innerText = "";
  
  document.getElementById("credentialsStep").style.display = "none";
  document.getElementById("avatarStep").style.display = "block";
};

// 4. REGISTRATION STEP 2: PROFILE PICTURE SELECTION & COMPLEX ACCOUNT CONFIGURATION
window.finalizeAccountRegistration = async function() {
  const username = document.getElementById("usernameInput").value.trim();
  const fileInput = document.getElementById("avatarFileInput");
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";

  try {
    let user = auth.currentUser;
    let finalBase64Url = "https://www.w3schools.com/howto/img_avatar.png";

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      finalBase64Url = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    if (user) {
      // Securely update standard custom metrics parameter nodes first
      await updateProfile(user, {
        displayName: username,
        photoURL: "https://www.w3schools.com/howto/img_avatar2.png" 
      });

      // Local storage layer mapping architecture optimization configuration
      try {
        localStorage.setItem("netno_user_avatar_" + registrationEmail, finalBase64Url);
        localStorage.setItem("netno_setup_done_" + registrationEmail, "true");
      } catch (storageErr) {
        console.warn("Storage allocations context mapped.");
      }

      // Link email/password credentials strictly so direct fields login handles successfully!
      try {
        const passwordCredential = EmailAuthProvider.credential(registrationEmail, registrationPassword);
        await linkWithCredential(user, passwordCredential);
      } catch (linkErr) {
        console.warn("Credential linkage already configured/provisioned: ", linkErr.message);
      }

      isRegistrationProcess = false; 
      executeLoginSuccess();
    }
  } catch (err) {
    errorDiv.innerText = "Registration Pipeline Error Encountered: " + err.message;
  }
};

function executeLoginSuccess() {
  document.getElementById("loginOverlay").style.display = "none";
  const user = auth.currentUser;
  if (user) {
    applyUserUIData(user);
    if (typeof window.openPanel === "function") {
      window.openPanel('developerportal.png', false);
    }
  }
}

function applyUserUIData(user) {
  const savedCacheAvatar = localStorage.getItem("netno_user_avatar_" + user.email);
  const finalAvatar = savedCacheAvatar || user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";
  
  // Update Profile metrics layout images elements data nodes
  const headerImg = document.getElementById("headerProfilePic");
  const sidebarImg = document.getElementById("userSidebarPic");
  const sidebarName = document.getElementById("userSidebarName");
  const headerProfileDiv = document.getElementById("userProfileHeader");

  if (headerImg) headerImg.src = finalAvatar;
  if (sidebarImg) sidebarImg.src = finalAvatar;
  if (sidebarName) sidebarName.innerText = user.displayName || "Developer";
  if (headerProfileDiv) headerProfileDiv.style.display = "block";

  // FIXED: Developer portal button elements visibility layout handling 
  const portalBtn = document.getElementById("portalBtn");
  if (portalBtn) portalBtn.style.display = "none";
}

function resetGlobalSessionUI() {
  const headerProfileDiv = document.getElementById("userProfileHeader");
  const userSidebarDiv = document.getElementById("userSidebar");
  const portalBtn = document.getElementById("portalBtn");

  if (headerProfileDiv) headerProfileDiv.style.display = "none";
  if (userSidebarDiv) userSidebarDiv.style.left = "-260px";
  if (portalBtn) portalBtn.style.display = "block";
}

// LOGOUT UTILITY ACCESS ENGINE
window.handleLogout = async function() {
  try {
    isRegistrationProcess = false;
    await signOut(auth);
    
    const userSidebarDiv = document.getElementById("userSidebar");
    const headerProfileDiv = document.getElementById("userProfileHeader");
    const headerImg = document.getElementById("headerProfilePic");
    const sidebarImg = document.getElementById("userSidebarPic");

    if (userSidebarDiv) userSidebarDiv.style.left = "-260px";
    if (headerProfileDiv) headerProfileDiv.style.display = "none";
    if (headerImg) headerImg.src = "";
    if (sidebarImg) sidebarImg.src = "";
    
    if (typeof window.closePanelGrid === "function") {
      window.closePanelGrid();
    }
    window.openLoginPanel();
  } catch (error) {
    alert("Logout Execution Failure: " + error.message);
  }
};
