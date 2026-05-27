let sidebar = document.getElementById("sidebar");

/* TOGGLE MENU */
function toggleMenu(){

  if(sidebar.style.left === "0px"){
    sidebar.style.left = "-220px";
  }else{
    sidebar.style.left = "0px";
  }

}

/* CLOSE SIDEBAR */
function closeSidebar(){
  sidebar.style.left = "-220px";
}

/* DOWNLOAD */
function downloadLauncher(){
  alert("Download Started");
}

/* ESC CLOSE */
window.addEventListener("keydown", function(e){

  if(e.key === "Escape"){
    sidebar.style.left = "-220px";
  }

});
