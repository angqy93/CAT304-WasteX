"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { IoMenuOutline } from "react-icons/io5";
import { BsChevronDown } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { useUser } from "@/app/context/UserContext"; // Import the context hook
import {
  User,
  Box,
  ShoppingBag,
  Receipt,
  ClipboardCheck,
  Plus,
  LogOut,
  MessageSquare,
} from "lucide-react";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { user, logout } = useUser();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const isHiddenPage =
    pathname === "/forgot-password" ||
    pathname === "/create-account" ||
    pathname === "/login";

  // ** Handle Logout **
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
      router.push("/");
      setIsDropdownOpen(false);
    } catch (error: any) {
      toast.error(error.message || "An error occurred during logout.");
    }
  };

  // ** Close dropdown when clicking outside **
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="flex justify-between items-center md:px-12 px-4 py-4 border-b bg-white shadow-sm z-50 h-[90px]">
      {/* ** Logo Section ** */}
      <div className="flex items-center gap-5">
        <Link href="/" className="md:w-[150px] w-[120px]">
          <Image src="/Images/logo.svg" alt="Logo" width={150} height={150} />
        </Link>
        {!isHiddenPage && (
          <nav className="hidden md:flex gap-8 font-medium">
            <Link href="/products">
              <p className="hover:text-green transition duration-300">
                Products
              </p>
            </Link>
            <Link href="/geo-location">
              <p className="hover:text-green transition duration-300">
                Geo Location
              </p>
            </Link>
          </nav>
        )}
      </div>

      {/* ** Desktop Right Section ** */}
      {!isHiddenPage && (
        <div className="flex items-center gap-5">
          {!user ? (
            <Link href="/login">
              <button className="font-semibold text-green border-2 border-green px-6 py-2 rounded-lg shadow hover:bg-green hover:text-white transition">
                Login
              </button>
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 py-2 px-4 font-semibold border rounded-lg shadow hover:bg-gray-100 transition"
                onClick={toggleDropdown}
              >
                {user.name}
                <BsChevronDown
                  className={`text-sm transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ** Dropdown Menu ** */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-4 border-b flex items-center gap-3">
                    <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center">
                      <User className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <ul className="py-2">
                    {/* <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <User className="w-5 h-5 text-gray-600" />
                      <Link href="/profile-settings" onClick={() => setIsDropdownOpen(false)}>
                        Profile Settings
                      </Link>
                    </li> */}
                    <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <Plus className="w-5 h-5 text-gray-600" />
                      <Link
                        href="/new-listing"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        New Product
                      </Link>
                    </li>
                    <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                      <Link
                        href="/chat"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Chat
                      </Link>
                    </li>
                    <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <Box className="w-5 h-5 text-gray-600" />
                      <Link
                        href="/products-listing"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Product Listing
                      </Link>
                    </li>
                    <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <ShoppingBag className="w-5 h-5 text-gray-600" />
                      <Link
                        href="/purchased-order"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Purchased Order
                      </Link>
                    </li>
                    <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <Receipt className="w-5 h-5 text-gray-600" />
                      <Link
                        href="/sales-order"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Sales Order
                      </Link>
                    </li>

                    <li
                      className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-100 cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5 text-red-500" />
                      Sign Out
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ** Mobile Menu Toggle ** */}
          <button className="md:hidden text-3xl" onClick={toggleSidebar}>
            <IoMenuOutline />
          </button>
        </div>
      )}

      {/* ** Mobile Sidebar ** */}
      <aside
        className={`fixed top-0 right-0 h-full w-[80vw] bg-white z-50 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-end">
          <button className="text-xl text-gray-600" onClick={toggleSidebar}>
            ✕
          </button>
        </div>
        {!isHiddenPage && (
          <nav className="space-y-4 px-4">
            <Link href="/products" onClick={toggleSidebar}>
              <p className="py-2 border-b border-gray-200">Products</p>
            </Link>
            <Link href="/geo-location" onClick={toggleSidebar}>
              <p className="py-2 border-b border-gray-200">Geo Location</p>
            </Link>
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  toggleSidebar();
                }}
                className="w-full text-left py-2 text-red-500 hover:bg-red-100"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" onClick={toggleSidebar}>
                <p className="py-2 border-b border-gray-200">Login</p>
              </Link>
            )}
          </nav>
        )}
      </aside>

      {/* ** Sidebar Overlay ** */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </header>
  );
};

export default Header;