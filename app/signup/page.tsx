"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
  setLoading(true);
  setError("");
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });
  if (error) {
    setError(error.message);
  } else {
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
        className="text-3xl font-bold bg-gradient-to-r from-primary via-accent1 to-accent2 bg-clip-text text-transparent mb-2"
        style={{ fontFamily: "cursive" }}
      >
        Hollagram
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center">
        Sign up to see photos and videos from your friends.
      </p>

      {/* Form */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 dark:text-white outline-none text-sm border border-gray-200 dark:border-gray-800"
        />
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
          onClick={handleSignup}
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm mt-1"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-xs text-gray-400 text-center mt-1">
          By signing up, you agree to our Terms and Privacy Policy.
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full max-w-sm my-6">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Login link */}
      <p className="text-sm dark:text-white">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold">
          Log in
        </Link>
      </p>

    </main>
  );
}