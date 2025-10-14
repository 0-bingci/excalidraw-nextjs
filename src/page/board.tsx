// src/components/NotionMainContent.tsx
"use client";

import { MoreHorizontal, Clock, BookOpen, Plus, FileText } from "lucide-react";
import Link from "next/link";
export default function NotionMainContent() {

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-20 py-16">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold text-gray-900">白板</h1>
        </div>

        {/* 最近访问区域 */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4 text-gray-500">
            <Clock size={16} />
            <h2 className="text-sm font-medium">最近访问</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Link href="/board" className="block">
              <button className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow text-left group w-full">
                {/* 按钮内容不变 */}
                <div className="mb-4">
                  <FileText size={28} className="text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  从电脑桌面端开始吧！
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="w-3 h-3 flex items-center justify-center bg-gray-100 rounded text-[10px]">
                    C
                  </span>
                  <span>1 天前</span>
                </div>
              </button>
            </Link>

            <button className="p-6 bg-gray-50 border border-gray-200 border-dashed rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500">
              <Plus size={24} />
              <span className="text-sm">新页面</span>
            </button>
          </div>
        </section>

        {/* 入门学习区域 */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4 text-gray-500">
            <BookOpen size={16} />
            <h2 className="text-sm font-medium">产品文档</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {/* 教程卡片1 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-sm transition-shadow cursor-pointer group">
              <div className="h-32 bg-white flex items-center justify-center p-4 relative">
                <svg viewBox="0 0 120 80" className="w-full h-full">
                  <rect x="10" y="60" width="20" height="20" fill="#e5e7eb" />
                  <rect x="35" y="50" width="20" height="30" fill="#e5e7eb" />
                  <rect x="60" y="40" width="20" height="40" fill="#e5e7eb" />
                  <rect x="85" y="30" width="20" height="50" fill="#e5e7eb" />
                  <path
                    d="M10,60 L30,50 L55,40 L80,30 L105,20"
                    stroke="#9ca3af"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  创建数据库
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <BookOpen size={12} />
                  <span>阅读时间：3 分钟</span>
                </div>
              </div>
            </div>

            {/* 教程卡片2 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-sm transition-shadow cursor-pointer group">
              <div className="h-32 bg-white flex items-center justify-center p-4">
                <svg viewBox="0 0 120 80" className="w-full h-full">
                  <rect
                    x="20"
                    y="20"
                    width="35"
                    height="25"
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                  />
                  <rect x="65" y="20" width="35" height="25" fill="#000" />
                  <rect x="20" y="50" width="35" height="8" fill="#e5e7eb" />
                  <rect x="65" y="50" width="35" height="8" fill="#e5e7eb" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  什么是区块?
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <BookOpen size={12} />
                  <span>阅读时间：2 分钟</span>
                </div>
              </div>
            </div>

            {/* 教程卡片3 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-sm transition-shadow cursor-pointer group">
              <div className="h-32 bg-white flex items-center justify-center p-4">
                <svg viewBox="0 0 120 80" className="w-full h-full">
                  <rect
                    x="30"
                    y="15"
                    width="60"
                    height="50"
                    fill="white"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <line
                    x1="35"
                    y1="25"
                    x2="85"
                    y2="25"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <line
                    x1="35"
                    y1="35"
                    x2="70"
                    y2="35"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <line
                    x1="35"
                    y1="45"
                    x2="75"
                    y2="45"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <circle cx="40" cy="55" r="3" fill="#e5e7eb" />
                  <circle cx="50" cy="55" r="3" fill="#e5e7eb" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  创建你的第一个页面
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>观看时间：2 分钟</span>
                </div>
              </div>
            </div>

            {/* 教程卡片4 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-sm transition-shadow cursor-pointer group">
              <div className="h-32 bg-white flex items-center justify-center p-4">
                <svg viewBox="0 0 120 80" className="w-full h-full">
                  <rect
                    x="25"
                    y="10"
                    width="40"
                    height="50"
                    fill="white"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <rect
                    x="55"
                    y="30"
                    width="40"
                    height="40"
                    fill="white"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <line
                    x1="45"
                    y1="35"
                    x2="55"
                    y2="35"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  创建子页面
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <BookOpen size={12} />
                  <span>阅读时间：</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
