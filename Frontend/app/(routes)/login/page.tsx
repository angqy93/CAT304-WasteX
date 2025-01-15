"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { toast } from "react-hot-toast"; // Import hot toast
import { useUser } from "@/app/context/UserContext"; // Import UserContext
import Cookies from "js-cookie";

// Access the environment variable directly
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const router = useRouter(); // Initialize router for redirection
  const { refetchUser } = useUser(); // Use refetchUser from UserContext

  const handleSubmit = async (
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: any }
  ) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Login failed");
      }

      const data = await response.json();
      console.log("Login successful:", data);

      // Store the access token in localStorage
      localStorage.setItem("access_token", data.data.access);
      Cookies.set("access_token", data.data.access, { expires: 1, path: "/", secure: true });

      toast.success("Login successful!", {
        position: "bottom-right",
        duration: 3000,
      });

      // Refetch user data from context after login
      await refetchUser();

      // Redirect to homepage
      router.push("/");
    } catch (error: any) {
      console.error("Login error:", error.message);
      toast.error(error.message || "An error occurred during login.", {
        position: "bottom-right",
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen md:py-12 py-6">
      <div className="py-10 md:px-16 px-6 md:w-1/2 w-10/12 mx-auto border-[3px] rounded-3xl h-full">
        <h2 className="text-4xl font-medium text-center">Sign in</h2>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div className="my-7">
                <label className="text-gray-400">Email</label>
                <Field
                  type="email"
                  name="email"
                  className={`w-full border-[3px] py-2.5 px-2 rounded-xl ${touched.email && errors.email ? "border-red-500" : ""
                    }`}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-gray-400">Password</label>
                <Field
                  type="password"
                  name="password"
                  className={`w-full border-[3px] py-2.5 px-2 rounded-xl ${touched.password && errors.password ? "border-red-500" : ""
                    }`}
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`py-2.5 rounded-full ${isSubmitting ? "bg-gray-300" : "bg-gray-400"
                  } w-full mt-14 text-white text-lg font-medium`}
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-sm text-center mt-3">
          By continuing, you agree to the{" "}
          <span className="underline">Terms of use</span> and{" "}
          <span className="underline">Privacy Policy.</span>
        </p>
        <Link href="/forgot-password">
          <p className="text-sm underline text-end mt-9">Forgot your password</p>
        </Link>
      </div>

      <div className="my-5 flex items-center gap-5">
        <div className="md:w-56 w-16 bg-gray-400 h-[1px]"></div>
        <p className="text-gray-400 md:text-2xl text-lg">
          New to our community
        </p>
        <div className="md:w-56 w-16 bg-gray-400 h-[1px]"></div>
      </div>
      <Link
        href="/create-account"
        className="py-2.5 rounded-full border border-black text-lg font-medium md:w-1/2 w-10/12 mx-auto text-center"
      >
        <button>Create an account</button>
      </Link>
    </div>
  );
};

export default Login;
