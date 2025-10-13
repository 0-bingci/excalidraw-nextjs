// src/component/home/NotionSidebar.tsx
"use client";

import {
  Search,
  Home,
  Inbox,
  FileText,
  Plus,
  ChevronDown,
  Settings,
  ShoppingBag,
  Trash2,
  Users,
  X,
  MessageSquare,
  HelpCircle,
  PenSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Menu, Input, Button, Badge, Tooltip } from "antd";
import type { MenuProps } from "antd";

// 菜单项类型定义
type MenuItem = Required<MenuProps>["items"][number];

// 接收的props类型
interface NotionSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  showInviteBanner: boolean;
  onCloseInviteBanner: () => void;
  onMenuClick: (key: string) => void;
  currentPage: string;
}

export default function NotionSidebar({
  collapsed,
  onToggleCollapse,
  showInviteBanner,
  onCloseInviteBanner,
  onMenuClick,
  currentPage,
}: NotionSidebarProps) {
  // 侧边栏菜单配置（key与页面映射表对应）
  const menuItems: MenuItem[] = [
    {
      key: "home",
      icon: <Home size={16} />,
      label: "主页",
    },
    {
      key: "inbox",
      icon: <Inbox size={16} />,
      label: "收件箱",
    },
    { type: "divider" },
    {
      key: "private",
      label: "私人",
      type: "group",
      children: [
        {
          key: "board",
          icon: <FileText size={16} />,
          label: "白板",
        },
      ],
    },
    { type: "divider" },
    {
      key: "team",
      label: "团队协作区",
      type: "group",
      children: [
        {
          key: "team-home",
          icon: <Home size={16} />,
          label: "综合",
        },
      ],
    },
  ];

  // 菜单点击事件处理
  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    onMenuClick(key as string);
  };

  return (
    <>
      {/* 侧边栏主体 */}
      <aside
        className={`bg-[#f7f6f3] border-r border-gray-200 flex flex-col transition-all duration-300 ${
          collapsed ? "w-0 overflow-hidden" : "w-60"
        }`}
      >
        {/* 侧边栏头部 */}
        <div className="p-3 border-b border-gray-200">
          <button className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-200/50 rounded text-sm group">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-medium">新用户</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <PenSquare size={14} className="text-gray-500" />
              <ChevronDown size={14} className="text-gray-500" />
            </div>
          </button>
        </div>

        {/* 搜索框 */}
        <div className="px-3 pt-2 pb-1">
          <Input
            placeholder="搜索"
            prefix={<Search size={16} className="text-gray-400" />}
            variant="filled"
            className="bg-white/50 border-none hover:bg-white/80 focus:bg-white"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
          />
        </div>

        {/* 导航菜单 */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <Menu
            mode="inline"
            items={menuItems}
            className="bg-transparent border-none"
            style={{ backgroundColor: "transparent" }}
            onClick={handleMenuClick}
            selectedKeys={[currentPage]} // 高亮当前选中菜单
            defaultOpenKeys={["private", "team"]} // 默认展开分组
          />
        </div>

        {/* 邀请横幅 */}
        {/* {showInviteBanner && (
          <div className="mx-2 mb-2 p-3 bg-white rounded-lg border border-gray-200 relative">
            <button
              onClick={onCloseInviteBanner}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">邀请成员</span>
            </div>
            <p className="text-xs text-gray-500">与你的团队协作。</p>
          </div>
        )} */}

        {/* 底部操作栏 */}
        <div className="border-t border-gray-200 p-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Tooltip title="设置">
              <Button type="text" icon={<Settings size={18} />} className="text-gray-500 hover:bg-gray-200/50" />
            </Tooltip>
            {/* <Tooltip title="市集">
              <Button type="text" icon={<ShoppingBag size={18} />} className="text-gray-500 hover:bg-gray-200/50" />
            </Tooltip>
            <Tooltip title="垃圾箱">
              <Button type="text" icon={<Trash2 size={18} />} className="text-gray-500 hover:bg-gray-200/50" />
            </Tooltip> */}
          </div>
          <div className="flex items-center gap-1">
            {/* <Tooltip title="消息">
              <Badge dot>
                <Button type="text" icon={<MessageSquare size={18} />} className="text-blue-500 hover:bg-blue-50" />
              </Badge>
            </Tooltip> */}
            <Tooltip title="帮助">
              <Button type="text" icon={<HelpCircle size={18} />} className="text-gray-500 hover:bg-gray-200/50" />
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* 侧边栏折叠按钮 */}
      <button
        onClick={onToggleCollapse}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-6 h-16 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center text-gray-600 hover:text-gray-900"
        style={{
          left: collapsed ? "0" : "240px",
          transition: "left 0.3s ease",
        }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </>
  );
}