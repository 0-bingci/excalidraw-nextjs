import type * as fabric from 'fabric';
import type { Tool, CanvasToolState, ShapeProperties } from './types';
// 扩展fabric.Canvas接口，添加isEditingText标志
declare module 'fabric' {
  interface Canvas {
    isEditingText?: boolean;
  }
}
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
  canvas: fabric.Canvas,
  onToolChange?: (tool: Tool) => void
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
    
    // 重置文本工具等待退出状态
    toolState.textToolWaitingForExit = false;
    
    // 通知外部工具已更改
    if (onToolChange) {
      onToolChange(tool);
    }
  };
  
  // 事件处理函数
  const onMouseDown = (options: any): void => {
    // 检查是否在文本工具模式下
    if (currentTool === 'text') {
      // 如果已经有活跃的文本对象（正在编辑）
      if (canvas.isEditingText) {
        // 如果点击的是空白区域，则切换到选择工具
        if (!options.target) {
          setTool('select');
          return;
        }
        // 如果点击的是当前编辑的文本对象本身，让fabric.js自己处理鼠标事件（如移动光标、选中文本等）
        if (options.target === canvas.getActiveObject()) {
          // 不进行任何特殊处理，让fabric.js自己处理这个鼠标事件
          return;
        }
      }
      
      // 实现文本工具的两步交互逻辑
      // 第一步：点击空白处创建文本框
      // 第二步：再次点击空白处时，返回到选择模式
      if (!options.target) {
        if (toolState.textToolWaitingForExit) {
          // 第二步：已经创建了文本框，现在点击空白处返回选择模式
          setTool('select');
          return;
        }
        // 第一步：首次点击空白处，创建文本框并设置状态
        const pointer = canvas.getPointer(options.e);
        // 保存当前事件到toolState，以便handToolHandler使用
        (toolState as any).currentEvent = options.e;
        handleMouseDown(canvas, pointer.x, pointer.y, toolState);
        // 设置文本工具等待退出状态
        toolState.textToolWaitingForExit = true;
        return;
      }
    }
    
    // 执行正常的鼠标按下处理
    const pointer = canvas.getPointer(options.e);
    // 保存当前事件到toolState，以便handToolHandler使用
    (toolState as any).currentEvent = options.e;
    handleMouseDown(canvas, pointer.x, pointer.y, toolState);
  };
  
  const onMouseMove = (options: any): void => {
    const pointer = canvas.getPointer(options.e);
    // 保存当前事件到toolState，以便handToolHandler使用
    (toolState as any).currentEvent = options.e;
    handleMouseMove(canvas, pointer.x, pointer.y, toolState);
  };
  
  const onMouseUp = (): void => {
    handleMouseUp(canvas, toolState);
    
    // 检查工具是否已自动切换到select
    if (currentTool !== toolState.activeTool) {
      // 更新currentTool以匹配toolState
      currentTool = toolState.activeTool;
      // 通知外部工具已更改
      if (onToolChange) {
        onToolChange(currentTool);
      }
    }
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