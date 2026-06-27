"use client";

import { useState } from "react";
import Link from "next/link";
import { FaTimes, FaSmile } from "react-icons/fa";

export default function CaptionPage() {
  const [caption, setCaption] = useState("");

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <Link href="/create" className="text-white">
          <FaTimes size={22} />
        </Link>
        <h2 className="text-base font-semibold">New Post</h2>
        <button className="text-accent2 font-semibold text-sm">Share</button>
      </div>

      {/* Caption input */}
      <div className="flex items-start gap-3 px-4 py-4 border-b border-gray-800">
        <div className="w-9 h-9 rounded-fullbg-linear-to-tr from-primary to-accent1 flex items-center justify-center text-white font-bold text-sm shrink-0">
          B
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          rows={4}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500 resize-none"
        />
        <FaSmile className="text-gray-400 mt-1" size={20} />
      </div>

      {/* Options */}
      {["Add location", "Tag people", "Add music", "Advanced settings"].map((opt) => (
        <div key={opt} className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <span className="text-sm">{opt}</span>
          <span className="text-gray-500 text-lg">›</span>
        </div>
      ))}

    </main>
  );
}