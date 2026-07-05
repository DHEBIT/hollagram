"use client";

import { useEffect, useRef, useState } from "react";
import { FaTimes, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { supabase } from "../lib/supabase";

export type StoryItem = {
  id: string;
  username: string;
  media_url: string;
  media_type: string;
  created_at: string;
};

type StoryViewerProps = {
  stories: StoryItem[];
  initialIndex: number;
  currentUserId: string | null;
  onClose: () => void;
};

const IMAGE_DURATION_MS = 5000;
const MAX_VIDEO_DURATION_MS = 50000; // safety cap for very long videos

export default function StoryViewer({
  stories,
  initialIndex,
  currentUserId,
  onClose,
}: StoryViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const viewedIdsRef = useRef<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const capTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = stories[index];
  const isVideo = current?.media_type === "video";

  const goNext = () => {
    if (index >= stories.length - 1) {
      onClose();
    } else {
      setIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (index === 0) return;
    setIndex((i) => i - 1);
  };

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  // Images: advance on a fixed timer.
  // Videos: progress + advancing is driven by the <video> element's own events instead (see below).
  useEffect(() => {
    if (isVideo) return; // handled by video event listeners

    setProgress(0);
    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / IMAGE_DURATION_MS) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        goNext();
      } else {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isVideo]);

  // Videos: tie progress to actual playback, advance when it ends (capped at 50s)
  useEffect(() => {
    if (!isVideo) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    setProgress(0);

    const handleTimeUpdate = () => {
      const duration = Math.min(videoEl.duration || 0, MAX_VIDEO_DURATION_MS / 1000);
      if (!duration) return;
      const pct = Math.min((videoEl.currentTime / duration) * 100, 100);
      setProgress(pct);

      if (videoEl.currentTime >= duration) {
        goNext();
      }
    };

    const handleEnded = () => goNext();

    videoEl.addEventListener("timeupdate", handleTimeUpdate);
    videoEl.addEventListener("ended", handleEnded);

    // Absolute safety net in case a video's metadata/events misbehave
    capTimeoutRef.current = setTimeout(goNext, MAX_VIDEO_DURATION_MS);

    return () => {
      videoEl.removeEventListener("timeupdate", handleTimeUpdate);
      videoEl.removeEventListener("ended", handleEnded);
      if (capTimeoutRef.current) clearTimeout(capTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isVideo]);

  // Record a view (once per story per viewer)
  useEffect(() => {
    if (!current || !currentUserId) return;
    if (viewedIdsRef.current.has(current.id)) return;
    viewedIdsRef.current.add(current.id);

    supabase
      .from("story_views")
      .insert({ story_id: current.id, viewer_id: currentUserId })
      .then(() => {});
  }, [current, currentUserId]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-md mx-auto flex flex-col">
        {/* Progress bars */}
        <div className="flex gap-1 px-2 pt-2 z-20">
          {stories.map((s, i) => (
            <div key={s.id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white"
                style={{
                  width: i < index ? "100%" : i === index ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
              {current.username[0].toUpperCase()}
            </div>
            <span className="text-white text-sm font-semibold">{current.username}</span>
          </div>
          <div className="flex items-center gap-4">
            {isVideo && (
              <button onClick={toggleMute} className="text-white" aria-label="Toggle sound">
                {muted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
              </button>
            )}
            <button onClick={onClose} className="text-white">
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Media */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          {isVideo ? (
            <video
              key={current.id}
              ref={videoRef}
              src={current.media_url}
              className="max-h-full max-w-full object-contain"
              autoPlay
              playsInline
              muted={muted}
            />
          ) : (
            <img
              key={current.id}
              src={current.media_url}
              alt={current.username}
              className="max-h-full max-w-full object-contain"
            />
          )}

          {/* Tap zones for navigation */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-0 h-full w-1/3"
            aria-label="Previous story"
          />
          <button
            onClick={goNext}
            className="absolute right-0 top-0 h-full w-1/3"
            aria-label="Next story"
          />
        </div>
      </div>
    </div>
  );
}