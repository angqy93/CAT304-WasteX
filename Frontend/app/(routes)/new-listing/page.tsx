"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import LocationPicker from "@/app/components/Cards/LocationPicker";
import * as Yup from "yup";
import axios from "axios";
import { MdTitle } from "react-icons/md";
import Loader from "@/app/components/loader/Loader";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const NewListing = () => {
  const router = useRouter();
  const accessToken = localStorage.getItem("access_token");
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("chemical");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("litre");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState<any>(null);
  const [errors, setErrors] = useState({
    title: false,
    description: false,
    price: false,
    quantity: false,
    image: false,
    location: false,
  });

  // Convert image to Base64 format
  const convertToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64Image: any = await convertToBase64(file);
      setImage(base64Image);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const newErrors = {
      title: !title.trim(),
      description: !description.trim(),
      price: !price,
      quantity: !quantity,
      image: !image,
      location: !location,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    const payload = {
      title: title,
      description: description,
      lat: location.lat,
      lng: location.lng,
      location: location.name,
      category: category,
      quantity: quantity,
      unit: unit,
      price: price,
      product_status: "listed",
      image: image,
    };

    setLoading(true);

    axios
      .post(`${BACKEND_URL}/api/products`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response: any) => {
        console.log(response);
        router.push("/products");
      })
      .catch((err) => {
        console.log(err);
        if (err.status == 401) {
          localStorage.clear();
          router.push("/login");
        }
      })
      .finally(() => {
        setLoading(false);
      });
    return;

    try {
      const payload = {
        // title: values.name,
        // description: values.description,
        // lat: values.location_lat, // Ensure lat is passed
        // lng: values.location_lng, // Ensure lng is passed
        // location: values.location,
        // category: values.category,
        // quantity: values.quantity,
        // unit: values.unit,
        // price: values.price,
        // product_status: "listed",
        // image: values.image || null,
      };

      console.log("Payload:", payload);

      const response = await fetch(`${BACKEND_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const hasFieldErrors =
          errorData?.data && Object.keys(errorData.data).length > 0;

        if (!hasFieldErrors) {
          toast.error(errorData?.message || "Failed to create product", {
            position: "bottom-right",
          });
        }

        if (errorData?.data) {
          Object.entries(errorData.data).forEach(([field, errors]) => {
            (errors as string[]).forEach((error) => {
              toast.error(`${field}: ${error}`, {
                position: "bottom-right",
              });
            });
          });
        }

        throw new Error(errorData?.message || "Failed to create product");
      }

      toast.success("Product created successfully!", {
        position: "bottom-right",
      });
      router.push("/products");
    } catch (error: any) {
      toast.error(error.message || "An error occurred", {
        position: "bottom-right",
      });
    } finally {
      // setSubmitting(false);
    }
  };

  useEffect(() => {
    
    let debounceTimer: NodeJS.Timeout;

    const makeRequest = async () => {
      if (
        title?.trim().length > 4 &&
        category?.trim() &&
        !isRequestInProgress
      ) {
        setIsRequestInProgress(true);
        try {
          const response = await axios.post(
            `${BACKEND_URL}/api/products/chat-gpt-re-write-dec`,
            { title, category },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          setDescription(response.data.data.improved_desc);
        } catch (err: any) {
          if (err.response?.status === 401) {
            localStorage.clear();
            router.push("/login");
          }
        } finally {
          setIsRequestInProgress(false);
        }
      }
    };

    // Clear previous debounce timer
    clearTimeout(debounceTimer);

    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
      if (title?.trim().length > 4) {
        makeRequest();
      }
    }, 500); // Debounce time (500ms)

    // Cleanup debounce timer on unmount or dependency change
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [title, category]); // Trigger on title or category changes


  if (loading) {
    return <Loader />;
  }
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:px-12 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col md:flex-row gap-12"
      >
        <div className="md:w-1/2">
          {/* Image Picker */}
          <div className="w-full h-[320px] relative cursor-pointer border-[3px] rounded-lg bg-gray-100">
            {image ? (
              <div className="relative w-full h-[320px] border-[3px] rounded-lg bg-gray-100">
                <img
                  src={image}
                  alt="Selected Product"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-3 right-3 bg-red text-white px-3 py-1 rounded-full text-xs shadow-md"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <label
                  htmlFor="imagePicker"
                  className="text-gray-400 cursor-pointer"
                >
                  Click to select an image
                </label>
              </div>
            )}
            <input
              id="imagePicker"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          {errors.image && <p className="text-red">*Image is required</p>}

          {/* Name */}
          <div className="mt-5">
            <label className="font-semibold mb-2 flex items-center gap-2">
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
                className="lucide lucide-a-large-small"
              >
                <path d="M21 14h-5" />
                <path d="M16 16v-3.5a2.5 2.5 0 0 1 5 0V16" />
                <path d="M4.5 13h6" />
                <path d="m3 16 4.5-9 4.5 9" />
              </svg>
              Name
            </label>
            <input
              type="text"
              placeholder="Product Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full border-[3px] h-[45px] px-2 rounded-xl ${
                errors.title ? "border-red-500" : "border-gray-200"
              } bg-gray-200`}
            />
            {errors.title && <p className="text-red">*Name is required</p>}
          </div>

          {/* Location */}
          <LocationPicker
            name="location"
            setLocation={setLocation}
            location={location}
          />
          {errors.location && <p className="text-red">*Location is required</p>}

          <div className="flex flex-col md:flex-row justify-between md:gap-8 gap-5 mt-5">
            <div className="flex-1">
              <label className="font-semibold mb-2 flex items-center gap-2">
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
                  className="lucide lucide-list"
                >
                  <path d="M3 12h.01" />
                  <path d="M3 18h.01" />
                  <path d="M3 6h.01" />
                  <path d="M8 12h13" />
                  <path d="M8 18h13" />
                  <path d="M8 6h13" />
                </svg>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full border-[3px] h-[45px] px-2 rounded-xl border-gray-200 bg-gray-200`}
              >
                <option value="chemical">Chemical</option>
                <option value="paper">Paper</option>
                <option value="metal">Metal</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="font-semibold mb-2 flex items-center gap-2">
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
                  className="lucide lucide-dollar-sign"
                >
                  <line x1="12" x2="12" y1="2" y2="22" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Price
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full border-[3px] h-[45px] px-2 rounded-xl ${
                  errors.price ? "border-red-500" : "border-gray-200"
                } bg-gray-200`}
              />
              {errors.price && (
                <p className="text-red">*Valid price is required</p>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-5">
            <label className="font-semibold mb-1 flex items-center gap-2">
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
                className="lucide lucide-hash"
              >
                <line x1="4" x2="20" y1="9" y2="9" />
                <line x1="4" x2="20" y1="15" y2="15" />
                <line x1="10" x2="8" y1="3" y2="21" />
                <line x1="16" x2="14" y1="3" y2="21" />
              </svg>
              Quantity
            </label>
            <div className="flex items-center gap-5">
              <span className="flex-1">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`w-full border-[3px] h-[45px] px-2 rounded-xl ${
                    errors.quantity ? "border-red-500" : "border-gray-200"
                  } bg-gray-200`}
                />
                {errors.quantity && (
                  <p className="text-red">*Valid quantity is required</p>
                )}
              </span>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={`md:w-3/12 border-[3px] h-[45px] px-2 rounded-xl border-gray-200 bg-gray-200`}
              >
                <option value="litre">Litre</option>
                <option value="kilogram">kg</option>
              </select>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 md:border-l-[2px] md:border-gray-100 md:pl-12">
          {/* Description */}
          <div className="">
            <div className="flex justify-between items-center mb-3">
              <label className="font-semibold flex items-center gap-2">
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
                  className="lucide lucide-letter-text"
                >
                  <path d="M15 12h6" />
                  <path d="M15 6h6" />
                  <path d="m3 13 3.553-7.724a.5.5 0 0 1 .894 0L11 13" />
                  <path d="M3 18h18" />
                  <path d="M4 11h6" />
                </svg>
                Description
              </label>
              <p
                className="bg-[#3E4958] text-white text-sm px-5 py-1 rounded-lg"
              >
                Auto AI-analysis
              </p>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full border-[3px] bg-gray-200 h-56 py-2.5 px-2 rounded-xl resize-none ${
                errors.description ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.description && (
              <p className="text-red">*Description is required</p>
            )}
          </div>

          <div className="text-center space-x-7 mt-5">
            <button
              type="submit"
              className="text-white bg-green px-5 py-1.5 rounded-lg"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => console.log("Canceled")}
              className="text-white bg-red px-5 py-1.5 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewListing;
