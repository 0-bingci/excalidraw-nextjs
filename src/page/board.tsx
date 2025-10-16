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
              {/* 核心：通过固定内边距和最小高度确保尺寸稳定 */}
              <button className="p-6 relative rounded-lg hover:shadow-sm transition-all text-left group w-full overflow-hidden min-h-[160px]">
                {/* 图片容器：绝对定位但不影响父元素尺寸 */}
                <div className="absolute inset-0 bg-gray-100">
                  {/* 默认背景色，无图时显示 */}
                  <img
                    src={""}
                    alt="内容预览"
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                  />
                </div>

                {/* 文字层：恢复原布局的「占位区+标题+时间」结构 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  {/* 关键：添加与原图标区域等高的占位，维持mb-4的垂直间距 */}
                  <div className="mb-4 w-7 h-7"></div>
                  {/* 标题和时间保持原样式，位置与原布局一致 */}
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    从电脑桌面端开始吧！
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="w-3 h-3 flex items-center justify-center bg-gray-100 rounded text-[10px]">
                      C
                    </span>
                    <span>1 天前</span>
                  </div>
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
          </div>
        </section>
      </div>
    </main>
  );
}
