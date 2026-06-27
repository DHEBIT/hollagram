"use client";

const stories = [
  { id: 1, username: "You", isOwn: true },
  { id: 2, username: "bernard_v" },
  { id: 3, username: "ghana_pics" },
  { id: 4, username: "accra_life" },
  { id: 5, username: "hollagram" },
  { id: 6, username: "purple_fan" },
];

export default function Stories() {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 py-3 scrollbar-hide">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-1 min-w-fit">
          <div
            className={`w-16 h-16 rounded-full p-[2px] ${
              story.isOwn
                ? "bg-gray-300 dark:bg-gray-700"
                : "bg-gradient-to-bl from-[#7C3AED] via-[#F97316 ] to-[#06B6D4] animate-gradient-x"
            }`}
          >
            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-primary relative">
              {story.username[0].toUpperCase()}
              {story.isOwn && (
                <span className="absolute bottom-0 right-0 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-gray-950">
                  +
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 w-16 text-center truncate">
            {story.isOwn ? "Your story" : story.username}
          </span>
        </div>
      ))}
    </div>
  );
}