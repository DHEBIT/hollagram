"use client";

import { createContext, useContext, useState, useRef } from "react";

type MediaType = "image" | "video";

type CreatePostContextValue = {
  file: File | null;
  previewUrl: string | null;
  mediaType: MediaType;
  aspectRatio: number;
  setFile: (file: File | null) => void;
  reset: () => void;
};

const CreatePostContext = createContext<CreatePostContextValue | null>(null);

export function CreatePostProvider({ children }: { children: React.ReactNode }) {
  const [file, setFileState] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const previousUrlRef = useRef<string | null>(null);

  const setFile = (newFile: File | null) => {
    // Clean up the previous object URL so we don't leak memory
    if (previousUrlRef.current) {
      URL.revokeObjectURL(previousUrlRef.current);
      previousUrlRef.current = null;
    }

    if (newFile) {
      const url = URL.createObjectURL(newFile);
      previousUrlRef.current = url;
      setPreviewUrl(url);
      setAspectRatio(1); // reset until the real dimensions load in

      if (newFile.type.startsWith("video")) {
        setMediaType("video");
        const videoEl = document.createElement("video");
        videoEl.onloadedmetadata = () => {
          if (videoEl.videoWidth && videoEl.videoHeight) {
            setAspectRatio(videoEl.videoWidth / videoEl.videoHeight);
          }
        };
        videoEl.src = url;
      } else {
        setMediaType("image");
        const img = new window.Image();
        img.onload = () => {
          if (img.naturalWidth && img.naturalHeight) {
            setAspectRatio(img.naturalWidth / img.naturalHeight);
          }
        };
        img.src = url;
      }
    } else {
      setPreviewUrl(null);
    }
    setFileState(newFile);
  };

  const reset = () => setFile(null);

  return (
    <CreatePostContext.Provider
      value={{ file, previewUrl, mediaType, aspectRatio, setFile, reset }}
    >
      {children}
    </CreatePostContext.Provider>
  );
}

export function useCreatePost() {
  const ctx = useContext(CreatePostContext);
  if (!ctx) {
    throw new Error("useCreatePost must be used within a CreatePostProvider");
  }
  return ctx;
}