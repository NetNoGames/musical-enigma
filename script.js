function toggleMenu() {
  let sidebar = document.getElementById("sidebar");
  sidebar.style.left = sidebar.style.left === "0px" ? "-200px" : "0px";
}

function openPanel(image) {
  document.getElementById("mainImage").src = image;
}

function downloadLauncher() {
  window.open("https://drive.google.com/YOUR_LINK_HERE");
}
