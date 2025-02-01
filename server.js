require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Predefined church locations (latitude, longitude, and name)

// Grace Bible Church of Fair Oaks
// Anthony Marquez & Kelly Salas
// 5010 Hazel Ave, Fair Oaks, CA 95628
// https://gracefairoaks.com/

// Iglesia Bíblica Fundamental de la Gracia (Spanish-speaking church)
// Adolfo Cardoza & David Perez
// 5010 Hazel Ave, Fair Oaks, CA 95628
// https://ibfg.church/

// City Bible Church of East Sacramento
// Jonathan Reed & Gabriel Marquez
// (closest to Sac State)
// 1101 51st St
// Sacramento, CA  95819
// https://www.citybiblesacramento.com/

// Gold Country Baptist Church
// Sean Downey
// 3800 N Shingle Rd
// Shingle Springs, CA  95682
// https://www.gcb.church

// Redeemer Bible Church
// 3101 Dwight Rd
// Elk Grove, CA  95758
// https://redeemerbible.net

// The Cornerstone Bible Church (of Natomas)
// 1101 National Dr, Sacramento, CA 95834
// https://www.tcbcsacramento.org/

// Grace Bible Church (of Roseville)
// 1390 Baseline Rd, Roseville, CA 95747
// https://gracebibleroseville.com
const locations = [
  { name: "Grace Bible Church of Fair Oaks", contact: "Anthony Marquez & Kelly Salas", website: "https://gracefairoaks.com/", address: "5010 Hazel Ave, Fair Oaks, CA 95628", lat: 38.65678, lon: -121.225664 },
  { name: "Iglesia Bíblica Fundamental de la Gracia", contact: "Adolfo Cardoza & David Perez", website: "https://ibfg.church/", address: "5010 Hazel Ave, Fair Oaks, CA 95628", lat: 38.65678, lon: -121.225664 },
  { name: "City Bible Church of East Sacramento", contact: "Jonathan Reed & Gabriel Marquez", website: "https://www.citybiblesacramento.com/", address: "1101 51st St, Sacramento, CA  95819", lat: 38.5653125, lon: -121.4423517 },
  { name: "Gold Country Baptist Church", contact: "Sean Downey", website: "https://www.gcb.church", address: "3800 N Shingle Rd, Shingle Springs, CA  95682", lat: 38.6638534, lon: -120.9358549 },
  { name: "Redeemer Bible Church", contact: "", website: "https://redeemerbible.net", address: "3101 Dwight Rd, Elk Grove, CA  95758", lat: 38.427443, lon: -121.4600931 },
  { name: "The Cornerstone Bible Church", contact: "", website: "https://www.tcbcsacramento.org/", address: "1101 National Dr, Sacramento, CA 95834", lat: 38.645191, lon: -121.4877573 },
  { name: "Grace Bible Church", contact: "", website: "https://gracebibleroseville.com", address: "1390 Baseline Rd, Roseville, CA 95747", lat: 38.7526293, lon: -121.31335 },
  { name: "Second Slavic Baptist Church", contact: "", website: "https://ssb.church/", address: "6601 Watt Ave, North Highlands, CA 95660", lat: 38.686493, lon: -121.382843 }
];

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
  const R = 6371; // Earth's radius in km
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

// API route to find the closest church
app.post("/find-church", async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "Address is required" });

  const userLocation = await geocodeAddress(address);
  if (!userLocation)
    return res.status(400).json({ error: "Invalid address provided" });

  let closestChurch = null;
  let minDistance = Infinity;

  locations.forEach((church) => {
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

  res.json({
    church: closestChurch,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${closestChurch.lat}%2C${closestChurch.lon}`,
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
