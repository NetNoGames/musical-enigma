// ===== Elements =====
let sidebar = document.getElementById("sidebar");
let panel = document.getElementById("panel");
let panelImg = document.getElementById("panelImg");
let downloadBtn = document.getElementById("downloadBtn");
let portalBtn = document.getElementById("portalBtn");

// Community buttons
let communityButtons = document.getElementById("communityButtons");
let discordBtn = document.getElementById("discordBtn");
let redditBtn = document.getElementById("redditBtn");

// ===== Menu Toggle =====
function toggleMenu() {
  sidebar.style.left = sidebar.style.left === "0px" ? "-220px" : "0px";
}

// ===== Panel Open =====
function openPanel(img) {
  panel.style.display = "block";
  panelImg.src = img;

  // hide main buttons
  if (downloadBtn) downloadBtn.style.display = "none";
  if (portalBtn) portalBtn.style.display = "none";

  // hide community buttons by default
  if (communityButtons) {
    communityButtons.style.display = "none";
  }

  // show only when community panel
  if (img === "communitypanels.png") {
    if (communityButtons) {
      communityButtons.style.display = "block";
    }
  }

  // close sidebar
  sidebar.style.left = "-220px";
}

// ===== Download =====
function downloadLauncher() {
  alert("Download Start");
}

// ===== Community Button Links =====
if (discordBtn) {
  discordBtn.onclick = () => {
    window.open("https://discord.gg/PTbxu9nPZq", "_blank");
  };
}

if (redditBtn) {
  redditBtn.onclick = () => {
    window.open("https://www.reddit.com/r/NetNoGamesCommunity/s/TuFLVwt7Ii", "_blank");
  };
}
