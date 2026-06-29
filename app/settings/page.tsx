"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { FaArrowLeft, FaSearch, FaUser, FaBell, FaLock, FaShieldAlt, FaInfoCircle, FaBookmark, FaArchive, FaClock } from "react-icons/fa";
import { MdOutlineManageAccounts } from "react-icons/md";

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const sections = [
    {
      title: "Your account",
      items: [
        { icon: <MdOutlineManageAccounts size={22} />, label: "Accounts Centre", sub: "Password, security, personal details" },
      ],
    },
    {
      title: "How you use Hollagram",
      items: [
        { icon: <FaBookmark size={18} />, label: "Saved" },
        { icon: <FaArchive size={18} />, label: "Archive" },
        { icon: <FaBell size={18} />, label: "Notifications" },
        { icon: <FaClock size={18} />, label: "Time management" },
      ],
    },
    {
      title: "Who can see your content",
      items: [
        { icon: <FaLock size={18} />, label: "Account privacy", value: "Public" },
      ],
    },
    {
      title: "More info and support",
      items: [
        { icon: <FaShieldAlt size={18} />, label: "Privacy Centre" },
        { icon: <FaUser size={18} />, label: "Account Status" },
        { icon: <FaInfoCircle size={18} />, label: "About" },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-black pb-10">

      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-3 border-b border-gray-100 dark:border-gray-900">
        <button onClick={() => router.back()} className="text-gray-800 dark:text-white">
          <FaArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold dark:text-white">Settings and activity</h2>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4">

        {/* Search */}
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-xl px-4 py-3 mb-6">
          <FaSearch className="text-gray-500" size={14} />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-sm w-full dark:text-white placeholder-gray-500"
          />
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">
              {section.title}
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
              {section.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700 dark:text-gray-300">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium dark:text-white">{item.label}</p>
                      {item.sub && <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && <span className="text-xs text-gray-400">{item.value}</span>}
                    <span className="text-gray-400">›</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Login section */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">
            Login
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
            <button className="w-full text-left px-4 py-4 text-sm text-primary font-semibold border-b border-gray-100 dark:border-gray-800">
              Add account
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-4 text-sm text-red-500 font-semibold"
            >
              Log out
            </button>
          </div>
        </div>

      </div>
    </main>
  );
} 
