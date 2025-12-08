"use client";

import type React from "react";
import * as fabric from "fabric";
import { useState, useRef, useEffect } from "react";
import { initializeCanvasTools } from "@/components/canvas-tools";
import { Tool } from "@/components/canvas-tools/types";
// 导入两个独立组件
import CanvasContextMenu from "@/components/tools/CanvasContextMenu";
import CanvasAiDialog from "@/components/tools/CanvasAiDialog"; // 新增：导入AI对话框组件
import ShapePropertiesPanel from "@/components/tools/ShapePropertiesPanel"; // 新增：导入属性面板组件
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



export default function ExcalidrawClone() {
  // 状态管理（保留原有）
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [isLocked, setIsLocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null); // 新增：选中对象状态
  const [zoomLevel, setZoomLevel] = useState(1); // 新增：缩放级别状态
  
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

  // 定义canvasToolsRef的类型
  type CanvasTools = ReturnType<typeof initializeCanvasTools>;
  const canvasToolsRef = useRef<CanvasTools | null>(null);


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

  // 预设的JSON数据
  const importJson = 
{
  "version": "6.7.1",
  "objects": [
    {
      "rx": 20,
      "ry": 20,
      "type": "Ellipse",
      "version": "6.7.1",
      "originX": "left",
      "originY": "top",
      "left": 100,
      "top": 50,
      "width": 100,
      "height": 50,
      "fill": "#e8f4fd",
      "stroke": "#206bc4",
      "strokeWidth": 2,
      "opacity": 1,
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "center",
      "left": 150,
      "top": 75,
      "text": "开始",
      "fontSize": 16,
      "fill": "#333",
      "fontFamily": "Arial",
      "visible": true
    },
    {
      "type": "Rect",
      "version": "6.7.1",
      "originX": "left",
      "originY": "top",
      "left": 100,
      "top": 130,
      "width": 200,
      "height": 80,
      "fill": "#f5fafe",
      "stroke": "#206bc4",
      "strokeWidth": 2,
      "opacity": 1,
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "center",
      "left": 200,
      "top": 170,
      "text": "选择班级与科目",
      "fontSize": 14,
      "fill": "#333",
      "fontFamily": "Arial",
      "visible": true,
      "textAlign": "center"
    },
    {
      "type": "Rect",
      "version": "6.7.1",
      "originX": "left",
      "originY": "top",
      "left": 100,
      "top": 240,
      "width": 200,
      "height": 80,
      "fill": "#f5fafe",
      "stroke": "#206bc4",
      "strokeWidth": 2,
      "opacity": 1,
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "center",
      "left": 200,
      "top": 280,
      "text": "输入学生成绩信息",
      "fontSize": 14,
      "fill": "#333",
      "fontFamily": "Arial",
      "visible": true,
      "textAlign": "center"
    },
    {
      "type": "Polygon",
      "version": "6.7.1",
      "originX": "left",
      "originY": "top",
      "left": 100,
      "top": 350,
      "width": 200,
      "height": 80,
      "points": [{"x": 100, "y": 390}, {"x": 200, "y": 350}, {"x": 300, "y": 390}, {"x": 200, "y": 430}],
      "fill": "#fef7fb",
      "stroke": "#e53e3e",
      "strokeWidth": 2,
      "opacity": 1,
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "center",
      "left": 200,
      "top": 390,
      "text": "成绩格式是否正确？",
      "fontSize": 14,
      "fill": "#333",
      "fontFamily": "Arial",
      "visible": true,
      "textAlign": "center"
    },
    {
      "type": "Rect",
      "version": "6.7.1",
      "originX": "left",
      "originY": "top",
      "left": 350,
      "top": 350,
      "width": 180,
      "height": 80,
      "fill": "#fef2f2",
      "stroke": "#e53e3e",
      "strokeWidth": 2,
      "opacity": 1,
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "center",
      "left": 440,
      "top": 390,
      "text": "提示格式错误\n重新输入",
      "fontSize": 14,
      "fill": "#333",
      "fontFamily": "Arial",
      "visible": true,
      "textAlign": "center"
    },
    {
      "type": "Polygon",
      "version": "6.7.1",
      "originX": "left",
      "originY": "top",
      "left": 100,
      "top": 460,
      "width": 200,
      "height": 80,
      "points": [{"x": 100, "y": 500}, {"x": 200, "y": 460}, {"x": 300, "y": 500}, {"x": 200, "y": 540}],
      "fill": "#fef7fb",
      "stroke": "#e53e3e",
      "strokeWidth": 2,
      "opacity": 1,
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "center",
      "left": 200,
      "top": 500,
      "text": "成绩是否超出范围？",
      "fontSize": 14,
      "fill": "#333",
      "fontFamily": "Arial",
      "visible": true,
      "textAlign": "center"
    },
    {
      "type": "Rect",
      "version": "6.7.1",
      "originX": "left",
      "originY": "top",
      "left": 350,
      "top": 460,
      "width": 180,
      "height": 80,
      "fill": "#fef2f2",
      "stroke": "#e53e3e",
      "strokeWidth": 2,
      "opacity": 1,
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "center",
      "left": 440,
      "top": 500,
      "text": "提示范围错误\n重新输入",
      "fontSize": 14,
      "fill": "#333",
      "fontFamily": "Arial",
      "visible": true,
      "textAlign": "center"
    },
    {
      "type": "Rect",
      "version": "6.7.1",
      "originX": "left",
      "originY": "top",
      "left": 100,
      "top": 570,
      "width": 200,
      "height": 80,
      "fill": "#f0fdf4",
      "stroke": "#10b981",
      "strokeWidth": 2,
      "opacity": 1,
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "center",
      "left": 200,
      "top": 610,
      "text": "保存成绩信息\n至系统数据库",
      "fontSize": 14,
      "fill": "#333",
      "fontFamily": "Arial",
      "visible": true,
      "textAlign": "center"
    },
    {
      "type": "Ellipse",
      "version": "6.7.1",
      "rx": 20,
      "ry": 20,
      "originX": "left",
      "originY": "top",
      "left": 100,
      "top": 680,
      "width": 100,
      "height": 50,
      "fill": "#e8f4fd",
      "stroke": "#206bc4",
      "strokeWidth": 2,
      "opacity": 1,
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "center",
      "left": 150,
      "top": 705,
      "text": "结束",
      "fontSize": 16,
      "fill": "#333",
      "fontFamily": "Arial",
      "visible": true
    },
    {
      "type": "Line",
      "version": "6.7.1",
      "x1": 150,
      "y1": 100,
      "x2": 150,
      "y2": 130,
      "stroke": "#666",
      "strokeWidth": 2,
      "strokeLineCap": "round",
      "visible": true
    },
    {
      "type": "Line",
      "version": "6.7.1",
      "x1": 200,
      "y1": 210,
      "x2": 200,
      "y2": 240,
      "stroke": "#666",
      "strokeWidth": 2,
      "strokeLineCap": "round",
      "visible": true
    },
    {
      "type": "Line",
      "version": "6.7.1",
      "x1": 200,
      "y1": 320,
      "x2": 200,
      "y2": 350,
      "stroke": "#666",
      "strokeWidth": 2,
      "strokeLineCap": "round",
      "visible": true
    },
    {
      "type": "Line",
      "version": "6.7.1",
      "x1": 300,
      "y1": 390,
      "x2": 350,
      "y2": 390,
      "stroke": "#666",
      "strokeWidth": 2,
      "strokeLineCap": "round",
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "bottom",
      "left": 325,
      "top": 380,
      "text": "否",
      "fontSize": 12,
      "fill": "#666",
      "fontFamily": "Arial",
      "visible": true
    },
    {
      "type": "Line",
      "version": "6.7.1",
      "x1": 200,
      "y1": 430,
      "x2": 200,
      "y2": 460,
      "stroke": "#666",
      "strokeWidth": 2,
      "strokeLineCap": "round",
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "bottom",
      "left": 180,
      "top": 420,
      "text": "是",
      "fontSize": 12,
      "fill": "#666",
      "fontFamily": "Arial",
      "visible": true
    },
    {
      "type": "Line",
      "version": "6.7.1",
      "x1": 440,
      "y1": 390,
      "x2": 200,
      "y2": 240,
      "stroke": "#666",
      "strokeWidth": 2,
      "strokeLineCap": "round",
      "strokeDashArray": [5,5],
      "visible": true
    },
    {
      "type": "Line",
      "version": "6.7.1",
      "x1": 300,
      "y1": 500,
      "x2": 350,
      "y2": 500,
      "stroke": "#666",
      "strokeWidth": 2,
      "strokeLineCap": "round",
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "bottom",
      "left": 325,
      "top": 490,
      "text": "是",
      "fontSize": 12,
      "fill": "#666",
      "fontFamily": "Arial",
      "visible": true
    },
    {
      "type": "Line",
      "version": "6.7.1",
      "x1": 200,
      "y1": 540,
      "x2": 200,
      "y2": 570,
      "stroke": "#666",
      "strokeWidth": 2,
      "strokeLineCap": "round",
      "visible": true
    },
    {
      "type": "Text",
      "version": "6.7.1",
      "originX": "center",
      "originY": "bottom",
      "left": 180,
      "top": 530,
      "text": "否",
      "fontSize": 12,
      "fill": "#666",
      "fontFamily": "Arial",
      "visible": true
    },
    {
      "type": "Line",
      "version": "6.7.1",
      "x1": 440,
      "y1": 500,
      "x2": 200,
      "y2": 240,
      "stroke": "#666",
      "strokeWidth": 2,
      "strokeLineCap": "round",
      "strokeDashArray": [5,5],
      "visible": true
    },
    {
      "type": "Line",
      "version": "6.7.1",
      "x1": 200,
      "y1": 650,
      "x2": 150,
      "y2": 680,
      "stroke": "#666",
      "strokeWidth": 2,
      "strokeLineCap": "round",
      "visible": true
    }
  ],
  "background": "#f0f0f0"
}

  const handleImport = () => { 
    canvas.current?.loadFromJSON(importJson); 
    setTimeout(() => { 
      canvas.current?.renderAll(); 
    }, 100); 
  };

  // 新增：放大功能，中心在屏幕中心点
  const handleZoomIn = () => {
    if (!canvas.current || !containerRef.current) return;
    
    const newZoom = Math.min(zoomLevel + 0.1, 5); // 最大缩放5倍
    const { width, height } = containerRef.current.getBoundingClientRect();
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 获取当前变换矩阵
    const vpt = canvas.current.viewportTransform;
    
    // 1. 将中心点转换为画布坐标
    const canvasCenterX = centerX / zoomLevel - vpt[4] / zoomLevel;
    const canvasCenterY = centerY / zoomLevel - vpt[5] / zoomLevel;
    
    // 2. 计算新的变换矩阵
    const newVpt: [number, number, number, number, number, number] = [
      newZoom,
      vpt[1],
      vpt[2],
      newZoom,
      centerX - canvasCenterX * newZoom,
      centerY - canvasCenterY * newZoom
    ];
    
    // 3. 设置新的变换矩阵
    canvas.current.setViewportTransform(newVpt);
    setZoomLevel(newZoom);
  };

  // 新增：缩小功能，中心在屏幕中心点
  const handleZoomOut = () => {
    if (!canvas.current || !containerRef.current) return;
    
    const newZoom = Math.max(zoomLevel - 0.1, 0.1); // 最小缩放0.1倍
    const { width, height } = containerRef.current.getBoundingClientRect();
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 获取当前变换矩阵
    const vpt = canvas.current.viewportTransform;
    
    // 1. 将中心点转换为画布坐标
    const canvasCenterX = centerX / zoomLevel - vpt[4] / zoomLevel;
    const canvasCenterY = centerY / zoomLevel - vpt[5] / zoomLevel;
    
    // 2. 计算新的变换矩阵
    const newVpt: [number, number, number, number, number, number] = [
      newZoom,
      vpt[1],
      vpt[2],
      newZoom,
      centerX - canvasCenterX * newZoom,
      centerY - canvasCenterY * newZoom
    ];
    
    // 3. 设置新的变换矩阵
    canvas.current.setViewportTransform(newVpt);
    setZoomLevel(newZoom);
  };

  // 新增：重置缩放功能
  const handleResetZoom = () => {
    if (!canvas.current) return;
    
    // 重置变换矩阵
    canvas.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
    setZoomLevel(1);
  };




  // 处理属性更新 - 实现图层操作功能
  const handleUpdateProperty = (property: string, value: any) => {
    if (!canvas.current || !selectedObject) return;

    canvas.current.discardActiveObject();
    
    switch (property) {
      case 'stroke':
      case 'fill':
      case 'strokeWidth':
      case 'strokeDashArray':
      case 'opacity':
      case 'visible':
        selectedObject.set(property, value);
        break;
        
      // 复制对象功能 - 使用Fabric.js 6.x的Promise形式clone方法
      case 'copy':
        try {
          // 使用Fabric.js 6.x的Promise形式clone方法
          selectedObject.clone().then((clonedObj: fabric.Object) => {
            // 调整克隆对象位置（向右下方偏移20px，避免重叠）
            if (typeof clonedObj.left === 'number' && typeof clonedObj.top === 'number') {
              clonedObj.set({
                left: clonedObj.left + 20,
                top: clonedObj.top + 20,
                // 确保克隆对象可选中
                selectable: true
              });
            }

            if (selectedObject.group) {
              // 如果对象在组内
              const group = selectedObject.group;
              
              // 将克隆对象添加到组的_objects数组末尾（显示在顶层）
              group._objects.push(clonedObj);
              // 重新计算组的边界（避免克隆对象超出组范围导致选不到）
              group.setCoords();
              // 选中新克隆的对象
              group.setActiveObject(clonedObj);
              // 重新渲染组
              group.renderAll();
            } else if (canvas.current) {
              // 如果对象不在组内，添加到画布
              canvas.current.add(clonedObj);
              // 将克隆对象设为活动对象
              canvas.current.setActiveObject(clonedObj);
            }
            
            // 重新渲染整个画布
            canvas.current?.renderAll();
          }).catch((error) => {
            console.error('克隆对象失败:', error);
            // 保持原有的备用方案
            if (canvas.current) {
              const json = selectedObject.toJSON(['selectable', 'editable', 'lockMovementX', 'lockMovementY']);
              fabric.util.enlivenObjects([json], (objects) => {
                const clonedObject = objects[0];
                if (typeof clonedObject.left === 'number' && typeof clonedObject.top === 'number') {
                  clonedObject.left += 20;
                  clonedObject.top += 20;
                }
                if (selectedObject.group) {
                  selectedObject.group.add(clonedObject);
                  selectedObject.group.renderAll();
                } else {
                  canvas.current?.add(clonedObject);
                }
                canvas.current?.setActiveObject(clonedObject);
                canvas.current?.renderAll();
              });
            }
          });
        } catch (error) {
          console.error('复制功能错误:', error);
        }
        break;
        
      // 删除对象功能
      case 'delete':
        try {
          if (selectedObject.group) {
            // 如果对象在组内
            const group = selectedObject.group;
            const index = group._objects.indexOf(selectedObject);
            
            if (index !== -1) {
              // 从数组中移除对象
              group._objects.splice(index, 1);
              // 清除选中状态
              group.discardActiveObject();
              // 重新渲染组
              group.renderAll();
            }
          } else if (canvas.current) {
            // 如果对象不在组内，从画布中移除
            canvas.current.remove(selectedObject);
            // 清除选中状态
            canvas.current.discardActiveObject();
          }
          
          // 重新渲染画布
          canvas.current?.renderAll();
          // 清除选中对象状态
          setSelectedObject(null);
        } catch (error) {
          console.error('删除功能错误:', error);
        }
        break;
        
      // 图层操作 - 实现fabric.Group内对象的分层操作
      case 'bringToFront':
        if (selectedObject.group) {
          // 如果对象在组内
          const group = selectedObject.group;
          const index = group._objects.indexOf(selectedObject);
          if (index !== -1 && index !== group._objects.length - 1) {
            // 从原位置移除，添加到数组末尾
            group._objects.splice(index, 1);
            group._objects.push(selectedObject);
            group.renderAll();
          }
        } else {
          // 如果对象不在组内，通过操作_objects数组实现
          const objects = canvas.current._objects;
          const index = objects.indexOf(selectedObject);
          if (index !== -1 && index !== objects.length - 1) {
            // 从原位置移除，添加到数组末尾
            objects.splice(index, 1);
            objects.push(selectedObject);
          }
        }
        break;
        
      case 'sendToBack':
        if (selectedObject.group) {
          // 如果对象在组内
          const group = selectedObject.group;
          const index = group._objects.indexOf(selectedObject);
          if (index > 0) {
            // 从原位置移除，添加到数组开头
            group._objects.splice(index, 1);
            group._objects.unshift(selectedObject);
            group.renderAll();
          }
        } else {
          // 如果对象不在组内，通过操作_objects数组实现
          const objects = canvas.current._objects;
          const index = objects.indexOf(selectedObject);
          if (index > 0) {
            // 从原位置移除，添加到数组开头
            objects.splice(index, 1);
            objects.unshift(selectedObject);
          }
        }
        break;
        
      case 'bringForward':
        if (selectedObject.group) {
          // 如果对象在组内
          const group = selectedObject.group;
          const index = group._objects.indexOf(selectedObject);
          if (index !== -1 && index < group._objects.length - 1) {
            // 交换当前对象与后一个对象的位置
            [group._objects[index], group._objects[index + 1]] = 
            [group._objects[index + 1], group._objects[index]];
            group.renderAll();
          }
        } else {
          // 如果对象不在组内，通过操作_objects数组实现
          const objects = canvas.current._objects;
          const index = objects.indexOf(selectedObject);
          if (index !== -1 && index < objects.length - 1) {
            // 交换当前对象与后一个对象的位置
            [objects[index], objects[index + 1]] = [objects[index + 1], objects[index]];
          }
        }
        break;
        
      case 'sendBackward':
        if (selectedObject.group) {
          // 如果对象在组内
          const group = selectedObject.group;
          const index = group._objects.indexOf(selectedObject);
          if (index > 0) {
            // 交换当前对象与前一个对象的位置
            [group._objects[index], group._objects[index - 1]] = 
            [group._objects[index - 1], group._objects[index]];
            group.renderAll();
          }
        } else {
          // 如果对象不在组内，通过操作_objects数组实现
          const objects = canvas.current._objects;
          const index = objects.indexOf(selectedObject);
          if (index > 0) {
            // 交换当前对象与前一个对象的位置
            [objects[index], objects[index - 1]] = [objects[index - 1], objects[index]];
          }
        }
        break;
    }
    
    // 只有在非复制和非删除操作时才设置活动对象
    // 复制操作已经在回调中设置了，删除操作不应该设置活动对象
    if (property !== 'copy' && property !== 'delete') {
      canvas.current.setActiveObject(selectedObject);
      canvas.current.renderAll();
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

    // 添加对象选择事件监听器
    const handleObjectSelected = (e: any) => {
      setSelectedObject(e.selected && e.selected.length > 0 ? e.selected[0] : null);
    };

    const handleSelectionCleared = () => {
      setSelectedObject(null);
    };

    canvas.current.on('selection:created', handleObjectSelected);
    canvas.current.on('selection:updated', handleObjectSelected);
    canvas.current.on('selection:cleared', handleSelectionCleared);

    return () => {
      window.removeEventListener("resize", setCanvasDimensions);
      canvasToolsRef.current?.cleanupEventListeners();
      // 清理事件监听器
      canvas.current?.off('selection:created', handleObjectSelected);
      canvas.current?.off('selection:updated', handleObjectSelected);
      canvas.current?.off('selection:cleared', handleSelectionCleared);
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

      {/* 左下角缩放控制 */}
      <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-2 flex items-center gap-1">
            <button 
              className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group" 
              title="缩小" 
              onClick={handleZoomOut}
            >
              <ZoomOut size={16} className="text-gray-600 group-hover:text-gray-800 transition-colors" />
            </button>
            <button 
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200 rounded transition-all duration-150 min-w-[50px] text-center font-medium" 
              title="重置缩放" 
              onClick={handleResetZoom}
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button 
              className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 group" 
              title="放大" 
              onClick={handleZoomIn}
            >
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
          onImport={handleImport}
          onToggleViewMode={() => {}}
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

        {/* 新增：属性面板组件 */}
        <ShapePropertiesPanel
          visible={!!selectedObject}
          selectedObject={selectedObject}
          onUpdateProperty={handleUpdateProperty}
        />
      </div>
    </div>
  );
}