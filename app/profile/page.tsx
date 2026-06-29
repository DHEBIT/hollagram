"use client";

import Navbar from "../components/Navbar";
import { useState } from "react";
import { FaBars, FaThLarge, FaUserTag } from "react-icons/fa";
import { MdVideoLibrary, MdOutlineAutorenew } from "react-icons/md";
import { FaThreads } from "react-icons/fa6";
import Image from "next/image";
import BottomNav from "../components/BottomNav";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import Link from "next/link";

const profileTabs = [
  { icon: <FaThLarge size={20} />, key: "posts" },
  { icon: <MdVideoLibrary size={20} />, key: "reels" },
  { icon: <MdOutlineAutorenew size={20} />, key: "collab" },
  { icon: <FaUserTag size={20} />, key: "tagged" },
];

const discoverPeople = [
  { id: 1, username: "caleb_marfo", mutuals: "1 mutual", avatar: "C" },
  { id: 2, username: "joe_mettle", mutuals: "23 mutuals", avatar: "J" },
  { id: 3, username: "ghana_vibes", mutuals: "5 mutuals", avatar: "G" },
];

const postImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300",
  "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=300",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300",
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts");
  const router = useRouter();

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push("/login");
};
  const [dismissed, setDismissed] = useState<number[]>([]);

  return (
    <main className="min-h-screen bg-white dark:bg-black pb-20">

      {/* Custom profile top bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-gray-100 dark:border-gray-900">
        <div className="flex items-center gap-1">
          <span className="font-bold text-base dark:text-white">bernard_ventures</span>
          <span className="text-gray-500 text-sm">▾</span>
        </div>
        <div className="flex items-center gap-4">
          <FaThreads size={22} className="dark:text-white" />
          <Link href="/settings">
            <FaBars size={22} className="dark:text-white" />
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">

        {/* Avatar + stats */}
        <div className="flex items-center gap-6 mt-4 mb-3">
          {/* Avatar with + */}
          <div className="relative">
            <div className="w-20 h-20 rounded-fullbg-linear-to-tr from-primary via-accent1 to-accent2 p-0.5">
              <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
                B
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs border-2 border-white dark:border-black font-bold">
              +
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-5 flex-1 justify-around">
            {[
              { label: "posts", value: "6" },
              { label: "followers", value: "178" },
              { label: "following", value: "402" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-bold text-base dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Name + bio */}
        <div className="mb-3">
          <p className="font-semibold text-sm dark:text-white">Bernard</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Finance Officer | Building in public 🇬🇭</p>
          <p className="text-sm text-accent2 mt-1">hollagram.vercel.app</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-4">
          <button className="flex-1 py-1.5bg-gray-200 dark:bg-gray-800 rounded-lg text-sm font-semibold dark:text-white">
            Edit profile
          </button>
          <button className="flex-1 py-1.5bg-gray-200 dark:bg-gray-800 rounded-lg text-sm font-semibold dark:text-white">
            Share profile
          </button>
          <button className="py-1.5px-3 bg-gray-200 dark:bg-gray-800 rounded-lg dark:text-white text-sm font-bold">
            +
          </button>
        </div>

        {/* Discover people */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-sm dark:text-white">Discover people</p>
            <button className="text-primary text-sm font-semibold">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {discoverPeople
              .filter((p) => !dismissed.includes(p.id))
              .map((person) => (
                <div key={person.id} className="min-w-35 bg-gray-100 dark:bg-gray-900 rounded-xl p-3 relative">
                  <button
                    onClick={() => setDismissed([...dismissed, person.id])}
                    className="absolute top-2 right-2 text-gray-400 text-xs"
                  >
                    ✕
                  </button>
                  <div className="w-12 h-12 rounded-fullbg-linear-to-tr from-primary to-accent1 flex items-center justify-center text-white font-bold mx-auto mb-2">
                    {person.avatar}
                  </div>
                  <p className="text-xs font-semibold dark:text-white text-center truncate">{person.username}</p>
                  <p className="text-xs text-gray-400 text-center mb-2">{person.mutuals}</p>
                  <button className="w-full py-1 bg-primary text-white text-xs rounded-lg font-semibold">
                    Follow
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide mb-4">
          <div className="flex flex-col items-center gap-1 min-w-fit">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center text-2xl text-gray-400">
              +
            </div>
            <span className="text-xs text-gray-500">New</span>
          </div>
          {["Highlights"].map((h) => (
            <div key={h} className="flex flex-col items-center gap-1 min-w-fit">
              <div className="w-16 h-16 rounded-fullbg-linear-to-tr from-primary to-accent2 p-0.5">
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-800" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{h}</span>
            </div>
          ))}
        </div>

        {/* Profile tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-1">
          {profileTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex justify-center py-3 ${
                activeTab === tab.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400"
              }`}
            >
              {tab.icon}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {activeTab === "posts" && (
          <div className="grid grid-cols-3 gap-0.5">
            {postImages.map((src, i) => (
              <div key={i} className="aspect-square relative">
                <Image src={src} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        {activeTab !== "posts" && (
          <p className="text-center text-gray-400 text-sm mt-10">Nothing here yet</p>
        )}

      </div>
        <BottomNav />
    </main>
  );
}