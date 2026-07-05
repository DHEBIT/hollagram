"use client";

import { createContext, useContext, useState, useRef } from "react";

type MediaType = "image" | "video";

type CreatePostContextValue = {
  file: File | null;
  previewUrl: string | null;
  mediaType: MediaType;
  setFile: (file: File | null) => void;
  reset: () => void;
};

const CreatePostContext = createContext<CreatePostContextValue | null>(null);

export function CreatePostProvider({ children }: { children: React.ReactNode }) {
  const [file, setFileState] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>("image");
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
      setMediaType(newFile.type.startsWith("video") ? "video" : "image");
    } else {
      setPreviewUrl(null);
    }
    setFileState(newFile);
  };

  const reset = () => setFile(null);

  return (
    <CreatePostContext.Provider value={{ file, previewUrl, mediaType, setFile, reset }}>
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