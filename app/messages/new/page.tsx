"use client";

import { useState } from "react";
import { FaArrowLeft, FaUsers } from "react-icons/fa";
import { useRouter } from "next/navigation";

const suggested = [
  { id: 1, username: "Hollagram AI", handle: "AI", isAI: true },
  { id: 2, username: "purple_fan", handle: "purple_fan22" },
  { id: 3, username: "ghana_pics", handle: "ghanapics_gh" },
  { id: 4, username: "accra_life", handle: "accralife01" },
  { id: 5, username: "bernard_v", handle: "bernardv_ke" },
  { id: 6, username: "morbexdesigns", handle: "morbex_designs" },
];

export default function NewMessagePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [removed, setRemoved] = useState<number[]>([]);

  return (
    <main className="min-h-screen bg-white dark:bg-black">

      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-4">
        <button onClick={() => router.back()} className="dark:text-white">
          <FaArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold dark:text-white">New message</h2>
      </div>

      <div className="max-w-lg mx-auto px-4">

        {/* To: search */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3 mb-2">
          <span className="text-sm text-gray-500">To:</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="bg-transparent outline-none text-sm flex-1 dark:text-white placeholder-gray-500"
          />
        </div>

        {/* Group chat option */}
        <div className="flex items-center gap-3 py-3 cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <FaUsers className="text-gray-600 dark:text-gray-300" size={20} />
          </div>
          <p className="text-base font-semibold dark:text-white">Group chat</p>
        </div>

        {/* AI chats option */}
        <div className="flex items-center gap-3 py-3 cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-gray-600 dark:text-gray-300 text-xl">✦</span>
          </div>
          <p className="text-base font-semibold dark:text-white">AI chats</p>
        </div>

        {/* Suggested */}
        <p className="text-base font-bold mt-5 mb-2 dark:text-white">Suggested</p>
        <div>
          {suggested
            .filter((p) => !removed.includes(p.id))
            .filter((p) => p.username.toLowerCase().includes(search.toLowerCase()))
            .map((person) => (
              <div key={person.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      person.isAI
                        ? "bg-gradient-to-tr from-purple-500 via-pink-500 to-purple-700"
                        : "bg-gradient-to-tr from-primary to-accent1"
                    }`}
                  >
                    {person.isAI ? "✦" : person.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold dark:text-white flex items-center gap-1">
                      {person.username}
                      {person.isAI && <span className="text-accent2">✓</span>}
                    </p>
                    <p className="text-xs text-gray-400">{person.handle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRemoved([...removed, person.id])}
                  className="text-gray-400 text-lg"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
        </div>

      </div>
    </main>
  );
}