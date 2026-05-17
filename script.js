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

function openPanel(img, isCommunity) {
  panel.style.display = "block";
  panelImg.src = img;

  // Clear focus states
  downloadBtn.style.display = "none";
  portalBtn.style.display = "none";
  sidebar.style.left = "-220px";

  // Interface verification conditions
  if (isCommunity) {
    communityLinks.style.display = "flex";
  } else {
    communityLinks.style.display = "none";
  }
}

function downloadLauncher() {
  alert("Download Start");
}

// Navigation back function default reset loop
window.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    panel.style.display = "none";
    communityLinks.style.display = "none";
    downloadBtn.style.display = "block";
    portalBtn.style.display = "block";
  }
});
