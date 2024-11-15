import React, { useState, useEffect, useRef } from "react";
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

  // Refs to hold input elements for autocomplete
  const streetInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const stateInputRef = useRef<HTMLInputElement>(null);

  // Initialize autocomplete for street, city, and state
  const initAutocomplete = () => {
    if (window.google) {
      const options = {
        types: ["address"], // Restrict results to addresses only
      };

      // Create autocomplete for street
      if (streetInputRef.current) {
        const streetAutocomplete = new window.google.maps.places.Autocomplete(
          streetInputRef.current,
          options
        );
        streetAutocomplete.addListener("place_changed", () => {
          const place = streetAutocomplete.getPlace();
          if (place.address_components) {
            const street = place.address_components.find((component: any) =>
              component.types.includes("route")
            );
            const city = place.address_components.find((component: any) =>
              component.types.includes("locality")
            );
            const state = place.address_components.find((component: any) =>
              component.types.includes("administrative_area_level_1")
            );

            setFormData({
              street: street ? street.long_name : "",
              city: city ? city.long_name : "",
              state: state ? state.long_name : "",
            });
          }
        });
      }

      // Create autocomplete for city
      if (cityInputRef.current) {
        const cityAutocomplete = new window.google.maps.places.Autocomplete(
          cityInputRef.current,
          options
        );
        cityAutocomplete.addListener("place_changed", () => {
          const place = cityAutocomplete.getPlace();
          if (place.address_components) {
            const city = place.address_components.find((component: any) =>
              component.types.includes("locality")
            );
            setFormData({ ...formData, city: city ? city.long_name : "" });
          }
        });
      }

      // Create autocomplete for state
      if (stateInputRef.current) {
        const stateAutocomplete = new window.google.maps.places.Autocomplete(
          stateInputRef.current,
          options
        );
        stateAutocomplete.addListener("place_changed", () => {
          const place = stateAutocomplete.getPlace();
          if (place.address_components) {
            const state = place.address_components.find((component: any) =>
              component.types.includes("administrative_area_level_1")
            );
            setFormData({ ...formData, state: state ? state.long_name : "" });
          }
        });
      }
    }
  };

  useEffect(() => {
    // Initialize the autocomplete when the component is mounted
    if (window.google) {
      initAutocomplete();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCeTyB1kVO13TCxdrJNmhugdYC68JNAsFM&libraries=places&callback=initAutocomplete`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      //@ts-ignore
      window.initAutocomplete = initAutocomplete; // Attach callback to global window object
    }
  }, []);

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
    setErrors({
      city: value.trim() === "",
      state: value.trim() === "",
      street: value.trim() === "",
    });
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
        const apiKey = "AIzaSyCeTyB1kVO13TCxdrJNmhugdYC68JNAsFM";
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
        <img
          style={{ width: "34px", marginBottom: "10px" }}
          src="https://res.cloudinary.com/dzjnd5pcv/image/upload/v1731658205/cloud-sun_1_rdecx5.svg"
          alt=""
        />
      </h1>

      <Form onSubmit={handleSubmit} onReset={handleReset} autoComplete="on">
        <Form.Group className="d-flex flex-row justify-content-center align-items-center mt-5">
          <Form.Label>
            Street<span className="text-danger">*</span>
          </Form.Label>
          <div className="w-50 mx-2 d-flex flex-column">
            <Form.Control
              type="text"
              name="street"
              value={formData.street}
              isInvalid={errors.street}
              onChange={handleInputChange}
              ref={streetInputRef}
              autoComplete="street-address"
            />
            <Form.Control.Feedback type="invalid">
              Please enter a street.
            </Form.Control.Feedback>
          </div>
        </Form.Group>

        <Form.Group className="d-flex flex-row justify-content-center align-items-center mt-2">
          <Form.Label>
            City<span className="text-danger">*</span>
          </Form.Label>
          <div className="w-50 mx-2 d-flex flex-column">
            <Form.Control
              type="text"
              name="city"
              value={formData.city}
              isInvalid={errors.city}
              onChange={handleInputChange}
              ref={cityInputRef}
              autoComplete="city"
            />
            <Form.Control.Feedback type="invalid">
              Please enter a city.
            </Form.Control.Feedback>
          </div>
        </Form.Group>

        <Form.Group className="d-flex flex-row justify-content-center align-items-center mt-2">
          <Form.Label>
            State<span className="text-danger">*</span>
          </Form.Label>
          <div className="w-50 mx-2 d-flex flex-column">
            <Form.Control
              type="text"
              name="state"
              value={formData.state}
              isInvalid={errors.state}
              onChange={handleInputChange}
              ref={stateInputRef}
              autoComplete="state"
            />
            <Form.Control.Feedback type="invalid">
              Please enter a state.
            </Form.Control.Feedback>
          </div>
        </Form.Group>

        <Form.Group className="d-flex flex-row justify-content-center align-items-center ">
          <Form.Check
            type="checkbox"
            label="Use current location"
            onChange={handleCheckboxChange}
            checked={currentLocationEnabled}
          />
        </Form.Group>

        <div className="text-center mt-4">
          <Button
            type="submit"
            className="btn btn-primary w-50"
            disabled={!isFormValid}
          >
            Search
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default WeatherSearchForm;
