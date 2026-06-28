"use client";

import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";

const sections = [
  {
    title: "Highlights",
    items: [
      { id: 1, username: "bernard_v", action: "liked your post", time: "2m ago", hasImage: true },
      { id: 2, username: "ghana_pics", action: "added to their story for the first time in a while.", time: "12h ago", hasImage: true },
    ],
  },
  {
    title: "Yesterday",
    items: [
      { id: 3, username: "accra_life", action: "shared a photo.", time: "1d", hasImage: true },
      { id: 4, username: "hollagram", action: "Follow suggestions: purple_fan, ghana_pics and others", time: "1d", hasImage: false },
    ],
  },
  {
    title: "Last 7 days",
    items: [
      { id: 5, username: "purple_fan", action: "You have a message from purple_fan.", time: "2d", hasImage: false },
      { id: 6, username: "accra_life", action: "shared a video.", time: "2d", hasImage: true },
      { id: 7, username: "hollagram", action: "Remember what you were up to around 4 years ago.", time: "4d", hasImage: true },
    ],
  },
  {
    title: "Last 30 days",
    items: [
      { id: 8, username: "ghana_pics", action: "shared a photo.", time: "1w", hasImage: true },
      { id: 9, username: "bernard_v", action: "started following you.", time: "1w", hasImage: false },
      { id: 10, username: "hollagram", action: "Remember what you were up to around 6 years ago.", time: "1w", hasImage: true },
    ],
  },
];

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white dark:bg-black pb-20">

      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-3 border-b border-gray-100 dark:border-gray-900">
        <button onClick={() => router.back()} className="text-gray-800 dark:text-white">
          <FaArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold dark:text-white">Notifications</h2>
      </div>

      {/* Sections */}
      <div className="max-w-lg mx-auto">
        {sections.map((section) => (
          <div key={section.title} className="mb-2">
            <p className="text-sm font-bold px-4 py-3 dark:text-white">{section.title}</p>
            {section.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary via-accent1 to-accent2 p-[2px] shrink-0">
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-primary">
                    {item.username[0].toUpperCase()}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-sm dark:text-white">
                    <span className="font-semibold">{item.username}</span>{" "}
                    {item.action}{" "}
                    <span className="text-gray-400 text-xs">{item.time}</span>
                  </p>
                </div>

                {/* Right side — image or button */}
                {item.hasImage ? (
                  <div className="w-11 h-11 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary to-accent2 opacity-60" />
                  </div>
                ) : (
                  <button className="shrink-0 px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-lg text-xs font-semibold dark:text-white">
                    Message
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}