import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
}
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {

  apiKey: "AIzaSyBoM6X--8Hhl9imrtYtgNeyomHLwk1RO6w",

  authDomain: "netno-games-d8580.firebaseapp.com",

  projectId: "netno-games-d8580",

  storageBucket: "netno-games-d8580.firebasestorage.app",

  messagingSenderId: "571332011408",

  appId: "1:571332011408:web:b40acafe4f258e4183bf15"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

window.openLoginPanel = function () {

  document.getElementById("loginOverlay").style.display = "flex";

  document.getElementById("sidebar").style.left = "-220px";
};

window.closeLoginPanel = function () {

  document.getElementById("loginOverlay").style.display = "none";
};

window.handleGoogleAuth = function () {

  signInWithPopup(auth, provider)

  .then(() => {

    document.getElementById("usernameSection").style.display = "block";

    document.getElementById("authForm").style.display = "none";

  })

  .catch((error) => {

    document.getElementById("loginError").innerText =
    error.message;
  });
};

document.getElementById("authForm")

.addEventListener("submit", function(e){

  e.preventDefault();

  const email =
  document.getElementById("authEmail").value;

  const password =
  document.getElementById("authPassword").value;

  signInWithEmailAndPassword(auth, email, password)

  .then(() => {

    closeLoginPanel();

    openPanel('developerportal.png', false);

  })

  .catch(() => {

    createUserWithEmailAndPassword(auth, email, password)

    .then(() => {

      document.getElementById("usernameSection").style.display = "block";

      document.getElementById("authForm").style.display = "none";

    })

    .catch((error) => {

      document.getElementById("loginError").innerText =
      error.message;
    });
  });
});

window.saveUsername = function () {

  const username =
  document.getElementById("usernameInput").value;

  updateProfile(auth.currentUser, {

    displayName: username

  })

  .then(() => {

    closeLoginPanel();

    openPanel('developerportal.png', false);

  });
};
