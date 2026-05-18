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

provider.setCustomParameters({ prompt: 'select_account' });

// Global Auth State Monitor (Persists UI even after page refresh)
onAuthStateChanged(auth, (user) => {
  if (user && user.displayName) {
    showUserSessionUI(user);
  } else {
    hideUserSessionUI();
  }
});

window.openLoginPanel = function() {
  document.getElementById("loginOverlay").style.display = "flex";
  document.getElementById("downloadBtn").style.display = "none";
  document.getElementById("portalBtn").style.display = "none";
  document.getElementById("sidebar").style.left = "-220px";
  resetAuthViews();
};

window.closeLoginPanel = function() {
  document.getElementById("loginOverlay").style.display = "none";
  if (!auth.currentUser || !auth.currentUser.displayName) {
    document.getElementById("downloadBtn").style.display = "block";
    document.getElementById("portalBtn").style.display = "block";
  }
};

function resetAuthViews() {
  document.getElementById("authForm").style.display = "block";
  document.getElementById("googleAuthBtn").style.display = "block";
  document.getElementById("authSeparator").style.display = "block";
  document.getElementById("usernameSection").style.display = "none";
  document.getElementById("setupPasswordRow").style.display = "none";
  document.getElementById("loginError").innerText = "";
}

// METHOD 1: GOOGLE SIGN-IN SYSTEM WITH EXTRA SETTINGS
window.handleGoogleAuth = async function() {
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user.displayName) {
      document.getElementById("authForm").style.display = "none";
      document.getElementById("googleAuthBtn").style.display = "none";
      document.getElementById("authSeparator").style.display = "none";
      document.getElementById("usernameSection").style.display = "block";
      document.getElementById("setupPasswordRow").style.display = "block"; // Open password box for new Google users
    } else {
      loginSuccess();
    }
  } catch (error) {
    errorDiv.innerText = "Google Setup Failed: " + error.message;
  }
};

// SAVE PROFILE AND LINK METADATA MATRIX
window.saveUsername = async function() {
  const usernameInput = document.getElementById("usernameInput").value.trim();
  const passwordInput = document.getElementById("usernamePasswordInput").value;
  const fileInput = document.getElementById("profilePicInput");
  const errorDiv = document.getElementById("loginError");

  if (!usernameInput) {
    errorDiv.innerText = "Please configure a unique identity tag.";
    return;
  }

  try {
    let user = auth.currentUser;
    let finalPhotoURL = "https://www.w3schools.com/howto/img_avatar.png"; // Default fallback image

    // Profile Pic Image Binary Base64 Converter Engine
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      finalPhotoURL = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    // Google password integration bridge hook
    if (passwordInput && user) {
      const credential = EmailAuthProvider.credential(user.email, passwordInput);
      try {
        await linkWithCredential(user, credential);
      } catch (linkErr) {
        console.log("Account linkage managed or fallback authentication registered.");
      }
    }

    if (user) {
      await updateProfile(user, { 
        displayName: usernameInput,
        photoURL: finalPhotoURL
      });
      loginSuccess();
    }
  } catch (error) {
    errorDiv.innerText = "Profile Sync Error: " + error.message;
  }
};

// METHOD 2: DIRECT EMAIL & PASSWORD VERIFICATION
document.getElementById("authForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginSuccess();
  } catch (loginError) {
    if (loginError.code === "auth/wrong-password" || loginError.code === "auth/invalid-credential") {
      errorDiv.innerText = "Account already exists! Please input correct protection key.";
    } else {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        document.getElementById("authForm").style.display = "none";
        document.getElementById("googleAuthBtn").style.display = "none";
        document.getElementById("authSeparator").style.display = "none";
        document.getElementById("usernameSection").style.display = "block";
        document.getElementById("setupPasswordRow").style.display = "none"; // Already setup during direct execution
      } catch (regError) {
        errorDiv.innerText = "Access Matrix Error: " + regError.message;
      }
    }
  }
});

function loginSuccess() {
  document.getElementById("loginOverlay").style.display = "none";
  const user = auth.currentUser;
  if (user) {
    showUserSessionUI(user);
    if (typeof window.openPanel === "function") {
      window.openPanel('developerportal.png', false);
    }
  }
}

function showUserSessionUI(user) {
  document.getElementById("userProfileHeader").style.display = "block";
  document.getElementById("headerProfilePic").src = user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";
  document.getElementById("userSidebarPic").src = user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";
  document.getElementById("userSidebarName").innerText = user.displayName;
  document.getElementById("portalBtn").style.display = "none"; 
}

function hideUserSessionUI() {
  document.getElementById("userProfileHeader").style.display = "none";
  document.getElementById("userSidebar").style.left = "-260px";
  document.getElementById("portalBtn").style.display = "block";
}

window.handleLogout = async function() {
  try {
    await signOut(auth);
    location.reload();
  } catch (err) {
    alert("Logout processing failure: " + err.message);
  }
};
