import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, limit, getDocs, startAfter } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

  

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDIlhcrxxoMF3GmGZai4oFzEu_4z1Pc_YE",
  authDomain: "comicinventory-a82a8.firebaseapp.com",
  projectId: "comicinventory-a82a8",
  storageBucket: "comicinventory-a82a8.appspot.com",
  messagingSenderId: "598618744401",
  appId: "1:598618744401:web:07ad1a5e70fd66f0193a70"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const output = document.getElementById("store-output");

let lastVisible = null;
const pageSize = 10;
let isLoading = false;

async function loadStoreComics(initial = false) {
    if (isLoading) return;
    isLoading = true;
    const loadBtn = document.getElementById("load-more");
    loadBtn.disabled = true;
    loadBtn.textContent = "Loading...";
    let q;

    if (lastVisible) {
    q = query(
        collection(db, "comics"),
        where("store", "==", true),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(pageSize)
    );
    } else {
    q = query(
        collection(db, "comics"),
        where("store", "==", true),
        orderBy("createdAt", "desc"),
        limit(pageSize)
    );
    }
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        document.getElementById("load-more").style.display = "none";
        return;
    }

    lastVisible = snapshot.docs[snapshot.docs.length - 1];

    snapshot.forEach(doc => {
        const comic = doc.data();

        const card = document.createElement("section");
        const img = document.createElement("img");
        const name = document.createElement("h3");
        const desc = document.createElement("p");
        const link = document.createElement("a");

        img.src = comic.cover;
        name.textContent = `${comic.name} #${comic.issue_number}`;
        desc.innerHTML = comic.description || "No description available.";
        link.href = comic.ebay_url || "#";
        link.textContent = "Buy on eBay";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(desc);
        card.appendChild(link);

        output.appendChild(card);
    });
    isLoading = false;
    loadBtn.disabled = false;
    loadBtn.textContent = "Load More";
}  
loadStoreComics(true);


document.getElementById("load-more").addEventListener("click", () => {
    loadStoreComics(false);
});