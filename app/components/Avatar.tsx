"use client";

import Image from "next/image";

type AvatarProps = {
  url?: string | null;
  username: string;
  size?: number;
  className?: string;
};

export default function Avatar({ url, username, size = 36, className = "" }: AvatarProps) {
  const style = { width: size, height: size };

  if (url) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 ${className}`}
        style={style}
      >
        <Image src={url} alt={username} fill className="object-cover" sizes={`${size}px`} />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-linear-to-tr from-primary to-accent1 flex items-center justify-center text-white font-bold shrink-0 ${className}`}
      style={{ ...style, fontSize: size * 0.4 }}
    >
      {username[0]?.toUpperCase() || "U"}
    </div>
  );
}