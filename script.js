import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBRbN6XYOtQwjfVDhpV2b0cWHAEkE7WzkI",
  authDomain: "project-reporting-system-fb8dd.firebaseapp.com",
  projectId: "project-reporting-system-fb8dd",
  storageBucket: "project-reporting-system-fb8dd.firebasestorage.app",
  messagingSenderId: "151125446322",
  appId: "1:151125446322:web:76aaba843bb0850376c3ab",
  measurementId: "G-NXKZLSDLPN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Initialize Firestore
const auth = getAuth(app); // Initialize Authentication

// Elements
const loginContainer = document.getElementById("login-container");
const reportContainer = document.getElementById("report-container");
const adminPanel = document.getElementById("admin-panel");
const loginButton = document.getElementById("login-button");
const submitReportButton = document.getElementById("submit-report-button");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const projectReportInput = document.getElementById("project-report");
const errorMessage = document.getElementById("error-message");
const reportsList = document.getElementById("reports-list");

// Login function
loginButton.addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username === "admin") {
        // Admin login using Firebase Authentication
        signInWithEmailAndPassword(auth, `${username}@example.com`, password)
            .then((userCredential) => {
                loginContainer.style.display = 'none';
                adminPanel.style.display = 'block';
                loadReports();
            })
            .catch((error) => {
                errorMessage.textContent = error.message;
            });
    } else {
        // Authenticate user from Firestore
        const q = query(collection(db, 'users'), where("username", "==", username));
        getDocs(q)
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    if (password === userDoc.data().password) {
                        loginContainer.style.display = 'none';
                        reportContainer.style.display = 'block';
                    } else {
                        errorMessage.textContent = "Incorrect password.";
                    }
                } else {
                    errorMessage.textContent = "User not found.";
                }
            })
            .catch((error) => {
                errorMessage.textContent = error.message;
            });
    }
});

// Submit report function
submitReportButton.addEventListener("click", () => {
  const user = auth.currentUser;
  const projectReport = projectReportInput.value;
  const username = usernameInput.value;

  if (username && projectReport) {
    db.collection("reports")
      .add({
        username: username,
        report: projectReport,
        date: new Date().toLocaleDateString(),
      })
      .then(() => {
        alert("Report submitted successfully!");
        projectReportInput.value = "";
      })
      .catch((error) => {
        alert("Error submitting report: " + error.message);
      });
  } else {
    alert("Please write a report.");
  }
});

// Load reports for admin panel
function loadReports() {
  db.collection("reports")
    .get()
    .then((querySnapshot) => {
      reportsList.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const report = doc.data();
        const reportItem = document.createElement("div");
        reportItem.textContent = `Username: ${report.username}, Report: ${report.report}, Date: ${report.date}`;
        reportsList.appendChild(reportItem);
      });
    })
    .catch((error) => {
      alert("Error loading reports: " + error.message);
    });
}
