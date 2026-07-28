"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PasswordInput from "../components/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Clicking the emailed link puts a temporary "recovery" session in place.
    // Supabase's client parses that from the URL automatically — we just wait for it.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    const timeout = setTimeout(() => {
      setReady((current) => {
        if (!current) setCheckFailed(true);
        return current;
      });
    }, 4000);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleReset = async () => {
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-6">

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

      <div className="w-full max-w-sm flex flex-col gap-3">
        {success ? (
          <p className="text-center text-sm dark:text-white">
            Password updated! Redirecting you to log in...
          </p>
        ) : checkFailed ? (
          <p className="text-center text-sm text-red-500">
            This reset link is invalid or has expired. Please request a new one from the login
            page.
          </p>
        ) : !ready ? (
          <p className="text-center text-sm text-gray-400">Checking your reset link...</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-1">
              Enter a new password for your account.
            </p>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="New password"
            />
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm new password"
            />

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm mt-1"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </>
        )}
      </div>

    </main>
  );
}