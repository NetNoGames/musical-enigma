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

// Global Architecture Routing Engines States
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
      document.getElementById("credentialsStep").style.display = "none";
      document.getElementById("orgCredentialsStep").style.display = "none";
      document.getElementById("avatarStep").style.display = "none";
      document.getElementById("orgAvatarStep").style.display = "none";
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

// ROUTER PIPELINE ACCORDING TO USER EVENT SELECTION
window.triggerRouteAuth = async function(selectedMode) {
  activeWorkflowMode = selectedMode;
  const errorDiv = document.getElementById("loginError"); 
  errorDiv.innerText = ""; 
  try { 
    // Force email choices window view on every trigger event
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

// INDIVIDUAL SAVE GATEWAY CONTROLLER
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

// ORGANIZATION METADATA STORAGE GATEWAY CONTROLLER
window.submitOrgCredentialsStep = function() {
  const compName = document.getElementById("orgCompanyName").value.trim();
  const ownerName = document.getElementById("orgOwnerName").value.trim();
  const taxId = document.getElementById("orgTaxId").value.trim();
  const phone = document.getElementById("orgPhone").value.trim();
  const email = document.getElementById("orgEmail").value.trim();
  const errorDiv = document.getElementById("loginError");

  if(!compName || !ownerName || !taxId || !phone || !email) {
    errorDiv.innerText = "All corporate parameter data fields are required.";
    return;
  }

  localStorage.setItem("netno_org_comp_" + registrationEmail, compName);
  localStorage.setItem("netno_org_owner_" + registrationEmail, ownerName);
  localStorage.setItem("netno_org_tax_" + registrationEmail, taxId);
  localStorage.setItem("netno_org_phone_" + registrationEmail, phone);
  localStorage.setItem("netno_org_email_" + registrationEmail, email);

  chosenUsername = compName; 

  errorDiv.innerText = "";
  document.getElementById("orgCredentialsStep").style.display = "none";
  document.getElementById("orgAvatarStep").style.display = "block";
};

// FINALIZE INDIVIDUAL PROFILE COMPILATION
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
        console.warn("Link operation catched natively: ", linkErr.message); 
      } 
      isRegistrationProcess = false; 
      executeLoginSuccess(); 
    } 
  } catch (err) { 
    errorDiv.innerText = "Pipeline File Matrix Compilation Error: " + err.message; 
  } 
}; 

// FINALIZE ORGANIZATION BLOCK & FREEZE TO APPROVAL STATUS PANEL SCREEN
window.finalizeOrgAccountRegistration = async function() {
  const fileInput = document.getElementById("orgAvatarFileInput");
  const chosenPassword = document.getElementById("orgPasswordInput").value;
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";

  if(!chosenPassword || chosenPassword.length < 6) {
    errorDiv.innerText = "Security password requires a minimum of 6 characters.";
    return;
  }

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
      registrationPassword = chosenPassword;
      await updateProfile(user, { displayName: chosenUsername, photoURL: "https://www.w3schools.com/howto/img_avatar.png" });
      localStorage.setItem("netno_user_avatar_" + registrationEmail, finalBase64Url);
      localStorage.setItem("netno_setup_done_" + registrationEmail, "true");
      
      try {
        const passwordCredential = EmailAuthProvider.credential(registrationEmail, registrationPassword);
        await linkWithCredential(user, passwordCredential);
      } catch (linkErr) {
        console.warn("Credential link operational bypass: ", linkErr.message);
      }

      localStorage.setItem("netno_org_pending_" + registrationEmail, "true");
      document.getElementById("orgAvatarStep").style.display = "none";
      document.getElementById("approvalPendingStep").style.display = "block";
    }
  } catch(err) {
    errorDiv.innerText = "Enterprise Registration Compilation Error: " + err.message;
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

// ACCOUNT DELETION SYSTEM ENFORCED VIA SET PASSWORD IN PREVIOUS REGISTRATION STEPS
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

// UI Visual States Interfaces Link Controllers
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
  alert("Starting NetNo System Downloader Hub Integration Link..."); 
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
