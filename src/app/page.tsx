"use client";

import { useRouter } from "next/navigation";
import {
  MousePointer2,
  Pen,
  Users,
  Sparkles,
  ArrowRight,
  Square,
  Circle,
  Diamond,
  Type,
  Minus,
} from "lucide-react";

const features = [
  {
    icon: Pen,
    title: "丰富的绘图工具",
    desc: "矩形、圆形、菱形、箭头、画笔、文字等多种工具，满足各种绘图需求",
  },
  {
    icon: Users,
    title: "多人实时协作",
    desc: "基于 Yjs CRDT 技术，支持多人同时编辑，实时同步光标与画布内容",
  },
  {
    icon: Sparkles,
    title: "AI 智能生成",
    desc: "通过自然语言描述即可生成图形，AI 助手理解画布上下文并智能创作",
  },
];

// 装饰用的浮动图形
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[12%] left-[8%] animate-float-slow">
        <Square className="w-10 h-10 text-blue-200 rotate-12" strokeWidth={1.5} />
      </div>
      <div className="absolute top-[18%] right-[12%] animate-float-mid">
        <Circle className="w-8 h-8 text-purple-200 -rotate-6" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-[25%] left-[15%] animate-float-mid">
        <Diamond className="w-9 h-9 text-indigo-200 rotate-45" strokeWidth={1.5} />
      </div>
      <div className="absolute top-[40%] right-[8%] animate-float-slow">
        <Type className="w-7 h-7 text-sky-200 -rotate-12" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-[18%] right-[20%] animate-float-fast">
        <Minus className="w-12 h-12 text-blue-100 rotate-[30deg]" strokeWidth={1.5} />
      </div>
      <div className="absolute top-[60%] left-[6%] animate-float-fast">
        <Square className="w-6 h-6 text-violet-200 rotate-[20deg]" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      <FloatingShapes />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
            <MousePointer2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Excalidraw
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            支持 AI 智能生成图形
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-5">
            在线协作
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              白板工具
            </span>
          </h1>

          <p className="text-lg text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
            轻松绘制流程图、架构图、线框图，与团队实时协作，让 AI 帮你加速创作
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push("/board")}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-base shadow-lg shadow-blue-200/60 hover:shadow-xl hover:shadow-blue-300/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              开始绘图
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mt-20 w-full">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-5 rounded-2xl bg-white/70 backdrop-blur border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-3.5 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                <f.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-sm text-gray-400">
        Built with Next.js & Fabric.js
      </footer>
    </div>
  );
}
