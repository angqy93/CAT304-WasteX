"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Plus } from "lucide-react";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const SalesOrder = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<number | null>(null); // Track the product being deleted

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const response = await fetch(`${BACKEND_URL}/api/products`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.data);
      } catch (error: any) {
        console.error("Error fetching products:", error);
        toast.error(error.message || "Failed to fetch products", {
          position: "bottom-right",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Delete product function
  const handleDeleteProduct = async (productId: number) => {
    const token = localStorage.getItem("access_token");

    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeleting(productId); // Show loading state for this product
    try {
      const response = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      // Remove the deleted product from the state
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );

      toast.success("Product deleted successfully!", {
        position: "bottom-right",
      });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product.", {
        position: "bottom-right",
      });
    } finally {
      setDeleting(null); // Reset the deleting state
    }
  };

  return (
    <div className="bg-productBG md:px-12 px-4 py-12 min-h-[83vh]">
      <div className="bg-white py-4 font-semibold px-5 rounded-xl shadow-md text-lg text-gray-700 flex justify-between">
        <div className="flex items-center">
          Product lists
        </div>
        <div>
          <Link href="/new-listing">
            <button
              className="bg-gray-500 text-white text-md p-3 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300bg-gray-500 text-white text-sm p-2 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300bg-black text-white p-2 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors duration-300"
            >
              <Plus />
            </button>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <p className="text-center mt-5 text-gray-600">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-center mt-5 text-gray-600">No products found.</p>
      ) : (
        products.map((product) => (
          <div key={product.id}>
            {/* Mobile View */}
            <div className="md:hidden bg-white py-2.5 font-semibold px-5 rounded-xl mt-5 flex flex-col items-center space-y-4">
              <div className="w-full flex items-center space-x-4">
                <div className="w-24 h-24">
                  <Image
                    src={product.image}
                    alt="Product_Image"
                    width={100}
                    height={100}
                    className="object-cover rounded-full w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-semibold">{product.title}</p>
                  <p className="text-gray-400 text-sm">
                    {product.quantity} {product.unit}
                  </p>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Image
                    src="/Images/Calendar.svg"
                    alt="Calendar_Icon"
                    width={20}
                    height={20}
                  />
                  <span>
                    {new Date(product.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Status</p>
                  <p className="font-semibold capitalize">
                    {product.product_status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total Amount</p>
                  <p className="font-semibold">$ {product.price}</p>
                </div>
              </div>

              <div className="actions gap-4 flex">
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={deleting === product.id}
                  className="text-white bg-red px-5 py-1.5 rounded-lg disabled:bg-gray-400"
                >
                  {deleting === product.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:flex bg-white py-2.5 font-semibold px-5 rounded-xl mt-5 justify-between items-center">
              <div className="w-24 h-24">
                <Image
                  src={product.image}
                  alt="Product_Image"
                  width={100}
                  height={100}
                  className="object-cover rounded-full w-full h-full"
                />
              </div>
              <div className="flex items-center gap-7 border-l-[3px] border-gray-300 pl-5">
                <Image
                  src="/Images/Tag.svg"
                  alt="Tag_Icon"
                  width={35}
                  height={35}
                />
                <div className="flex flex-col">
                  <p className="font-semibold">{product.title}</p>
                  <p className="text-gray-400 text-sm">
                    {product.quantity} {product.unit}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-7 border-l-[3px] border-gray-300 pl-5">
                <Image
                  src="/Images/Calendar.svg"
                  alt="Calendar_Icon"
                  width={35}
                  height={35}
                />
                <p className="font-semibold">
                  {new Date(product.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-col border-l-[3px] border-gray-300 pl-5">
                <p className="text-gray-400 text-sm text-center">Status</p>
                <p className="font-semibold capitalize">
                  {product.product_status}
                </p>
              </div>
              <div className="flex items-center gap-7 border-l-[3px] border-gray-300 pl-5">
                <p className="font-semibold">$ {product.price}</p>
              </div>
              <div className="actions gap-4 flex">
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={deleting === product.id}
                  className="text-white bg-red px-5 py-1.5 rounded-lg disabled:bg-gray-400"
                >
                  {deleting === product.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SalesOrder;
