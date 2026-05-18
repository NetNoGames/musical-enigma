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
  sendPasswordResetEmail
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

onAuthStateChanged(auth, (user) => { 
  if (user && !isRegistrationProcess) { 
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
    errorDiv.innerText = "Incorrect account details or invalid password specified."; 
  } 
}; 

window.handleGoogleAuth = async function() { 
  const errorDiv = document.getElementById("loginError"); 
  errorDiv.innerText = ""; 
  try { 
    const result = await signInWithPopup(auth, provider); 
    const user = result.user; 
    registrationEmail = user.email; 
    const accountFinishedBefore = localStorage.getItem("netno_setup_done_" + user.email); 

    if ((user.displayName && !user.displayName.includes("@") && user.displayName.trim() !== "") || accountFinishedBefore) { 
      isRegistrationProcess = false; 
      executeLoginSuccess(); 
    } else { 
      isRegistrationProcess = true; 
      document.getElementById("authGateways").style.display = "none"; 
      document.getElementById("credentialsStep").style.display = "block"; 
    } 
  } catch (error) { 
    isRegistrationProcess = false; 
    errorDiv.innerText = "Authentication Error: " + error.message; 
  } 
}; 

window.submitCredentialsStep = function() { 
  const username = document.getElementById("usernameInput").value.trim(); 
  const chosenPassword = document.getElementById("setupPasswordInput").value; 
  const errorDiv = document.getElementById("loginError"); 
  if (!username) { errorDiv.innerText = "Please specify a unique username."; return; } 
  if (username.length > 15) { errorDiv.innerText = "Username strict limit is 15 characters."; return; } 
  if (!chosenPassword || chosenPassword.length < 6) { errorDiv.innerText = "Please set password (at least 6 characters long)."; return; } 
  registrationPassword = chosenPassword; 
  errorDiv.innerText = ""; 
  document.getElementById("credentialsStep").style.display = "none"; 
  document.getElementById("avatarStep").style.display = "block"; 
}; 

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
      await updateProfile(user, { displayName: username, photoURL: "https://www.w3schools.com/howto/img_avatar.png" }); 
      try { 
        localStorage.setItem("netno_user_avatar_" + registrationEmail, finalBase64Url); 
        localStorage.setItem("netno_setup_done_" + registrationEmail, "true"); 
      } catch (storageErr) { console.warn("Storage context full exception handled."); } 
      
      try { 
        const passwordCredential = EmailAuthProvider.credential(registrationEmail, registrationPassword); 
        await linkWithCredential(user, passwordCredential); 
      } catch (linkErr) { console.warn("Credential linkage handled context: ", linkErr.message); } 
      
      isRegistrationProcess = false; 
      executeLoginSuccess(); 
    } 
  } catch (err) { errorDiv.innerText = "Registration Pipeline Error: " + err.message; } 
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
    if (typeof window.closePanelGrid === "function") { window.closePanelGrid(); } 
    window.openLoginPanel(); 
  } catch (error) { alert("Logout Execution Failure: " + error.message); } 
}; 

// MAPPED SETTINGS OPERATIONS
window.openSettingsModal = function() {
  document.getElementById("userSidebar").style.left = "-260px";
  document.getElementById("settingsOverlay").style.display = "flex";
  
  const user = auth.currentUser;
  if(user) {
    document.getElementById("settingProfileName").value = user.displayName || "";
    document.getElementById("settingProfileDesc").value = localStorage.getItem("netno_profile_desc_" + user.email) || "";
  }
  switchSettingsTab('control_core');
  switchAccountSubTab('core_name');
};

window.closeSettingsModal = function() {
  document.getElementById("settingsOverlay").style.display = "none";
};

window.switchSettingsTab = function(tabId) {
  document.querySelectorAll('.settings-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.settings-nav-btn').forEach(el => el.classList.remove('active'));
  const targetView = document.getElementById('tabView-' + tabId);
  const targetBtn = document.getElementById('tabBtn-' + tabId);
  if(targetView) targetView.style.display = 'block';
  if(targetBtn) targetBtn.classList.add('active');
};

window.switchAccountSubTab = function(subTabId) {
  document.querySelectorAll('.sub-content-panel').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.sub-nav-btn').forEach(el => el.classList.remove('active'));
  const targetSubView = document.getElementById('subView-' + subTabId);
  const targetSubBtn = document.getElementById('subTabBtn-' + subTabId);
  if(targetSubView) targetSubView.style.display = 'block';
  if(targetSubBtn) targetSubBtn.classList.add('active');
};

window.applySettingsNameChange = async function() {
  const newName = document.getElementById("settingProfileName").value.trim();
  const user = auth.currentUser;
  if (!newName) { alert("Name mapping empty field error."); return; }
  try {
    await updateProfile(user, { displayName: newName });
    applyUserUIData(user);
    closeSettingsModal();
    alert("Profile configurations updated safely.");
  } catch(e) { alert("Matrix config modification crash: " + e.message); }
};

window.applySettingsAvatarChange = async function() {
  const fileInput = document.getElementById("settingProfilePicInput");
  const user = auth.currentUser;
  if(fileInput.files.length === 0) { alert("Please allocate image graphic file."); return; }
  try {
    const file = fileInput.files[0];
    const base64Str = await new Promise((resolve) => {
      const r = new FileReader(); r.onloadend = () => resolve(r.result); r.readAsDataURL(file);
    });
    localStorage.setItem("netno_user_avatar_" + user.email, base64Str);
    applyUserUIData(user);
    closeSettingsModal();
    alert("Profile graphics asset recompiled successfully.");
  } catch(e) { alert("Asset array data mutation exception: " + e.message); }
};

window.applySettingsDescChange = function() {
  const user = auth.currentUser;
  const txt = document.getElementById("settingProfileDesc").value;
  localStorage.setItem("netno_profile_desc_" + user.email, txt);
  closeSettingsModal();
  alert("Log entry modified.");
};

window.applySettingsAccountTermination = async function() {
  const pass = document.getElementById("deleteAccountPassword").value;
  const user = auth.currentUser;
  if(!pass) { alert("Authorization password verification code required."); return; }
  if(confirm("Structural System Check: Are you absolutely certain you want to destroy this user node?")) {
    try {
      const credential = EmailAuthProvider.credential(user.email, pass);
      await linkWithCredential(user, credential).catch(()=>{});
      await deleteUser(user);
      localStorage.removeItem("netno_setup_done_" + user.email);
      localStorage.removeItem("netno_user_avatar_" + user.email);
      alert("Account data destroyed. Connection aborted.");
      closeSettingsModal();
      window.location.reload();
    } catch(err) { alert("Credential validation mismatch: " + err.message); }
  }
};

// PASSWORD RESET TRANSLATION LINK FUNCTION
window.triggerResetKeyForDeletion = async function() {
  const user = auth.currentUser;
  if (!user || !user.email) {
    alert("System Failure: Logged-in profile sequence data not discovered.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, user.email);
    alert("Reset Link Sent! Aapke register email (" + user.email + ") par secure connection password link deploy kar diya gaya hai. Reset karne ke baad naye password se node entry permanently terminate kar sakte hain.");
  } catch (err) {
    alert("Token delivery matrix exception trace: " + err.message);
  }
};

// Layout configurations
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
