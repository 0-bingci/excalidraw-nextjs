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
  currentShape: fabric.Object | null;
  shapeProperties: ShapeProperties;
}

// 工具处理器接口
export interface ToolHandler {
  onSelect(canvas: fabric.Canvas): void;
  onStartDrawing(canvas: fabric.Canvas, x: number, y: number, state: CanvasToolState): void;
  onDrawing(canvas: fabric.Canvas, x: number, y: number, state: CanvasToolState): void;
  onEndDrawing(canvas: fabric.Canvas, state: CanvasToolState): void;
  onDeselect(canvas: fabric.Canvas): void;
}