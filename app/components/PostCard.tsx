"use client";

import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";
import { useState } from "react";
import Image from "next/image";

type Post = {
  id: number;
  username: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
};

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl mb-6 border border-gray-200 dark:border-gray-800">
      {/* Post header */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
          {post.username[0].toUpperCase()}
        </div>
        <span className="font-semibold text-sm dark:text-white">{post.username}</span>
      </div>

      {/* Post image */}
      <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800">
        <Image
          src={post.image}
          alt={post.caption}
          fill
          className="object-cover"
        />
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center gap-4">
        <button type="button" onClick={handleLike} aria-label={liked ? "Unlike" : "Like"} className="text-accent1">
          {liked ? <FaHeart size={22} /> : <FaRegHeart size={22} />}
        </button>
        <button type="button" aria-label="Comment" className="text-gray-500 dark:text-gray-400">
          <FaRegComment size={22} />
        </button>
      </div>

      {/* Likes & caption */}
      <div className="px-3 pb-4">
        <p className="font-semibold text-sm dark:text-white">{likes} likes</p>
        <p className="text-sm dark:text-gray-300 mt-1">
          <span className="font-semibold">{post.username}</span> {post.caption}
        </p>
      </div>
    </div>
  );
}