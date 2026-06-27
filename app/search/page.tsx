"use client";

import Navbar from "../components/Navbar";
import { FaSearch, FaSlidersH } from "react-icons/fa";
import { useState } from "react";
import Image from "next/image";
import BottomNav from "../components/BottomNav";

const categories = ["For you", "+", "Fashion", "Ghana News", "Food", "Travel", "Sports", "Music", "Art"];

const exploreImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300",
  "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=300",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=300",
  "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=300",
  "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=300",
];

export default function SearchPage() {
  const [active, setActive] = useState("For you");

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black pt-16 pb-20">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 mt-4">

        {/* Search bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-3 bg-gray-200 dark:bg-gray-900 rounded-xl px-4 py-3 flex-1">
            <FaSearch className="text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search Hollagram..."
              className="bg-transparent outline-none text-sm w-full dark:text-white placeholder-gray-500"
            />
          </div>
          <button
            className="text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-900 p-3 rounded-xl"
            title="Filter search results"
            aria-label="Filter search results"
          >
            <FaSlidersH size={18} />
          </button>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border transition-all ${
                active === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Explore grid */}
        <div className="grid grid-cols-3 gap-1">
          {exploreImages.map((src, i) => (
            <div
              key={i}
              className={`relative bg-gray-200 dark:bg-gray-800 overflow-hidden ${
                i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>

      </div>
          <BottomNav />
    </main>
  );
}