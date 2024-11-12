import React, { useEffect, useRef } from "react";
import { Container, Table, Button, Row, Col } from "react-bootstrap";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface WeatherData {
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

interface WeatherDetailsProps {
  date: string;
  weatherData: WeatherData;
  latitude: number;
  longitude: number;
  googleMapsApiKey: string;
  onBackToList: () => void;
  cityName: string;
  regionName: string;
  temperature: string;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const WeatherDetails: React.FC<WeatherDetailsProps> = ({
  date,
  weatherData,
  latitude,
  longitude,
  googleMapsApiKey,
  onBackToList,
  cityName,
  regionName,
  temperature,
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey,
  });

  const center = {
    lat: latitude,
    lng: longitude,
  };

  const tweetWeatherDetails = () => {
    const tweetText = `Weather Details for ${cityName}, ${regionName}: Status: ${weatherData.status}, Temperature: ${temperature}°C, Humidity: ${weatherData.humidity}%, Wind Speed: ${weatherData.windSpeed} km/h.`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&hashtags=Weather,Forecast`;
    window.open(tweetUrl, "_blank");
  };

  const tableRows = [
    { label: "Status", value: weatherData.status || "N/A" },
    { label: "Max Temperature", value: weatherData.maxTemp || "N/A" },
    { label: "Min Temperature", value: weatherData.minTemp || "N/A" },
    { label: "Apparent Temperature", value: weatherData.apparentTemp || "N/A" },
    { label: "Sunrise Time", value: weatherData.sunrise || "N/A" },
    { label: "Sunset Time", value: weatherData.sunset || "N/A" },
    { label: "Humidity", value: weatherData.humidity || "N/A" },
    { label: "Wind Speed", value: weatherData.windSpeed || "N/A" },
    { label: "Visibility", value: weatherData.visibility || "N/A" },
    { label: "Cloud Cover", value: weatherData.cloudCover || "N/A" },
  ];

  const redMarkerIcon = {
    path: "M12 2C8.686 2 6 4.686 6 8c0 3.686 3.314 6.742 6 10.936C14.686 14.742 18 11.686 18 8c0-3.314-2.686-6-6-6z", // SVG path for a map pin shape
    fillColor: "red",
    fillOpacity: 1,
    scale: 1.5,
    strokeColor: "black",
    strokeWeight: 1,
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-between align-items-center mb-3">
        <Col xs="auto">
          <Button
            className="d-flex align-items-center justify-content-center"
            variant="light"
            onClick={onBackToList}
          >
            <span className="material-symbols-outlined">chevron_left</span>
            List
          </Button>
        </Col>
        <Col xs="auto" className="text-center">
          <h4 className="m-0">
            {formatDate(date)}
            <Button onClick={tweetWeatherDetails} variant="light">
              X
            </Button>
          </h4>
        </Col>
      </Row>

      <div className="bg-light rounded-3 p-3 shadow-sm w-100">
        <Table borderless className="text-center w-100">
          <tbody>
            {tableRows.map((row, index) => {
              const rowColor = index % 2 === 0 ? "#dcdcdc" : "#ffffff";
              return (
                <tr key={index} style={{ backgroundColor: rowColor }}>
                  <th style={{ backgroundColor: rowColor }}>{row.label}</th>
                  <td style={{ backgroundColor: rowColor }}>{row.value}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {isLoaded ? (
        <div className="mt-4 border rounded-3 shadow-sm">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
          >
            <Marker position={center} icon={redMarkerIcon} />
          </GoogleMap>
        </div>
      ) : (
        <p className="text-center p-3">Loading map...</p>
      )}
    </Container>
  );
};

export default WeatherDetails;
