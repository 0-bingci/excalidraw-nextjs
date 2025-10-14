"use client";

import type React from "react";
import * as fabric from "fabric";
import { useState, useRef, useEffect } from "react";
import { initializeCanvasTools } from "@/components/canvas-tools";
import { Tool } from "@/components/canvas-tools/types";
// 导入两个独立组件
import CanvasContextMenu from "@/components/tools/CanvasContextMenu";
import CanvasAiDialog from "@/components/tools/CanvasAiDialog"; // 新增：导入AI对话框组件
// 图标组件导入
import {
  MousePointer2,
  Hand,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pen,
  Type,
  ImageIcon,
  Eraser as Eraser2,
  Menu,
  Share2,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Lock,
  Eye,
} from "lucide-react";

// 绘图元素类型定义（保留原有）
interface DrawingElement {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
}

export default function ExcalidrawClone() {
  // 状态管理（保留原有）
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [isLocked, setIsLocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  
  // 右键菜单状态（仅保留核心状态）
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });
  
  // AI对话框状态（保留原有，父组件统一管理核心状态）
  const [aiDialog, setAiDialog] = useState<{
    visible: boolean;
    x: number;
    y: number;
    input: string;
    messages: Array<{ type: "user" | "ai"; content: string }>;
  }>({ visible: false, x: 0, y: 0, input: "", messages: [] });

  // Ref定义（保留原有）
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvas = useRef<fabric.Canvas | null>(null);
  const zoom = 100;
  const canvasToolsRef = useRef<any>(null);


  // -------------------------- 新增：AI对话框相关回调函数 --------------------------
  // 1. 关闭AI对话框
  const handleAiDialogClose = () => {
    setAiDialog((prev) => ({ ...prev, visible: false }));
  };

  // 2. 输入框内容变化（同步父组件状态）
  const handleAiInputChange = (value: string) => {
    setAiDialog((prev) => ({ ...prev, input: value }));
  };

  // 3. 发送消息（更新消息列表，清空输入框）
  const handleAiSendMessage = (userContent: string) => {
    setAiDialog((prev) => ({
      ...prev,
      input: "", // 清空输入框
      messages: [
        ...prev.messages,
        { type: "user", content: userContent }, // 添加用户消息
        { type: "ai", content: "我理解您的问题，正在思考如何帮助您..." }, // AI临时回复
      ],
    }));
  };

  // 4. 右键菜单触发AI对话框（保留原有逻辑）
  const handleOpenAiDialog = () => {
    setAiDialog((prev) => ({
      ...prev,
      visible: true,
      x: contextMenu.x,
      y: contextMenu.y,
    }));
  };

  const handleClearCanvas = () => {
  if (canvas.current) {
    canvas.current.clear(); // 清空所有对象
    canvas.current.backgroundColor = "#f0f0f0"; // 恢复背景色（根据你的初始设置）
    canvas.current.renderAll(); // 重新渲染
  }
};

const handleExportPng = () => {
  if (canvas.current) {
    // 确保画布渲染最新状态
    canvas.current.renderAll();

    // 生成 PNG 数据 URL（2倍缩放，更清晰）
    const dataUrl = canvas.current.toDataURL({ multiplier: 2 });

    // 创建下载链接并触发下载
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `excalidraw-clone-${new Date().getTime()}.png`; // 自定义文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

  // -----------------------------------------------------------------------------


  // Canvas初始化与事件监听（保留原有逻辑）
  useEffect(() => {
    if (!canvasRef.current) return;

    canvas.current = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#f0f0f0",
      isDrawingMode: false,
      preserveObjectStacking: true,
      centeredScaling: true,
      selection: false,
    });

    const setCanvasDimensions = () => {
      if (canvasRef.current && canvas.current && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvas.current.setWidth(width);
        canvas.current.setHeight(height);
        canvas.current.renderAll();
      }
    };

    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);

    canvasToolsRef.current = initializeCanvasTools(canvas.current, (tool: Tool) => {
      setSelectedTool(tool);
    });
    canvasToolsRef.current.setupEventListeners();

    return () => {
      window.removeEventListener("resize", setCanvasDimensions);
      canvasToolsRef.current?.cleanupEventListeners();
      canvas.current?.dispose();
      canvas.current = null;
    };
  }, []);


  // 工具切换同步（保留原有逻辑）
  useEffect(() => {
    console.log("selectedTool:", selectedTool);
    if (canvasToolsRef.current) {
      canvasToolsRef.current.setTool(selectedTool);
    }
  }, [selectedTool]);


  // 工具列表（保留原有）
  const tools = [
    { id: "select", icon: MousePointer2, label: "选择" },
    { id: "hand", icon: Hand, label: "拖拽" },
    { id: "rectangle", icon: Square, label: "矩形" },
    { id: "diamond", icon: Diamond, label: "菱形" },
    { id: "circle", icon: Circle, label: "圆形" },
    { id: "arrow", icon: ArrowRight, label: "箭头" },
    { id: "line", icon: Minus, label: "直线" },
    { id: "pen", icon: Pen, label: "画笔" },
    { id: "text", icon: Type, label: "文本" },
    { id: "image", icon: ImageIcon, label: "图片" },
    { id: "eraser", icon: Eraser2, label: "橡皮擦" },
  ];


  // 完整UI渲染（核心修改：替换内嵌AI对话框为组件）
  return (
    <div className="h-screen w-screen bg-gray-50 overflow-hidden">
      {/* 顶部工具栏（保留原有） */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-2 flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group">
            <Menu size={18} className="text-gray-600 group-hover:text-gray-800 transition-colors" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`p-2 rounded-md transition-all duration-150 group ${
              isLocked ? "bg-blue-100 text-blue-600 hover:bg-blue-200" : "hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-800"
            }`}
            title={isLocked ? "解锁画布" : "锁定画布"}
          >
            <Lock size={18} className="transition-colors" />
          </button>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className={`p-2 rounded-md transition-all duration-150 group ${
              !isVisible ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-800"
            }`}
            title={isVisible ? "隐藏元素" : "显示元素"}
          >
            <Eye size={18} className="transition-colors" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id as Tool)}
                className={`p-2 rounded-md transition-all duration-150 group relative ${
                  selectedTool === tool.id
                    ? "bg-blue-100 text-blue-600 shadow-sm ring-1 ring-blue-200"
                    : "hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-800"
                }`}
                title={tool.label}
              >
                <Icon size={18} className="transition-colors" />
                {selectedTool === tool.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 右上角按钮组（保留原有） */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <button
          className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 font-medium ${
            showLibrary
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => setShowLibrary(!showLibrary)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
          素材库
        </button>
        <button className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 font-medium hover:shadow-xl transform hover:-translate-y-0.5">
          <Share2 size={18} />
          分享
        </button>
      </div>

      {/* 左下角缩放控制（保留原有） */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-2 flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group" title="缩小">
            <ZoomOut size={16} className="text-gray-600 group-hover:text-gray-800 transition-colors" />
          </button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 rounded transition-all duration-150 min-w-[50px] text-center font-medium" title="重置缩放">
            {zoom}%
          </button>
          <button className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group" title="放大">
            <ZoomIn size={16} className="text-gray-600 group-hover:text-gray-800 transition-colors" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group disabled:opacity-50 disabled:cursor-not-allowed" title="撤销">
            <Undo size={16} className="text-gray-600 group-hover:text-gray-800 transition-colors" />
          </button>
          <button className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group disabled:opacity-50 disabled:cursor-not-allowed" title="重做" disabled>
            <Redo size={16} className="text-gray-600 group-hover:text-gray-800 transition-colors" />
          </button>
        </div>
      </div>

      {/* 画布区域（核心：集成两个独立组件） */}
      <div
        className="relative w-full h-full"
        id="canvasContainer"
        ref={containerRef}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
        }}
        onClick={() => {
          if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
        }}
      >
        {/* 核心Canvas元素 */}
        <canvas
          id="stageCanvas"
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
        />

        {/* 1. 右键菜单组件 */}
        <CanvasContextMenu
          visible={contextMenu.visible}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu({ ...contextMenu, visible: false })}
          onOpenAiDialog={handleOpenAiDialog}
          onClearCanvas={handleClearCanvas}
          onExportPng={handleExportPng}
        />

        {/* 2. 新增：AI对话框组件（传递所有必要Props） */}
        <CanvasAiDialog
          visible={aiDialog.visible}
          position={{ x: aiDialog.x, y: aiDialog.y }}
          inputValue={aiDialog.input}
          messages={aiDialog.messages}
          onClose={handleAiDialogClose}
          onInputChange={handleAiInputChange}
          onSendMessage={handleAiSendMessage}
        />
      </div>
    </div>
  );
}