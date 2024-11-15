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

// Define a type for each weather status entry
interface WeatherStatus {
  description: string;
  image: string;
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

  function getWeatherImageSrc(code: number) {
    const condition = weatherStatues[code];

    if (condition) {
      return condition.image; // Return the image source
    } else {
      console.warn(`No image found for weather code: ${code}`);
      return null; // Return null if the code is not found
    }
  }
  function getWeatherDescription(code: number): string {
    const condition = weatherStatues[code];

    if (condition) {
      return condition.description; // Return the description
    } else {
      console.warn(`No description found for weather code: ${code}`);
      return "Description not available"; // Return a default message if the code is not found
    }
  }

  const weatherStatues: { [key: number]: WeatherStatus } = {
    1000: {
      description: "Clear, Sunny",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731614830/clear_day_kvslmo.svg",
    },
    1100: {
      description: "Mostly Clear",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731614830/clear_day_kvslmo.svg",
    },
    1101: {
      description: "Partly Cloudy",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647419/partly_cloudy_day_zks8xa.svg",
    },
    1102: {
      description: "Mostly Cloudy",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731648099/mostly_cloudy_arcezh.svg",
    },
    1001: {
      description: "Cloudy",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731614849/cloudy_lkzfqz.svg",
    },
    2000: {
      description: "Fog",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647207/fog_fxth3o.svg",
    },
    2100: {
      description: "Light Fog",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647259/fog_light_kdo1v5.svg",
    },
    4000: {
      description: "Drizzle",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647177/drizzle_z0ybcr.svg",
    },
    4001: {
      description: "Rain",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647432/rain_vc0l6i.svg",
    },
    4200: {
      description: "Light Rain",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647451/rain_light_mxjkdh.svg",
    },
    4201: {
      description: "Heavy Rain",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647442/rain_heavy_uvpjaf.svg",
    },
    5000: {
      description: "Snow",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647469/snow_b2iwim.svg",
    },
    5001: {
      description: "Flurries",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647208/flurries_hnuvq7.svg",
    },
    5100: {
      description: "Light Snow",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647499/snow_light_y1ntz1.svg",
    },
    5101: {
      description: "Heavy Snow",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647487/snow_heavy_fm3mt8.svg",
    },
    6000: {
      description: "Freezing Drizzle",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731665495/freezing_drizzle_mi8yaw.svg",
    },
    6001: {
      description: "Freezing Rain",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647292/freezing_rain_gijcqf.svg",
    },
    6200: {
      description: "Light Freezing Rain",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647326/freezing_rain_light_ekrmdo.svg",
    },
    6201: {
      description: "Heavy Freezing Rain",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647306/freezing_rain_heavy_b2kl5i.svg",
    },
    7000: {
      description: "Ice Pellets",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647336/ice_pellets_gdu1b5.svg",
    },
    7101: {
      description: "Heavy Ice Pellets",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647344/ice_pellets_heavy_iah012.svg",
    },
    7102: {
      description: "Light Ice Pellets",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647353/ice_pellets_light_dgyvyx.svg",
    },
    8000: {
      description: "Thunderstorm",
      image:
        "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731647519/tstorm_nlsp7e.svg",
    },
  };

  return (
    <Container
      className={`mt-4 container-slide ${showDetails ? "show-details" : ""}`}
    >
      <div className={`tab-content ${hideTable ? "hidden" : ""}`}>
        <h3 className="mb-3 text-center text-md-left">
          Weather Forecast {cityName ? `for ${cityName}, ${regionName}` : ""}
        </h3>
        <Row className="mb-3 justify-content-center justify-content-md-end">
          <Col xs="auto">
            <Button
              variant="light"
              onClick={handleFavoriteClick}
              className="d-flex align-items-center justify-content-center"
            >
              <span
                className="material-symbols-outlined"
                style={{
                  color: isFavorite ? "yellow" : "inherit",
                  fontSize: "24px",
                }}
              >
                {isFavorite ? "star" : "star_border"}
              </span>
            </Button>
          </Col>
          <Col xs="auto" className="mt-2 mt-md-0">
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
                    <td>
                      <img
                        style={{ width: "30px", height: "30px" }}
                        src={
                          getWeatherImageSrc(Number(data.status)) ||
                          "https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731614830/clear_day_kvslmo.svg"
                        }
                        alt="Weather status"
                      />{" "}
                      <span style={{ fontSize: "10px" }}>
                        {getWeatherDescription(Number(data.status))}
                      </span>
                    </td>
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
            <div>
              <Meteogram data={hourlyData} />
            </div>
          </Tab>
        </Tabs>
      </div>

      {showDetails && hideTable && selectedData && coordinates && (
        <div className="details-content mt-3">
          <WeatherDetails
            date={selectedData.date}
            weatherData={selectedData}
            latitude={parseFloat(coordinates.latitude)}
            longitude={parseFloat(coordinates.longitude)}
            googleMapsApiKey="AIzaSyD9SRVSolqPEYTy7s4fCYSTLw7wbZMEz6M"
            onBackToList={handleBackToList}
            cityName={cityName}
            regionName={regionName}
            temperature={selectedData.maxTemp}
          />
        </div>
      )}
    </Container>
  );
};

export default WeatherTabs;
