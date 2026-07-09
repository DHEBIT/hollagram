"use client";

import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Avatar from "../../components/Avatar";
import { supabase } from "../../lib/supabase";

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

export default function NewMessagePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [startingChatWith, setStartingChatWith] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      setCurrentUserId(userId);

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .order("username", { ascending: true });

      setProfiles((profilesData || []).filter((p) => p.id !== userId));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = profiles.filter((p) =>
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectUser = async (otherUserId: string) => {
    if (!currentUserId || startingChatWith) return;
    setStartingChatWith(otherUserId);

    try {
      // Check if a conversation between these two already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(user_a.eq.${currentUserId},user_b.eq.${otherUserId}),and(user_a.eq.${otherUserId},user_b.eq.${currentUserId})`
        )
        .maybeSingle();

      if (existing) {
        router.push(`/messages/${existing.id}`);
        return;
      }

      const { data: created, error } = await supabase
        .from("conversations")
        .insert({ user_a: currentUserId, user_b: otherUserId })
        .select("id")
        .single();

      if (error) throw error;
      if (created) router.push(`/messages/${created.id}`);
    } catch (err) {
      console.error("Failed to start conversation:", err);
      alert("Couldn't start that conversation. Please try again.");
      setStartingChatWith(null);
    }
  };

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

        {/* People */}
        <p className="text-base font-bold mt-5 mb-2 dark:text-white">
          {search ? "Results" : "All users"}
        </p>
        <div>
          {loading ? (
            <p className="text-sm text-gray-400 py-4">Loading users...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No users found.</p>
          ) : (
            filtered.map((person) => (
              <button
                key={person.id}
                onClick={() => handleSelectUser(person.id)}
                disabled={!!startingChatWith}
                className="flex items-center gap-3 py-3 w-full text-left disabled:opacity-50"
              >
                <Avatar url={person.avatar_url} username={person.username} size={48} />
                <p className="text-sm font-semibold dark:text-white">
                  {startingChatWith === person.id ? "Starting chat..." : person.username}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </main>
  );
}