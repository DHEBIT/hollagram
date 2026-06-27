"use client";

import Navbar from "../components/Navbar";
import { useState } from "react";
import { FaCamera, FaTimes, FaChevronDown } from "react-icons/fa";
import Link from "next/link";

const tabs = ["POST", "INSTANT", "STORY"];

const recentImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300",
  "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=300",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=300",
  "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=300",
  "https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=300",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300",
];

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState("POST");
  const [selected, setSelected] = useState(recentImages[0]);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <Link href="/" className="text-white">
          <FaTimes size={22} />
        </Link>
        <h2 className="text-base font-semibold">New Post</h2>
        <Link href="/create/caption" className="text-accent2 font-semibold text-sm">
          Next
        </Link>
      </div>

      {/* Selected image preview */}
      <div className="w-full aspect-square bg-gray-900 relative">
        {selected && (
          <img src={selected} alt="selected" className="w-full h-full object-cover" />
        )}
        {/* Resize toggle */}
        <button className="absolute bottom-3 left-3 bg-black/60 rounded-full p-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M3 3h7v2H5v5H3V3zm11 0h7v7h-2V5h-5V3zM3 14h2v5h5v2H3v-7zm16 5h-5v2h7v-7h-2v5z"/>
          </svg>
        </button>
        {/* Select multiple */}
        <button className="absolute bottom-3 right-3 bg-black/60 rounded-full px-3 py-1 text-xs text-white border border-gray-500">
          Select
        </button>
      </div>

      {/* Recents label */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <button className="flex items-center gap-2 text-white font-semibold text-sm">
          Recents <FaChevronDown size={12} />
        </button>
        <button className="bg-gray-800 rounded-full p-2">
          <FaCamera size={16} />
        </button>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-4 gap-[1px] flex-1">
        {recentImages.map((src, i) => (
          <div
            key={i}
            onClick={() => setSelected(src)}
            className={`aspect-square relative cursor-pointer ${
              selected === src ? "ring-2 ring-accent2 ring-inset" : ""
            }`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* POST / INSTANT / STORY tabs */}
      <div className="flex justify-center gap-8 py-4 border-t border-gray-800 bg-black">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-bold tracking-widest pb-1 ${
              activeTab === tab
                ? "text-white border-b-2 border-white"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

    </main>
  );
}