import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {

  getAuth,

  GoogleAuthProvider,

  signInWithPopup,

  signInWithEmailAndPassword,

  createUserWithEmailAndPassword,

  updateProfile

}

from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


// FIREBASE CONFIG

const firebaseConfig = {

  apiKey: "AIzaSyBoM6X--8Hhl9imrtYtgNeyomHLwk1RO6w",

  authDomain: "netno-games-d8580.firebaseapp.com",

  projectId: "netno-games-d8580",

  storageBucket: "netno-games-d8580.firebasestorage.app",

  messagingSenderId: "571332011408",

  appId: "1:571332011408:web:b40acafe4f258e4183bf15"
};


// INIT

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

let googleUser = null;


// OPEN PANEL

window.openLoginPanel = function(){

  document.getElementById("loginOverlay").style.display = "flex";

  document.getElementById("downloadBtn").style.display = "none";

  document.getElementById("portalBtn").style.display = "none";

  document.getElementById("sidebar").style.left = "-220px";
};


// CLOSE PANEL

window.closeLoginPanel = function(){

  document.getElementById("loginOverlay").style.display = "none";

  document.getElementById("downloadBtn").style.display = "block";

  document.getElementById("portalBtn").style.display = "block";
};


// GOOGLE LOGIN

window.googleLogin = async function(){

  try{

    const result =
    await signInWithPopup(auth, provider);

    googleUser = result.user;

    // SHOW SETUP BOX

    document.getElementById("loginForm").style.display = "none";

    document.getElementById("setupBox").style.display = "block";

  }

  catch(error){

    document.getElementById("loginError").innerText =
    error.message;
  }
};


// FINISH GOOGLE ACCOUNT

window.finishGoogleSetup = async function(){

  const username =
  document.getElementById("setupUsername").value;

  try{

    await updateProfile(googleUser, {

      displayName: username

    });

    loginSuccess();

  }

  catch(error){

    document.getElementById("loginError").innerText =
    error.message;
  }
};


// EMAIL LOGIN

window.emailLogin = async function(e){

  e.preventDefault();

  const email =
  document.getElementById("loginEmail").value;

  const password =
  document.getElementById("loginPassword").value;

  try{

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    loginSuccess();

  }

  catch{

    try{

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      loginSuccess();

    }

    catch(error){

      document.getElementById("loginError").innerText =
      error.message;
    }
  }
};


// SUCCESS

function loginSuccess(){

  document.getElementById("loginOverlay").style.display = "none";

  openPanel('developerportal.png', false);
}
