"use client";

import { useEffect, useState } from "react";
import { FaSearch, FaEdit } from "react-icons/fa";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import { supabase } from "../lib/supabase";

type ConversationRow = {
  id: string;
  otherUsername: string;
  otherAvatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
};

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function MessagesPage() {
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState("user");

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        setLoading(false);
        return;
      }
      const username = user.user_metadata?.username || user.email?.split("@")[0] || "user";
      setCurrentUsername(username);

      const { data: convosData } = await supabase
        .from("conversations")
        .select("id, user_a, user_b, last_message, last_message_at")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (!convosData || convosData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const otherIds = convosData.map((c) => (c.user_a === user.id ? c.user_b : c.user_a));

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", otherIds);

      const profileById = new Map(
        (profilesData || []).map((p) => [p.id, { username: p.username, avatarUrl: p.avatar_url }])
      );

      const rows: ConversationRow[] = convosData.map((c) => {
        const otherUserId = c.user_a === user.id ? c.user_b : c.user_a;
        const profile = profileById.get(otherUserId);
        return {
          id: c.id,
          otherUsername: profile?.username || "user",
          otherAvatarUrl: profile?.avatarUrl || null,
          lastMessage: c.last_message,
          lastMessageAt: c.last_message_at,
        };
      });

      setConversations(rows);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = conversations.filter((c) =>
    c.otherUsername.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white dark:bg-black pb-20">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3">
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <span className="font-bold text-lg dark:text-white">{currentUsername}</span>
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
            placeholder="Search"
            className="bg-transparent outline-none text-sm w-full dark:text-white placeholder-gray-500"
          />
        </div>

        {/* Messages header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-base dark:text-white">Messages</h2>
        </div>

        {/* Conversation list */}
        {loading ? (
          <p className="text-center text-gray-400 mt-10 text-sm">Loading conversations...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 text-sm">
            <p>No conversations yet.</p>
            <Link href="/messages/new" className="text-primary font-semibold">
              Start a new one
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((convo) => (
              <Link
                key={convo.id}
                href={`/messages/${convo.id}`}
                className="flex items-center gap-3 py-3"
              >
                <Avatar url={convo.otherAvatarUrl} username={convo.otherUsername} size={48} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-white">{convo.otherUsername}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {convo.lastMessage || "Say hello 👋"}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {timeAgo(convo.lastMessageAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}