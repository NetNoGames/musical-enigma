let sidebar = document.getElementById("sidebar"); 
let userSidebar = document.getElementById("userSidebar"); 
let panel = document.getElementById("panel"); 
let panelImg = document.getElementById("panelImg"); 
let downloadBtn = document.getElementById("downloadBtn"); 
let portalBtn = document.getElementById("portalBtn"); 
let communityLinks = document.getElementById("communityLinks"); 
let userProfileHeader = document.getElementById("userProfileHeader"); 

window.toggleMenu = function() { 
  userSidebar.style.left = "-260px"; 
  if (sidebar.style.left === "0px") { 
    sidebar.style.left = "-220px"; 
  } else { 
    sidebar.style.left = "0px"; 
  } 
}; 

window.toggleUserMenu = function() { 
  sidebar.style.left = "-220px"; 
  if (userSidebar.style.left === "0px") { 
    userSidebar.style.left = "-260px"; 
  } else { 
    userSidebar.style.left = "0px"; 
  } 
}; 

window.openPanel = function(img, isCommunity) { 
  panel.style.display = "block"; 
  panelImg.src = img; 
  downloadBtn.style.display = "none"; 
  
  // FIXED: Blue portal button logged in state me bhi visible rahega hamesha!
  portalBtn.style.display = "block"; 
  
  sidebar.style.left = "-220px"; 
  userSidebar.style.left = "-260px"; 

  // FIXED: Icon condition handling layer trace
  if (img === 'developerportal.png') { 
    const imgEl = document.getElementById("headerProfilePic");
    if (imgEl && imgEl.getAttribute('src') !== "" && imgEl.getAttribute('src') !== null) { 
      if (userProfileHeader) userProfileHeader.style.display = "block"; 
    } 
  } else { 
    if (userProfileHeader) userProfileHeader.style.display = "none"; 
  } 

  if (isCommunity) { 
    communityLinks.style.display = "flex"; 
  } else { 
    communityLinks.style.display = "none"; 
  } 
}; 

window.closePanelGrid = function() { 
  panel.style.display = "none"; 
  communityLinks.style.display = "none"; 
  downloadBtn.style.display = "block"; 
  userSidebar.style.left = "-260px"; 
  if (userProfileHeader) userProfileHeader.style.display = "none"; 
  portalBtn.style.display = "block"; 
}; 

window.closePanelOnOverlay = function(event) { 
  if (event.target.id === "panel" || event.target.className === "panel-content-wrapper") { 
    window.closePanelGrid(); 
  } 
}; 

window.downloadLauncher = function() { 
  alert("Download Start"); 
}; 

window.addEventListener('keydown', function(e) { 
  if (e.key === "Escape") { 
    window.closePanelGrid(); 
    if (typeof window.closeLoginPanel === "function") { 
      window.closeLoginPanel(); 
    } 
  } 
});
