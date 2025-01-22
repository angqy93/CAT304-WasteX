"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/app/components/Cards/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Products = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]); // State for fetched products
  const [loading, setLoading] = useState(false);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/products/public`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.data); // Store the fetched products in state
        toast.success("Products fetched successfully!", {
          position: "bottom-right",
        });
      } catch (error: any) {
        console.error("Error fetching products:", error.message);
        toast.error(error.message || "Failed to load products", {
          position: "bottom-right",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Toggle filter state
  const toggleFilter = () => setIsFilterOpen((prev) => !prev);

  // Handle tag filtering
  const handleTagClick = (tag: string) => {
    setSelectedTag((prevTag) => (prevTag === tag ? null : tag));
  };

  const filteredProducts = selectedTag
    ? products.filter(
        (product) =>
          product.category.toLowerCase() === selectedTag.toLowerCase()
      )
    : products;

  return (
    <div className=" md:px-12 px-4 py-12">
      <div className="flex items-center md:gap-5 gap-3">
        <div
          className={`flex items-center gap-2 md:p-3 p-2 text-sm md:text-base rounded-md w-fit cursor-pointer border border-black transition-colors duration-300 ${
            isFilterOpen 
            ? "bg-[#32CD32] text-white border-white hover:border-white hover:bg-[#76EE76]" // Active state with light green hover
            : "bg-white text-black border-black hover:border-white hover:bg-[#ccffcc]" // Default state with light green hover
        }`}
          onClick={toggleFilter}
        >
          <Image
            src="/Images/Filter.svg"
            alt="Filter_Icon"
            width={16}
            height={16}
          />
          Filters
        </div>

        {isFilterOpen && (
          <>
            {["Chemical", "Paper", "Metal"].map((tag) => (
              <div
                key={tag}
                className={`flex items-center gap-3 md:px-6 px-4 md:py-3 py-2 rounded-full w-fit cursor-pointer text-sm md:text-base 
                    ${
                      selectedTag === tag
                        ? tag === "Chemical"
                          ? "bg-yellow-200 hover:bg-yellow-300"
                          : tag === "Paper"
                          ? "bg-gray-200 hover:bg-gray-300"
                          : "bg-orange-200 hover:bg-orange-300"
                        : "bg-white hover:bg-gray-100"
                    }`}
                onClick={() => handleTagClick(tag)}
              >
                {selectedTag === tag && (
                  <Image
                    src="/Images/Close.svg"
                    alt="Close_Icon"
                    width={16}
                    height={16}
                  />
                )}
                {tag}
              </div>
            ))}
          </>
        )}
      </div>

      {loading ? (
        <p className="text-center mt-10 text-gray-600">Loading products...</p>
      ) : (
        <div className="flex flex-wrap gap-10 mt-10">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <>
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="basis-[250px] max-md:flex-grow"
                >
                  <ProductCard product={product} />
                </Link>
              </>
            ))
          ) : (
            <p className="col-span-5 text-center text-gray-500">
              No products found.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;