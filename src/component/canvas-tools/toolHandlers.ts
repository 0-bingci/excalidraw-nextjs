import * as fabric from 'fabric';
import type { Tool, ToolHandler, CanvasToolState } from './types';

// 创建工具状态对象
export const createToolState = (): CanvasToolState => ({
  activeTool: 'select',
  isDrawing: false,
  startX: 0,
  startY: 0,
  currentShape: null,
  shapeProperties: {
    strokeColor: '#000000',
    fillColor: 'transparent',
    strokeWidth: 2 // 减小笔画宽度从4到2
  }
});

// 选择工具处理器
const selectToolHandler: ToolHandler = {
  onSelect: (canvas) => {
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.defaultCursor = 'default';
  },
  onStartDrawing: () => {},
  onDrawing: () => {},
  onEndDrawing: () => {},
  onDeselect: (canvas) => {
    canvas.selection = false;
  }
};

// 画笔工具处理器
const penToolHandler: ToolHandler = {
  onSelect: (canvas) => {
    canvas.isDrawingMode = true;
    canvas.selection = false;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    (canvas.freeDrawingBrush as any).strokeWidth = 4;
    canvas.defaultCursor = 'crosshair'; // 十字形光标
  },
  onStartDrawing: () => {},
  onDrawing: () => {},
  onEndDrawing: () => {},
  onDeselect: (canvas) => {
    canvas.isDrawingMode = false;
  }
};

// 矩形工具处理器
const rectangleToolHandler: ToolHandler = {
  onSelect: (canvas) => {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair'; // 十字形光标
  },
  onStartDrawing: (canvas, x, y, state) => {
    state.isDrawing = true;
    state.startX = x;
    state.startY = y;
    
    // 创建初始矩形
    state.currentShape = new fabric.Rect({
      left: x,
      top: y,
      width: 0,
      height: 0,
      fill: state.shapeProperties.fillColor,
      stroke: state.shapeProperties.strokeColor,
      strokeWidth: state.shapeProperties.strokeWidth,
      selectable: true // 确保矩形可以被选择工具选中
    });
    
    canvas.add(state.currentShape);
  },
  onDrawing: (canvas, x, y, state) => {
    if (!state.isDrawing || !state.currentShape) return;
    
    const width = Math.abs(x - state.startX);
    const height = Math.abs(y - state.startY);
    const left = Math.min(x, state.startX);
    const top = Math.min(y, state.startY);
    
    // 更新矩形尺寸
    (state.currentShape as fabric.Rect).set({
      left,
      top,
      width,
      height
    });
    
    canvas.renderAll();
  },
  onEndDrawing: (canvas, state) => {
    if (!state.isDrawing || !state.currentShape) return;
    
    state.isDrawing = false;
    
    // 确保矩形至少有一定大小
    const rect = state.currentShape as fabric.Rect;
    if (rect.width < 5 || rect.height < 5) {
      canvas.remove(state.currentShape);
    }
    
    state.currentShape = null;
    canvas.renderAll();
  },
  onDeselect: (canvas) => {
    // 清理逻辑
  }
};

// 工具处理器映射
export const toolHandlers: Record<Tool, ToolHandler> = {
  select: selectToolHandler,
  hand: selectToolHandler, // 暂时使用选择工具的逻辑
  rectangle: rectangleToolHandler,
  diamond: selectToolHandler, // 暂时使用选择工具的逻辑
  circle: selectToolHandler, // 暂时使用选择工具的逻辑
  arrow: selectToolHandler, // 暂时使用选择工具的逻辑
  line: selectToolHandler, // 暂时使用选择工具的逻辑
  pen: penToolHandler,
  text: selectToolHandler, // 暂时使用选择工具的逻辑
  image: selectToolHandler, // 暂时使用选择工具的逻辑
  eraser: selectToolHandler // 暂时使用选择工具的逻辑
};

// 设置活动工具
export const setActiveTool = (
  canvas: fabric.Canvas,
  newTool: Tool,
  currentTool: Tool,
  toolState: CanvasToolState
): void => {
  // 先取消选择当前工具
  if (toolHandlers[currentTool]) {
    toolHandlers[currentTool].onDeselect(canvas);
  }
  
  // 选择新工具
  if (toolHandlers[newTool]) {
    toolHandlers[newTool].onSelect(canvas);
  }
  
  // 更新工具状态
  toolState.activeTool = newTool;
};

// 处理鼠标按下事件
export const handleMouseDown = (
  canvas: fabric.Canvas,
  x: number,
  y: number,
  toolState: CanvasToolState
): void => {
  const handler = toolHandlers[toolState.activeTool];
  if (handler && handler.onStartDrawing) {
    handler.onStartDrawing(canvas, x, y, toolState);
  }
};

// 处理鼠标移动事件
export const handleMouseMove = (
  canvas: fabric.Canvas,
  x: number,
  y: number,
  toolState: CanvasToolState
): void => {
  const handler = toolHandlers[toolState.activeTool];
  if (handler && handler.onDrawing) {
    handler.onDrawing(canvas, x, y, toolState);
  }
};

// 处理鼠标释放事件
export const handleMouseUp = (
  canvas: fabric.Canvas,
  toolState: CanvasToolState
): void => {
  const handler = toolHandlers[toolState.activeTool];
  if (handler && handler.onEndDrawing) {
    handler.onEndDrawing(canvas, toolState);
  }
};