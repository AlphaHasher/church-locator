require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

const locations = [
  {
    name: "Grace Bible Church of Fair Oaks",
    languages: ["English"],
    contacts: [
      { name: "Anthony Marquez", phone: "9168620248", email: "" },
      { name: "Kelly Salas", phone: "", email: "" }
    ],
    website: "https://gracefairoaks.com/",
    address: "5010 Hazel Ave, Fair Oaks, CA 95628",
    lat: 38.65678,
    lon: -121.225664
  },
  {
    name: "Iglesia Bíblica Fundamental de la Gracia",
    languages: ["Spanish", "English"],
    contacts: [
      { name: "Adolfo Cardoza", phone: "", email: "" },
      { name: "David Perez", phone: "", email: "" }
    ],
    website: "https://ibfg.church/",
    address: "5010 Hazel Ave, Fair Oaks, CA 95628",
    lat: 38.65678,
    lon: -121.225664
  },
  {
    name: "City Bible Church of East Sacramento",
    languages: ["English"],
    contacts: [
      { name: "Jonathan Reed", phone: "" },
      { name: "Gabriel Marquez", email: "" }
    ],
    website: "https://www.citybiblesacramento.com/",
    address: "1101 51st St, Sacramento, CA  95819",
    lat: 38.5653125,
    lon: -121.4423517
  },
  {
    name: "Gold Country Baptist Church",
    languages: ["English"],
    contacts: [
      { name: "Sean Downey", phone: "" }
    ],
    website: "https://www.gcb.church",
    address: "3800 N Shingle Rd, Shingle Springs, CA  95682",
    lat: 38.6638534,
    lon: -120.9358549
  },
  {
    name: "Redeemer Bible Church",
    languages: ["English"],
    contacts: [],
    website: "https://redeemerbible.net",
    address: "3101 Dwight Rd, Elk Grove, CA  95758",
    lat: 38.427443,
    lon: -121.4600931
  },
  {
    name: "The Cornerstone Bible Church",
    languages: ["English"],
    contacts: [],
    website: "https://www.tcbcsacramento.org/",
    address: "1101 National Dr, Sacramento, CA 95834",
    lat: 38.645191,
    lon: -121.4877573
  },
  {
    name: "Grace Bible Church",
    languages: ["English"],
    contacts: [],
    website: "https://gracebibleroseville.com",
    address: "1390 Baseline Rd, Roseville, CA 95747",
    lat: 38.7526293,
    lon: -121.31335
  },
  {
    name: "Second Slavic Baptist Church",
    languages: ["Russian", "English"],
    contacts: [],
    website: "https://ssb.church/",
    address: "6601 Watt Ave, North Highlands, CA 95660",
    lat: 38.686493,
    lon: -121.382843
  },
  {
    name: "Fremont Presbyterian Church",
    languages: ["English"],
    contacts: [
      { name: "Dave Pack", phone: "916-605-8046", email: "dpack@fremontpres.org " }
    ],
    website: "https://www.fremontpres.org/online",
    address: "5770 Carlson Dr, Sacramento, CA 95819",
    lat: 38.568154,
    lon: -121.430646
  }
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

// API route to find the closest church
app.post("/find-church", async (req, res) => {
  const { address, language } = req.body;
  if (!address) return res.status(400).json({ error: "Address is required" });

  const userLocation = await geocodeAddress(address);
  if (!userLocation)
    return res.status(400).json({ error: "Invalid address provided" });

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
    church: closestChurch,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${closestChurch.name}`,
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
