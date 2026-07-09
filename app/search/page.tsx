"use client";

import Navbar from "../components/Navbar";
import { FaSearch } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import { supabase } from "../lib/supabase";

type UserResult = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type PostResult = {
  id: string;
  media_url: string;
  caption: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  const [explorePosts, setExplorePosts] = useState<PostResult[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [postResults, setPostResults] = useState<PostResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingExplore, setLoadingExplore] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      setCurrentUserId(userId);

      if (userId) {
        const { data: followsData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId);
        if (followsData) {
          setFollowedIds(new Set(followsData.map((f) => f.following_id)));
        }
      }

      const { data: postsData } = await supabase
        .from("posts")
        .select("id, media_url, caption")
        .order("created_at", { ascending: false })
        .limit(30);

      // Light shuffle so the explore grid doesn't feel like a plain feed
      const shuffled = [...(postsData || [])].sort(() => Math.random() - 0.5);
      setExplorePosts(shuffled);
      setLoadingExplore(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setUserResults([]);
      setPostResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const [usersRes, postsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .ilike("username", `%${trimmed}%`)
          .neq("id", currentUserId ?? "")
          .limit(10),
        supabase
          .from("posts")
          .select("id, media_url, caption")
          .ilike("caption", `%${trimmed}%`)
          .limit(21),
      ]);

      setUserResults(usersRes.data || []);
      setPostResults(postsRes.data || []);
      setSearching(false);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, currentUserId]);

  const handleFollow = async (otherUserId: string) => {
    if (!currentUserId) return;
    setFollowedIds((prev) => new Set(prev).add(otherUserId));

    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: currentUserId, following_id: otherUserId });

    if (error) {
      console.error("Failed to follow:", error);
      setFollowedIds((prev) => {
        const next = new Set(prev);
        next.delete(otherUserId);
        return next;
      });
    }
  };

  const isActivelySearching = query.trim().length > 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black pt-16 pb-20">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 mt-4">

        {/* Search bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-3 bg-gray-200 dark:bg-gray-900 rounded-xl px-4 py-3 flex-1">
            <FaSearch className="text-gray-500" size={16} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users or captions..."
              className="bg-transparent outline-none text-sm w-full dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        {isActivelySearching ? (
          <>
            {searching ? (
              <p className="text-center text-gray-400 text-sm mt-6">Searching...</p>
            ) : (
              <>
                {/* Users */}
                {userResults.length > 0 && (
                  <div className="mb-5">
                    <p className="font-semibold text-sm dark:text-white mb-2">Users</p>
                    <div className="flex flex-col gap-1">
                      {userResults.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 py-2">
                          <Avatar url={user.avatar_url} username={user.username} size={44} />
                          <p className="flex-1 text-sm font-semibold dark:text-white">
                            {user.username}
                          </p>
                          <button
                            onClick={() => handleFollow(user.id)}
                            disabled={followedIds.has(user.id)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60 ${
                              followedIds.has(user.id)
                                ? "bg-gray-200 dark:bg-gray-800 dark:text-white"
                                : "bg-primary text-white"
                            }`}
                          >
                            {followedIds.has(user.id) ? "Following" : "Follow"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching posts */}
                {postResults.length > 0 && (
                  <div>
                    <p className="font-semibold text-sm dark:text-white mb-2">Posts</p>
                    <div className="grid grid-cols-3 gap-1">
                      {postResults.map((post) => (
                        <div key={post.id} className="aspect-square relative bg-gray-200 dark:bg-gray-800">
                          <Image src={post.media_url} alt={post.caption} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userResults.length === 0 && postResults.length === 0 && (
                  <p className="text-center text-gray-400 text-sm mt-6">
                    No users or posts found for &ldquo;{query}&rdquo;
                  </p>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <p className="font-semibold text-sm dark:text-white mb-2">Explore</p>
            {loadingExplore ? (
              <p className="text-center text-gray-400 text-sm mt-6">Loading...</p>
            ) : explorePosts.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-6">
                No posts yet. Once people start posting, they&apos;ll show up here.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {explorePosts.map((post, i) => (
                  <div
                    key={post.id}
                    className={`relative bg-gray-200 dark:bg-gray-800 overflow-hidden ${
                      i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                    }`}
                  >
                    <Image src={post.media_url} alt={post.caption} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
          <BottomNav />
    </main>
  );
}