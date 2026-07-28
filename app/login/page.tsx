"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PasswordInput from "../components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else if (data.session) {
      router.refresh();
      router.push("/");
    }
    setLoading(false);
  };

  const handleSendReset = async () => {
    if (!email.trim()) {
      setError("Enter your email above first, then tap Reset.");
      return;
    }
    setError("");
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
    setResetLoading(false);
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

      {mode === "login" ? (
        <div className="w-full max-w-sm flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 dark:text-white outline-none text-sm border border-gray-200 dark:border-gray-800"
          />
          <PasswordInput value={password} onChange={setPassword} />

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
            <span
              onClick={() => {
                setError("");
                setMode("forgot");
              }}
              className="text-primary font-semibold cursor-pointer"
            >
              Reset
            </span>
          </p>
        </div>
      ) : (
        <div className="w-full max-w-sm flex flex-col gap-3">
          {resetSent ? (
            <div className="text-center">
              <p className="text-sm dark:text-white mb-1">Check your email 📩</p>
              <p className="text-xs text-gray-400">
                We sent a password reset link to <span className="font-semibold">{email}</span>.
                Click the link in that email to set a new password.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-1">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-900 dark:text-white outline-none text-sm border border-gray-200 dark:border-gray-800"
              />
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <button
                onClick={handleSendReset}
                disabled={resetLoading}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm mt-1"
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </>
          )}

          <p className="text-center text-xs text-gray-400 mt-2">
            <span
              onClick={() => {
                setError("");
                setResetSent(false);
                setMode("login");
              }}
              className="text-primary font-semibold cursor-pointer"
            >
              Back to log in
            </span>
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 w-full max-w-sm my-6">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        <span className="text-xs text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Sign up link */}
      <p className="text-sm dark:text-white">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-semibold">
          Sign up
        </Link>
      </p>

    </main>
  );
}