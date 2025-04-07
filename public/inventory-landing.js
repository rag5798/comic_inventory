import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
window.auth = getAuth(app);
onAuthStateChanged(window.auth, (user) => {
if (!user) {
    // Redirect if not logged in
    window.location.href = "index.html";
}
});
  

// Fetch single issue data
async function fetch_issue(url) {
    try {
      const response = await fetch(`https://api.gmancomics.org/api/issue?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return { success: true, data: data.results };
    } catch (error) {
        console.error('Error fetching issue:', error);
        return { success: false, error };
    }
}

// Display single issue
function display_issue(data, volume, output_section) {
    const section = document.createElement('section');
    const img = document.createElement('img');
    const name = document.createElement('p');
    const description = document.createElement('p');
    const year = document.createElement('p');
    const addButton = document.createElement('button');

    img.src = data.image.medium_url || '';
    name.textContent = `${data.volume.name || 'Unknown'} #${data.issue_number}`;
    name.setAttribute('data-series', `${data.volume.name}`)
    name.setAttribute('data-issuenum', `${data.issue_number}`)
    name.setAttribute('data-volume', `${volume}`)
    description.innerHTML = data.description || 'No description available.';
    year.textContent = `Cover date: ${data.cover_date || 'Unknown'}`;
    addButton.textContent = "Add to Inventory";
    addButton.classList.add('add-button'); 

    section.appendChild(img);
    section.appendChild(name);
    section.appendChild(addButton)
    section.appendChild(description);
    section.appendChild(year);

    output_section.appendChild(section);

    addButton.addEventListener('click', async () => {
        const user = window.auth?.currentUser;
        if (!user) {
          alert("You must be logged in to save inventory.");
          return;
        }
      
        // ✅ Get Firestore and user data
        const userDocRef = doc(db, "users", user.uid);
        const snap = await getDoc(userDocRef);
      
        if (!snap.exists()) {
          alert("User profile not found.");
          return;
        }
      
        const userData = snap.data();

        let ebay_url = null;
        if (userData.isAdmin) {
            const url = prompt("Enter eBay link:");
            ebay_url = url?.startsWith("http") ? url : null;
        }
      
        const comicToSave = {
            api_id: data.id,
            name: data.volume.name,
            issue_number: data.issue_number,
            volume: volume,
            description: data.description,
            cover: data.image.medium_url,
            year: new Date(data.cover_date).getFullYear(),
            uid: user.uid,
            store: userData.isAdmin,
            ebay_url: ebay_url,
            createdAt: new Date()
        };
      
        try {
            await addDoc(collection(db, "comics"), comicToSave);
            alert("Comic added to inventory!");
            addButton.disabled = true;
            addButton.textContent = "Saved!";
        } catch (err) {
            console.error("Error saving comic:", err);
            alert("Failed to save comic.");
        }
      });
}

// Get volume and its issues
async function get_volume(event) {
    const output_section = document.querySelector('#output');

    const url = event.target.dataset.url;

    try {
      const response = await fetch(`https://api.gmancomics.org/api/issue?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        console.log('Received volume data:', data);

        const header = document.createElement('h2');
        header.textContent = `Issues in ${data.results.name} ${data.results.deck || ""}`;
        output_section.appendChild(header);

        for (const issue of data.results.issues) {
            const result = await fetch_issue(issue.api_detail_url);
            console.log(result)
            if (result.success) {
              display_issue(result.data, data.results.name, output_section);
            } else {
              const errorMsg = document.createElement('p');
              errorMsg.style.color = 'red';
              errorMsg.textContent = `Error fetching issue: ${result.error.message}`;
              output_section.appendChild(errorMsg);
            }
          
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {
        console.error('Error fetching volume issues:', error);
        output_section.innerHTML = `<p style="color:red;">Error fetching volume data: ${error.message}</p>`;
    }
}




async function get_comic(event) {
    event.preventDefault();
  
    const user = window.auth?.currentUser;
    if (!user) {
      alert("You must be logged in to search.");
      return;
    }
  
    const output_section = document.querySelector('#output');
    output_section.innerHTML = '';
  
    const dropdown = document.querySelector('#category');
    const searchbar = document.querySelector('#searchbar');
    
    const category = dropdown.value;
    const searchTerm = searchbar.value;
  
    const url = `https://api.gmancomics.org/api/comic?category=${category}&search=${encodeURIComponent(searchTerm)}`;
  
    try {
      const server_response = await fetch(url);
      const server_json = await server_response.json();
  
      console.log(server_json);
  
      server_json.results.forEach(element => {
        const section = document.createElement('section');
        const img = document.createElement('img');
        const name = document.createElement('p');
        const description = document.createElement('p');
        const year = document.createElement('p');
        const seriesButton = document.createElement('button');
  
        img.src = element.image.medium_url;
        name.textContent = element.name;
        name.setAttribute('data-url', element.api_detail_url);
        name.classList.add('name');
        description.innerHTML = element.description || 'No description available.';
        year.textContent = `Year: ${element.start_year || 'Unknown'}`;
        addButton.textContent = "Expand Series";
        addButton.classList.add('add-button'); 
  
        section.appendChild(img);
        section.appendChild(name);
        section.appendChild(description);
        section.appendChild(year);
        output_section.appendChild(section);
      });
  
      const links = document.querySelectorAll('.add-button');
      links.forEach(el => el.addEventListener('click', get_volume));
    } catch (err) {
      console.error("Error fetching comic data:", err);
      output_section.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
}


document.querySelector('#search_form').addEventListener('submit', get_comic)