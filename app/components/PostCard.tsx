"use client";

import { FaHeart, FaRegHeart, FaRegComment, FaPaperPlane, FaEllipsisH } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Avatar from "./Avatar";
import { supabase } from "../lib/supabase";
import { registerVideo, unregisterVideo, pauseOtherVideos } from "../lib/videoManager";
type Post = {
  id: string;
  user_id: string;
  username: string;
  caption: string;
  media_url: string;
  media_type: string;
  likes: number;
  comments: number;
};

type Comment = {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
  avatar_url?: string | null;
};

type PostCardProps = {
  post: Post;
  currentUserId: string | null;
  currentUsername: string;
  currentUserAvatarUrl: string | null;
  authorAvatarUrl: string | null;
  initiallyLiked: boolean;
  initiallyFollowingAuthor: boolean;
  onDeleted?: (postId: string) => void;
};

export default function PostCard({
  post,
  currentUserId,
  currentUsername,
  currentUserAvatarUrl,
  authorAvatarUrl,
  initiallyLiked,
  initiallyFollowingAuthor,
  onDeleted,
}: PostCardProps) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [likes, setLikes] = useState(post.likes);
  const [likeBusy, setLikeBusy] = useState(false);

  const [followingAuthor, setFollowingAuthor] = useState(initiallyFollowingAuthor);
  const [followBusy, setFollowBusy] = useState(false);
  const isOwnPost = currentUserId === post.user_id;

  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    registerVideo(videoEl);

    // Pause automatically once the video scrolls mostly out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !videoEl.paused) {
          videoEl.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(videoEl);

    return () => {
      unregisterVideo(videoEl);
      observer.disconnect();
    };
  }, []);

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

  const handleFollowToggle = async () => {
    if (!currentUserId || isOwnPost || followBusy) return;

    const wasFollowing = followingAuthor;
    setFollowingAuthor(!wasFollowing);
    setFollowBusy(true);

    try {
      if (wasFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", post.user_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: post.user_id });
        if (error) throw error;
      }
    } catch (err) {
      setFollowingAuthor(wasFollowing);
      console.error("Failed to update follow:", err);
    } finally {
      setFollowBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUserId || !isOwnPost || deleting) return;
    const confirmed = window.confirm(
      "Delete this post? This can't be undone — likes, comments, and notifications tied to it will be removed too."
    );
    if (!confirmed) return;

    setDeleting(true);
    setShowMenu(false);

    try {
      // Remove the actual file from storage (best-effort — path is derived from the public URL)
      const marker = "/object/public/posts/";
      const markerIndex = post.media_url.indexOf(marker);
      if (markerIndex !== -1) {
        const storagePath = post.media_url.slice(markerIndex + marker.length);
        await supabase.storage.from("posts").remove([storagePath]);
      }

      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id)
        .eq("user_id", currentUserId);

      if (error) throw error;

      setDeleted(true);
      onDeleted?.(post.id);
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Couldn't delete this post. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("id, user_id, username, content, created_at")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      const userIds = [...new Set(data.map((c) => c.user_id))];
      let avatarByUserId = new Map<string, string | null>();
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, avatar_url")
          .in("id", userIds);
        avatarByUserId = new Map((profilesData || []).map((p) => [p.id, p.avatar_url]));
      }
      setComments(
        data.map((c) => ({ ...c, avatar_url: avatarByUserId.get(c.user_id) || null }))
      );
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
        .select("id, user_id, username, content, created_at")
        .single();

      if (error) throw error;

      if (data) {
        setComments((prev) => [...prev, { ...data, avatar_url: currentUserAvatarUrl }]);
        setCommentsCount((prev) => prev + 1);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setPostingComment(false);
    }
  };

  if (deleted) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl mb-6 border border-gray-200 dark:border-gray-800">
      {/* Post header */}
      <div className="flex items-center gap-3 p-3 relative">
        <Avatar url={authorAvatarUrl} username={post.username} size={36} />
        <span className="font-semibold text-sm dark:text-white flex-1">{post.username}</span>
        {!isOwnPost && currentUserId && (
          <button
            onClick={handleFollowToggle}
            disabled={followBusy}
            className={`text-xs font-semibold px-3 py-1 rounded-lg ${
              followingAuthor
                ? "bg-gray-200 dark:bg-gray-800 dark:text-white"
                : "bg-primary text-white"
            }`}
          >
            {followingAuthor ? "Following" : "Follow"}
          </button>
        )}
        {isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              disabled={deleting}
              className="text-gray-500 dark:text-gray-400 px-1 disabled:opacity-50"
              title="Post options"
            >
              <FaEllipsisH size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-7 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm text-red-500 font-semibold whitespace-nowrap disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete post"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post media */}
      <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800">
        {post.media_type === "video" ? (
          <video
            ref={videoRef}
            src={post.media_url}
            className="w-full h-full object-cover"
            controls
            playsInline
            onPlay={() => videoRef.current && pauseOtherVideos(videoRef.current)}
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
                <div key={c.id} className="flex items-start gap-2">
                  <Avatar url={c.avatar_url} username={c.username} size={24} />
                  <p className="text-sm dark:text-gray-300">
                    <span className="font-semibold dark:text-white">{c.username}</span>{" "}
                    {c.content}
                  </p>
                </div>
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