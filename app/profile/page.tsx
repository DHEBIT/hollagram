"use client";

import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { FaBars, FaThLarge, FaUserTag, FaTrash } from "react-icons/fa";
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

type Post = {
  id: string;
  media_url: string;
};

type SuggestedUser = {
  id: string;
  username: string;
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts");
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState("user");
  const [posts, setPosts] = useState<Post[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        setLoading(false);
        return;
      }
      const username = user.user_metadata?.username || user.email?.split("@")[0] || "user";
      setCurrentUserId(user.id);
      setCurrentUsername(username);

      const [postsRes, followersRes, followingRes, followingIdsRes, profilesRes] =
        await Promise.all([
          supabase
            .from("posts")
            .select("id, media_url")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("following_id", user.id),
          supabase
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("follower_id", user.id),
          supabase.from("follows").select("following_id").eq("follower_id", user.id),
          supabase.from("profiles").select("id, username").neq("id", user.id).limit(10),
        ]);

      setPosts(postsRes.data || []);
      setFollowersCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);

      const alreadyFollowing = new Set(
        (followingIdsRes.data || []).map((f) => f.following_id)
      );
      setFollowedIds(alreadyFollowing);
      setSuggestions((profilesRes.data || []).filter((p) => !alreadyFollowing.has(p.id)));

      setLoading(false);
    };
    load();
  }, []);

  const handleDeletePost = async (postId: string, mediaUrl: string) => {
    if (!currentUserId || deletingId) return;
    const confirmed = window.confirm(
      "Delete this post? This can't be undone — likes, comments, and notifications tied to it will be removed too."
    );
    if (!confirmed) return;

    setDeletingId(postId);
    try {
      const marker = "/object/public/posts/";
      const markerIndex = mediaUrl.indexOf(marker);
      if (markerIndex !== -1) {
        const storagePath = mediaUrl.slice(markerIndex + marker.length);
        await supabase.storage.from("posts").remove([storagePath]);
      }

      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", currentUserId);

      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Couldn't delete this post. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFollow = async (otherUserId: string) => {
    if (!currentUserId) return;
    setFollowedIds((prev) => new Set(prev).add(otherUserId));
    setFollowingCount((prev) => prev + 1);

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
      setFollowingCount((prev) => prev - 1);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black pb-20">

      {/* Custom profile top bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-gray-100 dark:border-gray-900">
        <div className="flex items-center gap-1">
          <span className="font-bold text-base dark:text-white">{currentUsername}</span>
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
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-primary via-accent1 to-accent2 p-0.5">
              <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
                {currentUsername[0]?.toUpperCase() || "U"}
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs border-2 border-white dark:border-black font-bold">
              +
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-5 flex-1 justify-around">
            {[
              { label: "posts", value: posts.length },
              { label: "followers", value: followersCount },
              { label: "following", value: followingCount },
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
          <p className="font-semibold text-sm dark:text-white">{currentUsername}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-4">
          <button className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm font-semibold dark:text-white">
            Edit profile
          </button>
          <button className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm font-semibold dark:text-white">
            Share profile
          </button>
          <button
            onClick={handleLogout}
            className="py-1.5 px-3 bg-gray-200 dark:bg-gray-800 rounded-lg dark:text-white text-sm font-bold"
          >
            Logout
          </button>
        </div>

        {/* Discover people */}
        {suggestions.filter((p) => !dismissed.includes(p.id)).length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm dark:text-white">Discover people</p>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {suggestions
                .filter((p) => !dismissed.includes(p.id))
                .map((person) => (
                  <div
                    key={person.id}
                    className="min-w-35 bg-gray-100 dark:bg-gray-900 rounded-xl p-3 relative"
                  >
                    <button
                      onClick={() => setDismissed((prev) => [...prev, person.id])}
                      className="absolute top-2 right-2 text-gray-400 text-xs"
                    >
                      ✕
                    </button>
                    <div className="w-12 h-12 rounded-full bg-linear-to-tr from-primary to-accent1 flex items-center justify-center text-white font-bold mx-auto mb-2">
                      {person.username[0].toUpperCase()}
                    </div>
                    <p className="text-xs font-semibold dark:text-white text-center truncate">
                      {person.username}
                    </p>
                    <button
                      onClick={() => handleFollow(person.id)}
                      disabled={followedIds.has(person.id)}
                      className="w-full py-1 bg-primary text-white text-xs rounded-lg font-semibold mt-2 disabled:opacity-50"
                    >
                      {followedIds.has(person.id) ? "Following" : "Follow"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

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
          loading ? (
            <p className="text-center text-gray-400 text-sm mt-10">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-10">
              No posts yet. Share your first one!
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map((post) => (
                <div key={post.id} className="aspect-square relative group">
                  <Image src={post.media_url} alt="" fill className="object-cover" />
                  <button
                    onClick={() => handleDeletePost(post.id, post.media_url)}
                    disabled={deletingId === post.id}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1.5 disabled:opacity-50"
                    title="Delete post"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab !== "posts" && (
          <p className="text-center text-gray-400 text-sm mt-10">Nothing here yet</p>
        )}

      </div>
        <BottomNav />
    </main>
  );
}