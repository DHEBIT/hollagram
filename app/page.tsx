"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import PostCard from "./components/PostCard";
import Stories from "./components/Stories";
import BottomNav from "./components/BottomNav";
import { supabase } from "./lib/supabase";

type Post = {
  id: string;
  user_id: string;
  username: string;
  caption: string;
  media_url: string;
  media_type: string;
  aspect_ratio?: number | null;
  likes: number;
  comments: number;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState("user");
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [avatarByUserId, setAvatarByUserId] = useState<Map<string, string | null>>(new Map());
  const [currentUserAvatarUrl, setCurrentUserAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Get the logged-in user first, so we know whose likes to check
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      const userId = user?.id ?? null;
      const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "user";
      setCurrentUserId(userId);
      setCurrentUsername(username);

      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!postsError && postsData) setPosts(postsData);

      if (postsData && postsData.length > 0) {
        const authorIds = [...new Set(postsData.map((p) => p.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, avatar_url")
          .in("id", authorIds);
        setAvatarByUserId(
          new Map((profilesData || []).map((p) => [p.id, p.avatar_url]))
        );
      }

      if (userId) {
        const { data: ownProfile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", userId)
          .single();
        setCurrentUserAvatarUrl(ownProfile?.avatar_url || null);

        const { data: likesData } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", userId);

        if (likesData) {
          setLikedPostIds(new Set(likesData.map((l) => l.post_id)));
        }

        const { data: followsData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId);

        if (followsData) {
          setFollowingIds(new Set(followsData.map((f) => f.following_id)));
        }
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black pt-16 pb-20">
      <Navbar />
      <Stories />
      <div className="max-w-lg mx-auto px-4 mt-2">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">No posts yet. Be the first to post! 📸</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              currentUsername={currentUsername}
              currentUserAvatarUrl={currentUserAvatarUrl}
              authorAvatarUrl={avatarByUserId.get(post.user_id) || null}
              initiallyLiked={likedPostIds.has(post.id)}
              initiallyFollowingAuthor={followingIds.has(post.user_id)}
              onDeleted={(postId) =>
                setPosts((prev) => prev.filter((p) => p.id !== postId))
              }
            />
          ))
        )}
      </div>
      <BottomNav />
    </main>
  );
}