"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  setLoading(true);
  setError("");
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  });
  if (error) {
    setError(error.message);
  } else if (data.session) {
    router.refresh();
    router.push("/");
  }
  setLoading(false);
};

  return (
    <main className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <Image
        src="/hollagram-logo.png"
        alt="Hollagram"
        width={80}
        height={80}
        className="rounded-2xl mb-4"
      />
      <h1
        className="text-3xl font-bold bg-gradient-to-r from-primary via-accent1 to-accent2 bg-clip-text text-transparent mb-8"
        style={{ fontFamily: "cursive" }}
      >
        Hollagram
      </h1>

      {/* Form */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 dark:text-white outline-none text-sm border border-gray-200 dark:border-gray-800"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 dark:text-white outline-none text-sm border border-gray-200 dark:border-gray-800"
        />

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm mt-1"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="text-center text-xs text-gray-400 mt-2">
          Forgot password?{" "}
          <span className="text-primary font-semibold cursor-pointer">Reset</span>
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full max-w-sm my-6">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Sign up link */}
      <p className="text-sm dark:text-white">
        Don't have an account?{" "}
        <Link href="/signup" className="text-primary font-semibold">
          Sign up
        </Link>
      </p>

    </main>
  );
}