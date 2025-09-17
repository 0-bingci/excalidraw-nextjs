"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
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
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [zoom, setZoom] = useState(100);
  const [isLocked, setIsLocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === "select" || selectedTool === "hand") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // 清除画布并重绘所有元素
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 重绘现有元素
    elements.forEach((element) => {
      drawElement(ctx, element);
    });

    // 绘制当前正在绘制的元素
    drawCurrentElement(ctx, startPoint.x, startPoint.y, currentX, currentY);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: selectedTool,
      x: Math.min(startPoint.x, endX),
      y: Math.min(startPoint.y, endY),
      width: Math.abs(endX - startPoint.x),
      height: Math.abs(endY - startPoint.y),
      strokeColor: "#000000",
      fillColor: "transparent",
      strokeWidth: 2,
    };

    setElements((prev) => [...prev, newElement]);
    setIsDrawing(false);
  };

  const drawElement = (
    ctx: CanvasRenderingContext2D,
    element: DrawingElement
  ) => {
    ctx.strokeStyle = element.strokeColor;
    ctx.fillStyle = element.fillColor;
    ctx.lineWidth = element.strokeWidth;

    switch (element.type) {
      case "rectangle":
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        if (element.fillColor !== "transparent") {
          ctx.fillRect(element.x, element.y, element.width, element.height);
        }
        break;
      case "circle":
        ctx.beginPath();
        const radius = Math.min(element.width, element.height) / 2;
        ctx.arc(
          element.x + element.width / 2,
          element.y + element.height / 2,
          radius,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        if (element.fillColor !== "transparent") {
          ctx.fill();
        }
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.x + element.width, element.y + element.height);
        ctx.stroke();
        break;
    }
  };

  const drawCurrentElement = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    currentX: number,
    currentY: number
  ) => {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;

    switch (selectedTool) {
      case "rectangle":
        const width = currentX - startX;
        const height = currentY - startY;
        ctx.strokeRect(startX, startY, width, height);
        break;
      case "circle":
        ctx.beginPath();
        const radius =
          Math.min(Math.abs(currentX - startX), Math.abs(currentY - startY)) /
          2;
        ctx.arc(
          startX + (currentX - startX) / 2,
          startY + (currentY - startY) / 2,
          radius,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        break;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置画布大小
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 重绘所有元素
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elements.forEach((element) => {
      drawElement(ctx, element);
    });
  }, [elements]);

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
          onClick={() => setShowLibrary(!showLibrary)}
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
            onClick={() => setZoom(Math.max(10, zoom - 10))}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group"
            title="缩小"
          >
            <ZoomOut
              size={16}
              className="text-gray-600 group-hover:text-gray-800 transition-colors"
            />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 rounded transition-all duration-150 min-w-[50px] text-center font-medium"
            title="重置缩放"
          >
            {zoom}%
          </button>
          <button
            onClick={() => setZoom(Math.min(500, zoom + 10))}
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
            disabled={elements.length === 0}
          >
            <Undo
              size={16}
              className="text-gray-600 group-hover:text-gray-800 transition-colors"
            />
          </button>
          <button
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group disabled:opacity-50 disabled:cursor-not-allowed"
            title="重做"
            disabled={true}
          >
            <Redo
              size={16}
              className="text-gray-600 group-hover:text-gray-800 transition-colors"
            />
          </button>
        </div>
      </div>

      {/* 画布区域 */}
      <div className="relative w-full h-full">
        {/* 提示文本 */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-lg">
              要开始绘图，请选择任意标准或绘图工具并拖拽鼠标，或者用手工具。
            </p>
          </div>
        )}

        {/* 画布 */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            cursor:
              selectedTool === "hand"
                ? "grab"
                : selectedTool === "select"
                ? "default"
                : "crosshair",
          }}
        />
      </div>
    </div>
  );
}
