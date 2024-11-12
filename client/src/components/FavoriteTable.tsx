import React from "react";
import { Table, Button } from "react-bootstrap";

interface FavoriteData {
  cityName: string;
  region: string;
  coordinates: { latitude: string; longitude: string } | null; // Added coordinates
  data: {
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
  }[];
}

interface FavoriteTableProps {
  favorites: FavoriteData[];
  handleRemoveFavorite: (cityName: string, region: string, coordinates: { latitude: string; longitude: string } | null) => void; // Updated to pass coordinates
  onSelectFavorite: (favorite: FavoriteData) => void;
}

const FavoriteTable: React.FC<FavoriteTableProps> = ({
  favorites,
  handleRemoveFavorite,
  onSelectFavorite,
}) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>City</th>
          <th>Region</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {favorites.map((favorite, index) => (
          <tr
            key={index}
            onClick={() => onSelectFavorite(favorite)}
            style={{ cursor: "pointer" }}
          >
            <td>{index + 1}</td>
            <td>{favorite.cityName}</td>
            <td>{favorite.region}</td>
            <td>
              <Button
                variant="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFavorite(favorite.cityName, favorite.region, favorite.coordinates); // Pass coordinates when removing favorite
                }}
              >
                🗑️
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default FavoriteTable;
