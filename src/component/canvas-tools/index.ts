import type * as fabric from 'fabric';
import type { Tool, CanvasToolState, ShapeProperties } from './types';
import { createToolState, setActiveTool, handleMouseDown, handleMouseMove, handleMouseUp } from './toolHandlers';

// 导出类型
export type { Tool, CanvasToolState, ShapeProperties };

// 导出核心功能函数
export {
  createToolState,
  setActiveTool,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp
};

// 导出工具初始化函数
export const initializeCanvasTools = (
  canvas: fabric.Canvas
): {
  toolState: CanvasToolState;
  setTool: (tool: Tool) => void;
  setupEventListeners: () => void;
  cleanupEventListeners: () => void;
} => {
  // 创建工具状态
  const toolState = createToolState();
  let currentTool: Tool = 'select';
  
  // 工具设置函数
  const setTool = (tool: Tool): void => {
    setActiveTool(canvas, tool, currentTool, toolState);
    currentTool = tool;
  };
  
  // 事件处理函数
  const onMouseDown = (options: any): void => {
    const pointer = canvas.getPointer(options.e);
    handleMouseDown(canvas, pointer.x, pointer.y, toolState);
  };
  
  const onMouseMove = (options: any): void => {
    const pointer = canvas.getPointer(options.e);
    handleMouseMove(canvas, pointer.x, pointer.y, toolState);
  };
  
  const onMouseUp = (): void => {
    handleMouseUp(canvas, toolState);
  };
  
  // 设置事件监听器
  const setupEventListeners = (): void => {
    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);
    canvas.on('mouse:up:before', onMouseUp);
  };
  
  // 清理事件监听器
  const cleanupEventListeners = (): void => {
    canvas.off('mouse:down', onMouseDown);
    canvas.off('mouse:move', onMouseMove);
    canvas.off('mouse:up', onMouseUp);
    canvas.off('mouse:up:before', onMouseUp);
  };
  
  // 初始化时设置选择工具
  setTool('select');
  
  return {
    toolState,
    setTool,
    setupEventListeners,
    cleanupEventListeners
  };
};