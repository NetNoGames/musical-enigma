// script.js

let sidebar = document.getElementById("sidebar");

function toggleMenu(){

  if(sidebar.style.left === "0px"){
    sidebar.style.left = "-240px";
  }else{
    sidebar.style.left = "0px";
  }

}

function openTrailer(){

  alert("Trailer Coming Soon");

}

window.addEventListener("click", function(e){

  if(
    !sidebar.contains(e.target) &&
    !e.target.classList.contains("menu-btn")
  ){
    sidebar.style.left = "-240px";
  }

});
