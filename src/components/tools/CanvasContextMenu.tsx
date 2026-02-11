// @/components/tools/CanvasContextMenu.tsx
"use client";

import type React from "react";
import Link from "next/link";
interface CanvasContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onOpenAiDialog: () => void;
  onClearCanvas: () => void;
  onExportPng: () => void;
  onToggleViewMode: () => void;
  onImport: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  visible,
  position,
  onClose,
  onOpenAiDialog,
  onClearCanvas,
  onExportPng,
  onToggleViewMode,
  onImport,
  fileInputRef,
}) => {
  if (!visible) return null;

  // 核心修改：将justify-center改为justify-start实现居左对齐
  const buttonStyle =
    "w-full px-4 py-2 flex items-center justify-start gap-2 rounded-md hover:bg-gray-100 transition-all duration-200 text-gray-700";

  return (
    <div
      className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: "180px",
        boxSizing: "border-box",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* AI 助手按钮 */}
      <button
        className={`${buttonStyle} border border-gray-200`}
        onClick={() => {
          onClose();
          onOpenAiDialog();
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 12H16M12 8V16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>AI 助手</span>
      </button>

      {/* 分隔线 */}
      <div className="my-1 border-t border-gray-100" />

      {/* 清空画布按钮 */}
      <button
        className={buttonStyle}
        onClick={() => {
          onClose();
          onClearCanvas();
        }}
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
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        <span>清空画布</span>
      </button>
      {/* 导入按钮 */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".json,image/png,image/jpeg"
        onChange={onImport}
      />
      <button
        className={buttonStyle}
        onClick={() => {
          // 不需要 onClose 也可以，或者先关闭弹窗
          onClose?.();
          // 核心：点击按钮转而触发 input 的点击
          fileInputRef.current?.click();
        }}
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
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span>导入</span>
      </button>
      {/* 导出PNG按钮 */}
      <button
        className={buttonStyle}
        onClick={() => {
          onClose();
          onExportPng();
        }}
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
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span>导出 PNG</span>
      </button>

      {/* 查看模式按钮 */}
      <button
        className={buttonStyle}
        onClick={() => {
          onClose();
          onToggleViewMode();
        }}
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
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span>查看模式</span>
      </button>

      {/* 返回首页按钮 */}
      <Link href="/">
        <button
          className={buttonStyle}
          onClick={() => {
            onClose();
          }}
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
            <path d="M12 2L5 8l7 4 7-4-7-6z" />
            <path d="M5 8h14v10H5z" />
            <rect x="10" y="13" width="4" height="5" rx="1" />
          </svg>
          <span>保存并返回首页</span>
        </button>
      </Link>
    </div>
  );
};

export default CanvasContextMenu;
