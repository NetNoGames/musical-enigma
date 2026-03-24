function toggleMenu(){
  let s=document.getElementById("sidebar");
  s.style.left = (s.style.left==="0px") ? "-250px" : "0px";
}


function openPanel(img){
  window.open(img,"_blank");
}


function download(){
  window.open("https://drive.google.com/","_blank");
}