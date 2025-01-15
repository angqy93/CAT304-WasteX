"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
// import { useRouter } from "next/router";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface UserContextType {
  user: any | null;
  loadingUser: boolean;
  error: string | null;
  lastActiveData: any | null; // New field to store last active data
  refetchUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<any | null>>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastActiveData, setLastActiveData] = useState<any | null>(null); // State to store the last active response

  // Function to fetch user data
  const fetchUser = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        setUser(null);
        setLoadingUser(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      setUser(data);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      if (error.status == 401) {
        localStorage.clear();
        router.push("/home");
      }
      setUser(null);
      setError("Failed to fetch user details.");
    } finally {
      setLoadingUser(false);
    }
  };

  // Function to refetch user data manually (for profile updates, etc.)
  const refetchUser = async () => {
    setLoadingUser(true);
    await fetchUser();
  };

  // Function to log out user
  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
      });
      localStorage.removeItem("access_token");
      Cookies.remove("access_token", { path: "/" });
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Function to update the user's active status
  const updateActiveStatus = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;

      const response = await fetch(`${BACKEND_URL}/api/users/update-active`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setLastActiveData(data.data); // Store the last active response
    } catch (error: any) {
      console.error("Error updating active status:", error.message);
      if (error.status == 401) {
        localStorage.clear();
        router.push("/home");
      }
    }
  };

  useEffect(() => {
    fetchUser(); // Fetch user when the component mounts
    updateActiveStatus(); // Run immediately on reload

    // Run the updateActiveStatus function every 20 seconds
    const intervalId = setInterval(() => {
      updateActiveStatus();
    }, 20000);

    return () => {
      clearInterval(intervalId); // Clear interval on unmount
    };
  }, []); // Only runs on mount

  return (
    <UserContext.Provider
      value={{
        user,
        loadingUser,
        error,
        lastActiveData,
        refetchUser,
        setUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
