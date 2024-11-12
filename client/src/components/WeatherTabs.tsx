import React, { useState, useEffect } from "react";
import { Tabs, Tab, Container, Table, Button, Row, Col } from "react-bootstrap";
import WeatherDetails from "./WeatherDetails";
import TemperatureChart from "./TemperatureChart";
import Meteogram from "./MeteogramChart";

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
  coordinates: { latitude: string; longitude: string } | null; // Added coordinates
  data: WeatherData[];
}

interface WeatherTabsProps {
  weatherData: WeatherData[];
  hourlyData: HourlyWeatherData[];
  favorites: FavoriteData[];
  coordinates?: { latitude: string; longitude: string } | null;
  onDateClick: (data: WeatherData) => void;
  onFavoriteClick: (
    cityName: string,
    region: string,
    coordinates?: { latitude: string; longitude: string } | null
  ) => void;
  onRemoveFavorite: (
    cityName: string,
    region: string,
    coordinates?: { latitude: string; longitude: string } | null
  ) => void;
}

const WeatherTabs: React.FC<WeatherTabsProps> = ({
  weatherData,
  hourlyData,
  favorites,
  coordinates,
  onDateClick,
  onFavoriteClick,
  onRemoveFavorite,
}) => {
  const [selectedData, setSelectedData] = useState<WeatherData | null>(null);
  const [hourly, setHourly] = useState<WeatherData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [hideTable, setHideTable] = useState(false);
  const [cityName, setCityName] = useState<string>("");
  const [regionName, setRegionName] = useState<string>("");

  useEffect(() => {
    const fetchCityAndRegionName = async () => {
      if (coordinates) {
        const apiKey = "AIzaSyD9SRVSolqPEYTy7s4fCYSTLw7wbZMEz6M"; // replace with your actual API key
        const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${apiKey}`;

        try {
          const response = await fetch(geocodingUrl);
          const data = await response.json();
          if (data.results.length > 0) {
            const addressComponents = data.results[0].address_components;

            const cityComponent = addressComponents.find((component: any) =>
              component.types.includes("locality")
            );
            setCityName(
              cityComponent ? cityComponent.long_name : "City Not Found"
            );

            const regionComponent = addressComponents.find((component: any) =>
              component.types.includes("administrative_area_level_1")
            );
            setRegionName(
              regionComponent ? regionComponent.long_name : "Region Not Found"
            );
          }
        } catch (error) {
          console.error("Error fetching city and region name:", error);
        }
      }
    };
    fetchCityAndRegionName();
  }, [coordinates]);

  const isFavorite = favorites.some(
    (fav) =>
      fav.cityName.toLowerCase() === cityName.toLowerCase() &&
      fav.region.toLowerCase() === regionName.toLowerCase() &&
      JSON.stringify(fav.coordinates) === JSON.stringify(coordinates)
  );

  const hideDetailsTab = () => {
    setShowDetails(false);
    setHideTable(false);
  };

  const handleFavoriteClick = () => {
    if (isFavorite) {
      onRemoveFavorite(cityName, regionName, coordinates); // Pass coordinates when removing a favorite
    } else {
      onFavoriteClick(cityName, regionName, coordinates); // Pass coordinates when adding a favorite
    }
  };

  const handleMoreDetailsClick = () => {
    if (!selectedData && weatherData.length > 0) {
      setSelectedData(weatherData[0]);
      onDateClick(weatherData[0]);
    }
    setShowDetails(true);
    setTimeout(() => setHideTable(true), 300);
  };

  const handleRowClick = (data: WeatherData) => {
    setSelectedData(data);
    onDateClick(data);
    setShowDetails(true);
    setTimeout(() => setHideTable(true), 300);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setHideTable(false);
  };

  return (
    <Container
      className={`mt-4 container-slide ${showDetails ? "show-details" : ""}`}
    >
      <div className={`tab-content ${hideTable ? "hidden" : ""}`}>
        <h3 className="mb-3">
          Weather Forecast {cityName ? `for ${cityName}, ${regionName}` : ""}
        </h3>
        <Row className="mb-3 justify-content-end">
          <Col xs="auto">
            <Button
              variant="light"
              onClick={handleFavoriteClick}
              className="d-flex align-items-center justify-content-center"
            >
              <span
                className="material-symbols-outlined"
                style={{
                  color: isFavorite ? "yellow" : "inherit", // Yellow color for filled star
                  fontSize: "24px", // Optional, adjust the size as needed
                }}
              >
                {isFavorite ? "star" : "star_border"}
              </span>
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant="light"
              className="d-flex align-items-center justify-content-center"
              onClick={handleMoreDetailsClick}
            >
               Details
              <span className="material-symbols-outlined">chevron_right</span>
            </Button>
          </Col>
        </Row>

        <Tabs defaultActiveKey="dayView" id="weather-tabs" className="mt-3">
          <Tab eventKey="dayView" title="Day View">
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Max Temp</th>
                  <th>Min Temp</th>
                  <th>Wind Speed</th>
                </tr>
              </thead>
              <tbody>
                {weatherData.map((data, index) => (
                  <tr key={index} onClick={() => handleRowClick(data)}>
                    <td>{index + 1}</td>
                    <td>
                      <Button
                        variant="link"
                        onClick={() => handleRowClick(data)}
                      >
                        {new Intl.DateTimeFormat("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(data.date))}
                      </Button>
                    </td>
                    <td>{data.status}</td>
                    <td>{data.maxTemp}</td>
                    <td>{data.minTemp}</td>
                    <td>{data.windSpeed}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
          <Tab eventKey="dailyTempChart" title="Daily Temp. Chart">
            <TemperatureChart data={weatherData} />
          </Tab>
          <Tab eventKey="meteogram" title="Meteogram">
            <div><Meteogram data={hourlyData}/></div>
          </Tab>
        </Tabs>
      </div>
        {/* <TemperatureChart data={weatherData}/> for debug*/ }
      {showDetails && hideTable && selectedData && coordinates && (
        <div className="details-content">
          <WeatherDetails
            date={selectedData.date}
            weatherData={selectedData}
            latitude={parseFloat(coordinates.latitude)}
            longitude={parseFloat(coordinates.longitude)}
            googleMapsApiKey="AIzaSyD9SRVSolqPEYTy7s4fCYSTLw7wbZMEz6M" // replace with your actual API key
            onBackToList={handleBackToList}
            cityName={cityName} // Use state value directly
            regionName={regionName} // Use state value directly
            temperature={selectedData.maxTemp} // Assuming maxTemp represents temperature here
          />
        </div>
      )}
    </Container>
  );
};

export default WeatherTabs;
