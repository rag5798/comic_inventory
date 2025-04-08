import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, setDoc, serverTimestamp  } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyDIlhcrxxoMF3GmGZai4oFzEu_4z1Pc_YE",
  authDomain: "comicinventory-a82a8.firebaseapp.com",
  projectId: "comicinventory-a82a8",
  storageBucket: "comicinventory-a82a8.appspot.com",
  messagingSenderId: "598618744401",
  appId: "1:598618744401:web:07ad1a5e70fd66f0193a70"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


document.querySelector('.login').addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, "users", user.uid);
    const snap = await getDoc(userDocRef);

    if (!snap.exists()) {
      await setDoc(userDocRef, {
        name: user.displayName,
        email: user.email,
        isAdmin: false,
        joined: serverTimestamp()
      });
    }

  } catch (error) {
    console.error("Login failed:", error);
  }
});

document.getElementById('logout').addEventListener('click', () => {
  signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  const loginBtn = document.querySelector('.login');
  const profile = document.getElementById('profile');
  const nameSpan = document.getElementById('user-name');
  const pic = document.getElementById('user-pic');

  if (user) {
    loginBtn.style.display = "none";
    profile.style.display = "flex";
    nameSpan.textContent = user.displayName;
    pic.src = user.photoURL;
  } else {
    loginBtn.style.display = "inline-block";
    profile.style.display = "none";
  }
});

document.getElementById('visit-store').addEventListener('click', () => {
  window.location.href = '/store.html';
});

document.getElementById('visit-inventory').addEventListener('click', () => {
  window.location.href = '/inventory.html';
});

document.getElementById('visit-search').addEventListener('click', () => {
  window.location.href = '/inventory-landing.html';
});
