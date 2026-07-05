"use client";

import { useRef } from "react";
import { FaCamera, FaTimes, FaImages } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreatePost } from "./CreatePostContext";

export default function CreatePage() {
  const router = useRouter();
  const { file, previewUrl, mediaType, setFile } = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) {
      setFile(picked);
    }
  };

  const handleNext = () => {
    if (!file) {
      fileInputRef.current?.click();
      return;
    }
    router.push("/create/caption");
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Hidden native file input — works for photo or video, from camera roll or camera on mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        aria-label="Select a photo or video"
        title="Select a photo or video"
        className="hidden"
      />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <Link href="/" className="text-white">
          <FaTimes size={22} />
        </Link>
        <h2 className="text-base font-semibold">New Post</h2>
        <button
          onClick={handleNext}
          disabled={!file}
          className={`font-semibold text-sm ${file ? "text-accent2" : "text-gray-600"}`}
        >
          Next
        </button>
      </div>

      {/* Selected media preview */}
      <div className="w-full aspect-square bg-gray-900 relative flex items-center justify-center">
        {previewUrl ? (
          mediaType === "video" ? (
            <video src={previewUrl} className="w-full h-full object-cover" controls playsInline />
          ) : (
            <img src={previewUrl} alt="selected" className="w-full h-full object-cover" />
          )
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <FaImages size={40} />
            <span className="text-sm">No photo or video selected yet</span>
          </div>
        )}
      </div>

      {/* Pick from device */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 text-white font-semibold text-sm"
        >
          <FaImages size={16} /> {file ? "Choose a different file" : "Select from device"}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-800 rounded-full p-2"
          title="Use camera"
        >
          <FaCamera size={16} />
        </button>
      </div>

      {file && (
        <div className="px-4 py-3 text-xs text-gray-400 truncate">
          Selected: {file.name}
        </div>
      )}
    </main>
  );
}