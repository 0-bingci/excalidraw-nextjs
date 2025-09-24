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
    //禁用画布绘图模式
    canvas.isDrawingMode = false;
    //启用选择模式，可以选择已绘制的图形
    canvas.selection = true;
    //设置默认光标为箭头
    canvas.defaultCursor = 'default';
  },
  onStartDrawing: () => {},
  onDrawing: () => {},
  onEndDrawing: () => {},
  //禁用画布选择功能
  onDeselect: (canvas) => {
    canvas.selection = false;
  }
};

// 画笔工具处理器
const penToolHandler: ToolHandler = {
  onSelect: (canvas) => {
    canvas.isDrawingMode = true;
    canvas.selection = false;
    //选择并创建一个铅笔刷对象
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    //设置铅笔刷的笔画宽度
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
  //开始绘制
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
      //填充颜色
      fill: state.shapeProperties.fillColor,
      //描边颜色
      stroke: state.shapeProperties.strokeColor,
      //描边宽度
      strokeWidth: state.shapeProperties.strokeWidth,
      selectable: true // 确保矩形可以被选择工具选中
    });
    //将创建的矩形添加到画布
    canvas.add(state.currentShape);
  },
  //拖动鼠标时触发
  onDrawing: (canvas, x, y, state) => {
    //如果当前不是绘制状态或者没有当前图形对象，直接返回
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
    //重新渲染画布
    canvas.renderAll();
  },
  // 绘制结束时触发
  onEndDrawing: (canvas, state) => {
    if (!state.isDrawing || !state.currentShape) return;
    //绘制状态结束
    state.isDrawing = false;
    
    // 确保矩形至少有一定大小
    const rect = state.currentShape as fabric.Rect;
    if (rect.width < 5 || rect.height < 5) {
      canvas.remove(state.currentShape);
    }
    //清空当前绘图对象
    state.currentShape = null;
    //重新渲染画布
    canvas.renderAll();
  },
  onDeselect: (canvas) => {
    // 清理逻辑
  }
};

// 圆形工具处理器
const circleToolHandler: ToolHandler = {
  onSelect: (canvas) => {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair'; // 十字形光标
  },
  //开始绘制
  onStartDrawing: (canvas, x, y, state) => {
    state.isDrawing = true;
    state.startX = x;
    state.startY = y;
    
    // 创建初始圆形
    state.currentShape = new fabric.Circle({
      left: x,
      top: y,
      radius: 0,
      fill: state.shapeProperties.fillColor,
      stroke: state.shapeProperties.strokeColor,
      strokeWidth: state.shapeProperties.strokeWidth,
      selectable: true // 确保圆形可以被选择工具选中
    });
    
    canvas.add(state.currentShape);
  },
  //拖动鼠标时触发
  onDrawing: (canvas, x, y, state) => {
    //如果当前不是绘制状态或者没有当前图形对象，直接返回
    if (!state.isDrawing || !state.currentShape) return;
    
    // 计算鼠标距离起始点的距离作为半径
    const dx = Math.abs(x - state.startX);
    const dy = Math.abs(y - state.startY);
    
    // 使用两点间距离公式计算半径
    const radius = Math.sqrt(dx * dx + dy * dy);
    
    // 更新圆形的位置和半径
    (state.currentShape as fabric.Circle).set({
      left: Math.min(x, state.startX),
      top: Math.min(y, state.startY),
      radius: radius
    });
    
    //重新渲染画布
    canvas.renderAll();
  },
  // 绘制结束时触发
  onEndDrawing: (canvas, state) => {
    if (!state.isDrawing || !state.currentShape) return;
    //绘制状态结束
    state.isDrawing = false;
    
    // 确保圆形至少有一定大小
    const circle = state.currentShape as fabric.Circle;
    if (circle.radius < 5) {
      canvas.remove(state.currentShape);
    }
    
    //清空当前绘图对象
    state.currentShape = null;
    //重新渲染画布
    canvas.renderAll();
  },
  onDeselect: (canvas) => {
    // 清理逻辑
  }
};

// 菱形工具处理器
const diamondToolHandler: ToolHandler = {
  onSelect: (canvas) => {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair'; // 十字形光标
  },
  //开始绘制
  onStartDrawing: (canvas, x, y, state) => {
    state.isDrawing = true;
    state.startX = x;
    state.startY = y;
    
    // 初始化当前形状为null，稍后在onDrawing中创建
    state.currentShape = null;
  },
  //拖动鼠标时触发
  onDrawing: (canvas, x, y, state) => {
    //如果当前不是绘制状态，直接返回
    if (!state.isDrawing) return;
    
    // 移除之前创建的临时菱形（如果存在）
    if (state.currentShape) {
      canvas.remove(state.currentShape);
      state.currentShape = null;
    }
    
    // 计算菱形的宽度和高度
    const width = Math.abs(x - state.startX);
    const height = Math.abs(y - state.startY);
    
    // 计算菱形的位置（左上角）
    const left = Math.min(state.startX, x);
    const top = Math.min(state.startY, y);
    
    // 计算菱形的中心点（相对于左上角）
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 计算菱形的四个顶点（相对于左上角的位置）
    const points = [
      { x: centerX, y: 0 },          // 上顶点
      { x: width, y: centerY },      // 右顶点
      { x: centerX, y: height },     // 下顶点
      { x: 0, y: centerY }           // 左顶点
    ];
    
    // 创建新的菱形
    state.currentShape = new fabric.Polygon(points, {
      left: left,
      top: top,
      fill: state.shapeProperties.fillColor,
      stroke: state.shapeProperties.strokeColor,
      strokeWidth: state.shapeProperties.strokeWidth,
      selectable: true
    });
    
    // 添加到画布
    canvas.add(state.currentShape);
    // 渲染画布
    canvas.renderAll();
  },
  // 绘制结束时触发
  onEndDrawing: (canvas, state) => {
    if (!state.isDrawing) return;
    //绘制状态结束
    state.isDrawing = false;
    
    // 确保菱形至少有一定大小
    if (state.currentShape) {
      const polygon = state.currentShape as fabric.Polygon;
      const width = polygon.width || 0;
      const height = polygon.height || 0;
      
      if (width < 5 || height < 5) {
        canvas.remove(state.currentShape);
      }
    }
    
    //清空当前绘图对象
    state.currentShape = null;
    //重新渲染画布
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
  diamond: diamondToolHandler, // 使用菱形工具的逻辑
  circle: circleToolHandler, // 使用圆形工具的逻辑
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

//扮演中间层的角色
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