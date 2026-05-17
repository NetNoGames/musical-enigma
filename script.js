let sidebar = document.getElementById("sidebar");
let panel = document.getElementById("panel");
let panelImg = document.getElementById("panelImg");
let downloadBtn = document.getElementById("downloadBtn");
let portalBtn = document.getElementById("portalBtn");
let communityLinks = document.getElementById("communityLinks");

function toggleMenu() {
  // Clear toggle verification fix
  if (sidebar.style.left === "0px") {
    sidebar.style.left = "-220px";
  } else {
    sidebar.style.left = "0px";
  }
}

// Updated openPanel function to pass handles for Community conditions
function openPanel(img, isCommunity) {
  panel.style.display = "block";
  panelImg.src = img;

  // Main page elements hide karenge
  downloadBtn.style.display = "none";
  portalBtn.style.display = "none";
  sidebar.style.left = "-220px";

  // Check unique overlay conditions
  if (isCommunity) {
    communityLinks.style.display = "flex";
  } else {
    communityLinks.style.display = "none";
  }
}

function downloadLauncher() {
  alert("Download Start");
}

// Close panel functionality agar user background pe click kare to (Optional Feature)
window.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    panel.style.display = "none";
    communityLinks.style.display = "none";
    downloadBtn.style.display = "block";
    portalBtn.style.display = "block";
  }
});
