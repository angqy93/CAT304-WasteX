"use client";

import { useEffect, useRef, useState } from "react";
import { IoLocationSharp } from "react-icons/io5";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Field, ErrorMessage } from "formik";
import { toast } from "react-hot-toast";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const LocationPicker = ({ setLocation }: any) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [address, setAddress] = useState("");
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    const fetchLocationFromIP = async () => {
      try {
        const response = await fetch(
          "https://ipinfo.io/json?token=ec3809801f48d9"
        );

        const data = await response.json();
        const [latitude, longitude] = data.loc.split(",").map(parseFloat);
        const newCenter = { lat: latitude, lng: longitude };
        setMapCenter(newCenter);
      } catch (error) {
        console.error("Error fetching IP location:", error);
      }
    };

    fetchLocationFromIP();
  }, []);
  const inputRef = useRef(null);

  const handleLocationSearch = () => {
    const inputElement = document.getElementById(
      `location-input`
    ) as HTMLInputElement;
    console.log(inputElement);
    if (isLoaded && inputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["geocode"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          console.log(place);
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formattedAddress =
            place.formatted_address || inputElement.value;

          setAddress(formattedAddress);
          setMapCenter({ lat, lng });
          setMarkerPosition({ lat, lng });

          setLocation({
            lat: lat,
            lng: lng,
            name: formattedAddress,
          });

          console.log({
            lat: lat,
            lng: lng,
            name: formattedAddress,
          });

          toast.success("Location selected!");
        }
      });
    }
  };

  const confirmMapLocation = () => {
    if (markerPosition) {
      const inputElement = document.getElementById(
        `location-input`
      ) as HTMLInputElement;
      const currentAddress = inputElement.value || "Pinned Location";

      setShowMapModal(false);

      setLocation({
        name: currentAddress,
        lat: markerPosition.lat,
        lng: markerPosition.lng,
      });

      toast.success("Location picked successfully!");
    }
  };

  return (
    <div className="mt-7">
      <label className="font-semibold flex items-center gap-2 mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-map-pin"
        >
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <circle cx="12" cy="10" r="3" />
        </svg>{" "}
        Location
      </label>
      <div className="flex gap-3">
        <input
          id={`location-input`}
          type="text"
          placeholder="Search location..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border-[3px] h-[45px] px-2 rounded-xl bg-gray-200"
          onFocus={handleLocationSearch}
          ref={inputRef}
        />
        <button
          type="button"
          className="text-white bg-green px-5 py-2 rounded-lg whitespace-nowrap"
          onClick={() => setShowMapModal(true)}
        >
          Pick Location
        </button>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-[90%] h-[70%]">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={14}
                onClick={(e) => {
                  const lat = e.latLng?.lat() || 0;
                  const lng = e.latLng?.lng() || 0;
                  setMarkerPosition({ lat, lng });
                  const currentInputValue =
                    (
                      document.getElementById(
                        `${name}Input`
                      ) as HTMLInputElement
                    )?.value || "";
                  setAddress(currentInputValue || "Pinned Location");
                }}
              >
                {markerPosition && <Marker position={markerPosition} />}
              </GoogleMap>
            ) : (
              <p>Loading map...</p>
            )}
            <div className="mt-10 flex justify-end gap-4">
              <button
                type="button"
                className="px-5 py-2 text-white bg-red-500 rounded-lg"
                onClick={() => setShowMapModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2 text-white bg-green rounded-lg"
                onClick={confirmMapLocation}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
