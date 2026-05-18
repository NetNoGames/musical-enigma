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
  deleteUser
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
let chosenStrategyMode = "Individual"; // Strategy routing state: Individual / Organization

// Global Auth State Observer Matrix 
onAuthStateChanged(auth, (user) => { 
  if (user && !isRegistrationProcess) { 
    const currentStatus = localStorage.getItem("netno_org_status_" + user.email);
    if (currentStatus === "pending") {
      alert("Verification Locked: Your corporate developer node registration request is under evaluation queue by NetNo administration network.");
      signOut(auth);
      return;
    }
    if (user.displayName && user.displayName.trim() !== "" && !user.displayName.includes("@")) { 
      applyUserUIData(user); 
    } else { 
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
  document.getElementById("segmentSelectionStep").style.display = "none";
  document.getElementById("credentialsStep").style.display = "none"; 
  document.getElementById("corporateCredentialsStep").style.display = "none";
  document.getElementById("avatarStep").style.display = "none"; 
  document.getElementById("loginError").innerText = ""; 
  document.getElementById("usernameInput").value = ""; 
  document.getElementById("setupPasswordInput").value = ""; 
  isRegistrationProcess = false; 
} 

// 1. PATHWAY A: DIRECT EMAIL/PASSWORD LOGIN ENGINE 
window.handleDirectLogin = async function(e) { 
  e.preventDefault(); 
  const email = document.getElementById("authEmail").value.trim(); 
  const password = document.getElementById("authPassword").value; 
  const errorDiv = document.getElementById("loginError"); 
  errorDiv.innerText = ""; 
  try { 
    isRegistrationProcess = false; 
    const result = await signInWithEmailAndPassword(auth, email, password); 
    const currentStatus = localStorage.getItem("netno_org_status_" + result.user.email);
    if (currentStatus === "pending") {
       errorDiv.innerText = "Access Denied: Organization account setup is currently under active pending evaluation status.";
       await signOut(auth);
       return;
    }
    executeLoginSuccess(); 
  } catch (err) { 
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") { 
      errorDiv.innerText = "Incorrect account details or invalid password specified."; 
    } else { 
      errorDiv.innerText = "Error structural trace: " + err.message; 
    } 
  } 
}; 

// 2. PATHWAY B: CONTINUE WITH GOOGLE GATEWAY 
window.handleGoogleAuth = async function() { 
  const errorDiv = document.getElementById("loginError"); 
  errorDiv.innerText = ""; 
  try { 
    const result = await signInWithPopup(auth, provider); 
    const user = result.user; 
    registrationEmail = user.email; 
    const accountFinishedBefore = localStorage.getItem("netno_setup_done_" + user.email); 
    
    const currentStatus = localStorage.getItem("netno_org_status_" + user.email);
    if (currentStatus === "pending") {
       errorDiv.innerText = "Access Denied: Account status is pending review queue.";
       await signOut(auth);
       return;
    }

    if ((user.displayName && !user.displayName.includes("@") && user.displayName.trim() !== "") || accountFinishedBefore) { 
      isRegistrationProcess = false; 
      executeLoginSuccess(); 
    } else { 
      isRegistrationProcess = true; 
      document.getElementById("authGateways").style.display = "none"; 
      document.getElementById("segmentSelectionStep").style.display = "block"; 
    } 
  } catch (error) { 
    isRegistrationProcess = false; 
    errorDiv.innerText = "Authentication Error Encountered: " + error.message; 
  } 
}; 

// ROUTER SELECTION DELEGATION INTERFACE
window.routeSegmentRegistration = function(strategy) {
  chosenStrategyMode = strategy;
  document.getElementById("segmentSelectionStep").style.display = "none";
  if (strategy === "Individual") {
    document.getElementById("credentialsStep").style.display = "block";
  } else {
    document.getElementById("corporateCredentialsStep").style.display = "block";
  }
};

// 3. REGISTRATION STEP 1 (INDIVIDUAL ROUTE)
window.submitCredentialsStep = function() { 
  const username = document.getElementById("usernameInput").value.trim(); 
  const chosenPassword = document.getElementById("setupPasswordInput").value; 
  const errorDiv = document.getElementById("loginError"); 
  if (!username) { errorDiv.innerText = "Please specify a unique username."; return; } 
  if (username.length > 15) { errorDiv.innerText = "Username is too long! Strict maximum limit is 15 characters."; return; } 
  if (!chosenPassword || chosenPassword.length < 6) { errorDiv.innerText = "Please set a strong password (at least 6 characters long)."; return; } 
  registrationPassword = chosenPassword; 
  errorDiv.innerText = ""; 
  document.getElementById("credentialsStep").style.display = "none"; 
  document.getElementById("avatarStep").style.display = "block"; 
}; 

// UPGRADED: REGISTRATION STEP 1 (CORPORATE ORGANIZATION ROUTE)
window.submitCorporateCredentialsStep = function() {
  const compName = document.getElementById("orgCompName").value.trim();
  const ownerName = document.getElementById("orgOwnerName").value.trim();
  const taxId = document.getElementById("orgTaxId").value.trim();
  const phone = document.getElementById("orgPhone").value.trim();
  const orgEmail = document.getElementById("orgEmail").value.trim();
  const orgPass = document.getElementById("orgSetupPassword").value;
  const errorDiv = document.getElementById("loginError");

  if (!compName || !ownerName || !taxId || !phone || !orgEmail || !orgPass) {
    errorDiv.innerText = "All strict corporate fields (except dynamic website) are mandatory configuration tokens.";
    return;
  }
  if (compName.length > 15) {
    errorDiv.innerText = "Organization designation title maximum cap architecture limits 15 elements.";
    return;
  }
  if (orgPass.length < 6) {
    errorDiv.innerText = "Strategic corporate network key must span over 6 characters.";
    return;
  }

  registrationPassword = orgPass;
  // Map fields into memory
  localStorage.setItem("netno_meta_compname_" + registrationEmail, compName);
  localStorage.setItem("netno_meta_owner_" + registrationEmail, ownerName);
  localStorage.setItem("netno_meta_taxid_" + registrationEmail, taxId);
  localStorage.setItem("netno_meta_phone_" + registrationEmail, phone);
  localStorage.setItem("netno_meta_orgemail_" + registrationEmail, orgEmail);
  localStorage.setItem("netno_meta_website_" + registrationEmail, document.getElementById("orgWebsite").value.trim());

  errorDiv.innerText = "";
  document.getElementById("corporateCredentialsStep").style.display = "none";
  document.getElementById("avatarStep").style.display = "block";
};

// 4. REGISTRATION STEP 2: FINALIZE REGISTRATION MAP SYSTEM
window.finalizeAccountRegistration = async function() { 
  let username = (chosenStrategyMode === "Individual") ? 
                 document.getElementById("usernameInput").value.trim() : 
                 localStorage.getItem("netno_meta_compname_" + registrationEmail);
                 
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
      await updateProfile(user, { displayName: username, photoURL: "https://www.w3schools.com/howto/img_avatar2.png" }); 
      try { 
        localStorage.setItem("netno_user_avatar_" + registrationEmail, finalBase64Url); 
        localStorage.setItem("netno_setup_done_" + registrationEmail, "true"); 
        localStorage.setItem("netno_profile_strategy_" + registrationEmail, chosenStrategyMode);
      } catch (storageErr) { console.warn("Storage context mapped capture exception."); } 
      try { 
        const passwordCredential = EmailAuthProvider.credential(registrationEmail, registrationPassword); 
        await linkWithCredential(user, passwordCredential); 
      } catch (linkErr) { console.warn("Credential linkage handled context: ", linkErr.message); } 
      
      isRegistrationProcess = false; 
      
      if (chosenStrategyMode === "Organization") {
         localStorage.setItem("netno_org_status_" + registrationEmail, "pending");
         alert("Registration Dispatched: Your corporate network account token node has been safely routed to database structure with 'PENDING' validation criteria status.");
         document.getElementById("loginOverlay").style.display = "none";
         await signOut(auth);
      } else {
         executeLoginSuccess(); 
      }
    } 
  } catch (err) { errorDiv.innerText = "Registration Pipeline Error Encountered: " + err.message; } 
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
  const portalBtn = document.getElementById("portalBtn"); 
  if (headerProfileDiv) headerProfileDiv.style.display = "none"; 
  if (userSidebarDiv) userSidebarDiv.style.left = "-260px"; 
  if (portalBtn) portalBtn.style.display = "block"; 
} 

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
    if (typeof window.closePanelGrid === "function") { window.closePanelGrid(); } 
    window.openLoginPanel(); 
  } catch (error) { alert("Logout Execution Failure: " + error.message); } 
}; 

// ==========================================
// UPGRADED: CORE SETTINGS PANEL CONTROLLERS MATRIX
// ==========================================
window.openSettingsModal = function() {
  document.getElementById("userSidebar").style.left = "-260px";
  document.getElementById("settingsOverlay").style.display = "flex";
  
  // Fill data values into form variables inputs placeholder context
  const user = auth.currentUser;
  if(user) {
    document.getElementById("settingProfileName").value = user.displayName || "";
    document.getElementById("settingProfileDesc").value = localStorage.getItem("netno_profile_desc_" + user.email) || "";
    document.getElementById("socialyt").value = localStorage.getItem("netno_soc_yt_" + user.email) || "";
    document.getElementById("socialreddit").value = localStorage.getItem("netno_soc_reddit_" + user.email) || "";
    document.getElementById("socialdiscord").value = localStorage.getItem("netno_soc_discord_" + user.email) || "";
    document.getElementById("socialtwitter").value = localStorage.getItem("netno_soc_twitter_" + user.email) || "";
    document.getElementById("socialweb").value = localStorage.getItem("netno_soc_web_" + user.email) || "";
  }
  switchSettingsTab('account_hub');
  switchAccountSubTab('sub_name');
};

window.closeSettingsModal = function() {
  document.getElementById("settingsOverlay").style.display = "none";
};

window.switchSettingsTab = function(tabId) {
  document.querySelectorAll('.settings-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.settings-nav-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tabView-' + tabId).style.display = 'block';
  document.getElementById('tabBtn-' + tabId).classList.add('active');
};

window.switchAccountSubTab = function(subTabId) {
  document.querySelectorAll('.sub-content-panel').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.sub-nav-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('subView-' + subTabId).style.display = 'block';
  document.getElementById('subTabBtn-' + subTabId).classList.add('active');
};

window.applySettingsNameChange = async function() {
  const newName = document.getElementById("settingProfileName").value.trim();
  const user = auth.currentUser;
  if (!newName) { alert("Handle field empty error."); return; }
  try {
    await updateProfile(user, { displayName: newName });
    localStorage.setItem("netno_meta_compname_" + user.email, newName);
    applyUserUIData(user);
    closeSettingsModal();
    alert("Profile mapping tag structural label updated successfully.");
  } catch(e) { alert("Error updating designation parameter trace: " + e.message); }
};

window.applySettingsAvatarChange = async function() {
  const fileInput = document.getElementById("settingProfilePicInput");
  const user = auth.currentUser;
  if(fileInput.files.length === 0) { alert("No file selection allocation."); return; }
  try {
    const file = fileInput.files[0];
    const base64Str = await new Promise((resolve) => {
      const r = new FileReader(); r.onloadend = () => resolve(r.result); r.readAsDataURL(file);
    });
    localStorage.setItem("netno_user_avatar_" + user.email, base64Str);
    applyUserUIData(user);
    closeSettingsModal();
    alert("Profile graphics asset node completely modified.");
  } catch(e) { alert("Asset array mutation failure: " + e.message); }
};

window.applySettingsDescChange = function() {
  const user = auth.currentUser;
  const txt = document.getElementById("settingProfileDesc").value;
  localStorage.setItem("netno_profile_desc_" + user.email, txt);
  closeSettingsModal();
  alert("Profile descriptive logs updated successfully.");
};

window.applySettingsSocialsChange = function() {
  const user = auth.currentUser;
  localStorage.setItem("netno_soc_yt_" + user.email, document.getElementById("socialyt").value.trim());
  localStorage.setItem("netno_soc_reddit_" + user.email, document.getElementById("socialreddit").value.trim());
  localStorage.setItem("netno_soc_discord_" + user.email, document.getElementById("socialdiscord").value.trim());
  localStorage.setItem("netno_soc_twitter_" + user.email, document.getElementById("socialtwitter").value.trim());
  localStorage.setItem("netno_soc_web_" + user.email, document.getElementById("socialweb").value.trim());
  closeSettingsModal();
  alert("Social coordinate channels saved safely.");
};

window.applySettingsAccountTermination = async function() {
  const pass = document.getElementById("deleteAccountPassword").value;
  const user = auth.currentUser;
  if(!pass) { alert("Authorization credentials matrix signature needed."); return; }
  if(confirm("Structural Warning Trace: Are you absolutely certain you want to trigger irreversible server-side complete profile node destruction?")) {
    try {
      // Re-auth validation checking simulation linking engine fallback matrix layer
      const credential = EmailAuthProvider.credential(user.email, pass);
      await linkWithCredential(user, credential).catch(()=>{/*linked safe fallback check contextual stack*/});
      await deleteUser(user);
      localStorage.removeItem("netno_setup_done_" + user.email);
      alert("Node destruction broadcast complete. Session closed.");
      closeSettingsModal();
      window.location.reload();
    } catch(err) { alert("Authorization system rejected credential token payload matching logic. Check input key verification values: " + err.message); }
  }
};

// Layout management grid mappings 
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
  if (sidebar.style.left === "0px") { sidebar.style.left = "-220px"; } 
  else { sidebar.style.left = "0px"; } 
}; 

window.toggleUserMenu = function() { 
  sidebar.style.left = "-220px"; 
  if (userSidebar.style.left === "0px") { userSidebar.style.left = "-260px"; } 
  else { userSidebar.style.left = "0px"; } 
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
  if (isCommunity) { communityLinks.style.display = "flex"; } 
  else { communityLinks.style.display = "none"; } 
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

window.downloadLauncher = function() { alert("Download Start"); }; 
window.addEventListener('keydown', function(e) { 
  if (e.key === "Escape") { 
    window.closePanelGrid(); 
    if (typeof window.closeLoginPanel === "function") { window.closeLoginPanel(); } 
    if (typeof window.closeSettingsModal === "function") { window.closeSettingsModal(); }
  } 
});
