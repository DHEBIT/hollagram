'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { FaHeart, FaComment, FaShare, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { BsThreeDotsVertical } from 'react-icons/bs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([])
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set())
  const [mutedReels, setMutedReels] = useState<Set<string>>(new Set())
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})

  useEffect(() => {
    fetchReels()
  }, [])

  const fetchReels = async () => {
    const { data } = await supabase
      .from('reels')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setReels(data)
  }

  const toggleLike = (id: string) => {
    setLikedReels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleMute = (id: string) => {
  const video = videoRefs.current[id];
  if (video) {
    video.muted = !video.muted;
    if (!video.muted) {
      video.play();
    }
    setMutedReels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }
};

  return (
    <main className="bg-black min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-3 bg-black">
        <h1 className="text-white font-bold text-xl">Reels</h1>
        <button className="text-white text-xl">📷</button>
      </div>

      {/* Reels Feed */}
      <div className="pt-12 snap-y snap-mandatory h-screen overflow-y-scroll">
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="relative h-screen w-full snap-start flex items-center justify-center bg-black"
          >
            {/* Video */}
            <video
              ref={el => { videoRefs.current[reel.id] = el }}
              src={reel.video_url}
               className="h-full w-full object-cover"
               loop
               autoPlay
              muted
              playsInline
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

            {/* Mute button */}
            <button
              onClick={() => toggleMute(reel.id)}
              className="absolute top-16 right-4 bg-black/40 p-2 rounded-full text-white text-lg"
            >
              {mutedReels.has(reel.id) ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>

            {/* Right side actions */}
            <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                {reel.username[0].toUpperCase()}
              </div>

              {/* Like */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => toggleLike(reel.id)}
                  className={`text-3xl transition-all ${likedReels.has(reel.id) ? 'text-orange-500 scale-125' : 'text-white'}`}
                >
                  <FaHeart />
                </button>
                <span className="text-white text-xs mt-1">
                  {likedReels.has(reel.id) ? reel.likes + 1 : reel.likes}
                </span>
              </div>

              {/* Comment */}
              <div className="flex flex-col items-center">
                <button className="text-3xl text-white">
                  <FaComment />
                </button>
                <span className="text-white text-xs mt-1">0</span>
              </div>

              {/* Share */}
              <div className="flex flex-col items-center">
                <button className="text-3xl text-white">
                  <FaShare />
                </button>
                <span className="text-white text-xs mt-1">Share</span>
              </div>

              {/* More */}
              <button className="text-white text-2xl">
                <BsThreeDotsVertical />
              </button>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-8 left-4 right-16">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  {reel.username[0].toUpperCase()}
                </div>
                <span className="text-white font-bold text-sm">@{reel.username}</span>
                <button className="text-white text-xs border border-white px-2 py-0.5 rounded-full ml-2">
                  Follow
                </button>
              </div>
              <p className="text-white text-sm mb-2">{reel.caption}</p>
              <div className="flex items-center gap-2">
                <span className="text-white text-xs">🎵 Original Audio</span>
              </div>
              <p className="text-gray-400 text-xs mt-1">{reel.views.toLocaleString()} views</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}