import React, { useState, useEffect } from "react";
import { Tabs, Tab, Container, ProgressBar, Alert } from "react-bootstrap";
import WeatherSearchForm from "./WeatherSearchForm";
import WeatherTabs from "./WeatherTabs";
import FavoriteTable from "./FavoriteTable";
import { fetchData } from "./apicalls/hourlyData";

interface WeatherData {
  date: string;
  status: string;
  maxTemp: string;
  minTemp: string;
  apparentTemp: string;
  sunrise: string;
  sunset: string;
  humidity: string;
  windSpeed: string;
  visibility: string;
  cloudCover: string;
}
interface HourlyWeatherData {
  date: string;
  status: string;
  maxTemp: string;
  minTemp: string;
  apparentTemp: string;
  sunrise: string;
  sunset: string;
  humidity: string;
  windSpeed: string;
  visibility: string;
  cloudCover: string;
}
interface FavoriteData {
  cityName: string;
  region: string;
  coordinates: { latitude: string; longitude: string } | null;
  data: WeatherData[];
}

const WeatherApp: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyWeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Progress state for the progress bar
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{
    latitude: string;
    longitude: string;
  } | null>(null);
  const [selectedData, setSelectedData] = useState<WeatherData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState("results");
  const [favorites, setFavorites] = useState<FavoriteData[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch("/api/favorites");
        if (response.ok) {
          const data = await response.json();
          setFavorites(data);
        } else {
          console.error("Failed to fetch favorites.");
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  const handleSearchSubmit = async (data: {
    street: string;
    city: string;
    state: string;
    latitude?: string;
    longitude?: string;
  }) => {
    const lat = coordinates?.latitude || data.latitude;
    const long = coordinates?.longitude || data.longitude;

    
    if (lat && long) {
      setLoading(true);
      setError(null);
      setProgress(0); // Reset progress for a new search
      
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 100 ? prev + 20 : 100)); // Simulate progress
      }, 300);
      
      try {
        fetchData(lat,long,setHourlyData)
        const response = await fetch(`/api/weather?lat=${lat}&long=${long}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const weatherApiResponse = await response.json();
        const intervals = weatherApiResponse.data.timelines[0].intervals;

        const formattedData = intervals.map((item: any) => ({
          date: new Date(item.startTime).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          status: item.values.cloudCover > 50 ? "Cloudy" : "Clear",
          maxTemp: `${item.values.temperatureMax}°F`,
          minTemp: `${item.values.temperatureMin}°F`,
          apparentTemp: `${item.values.temperatureApparent}°F`,
          sunrise: new Date(item.values.sunriseTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sunset: new Date(item.values.sunsetTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          humidity: `${item.values.humidity}%`,
          windSpeed: `${item.values.windSpeed} mph`,
          visibility: `${item.values.visibility} mi`,
          cloudCover: `${item.values.cloudCover}%`,
        }));

        setWeatherData(formattedData);
        setCoordinates({ latitude: lat, longitude: long });
        setHasSearched(true);
        setActiveTab("results");
        setProgress(100); // Complete the progress bar on success
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setError("Failed to fetch weather data. Please try again.");
      } finally {
        clearInterval(progressInterval);
        setLoading(false);
      }
    } else {
      setError("Latitude and longitude must be provided.");
    }
  };

  const handleLocationFetch = (lat: string, long: string) => {
    setCoordinates({ latitude: lat, longitude: long });
  };

  const handleFavoriteClick = async (cityName: string, region: string) => {
    const isDuplicate = favorites.some(
      (fav) =>
        fav.cityName.toLowerCase() === cityName.toLowerCase() &&
        fav.region.toLowerCase() === region.toLowerCase() &&
        JSON.stringify(fav.coordinates) === JSON.stringify(coordinates)
    );

    if (!isDuplicate) {
      try {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cityName,
            region,
            coordinates,
            data: weatherData,
          }),
        });

        if (response.ok) {
          setFavorites((prevFavorites) => [
            ...prevFavorites,
            {
              cityName,
              region,
              coordinates,
              data: [...weatherData],
            },
          ]);
          console.log("Added 7-day forecast to favorites!");
        } else {
          console.log("Failed to add favorite.");
        }
      } catch (error) {
        console.error("Error adding favorite:", error);
      }
    } else {
      console.log("This location is already in favorites.");
    }
  };

  const handleRemoveFavorite = async (cityName: string, region: string) => {
    try {
      const response = await fetch(`/api/favorites`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cityName, region }),
      });

      if (response.ok) {
        setFavorites((prevFavorites) =>
          prevFavorites.filter(
            (fav) =>
              fav.cityName.toLowerCase() !== cityName.toLowerCase() ||
              fav.region.toLowerCase() !== region.toLowerCase()
          )
        );
        console.log("Removed from favorites!");
      } else {
        console.log("Failed to remove favorite.");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const onSelectFavorite = (favorite: FavoriteData) => {
    setWeatherData(favorite.data);
    setHasSearched(true);
    setCoordinates(favorite.coordinates);
    setActiveTab("results");
  };

  return (
    <Container className="mt-5">
      <WeatherSearchForm
        onSubmit={handleSearchSubmit}
        onLocationFetch={handleLocationFetch}
      />

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || "results")}
        className="mt-4 d-flex flex-row align-items-center justify-content-center"
      >
        <Tab eventKey="results" title="Results">
          {loading ? (
            <div className="text-center my-3">
              <ProgressBar now={progress} label={`${progress}%`} animated />
            </div>
          ) : error ? (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          ) : !hasSearched ? (
            <div className="text-center p-3">
              No results yet. Please search for a location.
            </div>
          ) : (
            <WeatherTabs
              weatherData={weatherData}
              hourlyData={hourlyData}
              favorites={favorites}
              coordinates={coordinates}
              onDateClick={setSelectedData}
              onFavoriteClick={handleFavoriteClick}
              onRemoveFavorite={handleRemoveFavorite}
            />
          )}
        </Tab>

        <Tab eventKey="favorites" title="Favorites">
          {favorites.length === 0 ? (
            <div className="text-center p-3">Sorry No Record Found.</div>
          ) : (
            <FavoriteTable
              favorites={favorites}
              handleRemoveFavorite={handleRemoveFavorite}
              onSelectFavorite={onSelectFavorite}
            />
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default WeatherApp;
