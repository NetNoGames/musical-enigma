let sidebar = document.getElementById("sidebar");
let panel = document.getElementById("panel");
let panelImg = document.getElementById("panelImg");
let downloadBtn = document.getElementById("downloadBtn");
let portalBtn = document.getElementById("portalBtn");
let communityLinks = document.getElementById("communityLinks");


function toggleMenu() {
  if (sidebar.style.left === "0px") {
    sidebar.style.left = "-220px";
  } else {
    sidebar.style.left = "0px";
  }
}


// Open panel handler that checks specifically for Community overlays
function openPanel(img, isCommunity) {
  panel.style.display = "block";
  panelImg.src = img;


  // Front layers hide logic
  downloadBtn.style.display = "none";
  portalBtn.style.display = "none";
  sidebar.style.left = "-220px";


  // Check unique community parameters toggle conditions
  if (isCommunity) {
    communityLinks.style.display = "flex";
  } else {
    communityLinks.style.display = "none";
  }
}


function closePanelGrid() {
  panel.style.display = "none";
  communityLinks.style.display = "none";
  downloadBtn.style.display = "block";
  portalBtn.style.display = "block";
}


// Click background tracking overlay reset pattern
function closePanelOnOverlay(event) {
  if (event.target.id === "panel" || event.target.className === "panel-content-wrapper") {
    closePanelGrid();
  }
}


// ESC Key Trigger Support
window.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    closePanelGrid();
  }
});


function downloadLauncher() {
  alert("Download Start");
}