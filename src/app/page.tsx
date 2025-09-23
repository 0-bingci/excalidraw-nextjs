"use client";

import type React from "react";
import * as fabric from "fabric";
import { useState, useRef, useEffect } from "react";
import {saveCanvasData,getCanvasDataById} from "@/utils/indexedDB";
import {
  initHistoryManager,
  destroyHistoryManager,
  undo,
  redo,
} from "@/utils/history";
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

type Tool =
  | "select"
  | "hand"
  | "rectangle"
  | "diamond"
  | "circle"
  | "arrow"
  | "line"
  | "pen"
  | "text"
  | "image"
  | "eraser";

export default function ExcalidrawClone() {
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [isLocked, setIsLocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false); // 初始化完成标记
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null); // 保存Fabric画布实例的引用
  const canvas = useRef<fabric.Canvas | null>(null);
  const zoom = 100;

  useEffect(() => {
    // 确保canvas元素已存在
    if (!canvasRef.current) return;
    // 初始化Fabric画布，使用ref而不是id
    canvas.current = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#f0f0f0",
      isDrawingMode: false,
      preserveObjectStacking: true,
      centeredScaling: true,
      selection: false,
    });
    // 初始化完成后标记
    canvas.current.on("after:render", () => {
      setIsCanvasReady(true); // 监听首次渲染完成事件
    });

    // 设置画布尺寸以匹配容器
    const setCanvasDimensions = () => {
      if (canvasRef.current && canvas.current) {
        if (containerRef.current) {
          const { width, height } =
            containerRef.current.getBoundingClientRect();
          canvas.current.setWidth(width);
          canvas.current.setHeight(height);
          canvas.current.renderAll();
        }
      }
    };

    // 初始化尺寸
    setCanvasDimensions();

    // 监听窗口大小变化，调整画布尺寸
    window.addEventListener("resize", setCanvasDimensions);
    getCanvasDataById('latest').then((b) => {
      if(b){
      canvas.current!.loadFromJSON(b.data, () => {
        // 关键：加载后强制校准偏移 + 重绘
        canvas.current!.calcOffset(); // 校准画布偏移（解决“渲染在视口外”问题）
        canvas.current!.renderAll();
        // 额外保险：触发一次画布尺寸重算
        canvas.current!.setDimensions({
          width: canvasRef.current?.clientWidth || 800,
          height: canvasRef.current?.clientHeight || 600,
        });
      });
  }});
  window.addEventListener('keydown', (e) => {
    // 避免在输入框、文本区域中触发删除
  const activeElement = document.activeElement;
  const isInput = ['INPUT', 'TEXTAREA'].includes(activeElement.tagName);
  if (isInput) return;

  // 检查是否按下了 Delete 或 Backspace 键
  if (e.key === 'Delete' || e.key === 'Backspace') {
    // 阻止默认行为（如浏览器前进/后退）
    e.preventDefault();
    // 获取当前选中的对象
    const activeObject = canvas.current?.getActiveObject();
    canvas.current?.remove(activeObject);
    }
  });
    // 保存画布实例
    fabricCanvasRef.current = canvas.current;
    if (canvas.current) {
      initHistoryManager(canvas.current);
    }

    // 清理函数
    return () => {
      window.removeEventListener("resize", setCanvasDimensions);
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
      destroyHistoryManager();
    };
  }, []);
  useEffect(() => {
    if (!canvas.current || !isCanvasReady) return; // 未就绪则不执行
    if (selectedTool === "select") {
      canvas.current.isDrawingMode = false;
    } else if (selectedTool === "pen") {
      canvas.current.isDrawingMode = true;
      canvas.current.freeDrawingBrush = new fabric.PencilBrush(canvas.current);
      canvas.current.freeDrawingBrush.strokeWidth = 4;
    } else {
      canvas.current.isDrawingMode = false;
    }
  }, [selectedTool, isCanvasReady]); // 依赖增加 isCanvasReady
  useEffect(() => {
    if (!canvas.current || !isCanvasReady) return;

    // 合并为 2 个监听：通用修改 + 特殊操作
    canvas.current.on("path:created", () => {
      const a = canvas.current.toJSON();
      saveCanvasData(a);
    }); 
    return () => {
      canvas.current?.off("path:created", () => {});
    };
  }, [isCanvasReady]);

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

  return (
    <div className="h-screen w-screen bg-gray-50 overflow-hidden">
      {/* 顶部工具栏 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-2 flex items-center gap-1">
          {/* 菜单按钮 */}
          <button className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group">
            <Menu
              size={18}
              className="text-gray-600 group-hover:text-gray-800 transition-colors"
            />
          </button>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 锁定和眼睛图标 */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`p-2 rounded-md transition-all duration-150 group ${
              isLocked
                ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                : "hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-800"
            }`}
            title={isLocked ? "解锁画布" : "锁定画布"}
          >
            <Lock size={18} className="transition-colors" />
          </button>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className={`p-2 rounded-md transition-all duration-150 group ${
              !isVisible
                ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                : "hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-800"
            }`}
            title={isVisible ? "隐藏元素" : "显示元素"}
          >
            <Eye size={18} className="transition-colors" />
          </button>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 工具按钮 */}
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

      {/* 右上角按钮组 */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        {/* 素材库按钮 */}
        <button
          className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 font-medium ${
            showLibrary
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
          素材库
        </button>

        {/* 分享按钮 */}
        <button className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 font-medium hover:shadow-xl transform hover:-translate-y-0.5">
          <Share2 size={18} />
          分享
        </button>
      </div>

      {/* 左下角缩放控制 */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-2 flex items-center gap-1">
          <button
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group"
            title="缩小"
          >
            <ZoomOut
              size={16}
              className="text-gray-600 group-hover:text-gray-800 transition-colors"
            />
          </button>
          <button
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 rounded transition-all duration-150 min-w-[50px] text-center font-medium"
            title="重置缩放"
          >
            {zoom}%
          </button>
          <button
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group"
            title="放大"
          >
            <ZoomIn
              size={16}
              className="text-gray-600 group-hover:text-gray-800 transition-colors"
            />
          </button>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 撤销重做 */}
          <button
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group disabled:opacity-50 disabled:cursor-not-allowed"
            title="撤销"
            onClick={undo}
          >
            <Undo
              size={16}
              className="text-gray-600 group-hover:text-gray-800 transition-colors"
            />
          </button>
          <button
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group disabled:opacity-50 disabled:cursor-not-allowed"
            title="重做"
            // disabled={true}
            onClick={redo}
          >
            <Redo
              size={16}
              className="text-gray-600 group-hover:text-gray-800 transition-colors"
            />
          </button>
        </div>
      </div>

      {/* 画布区域 */}
      <div
        className="relative w-1000 h-full"
        id="canvasContainer"
        ref={containerRef}
      >
        {/* 画布 */}
        <canvas
          id="stageCanvas"
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
        />
      </div>
    </div>
  );
}
