import {
getFirestore, collection, query, where, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

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
const auth = getAuth(app);

const output = document.getElementById("inventory-output");
const userInfo = document.getElementById("user-info");
const groupBtn = document.getElementById("group-toggle");

let groupBySeries = false;

groupBtn.addEventListener("click", () => {
    groupBySeries = !groupBySeries;
    groupBtn.textContent = groupBySeries ? "Ungroup Series" : "Group by Series";
    loadInventory(); // refresh view
});

async function loadInventory() {
    output.innerHTML = ""; // clear

    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "comics"), where("uid", "==", user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        output.innerHTML = "<p>You haven't added any comics yet.</p>";
        return;
    }

    const comics = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));

    if (groupBySeries) {
        const grouped = {};

        comics.forEach(comic => {
        const series = comic.name || "Unknown Series";
        if (!grouped[series]) grouped[series] = [];
        grouped[series].push(comic);
        });

        Object.entries(grouped).forEach(([series, seriesComics]) => {
        const groupSection = document.createElement("section");
        const header = document.createElement("h2");
        header.textContent = series;
        groupSection.appendChild(header);

        seriesComics.forEach(comic => {
            const card = renderComicCard(comic);
            groupSection.appendChild(card);
        });

        output.appendChild(groupSection);
        });
    } else {
        comics.forEach(comic => {
        const card = renderComicCard(comic);
        output.appendChild(card);
        });
    }
}

function renderComicCard(comic) {
    const card = document.createElement("section");
    const img = document.createElement("img");
    const name = document.createElement("h3");
    const desc = document.createElement("p");
    const remove = document.createElement("button");

    img.src = comic.cover;
    name.textContent = `${comic.name} #${comic.issue_number}`;
    desc.innerHTML = comic.description || "No description";
    remove.textContent = "Remove from Inventory";
    remove.classList.add("remove-button");

    remove.addEventListener("click", async () => {
        if (confirm("Remove this comic from your inventory?")) {
        await deleteDoc(doc(db, "comics", comic.id));
        loadInventory(); // refresh
        }
    });

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(desc);
    card.appendChild(remove);

    return card;
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        output.innerHTML = "<p>Please log in to view your inventory.</p>";
        return;
    }

    userInfo.innerHTML = `<p>Logged in as <strong>${user.displayName}</strong></p>`;
    loadInventory();
});

document.querySelector('.title').addEventListener("click", () => {
    window.location.href = 'index.html'
})
