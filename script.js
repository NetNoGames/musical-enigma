// script.js - Core Navigation Control Engine & Global Module Bridges

let sidebar = document.getElementById("sidebar");
let panel = document.getElementById("panel");
let panelImg = document.getElementById("panelImg");
let downloadBtn = document.getElementById("downloadBtn");
let portalBtn = document.getElementById("portalBtn");
let communityLinks = document.getElementById("communityLinks");


// 1. Sidebar Open/Close Feature (Global Scope)
window.toggleMenu = function() {
  if (sidebar.style.left === "0px") {
    sidebar.style.left = "-220px";
  } else {
    sidebar.style.left = "0px";
  }
};


// 2. Standard Screenshot/Community Panels Manager (Global Scope)
window.openPanel = function(img, isCommunity) {
  panel.style.display = "block";
  panelImg.src = img;

  // Front UI layers hide logic
  downloadBtn.style.display = "none";
  portalBtn.style.display = "none";
  sidebar.style.left = "-220px";

  // Check unique community parameters toggle conditions
  if (isCommunity) {
    communityLinks.style.display = "flex";
  } else {
    communityLinks.style.display = "none";
  }
};


// 3. Grid Panel Reset System (Global Scope)
window.closePanelGrid = function() {
  panel.style.display = "none";
  communityLinks.style.display = "none";
  downloadBtn.style.display = "block";
  portalBtn.style.display = "block";
};


// 4. Background Click Detection Reset Handler (Global Scope)
window.closePanelOnOverlay = function(event) {
  if (event.target.id === "panel" || event.target.className === "panel-content-wrapper") {
    window.closePanelGrid();
  }
};


// 5. ESC Key Universal Exit Support (Closes active modules + login boxes)
window.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    window.closePanelGrid();
    
    // Agar login overlay open hai to use bhi close karega
    if (typeof window.closeLoginPanel === "function") {
      window.closeLoginPanel();
    }
  }
});


// 6. Launcher Download Action Simulation
window.downloadLauncher = function() {
  alert("Download Start");
};
