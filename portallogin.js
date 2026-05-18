import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
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

// Global structural variables to hold credentials during registration flow
let userSessionEmail = "";
let userSessionPassword = "";
let accountCreationMode = false; 

// Session Management State Observer
onAuthStateChanged(auth, (user) => {
  if (user && user.displayName) {
    applyUserUIData(user);
    if (document.getElementById("loginOverlay").style.display === "flex") {
      executeLoginSuccess();
    }
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
  accountCreationMode = false;
}

// GOOGLE CONTINUATION CORE TRIGGER
window.handleGoogleAuth = async function() {
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    userSessionEmail = user.email;

    if (!user.displayName) {
      accountCreationMode = true;
      // Show username and password entry box for Google users
      document.getElementById("authGateways").style.display = "none";
      document.getElementById("credentialsStep").style.display = "block";
      document.getElementById("passwordSetupRow").style.display = "block"; 
    } else {
      executeLoginSuccess();
    }
  } catch (error) {
    errorDiv.innerText = "Domain/Network error: Kindly authorize 'netnogames.github.io' inside Firebase console settings.";
  }
};

// DIRECT EMAIL SUBMISSION
window.handleEmailSubmission = async function(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";

  userSessionEmail = email;
  userSessionPassword = password;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    executeLoginSuccess();
  } catch (err) {
    if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
      errorDiv.innerText = "Incorrect account credentials specified.";
    } else {
      // Create new clean registration path
      accountCreationMode = true;
      document.getElementById("authGateways").style.display = "none";
      document.getElementById("credentialsStep").style.display = "block";
      document.getElementById("passwordSetupRow").style.display = "none"; // Password already entered
    }
  }
};

// STEP 1 VALIDATION
window.submitCredentialsStep = function() {
  const username = document.getElementById("usernameInput").value.trim();
  const passSetup = document.getElementById("setupPasswordInput").value;
  const errorDiv = document.getElementById("loginError");

  if (!username) {
    errorDiv.innerText = "Username field is highly mandatory.";
    return;
  }
  if (document.getElementById("passwordSetupRow").style.display !== "none" && !passSetup) {
    errorDiv.innerText = "Please specify a portal password.";
    return;
  }
  
  if (passSetup) {
    userSessionPassword = passSetup;
  }

  errorDiv.innerText = "";
  document.getElementById("credentialsStep").style.display = "none";
  document.getElementById("avatarStep").style.display = "block"; // Open profile photo selector box
};

// STEP 2 ACCOUNT CREATION FINALIZE
window.finalizeAccountRegistration = async function() {
  const username = document.getElementById("usernameInput").value.trim();
  const fileInput = document.getElementById("avatarFileInput");
  const errorDiv = document.getElementById("loginError");

  try {
    let user = auth.currentUser;
    let computedPhotoURL = "https://www.w3schools.com/howto/img_avatar.png";

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      computedPhotoURL = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    // If user is registering via native email credentials
    if (!user && accountCreationMode) {
      const cred = await createUserWithEmailAndPassword(auth, userSessionEmail, userSessionPassword);
      user = cred.user;
    }

    if (user) {
      await updateProfile(user, {
        displayName: username,
        photoURL: computedPhotoURL
      });
      executeLoginSuccess();
    }
  } catch (err) {
    errorDiv.innerText = "Profile Creation Error: " + err.message;
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
  const avatar = user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";
  document.getElementById("headerProfilePic").src = avatar;
  document.getElementById("userSidebarPic").src = avatar;
  document.getElementById("userSidebarName").innerText = user.displayName || "Developer";
  document.getElementById("portalBtn").style.display = "none";
}

function resetGlobalSessionUI() {
  document.getElementById("userProfileHeader").style.display = "none";
  document.getElementById("userSidebar").style.left = "-260px";
  document.getElementById("portalBtn").style.display = "block";
}

// CLEAN FUNCTIONAL LOGOUT INTERFACE METHOD
window.handleLogout = async function() {
  try {
    await signOut(auth);
    document.getElementById("userSidebar").style.left = "-260px";
    document.getElementById("userProfileHeader").style.display = "none";
    document.getElementById("headerProfilePic").src = "";
    
    if (typeof window.closePanelGrid === "function") {
      window.closePanelGrid();
    }
    // Reopen clean system box
    window.openLoginPanel();
  } catch (error) {
    alert("Logout Failed: " + error.message);
  }
};
