"use client";

import { useTheme } from "../providers";
import { FaHome, FaSearch, FaUser, FaSun, FaMoon, FaHeart, FaPlus } from "react-icons/fa";
import { MdVideoLibrary, MdSend } from "react-icons/md";
import Link from "next/link";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-900 px-4 py-3 flex items-center justify-between">
        
        {/* Left — Plus button */}
        <Link href="/create"
          className="text-gray-800 dark:text-white"
          aria-label="Create new post"
          title="Create new post"
        >
          <FaPlus size={22} />
        </Link>

        {/* Center — Hollagram logo */}
        <h1
          className="text-2xl font-bold bg-gradient-to-r from-primary via-accent1 to-accent2 bg-clip-text text-transparent"
          style={{ fontFamily: "cursive" }}
        >
          Hollagram
        </h1>

        {/* Right — Dark mode + Notifications */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="text-gray-700 dark:text-yellow-300"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>
          <button
            className="text-gray-800 dark:text-white relative"
            aria-label="View liked posts"
            title="View liked posts"
          >
            <FaHeart size={22} />
            <span className="absolute -top-1 -right-1 bg-accent1 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </header>

      
    </>
  );
}