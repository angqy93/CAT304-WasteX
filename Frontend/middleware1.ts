import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Middleware to validate token
export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  // If no token, redirect to login
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Send "verify_token" API request
    const response = await fetch(`${BACKEND_URL}/api/verify_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Send token in Authorization header
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const data = await response.json();

    // Check if token is invalid
    if (!data.valid) {
      return NextResponse.redirect(new URL("/login", request.url)); // Redirect if `valid: false`
    }

    // If token is valid, proceed with the request
    return NextResponse.next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.redirect(new URL("/login", request.url)); // Redirect on error
  }
}

// Middleware configuration
export const config = {
  matcher: [
    "/products",
    "/chat",
    "/new-listing",
    "/geo-location",
    "/profile-settings",
    "/products-listing",
    "/sales-order",
    "/purchased-order",
  ], // Protected routes
};
