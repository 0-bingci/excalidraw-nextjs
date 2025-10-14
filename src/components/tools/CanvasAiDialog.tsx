// @/components/tools/CanvasAiDialog.tsx
"use client";

import type React from "react";

interface CanvasAiDialogProps {
  visible: boolean;
  position: { x: number; y: number };
  inputValue: string;
  messages: Array<{ type: "user" | "ai"; content: string }>;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSendMessage: (content: string) => void;
}

const CanvasAiDialog: React.FC<CanvasAiDialogProps> = ({
  visible,
  position,
  inputValue,
  messages,
  onClose,
  onInputChange,
  onSendMessage,
}) => {
  if (!visible) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      onSendMessage(inputValue.trim());
    }
  };

  return (
    <div
      className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-80"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxHeight: "400px",
        transform: "translateY(10px)",
        boxSizing: "border-box",
      }}
    >
      {/* 对话框头部（改用中性灰配色，与右键菜单统一） */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-100 text-gray-800 rounded-t-lg">
        <h3 className="font-medium">AI 助手</h3>
        <button
          className="text-gray-600 hover:bg-gray-200 rounded-full p-1 transition-colors"
          onClick={onClose}
          aria-label="关闭AI助手"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 消息列表区域（消息气泡改用中性灰，区分但不突兀） */}
      <div className="p-3 overflow-y-auto max-h-[280px] flex flex-col gap-2">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center py-4 text-sm">
            <p>我是您的AI助手，请问有什么可以帮您？</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg max-w-[90%] text-sm ${
                msg.type === "user"
                  ? "bg-gray-200 text-gray-800 self-end" // 用户消息：稍深灰色
                  : "bg-gray-100 text-gray-800 self-start" // AI消息：浅灰色
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
      </div>

      {/* 输入框区域（按钮改用中性灰，与右键菜单按钮风格统一） */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
            placeholder="输入您的问题..."
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            className="bg-gray-600 text-white rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors text-sm"
            onClick={() => inputValue.trim() && onSendMessage(inputValue.trim())}
            disabled={!inputValue.trim()}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasAiDialog;