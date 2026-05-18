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

// Flow Controller States Matrix
let activeWorkflowMode = ""; // "individual" or "organization"
let registrationEmail = ""; 
let registrationPassword = ""; 
let isRegistrationProcess = false; 
let chosenUsername = "";

onAuthStateChanged(auth, (user) => { 
  // Agar organization dynamic node pending pe hai, toh block clear rkhna h
  const pendingCheck = localStorage.getItem("netno_org_pending_" + (user ? user.email : ""));
  if (user && pendingCheck === "true") {
    isRegistrationProcess = true;
    document.getElementById("authGateways").style.display = "none";
    document.getElementById("approvalPendingStep").style.display = "block";
    return;
  }

  if (user && !isRegistrationProcess) { 
    applyUserUIData(user); 
  } else if (!user) { 
    resetGlobalSessionUI(); 
  } 
}); 

window.openLoginPanel = function() { 
  const user = auth.currentUser; 
  if (user) {
    const pendingCheck = localStorage.getItem("netno_org_pending_" + user.email);
    if(pendingCheck === "true") {
      document.getElementById("loginOverlay").style.display = "flex"; 
      document.getElementById("authGateways").style.display = "none"; 
      document.getElementById("approvalPendingStep").style.display = "block";
      return;
    }
    if(user.displayName && !isRegistrationProcess) {
      executeLoginSuccess(); 
      return; 
    }
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
  document.getElementById("orgCredentialsStep").style.display = "none";
  document.getElementById("avatarStep").style.display = "none"; 
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
    
    // Core structure pending lock validation
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

// INDIVIDUAL AUR ORGANIZATION BUTTON MATRIX ROUTER LINK
window.triggerRouteAuth = async function(selectedMode) {
  activeWorkflowMode = selectedMode;
  const errorDiv = document.getElementById("loginError"); 
  errorDiv.innerText = ""; 
  try { 
    // Isse user ko account/email select karne ka window forced clear dikhega
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
      // Agar account unlinked fresh hai, toh selected mode ke anusaar box pop-up hoga
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
    errorDiv.innerText = "Authentication Failure: " + error.message; 
  } 
};

// INDIVIDUAL CONFIG CONTINUE PROCESSING
window.submitCredentialsStep = function() { 
  const username = document.getElementById("usernameInput").value.trim(); 
  const chosenPassword = document.getElementById("setupPasswordInput").value; 
  const errorDiv = document.getElementById("loginError"); 
  if (!username) { 
    errorDiv.innerText = "Please specify a unique username."; 
    return; 
  } 
  if (username.length > 15) { 
    errorDiv.innerText = "Username strict limit is 15 characters."; 
    return; 
  } 
  if (!chosenPassword || chosenPassword.length < 6) { 
    errorDiv.innerText = "Please set security password (at least 6 characters long)."; 
    return; 
  } 
  chosenUsername = username;
  registrationPassword = chosenPassword; 
  errorDiv.innerText = ""; 
  document.getElementById("credentialsStep").style.display = "none"; 
  document.getElementById("avatarStep").style.display = "block"; 
}; 

// ORGANIZATION CONFIG CONTINUE PROCESSING
window.submitOrgCredentialsStep = function() {
  const compName = document.getElementById("orgCompanyName").value.trim();
  const ownerName = document.getElementById("orgOwnerName").value.trim();
  const taxId = document.getElementById("orgTaxId").value.trim();
  const phone = document.getElementById("orgPhone").value.trim();
  const email = document.getElementById("orgEmail").value.trim();
  const website = document.getElementById("orgWebsite").value.trim();
  const chosenPassword = document.getElementById("orgPasswordInput").value;
  const errorDiv = document.getElementById("loginError");

  if(!compName || !ownerName || !taxId || !phone || !email || !chosenPassword) {
    errorDiv.innerText = "Please populate all corporate mandatory fields.";
    return;
  }
  if (chosenPassword.length < 6) {
    errorDiv.innerText = "Security validation password must be >= 6 characters.";
    return;
  }

  // Local storage mapping configurations
  localStorage.setItem("netno_org_comp_" + registrationEmail, compName);
  localStorage.setItem("netno_org_owner_" + registrationEmail, ownerName);
  localStorage.setItem("netno_org_tax_" + registrationEmail, taxId);
  localStorage.setItem("netno_org_phone_" + registrationEmail, phone);
  localStorage.setItem("netno_org_email_" + registrationEmail, email);
  localStorage.setItem("netno_org_web_" + registrationEmail, website);

  chosenUsername = compName; 
  registrationPassword = chosenPassword; 

  errorDiv.innerText = "";
  document.getElementById("orgCredentialsStep").style.display = "none";
  document.getElementById("avatarStep").style.display = "block";
};

// FINAL REGISTRATION AND GRAPHICAL ASSET COMPILATION BINDING
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
      // Link security key passwords parameters base
      await updateProfile(user, { displayName: chosenUsername, photoURL: "https://www.w3schools.com/howto/img_avatar.png" }); 
      try { 
        localStorage.setItem("netno_user_avatar_" + registrationEmail, finalBase64Url); 
        localStorage.setItem("netno_setup_done_" + registrationEmail, "true"); 
      } catch (storageErr) { 
        console.warn("Storage resource quota context exception."); 
      } 
      try { 
        const passwordCredential = EmailAuthProvider.credential(registrationEmail, registrationPassword); 
        await linkWithCredential(user, passwordCredential); 
      } catch (linkErr) { 
        console.warn("Credential binding route caught: ", linkErr.message); 
      } 
      
      // Verification workflow conditional route
      document.getElementById("avatarStep").style.display = "none";
      if (activeWorkflowMode === "organization") {
        localStorage.setItem("netno_org_pending_" + registrationEmail, "true");
        document.getElementById("approvalPendingStep").style.display = "block";
      } else {
        isRegistrationProcess = false; 
        executeLoginSuccess(); 
      }
    } 
  } catch (err) { 
    errorDiv.innerText = "Pipeline Allocation Processing Error: " + err.message; 
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
    alert("Logout Execution Failure: " + error.message); 
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
    alert("Username target parameter cannot be blank."); 
    return; 
  } 
  try { 
    await updateProfile(user, { displayName: newName }); 
    applyUserUIData(user); 
    document.getElementById("usernameSubPanel").style.display = "none"; 
    document.getElementById("settingsOverlay").style.display = "flex"; 
    alert("Username updated successfully."); 
  } catch(e) { 
    alert("Config matrix trace modification failure: " + e.message); 
  } 
}; 

window.applySettingsAvatarChange = async function() { 
  const fileInput = document.getElementById("settingProfilePicInput"); 
  const user = auth.currentUser; 
  if(fileInput.files.length === 0) { 
    alert("Please allocate graphical input resource target file."); 
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
    alert("Profile graphics asset recompiled."); 
  } catch(e) { 
    alert("Exception error trace handled: " + e.message); 
  } 
}; 

window.applySettingsDescChange = function() { 
  const user = auth.currentUser; 
  if(!user) return; 
  const txt = document.getElementById("settingProfileDesc").value; 
  localStorage.setItem("netno_profile_desc_" + user.email, txt); 
  document.getElementById("bioSubPanel").style.display = "none"; 
  document.getElementById("settingsOverlay").style.display = "flex"; 
  alert("Bio description database logs written safely."); 
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
  alert("Social coordinate transmission arrays updated."); 
}; 

// CRITICAL ENFORCED PASSWORD VERIFICATION DELETION SYSTEM
window.applySettingsAccountTermination = async function() { 
  const pass = document.getElementById("deleteAccountPassword").value; 
  const user = auth.currentUser; 
  if(!pass) { 
    alert("Password input authentication key required."); 
    return; 
  } 
  if(confirm("Structural Warning Trace: Are you entirely sure you want to delete this profile node?")) { 
    try { 
      const credential = EmailAuthProvider.credential(user.email, pass); 
      await reauthenticateWithCredential(user, credential);
      
      await deleteUser(user); 
      localStorage.removeItem("netno_setup_done_" + user.email); 
      localStorage.removeItem("netno_user_avatar_" + user.email); 
      localStorage.removeItem("netno_org_pending_" + user.email);
      alert("Profile deletion complete. Session aborted."); 
      document.getElementById("deleteSubPanel").style.display = "none"; 
      window.location.reload(); 
    } catch(err) { 
      alert("Invalid password specified. Termination rejected."); 
    } 
  } 
}; 

window.triggerResetKeyForDeletion = async function() { 
  const user = auth.currentUser; 
  if (!user || !user.email) { 
    alert("Error: Active user profile sequence data matrix not discovered."); 
    return; 
  } 
  const targetEmail = user.email; 
  try { 
    await sendPasswordResetEmail(auth, targetEmail); 
    alert("Reset Link Dispatched! Aapke logged-in email id (" + targetEmail + ") par password update transmission payload deploy ho gaya hai."); 
  } catch (err) { 
    alert("Token delivery exception trace: " + err.message); 
  } 
}; 

// Global Layout Management 
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
  alert("Download Start"); 
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
