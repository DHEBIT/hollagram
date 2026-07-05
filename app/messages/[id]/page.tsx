"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import { supabase } from "../../lib/supabase";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params.id;
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUsername, setOtherUsername] = useState("user");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      setCurrentUserId(userId);
      if (!userId) {
        setLoading(false);
        return;
      }

      // Load the conversation to find out who the other person is
      const { data: convo } = await supabase
        .from("conversations")
        .select("id, user_a, user_b")
        .eq("id", conversationId)
        .single();

      if (convo) {
        const otherUserId = convo.user_a === userId ? convo.user_b : convo.user_a;
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", otherUserId)
          .single();
        if (profile) setOtherUsername(profile.username);
      }

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      setMessages(messagesData || []);
      setLoading(false);
    };
    load();
  }, [conversationId]);

  // Live updates: subscribe to new messages in this conversation
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || !currentUserId || sending) return;

    setSending(true);
    setText("");
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content,
      });
      if (error) throw error;
      // No need to manually add it to state — the realtime subscription above will pick it up
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Message failed to send. Please try again.");
      setText(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => router.back()} className="dark:text-white">
          <FaArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-linear-to-tr from-primary to-accent1 flex items-center justify-center text-white font-bold text-sm">
          {otherUsername[0]?.toUpperCase() || "U"}
        </div>
        <span className="font-semibold text-sm dark:text-white">{otherUsername}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {loading ? (
          <p className="text-center text-gray-400 text-sm mt-10">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-10">
            No messages yet. Say hello 👋
          </p>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? "self-end bg-primary text-white rounded-br-sm"
                    : "self-start bg-gray-100 dark:bg-gray-800 dark:text-white rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Message..."
          className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2.5 text-sm outline-none dark:text-white placeholder-gray-500"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="text-primary disabled:opacity-40"
          title="Send"
        >
          <FaPaperPlane size={20} />
        </button>
      </div>
    </main>
  );
}