"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  className = "",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 pr-11 rounded-xl bg-gray-100 dark:bg-gray-900 dark:text-white outline-none text-sm border border-gray-200 dark:border-gray-800 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
      </button>
    </div>
  );
}