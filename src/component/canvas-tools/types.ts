import type * as fabric from 'fabric';

// 工具类型定义，将主文件夹的放在这了
export type Tool = 
  | 'select'
  | 'hand'
  | 'rectangle'
  | 'diamond'
  | 'circle'
  | 'arrow'
  | 'line'
  | 'pen'
  | 'text'
  | 'image'
  | 'eraser';

// 图形元素属性接口
export interface ShapeProperties {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
}

// 画布工具状态接口
export interface CanvasToolState {
  activeTool: Tool;
  isDrawing: boolean;
  startX: number;
  startY: number;
  //临时存储正在创建的图形图像
  currentShape: fabric.Object | null;
  //图形样式
  shapeProperties: ShapeProperties;
}

// 工具处理器接口
export interface ToolHandler {
  //工具被选中时执行
  onSelect(canvas: fabric.Canvas): void;
  //鼠标按下开始绘制
  onStartDrawing(canvas: fabric.Canvas, x: number, y: number, state: CanvasToolState): void;
  //鼠标移动时绘制
  onDrawing(canvas: fabric.Canvas, x: number, y: number, state: CanvasToolState): void;
  //鼠标松开结束绘制
  onEndDrawing(canvas: fabric.Canvas, state: CanvasToolState): void;
  //工具被取消选中时执行
  onDeselect(canvas: fabric.Canvas): void;
}