"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import Avatar from "./Avatar";
import StoryViewer, { type StoryItem } from "./StoryViewer";

type StoryGroup = {
  userId: string;
  username: string;
  avatarUrl: string | null;
  stories: StoryItem[];
  allSeen: boolean;
};

export default function Stories() {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState("user");
  const [currentUserAvatarUrl, setCurrentUserAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewerGroup, setViewerGroup] = useState<StoryGroup | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStories = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    const userId = user?.id ?? null;
    const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "user";
    setCurrentUserId(userId);
    setCurrentUsername(username);

    const { data: storiesData } = await supabase
      .from("stories")
      .select("id, user_id, username, media_url, media_type, created_at")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    let viewedStoryIds = new Set<string>();
    if (userId) {
      const { data: viewsData } = await supabase
        .from("story_views")
        .select("story_id")
        .eq("viewer_id", userId);
      if (viewsData) viewedStoryIds = new Set(viewsData.map((v) => v.story_id));

      const { data: ownProfile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .single();
      setCurrentUserAvatarUrl(ownProfile?.avatar_url || null);
    }

    const authorIds = [...new Set((storiesData || []).map((s) => s.user_id))];
    let avatarByUserId = new Map<string, string | null>();
    if (authorIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, avatar_url")
        .in("id", authorIds);
      avatarByUserId = new Map((profilesData || []).map((p) => [p.id, p.avatar_url]));
    }

    const groupMap = new Map<string, StoryGroup>();
    (storiesData || []).forEach((s) => {
      const item: StoryItem = {
        id: s.id,
        username: s.username,
        avatar_url: avatarByUserId.get(s.user_id) || null,
        media_url: s.media_url,
        media_type: s.media_type,
        created_at: s.created_at,
      };
      const existing = groupMap.get(s.user_id);
      if (existing) {
        existing.stories.push(item);
      } else {
        groupMap.set(s.user_id, {
          userId: s.user_id,
          username: s.username,
          avatarUrl: avatarByUserId.get(s.user_id) || null,
          stories: [item],
          allSeen: false,
        });
      }
    });

    const groupsArr = Array.from(groupMap.values()).map((g) => ({
      ...g,
      allSeen: g.stories.every((s) => viewedStoryIds.has(s.id)),
    }));

    setGroups(groupsArr);
    setLoading(false);
  };

  useEffect(() => {
    loadStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ownGroup = groups.find((g) => g.userId === currentUserId);
  const otherGroups = groups.filter((g) => g.userId !== currentUserId);

  const handleAddStoryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file || !currentUserId) return;

    setUploading(true);
    try {
      const mediaType = file.type.startsWith("video") ? "video" : "image";
      const fileExt = file.name.split(".").pop();
      const filePath = `${currentUserId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("stories")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("stories").getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("stories").insert({
        user_id: currentUserId,
        username: currentUsername,
        media_url: publicUrlData.publicUrl,
        media_type: mediaType,
      });
      if (insertError) throw insertError;

      await loadStories();
    } catch (err) {
      console.error("Failed to add story:", err);
      alert("Couldn't add your story. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const openViewer = (group: StoryGroup) => setViewerGroup(group);
  const closeViewer = () => {
    setViewerGroup(null);
    // Refresh so seen/unseen rings update after closing
    loadStories();
  };

  if (loading) {
    return <div className="h-24" />;
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Add story file input"
        title="Add story file input"
      />

      <div className="flex gap-4 overflow-x-auto px-4 py-3 scrollbar-hide justify-center">
        {/* Your story slot */}
        <div className="flex flex-col items-center gap-1 min-w-fit">
          <button
            onClick={() => (ownGroup ? openViewer(ownGroup) : handleAddStoryClick())}
            disabled={uploading}
            className={`w-16 h-16 rounded-full p-0.5 ${
              ownGroup && !ownGroup.allSeen
                ? "bg-linear-to-bl from-[#7C3AED] via-[#F97316] to-[#06B6D4]"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center relative">
              <Avatar url={currentUserAvatarUrl} username={currentUsername} size={60} />
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddStoryClick();
                }}
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-gray-950"
              >
                +
              </span>
            </div>
          </button>
          <span className="text-xs text-gray-600 dark:text-gray-400 w-16 text-center truncate">
            {uploading ? "Uploading..." : "Your story"}
          </span>
        </div>

        {/* Other users' stories */}
        {otherGroups.map((group) => (
          <div key={group.userId} className="flex flex-col items-center gap-1 min-w-fit">
            <button
              onClick={() => openViewer(group)}
              className={`w-16 h-16 rounded-full p-0.5 ${
                group.allSeen
                  ? "bg-gray-300 dark:bg-gray-700"
                  : "bg-linear-to-bl from-[#7C3AED] via-[#F97316] to-[#06B6D4]"
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <Avatar url={group.avatarUrl} username={group.username} size={60} />
              </div>
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-400 w-16 text-center truncate">
              {group.username}
            </span>
          </div>
        ))}
      </div>

      {viewerGroup && (
        <StoryViewer
          stories={viewerGroup.stories}
          initialIndex={0}
          currentUserId={currentUserId}
          onClose={closeViewer}
        />
      )}
    </>
  );
}