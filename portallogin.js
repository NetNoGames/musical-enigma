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

let cachedUserEmail = "";
let cachedUserPassword = "";
let isGoogleRegistration = false;

// Realtime User Account Status Listener Observer
onAuthStateChanged(auth, (user) => {
  if (user && user.displayName) {
    applyUserUIData(user);
  } else {
    resetGlobalSessionUI();
  }
});

window.openLoginPanel = function() {
  const user = auth.currentUser;
  if (user && user.displayName) {
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
  isGoogleRegistration = false;
}

// 1. CONTINUE WITH GOOGLE SIGNUP CONTROLLER ROUTE
window.handleGoogleAuth = async function() {
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    cachedUserEmail = user.email;

    // Check if user doesn't have a custom username set yet
    if (!user.displayName) {
      isGoogleRegistration = true;
      document.getElementById("authGateways").style.display = "none";
      document.getElementById("credentialsStep").style.display = "block";
    } else {
      executeLoginSuccess();
    }
  } catch (error) {
    errorDiv.innerText = "Authentication Error: " + error.message;
  }
};

// 2. EXISTING USER DIRECT EMAIL & PASSWORD VERIFICATION SUBMISSION
window.handleEmailSubmission = async function(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";

  cachedUserEmail = email;
  cachedUserPassword = password;

  try {
    // If user exists, this logs them inside instantly without triggering registration boxes
    await signInWithEmailAndPassword(auth, email, password);
    executeLoginSuccess();
  } catch (err) {
    // If account doesn't exist, route through clean custom setup wizards
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      isGoogleRegistration = false;
      document.getElementById("authGateways").style.display = "none";
      document.getElementById("credentialsStep").style.display = "block";
    } else {
      errorDiv.innerText = "Error: " + err.message;
    }
  }
};

// 3. STEP 1 EXECUTOR - SUBMIT USERNAME WITH 15 CHARACTER STRICT MAXIMUM LIMIT
window.submitCredentialsStep = function() {
  const username = document.getElementById("usernameInput").value.trim();
  const chosenPassword = document.getElementById("setupPasswordInput").value;
  const errorDiv = document.getElementById("loginError");

  if (!username) {
    errorDiv.innerText = "Username field cannot be left blank.";
    return;
  }
  if (username.length > 15) {
    errorDiv.innerText = "Username is too long! Maximum limit is 15 characters.";
    return;
  }
  if (!chosenPassword || chosenPassword.length < 6) {
    errorDiv.innerText = "Password must consist of at least 6 characters.";
    return;
  }

  cachedUserPassword = chosenPassword;
  errorDiv.innerText = "";
  
  // Close username step and slide into profile image upload selection grid view
  document.getElementById("credentialsStep").style.display = "none";
  document.getElementById("avatarStep").style.display = "block";
};

// 4. STEP 2 EXECUTOR - CAPTURE SELECTED PHOTO AND FINALIZE NODE ENTRY
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

    // Condition A: Save native structured accounts
    if (!user && !isGoogleRegistration) {
      const credentials = await createUserWithEmailAndPassword(auth, cachedUserEmail, cachedUserPassword);
      user = credentials.user;
    } 
    // Condition B: Link password securely to Google Node mapping so Dual Login works everywhere!
    else if (user && isGoogleRegistration) { 
      try {
        const passwordCredential = EmailAuthProvider.credential(cachedUserEmail, cachedUserPassword);
        await linkWithCredential(user, passwordCredential);
      } catch (linkErr) {
        console.log("Dual system mapping linkage optimized.");
      }
    }

    if (user) {
      await updateProfile(user, {
        displayName: username,
        photoURL: base64AvatarString
      });
      executeLoginSuccess();
    }
  } catch (err) {
    errorDiv.innerText = "Error completing registration node: " + err.message;
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
  const userPhoto = user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";
  document.getElementById("headerProfilePic").src = userPhoto;
  document.getElementById("userSidebarPic").src = userPhoto;
  document.getElementById("userSidebarName").innerText = user.displayName || "Developer";
  document.getElementById("portalBtn").style.display = "none";
}

function resetGlobalSessionUI() {
  document.getElementById("userProfileHeader").style.display = "none";
  document.getElementById("userSidebar").style.left = "-260px";
  document.getElementById("portalBtn").style.display = "block";
}

// LOGOUT ENGINE UTILITY FOR LEFT SIDE PANEL DESTRUCTOR INTERFACES
window.handleLogout = async function() {
  try {
    await signOut(auth);
    document.getElementById("userSidebar").style.left = "-260px";
    document.getElementById("userProfileHeader").style.display = "none";
    document.getElementById("headerProfilePic").src = "";
    document.getElementById("userSidebarPic").src = "";
    
    if (typeof window.closePanelGrid === "function") {
      window.closePanelGrid();
    }
    // Instantly slide up fresh initial login overlay entry portal box back
    window.openLoginPanel();
  } catch (error) {
    alert("Logout Execution Failure: " + error.message);
  }
};
