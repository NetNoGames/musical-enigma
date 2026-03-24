function toggleMenu() {
  let sidebar = document.getElementById("sidebar");
  if (sidebar.style.right === "0px") {
    sidebar.style.right = "-220px";
  } else {
    sidebar.style.right = "0px";
  }
}


function openPanel(img) {
  window.location.href = img;
}


function downloadLauncher() {
  alert("Download Started!");
}