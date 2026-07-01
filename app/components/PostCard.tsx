"use client";

import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";
import { useState } from "react";
import Image from "next/image";

type Post = {
  id: string;
  username: string;
  caption: string;
  media_url: string;
  media_type: string;
  likes: number;
  comments: number;
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

      {/* Post media */}
      <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800">
        {post.media_type === "video" ? (
          <video
            src={post.media_url}
            className="w-full h-full object-cover"
            controls
            playsInline
          />
        ) : (
          <Image
            src={post.media_url}
            alt={post.caption}
            fill
            loading="eager"
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
          />
        )}
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center gap-4">
        <button onClick={handleLike} className="text-accent1" title="Like post">
          {liked ? <FaHeart size={22} /> : <FaRegHeart size={22} />}
        </button>
        <button className="text-gray-500 dark:text-gray-400">
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