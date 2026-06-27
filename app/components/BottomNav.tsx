import { FaHome, FaSearch } from "react-icons/fa";
import { MdVideoLibrary, MdSend } from "react-icons/md";
import Link from "next/link";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-900 flex justify-around items-center py-4">
      <Link href="/" className="text-gray-800 dark:text-white">
        <FaHome size={26} />
      </Link>
      <Link href="/reels" className="text-gray-500 dark:text-gray-400">
        <MdVideoLibrary size={26} />
      </Link>
      <Link href="/messages" className="text-gray-500 dark:text-gray-400">
        <MdSend size={24} />
      </Link>
      <Link href="/search" className="text-gray-500 dark:text-gray-400">
        <FaSearch size={24} />
      </Link>
      <Link href="/profile">
        <div className="w-7 h-7 rounded-full bg-linear-to-tr from-primary to-accent1 flex items-center justify-center text-white text-xs font-bold ring-2 ring-accent2">
          B
        </div>
      </Link>
    </nav>
  );
}