import React, { useEffect, useRef } from "react";
import { Container, Table, Button, Row, Col } from "react-bootstrap";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

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
    libraries: ["marker"],
  });

  const mapRef = useRef(null);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 10,
        mapId: "DEMO_MAP_ID", // Replace with your actual mapId if you have one
      });

      if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
        // Use AdvancedMarkerElement if available
        new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: latitude, lng: longitude },
        });
      } else {
        // Fallback to standard Marker if AdvancedMarkerElement is not available
        console.warn(
          "AdvancedMarkerElement is not available, using standard Marker instead."
        );
        new google.maps.Marker({
          map,
          position: { lat: latitude, lng: longitude },
        });
      }
    }
  }, [isLoaded, latitude, longitude]);

  const tweetWeatherDetails = () => {
    const tweetText = `The temperature in  ${cityName}, ${regionName}, on ${date} is Temperature: ${temperature}°C, and the conditions are clear`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}&hashtags=CSCI571WeatherForecast`;
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

  return (
    <Container className="mt-4">
      <Row className="justify-content-between align-items-center mb-3">
        <Col xs={4} md="auto" className="text-center mb-3 mb-md-0">
          <Button
            className="d-flex align-items-center justify-content-center"
            variant="light"
            onClick={onBackToList}
          >
            <span className="material-symbols-outlined">chevron_left</span>
            List
          </Button>
        </Col>
        <Col xs={8} md="auto" className="text-center">
          <h4
            className="m-0 d-inline-flex align-items-center justify-content-center"
            style={{ fontSize: "1rem" }}
          >
            {formatDate(date)}
            <Button
              onClick={tweetWeatherDetails}
              variant="light"
              className="ml-2"
              style={{ fontSize: "0.875rem" }}
            >
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
        <div
          className="mt-4 border rounded-3 shadow-sm w-100"
          style={containerStyle}
          ref={mapRef}
        ></div>
      ) : (
        <p className="text-center p-3">Loading map...</p>
      )}
    </Container>
  );
};

export default WeatherDetails;
