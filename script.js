// Sidebar and Panel Elements Setup
let sidebar = document.getElementById("sidebar");
let panel = document.getElementById("panel");
let panelImg = document.getElementById("panelImg");
let downloadBtn = document.getElementById("downloadBtn");
let portalBtn = document.getElementById("portalBtn");

// Toggle navigation drawer logic
function toggleMenu() {
  if (sidebar.style.left === "0px") {
    sidebar.style.left = "-220px";
  } else {
    sidebar.style.left = "0px";
  }
}

// Open custom overlay panel
function openPanel(imgSrc) {
  panel.style.display = "block";
  panelImg.src = imgSrc;
  
  // Hide homepage default primary action buttons
  downloadBtn.style.display = "none";
  portalBtn.style.display = "none";
  sidebar.style.left = "-220px"; // Auto close navigation on selection
}

// Close viewport dynamic module on key triggers
window.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    closePanelGrid();
  }
});

// Click anywhere outside image to close panel frame
function closePanelOnOverlay(event) {
  if (event.target.id === "panel" || event.target.className === "panel-container") {
    closePanelGrid();
  }
}

function closePanelGrid() {
  panel.style.display = "none";
  downloadBtn.style.display = "block";
  portalBtn.style.display = "block";
}

function downloadLauncher() {
  alert("NetNo Games Launcher Download Initiated!");
}
