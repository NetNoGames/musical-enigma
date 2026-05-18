let sidebar = document.getElementById("sidebar");
let userSidebar = document.getElementById("userSidebar");
let panel = document.getElementById("panel");
let panelImg = document.getElementById("panelImg");
let downloadBtn = document.getElementById("downloadBtn");
let portalBtn = document.getElementById("portalBtn");
let communityLinks = document.getElementById("communityLinks");
let userProfileHeader = document.getElementById("userProfileHeader");

window.toggleMenu = function() {
  userSidebar.style.left = "-260px"; // Close dashboard side menu
  if (sidebar.style.left === "0px") {
    sidebar.style.left = "-220px";
  } else {
    sidebar.style.left = "0px";
  }
};

window.toggleUserMenu = function() {
  sidebar.style.left = "-220px"; // Close main right sidebar
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
  portalBtn.style.display = "none";
  sidebar.style.left = "-220px";
  userSidebar.style.left = "-260px";

  // PROFILE ICON SEGREGATION FIX: Safe Isolation from other panels
  if (img === 'developerportal.png') {
     // Icon tabhi on hoga jab panel developer portal ka khulega
     if(userProfileHeader.getAttribute('data-logged') !== "false") {
        userProfileHeader.style.display = "block";
     }
  } else {
     userProfileHeader.style.display = "none"; // Baki kisi bhi dusre image panel me hide rahega icon
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
  userProfileHeader.style.display = "none"; // Hide completely outside the view

  if (userProfileHeader.style.borderColor === "white" || portalBtn.style.display === "none") {
     // Agar active state running nahi hai tabhi main trigger on karein
     if(document.getElementById("headerProfilePic").src === "") {
        portalBtn.style.display = "block";
     } else {
        portalBtn.style.display = "block"; // Portal main button keeps working fine globally
     }
  }
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
  }
});
