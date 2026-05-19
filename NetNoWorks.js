// --- NETNO STEAMWORKS GAME ADDING MODULE SYSTEM ---
import { getFirestore, collection, addDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

let currentTargetGameDocId = null;

// Dashboard Open karne ka function
window.openCreateGameDashboard = function() {
  document.getElementById("currentGeneratedGameId").innerText = "NOT GENERATED";
  document.getElementById("steamGameForm").reset();
  document.getElementById("logoPreview").innerText = "";
  document.getElementById("screenshotsPreview").innerText = "";
  document.getElementById("uploadProgressContainer").style.display = "none";
  
  // Form ko shuru me lock rakhenge tab tak ID create na ho jaye
  document.getElementById("steamGameForm").style.opacity = "0.3";
  document.getElementById("steamGameForm").style.pointerEvents = "none";
  document.getElementById("initGameIdBtn").style.display = "block";
  
  // Sidebar menu close karo agar open ho toh
  if(document.getElementById("userSidebar")) {
    document.getElementById("userSidebar").style.left = "-260px";
  }
  document.getElementById("gameDashboardOverlay").style.display = "flex";
};

window.closeGameDashboard = function() {
  document.getElementById("gameDashboardOverlay").style.display = "none";
};

// STEP 1: CREATE UNIQUE GAME ID IN FIRESTORE
document.getElementById("initGameIdBtn").addEventListener("click", async () => {
  try {
    const db = getFirestore(); // Catches parent initialization automatically

    document.getElementById("initGameIdBtn").innerText = "Generating ID...";
    document.getElementById("initGameIdBtn").disabled = true;

    // Firestore 'games' collection me entry banao
    const docRef = await addDoc(collection(db, "games"), {
      status: "draft",
      createdAt: new Date(),
      title: "",
      description: "",
      trailer_url: "",
      logo_url: "",
      images: [],
      game_file_url: ""
    });

    // Wahi id game_id field me save karo
    await updateDoc(docRef, { game_id: docRef.id });
    currentTargetGameDocId = docRef.id;
    
    // UI setup and unlock
    document.getElementById("currentGeneratedGameId").innerText = docRef.id;
    document.getElementById("initGameIdBtn").style.display = "none";
    
    // Form unlock karo baaki options bharne ke liye
    document.getElementById("steamGameForm").style.opacity = "1";
    document.getElementById("steamGameForm").style.pointerEvents = "auto";
    
    alert("NetNo Cloud: Unique Game App ID Created Successfully! Form Unlocked.");
  } catch (error) {
    alert("Database Connection Error: " + error.message);
  } finally {
    document.getElementById("initGameIdBtn").innerText = "Initialize New App ID";
    document.getElementById("initGameIdBtn").disabled = false;
  }
});

// STEP 2: UPLOAD ALL MEDIA/FILES AND SAVE
document.getElementById("submitSteamGameBtn").addEventListener("click", async () => {
  if (!currentTargetGameDocId) {
    alert("Invalid Session: No unique App ID selected.");
    return;
  }

  const db = getFirestore();
  const storage = getStorage();

  const title = document.getElementById("steamGameTitle").value.trim();
  const description = document.getElementById("steamGameDesc").value.trim();
  const trailerUrl = document.getElementById("steamTrailerUrl").value.trim();
  
  const logoFile = document.getElementById("steamLogoInput").files[0];
  const screenshotFiles = document.getElementById("steamScreenshotsInput").files;
  const gameBuildFile = document.getElementById("steamGameFileInput").files[0];

  if (!title || !description) {
    alert("Title and Description fields are mandatory.");
    return;
  }

  const progressContainer = document.getElementById("uploadProgressContainer");
  const progressPercentText = document.getElementById("uploadPercentage");
  const progressBar = document.getElementById("uploadProgressBar");
  const statusText = document.getElementById("uploadStatusText");

  progressContainer.style.display = "block";

  try {
    let logoUrl = "";
    let gameFileUrl = "";
    let uploadedScreenshotUrls = [];

    // Custom function to handle upload progress beautifully
    const uploadFilePromise = (file, storagePath, label) => {
      return new Promise((resolve, reject) => {
        statusText.innerText = `Uploading: ${label}...`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on("state_changed", 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.style.width = progress + "%";
            progressPercentText.innerText = Math.round(progress) + "%";
          }, 
          (err) => reject(err), 
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });
    };

    // 1. Logo File Upload Task
    if (logoFile) {
      logoUrl = await uploadFilePromise(logoFile, `games/${currentTargetGameDocId}/logo_${logoFile.name}`, "Logo Badge Image");
    }

    // 2. Multiple Screenshots Upload Task
    if (screenshotFiles.length > 0) {
      for (let i = 0; i < screenshotFiles.length; i++) {
        const url = await uploadFilePromise(screenshotFiles[i], `games/${currentTargetGameDocId}/screenshots/ss_${i}`, `Screenshot [${i+1}/${screenshotFiles.length}]`);
        uploadedScreenshotUrls.push(url);
      }
    }

    // 3. Main Game Executable Build Zip Upload Task
    if (gameBuildFile) {
      gameFileUrl = await uploadFilePromise(gameBuildFile, `games/${currentTargetGameDocId}/build_${gameBuildFile.name}`, "Main Game Binary Bundle");
    }

    // 4. Update Final Data into Firestore Database Document
    statusText.innerText = "Saving data into store grids...";
    const gameDocRef = doc(db, "games", currentTargetGameDocId);
    
    const updatePayload = {
      title: title,
      description: description,
      trailer_url: trailerUrl,
      status: "published" // State changed from draft to published live asset
    };

    if (logoUrl) updatePayload.logo_url = logoUrl;
    if (gameFileUrl) updatePayload.game_file_url = gameFileUrl;
    if (uploadedScreenshotUrls.length > 0) updatePayload.images = uploadedScreenshotUrls;

    await updateDoc(gameDocRef, updatePayload);

    statusText.innerText = "Done!";
    alert("Success! Game compiled and published live on NetNo registry database.");
    window.closeGameDashboard();

  } catch (error) {
    alert("Asset Upload Flow Interrupted: " + error.message);
  } finally {
    progressContainer.style.display = "none";
  }
});

// File change listeners for status updates
document.getElementById("steamLogoInput").addEventListener("change", (e) => {
  if(e.target.files.length > 0) document.getElementById("logoPreview").innerText = `✓ Selected: ${e.target.files[0].name}`;
});
document.getElementById("steamScreenshotsInput").addEventListener("change", (e) => {
  if(e.target.files.length > 0) document.getElementById("screenshotsPreview").innerText = `✓ Total Images Ready: ${e.target.files.length}`;
});
