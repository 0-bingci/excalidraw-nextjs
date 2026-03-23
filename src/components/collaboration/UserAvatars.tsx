"use client";

import React from "react";
import type { UserPresence } from "@/lib/collaboration/AwarenessManager";

interface UserAvatarsProps {
  users: UserPresence[];
  isConnected: boolean;
}

export default function UserAvatars({ users, isConnected }: UserAvatarsProps) {
  if (!isConnected || users.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {users.slice(0, 8).map((user) => (
        <div
          key={user.clientId}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm border-2 border-white"
          style={{ backgroundColor: user.color }}
          title={user.name}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
      ))}
      {users.length > 8 && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-400 text-white text-xs font-bold shadow-sm border-2 border-white">
          +{users.length - 8}
        </div>
      )}
      <div
        className={`w-2 h-2 rounded-full ml-1 ${isConnected ? "bg-green-400" : "bg-red-400"}`}
        title={isConnected ? "Connected" : "Disconnected"}
      />
    </div>
  );
}
