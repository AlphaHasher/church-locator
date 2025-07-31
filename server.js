require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const locations = require("./churchLocations");

const app = express();
const PORT = 3000;
let numberOfUsers = 0; // Counter for tracking user lookups

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Geocode function to get lat/lon from address
async function geocodeAddress(address) {
  const apiKey = process.env.MAPS_API_KEY;
  const url = `https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (Array.isArray(data) && data.length > 0) {
      const { lat, lon } = data[0]; // Extract lat/lon from the first result
      return { lat, lon };
    } else {
      return null;
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
    return null;
  }
}

// Haversine formula to calculate distance
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6378; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function reportback() {
  const webhookURL = process.env.WEBHOOK_URL;

  numberOfUsers++;

  axios.post(webhookURL, {
    content: "Someone is looking for a church!\nTotal is: " + numberOfUsers
  })
  .catch(error => {
    console.error("Error sending webhook notification:", error);
  });
}

// API route to find the closest church
app.post("/find-church", async (req, res) => {
  const { address, language } = req.body;
  if (!address) return res.status(400).json({ error: "Address is required" });

  const userLocation = await geocodeAddress(address);
  if (!userLocation)
    return res.status(400).json({ error: "Invalid address provided" });

  reportback();
  
  let closestChurch = null;
  let minDistance = Infinity;

  const filteredLocations = language
    ? locations.filter(church => church.languages.includes(language))
    : locations;

  filteredLocations.forEach((church) => {
    const distance = haversine(
      userLocation.lat,
      userLocation.lon,
      church.lat,
      church.lon
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestChurch = church;
    }
  });

  if (!closestChurch) {
    return res.json({ error: "No churches found matching your criteria" });
  }

  res.json({
    church: closestChurch
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
