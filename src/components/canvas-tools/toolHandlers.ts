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
  },
  textToolWaitingForExit: false,
  erasedObjects: []
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
    
    const width = globalThis.Math.abs(x - state.startX);
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

// 圆形/椭圆工具处理器 - 重写实现：支持椭圆，鼠标起始点和当前位置始终在图形边上
const circleToolHandler: ToolHandler = {
  onSelect: (canvas) => {
    // 设置画布状态
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair'; // 十字形光标
  },
  
  // 开始绘制 - 记录起始点
  onStartDrawing: (canvas, x, y, state) => {
    // 初始化绘制状态
    state.isDrawing = true;
    state.startX = x;  // 记录鼠标按下的起始点
    state.startY = y;
    
    // 创建初始椭圆对象 - 以起始点为一个端点，初始大小为0
    // 使用椭圆而不是圆形以支持绘制椭圆
    state.currentShape = new fabric.Ellipse({
      left: x,
      top: y,
      rx: 0,  // 初始水平半径为0
      ry: 0,  // 初始垂直半径为0
      fill: state.shapeProperties.fillColor,
      stroke: state.shapeProperties.strokeColor,
      strokeWidth: state.shapeProperties.strokeWidth,
      selectable: true,
      originX: 'center',  // 设置原点为中心
      originY: 'center'
    });
    
    // 添加椭圆到画布
    canvas.add(state.currentShape);
  },
  
  // 拖动鼠标时更新椭圆大小和位置
  onDrawing: (canvas, x, y, state) => {
    // 验证绘制状态和当前图形
    if (!state.isDrawing || !state.currentShape) return;
    
    // 计算中心点（起始点和当前点的中点）
    const centerX = (state.startX + x) / 2;
    const centerY = (state.startY + y) / 2;
    
    // 计算水平半径和垂直半径（起始点到当前点距离的一半）
    const rx = Math.abs(x - state.startX) / 2;
    const ry = Math.abs(y - state.startY) / 2;
    
    // 更新椭圆的位置和尺寸
    (state.currentShape as fabric.Ellipse).set({
      left: centerX,
      top: centerY,
      rx: rx,
      ry: ry
    });
    
    // 重新渲染画布以显示更新后的椭圆
    canvas.renderAll();
  },
  
  // 绘制结束处理
  onEndDrawing: (canvas, state) => {
    // 验证绘制状态和当前图形
    if (!state.isDrawing || !state.currentShape) return;
    
    // 结束绘制状态
    state.isDrawing = false;
    
    // 获取最终椭圆对象并验证大小
    const ellipse = state.currentShape as fabric.Ellipse;
    
    // 如果椭圆太小，则移除
    // 考虑椭圆的最小尺寸，确保有意义的绘制结果
    if (ellipse.rx < 3 && ellipse.ry < 3) {
      canvas.remove(state.currentShape);
    }
    
    // 重置当前绘图对象
    state.currentShape = null;
    
    // 重新渲染画布
    canvas.renderAll();
  },
  
  // 取消选择工具时的清理
  onDeselect: (canvas) => {
    // 可以在这里添加额外的清理逻辑
  }
};

// 菱形工具处理器，暂未处理，没有历史回退功能
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

// 箭头工具处理器
const arrowToolHandler: ToolHandler = {
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
    
    // 移除之前创建的临时箭头（如果存在）
    if (state.currentShape) {
      canvas.remove(state.currentShape);
      state.currentShape = null;
    }
    
    // 创建箭头的主体线条
    const mainLine = new fabric.Line([state.startX, state.startY, x, y], {
      fill: state.shapeProperties.strokeColor,
      stroke: state.shapeProperties.strokeColor,
      strokeWidth: state.shapeProperties.strokeWidth,
      selectable: false
    });
    
    // 创建一个组来包含主体线条和箭头两边
    const arrowGroup = new fabric.Group([mainLine], {
      selectable: true,
      stroke: state.shapeProperties.strokeColor,
      strokeWidth: state.shapeProperties.strokeWidth,
      fill: state.shapeProperties.fillColor || state.shapeProperties.strokeColor
    });
    
    // 计算箭头的角度和尺寸
    const angle = Math.atan2(y - state.startY, x - state.startX);
    const headLength = 15; // 箭头头部长度
    const headAngle = Math.PI / 6; // 箭头两边与主线的夹角
    
    // 计算箭头左侧边的终点
    const leftArrowX = x - headLength * Math.cos(angle - headAngle);
    const leftArrowY = y - headLength * Math.sin(angle - headAngle);
    
    // 计算箭头右侧边的终点
    const rightArrowX = x - headLength * Math.cos(angle + headAngle);
    const rightArrowY = y - headLength * Math.sin(angle + headAngle);
    
    // 创建箭头的左侧边
    const leftArrowLine = new fabric.Line([x, y, leftArrowX, leftArrowY], {
      fill: state.shapeProperties.strokeColor,
      stroke: state.shapeProperties.strokeColor,
      strokeWidth: state.shapeProperties.strokeWidth,
      selectable: false
    });
    
    // 创建箭头的右侧边
    const rightArrowLine = new fabric.Line([x, y, rightArrowX, rightArrowY], {
      fill: state.shapeProperties.strokeColor,
      stroke: state.shapeProperties.strokeColor,
      strokeWidth: state.shapeProperties.strokeWidth,
      selectable: false
    });
    
    // 将箭头的两边添加到组中
    arrowGroup.add(leftArrowLine);
    arrowGroup.add(rightArrowLine);
    
    // 更新当前形状为箭头组
    state.currentShape = arrowGroup;
    
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
    
    // 确保箭头至少有一定长度
    if (state.currentShape) {
      const group = state.currentShape as fabric.Group;
      // 获取线条元素
      const line = group.getObjects()[0] as fabric.Line;
      if (line) {
        // 计算线条长度
        const length = Math.sqrt(
          Math.pow(line.x2! - line.x1!, 2) + 
          Math.pow(line.y2! - line.y1!, 2)
        );
        
        if (length < 5) {
          canvas.remove(state.currentShape);
        }
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

// 线段工具处理器
const lineToolHandler: ToolHandler = {
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
    
    // 移除之前创建的临时线段（如果存在）
    if (state.currentShape) {
      canvas.remove(state.currentShape);
      state.currentShape = null;
    }
    
    // 创建新的线段
    state.currentShape = new fabric.Line([state.startX, state.startY, x, y], {
      fill: state.shapeProperties.strokeColor,
      stroke: state.shapeProperties.strokeColor,
      strokeWidth: state.shapeProperties.strokeWidth,
      selectable: true,
      objectCaching: false
    });
    
    // 添加到画布
    canvas.add(state.currentShape);
    // 渲染画布
    canvas.renderAll();
  },
  // 绘制结束时触发
  onEndDrawing: (canvas, state) => {
    if (!state.isDrawing || !state.currentShape) return;
    //绘制状态结束
    state.isDrawing = false;
    
    // 确保线段至少有一定长度
    const line = state.currentShape as fabric.Line;
    const length = Math.sqrt(
      Math.pow(line.x2! - line.x1!, 2) + 
      Math.pow(line.y2! - line.y1!, 2)
    );
    
    if (length < 5) {
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

// 橡皮擦工具处理器
const eraserToolHandler: ToolHandler = {
  onSelect: (canvas) => {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22%3E%3Ccircle cx=%2210%22 cy=%2210%22 r=%228%22 fill=%22white%22 stroke=%22black%22 stroke-width=%221%22 /%3E%3C/svg%3E") 10 10, auto'; // 橡皮擦光标
  },
  onStartDrawing: (canvas, x, y, state) => {
    state.isDrawing = true;
    
    // 检查点击位置是否有对象
    const objects = canvas.getObjects();
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      
      // 对于透明填充的对象，需要特殊处理
      if (obj.containsPoint(new fabric.Point(x, y)) || 
          // 矩形检测
          (obj.type === 'rect' && 
           x >= obj.left && x <= obj.left + obj.width && 
           y >= obj.top && y <= obj.top + obj.height) ||
          // 圆形检测 - 使用圆的几何公式：(x-centerX)^2 + (y-centerY)^2 <= radius^2
          (obj.type === 'circle' && 
           ((x - (obj.left + obj.radius)) * (x - (obj.left + obj.radius)) + 
            (y - (obj.top + obj.radius)) * (y - (obj.top + obj.radius)) <= 
            obj.radius * obj.radius))) {
        // 检查对象是否已经被擦除中（避免重复添加）
        const isAlreadyErased = state.erasedObjects.some(item => item.object === obj);
        if (!isAlreadyErased) {
          // 保存原始透明度
          const originalOpacity = obj.opacity || 1;
          
          // 添加到被擦除对象列表
          state.erasedObjects.push({
            object: obj,
            originalOpacity
          });
          
          // 降低透明度（虚化效果）
          obj.set({ opacity: 0.3 });
          
          canvas.renderAll();
          break;
        }
      }
    }
  },
  onDrawing: (canvas, x, y, state) => {
    if (!state.isDrawing) return;
    
    // 检查当前鼠标位置是否有对象
    const objects = canvas.getObjects();
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      
      // 对于透明填充的对象，需要特殊处理
      if (obj.containsPoint(new fabric.Point(x, y)) || 
          // 矩形检测
          (obj.type === 'rect' && 
           x >= obj.left && x <= obj.left + obj.width && 
           y >= obj.top && y <= obj.top + obj.height) ||
          // 圆形检测 - 使用圆的几何公式：(x-centerX)^2 + (y-centerY)^2 <= radius^2
          (obj.type === 'circle' && 
           ((x - (obj.left + obj.radius)) * (x - (obj.left + obj.radius)) + 
            (y - (obj.top + obj.radius)) * (y - (obj.top + obj.radius)) <= 
            obj.radius * obj.radius))) {
        // 检查对象是否已经被擦除中（避免重复添加）
        const isAlreadyErased = state.erasedObjects.some(item => item.object === obj);
        if (!isAlreadyErased) {
          // 保存原始透明度
          const originalOpacity = obj.opacity || 1;
          
          // 添加到被擦除对象列表
          state.erasedObjects.push({
            object: obj,
            originalOpacity
          });
          
          // 降低透明度（虚化效果）
          obj.set({ opacity: 0.3 });
          
          canvas.renderAll();
          break;
        }
      }
    }
  },
  onEndDrawing: (canvas, state) => {
    state.isDrawing = false;
    
    // 删除所有被擦除的对象
    if (state.erasedObjects.length > 0) {
      state.erasedObjects.forEach(item => {
        canvas.remove(item.object);
      });
      
      // 清空被擦除对象列表
      state.erasedObjects = [];
      
      canvas.renderAll();
    }
  },
  onDeselect: (canvas) => {
    canvas.defaultCursor = 'default';
  }
};

// 文本工具处理器
const textToolHandler: ToolHandler = {
  onSelect: (canvas) => {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'text'; // 文本输入光标
    // 重置编辑标志
    (canvas as any).isEditingText = false;
  },
  onStartDrawing: (canvas, x, y, state) => {
    state.isDrawing = true;
    
    // 创建空白文本输入框
    const textObj = new fabric.IText('', {
      left: x,
      top: y,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: state.shapeProperties.strokeColor,
      selectable: true,
      hasControls: true,
      hasBorders: true
    });
    
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    
    // 自动进入编辑模式
    textObj.enterEditing();
    
    // 标记为正在编辑文本
    (canvas as any).isEditingText = true;
    
    // 监听文本编辑完成事件
    const finishEditing = () => {
      (canvas as any).isEditingText = false;
      canvas.off('text:editing:exited', finishEditing);
    };
    canvas.on('text:editing:exited', finishEditing);
    
    // 设置当前形状
    state.currentShape = textObj;
    
    // 重新渲染画布
    canvas.renderAll();
  },
  onDrawing: () => {
    // 文本工具在绘制过程中不需要特殊处理
  },
  onEndDrawing: (canvas, state) => {
    state.isDrawing = false;
    
    // 不要在onEndDrawing中立即移除空文本框，因为用户刚创建文本框时还没有机会输入文字
    // 保持文本框在画布上，让用户可以继续编辑
    state.currentShape = null;
    canvas.renderAll();
  },
  onDeselect: (canvas) => {
    canvas.defaultCursor = 'default';
    // 取消编辑标志
    (canvas as any).isEditingText = false;
  }
};

// 抓手工具处理器
const handToolHandler: ToolHandler = {
  onSelect: (canvas) => {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'grab'; // 抓手光标
    
    // 确保没有选中任何对象
    canvas.discardActiveObject();
    
    // 存储原始画布状态
    (canvas as any)._handTool = {
      isPanning: false,
      lastPosX: 0,
      lastPosY: 0,
      // 保存原始的selection和selectionKey属性
      originalSelection: canvas.selection,
      originalSelectionKey: canvas.selectionKey
    };
    
    // 临时覆盖selectionKey，防止选择对象
    canvas.selectionKey = 'none';
    
    // 优化渲染性能
    canvas.skipTargetFind = true;
  },
  onStartDrawing: (canvas, x, y, state) => {
    state.isDrawing = true;
    const handToolState = (canvas as any)._handTool;
    
    if (handToolState) {
      handToolState.isPanning = true;
      // 尝试获取真实的屏幕坐标
      const currentEvent = (state as any).currentEvent;
      if (currentEvent && currentEvent.clientX && currentEvent.clientY) {
        // 使用真实的屏幕坐标
        handToolState.lastPosX = currentEvent.clientX;
        handToolState.lastPosY = currentEvent.clientY;
      } else {
        // 回退到使用画布坐标
        handToolState.lastPosX = x;
        handToolState.lastPosY = y;
      }
      canvas.defaultCursor = 'grabbing'; // 拖动中光标
      
      // 再次确保没有选中任何对象
      canvas.discardActiveObject();
    }
  },
  onDrawing: (canvas, x, y, state) => {
    if (!state.isDrawing) return;
    
    const handToolState = (canvas as any)._handTool;
    if (handToolState && handToolState.isPanning) {
      // 尝试获取真实的屏幕坐标
      const currentEvent = (state as any).currentEvent;
      let currentPosX, currentPosY;
      
      if (currentEvent && currentEvent.clientX && currentEvent.clientY) {
        // 使用真实的屏幕坐标
        currentPosX = currentEvent.clientX;
        currentPosY = currentEvent.clientY;
      } else {
        // 回退到使用画布坐标
        currentPosX = x;
        currentPosY = y;
      }
      
      // 计算屏幕坐标的偏移量
      const deltaX = currentPosX - handToolState.lastPosX;
      const deltaY = currentPosY - handToolState.lastPosY;
      
      // 直接使用屏幕坐标偏移量进行相对平移
      // relativePan会自动处理视图变换矩阵，不需要额外的缩放计算
      canvas.relativePan(new fabric.Point(deltaX, deltaY));
      
      // 更新最后位置
      handToolState.lastPosX = currentPosX;
      handToolState.lastPosY = currentPosY;
      
      // 使用requestRenderAll替代renderAll以优化性能，减少残影
      canvas.requestRenderAll();
    }
  },
  onEndDrawing: (canvas, state) => {
    state.isDrawing = false;
    const handToolState = (canvas as any)._handTool;
    
    if (handToolState) {
      handToolState.isPanning = false;
      canvas.defaultCursor = 'grab'; // 恢复抓手光标
    }
  },
  onDeselect: (canvas) => {
    const handToolState = (canvas as any)._handTool;
    
    if (handToolState) {
      // 恢复原始设置
      canvas.selection = handToolState.originalSelection;
      canvas.selectionKey = handToolState.originalSelectionKey;
      canvas.skipTargetFind = false;
    }
    
    canvas.defaultCursor = 'default';
    canvas.selection = true;
    
    // 清理状态
    delete (canvas as any)._handTool;
  }
};

// 图片工具处理器
const imageToolHandler: ToolHandler = {
  onSelect: (canvas) => {
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair';
  },
  
  onStartDrawing: (canvas, x, y, state) => {
    // 创建或获取文件输入框
    let fileInput = document.getElementById('image-upload-input') as HTMLInputElement;
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'image-upload-input';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
    }
    
    // 处理文件选择
    const handleFileSelect = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;
      
      const reader = new FileReader();
      
      // 处理图片尺寸和添加到画布
        const processImage = (dataUrl: string) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          img.onload = function() {
            // 处理图片缩放
            const maxSize = 400;
            const minSize = 10;
            const scale = Math.max(
              minSize / Math.min(img.width, img.height),
              Math.min(maxSize / Math.max(img.width, img.height), 1)
            );
            
            // 创建并添加图片对象到画布
            const fabricImg = new fabric.Image(img);
            fabricImg.set({
              left: x,
              top: y,
              borderColor: 'blue',
              cornerColor: 'red',
              selectable: true,
              scaleX: scale,
              scaleY: scale
            });
            
            canvas.add(fabricImg);
            canvas.renderAll();
            
            // 设置当前形状，为后续的onEndDrawing做准备
            state.currentShape = fabricImg;
            
            // 立即结束绘制过程，触发onEndDrawing
            setTimeout(() => {
              if (toolHandlers['image'] && toolHandlers['image'].onEndDrawing) {
                toolHandlers['image'].onEndDrawing(canvas, state);
              }
            }, 0);
          };
          
          img.src = dataUrl;
        };
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        processImage(dataUrl);
      };
      
      reader.readAsDataURL(file);
      
      // 清理事件监听器
      fileInput.removeEventListener('change', handleFileSelect);
    };
    
    fileInput.addEventListener('change', handleFileSelect);
    fileInput.click();
    
    state.isDrawing = true;
  },
  
  onDrawing: () => {},
  
  onEndDrawing: (canvas, state) => {
    // 重置绘制状态
    state.isDrawing = false;
    state.currentShape = null;
    
    // 1. 直接调用setActiveTool函数来切换工具
    setActiveTool(canvas, 'select', 'image', state);
    
    // 2. 确保状态正确更新
    state.activeTool = 'select';
    
    // 3. 强制重新渲染画布
    canvas.renderAll();
    
    // 4. 立即清理文件输入框
    setTimeout(() => {
      const fileInput = document.getElementById('image-upload-input');
      if (fileInput) {
        document.body.removeChild(fileInput);
      }
    }, 0);
    
    // 5. 创建并触发一个自定义事件，通知所有监听者工具状态已更改
    // 这是最关键的一步，可以触发React组件重新渲染
    setTimeout(() => {
      try {
        // 尝试创建一个可以触发React更新的事件
        const customEvent = new CustomEvent('toolStateChanged', {
          bubbles: true,
          detail: { activeTool: 'select' }
        });
        
        // 同时在多个地方触发事件，增加成功几率
        canvas.upperCanvasEl.dispatchEvent(customEvent);
        document.dispatchEvent(customEvent);
        
        // 强制触发窗口重绘
        window.requestAnimationFrame(() => {
          canvas.renderAll();
          // 通过改变样式来强制重绘
          const style = canvas.upperCanvasEl.style.visibility;
          canvas.upperCanvasEl.style.visibility = 'hidden';
          canvas.upperCanvasEl.offsetHeight; // 触发重排
          canvas.upperCanvasEl.style.visibility = style;
        });
      } catch (e) {
        console.log('Event dispatch failed:', e);
      }
    }, 10);
  },
  
  onDeselect: (canvas) => {
    canvas.defaultCursor = 'default';
    canvas.selection = true;
    
    // 延迟清理文件输入框
    setTimeout(() => {
      const fileInput = document.getElementById('image-upload-input');
      if (fileInput) document.body.removeChild(fileInput);
    }, 1000);
  }
};

// 工具处理器映射
export const toolHandlers: Record<Tool, ToolHandler> = {
  select: selectToolHandler,
  hand: handToolHandler, // 使用抓手工具的逻辑
  rectangle: rectangleToolHandler,
  diamond: diamondToolHandler, // 使用菱形工具的逻辑
  circle: circleToolHandler, // 使用圆形工具的逻辑
  arrow: arrowToolHandler, // 使用箭头工具的逻辑
  line: lineToolHandler, // 使用线段工具的逻辑
  pen: penToolHandler,
  text: textToolHandler, // 使用文本工具的逻辑
  image: imageToolHandler, // 使用图片工具的逻辑
  eraser: eraserToolHandler // 使用橡皮擦工具的逻辑
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
  
  // 对于绘制工具（矩形、菱形、圆形、箭头、线段），在完成绘制后自动切换回选择模式
  // 注意：文本工具和图片工具不包含在内，图片工具在onEndDrawing方法中有特殊处理
  const drawingTools: Tool[] = ['rectangle', 'diamond', 'circle', 'arrow', 'line'];
  if (drawingTools.includes(toolState.activeTool)) {
    setActiveTool(canvas, 'select', toolState.activeTool, toolState);
  }
};