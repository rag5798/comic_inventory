import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ path: './server.env' });

const app = express();
const port = 3000;

// Enable CORS for development
app.use(cors({
  origin: ['http://localhost:5000', 'http://127.0.0.1:5000']
}));

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const myAPIkey = process.env.API_KEY;

// Proxy search by category (series/year)
app.get("/api/comic", async (req, res) => {
  try {
    const category = req.query.category || "series";
    const searchTerm = req.query.search || "";

    let apiUrl = '';

    if (category === "year") {
      apiUrl = `https://comicvine.gamespot.com/api/volumes/?api_key=${myAPIkey}&format=json&limit=20&filter=start_year:${searchTerm}&sort=start_date:desc`;
    } else {
      apiUrl = `https://comicvine.gamespot.com/api/volumes/?api_key=${myAPIkey}&format=json&limit=100&filter=name:${searchTerm}&sort=start_date:desc`;
    }

    console.log("Proxying ComicVine API:", apiUrl);

    const response = await axios.get(apiUrl);

    res.json(response.data);
  } catch (error) {
    console.error("Comic API error:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});


// Proxy issues from a volume by URL
app.get("/api/issue", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "Missing URL parameter" });

    const apiUrl = `${url}?api_key=${myAPIkey}&format=json`;
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error("Issue API error:", error.message);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Comic API proxy server running at http://localhost:${port}`);
});
