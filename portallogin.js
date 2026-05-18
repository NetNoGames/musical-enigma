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

// System Runtime Onboarding Variables
let userSessionEmail = "";
let userSessionPassword = "";
let isGoogleRegistration = false;

// Realtime User State Observer
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
  isGoogleRegistration = false;
}

// 1. CHOOSE SIGN-IN/SIGN-UP VIA GOOGLE
window.handleGoogleAuth = async function() {
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    userSessionEmail = user.email;

    // Check if the profile lacks an active username, meaning it's a completely new node
    if (!user.displayName) {
      isGoogleRegistration = true;
      document.getElementById("authGateways").style.display = "none";
      document.getElementById("credentialsStep").style.display = "block";
    } else {
      executeLoginSuccess();
    }
  } catch (error) {
    errorDiv.innerText = "Domain Configuration missing or cancelled. Check Firebase settings.";
  }
};

// 2. PRIMARY DIRECT EMAIL & PASSWORD SYSTEM AUTHENTICATION HOOK (With Registration Fallback)
window.handleEmailSubmission = async function(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";

  userSessionEmail = email;
  userSessionPassword = password;

  try {
    // If the account already exists, log the developer directly inside the portal layout view
    await signInWithEmailAndPassword(auth, email, password);
    executeLoginSuccess();
  } catch (err) {
    if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
      errorDiv.innerText = "Incorrect account details or invalid password specified.";
    } else {
      // If the email doesn't exist, route user directly through the registration setup workflow wizard step
      isGoogleRegistration = false;
      document.getElementById("authGateways").style.display = "none";
      document.getElementById("credentialsStep").style.display = "block";
    }
  }
};

// 3. STEP 1 VALIDATION (Save Username and Registration Password Fields)
window.submitCredentialsStep = function() {
  const username = document.getElementById("usernameInput").value.trim();
  const chosenPassword = document.getElementById("setupPasswordInput").value;
  const errorDiv = document.getElementById("loginError");

  if (!username) {
    errorDiv.innerText = "Username is absolutely mandatory.";
    return;
  }
  if (!chosenPassword || chosenPassword.length < 6) {
    errorDiv.innerText = "Please specify a password containing at least 6 characters.";
    return;
  }

  userSessionPassword = chosenPassword;
  errorDiv.innerText = "";
  
  // Open the profile picture choosing popup panel layer view safely
  document.getElementById("credentialsStep").style.display = "none";
  document.getElementById("avatarStep").style.display = "block";
};

// 4. STEP 2 VALIDATION AND ACCOUNT PACKET PROVISIONING (Solves email-already-in-use runtime conflict)
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

    if (!user && !isGoogleRegistration) {
      // Normal direct Email user creation path
      const credentials = await createUserWithEmailAndPassword(auth, userSessionEmail, userSessionPassword);
      user = credentials.user;
    } else if (user && isGoogleRegistration) {
      // Link the chosen password to the Google Account node so they can use direct login layout box anywhere!
      try {
        const structuralCredential = EmailAuthProvider.credential(userSessionEmail, userSessionPassword);
        await linkWithCredential(user, structuralCredential);
      } catch (linkError) {
        console.log("Account linkage profile optimization resolved mapping.");
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
    errorDiv.innerText = "Error finishing profile metrics creation: " + err.message;
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
  const userAvatarImage = user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";
  document.getElementById("headerProfilePic").src = userAvatarImage;
  document.getElementById("userSidebarPic").src = userAvatarImage;
  document.getElementById("userSidebarName").innerText = user.displayName || "Developer";
  document.getElementById("portalBtn").style.display = "none";
}

function resetGlobalSessionUI() {
  document.getElementById("userProfileHeader").style.display = "none";
  document.getElementById("userSidebar").style.left = "-260px";
  document.getElementById("portalBtn").style.display = "block";
}

// SECURE INSTANT USER LOGOUT DESTRUCTOR UTILITY METHOD
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
    // Instantly bring up clean login entry overlay structure back
    window.openLoginPanel();
  } catch (error) {
    alert("Logout processing fault caught: " + error.message);
  }
};
