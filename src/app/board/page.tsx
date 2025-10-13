"use client";

import type React from "react";
import * as fabric from "fabric";
import { useState, useRef, useEffect } from "react";
import { initializeCanvasTools } from '@/components/canvas-tools';
import { Tool } from '@/components/canvas-tools/types';
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
  const [isLocked, setIsLocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
  });
  
  // AI对话框状态
  const [aiDialog, setAiDialog] = useState<{
    visible: boolean;
    x: number;
    y: number;
    input: string;
    messages: Array<{type: 'user' | 'ai', content: string}>;
  }>({
    visible: false,
    x: 0,
    y: 0,
    input: '',
    messages: [],
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvas = useRef<fabric.Canvas | null>(null);
  const zoom = 100;
  const canvasToolsRef = useRef<any>(null); // 存储canvas工具实例
  
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

    // 设置画布尺寸以匹配容器
    const setCanvasDimensions = () => {
      if (canvasRef.current && canvas.current) {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          canvas.current.setWidth(width);
          canvas.current.setHeight(height);
          canvas.current.renderAll();
        }
      }
    };

    // 初始化尺寸
    setCanvasDimensions();
    
    // 监听窗口大小变化，调整画布尺寸
    window.addEventListener('resize', setCanvasDimensions);
    
    // 初始化画布工具
    canvasToolsRef.current = initializeCanvasTools(canvas.current, (tool: Tool) => {
      setSelectedTool(tool);
    });
    canvasToolsRef.current.setupEventListeners();

    // 清理函数
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      canvasToolsRef.current?.cleanupEventListeners();
      canvas.current?.dispose();
      canvas.current = null;
    };
  }, []);
  
  useEffect(() => {
    console.log("selectedTool:", selectedTool);
    if (canvasToolsRef.current) {
      canvasToolsRef.current.setTool(selectedTool);
    }
  }, [selectedTool]);

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
            className={`p-2 rounded-md transition-all duration-150 group ${isLocked ? "bg-blue-100 text-blue-600 hover:bg-blue-200" : "hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-800"}`}
            title={isLocked ? "解锁画布" : "锁定画布"}
          >
            <Lock size={18} className="transition-colors" />
          </button>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className={`p-2 rounded-md transition-all duration-150 group ${!isVisible ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-800"}`}
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
                className={`p-2 rounded-md transition-all duration-150 group relative ${selectedTool === tool.id ? "bg-blue-100 text-blue-600 shadow-sm ring-1 ring-blue-200" : "hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-800"}`}
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
          className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 font-medium ${showLibrary ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300"}`}
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
      <div 
        className="relative w-1000 h-full" 
        id="canvasContainer" 
        ref={containerRef}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY
          });
        }}
        onClick={() => {
          if (contextMenu.visible) {
            setContextMenu({...contextMenu, visible: false});
          }
        }}
      >
        {/* 画布 */}
        <canvas
          id="stageCanvas"
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
        />
        
        {/* 右键菜单 */}
        {contextMenu.visible && (
          <div 
            className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
          >
            <button 
              className="w-full px-4 py-2 flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all duration-200"
              onClick={() => {
                setContextMenu({...contextMenu, visible: false});
                setAiDialog({
                  ...aiDialog,
                  visible: true,
                  x: contextMenu.x,
                  y: contextMenu.y
                });
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z" stroke="currentColor" strokeWidth="2" />
                <path d="M8 12H16M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>AI 助手</span>
            </button>
          </div>
        )}
        
        {/* AI对话框 */}
        {aiDialog.visible && (
          <div 
            className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-80"
            style={{
              left: `${aiDialog.x}px`,
              top: `${aiDialog.y}px`,
              maxHeight: '400px',
            }}
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <h3 className="font-medium">AI 助手</h3>
              <button 
                className="text-white hover:bg-white/20 rounded-full p-1"
                onClick={() => setAiDialog({...aiDialog, visible: false})}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            
            <div className="p-3 overflow-y-auto max-h-[280px] flex flex-col gap-2">
              {aiDialog.messages.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  <p>我是您的AI助手，请问有什么可以帮您？</p>
                </div>
              ) : (
                aiDialog.messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded-lg max-w-[90%] ${
                      msg.type === 'user' 
                        ? 'bg-blue-100 text-blue-800 self-end' 
                        : 'bg-gray-100 text-gray-800 self-start'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入您的问题..."
                  value={aiDialog.input}
                  onChange={(e) => setAiDialog({...aiDialog, input: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && aiDialog.input.trim()) {
                      const newMessages = [
                        ...aiDialog.messages,
                        { type: 'user', content: aiDialog.input.trim() },
                        { type: 'ai', content: '我理解您的问题，正在思考如何帮助您...' }
                      ];
                      setAiDialog({
                        ...aiDialog,
                        messages: newMessages,
                        input: ''
                      });
                    }
                  }}
                />
                <button 
                  className="bg-blue-500 text-white rounded-lg px-3 py-2 hover:bg-blue-600"
                  onClick={() => {
                    if (aiDialog.input.trim()) {
                      const newMessages = [
                        ...aiDialog.messages,
                        { type: 'user', content: aiDialog.input.trim() },
                        { type: 'ai', content: '我理解您的问题，正在思考如何帮助您...' }
                      ];
                      setAiDialog({
                        ...aiDialog,
                        messages: newMessages,
                        input: ''
                      });
                    }
                  }}
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
