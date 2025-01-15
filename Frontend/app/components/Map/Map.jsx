import React, { useEffect, useState, useCallback } from "react";
import { GoogleMap, OverlayView, useLoadScript } from "@react-google-maps/api";
import Link from "next/link";

const containerStyle = {
  width: "100%",
  height: "100%",
};
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const MapComponent = ({ products }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });

  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    const fetchLocationFromIP = async () => {
      try {
        const response = await fetch(
          "https://ipinfo.io/json?token=ec3809801f48d9"
        );
        const data = await response.json();
        const [latitude, longitude] = data.loc.split(",").map(parseFloat);
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });
        console.log("City:", data.city); // Optional: log city
      } catch (error) {
        console.error("Error fetching IP location:", error);
      }
    };

    fetchLocationFromIP();
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={11}
      options={{
        disableDefaultUI: true,
      }}
    >
      {products?.map((product, index) => (
        <OverlayView
          key={index}
          position={{
            lat: parseFloat(product.lat),
            lng: parseFloat(product.lng),
          }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <Link href={`/products/${product.id}`}>
            <div className="maptooltip">
            {product.title}
            <br />
            ${product.price}
            </div>
          </Link>
        </OverlayView>
      ))}
    </GoogleMap>
  );
};

export default MapComponent;
