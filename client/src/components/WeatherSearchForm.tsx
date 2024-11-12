import React, { useState, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";

interface WeatherSearchFormProps {
  onSubmit: (data: {
    street: string;
    city: string;
    state: string;
    latitude?: string;
    longitude?: string;
  }) => void;
  onLocationFetch: (lat: string, long: string) => void;
}

const WeatherSearchForm: React.FC<WeatherSearchFormProps> = ({
  onSubmit,
  onLocationFetch,
}) => {
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
  });

  const [errors, setErrors] = useState<{
    city: boolean;
    street: boolean;
    state: boolean;
  }>({
    city: false,
    street: false,
    state: false,
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [currentLocationEnabled, setCurrentLocationEnabled] = useState(false);

  useEffect(() => {
    const isValid =
      (formData.street.trim() !== "" &&
        formData.city.trim() !== "" &&
        formData.state.trim() !== "") ||
      currentLocationEnabled;
    setIsFormValid(isValid);
  }, [formData, currentLocationEnabled]);

  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData({ ...formData, [name]: value });

    if (name === "city" && value.trim() !== "")
      setErrors({ ...errors, city: false });
    if (name === "street" && value.trim() !== "")
      setErrors({ ...errors, street: false });
    if (name === "state" && value.trim() !== "")
      setErrors({ ...errors, state: false });
  };

  const fetchCurrentLocation = async () => {
    try {
      const response = await fetch(
        "https://ipinfo.io/json?token=ae70d9d9bf4133"
      );
      const data = await response.json();
      const [latitude, longitude] = data.loc.split(",");
      onLocationFetch(latitude, longitude);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const handleCheckboxChange = () => {
    setCurrentLocationEnabled((prev) => {
      const newValue = !prev;

      if (newValue) {
        // Clear form data and errors when checkbox is checked for autodetect
        setFormData({ street: "", city: "", state: "" });
        setErrors({ city: false, street: false, state: false });
        fetchCurrentLocation();
      } else {
        // Reset location if unchecked
        onLocationFetch("", "");
      }

      return newValue;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { city, street, state } = formData;

    const newErrors = { city: false, street: false, state: false };

    if (!currentLocationEnabled) {
      if (street.trim() === "") newErrors.street = true;
      if (city.trim() === "") newErrors.city = true;
      if (state.trim() === "") newErrors.state = true;

      if (newErrors.city || newErrors.street || newErrors.state) {
        setErrors(newErrors);
        return;
      }

      setErrors({ city: false, street: false, state: false });

      const wholeAddress = `${street}, ${city}, ${state}`;
      try {
        const apiKey = "AIzaSyDrnXf1KrA97FbpOdEqpqDE9yTL2rjjoiA";
        const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          wholeAddress
        )}&key=${apiKey}`;

        const response = await fetch(geocodingUrl);
        const geocodeData = await response.json();

        if (geocodeData.status === "OK") {
          const location = geocodeData.results[0].geometry.location;
          const latitude = location.lat.toString();
          const longitude = location.lng.toString();

          onSubmit({ ...formData, latitude, longitude });
        } else {
          console.error("Geocoding error:", geocodeData.status);
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      }
    } else {
      onSubmit({ latitude: "", longitude: "", street, city, state });
    }
  };

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <Container className="mt-5 p-4 border rounded shadow-sm bg-light">
      <h1 className="text-center mb-4">
        Weather Search{" "}
        <span role="img" aria-label="sun">
          ☀️
        </span>
      </h1>

      <Form onSubmit={handleSubmit} onReset={handleReset}>
        <Form.Group
          controlId="street"
          className="d-flex flex-row justify-content-center align-items-center"
        >
          <Form.Label>
            Street<span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            className="mx-2 w-50"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            disabled={currentLocationEnabled}
            required={!currentLocationEnabled}
          />
        </Form.Group>

        <Form.Group
          controlId="city"
          className="d-flex flex-row justify-content-center align-items-center"
        >
          <Form.Label>
            City<span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            className="mx-2 w-50"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            isInvalid={errors.city}
            disabled={currentLocationEnabled}
            required={!currentLocationEnabled}
          />
          <Form.Control.Feedback type="invalid">
            Please enter a valid city
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group
          controlId="state"
          className="d-flex flex-row justify-content-center align-items-center"
        >
          <Form.Label>
            State<span className="text-danger">*</span>
          </Form.Label>
          <Form.Select
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="mx-2 w-50"
            disabled={currentLocationEnabled}
            required={!currentLocationEnabled}
          >
            <option value="">Select your state</option>
            <option value="California">California</option>
            <option value="Texas">Texas</option>
            <option value="New York">New York</option>
            <option value="Alabama">Alabama</option>
            <option value="Alaska">Alaska</option>
            <option value="Arizona">Arizona</option>
            <option value="Arkansas">Arkansas</option>
            <option value="California">California</option>
            <option value="Colorado">Colorado</option>
            <option value="Connecticut">Connecticut</option>
            <option value="Delaware">Delaware</option>
            <option value="Florida">Florida</option>
            <option value="Georgia">Georgia</option>
            <option value="Hawaii">Hawaii</option>
            <option value="Idaho">Idaho</option>
            <option value="Illinois">Illinois</option>
            <option value="Indiana">Indiana</option>
            <option value="Iowa">Iowa</option>
            <option value="Kansas">Kansas</option>
            <option value="Kentucky">Kentucky</option>
            <option value="Louisiana">Louisiana</option>
            <option value="Maine">Maine</option>
            <option value="Maryland">Maryland</option>
            <option value="Massachusetts">Massachusetts</option>
            <option value="Michigan">Michigan</option>
            <option value="Minnesota">Minnesota</option>
            <option value="Mississippi">Mississippi</option>
            <option value="Missouri">Missouri</option>
            <option value="Montana">Montana</option>
            <option value="Nebraska">Nebraska</option>
            <option value="Nevada">Nevada</option>
            <option value="New Hampshire">New Hampshire</option>
            <option value="New Jersey">New Jersey</option>
            <option value="New Mexico">New Mexico</option>
            <option value="New York">New York</option>
            <option value="North Carolina">North Carolina</option>
            <option value="North Dakota">North Dakota</option>
            <option value="Ohio">Ohio</option>
            <option value="Oklahoma">Oklahoma</option>
            <option value="Oregon">Oregon</option>
            <option value="Pennsylvania">Pennsylvania</option>
            <option value="Rhode Island">Rhode Island</option>
            <option value="South Carolina">South Carolina</option>
            <option value="South Dakota">South Dakota</option>
            <option value="Tennessee">Tennessee</option>
            <option value="Texas">Texas</option>
            <option value="Utah">Utah</option>
            <option value="Vermont">Vermont</option>
            <option value="Virginia">Virginia</option>
            <option value="Washington">Washington</option>
            <option value="West Virginia">West Virginia</option>
            <option value="Wisconsin">Wisconsin</option>
            <option value="Wyoming">Wyoming</option>
          </Form.Select>
        </Form.Group>

        <hr />

        <Form.Group className="d-flex flex-row justify-content-center align-items-center">
          <p>
            Autodetect Location <sup style={{ color: "red" }}>*</sup>{" "}
          </p>
          <Form.Check
            type="checkbox"
            name="currentLocation"
            className="mx-2 mt-0"
            checked={currentLocationEnabled}
            onChange={handleCheckboxChange}
          />
          <p>Current Location</p>
        </Form.Group>

        <div className="d-flex justify-content-center">
          <Button
            type="submit"
            variant="primary"
            className="d-flex align-items-center justify-content-center"
            disabled={!isFormValid}
          >
            <span className="material-symbols-outlined me-2">search</span>
            Search
          </Button>
          <Button
            type="reset"
            variant="light"
            className="d-flex align-items-center justify-content-center mx-2"
          >
            <span className="material-symbols-outlined me-2">clear_all</span>
            Clear
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default WeatherSearchForm;
