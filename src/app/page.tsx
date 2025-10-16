// src/component/home/NotionWorkspace.tsx
"use client";

import { useState } from "react";
import NotionSidebar from "@/components/home/Sidebar";
// 导入页面组件
import HomePage from "@/page/home";
import InboxPage from "@/page/Inbox";
import Board from "@/page/board";
import Prompt from "@/page/prompt";

export default function NotionWorkspace() {
  // 侧边栏折叠状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // 邀请横幅显示状态
  const [showInviteBanner, setShowInviteBanner] = useState(true);
  // 当前选中的页面key（与侧边栏菜单key对应）
  const [currentPage, setCurrentPage] = useState("home");

  // 页面组件映射表（key对应菜单key，value对应组件）
  const pageComponents = {
    home: <HomePage />,
    inbox: <InboxPage />,
    board: <Board />,
    prompt: <Prompt />,
  };

  // 切换侧边栏折叠状态
  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 关闭邀请横幅
  const handleCloseInviteBanner = () => {
    setShowInviteBanner(false);
  };

  // 处理侧边栏菜单点击，更新当前页面
  const handleMenuClick = (menuKey: string) => {
    if (Object.keys(pageComponents).includes(menuKey)) {
      setCurrentPage(menuKey);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* 侧边栏组件 */}
      <NotionSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        showInviteBanner={showInviteBanner}
        onCloseInviteBanner={handleCloseInviteBanner}
        onMenuClick={handleMenuClick}
        currentPage={currentPage}
      />

      {/* 主内容区：动态渲染当前页面 */}
      <main className="flex-1 overflow-y-auto">
        {pageComponents[currentPage] || (
          <div className="p-8 text-gray-500">页面不存在</div>
        )}
      </main>
    </div>
  );
}