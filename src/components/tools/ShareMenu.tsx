"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Copy,
  Download,
  Link,
  FileJson,
  Check,
  X,
  Radio,
  LogOut,
} from "lucide-react";

interface ShareMenuProps {
  visible: boolean;
  onClose: () => void;
  onCopyImage: () => Promise<void>;
  onDownloadPng: () => void;
  onCopyLink: () => Promise<void>;
  onCopyJson: () => void;
  // Collaboration
  isConnected: boolean;
  roomId: string | null;
  onStartSession: () => void;
  onStopSession: () => void;
}

type FeedbackKey = "image" | "link" | "json" | "session" | null;

export default function ShareMenu({
  visible,
  onClose,
  onCopyImage,
  onDownloadPng,
  onCopyLink,
  onCopyJson,
  isConnected,
  roomId,
  onStartSession,
  onStopSession,
}: ShareMenuProps) {
  const [feedback, setFeedback] = useState<FeedbackKey>(null);
  const [loading, setLoading] = useState<FeedbackKey>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [visible, onClose]);

  if (!visible) return null;

  const showFeedback = (key: FeedbackKey) => {
    setFeedback(key);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleAction = async (
    key: FeedbackKey,
    action: () => void | Promise<void>,
  ) => {
    try {
      setLoading(key);
      await action();
      showFeedback(key);
    } catch (err) {
      console.error("Share action failed:", err);
    } finally {
      setLoading(null);
    }
  };

  const handleStartSession = () => {
    onStartSession();
    showFeedback("session");
  };

  const handleCopyRoomLink = async () => {
    if (!roomId) return;
    const url =
      window.location.origin + "/board?room=" + roomId;
    await navigator.clipboard.writeText(url);
    showFeedback("link");
  };

  return (
    <div
      ref={menuRef}
      className="absolute top-14 right-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-72 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Share</span>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Collaboration section */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Live Collaboration
        </div>
        {isConnected && roomId ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gray-600">
                Room: <span className="font-mono font-bold">{roomId}</span>
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyRoomLink}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                {feedback === "link" ? (
                  <Check size={12} />
                ) : (
                  <Link size={12} />
                )}
                {feedback === "link" ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={onStopSession}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut size={12} />
                Leave
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Radio size={14} />
            {feedback === "session" ? "Starting..." : "Start Live Session"}
          </button>
        )}
      </div>

      {/* Export section */}
      <div className="py-1">
        <div className="px-4 pt-2 pb-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Export
          </div>
        </div>
        {[
          {
            key: "image" as FeedbackKey,
            icon: Copy,
            label: "Copy as Image",
            desc: "Paste to chat / docs",
            action: onCopyImage,
          },
          {
            key: null as FeedbackKey,
            icon: Download,
            label: "Download PNG",
            desc: "Save to local",
            action: onDownloadPng,
          },
          {
            key: "json" as FeedbackKey,
            icon: FileJson,
            label: "Copy JSON",
            desc: "For import later",
            action: onCopyJson,
          },
        ].map((item) => {
          const Icon = item.icon;
          const isDone = feedback === item.key;
          return (
            <button
              key={item.label}
              onClick={() => handleAction(item.key, item.action)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-indigo-50 flex items-center justify-center flex-shrink-0 transition-colors">
                {isDone ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Icon
                    size={16}
                    className="text-gray-500 group-hover:text-indigo-600 transition-colors"
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-700">
                  {isDone ? "Copied!" : item.label}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
