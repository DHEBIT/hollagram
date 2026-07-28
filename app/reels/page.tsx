'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { FaHeart, FaRegHeart, FaComment, FaShare, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { BsThreeDotsVertical } from 'react-icons/bs'
import BottomNav from '../components/BottomNav'

type Reel = {
  id: string
  user_id: string
  username: string
  caption: string
  video_url: string
  likes: number
  views: number
}

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [likedReelIds, setLikedReelIds] = useState<Set<string>>(new Set())
  const [likeBusyIds, setLikeBusyIds] = useState<Set<string>>(new Set())
  const [muted, setMuted] = useState(true)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})

  useEffect(() => {
    fetchReels()
  }, [])

  const fetchReels = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id ?? null
    setCurrentUserId(userId)

    const { data } = await supabase
      .from('reels')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setReels(data)

    if (userId) {
      const { data: likesData } = await supabase
        .from('reel_likes')
        .select('reel_id')
        .eq('user_id', userId)
      if (likesData) setLikedReelIds(new Set(likesData.map(l => l.reel_id)))
    }
  }

  // Play only the visible video
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play()
            } else {
              video.pause()
              video.currentTime = 0
            }
          })
        },
        { threshold: 0.7 }
      )

      observer.observe(video)
      observers.push(observer)
    })

    return () => observers.forEach((obs) => obs.disconnect())
  }, [reels])

  const toggleLike = async (reelId: string) => {
    if (!currentUserId || likeBusyIds.has(reelId)) return

    const wasLiked = likedReelIds.has(reelId)

    // Optimistic update
    setLikedReelIds(prev => {
      const next = new Set(prev)
      if (wasLiked) next.delete(reelId)
      else next.add(reelId)
      return next
    })
    setReels(prev =>
      prev.map(r =>
        r.id === reelId ? { ...r, likes: r.likes + (wasLiked ? -1 : 1) } : r
      )
    )
    setLikeBusyIds(prev => new Set(prev).add(reelId))

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from('reel_likes')
          .delete()
          .eq('reel_id', reelId)
          .eq('user_id', currentUserId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('reel_likes')
          .insert({ reel_id: reelId, user_id: currentUserId })
        if (error) throw error
      }
    } catch (err) {
      // Revert on failure
      setLikedReelIds(prev => {
        const next = new Set(prev)
        if (wasLiked) next.add(reelId)
        else next.delete(reelId)
        return next
      })
      setReels(prev =>
        prev.map(r =>
          r.id === reelId ? { ...r, likes: r.likes + (wasLiked ? 1 : -1) } : r
        )
      )
      console.error('Failed to update reel like:', err)
    } finally {
      setLikeBusyIds(prev => {
        const next = new Set(prev)
        next.delete(reelId)
        return next
      })
    }
  }

  const toggleMute = () => {
    setMuted(!muted)
    Object.values(videoRefs.current).forEach(video => {
      if (video) video.muted = !muted
    })
  }

  return (
    <main className="bg-black min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-3 bg-black">
        <h1 className="text-white font-bold text-xl">Reels</h1>
        <button onClick={toggleMute} className="text-white text-xl">
          {muted ? <FaVolumeMute size={22} /> : <FaVolumeUp size={22} />}
        </button>
      </div>

      {/* Reels Feed */}
      <div className="pt-12 snap-y snap-mandatory h-screen overflow-y-scroll">
        {reels.length === 0 && (
          <div className="h-screen w-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">No reels yet. Be the first to share one! 🎬</p>
          </div>
        )}
        {reels.map((reel) => {
          const liked = likedReelIds.has(reel.id)
          return (
            <div
              key={reel.id}
              className="relative h-screen w-full snap-start flex items-center justify-center bg-black"
            >
              {/* Video */}
              <video
                ref={el => { videoRefs.current[reel.id] = el }}
                src={reel.video_url}
                className="h-full w-full object-contain"
                loop
                muted={muted}
                playsInline
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 pointer-events-none" />

              {/* Right side actions */}
              <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                  {reel.username[0].toUpperCase()}
                </div>

                <div className="flex flex-col items-center">
                  <button
                    onClick={() => toggleLike(reel.id)}
                    disabled={!currentUserId}
                    className={`text-3xl transition-all disabled:opacity-50 ${liked ? 'text-orange-500 scale-125' : 'text-white'}`}
                  >
                    {liked ? <FaHeart /> : <FaRegHeart />}
                  </button>
                  <span className="text-white text-xs mt-1">{reel.likes}</span>
                </div>

                <div className="flex flex-col items-center">
                  <button className="text-3xl text-white">
                    <FaComment />
                  </button>
                  <span className="text-white text-xs mt-1">0</span>
                </div>

                <div className="flex flex-col items-center">
                  <button className="text-3xl text-white">
                    <FaShare />
                  </button>
                  <span className="text-white text-xs mt-1">Share</span>
                </div>

                <button className="text-white text-2xl">
                  <BsThreeDotsVertical />
                </button>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-24 left-4 right-16">
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
                <p className="text-gray-400 text-xs mt-1">{reel.views?.toLocaleString()} views</p>
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav />
    </main>
  )
}