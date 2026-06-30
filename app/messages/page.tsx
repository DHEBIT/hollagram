"use client";

import { useState } from "react";
import { FaSearch, FaPhone, FaEdit, FaUserCircle } from "react-icons/fa";
import { FaGlobeAmericas } from "react-icons/fa";
import Link from "next/link";
import BottomNav from "../components/BottomNav";

const conversations = [
  { id: 1, username: "Raymond Kwame Owusu", status: "Active yesterday", hasCall: false, dismissible: true, avatar: null },
  { id: 2, username: "1love.nyarko", status: "Active yesterday", hasCall: true, dismissible: false, avatar: "1" },
  { id: 3, username: "Pearl Quarshie", status: "Active 59m ago", hasCall: false, dismissible: false, avatar: "P" },
  { id: 4, username: "morbexdesigns", status: "Active now", hasCall: false, dismissible: false, avatar: "M" },
  { id: 5, username: "Evelyn Amankwaa", status: "Active yesterday", hasCall: false, dismissible: false, avatar: "E" },
];

export default function MessagesPage() {
  const [search, setSearch] = useState("");
  const [dismissed, setDismissed] = useState<number[]>([]);

  return (
    <main className="min-h-screen bg-white dark:bg-black pb-20">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3">
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <span className="font-bold text-lg dark:text-white">bernard_ventures</span>
          <span className="text-gray-500 text-sm">▾</span>
        </div>
        <div className="flex-1 flex justify-end">
          <Link href="/messages/new" className="dark:text-white">
            <FaEdit size={20} />
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">

        {/* Search */}
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2.5 mb-4">
          <FaSearch className="text-gray-500" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or ask Meta AI"
            className="bg-transparent outline-none text-sm w-full dark:text-white placeholder-gray-500"
          />
        </div>

        {/* Notes/quick row */}
        <div className="flex gap-5 overflow-x-auto scrollbar-hide mb-5 pb-1">

          {/* Your note */}
          <div className="flex flex-col items-center gap-1 min-w-fit relative">
            <div className="bg-gray-200 dark:bg-gray-800 text-[10px] px-2 py-1 rounded-2xl rounded-bl-none mb-1 max-w-[80px] text-center dark:text-white">
              Unpopular opinion...
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-accent1 flex items-center justify-center text-white font-bold text-xl">
              B
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Your note</span>
            <span className="text-[10px] text-gray-500">📍 Location off</span>
          </div>

          {/* Map */}
          <div className="flex flex-col items-center gap-1 min-w-fit">
            <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center text-white">
              <FaGlobeAmericas size={26} />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Map</span>
          </div>

          {/* Story with green dot */}
          <div className="flex flex-col items-center gap-1 min-w-fit">
            <div className="relative w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-accent1">
              M
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-black" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 w-16 text-center truncate">Nkansa K. Emm...</span>
          </div>
        </div>

        {/* Messages header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-base dark:text-white">Messages</h2>
          <button className="text-primary text-sm font-semibold">Requests</button>
        </div>

        {/* Conversation list */}
        <div className="flex flex-col">
          {conversations
            .filter((c) => !dismissed.includes(c.id))
            .filter((c) => c.username.toLowerCase().includes(search.toLowerCase()))
            .map((convo) => (
              <div key={convo.id} className="flex items-center justify-between py-3">
                <Link href={`/messages/${convo.id}`} className="flex items-center gap-3 flex-1">
                  {convo.avatar ? (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent2 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {convo.avatar}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 shrink-0">
                      <FaUserCircle size={28} />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium dark:text-white">{convo.username}</p>
                    <p className="text-xs text-gray-400">{convo.status}</p>
                  </div>
                </Link>

                {convo.hasCall && (
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-full text-xs font-semibold dark:text-white mr-2">
                    <FaPhone size={10} /> Call
                  </button>
                )}

                {convo.dismissible && (
                  <button
                    onClick={() => setDismissed([...dismissed, convo.id])}
                    className="text-gray-400 text-lg px-1"
                    title="Remove"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
        </div>

      </div>

      <BottomNav />
    </main>
  );
}