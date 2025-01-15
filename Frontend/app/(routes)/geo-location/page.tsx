"use client";

import React, { useEffect, useState } from "react";
import LocationCard from "@/app/components/Cards/LocationCard";
import toast from "react-hot-toast";
import Image from "next/image";

import MapComponent from "@/app/components/Map/Map";
import FilterDropdown from "@/app/components/Filter/FilterDropdown";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const GeoLocation: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<any>(null);
  const [products, setProducts] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      // setLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/products/public`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.data);
      } catch (error: any) {
        console.error("Error fetching products:", error.message);
        toast.error(error.message || "Failed to load products", {
          position: "bottom-right",
        });
      } finally {
        // setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = searchTerm
    ? products?.filter((product: any) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const updatePrice = () => {};
  return (
    <div className="md:px-12 px-4 pt-6 flex flex-col lg:flex-row gap-5 lg:h-[83vh]">
      <div className="2xl:w-[40%] xl:w-2/4 xl:overflow-y-auto xl:max-h-[800px] px-2">
        {/* Filters */}
        <div>
          <FilterDropdown setProducts={setProducts} />
        </div>
        <div className="py-4 border-b">
          <input
            type="text"
            placeholder="Search Products"
            className="w-full px-4 py-2 border rounded-full bg-gray-100 focus-visible:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="xl:hidden md:h-[40dvh] h-[30dvh] my-10 rounded-lg overflow-hidden">
          <MapComponent products={products} />
        </div>

        {filteredProducts?.map((location: any) => (
          <Link
            key={location.id}
            href={`/products/${location.id}`}
            className="mb-4 cursor-pointer xl:mt-5"
          >
            <LocationCard location={location} />
          </Link>
        ))}
      </div>

      <div className="2xl:w-[60%] xl:w-2/4 hidden xl:flex bg-gray-100 rounded-lg items-center justify-center overflow-hidden">
        <MapComponent products={products} />
      </div>
    </div>
  );
};

export default GeoLocation;