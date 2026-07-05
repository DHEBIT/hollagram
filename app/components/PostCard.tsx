"use client";

import { FaHeart, FaRegHeart, FaRegComment, FaPaperPlane } from "react-icons/fa";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabase";

type Post = {
  id: string;
  username: string;
  caption: string;
  media_url: string;
  media_type: string;
  likes: number;
  comments: number;
};

type Comment = {
  id: string;
  username: string;
  content: string;
  created_at: string;
};

type PostCardProps = {
  post: Post;
  currentUserId: string | null;
  currentUsername: string;
  initiallyLiked: boolean;
};

export default function PostCard({
  post,
  currentUserId,
  currentUsername,
  initiallyLiked,
}: PostCardProps) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [likes, setLikes] = useState(post.likes);
  const [likeBusy, setLikeBusy] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const handleLike = async () => {
    if (!currentUserId || likeBusy) return;

    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setLikes((prev) => (wasLiked ? prev - 1 : prev + 1));
    setLikeBusy(true);

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: post.id, user_id: currentUserId });
        if (error) throw error;
      }
    } catch (err) {
      // Revert the optimistic update if the request failed
      setLiked(wasLiked);
      setLikes((prev) => (wasLiked ? prev + 1 : prev - 1));
      console.error("Failed to update like:", err);
    } finally {
      setLikeBusy(false);
    }
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("id, username, content, created_at")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data);
    }
    setCommentsLoaded(true);
  };

  const toggleComments = () => {
    const opening = !showComments;
    setShowComments(opening);
    if (opening && !commentsLoaded) {
      loadComments();
    }
  };

  const handleAddComment = async () => {
    const content = newComment.trim();
    if (!content || !currentUserId || postingComment) return;

    setPostingComment(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: post.id,
          user_id: currentUserId,
          username: currentUsername,
          content,
        })
        .select("id, username, content, created_at")
        .single();

      if (error) throw error;

      if (data) {
        setComments((prev) => [...prev, data]);
        setCommentsCount((prev) => prev + 1);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setPostingComment(false);
    }
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
        <button
          onClick={handleLike}
          disabled={!currentUserId}
          className="text-accent1 disabled:opacity-50"
          title="Like post"
        >
          {liked ? <FaHeart size={22} /> : <FaRegHeart size={22} />}
        </button>
        <button
          onClick={toggleComments}
          className="text-gray-500 dark:text-gray-400"
          title="Comment on post"
        >
          <FaRegComment size={22} />
        </button>
      </div>

      {/* Likes & caption */}
      <div className="px-3 pb-3">
        <p className="font-semibold text-sm dark:text-white">{likes} likes</p>
        <p className="text-sm dark:text-gray-300 mt-1">
          <span className="font-semibold">{post.username}</span> {post.caption}
        </p>
        {!showComments && commentsCount > 0 && (
          <button
            onClick={toggleComments}
            className="text-xs text-gray-500 dark:text-gray-400 mt-2"
          >
            View all {commentsCount} comment{commentsCount === 1 ? "" : "s"}
          </button>
        )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-3">
          {!commentsLoaded ? (
            <p className="text-xs text-gray-400">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-400">No comments yet. Say something!</p>
          ) : (
            <div className="flex flex-col gap-2 mb-3 max-h-64 overflow-y-auto">
              {comments.map((c) => (
                <p key={c.id} className="text-sm dark:text-gray-300">
                  <span className="font-semibold dark:text-white">{c.username}</span>{" "}
                  {c.content}
                </p>
              ))}
            </div>
          )}

          {currentUserId && (
            <div className="flex items-center gap-2 mt-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddComment();
                }}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1.5 text-sm outline-none dark:text-white placeholder-gray-500"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || postingComment}
                className="text-accent2 disabled:opacity-40"
                title="Post comment"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}