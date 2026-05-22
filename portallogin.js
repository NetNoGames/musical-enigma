import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, updateProfile, linkWithCredential, EmailAuthProvider, signOut, onAuthStateChanged, deleteUser, sendPasswordResetEmail, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const DATABASE_URL = "https://netno-games-d8580-default-rtdb.firebaseio.com/";

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
  
  // Modifying HTML content dynamically to remove separate buttons and make it a single Google Flow
  const gatewayDiv = document.getElementById("authGateways");
  if (gatewayDiv) {
    gatewayDiv.innerHTML = `
      <button class="individual-sso-btn" onclick="triggerRouteAuth('individual')" style="width:100%; padding:12px; background:#4285F4; color:white; font-weight:bold; border:none; border-radius:4px; cursor:pointer; margin-bottom:15px;">Continue with Google Account</button>
      <div class="divider"><span>OR DIRECT LOGIN</span></div>
      <form id="authForm" onsubmit="event.preventDefault(); handleDirectLogin(event)">
        <div class="terminal-input-row">
          <label>Email Address</label>
          <input type="email" id="authEmail" required>
        </div>
        <div class="terminal-input-row">
          <label>Password</label>
          <input type="password" id="authPassword" required>
        </div>
        <button type="submit" class="terminal-submit-btn">Login</button>
      </form>
    `;
  }

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

// UNIFIED SINGLE SSO INTERFACE ENFORCER (ORGANIZATION REMOVED)
window.triggerRouteAuth = async function(selectedMode) {
  activeWorkflowMode = "individual"; 
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";
  try {
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    registrationEmail = user.email;
    
    const accountFinishedBefore = localStorage.getItem("netno_setup_done_" + user.email);
    
    // Check: Agar account pehle se bana hua hai toh seedhe bypass login karo
    if ((user.displayName && !user.displayName.includes("@") && user.displayName.trim() !== "") || accountFinishedBefore) {
      isRegistrationProcess = false;
      executeLoginSuccess();
    } else {
      // Naya account hone par automatic username/password box layout active hoga
      isRegistrationProcess = true;
      document.getElementById("authGateways").style.display = "none";
      document.getElementById("credentialsStep").style.display = "block";
    }
  } catch (error) {
    isRegistrationProcess = false;
    errorDiv.innerText = "Authentication Protocol Failure: " + error.message;
  }
};

window.submitCredentialsStep = function() {
  const username = document.getElementById("usernameInput").value.trim();
  const chosenPassword = document.getElementById("setupPasswordInput").value;
  const errorDiv = document.getElementById("loginError");
  if (!username) {
    errorDiv.innerText = "Please specify a unique username.";
    return;
  }
  if (username.length > 15) {
    errorDiv.innerText = "Username strictly limited to 15 characters.";
    return;
  }
  if (!chosenPassword || chosenPassword.length < 6) {
    errorDiv.innerText = "Password initialization requires at least 6 characters.";
    return;
  }
  chosenUsername = username;
  registrationPassword = chosenPassword;
  errorDiv.innerText = "";
  document.getElementById("credentialsStep").style.display = "none";
  document.getElementById("avatarStep").style.display = "block";
};

window.submitOrgCredentialsStep = function() {
  // Retained cleanly for structure safety
};

window.finalizeAccountRegistration = async function() {
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
      await updateProfile(user, { displayName: chosenUsername, photoURL: "https://www.w3schools.com/howto/img_avatar.png" });
      localStorage.setItem("netno_user_avatar_" + registrationEmail, finalBase64Url);
      localStorage.setItem("netno_setup_done_" + registrationEmail, "true");
      try {
        const passwordCredential = EmailAuthProvider.credential(registrationEmail, registrationPassword);
        await linkWithCredential(user, passwordCredential);
      } catch (linkErr) {
        console.warn("Link execution catch fallback context.");
      }
      isRegistrationProcess = false;
      executeLoginSuccess();
    }
  } catch (err) {
    errorDiv.innerText = "Registration Processing Error: " + err.message;
  }
};

window.finalizeOrgAccountRegistration = async function() {
  // Retained cleanly for structure safety
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
  if(!user) return;
  const savedCacheAvatar = localStorage.getItem("netno_user_avatar_" + user.email);
  const finalAvatar = savedCacheAvatar || "https://www.w3schools.com/howto/img_avatar.png";
  const headerImg = document.getElementById("headerProfilePic");
  const sidebarImg = document.getElementById("userSidebarPic");
  const sidebarName = document.getElementById("userSidebarName");
  const headerProfileDiv = document.getElementById("userProfileHeader");
  const panelDiv = document.getElementById("panel");
  const panelImg = document.getElementById("panelImg");
  if (headerImg) headerImg.src = finalAvatar;
  if (sidebarImg) sidebarImg.src = finalAvatar;
  if (sidebarName) sidebarName.innerText = user.displayName || "Developer";
  if (headerProfileDiv) {
    if (panelDiv && panelDiv.style.display === "block" && panelImg && panelImg.src.includes('developerportal.png')) {
      headerProfileDiv.style.display = "block";
    } else {
      headerProfileDiv.style.display = "none";
    }
  }
  const portalBtn = document.getElementById("portalBtn");
  if (portalBtn) portalBtn.style.display = "block";
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
    const headerProfileDiv = document.getElementById("userProfileHeader");
    if (userSidebarDiv) userSidebarDiv.style.left = "-260px";
    if (headerProfileDiv) headerProfileDiv.style.display = "none";
    if (typeof window.closePanelGrid === "function") {
      window.closePanelGrid();
    }
    window.openLoginPanel();
  } catch (error) {
    alert("Logout System Pipeline Failure: " + error.message);
  }
};

window.openSettingsModal = function() {
  document.getElementById("userSidebar").style.left = "-260px";
  document.getElementById("settingsOverlay").style.display = "flex";
  const user = auth.currentUser;
  if(user) {
    document.getElementById("settingProfileName").value = user.displayName || "";
    document.getElementById("userCount").innerText = (user.displayName || "").length + "/15";
    const savedBio = localStorage.getItem("netno_profile_desc_" + user.email) || "";
    document.getElementById("settingProfileDesc").value = savedBio;
    document.getElementById("bioCount").innerText = savedBio.length + "/1000";
    document.getElementById("socialyt").value = localStorage.getItem("netno_soc_yt_" + user.email) || "";
    document.getElementById("socialreddit").value = localStorage.getItem("netno_soc_reddit_" + user.email) || "";
    document.getElementById("socialdiscord").value = localStorage.getItem("netno_soc_discord_" + user.email) || "";
    document.getElementById("socialtwitter").value = localStorage.getItem("netno_soc_twitter_" + user.email) || "";
    document.getElementById("socialweb").value = localStorage.getItem("netno_soc_web_" + user.email) || "";
  }
};

window.closeSettingsModal = function() {
  document.getElementById("settingsOverlay").style.display = "none";
};

window.openSubPanel = function(panelKey) {
  document.getElementById("settingsOverlay").style.display = "none";
  document.getElementById(panelKey + "SubPanel").style.display = "flex";
};

window.applySettingsNameChange = async function() {
  const newName = document.getElementById("settingProfileName").value.trim();
  const user = auth.currentUser;
  if (!newName) {
    alert("Username field parameter validation criteria empty.");
    return;
  }
  try {
    await updateProfile(user, { displayName: newName });
    applyUserUIData(user);
    document.getElementById("usernameSubPanel").style.display = "none";
    document.getElementById("settingsOverlay").style.display = "flex";
    alert("Username remapped successfully.");
  } catch(e) {
    alert("Database update error trace: " + e.message);
  }
};

window.applySettingsAvatarChange = async function() {
  const fileInput = document.getElementById("settingProfilePicInput");
  const user = auth.currentUser;
  if(fileInput.files.length === 0) {
    alert("Please load asset source graphic data profile.");
    return;
  }
  try {
    const file = fileInput.files[0];
    const base64Str = await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result);
      r.readAsDataURL(file);
    });
    localStorage.setItem("netno_user_avatar_" + user.email, base64Str);
    applyUserUIData(user);
    document.getElementById("avatarSubPanel").style.display = "none";
    document.getElementById("settingsOverlay").style.display = "flex";
    alert("Avatar asset stream successfully written.");
  } catch(e) {
    alert("Exception trace captured: " + e.message);
  }
};

window.applySettingsDescChange = function() {
  const user = auth.currentUser;
  if(!user) return;
  const txt = document.getElementById("settingProfileDesc").value;
  localStorage.setItem("netno_profile_desc_" + user.email, txt);
  document.getElementById("bioSubPanel").style.display = "none";
  document.getElementById("settingsOverlay").style.display = "flex";
  alert("Bio information safely updated.");
};

window.applySettingsSocialsChange = function() {
  const user = auth.currentUser;
  if(!user) return;
  localStorage.setItem("netno_soc_yt_" + user.email, document.getElementById("socialyt").value.trim());
  localStorage.setItem("netno_soc_reddit_" + user.email, document.getElementById("socialreddit").value.trim());
  localStorage.setItem("netno_soc_discord_" + user.email, document.getElementById("socialdiscord").value.trim());
  localStorage.setItem("netno_soc_twitter_" + user.email, document.getElementById("socialtwitter").value.trim());
  localStorage.setItem("netno_soc_web_" + user.email, document.getElementById("socialweb").value.trim());
  document.getElementById("socialsSubPanel").style.display = "none";
  document.getElementById("settingsOverlay").style.display = "flex";
  alert("Social routing tables updated.");
};

window.applySettingsAccountTermination = async function() {
  const pass = document.getElementById("deleteAccountPassword").value;
  const user = auth.currentUser;
  if(!pass) {
    alert("Verification cryptographic password required.");
    return;
  }
  if(confirm("CRITICAL WARNING SYSTEM: Are you completely confident in deleting this network node structure?")) {
    try {
      const credential = EmailAuthProvider.credential(user.email, pass);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      localStorage.removeItem("netno_setup_done_" + user.email);
      localStorage.removeItem("netno_user_avatar_" + user.email);
      localStorage.removeItem("netno_org_pending_" + user.email);
      alert("Node successfully terminated from NetNo Database Registry.");
      document.getElementById("deleteSubPanel").style.display = "none";
      window.location.reload();
    } catch(err) {
      alert("Invalid password specified. Node structural destruction sequence rejected.");
    }
  }
};

window.triggerResetKeyForDeletion = async function() {
  const user = auth.currentUser;
  if (!user || !user.email) {
    alert("Active profile context target metadata state missing.");
    return;
  }
  const targetEmail = user.email;
  try {
    await sendPasswordResetEmail(auth, targetEmail);
    alert("Payload Dispatched! Open email sequence context on " + targetEmail + " to configure a new validation password layout.");
  } catch (err) {
    alert("Delivery network exception: " + err.message);
  }
};

let sidebar = document.getElementById("sidebar");
let userSidebar = document.getElementById("userSidebar");
let panel = document.getElementById("panel");
let panelImg = document.getElementById("panelImg");
let downloadBtn = document.getElementById("downloadBtn");
let portalBtn = document.getElementById("portalBtn");
let communityLinks = document.getElementById("communityLinks");
let userProfileHeader = document.getElementById("userProfileHeader");

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
  portalBtn.style.display = "block";
  sidebar.style.left = "-220px";
  userSidebar.style.left = "-260px";
  if (img === 'developerportal.png') {
    const imgEl = document.getElementById("headerProfilePic");
    if (imgEl && imgEl.getAttribute('src') !== "" && imgEl.getAttribute('src') !== null) {
      if (userProfileHeader) userProfileHeader.style.display = "block";
    }
  } else {
    if (userProfileHeader) userProfileHeader.style.display = "none";
  }
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
  if (userProfileHeader) userProfileHeader.style.display = "none";
  portalBtn.style.display = "block";
};

window.closePanelOnOverlay = function(event) {
  if (event.target.id === "panel" || event.target.className === "panel-content-wrapper") {
    window.closePanelGrid();
  }
};

window.downloadLauncher = function() {
  alert("Download Launched Successfully");
};

window.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    window.closePanelGrid();
    if (typeof window.closeLoginPanel === "function") {
      window.closeLoginPanel();
    }
    if (typeof window.closeSettingsModal === "function") {
      window.closeSettingsModal();
    }
    document.querySelectorAll('.sub-panel-overlay').forEach(el => {
      if(el.style.display === 'flex') {
        el.style.display = 'none';
        document.getElementById('settingsOverlay').style.display = 'flex';
      }
    });
  }
});

/* ==========================================================================
   NETNO WORKS & LIBRARIES CORE INTEGRATION ENGINE (DATABASE SYNCHRONIZATION)
   ========================================================================== */

function getCleanEmailKey(email) {
  return email.replace(/\./g, ',');
}

window.openSteamCreationEngine = function() {
  document.getElementById("userSidebar").style.left = "-260px";
  document.getElementById("creationFormTitle").innerText = "NetNo Works Page // Register Hub Component";
  document.getElementById("submitFormBtn").innerText = "Create page";
  document.getElementById("editGameId").value = "";
  document.getElementById("steamGameForm").reset();
  
  document.getElementById("steamGameThumb").required = true;
  document.getElementById("steamGameScreenshots").required = true;
  document.getElementById("screenshotCountAlert").innerText = "Selected: 0";
  document.getElementById("paidAmountContainer").style.display = "none";
  document.getElementById("priceValidationAlert").style.display = "none";
  
  document.getElementById("steamCreationPanel").style.display = "flex";
};

window.closeSteamCreationEngine = function() {
  document.getElementById("steamCreationPanel").style.display = "none";
};

window.handlePriceTypeChange = function(val) {
  const container = document.getElementById("paidAmountContainer");
  const input = document.getElementById("steamGamePriceAmount");
  if(val === "Paid") {
    container.style.display = "block";
    input.required = true;
  } else {
    container.style.display = "none";
    input.required = false;
    input.value = "";
    document.getElementById("priceValidationAlert").style.display = "none";
  }
};

window.validatePriceLimit = function(input) {
  const alertMsg = document.getElementById("priceValidationAlert");
  if(parseFloat(input.value) > 10000) {
    alertMsg.style.display = "block";
    input.value = 10000;
  } else {
    alertMsg.style.display = "none";
  }
};

window.validateScreenshots = function(input) {
  const label = document.getElementById("screenshotCountAlert");
  const count = input.files.length;
  label.innerText = `Selected: ${count}`;
  if(count > 0 && (count < 2 || count > 10)) {
    alert("Network Protocol Rule: System demands a minimum of 2 and maximum of 10 screenshot files.");
    input.value = "";
    label.innerText = "Selected: 0";
  }
};

async function convertFileToBase64(file) {
  if(!file) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

window.saveSteamGamePage = async function(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if(!user) {
    alert("Authorization Failure: Active developer terminal state missing.");
    return;
  }

  const editId = document.getElementById("editGameId").value;
  const title = document.getElementById("steamGameTitle").value.trim();
  const genre = document.getElementById("steamGameGenre").value;
  const visibility = document.getElementById("steamGameVisibility").value;
  const theme = document.getElementById("steamGameTheme").value;
  const priceType = document.getElementById("steamPriceType").value;
  let priceAmount = document.getElementById("steamGamePriceAmount").value || 0;
  const description = document.getElementById("steamGameDesc").value.trim();
  const landingUrl = document.getElementById("steamGameUrl").value.trim();

  let devShare = 0;
  let platformFee = 0;
  if(priceType === "Paid") {
    const parsedPrice = parseFloat(priceAmount);
    devShare = parsedPrice * 0.70;
    platformFee = parsedPrice * 0.30;
  }

  const thumbFile = document.getElementById("steamGameThumb").files[0];
  const trailerFile = document.getElementById("steamGameTrailer").files[0];
  const screenshotFiles = document.getElementById("steamGameScreenshots").files;

  try {
    let thumbBase64 = null;
    let trailerBase64 = null;
    let screenshotsArray = [];

    if(thumbFile) {
      thumbBase64 = await convertFileToBase64(thumbFile);
    }
    if(trailerFile) {
      trailerBase64 = await convertFileToBase64(trailerFile);
    }
    if(screenshotFiles.length > 0) {
      for(let i=0; i<screenshotFiles.length; i++) {
        const base64Str = await convertFileToBase64(screenshotFiles[i]);
        screenshotsArray.push(base64Str);
      }
    }

    let gameId = editId;
    let existingGameData = null;

    if(editId) {
      const fetchRes = await fetch(`${DATABASE_URL}games/${editId}.json`);
      existingGameData = await fetchRes.json();
    } else {
      gameId = "game_" + Date.now();
    }

    const payload = {
      gameId: gameId,
      developerEmail: user.email,
      title: title,
      genre: genre,
      visibility: visibility,
      theme: theme,
      priceType: priceType,
      priceAmount: priceAmount,
      developerShare: devShare,
      platformFee: platformFee,
      description: description,
      landingUrl: landingUrl,
      thumbnail: thumbBase64 || (existingGameData ? existingGameData.thumbnail : null),
      trailer: trailerBase64 || (existingGameData ? existingGameData.trailer : null),
      screenshots: screenshotsArray.length > 0 ? screenshotsArray : (existingGameData ? existingGameData.screenshots : [])
    };

    const targetUrl = `${DATABASE_URL}games/${gameId}.json`;
    const response = await fetch(targetUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if(response.ok) {
      alert(editId ? "Game ecosystem asset values updated." : "New data structure written inside NetNo Central Matrix.");
      window.closeSteamCreationEngine();
      if(document.getElementById("steamLibraryPanel").style.display === "flex") {
        window.loadDeveloperLibrary();
      }
    } else {
      alert("Transmission Failure: Realtime cloud server rejected payload.");
    }
  } catch(err) {
    alert("Exception standard error catch sequence: " + err.message);
  }
};

window.openSteamLibraryEngine = function() {
  document.getElementById("userSidebar").style.left = "-260px";
  document.getElementById("steamLibraryPanel").style.display = "flex";
  window.loadDeveloperLibrary();
};

window.closeSteamLibraryEngine = function() {
  document.getElementById("steamLibraryPanel").style.display = "none";
};

window.loadDeveloperLibrary = async function() {
  const user = auth.currentUser;
  const container = document.getElementById("steamGamesContainer");
  if(!user) {
    container.innerHTML = "<p style='color:red;'>Access Denied: Terminal session isolated.</p>";
    return;
  }
  container.innerHTML = "<p style='color:#66c0f4;'>Syncing Ecosystem Matrix Stream...</p>";

  try {
    const res = await fetch(`${DATABASE_URL}games.json`);
    const allGames = await res.json();
    container.innerHTML = "";

    if(!allGames) {
      container.innerHTML = "<p style='color:#555;'>No pipeline nodes found in ecosystem mapping.</p>";
      return;
    }

    let devCount = 0;
    for(let key in allGames) {
      const g = allGames[key];
      if(g.developerEmail === user.email) {
        devCount++;
        const card = document.createElement("div");
        card.className = "steam-game-card";
        card.style = "background:#1b2838; border:1px solid #2a475e; border-radius:4px; padding:12px; display:flex; flex-direction:column; gap:8px;";
        
        const thumbSrc = g.thumbnail || "https://www.w3schools.com/howto/img_avatar.png";
        
        card.innerHTML = `
          <img src="${thumbSrc}" style="width:100%; height:120px; object-fit:cover; border-radius:2px;" alt="Thumb">
          <div style="font-weight:bold; color:#fff; font-size:16px;">${g.title}</div>
          <div style="font-size:12px; color:#66c0f4;">Genre: ${g.genre} | ${g.priceType}</div>
          <div style="font-size:11px; color:#a3a3a3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:30px;">${g.description}</div>
          <div style="display:flex; justify-content:space-between; margin-top:auto; gap:6px;">
            <button class="steam-btn-blueprint" style="padding:6px 12px; font-size:12px; background:#476812;" onclick="window.editSteamGamePage('${g.gameId}')">Modify</button>
            <button class="steam-btn-blueprint" style="padding:6px 12px; font-size:12px; background:#a32222;" onclick="window.deleteSteamGamePage('${g.gameId}')">Purge</button>
          </div>
        `;
        container.appendChild(card);
      }
    }

    if(devCount === 0) {
      container.innerHTML = "<p style='color:#71767b;'>You haven't initialized any workspace pages inside the pipeline yet.</p>";
    }
  } catch(err) {
    container.innerHTML = `<p style='color:red;'>Stream Connection Drop Trace: ${err.message}</p>`;
  }
};

window.editSteamGamePage = async function(gameId) {
  try {
    const res = await fetch(`${DATABASE_URL}games/${gameId}.json`);
    const g = await res.json();
    if(!g) return;

    window.openSteamCreationEngine();
    
    document.getElementById("creationFormTitle").innerText = "NetNo Works Page // Modify Registered Resource";
    document.getElementById("submitFormBtn").innerText = "Save changes";
    document.getElementById("editGameId").value = g.gameId;

    document.getElementById("steamGameTitle").value = g.title;
    document.getElementById("steamGameGenre").value = g.genre;
    document.getElementById("steamGameVisibility").value = g.visibility;
    document.getElementById("steamGameTheme").value = g.theme;
    document.getElementById("steamPriceType").value = g.priceType;
    document.getElementById("steamGameDesc").value = g.description;
    document.getElementById("steamGameUrl").value = g.landingUrl || "";

    document.getElementById("steamGameThumb").required = false;
    document.getElementById("steamGameScreenshots").required = false;

    if(g.priceType === "Paid") {
      document.getElementById("paidAmountContainer").style.display = "block";
      document.getElementById("steamGamePriceAmount").value = g.priceAmount;
      document.getElementById("steamGamePriceAmount").required = true;
    } else {
      document.getElementById("paidAmountContainer").style.display = "none";
      document.getElementById("steamGamePriceAmount").required = false;
    }

    if(g.screenshots) {
      document.getElementById("screenshotCountAlert").innerText = `Saved in Matrix: ${g.screenshots.length} (Upload new files to overwrite)`;
    }
  } catch(err) {
    alert("Modification setup failed: " + err.message);
  }
};

window.deleteSteamGamePage = async function(gameId) {
  if(confirm("CRITICAL WARNING ARCHIVE: Are you absolutely sure you want to completely wipe this software asset entry out of existence?")) {
    try {
      const response = await fetch(`${DATABASE_URL}games/${gameId}.json`, {
        method: "DELETE"
      });
      if(response.ok) {
        alert("Software payload entity safely discarded from the grid database.");
        window.loadDeveloperLibrary();
      } else {
        alert("Ecosystem deletion execution drop error.");
      }
    } catch(err) {
      alert("Network transmission system block: " + err.message);
    }
  }
};
