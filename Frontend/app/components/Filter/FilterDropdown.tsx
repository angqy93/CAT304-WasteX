import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

const FilterDropdown = ({ setProducts }: any) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [locationRange, setLocationRange] = useState<any>(50);
  const [priceRange, setPriceRange] = useState(500);
  const [userLocation, setUserLocation] = useState<any>({});

  // Dropdown
  const dropdownRef: any = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Get User location
  useEffect(() => {
    const fetchLocationFromIP = async () => {
      try {
        const response = await fetch(
          "https://ipinfo.io/json?token=ec3809801f48d9"
        );
        const data = await response.json();
        const [latitude, longitude] = data.loc.split(",").map(parseFloat);
        setUserLocation({ lat: latitude, lng: longitude });
      } catch (error) {
        console.error("Error fetching IP location:", error);
      }
    };

    fetchLocationFromIP();
  }, []);

  // Get Products by filter

  const fetchProducts = useDebouncedCallback(() => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/public?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${locationRange}&category=${selectedCategory}`
      )
      .then((response) => {
        setProducts(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching products", error);
      });
  }, 300);

  useEffect(() => {
    if (selectedCategory || locationRange) {
      fetchProducts();
    }
  }, [locationRange, selectedCategory, fetchProducts]);

  const handleCategoryChange = (e: any) => setSelectedCategory(e.target.value);
  const handleLocationChange = (e: any) =>
    setLocationRange(Number(e.target.value));

  const clearFilter = () => {
    setSelectedCategory("");
    setLocationRange(50);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="px-4 py-2 border-[#96F49D] border rounded-full flex items-center gap-2 text-white bg-[#96F49D] transition-all hover:bg-transparent hover:text-[#96F49D] "
      >
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
          className="lucide lucide-filter"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filter
      </button>
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 top-full mt-2 w-96 bg-white shadow-lg border border-gray-300 rounded-lg p-4"
        >
          {/* Category Selection */}
          <label
            htmlFor="category"
            className="block text-gray-700 font-bold mb-2"
          >
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          >
            <option value="">Select Category</option>
            <option value="chemical">Chemical</option>
            <option value="paper">Paper</option>
            <option value="metal">Metal</option>
          </select>

          {/* Location Range */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="price-range"
              className="block text-gray-700 font-bold "
            >
              Location Range
            </label>
            <p className="text-sm text-gray-700 mt-1">{locationRange} KM</p>
          </div>
          <input
            type="range"
            className="w-full accent-[#96F49D]"
            min="5"
            max="50"
            value={locationRange ? locationRange : 0}
            onChange={handleLocationChange}
          />

          <div className="text-end">
            <button className="text-rose-600 font-medium" onClick={clearFilter}>
              Clear Filter
            </button>
          </div>

          {/* Price Range */}
          {/* <div className="flex items-center justify-between mt-3">
            <label
              htmlFor="price-range"
              className="block text-gray-700 font-bold mb-2"
            >
              Price Range
            </label>
            <p className="text-sm text-gray-500 mt-1">${priceRange}</p>
          </div>
          <input
            type="range"
            id="price-range"
            className="w-full accent-[#96F49D]"
            min="0"
            max="1000"
            value={priceRange}
            onChange={(e: any) => setPriceRange(e.target.value)}
          /> */}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;