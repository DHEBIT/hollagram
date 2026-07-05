"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../providers";
import { FaPlus, FaHeart } from "react-icons/fa";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnread = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .eq("read", false);

      setUnreadCount(count || 0);
    };
    loadUnread();

    // Keep the badge live as new notifications arrive
    const channel = supabase
      .channel("navbar-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => loadUnread()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-900 px-4 py-2 flex items-center justify-between">

        {/* Left — Plus button */}
        <Link href="/create" className="text-gray-800 dark:text-white">
          <FaPlus size={22} />
        </Link>

        {/* Center — Hollagram text logo */}
        <h1
          className="text-2xl font-bold bg-gradient-to-r from-primary via-accent1 to-accent2 bg-clip-text text-transparent"
          style={{ fontFamily: "cursive" }}
        >
          Hollagram
        </h1>

        {/* Right — Dark mode + Notifications */}
        <div className="flex items-center gap-4">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className="text-gray-800 dark:text-white"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Notifications — links to page */}
          <Link href="/notifications" className="relative text-gray-800 dark:text-white">
            <FaHeart size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent1 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

        </div>
      </header>
    </>
  );
}