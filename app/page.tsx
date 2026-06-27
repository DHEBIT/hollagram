import Navbar from "./components/Navbar";
import PostCard from "./components/PostCard";
import Stories from "./components/Stories";
import BottomNav from "./components/BottomNav";

const mockPosts = [
  {
    id: 1,
    username: "bernard_ventures",
    avatar: "",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600",
    caption: "Beautiful scenery 🌄",
    likes: 42,
  },
  {
    id: 2,
    username: "hollagram_user",
    avatar: "",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600",
    caption: "Good vibes only ✨",
    likes: 87,
  },
  {
    id: 3,
    username: "ghana_photos",
    avatar: "",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
    caption: "Beach day 🌊",
    likes: 120,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black pt-16 pb-20">
      <Navbar />
      <Stories />
      <div className="max-w-lg mx-auto px-4 mt-2">
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <BottomNav />
    </main>
  );
}