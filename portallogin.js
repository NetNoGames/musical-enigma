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

// FIX: Loading session glitch resolved. Page load hone par Developer Portal button active rahega.
onAuthStateChanged(auth, (user) => {
  if (user && user.displayName) {
    updateProfileUIData(user);
    if(document.getElementById("loginOverlay").style.display === "flex") {
      loginSuccess();
    }
  } else {
    hideUserSessionUI();
  }
});

window.openLoginPanel = function() {
  const user = auth.currentUser;
  // If already authorized, directly open developer portal view
  if (user && user.displayName) {
    loginSuccess();
    return;
  }
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
  document.getElementById("userProfileHeader").style.display = "none"; 
};

function resetAuthViews() {
  document.getElementById("authForm").style.display = "block";
  document.getElementById("googleAuthBtn").style.display = "block";
  document.getElementById("authSeparator").style.display = "block";
  document.getElementById("usernameSection").style.display = "none";
  document.getElementById("photoUploadSection").style.display = "none";
  document.getElementById("setupPasswordRow").style.display = "none";
  document.getElementById("loginError").innerText = "";
}

// METHOD 1: GOOGLE AUTH
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
      document.getElementById("setupPasswordRow").style.display = "block"; 
    } else {
      loginSuccess();
    }
  } catch (error) {
    errorDiv.innerText = "Google Setup Failed: " + error.message;
  }
};

window.goToImageUploadStep = function() {
  const usernameInput = document.getElementById("usernameInput").value.trim();
  const errorDiv = document.getElementById("loginError");

  if (!usernameInput) {
    errorDiv.innerText = "Please enter a unique username identity tag.";
    return;
  }
  errorDiv.innerText = "";
  document.getElementById("usernameSection").style.display = "none";
  document.getElementById("photoUploadSection").style.display = "block"; 
};

window.saveUserProfileMatrix = async function() {
  const usernameInput = document.getElementById("usernameInput").value.trim();
  const passwordInput = document.getElementById("usernamePasswordInput").value;
  const fileInput = document.getElementById("profilePicInput");
  const errorDiv = document.getElementById("loginError");

  try {
    let user = auth.currentUser;
    let finalPhotoURL = "https://www.w3schools.com/howto/img_avatar.png"; 

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      finalPhotoURL = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    if (passwordInput && user) {
      const credential = EmailAuthProvider.credential(user.email, passwordInput);
      try {
        await linkWithCredential(user, credential);
      } catch (linkErr) {
        console.log("Account linkage managed.");
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
    errorDiv.innerText = "Profile Matrix Integration Error: " + error.message;
  }
};

// METHOD 2: EMAIL PASSWORD
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
      errorDiv.innerText = "Account already exists! Please input correct password key.";
    } else {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        document.getElementById("authForm").style.display = "none";
        document.getElementById("googleAuthBtn").style.display = "none";
        document.getElementById("authSeparator").style.display = "none";
        document.getElementById("usernameSection").style.display = "block";
        document.getElementById("setupPasswordRow").style.display = "none"; 
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
    updateProfileUIData(user);
    document.getElementById("userProfileHeader").style.display = "block";
    if (typeof window.openPanel === "function") {
      window.openPanel('developerportal.png', false);
    }
  }
}

function updateProfileUIData(user) {
  document.getElementById("headerProfilePic").src = user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";
  document.getElementById("userSidebarPic").src = user.photoURL || "https://www.w3schools.com/howto/img_avatar.png";
  document.getElementById("userSidebarName").innerText = user.displayName;
  // Button maintains display state layout integrity
  document.getElementById("portalBtn").style.display = "none"; 
}

function hideUserSessionUI() {
  document.getElementById("userProfileHeader").style.display = "none";
  document.getElementById("userSidebar").style.left = "-260px";
  document.getElementById("portalBtn").style.display = "block";
}

// FIX: Logout execution sequence resets interface instantly to login terminal
window.handleLogout = async function() {
  try {
    await signOut(auth);
    document.getElementById("userSidebar").style.left = "-260px";
    document.getElementById("userProfileHeader").style.display = "none";
    if (typeof window.closePanelGrid === "function") {
       window.closePanelGrid();
    }
    window.openLoginPanel();
  } catch (err) {
    alert("Logout failure: " + err.message);
  }
};
