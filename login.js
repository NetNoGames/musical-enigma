// self-running safe script
(function () {


  window.addEventListener("load", () => {


    // agar already login ho chuka hai to popup mat dikha
    if (localStorage.getItem("loggedIn") === "true") return;


    // popup create
    let popup = document.createElement("div");
    popup.id = "loginPopup";


    popup.innerHTML = `
      <div id="loginBox">
        <h2>Login Required</h2>
        <button id="loginBtn">Login with Google</button>
      </div>
    `;


    document.body.appendChild(popup);


    // styles (safe - kisi aur ko affect nahi karega)
    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100%";
    popup.style.height = "100%";
    popup.style.background = "rgba(0,0,0,0.7)";
    popup.style.display = "flex";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    popup.style.zIndex = "999999";


    let box = popup.querySelector("#loginBox");
    box.style.background = "#111";
    box.style.padding = "20px";
    box.style.borderRadius = "10px";
    box.style.textAlign = "center";
    box.style.color = "white";


    let btn = popup.querySelector("#loginBtn");
    btn.style.padding = "10px 20px";
    btn.style.background = "#00aaff";
    btn.style.border = "none";
    btn.style.color = "white";
    btn.style.cursor = "pointer";


    // login click
    btn.onclick = () => {
      localStorage.setItem("loggedIn", "true"); // remember login
      popup.style.display = "none";
    };


  });


})();