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
  onAuthStateChanged,
  deleteUser,
  sendPasswordResetEmail,
  reauthenticateWithCredential
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

let activeWorkflowMode = "";
let registrationEmail = "";
let registrationPassword = "";
let isRegistrationProcess = false;
let chosenUsername = "";

onAuthStateChanged(auth, (user) => {

  if (user) {

    const pendingCheck = localStorage.getItem("netno_org_pending_" + user.email);

    if (pendingCheck === "true") {

      isRegistrationProcess = true;

      document.getElementById("authGateways").style.display = "none";

      document.getElementById("approvalPendingStep").style.display = "block";

      return;
    }

    if(!isRegistrationProcess) {
      applyUserUIData(user);
    }

  } else {

    resetGlobalSessionUI();

  }

});

window.openLoginPanel = function() {

  const user = auth.currentUser;

  document.getElementById("loginOverlay").style.display = "flex";

  if (user) {

    const pendingCheck = localStorage.getItem("netno_org_pending_" + user.email);

    if(pendingCheck === "true") {

      document.getElementById("authGateways").style.display = "none";

      document.getElementById("approvalPendingStep").style.display = "block";

      return;
    }

    if(user.displayName && !isRegistrationProcess) {

      executeLoginSuccess();

      return;

    }

  }

  restoreInitialAuthView();

};

window.closeLoginPanel = function() {

  document.getElementById("loginOverlay").style.display = "none";

};

function restoreInitialAuthView() {

  document.getElementById("authGateways").style.display = "block";

  document.getElementById("credentialsStep").style.display = "none";

  document.getElementById("orgCredentialsStep").style.display = "none";

  document.getElementById("avatarStep").style.display = "none";

  document.getElementById("orgAvatarStep").style.display = "none";

  document.getElementById("approvalPendingStep").style.display = "none";

  document.getElementById("loginError").innerText = "";

  document.getElementById("usernameInput").value = "";

  document.getElementById("setupPasswordInput").value = "";

  isRegistrationProcess = false;

  activeWorkflowMode = "";

}

window.handleDirectLogin = async function(e) {

  e.preventDefault();

  const email = document.getElementById("authEmail").value.trim();

  const password = document.getElementById("authPassword").value;

  const errorDiv = document.getElementById("loginError");

  errorDiv.innerText = "";

  try {

    isRegistrationProcess = false;

    const result = await signInWithEmailAndPassword(auth, email, password);

    const pendingCheck = localStorage.getItem("netno_org_pending_" + result.user.email);

    if(pendingCheck === "true") {

      isRegistrationProcess = true;

      document.getElementById("authGateways").style.display = "none";

      document.getElementById("approvalPendingStep").style.display = "block";

      return;

    }

    executeLoginSuccess();

  } catch (err) {

    errorDiv.innerText = "Incorrect account details or invalid password specified.";

  }

};

window.triggerRouteAuth = async function(selectedMode) {

  activeWorkflowMode = selectedMode;

  const errorDiv = document.getElementById("loginError");

  errorDiv.innerText = "";

  try {

    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    registrationEmail = user.email;

    const accountFinishedBefore = localStorage.getItem("netno_setup_done_" + user.email);

    const pendingCheck = localStorage.getItem("netno_org_pending_" + user.email);

    if (pendingCheck === "true") {

      isRegistrationProcess = true;

      document.getElementById("authGateways").style.display = "none";

      document.getElementById("approvalPendingStep").style.display = "block";

      return;

    }

    if ((user.displayName && !user.displayName.includes("@") && user.displayName.trim() !== "") || accountFinishedBefore) {

      isRegistrationProcess = false;

      executeLoginSuccess();

    } else {

      isRegistrationProcess = true;

      document.getElementById("authGateways").style.display = "none";

      if (activeWorkflowMode === "individual") {

        document.getElementById("credentialsStep").style.display = "block";

      } else if (activeWorkflowMode === "organization") {

        document.getElementById("orgCredentialsStep").style.display = "block";

      }

    }

  } catch (error) {

    isRegistrationProcess = false;

    errorDiv.innerText = "Authentication Protocol Failure: " + error.message;

  }

};

function executeLoginSuccess() {

  document.getElementById("loginOverlay").style.display = "none";

  const user = auth.currentUser;

  if (user) {

    applyUserUIData(user);

  }

}

function applyUserUIData(user) {

  if(!user) return;

  const savedCacheAvatar = localStorage.getItem("netno_user_avatar_" + user.email);

  const finalAvatar = savedCacheAvatar || "https://www.w3schools.com/howto/img_avatar.png";

  const headerImg = document.getElementById("headerProfilePic");

  const sidebarImg = document.getElementById("userSidebarPic");

  const sidebarName = document.getElementById("userSidebarName");

  if (headerImg) headerImg.src = finalAvatar;

  if (sidebarImg) sidebarImg.src = finalAvatar;

  if (sidebarName) sidebarName.innerText = user.displayName || "Developer";

}

function resetGlobalSessionUI() {

  const headerProfileDiv = document.getElementById("userProfileHeader");

  const userSidebarDiv = document.getElementById("userSidebar");

  if (headerProfileDiv) headerProfileDiv.style.display = "none";

  if (userSidebarDiv) userSidebarDiv.style.left = "-260px";

}

window.handleLogout = async function() {

  try {

    isRegistrationProcess = false;

    await signOut(auth);

    const userSidebarDiv = document.getElementById("userSidebar");

    if (userSidebarDiv) userSidebarDiv.style.left = "-260px";

    if (typeof window.closePanelGrid === "function") {

      window.closePanelGrid();

    }

    window.openLoginPanel();

  } catch (error) {

    alert("Logout System Pipeline Failure: " + error.message);

  }

};

let sidebar = document.getElementById("sidebar");

let userSidebar = document.getElementById("userSidebar");

let panel = document.getElementById("panel");

let panelImg = document.getElementById("panelImg");

let downloadBtn = document.getElementById("downloadBtn");

let communityLinks = document.getElementById("communityLinks");

window.toggleMenu = function() {

  userSidebar.style.left = "-260px";

  if (sidebar.style.left === "0px") {

    sidebar.style.left = "-220px";

  } else {

    sidebar.style.left = "0px";

  }

};

window.toggleUserMenu = function() {

  sidebar.style.left = "-220px";

  if (userSidebar.style.left === "0px") {

    userSidebar.style.left = "-260px";

  } else {

    userSidebar.style.left = "0px";

  }

};

window.openPanel = function(img, isCommunity) {

  panel.style.display = "block";

  panelImg.src = img;

  downloadBtn.style.display = "none";

  sidebar.style.left = "-220px";

  userSidebar.style.left = "-260px";

  if (isCommunity) {

    communityLinks.style.display = "flex";

  } else {

    communityLinks.style.display = "none";

  }

};

window.closePanelGrid = function() {

  panel.style.display = "none";

  communityLinks.style.display = "none";

  downloadBtn.style.display = "block";

  userSidebar.style.left = "-260px";

};

window.closePanelOnOverlay = function(event) {

  if (event.target.id === "panel" || event.target.className === "panel-content-wrapper") {

    window.closePanelGrid();

  }

};

window.downloadLauncher = function() {

  alert("Download Started");

};

window.addEventListener('keydown', function(e) {

  if (e.key === "Escape") {

    window.closePanelGrid();

    if (typeof window.closeLoginPanel === "function") {

      window.closeLoginPanel();

    }

  }

});
