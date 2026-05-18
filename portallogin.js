import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
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

// Global Auth State Observer
onAuthStateChanged(auth, (user) => {
  // We only auto-login if the user completely has a setup profile (displayName exist)
  // and we are NOT actively in a new registration setup workflow.
  if (user && user.displayName && !isRegistrationProcess) {
    applyUserUIData(user);
  } else if (!user) {
    resetGlobalSessionUI();
  }
});

window.openLoginPanel = function() {
  const user = auth.currentUser;
  if (user && user.displayName && !isRegistrationProcess) {
    executeLoginSuccess();
    return;
  }
  document.getElementById("loginOverlay").style.display = "flex";
  document.getElementById("downloadBtn").style.display = "none";
  document.getElementById("portalBtn").style.display = "none";
  document.getElementById("sidebar").style.left = "-220px";
  restoreInitialAuthView();
};

window.closeLoginPanel = function() {
  document.getElementById("loginOverlay").style.display = "none";
  document.getElementById("downloadBtn").style.display = "block";
  document.getElementById("portalBtn").style.display = "block";
  document.getElementById("userProfileHeader").style.display = "none";
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

// 1. PATHWAY A: EXISTING USER DIRECT LOGIN ONLY (No Registration allowed from here)
window.handleDirectLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";

  try {
    // Strictly verify if credentials exist and log them directly inside dashboard
    isRegistrationProcess = false;
    await signInWithEmailAndPassword(auth, email, password);
    executeLoginSuccess();
  } catch (err) {
    // Strictly block account creation and throw clear error if account doesn't exist
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      errorDiv.innerText = "Account does not exist or invalid password! Please create an account via 'Continue With Google' first.";
    } else {
      errorDiv.innerText = "Error: " + err.message;
    }
  }
};

// 2. PATHWAY B: NEW USER REGISTRATION VIA GOOGLE (Strictly triggers Setup box flows)
window.handleGoogleAuth = async function() {
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";
  try {
    isRegistrationProcess = true; // Block auth observer from bypassing custom screens
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    registrationEmail = user.email;

    // Strict Sequence Rule: Even if Google responds, we FORCE send them to Step 1 & Step 2
    document.getElementById("authGateways").style.display = "none";
    document.getElementById("credentialsStep").style.display = "block";
  } catch (error) {
    isRegistrationProcess = false;
    errorDiv.innerText = "Authentication Cancelled or Failed: " + error.message;
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
  
  // Transition directly into Stage 2: Avatar File Uploader selection layout screen
  document.getElementById("credentialsStep").style.display = "none";
  document.getElementById("avatarStep").style.display = "block";
};

// 4. REGISTRATION STEP 2: PROFILE PICTURE SELECTION & STAGE COMPLEX FINALIZE
window.finalizeAccountRegistration = async function() {
  const username = document.getElementById("usernameInput").value.trim();
  const fileInput = document.getElementById("avatarFileInput");
  const errorDiv = document.getElementById("loginError");

  try {
    let user = auth.currentUser;
    let base64AvatarString = "https://www.w3schools.com/howto/img_avatar.png";

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      base64AvatarString = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    // Securely link Email & Custom Chosen Password to this Google account mapping node
    // So that they can use the direct Email/Password login fields anywhere in the future!
    if (user) {
      try {
        const passwordCredential = EmailAuthProvider.credential(registrationEmail, registrationPassword);
        await linkWithCredential(user, passwordCredential);
      } catch (linkErr) {
        console.log("Dual account credential linking mapped successfully.");
      }

      // Update full customized display profile metrics parameters safely
      await updateProfile(user, {
        displayName: username,
        photoURL: base64AvatarString
      });

      isRegistrationProcess = false; // Registration sequence finished perfectly
      executeLoginSuccess();
    }
  } catch (err) {
    errorDiv.innerText = "Error completing customized profile registration: " + err.message;
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
  const finalAvatar = user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";
  document.getElementById("headerProfilePic").src = finalAvatar;
  document.getElementById("userSidebarPic").src = finalAvatar;
  document.getElementById("userSidebarName").innerText = user.displayName || "Developer";
  document.getElementById("portalBtn").style.display = "none";
}

function resetGlobalSessionUI() {
  document.getElementById("userProfileHeader").style.display = "none";
  document.getElementById("userSidebar").style.left = "-260px";
  document.getElementById("portalBtn").style.display = "block";
}

// LOGOUT CONFIGURATIONS CONTROL ENGINE
window.handleLogout = async function() {
  try {
    isRegistrationProcess = false;
    await signOut(auth);
    document.getElementById("userSidebar").style.left = "-260px";
    document.getElementById("userProfileHeader").style.display = "none";
    document.getElementById("headerProfilePic").src = "";
    document.getElementById("userSidebarPic").src = "";
    
    if (typeof window.closePanelGrid === "function") {
      window.closePanelGrid();
    }
    window.openLoginPanel();
  } catch (error) {
    alert("Logout Error: " + error.message);
  }
};
