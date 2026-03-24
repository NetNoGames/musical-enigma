let sidebar = document.getElementById("sidebar");
let panel = document.getElementById("panel");
let panelImg = document.getElementById("panelImg");
let downloadBtn = document.getElementById("downloadBtn");
let portalBtn = document.getElementById("portalBtn");

function toggleMenu() {
  sidebar.style.left = sidebar.style.left === "0px" ? "-220px" : "0px";
}

function openPanel(img) {
  panel.style.display = "block";
  panelImg.src = img;

  downloadBtn.style.display = "none";
  portalBtn.style.display = "none";

  sidebar.style.left = "-220px";
}

function downloadLauncher() {
  alert("Download Start");
}
