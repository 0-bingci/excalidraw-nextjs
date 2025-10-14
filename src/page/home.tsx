"use client";

import { MoreHorizontal, Clock, BookOpen, Plus, FileText } from "lucide-react";

export default function NotionMainContent() {
  // 动态生成问候语（内容层内部逻辑，与布局层解耦）
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "早上好呀";
    if (hour < 18) return "下午好呀";
    return "晚上好呀";
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-20 py-16">
        {/* 头部问候语 */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold text-gray-900">{getGreeting()}</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreHorizontal size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 活动统计区域 */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-gray-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
            <h2 className="text-sm font-medium">活动统计</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center h-24 mb-4">
                <svg width="60" height="60" viewBox="0 0 60 60" className="text-gray-300">
                  <rect
                    x="15"
                    y="15"
                    width="30"
                    height="30"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <text x="30" y="35" textAnchor="middle" fontSize="16" fill="currentColor">
                    15
                  </text>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">今天</p>
                <p className="text-sm text-gray-700">10月13日</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center h-24 mb-4 text-gray-400">
                <div className="text-center">
                  <p className="text-2xl font-semibold mb-1">团队晨会</p>
                  <p className="text-sm">9:00 · 办公室</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}