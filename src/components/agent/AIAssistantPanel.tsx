import React, { useState, useEffect, useRef } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "loading" | "error"; // loading / error 由父组件传入
}

interface AIAssistantPanelProps {
  onClose: () => void;
  onSendMessage: (message: string) => void;
  messages: Message[];
  onSelectRegion: () => void; // 👈 新增：通知父组件开始区域选择
}

export const AIAssistantPanel = ({
  onClose,
  onSendMessage,
  messages,
  onSelectRegion,
}: AIAssistantPanelProps) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 判断是否正在等待 AI 响应（存在 loading 消息）
  const isSending = messages.some((msg) => msg.status === "loading");

  const handleSend = () => {
    if (!inputValue.trim() || isSending) return;
    onSendMessage(inputValue.trim());
    setInputValue(""); // 清空输入框（父组件会 push user message）
  };

  const handleRetry = (failedMessageId: string) => {
    // 找到对应的用户消息（假设错误消息前一条是用户消息）
    const userMsgIndex = messages.findIndex(
      (msg, i) =>
        messages[i + 1]?.id === failedMessageId && msg.role === "user",
    );
    if (userMsgIndex !== -1) {
      const userContent = messages[userMsgIndex].content;
      setInputValue(userContent);
      // 父组件应监听重试事件，这里只提供内容
      // 实际重试逻辑由父组件实现（比如重新调用 onSendMessage）
      // 你可以额外加一个 onRetry prop，但为简化，这里只回填输入框
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-lg">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">AI Assistant</h2>
        <div className="flex items-center space-x-2">
          {/* 区域选择按钮 */}
          <button
            onClick={onSelectRegion}
            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Select region on canvas"
            title="Select a region to analyze"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Close AI panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.status === "loading" ? (
              // AI 正在思考指示器
              <div className="bg-gray-100 text-gray-500 text-sm rounded-lg rounded-br-none px-3 py-2 max-w-xs">
                <div className="flex items-center space-x-1">
                  <span>AI is thinking</span>
                  <span className="inline-flex space-x-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                    <span
                      className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></span>
                  </span>
                </div>
              </div>
            ) : msg.status === "error" ? (
              // 错误消息 + 重试按钮
              <div className="bg-red-50 text-red-700 text-sm rounded-lg rounded-br-none px-3 py-2 max-w-xs">
                {msg.content}
                <button
                  onClick={() => handleRetry(msg.id)}
                  className="mt-1 text-xs underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              // 普通消息（user 或 assistant）
              <div
                className={`text-sm rounded-lg px-3 py-2 max-w-xs ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-bl-none"
                    : "bg-gray-100 text-gray-800 rounded-br-none"
                }`}
              >
                {msg.content}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            rows={2}
            placeholder={isSending ? "Waiting for AI..." : "Message AI..."}
            className={`flex-1 text-sm rounded-lg px-3 py-2 resize-none focus:outline-none border ${
              isSending
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-gray-50 text-gray-800 border-gray-200 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className={`p-2 rounded-lg transition-colors shadow-sm ${
              !inputValue.trim() || isSending
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          AI may produce inaccurate info
        </p>
      </div>
    </div>
  );
};
