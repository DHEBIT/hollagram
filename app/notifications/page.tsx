"use client";

import { useEffect, useState } from "react";
import { FaArrowLeft, FaHeart, FaRegComment, FaUserPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";

type Notification = {
  id: string;
  actor_username: string;
  type: "like" | "comment" | "follow";
  post_id: string | null;
  read: boolean;
  created_at: string;
};

function actionText(n: Notification): string {
  if (n.type === "like") return "liked your post";
  if (n.type === "comment") return "commented on your post";
  return "started following you";
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function groupLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  if (date >= sevenDaysAgo) return "Last 7 days";
  return "Earlier";
}

const GROUP_ORDER = ["Today", "Yesterday", "Last 7 days", "Earlier"];

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("notifications")
        .select("id, actor_username, type, post_id, read, created_at")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      setNotifications(data || []);
      setLoading(false);

      // Mark everything as read now that the user is viewing the page
      const unreadIds = (data || []).filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length > 0) {
        await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
      }
    };
    load();
  }, []);

  const grouped = GROUP_ORDER.map((label) => ({
    label,
    items: notifications.filter((n) => groupLabel(n.created_at) === label),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="min-h-screen bg-white dark:bg-black pb-20">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-3 border-b border-gray-100 dark:border-gray-900">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-800 dark:text-white"
          aria-label="Go back"
        >
          <FaArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold dark:text-white">Notifications</h2>
      </div>

      <div className="max-w-lg mx-auto">
        {loading ? (
          <p className="text-center text-gray-400 text-sm mt-10">Loading notifications...</p>
        ) : grouped.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-10">
            No notifications yet. Activity on your posts will show up here.
          </p>
        ) : (
          grouped.map((section) => (
            <div key={section.label} className="mb-2">
              <p className="text-sm font-bold px-4 py-3 dark:text-white">{section.label}</p>
              {section.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.post_id && router.push("/")}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    item.post_id ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900" : ""
                  } ${!item.read ? "bg-primary/5" : ""}`}
                >
                  {/* Avatar */}
                  <div className="relative w-11 h-11 rounded-full bg-linear-to-tr from-primary via-accent1 to-accent2 p-[2px] shrink-0">
                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-primary">
                      {item.actor_username[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-0.5">
                      {item.type === "like" && <FaHeart className="text-red-500" size={12} />}
                      {item.type === "comment" && (
                        <FaRegComment className="text-blue-500" size={12} />
                      )}
                      {item.type === "follow" && (
                        <FaUserPlus className="text-primary" size={12} />
                      )}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <p className="text-sm dark:text-white">
                      <span className="font-semibold">{item.actor_username}</span>{" "}
                      {actionText(item)}{" "}
                      <span className="text-gray-400 text-xs">{timeAgo(item.created_at)}</span>
                    </p>
                  </div>

                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}