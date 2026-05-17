import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

window.openLoginPanel = function () {

  document.getElementById("loginOverlay").style.display = "flex";

  document.getElementById("sidebar").style.left = "-220px";
};

window.closeLoginPanel = function () {

  document.getElementById("loginOverlay").style.display = "none";
};

window.toggleAuthView = function (view) {

  const form = document.getElementById("emailFormView");

  const title = document.getElementById("authBoxTitle");

  const button = document.getElementById("emailSubmitBtn");

  const toggle = document.getElementById("toggleAuthText");

  if (view === "register") {

    form.dataset.mode = "register";

    title.innerText = "Create Account";

    button.innerText = "Register";

    toggle.innerHTML =
      `Already have account?
       <span onclick="toggleAuthView('login')">
       Login
       </span>`;

  } else {

    form.dataset.mode = "login";

    title.innerText = "Developer Terminal";

    button.innerText = "Verify Access";

    toggle.innerHTML =
      `New Developer?
       <span onclick="toggleAuthView('register')">
       Create Account
       </span>`;
  }
};

window.handleEmailAuth = function (event) {

  event.preventDefault();

  const email =
    document.getElementById("authEmail").value;

  const password =
    document.getElementById("authPassword").value;

  const mode =
    document.getElementById("emailFormView").dataset.mode;

  const error =
    document.getElementById("loginError");

  error.style.display = "none";

  if (mode === "register") {

    createUserWithEmailAndPassword(auth, email, password)

      .then(() => {

        toggleAuthView("login");

        alert("Account Created");

      })

      .catch((err) => {

        error.style.display = "block";

        error.innerText = err.message;
      });

  } else {

    signInWithEmailAndPassword(auth, email, password)

      .then(() => {

        closeLoginPanel();

        alert("Login Success");

      })

      .catch(() => {

        error.style.display = "block";

        error.innerText = "Invalid Credentials";
      });
  }
};

window.handleGoogleAuth = function () {

  signInWithPopup(auth, googleProvider)

    .then(() => {

      closeLoginPanel();

      alert("Google Login Success");
    })

    .catch(() => {

      document.getElementById("loginError").style.display = "block";

      document.getElementById("loginError").innerText =
        "Google Login Failed";
    });
};

window.handleUsernameSubmission = function (event) {

  event.preventDefault();

  const username =
    document.getElementById("profileUsername").value;

  updateProfile(auth.currentUser, {

    displayName: username

  }).then(() => {

    alert("Username Saved");

    closeLoginPanel();
  });
};

onAuthStateChanged(auth, (user) => {

  if (user) {

    console.log("Logged In:", user.email);

  } else {

    console.log("No User");
  }
});
