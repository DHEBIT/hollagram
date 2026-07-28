"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaTimes, FaSmile } from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import { useCreatePost } from "../CreatePostContext";

export default function CaptionPage() {
  const router = useRouter();
  const { file, previewUrl, mediaType, aspectRatio, reset } = useCreatePost();
  const [caption, setCaption] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [initial, setInitial] = useState("H");
  const [destination, setDestination] = useState<"post" | "reel">("post");

  useEffect(() => {
    // No file? Nothing to caption — send them back to pick one.
    if (!file) {
      router.replace("/create");
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      const username = data.user?.user_metadata?.username || data.user?.email || "user";
      setInitial(String(username)[0]?.toUpperCase() || "H");
    });
  }, [file, router]);

  const handleShare = async () => {
    if (!file || posting) return;
    setPosting(true);
    setError("");

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("You need to be logged in to post.");
      }
      const user = userData.user;
      const username = user.user_metadata?.username || user.email?.split("@")[0] || "user";
      const shareAsReel = destination === "reel" && mediaType === "video";

      // 1. Upload the file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const bucket = shareAsReel ? "reels" : "posts";

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // 2. Get a public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // 3. Insert the row into the right table
      const { error: insertError } = shareAsReel
        ? await supabase.from("reels").insert({
            user_id: user.id,
            username,
            caption,
            video_url: publicUrlData.publicUrl,
            likes: 0,
            views: 0,
          })
        : await supabase.from("posts").insert({
            user_id: user.id,
            username,
            caption,
            media_url: publicUrlData.publicUrl,
            media_type: mediaType,
            aspect_ratio: aspectRatio || 1,
            likes: 0,
            comments: 0,
          });

      if (insertError) {
        throw new Error(`Couldn't save ${shareAsReel ? "reel" : "post"}: ${insertError.message}`);
      }

      // Success — clean up and go to the right feed
      reset();
      router.push(shareAsReel ? "/reels" : "/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setPosting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <Link href="/create" className="text-white">
          <FaTimes size={22} />
        </Link>
        <h2 className="text-base font-semibold">
          {destination === "reel" && mediaType === "video" ? "New Reel" : "New Post"}
        </h2>
        <button
          onClick={handleShare}
          disabled={posting || !file}
          className="text-accent2 font-semibold text-sm disabled:text-gray-600"
        >
          {posting ? "Sharing..." : "Share"}
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-3 rounded-lg bg-red-500/10 border border-red-500/40 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {mediaType === "video" && (
        <div className="flex gap-2 px-4 py-3 border-b border-gray-800">
          {(["post", "reel"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setDestination(option)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                destination === option
                  ? "bg-primary text-white"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {option === "post" ? "Share as Post" : "Share as Reel"}
            </button>
          ))}
        </div>
      )}

      {/* Caption input + media preview */}
      <div className="flex items-start gap-3 px-4 py-4 border-b border-gray-800">
        <div className="w-9 h-9 rounded-full bg-linear-to-tr from-primary to-accent1 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {initial}
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          rows={4}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500 resize-none"
        />
        <FaSmile className="text-gray-400 mt-1" size={20} />
        {previewUrl && (
          mediaType === "video" ? (
            <video src={previewUrl} className="w-14 h-14 object-cover rounded shrink-0" muted />
          ) : (
            <img src={previewUrl} alt="preview" className="w-14 h-14 object-cover rounded shrink-0" />
          )
        )}
      </div>

      {/* Options (visual only for now) */}
      {["Add location", "Tag people", "Add music", "Advanced settings"].map((opt) => (
        <div key={opt} className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <span className="text-sm">{opt}</span>
          <span className="text-gray-500 text-lg">›</span>
        </div>
      ))}
    </main>
  );
}