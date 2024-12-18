const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8080;
require("dotenv").config();

app.use(
  cors({
    origin: "https://skanda20.click",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Serve the static files from the React app
// app.use(express.static(path.join(__dirname, "../client/build")));

// // Handle all unmatched routes by serving the React app's index.html
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/build", "index.html"));
// });

// Middleware to parse JSON
app.use(express.json());

const uri =
  "mongodb+srv://skandapandith25:Skanda123@cluster0.ax4p9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let favoritesCollection;

// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to MongoDB");
    const db = client.db("weatherApp");
    favoritesCollection = db.collection("favorites");
  })
  .catch((error) => console.error(error));

// GET route to retrieve all favorite locations
app.get("/", async (req, res) => {
  try {
    return res.json({ message: "you have reached the server" });
  } catch (error) {
    console.error("Failed Index Request:", error);
    return res.status(500).json({ error: "Failed Index Request" });
  }
});

// GET route to retrieve all favorite locations
app.get("/api/favorites", async (req, res) => {
  try {
    const favorites = await favoritesCollection.find().toArray();
    res.json(favorites);
  } catch (error) {
    console.error("Error retrieving favorites:", error);
    res.status(500).json({ error: "Failed to retrieve favorites" });
  }
});

// POST route to add a new favorite location
app.post("/api/favorites", async (req, res) => {
  const { cityName, region, coordinates, data } = req.body;

  try {
    const isDuplicate = await favoritesCollection.findOne({
      cityName: cityName.toLowerCase(),
      region: region.toLowerCase(),
    });

    if (isDuplicate) {
      return res
        .status(409)
        .json({ message: "This location is already in favorites." });
    }

    await favoritesCollection.insertOne({
      cityName,
      region,
      coordinates,
      data,
    });
    console.log("Added favorite:", { cityName, region, coordinates, data });
    res.status(201).json({ message: "Added to favorites!" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// DELETE route to remove a favorite location
app.delete("/api/favorites", async (req, res) => {
  const { cityName, region } = req.body;

  try {
    const result = await favoritesCollection.deleteOne({
      cityName: { $regex: new RegExp(`^${cityName}$`, "i") },
      region: { $regex: new RegExp(`^${region}$`, "i") },
    });

    if (result.deletedCount === 1) {
      console.log("Removed favorite:", { cityName, region });
      res.status(200).json({ message: "Removed from favorites." });
    } else {
      res.status(404).json({ message: "Favorite location not found." });
    }
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

// Existing weather API route
app.get("/api/weather", async (req, res) => {
  const { lat, long } = req.query;
  const apiKey = "6BkE6QmUX2cRZnM5Ol8AgKG30XGakQ2n";
  const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${long}&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,humidity,sunriseTime,sunsetTime,visibility,weatherCode,cloudCover&units=imperial&timesteps=1d&apikey=${apiKey}`;

  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");

    const weatherData = await response.json();
    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// Hourly weather data route
app.get("/api/hourly", async (req, res) => {
  const { lat, long } = req.query;
  const apiKey = "6BkE6QmUX2cRZnM5Ol8AgKG30XGakQ2n";
  const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${long}&fields=temperature,pressureSurfaceLevel,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,visibility,cloudCover&endTime=nowPlus5d&timezone=America/Los_Angeles&units=imperial&timesteps=1h&apikey=${apiKey}`;

  try {
    const fetch = (await import("node-fetch")).default;
    console.log("Latitude:", lat, "Longitude:", long);
    console.log("Request URL:", url);

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`);
      throw new Error("Network response was not ok");
    }

    const weatherData = await response.json();
    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching hourly data:", error);
    res.status(500).json({ error: "Failed to fetch hourly data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
