"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  pinCode: Yup.string()
    .required("Pin Code is required")
    .min(6, "Pin Code must be at least 6 characters"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long"),
  repeatPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Repeat Password is required"),
});

const ForgotPassword = () => {
  const handleSubmit = (
    values: {
      email: string;
      pinCode: string;
      password: string;
      repeatPassword: string;
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    console.log(values);
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen md:py-12 py-6">
      <div className="py-10 md:px-16 px-6 md:w-1/2 w-10/12 mx-auto border-[3px] rounded-3xl h-full">
        <h2 className="text-4xl font-medium text-center">Forgot Password</h2>
        <p className="text-sm underline text-end font-semibold -mb-7 mt-7 cursor-pointer">
          Send Pin Code?
        </p>
        <Formik
          initialValues={{
            email: "",
            pinCode: "",
            password: "",
            repeatPassword: "",
          }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div className="my-7">
                <label className="text-gray-400">Email*</label>
                <Field
                  type="email"
                  name="email"
                  className={`w-full border-[3px] py-2.5 px-2 rounded-xl ${
                    touched.email && errors.email ? "border-red-500" : ""
                  }`}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="my-7">
                <label className="text-gray-400">Pin Code*</label>
                <Field
                  type="text"
                  name="pinCode"
                  className={`w-full border-[3px] py-2.5 px-2 rounded-xl ${
                    touched.pinCode && errors.pinCode ? "border-red-500" : ""
                  }`}
                />
                <ErrorMessage
                  name="pinCode"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="my-7">
                <label className="text-gray-400">Password*</label>
                <Field
                  type="password"
                  name="password"
                  className={`w-full border-[3px] py-2.5 px-2 rounded-xl ${
                    touched.password && errors.password ? "border-red-500" : ""
                  }`}
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-gray-400">Repeat Password*</label>
                <Field
                  type="password"
                  name="repeatPassword"
                  className={`w-full border-[3px] py-2.5 px-2 rounded-xl ${
                    touched.repeatPassword && errors.repeatPassword
                      ? "border-red-500"
                      : ""
                  }`}
                />
                <ErrorMessage
                  name="repeatPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2.5 rounded-full bg-green w-full mt-14 mb-7 text-white text-lg font-medium"
              >
                Change password
              </button>
              <Link href="/login">
                <button className="py-2.5 rounded-full bg-gray-400 w-full text-white text-lg font-medium">
                  Back to login
                </button>
              </Link>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ForgotPassword;
