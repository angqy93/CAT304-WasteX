"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import ConfirmationModal from "@/app/components/Cards/ConfirmModal";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const ProductDetails = () => {
  const { slug } = useParams(); // `slug` is the product ID
  const router = useRouter();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission loading state

  // Fetch product details on mount
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/products/public/${slug}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }

        const data = await response.json();
        setProduct(data.data);
        setTotalPrice(parseFloat(data.data.price) || 0);
        toast.success("Product details fetched successfully!", {
          position: "bottom-right",
        });
      } catch (error: any) {
        console.error("Error fetching product details:", error.message);
        toast.error(error.message || "Failed to load product details", {
          position: "bottom-right",
        });
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  // Calculate total price when quantity changes
  useEffect(() => {
    if (product) {
      const pricePerUnit = parseFloat(product.price) || 0;
      setTotalPrice(pricePerUnit * quantity);
    }
  }, [quantity, product]);

  // Open modal when clicking "Place Order"
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle order placement
  const confirmPlaceOrder = async () => {
    if (!product) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Please log in to place an order.", {
        position: "bottom-right",
      });
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than zero.", {
        position: "bottom-right",
      });
      return;
    }

    const payload = {
      product_id: product.id,
      quantity: quantity,
      total_amount: totalPrice,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to place order");
      }

      toast.success("Order placed successfully!", {
        position: "bottom-right",
      });
      closeModal(); // Close modal after successful order
      router.push("/purchased-order");
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(
        error.message || "An error occurred while placing the order.",
        {
          position: "bottom-right",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle "Start Chat with Seller"
  const handleStartChat = async () => {
    if (!product) return;

    const receiverId = product.created_by.id;
    const token = localStorage.getItem("access_token");

    if (!token) {
      toast.error("Please log in to start a chat.", {
        position: "bottom-right",
      });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/conversations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reciever_id: receiverId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start chat");
      }

      const data = await response.json();
      toast.success("Chat started successfully!", {
        position: "bottom-right",
      });

      // Redirect to chat page with conversation ID
      router.push(`/chat`);
    } catch (error: any) {
      console.error("Error starting chat:", error);
      toast.error(error.message || "Failed to start chat.", {
        position: "bottom-right",
      });
    }
  };

  const formatDescription = (description: any) => {
    let formattedDescription = description?.replace(/\n/g, "<br />");
    formattedDescription = formattedDescription?.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );
    return formattedDescription;
  };

  const formattedDescription = formatDescription(product?.description);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-600">
        Loading product details...
      </p>
    );
  }

  if (!product) {
    return <p className="text-center mt-10 text-red-500">Product not found</p>;
  }

  return (
    <div className="bg-productBG md:px-12 px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between gap-10">
        <div className="md:w-7/12">
          <div className="md:w-11/12 h-[320px]">
            <Image
              src={product.image}
              alt={product.title}
              width={280}
              height={320}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <h2 className="font-semibold text-2xl mt-5 mb-2">{product.title}</h2>
          <p
            className="text-gray-600"
            dangerouslySetInnerHTML={{ __html: formattedDescription }}
          />
          <div className="mt-5 border-t border-b border-gray-300 py-5 space-y-5">
            <div className="flex gap-3">
              <div>
                <Image
                  src="/Images/Building.svg"
                  alt="Building_Icon"
                  width={25}
                  height={25}
                  className="mt-1"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Location</h3>
                <p className="text-gray-600">{product.location || "N/A"}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div>
                <Image
                  src="/Images/Star.svg"
                  alt="Star_Icon"
                  width={20}
                  height={20}
                  className="mt-1"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Contact Number</h3>
                <p className="text-gray-600">
                  <Link
                    href={`tel:${product.created_by.phone || "+0000000000"}`}
                  >
                    {product.created_by.phone || "Not available"}
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleStartChat}
            className="bg-green text-white py-3 px-10 rounded-md mt-2"
          >
            Start Chat With Seller
          </button>
        </div>
        <div className="md:w-5/12">
          <div className="md:w-8/12 font-medium">
            <div className="flex justify-between items-center">
              <p>Price:</p>${product.price}
            </div>
            <div className="flex justify-between items-center border-t border-b border-gray-600 py-3 my-3">
              <p>Shipping:</p>
              <p>Free</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Total:</p>${totalPrice.toFixed(2)}
            </div>
            <div className="my-5  flex-col gap-4 hidden">
              <label htmlFor="quantity" className="text-lg font-semibold">
                Quantity:
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-1/2 border-[3px] py-2 px-3 rounded-lg bg-gray-100"
                  min={1}
                />
                <input
                  type="text"
                  value={`$${totalPrice.toFixed(2)}`}
                  disabled
                  className="w-1/2 border-[3px] py-2 px-3 rounded-lg bg-gray-200 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="my-5 flex items-center">
              <input
                type="radio"
                id="cashOnDelivery"
                name="paymentMethod"
                className="mr-2"
                defaultChecked
              />
              <label htmlFor="cashOnDelivery">Cash on delivery</label>
            </div>

            <button
              onClick={openModal}
              className="bg-green text-white py-3 px-10 rounded-md"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        confirmAction={confirmPlaceOrder}
        title="Confirm Order"
        description={`Are you sure you want to place an order for ${quantity} ${
          quantity > 1 ? "units" : "unit"
        } at a total price of $${totalPrice.toFixed(2)}?`}
        confirmButtonText="Yes, Place Order"
      />
    </div>
  );
};

export default ProductDetails;
