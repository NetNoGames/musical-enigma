// ===== Community Panel Script (Separate) =====

// elements
let panelImg = document.getElementById("panelImg");
let communityButtons = document.getElementById("communityButtons");

// observe image change (jab panel change hota hai)
const observer = new MutationObserver(() => {
  if (!panelImg || !communityButtons) return;

  // check kaunsa panel open hai
  if (panelImg.src.includes("communitypanels.png")) {
    communityButtons.style.display = "block";
  } else {
    communityButtons.style.display = "none";
  }
});

// start observing
if (panelImg) {
  observer.observe(panelImg, { attributes: true, attributeFilter: ["src"] });
}

// buttons
let discordBtn = document.getElementById("discordBtn");
let redditBtn = document.getElementById("redditBtn");

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
