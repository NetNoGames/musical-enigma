function toggleMenu() {
  let sidebar = document.getElementById("sidebar");
  sidebar.style.left = sidebar.style.left === "0px" ? "-220px" : "0px";
}

function openPanel(img) {
  alert("Open panel: " + img);
}

function downloadLauncher() {
  alert("Downloading launcher...");
}
