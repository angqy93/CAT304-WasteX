"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { toast } from "react-hot-toast"; // Import toast

const CreateAccount = () => {
  const router = useRouter(); // For routing after account creation

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone_number: Yup.string()
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, "Phone number must be at least 10 digits")
      .required("Phone number is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Must contain an uppercase letter")
      .matches(/[a-z]/, "Must contain a lowercase letter")
      .matches(/[0-9]/, "Must contain a number")
      .matches(/[!@#$%^&*(),.?\":{}|<>]/, "Must contain a special character"),
    name: Yup.string().required("Name is required"),
    address: Yup.string(),
    postcode: Yup.string(),
    state: Yup.string(),
    country: Yup.string().required("Country is required"),
  });

  const initialValues = {
    email: "",
    phone_number: "",
    password: "",
    name: "",
    address: "",
    postcode: "",
    state: "",
    country: "",
  };

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSubmit = async (
    values: any,
    { setSubmitting }: { setSubmitting: any }
  ) => {
    try {
      console.log("Submitting form with values:", values);

      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData?.message || "Registration failed");
      }

      const data = await response.json();
      console.log("API Response:", data);
      toast.success("Account created successfully!", {
        position: "bottom-right",
        duration: 3000,
      });

      // Redirect to login page
      router.push("/login");
    } catch (error: any) {
      console.error("Error:", error.message);
      toast.error(error.message || "An error occurred during registration.", {
        position: "bottom-right",
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12">
      <div className="py-10 md:px-16 px-6 md:w-1/2 w-10/12 mx-auto border-[3px] rounded-3xl h-full">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <h2 className="md:text-4xl text-3xl font-medium text-center mb-7">
                Create an account
              </h2>

              <div className="my-4">
                <label className="text-gray-400">Email*</label>
                <Field
                  type="email"
                  name="email"
                  className="w-full border-[3px] py-2.5 px-2 rounded-xl"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red text-sm"
                />
              </div>

              <div className="my-4">
                <label className="text-gray-400">Phone Number*</label>
                <Field
                  type="tel"
                  name="phone_number"
                  className="w-full border-[3px] py-2.5 px-2 rounded-xl"
                />
                <ErrorMessage
                  name="phone_number"
                  component="div"
                  className="text-red text-sm"
                />
              </div>

              <div className="my-4">
                <label className="text-gray-400">Password*</label>
                <Field
                  type="password"
                  name="password"
                  className="w-full border-[3px] py-2.5 px-2 rounded-xl"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red text-sm"
                />
              </div>

              <div className="mt-4">
                <ul className="text-gray-400 grid md:grid-cols-2 grid-cols-1 gap-3 list-disc list-inside">
                  <li className="text-black">
                    Password must be at least 8 characters
                  </li>
                  <li className="text-black">
                    Must contain uppercase and lowercase letters
                  </li>
                  <li className="text-black">Must contain a number</li>
                  <li className="text-black">
                    Must contain a special character (!@#$%^&*)
                  </li>
                </ul>
              </div>

              <div className="my-4">
                <label className="text-gray-400">Name*</label>
                <Field
                  type="text"
                  name="name"
                  className="w-full border-[3px] py-2.5 px-2 rounded-xl"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red text-sm"
                />
              </div>

              <div className="my-4">
                <label className="text-gray-400">Address</label>
                <Field
                  type="text"
                  name="address"
                  className="w-full border-[3px] py-2.5 px-2 rounded-xl"
                />
              </div>

              <div className="my-4 flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-0">
                <div className="md:w-[45%]">
                  <label className="text-gray-400">Postcode</label>
                  <Field
                    type="text"
                    name="postcode"
                    className="w-full border-[3px] py-2.5 px-2 rounded-xl"
                  />
                </div>
                <div className="md:w-[45%]">
                  <label className="text-gray-400">State</label>
                  <Field
                    type="text"
                    name="state"
                    className="w-full border-[3px] py-2.5 px-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="my-4">
                <label className="text-gray-400">Country*</label>
                <Field
                  type="text"
                  name="country"
                  className="w-full border-[3px] py-2.5 px-2 rounded-xl"
                />
                <ErrorMessage
                  name="country"
                  component="div"
                  className="text-red text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2.5 rounded-full bg-gray-400 w-full mt-7 text-white text-lg font-medium"
              >
                {isSubmitting ? "Submitting..." : "Create Account"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-sm text-center mt-5">
          By creating an account, you agree to the{" "}
          <span className="underline">Terms of use</span> and{" "}
          <span className="underline">Privacy Policy.</span>
        </p>
        <p className="text-sm text-center mt-3">
          Already have an account?{" "}
          <Link href="/login">
            <span className="font-semibold underline">Log in</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CreateAccount;