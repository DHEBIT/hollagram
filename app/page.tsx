"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import PostCard from "./components/PostCard";
import Stories from "./components/Stories";
import BottomNav from "./components/BottomNav";
import { supabase } from "./lib/supabase";

type Post = {
  id: string;
  username: string;
  caption: string;
  media_url: string;
  media_type: string;
  likes: number;
  comments: number;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
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
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
      <BottomNav />
    </main>
  );
}