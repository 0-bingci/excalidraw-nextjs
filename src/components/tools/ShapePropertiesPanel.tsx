"use client";

import React, { useState, useEffect } from 'react';
import * as fabric from 'fabric';
import { ArrowUp, ArrowDown, Eye, EyeOff, Copy, Trash2, Link } from 'lucide-react';
import { Select, ColorPicker } from 'antd';

const { Option } = Select;

interface ShapePropertiesPanelProps {
  visible: boolean;
  selectedObject: fabric.Object | null;
  onUpdateProperty: (property: string, value: any) => void;
}

export default function ShapePropertiesPanel({
  visible,
  selectedObject,
  onUpdateProperty,
}: ShapePropertiesPanelProps) {
  // 状态管理
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeDashArray, setStrokeDashArray] = useState<string>('solid');
  const [opacity, setOpacity] = useState(100);

  // 当选中对象变化时更新状态
  useEffect(() => {
    if (selectedObject) {
      setStrokeColor(selectedObject.stroke || '#000000');
      setFillColor(selectedObject.fill || 'transparent');
      setStrokeWidth((selectedObject.strokeWidth as number) || 2);
      setOpacity(Math.round((selectedObject.opacity as number) * 100) || 100);
      
      // 处理虚线样式
      const dashArray = selectedObject.strokeDashArray as number[];
      if (dashArray && dashArray.length > 0) {
        // 简化处理：根据常见虚线模式判断
        if (dashArray[0] === 5 && dashArray[1] === 5) {
          setStrokeDashArray('dashed');
        } else if (dashArray[0] === 2 && dashArray[1] === 2) {
          setStrokeDashArray('dotted');
        } else {
          setStrokeDashArray('solid');
        }
      } else {
        setStrokeDashArray('solid');
      }
    }
  }, [selectedObject]);

  // 处理描边颜色变化
  const handleStrokeColorChange = (color: any) => {
    setStrokeColor(color.toHexString());
    onUpdateProperty('stroke', color.toHexString());
  };

  // 处理填充颜色变化
  const handleFillColorChange = (color: any) => {
    const hexColor = color.toHexString();
    setFillColor(hexColor);
    onUpdateProperty('fill', hexColor);
  };

  // 处理描边宽度变化
  const handleStrokeWidthChange = (value: number) => {
    setStrokeWidth(value);
    onUpdateProperty('strokeWidth', value);
  };

  // 处理边框样式变化
  const handleStrokeDashArrayChange = (value: string) => {
    setStrokeDashArray(value);
    let dashArray = null;
    if (value === 'dashed') {
      dashArray = [5, 5];
    } else if (value === 'dotted') {
      dashArray = [2, 2];
    }
    onUpdateProperty('strokeDashArray', dashArray);
  };

  // 处理透明度变化
  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    onUpdateProperty('opacity', value / 100);
  };

  // 处理图层上移一层
  const handleBringForward = () => {
    onUpdateProperty('bringForward', true);
  };

  // 处理图层下移一层
  const handleSendBackward = () => {
    onUpdateProperty('sendBackward', true);
  };

  // 处理图层置于最顶层
  const handleBringToFront = () => {
    onUpdateProperty('bringToFront', true);
  };

  // 处理图层置于最底层
  const handleSendToBack = () => {
    onUpdateProperty('sendToBack', true);
  };

  // 处理显示/隐藏
  const handleToggleVisibility = () => {
    onUpdateProperty('visible', !(selectedObject?.visible ?? true));
  };

  // 处理复制对象
  const handleCopy = () => {
    onUpdateProperty('copy', true);
  };
  
  // 处理删除对象
  const handleDelete = () => {
    onUpdateProperty('delete', true);
  };

  if (!visible || !selectedObject) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg p-4 overflow-y-auto z-20">
      <div className="text-base font-semibold mb-4 text-gray-700">属性设置</div>
      
      {/* 描边颜色 */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">描边颜色</div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'].map((color) => (
              <button
                key={`stroke-${color}`}
                onClick={() => handleStrokeColorChange({ toHexString: () => color })}
                className={`w-7 h-7 rounded border border-gray-300 transition-transform hover:scale-110 ${strokeColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="w-px h-5 bg-gray-300"></div>
          <div className="flex-1">
            <ColorPicker
              value={strokeColor}
              onChange={handleStrokeColorChange}
              className="w-full"
            ></ColorPicker>
          </div>
        </div>
      </div>

      {/* 填充颜色 */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">背景颜色</div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {['transparent', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'].map((color) => (
              <button
                key={`fill-${color}`}
                onClick={() => handleFillColorChange({ toHexString: () => color })}
                className={`w-7 h-7 rounded border border-gray-300 transition-transform hover:scale-110 ${fillColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                style={{ 
                  backgroundColor: color,
                  // 为透明图标添加特殊样式以提高可见性
                  backgroundImage: color === 'transparent' ? 'repeating-linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none',
                  backgroundSize: color === 'transparent' ? '6px 6px' : 'auto'
                }}
                title={color === 'transparent' ? '透明' : color}
              />
            ))}
          </div>
          <div className="w-px h-5 bg-gray-300"></div>
          <div className="flex-1">
            <ColorPicker
              value={fillColor}
              onChange={handleFillColorChange}
              className="w-full"
            ></ColorPicker>
          </div>
        </div>
      </div>

      {/* 描边宽度 */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">描边宽度</div>
        <div className="flex items-center gap-4">
          <div className="flex gap-6">
            {
              [
                { width: 1, label: '1' },
                { width: 2, label: '2' },
                { width: 4, label: '4' }
              ].map((item) => (
                <button
                  key={`width-${item.width}`}
                  onClick={() => handleStrokeWidthChange(item.width)}
                  className={`w-7 h-7 flex items-center justify-center rounded border border-gray-300 transition-transform hover:scale-110 ${strokeWidth === item.width ? 'ring-2 ring-blue-500 ring-offset-1 bg-gray-50' : ''}`}
                  title={`宽度 ${item.width}`}
                >
                  <div 
                    className="w-4 rounded-full" 
                    style={{ 
                      height: `${item.width}px`, 
                      backgroundColor: '#000',
                      borderRadius: '999px'
                    }}
                  />
                </button>
              ))
            }
          </div>
        </div>
      </div>

      {/* 边框样式 */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">边框样式</div>
        <div className="flex items-center gap-6">
          {[
            { value: 'solid', label: '实线', style: { borderStyle: 'solid' } },
            { value: 'dashed', label: '虚线', style: { borderStyle: 'dashed' } },
            { value: 'dotted', label: '点线', style: { borderStyle: 'dotted' } }
          ].map((item) => (
            <button
              key={`stroke-style-${item.value}`}
              onClick={() => handleStrokeDashArrayChange(item.value)}
              className={`w-7 h-7 flex items-center justify-center rounded border border-gray-300 transition-transform hover:scale-110 ${strokeDashArray === item.value ? 'ring-2 ring-blue-500 ring-offset-1 bg-gray-50' : ''}`}
              title={item.label}
            >
              <div 
                className="w-4 h-2 bg-black" 
                style={{ 
                  borderStyle: item.style.borderStyle,
                  borderColor: '#000',
                  borderWidth: '2px',
                  backgroundColor: 'transparent'
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 透明度 */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2 flex justify-between">
          <span>透明度</span>
          <span>{opacity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-400"
          style={{
            background: `linear-gradient(to right, #90caf9 0%, #90caf9 ${opacity}%, #e5e7eb ${opacity}%, #e5e7eb 100%)`
          }}
        />
      </div>

      {/* 图层操作 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 mb-3">图层操作</div>
        <div className="flex gap-2">
          <button
            onClick={handleSendToBack}
            className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
            title="置于最底层"
          >
            <div className="flex flex-col items-center justify-center">
              <ArrowDown size={14} />
              <div className="w-4 h-[0.25px] bg-gray-400 mt-1"></div>
            </div>
          </button>
          <button
            onClick={handleSendBackward}
            className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 flex items-center justify-center"
            title="下移一层"
          >
            <ArrowDown size={18} />
          </button>
          <button
            onClick={handleBringForward}
            className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 flex items-center justify-center"
            title="上移一层"
          >
            <ArrowUp size={18} />
          </button>
          <button
            onClick={handleBringToFront}
            className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
            title="置于最顶层"
          >
            <div className="flex flex-col items-center justify-center">
              <div className="w-4 h-[0.25px] bg-gray-400 mb-1"></div>
              <ArrowUp size={14} />
            </div>
          </button>
        </div>
      </div>
      
      {/* 操作栏 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 mb-3">操作</div>
        <div className="flex gap-2">
          <button
            className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 flex items-center justify-center"
            title="复制"
            onClick={handleCopy}
          >
            <Copy size={18} />
          </button>
          <button
            className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 flex items-center justify-center"
            title="删除"
            onClick={handleDelete}
          >
            <Trash2 size={18} />
          </button>
          <button
            className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 flex items-center justify-center"
            title="链接"
          >
            <Link size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}