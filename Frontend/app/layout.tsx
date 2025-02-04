import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/layout/Header";
import { Toaster } from "react-hot-toast"; // Import the Toaster component
import { UserProvider } from "@/app/context/UserContext"; // Import the UserProvider

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "WasteX",
  description: "Recycling for corporates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          {" "}
          {/* Wraps the entire app */}
          <Header />
          <Toaster /> {/* Toasts will be displayed across all pages */}
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
