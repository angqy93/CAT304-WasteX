"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import ConfirmationModal from "@/app/components/Cards/ConfirmModal";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const PurchaseOrder = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Fetch purchase orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/orders?type=purchase`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch purchase orders");
        }

        const data = await response.json();
        console.log("Fetched Orders:", data.data);
        setOrders(data.data);
      } catch (error: any) {
        console.error("Error fetching purchase orders:", error);
        toast.error(error.message || "Failed to fetch purchase orders", {
          position: "bottom-right",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Open confirmation modal
  const openModal = (orderId: number, status: string) => {
    setSelectedOrderId(orderId);
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  // Close confirmation modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
    setSelectedStatus("");
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    if (!selectedOrderId) return;

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/orders/${selectedOrderId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: selectedStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update order status to ${selectedStatus}`);
      }

      toast.success(`Order marked as ${selectedStatus}!`, {
        position: "bottom-right",
      });

      // Update the order list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrderId
            ? { ...order, status: selectedStatus }
            : order
        )
      );
      closeModal();
    } catch (error: any) {
      console.error(`Error updating order status to ${selectedStatus}:`, error);
      toast.error(
        error.message || `Failed to update order status to ${selectedStatus}`,
        {
          position: "bottom-right",
        }
      );
    }
  };

  return (
    <div className="bg-productBG md:px-12 px-4 py-12 min-h-[83vh]">
      <div className="bg-white py-2.5 font-semibold pl-5 rounded-xl">
        Purchase Orders
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        confirmAction={confirmStatusChange}
        title="Confirm Order Status Change"
        description={`Are you sure you want to mark this order as ${selectedStatus}?`}
        confirmButtonText={`Yes, mark as ${selectedStatus}`}
      />

      {/* Loading State */}
      {loading ? (
        <p className="text-center mt-5 text-gray-600">
          Loading purchase orders...
        </p>
      ) : orders.length === 0 ? (
        <p className="text-center mt-5 text-gray-600">
          No purchase orders found.
        </p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="mt-5">
            <div className="md:hidden bg-white py-2.5 px-5 rounded-xl flex flex-col items-center space-y-4">
              <div className="w-full flex items-center space-x-4">
                <div className="w-24 h-24">
                  <Image
                    src={order.product.image}
                    alt="Product_Image"
                    width={100}
                    height={100}
                    className="object-cover rounded-full w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-semibold">{order.product.title}</p>
                  <p className="text-gray-400 text-sm">
                    {order.quantity} {order.product.unit}
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
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Seller</p>
                  <p className="font-semibold">{order.seller.name}</p>
                  <p className="font-semibold text-sm opacity-70">+123456789</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Total Amount</p>
                  <p className="font-semibold">$ {order.total_amount}</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                {order.status === "pending" ? (
                  <>
                    <button
                      onClick={() => openModal(order.id, "cancelled")}
                      className="text-white bg-red px-5 py-1.5 rounded-lg"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <p
                    className={`font-semibold ${
                      order.status === "delivered"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </p>
                )}
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:flex bg-white py-2.5 px-5 rounded-xl justify-between items-center">
              <div className="w-24 h-24">
                <Image
                  src={order.product.image}
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
                  <p className="font-semibold">{order.product.title}</p>
                  <p className="text-gray-400 text-sm">
                    {order.quantity} {order.product.unit}
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
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-col border-l-[3px] border-gray-300 pl-5">
                <p className="text-gray-400 text-sm text-center">Seller</p>
                <p className="font-semibold">{order.seller.name}</p>
                <p className="font-semibold text-sm opacity-70 text-center">
                  {order.seller.phone_number}
                </p>
              </div>
              <div className="flex items-center gap-7 border-l-[3px] border-gray-300 pl-5">
                <p className="font-semibold">$ {order.total_amount}</p>
              </div>
              <div className="text-center space-x-7">
                {order.status === "pending" ? (
                  <>
                    <button
                      onClick={() => openModal(order.id, "cancelled")}
                      className="text-white bg-red px-5 py-1.5 rounded-lg"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <p
                    className={`font-semibold p-2 rounded-lg ${
                      order.status === "delivered"
                        ? "text-white bg-green"
                        : "text-white bg-red"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PurchaseOrder;