// src/component/pages/InboxPage.tsx
"use client";

import {
  Inbox,
  Plus,
  Search,
  MoreHorizontal,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Input } from "antd"; // 仅保留Input，卡片/按钮用原生样式实现统一

export default function InboxPage() {
  // 模拟收件箱数据（未读+已读消息）
  const messages = [
    {
      id: 1,
      title: "团队会议提醒",
      content: "明天 10:00 项目进度同步会议，请准备好上周工作汇报材料",
      time: "今天 09:30",
      unread: true,
    },
    {
      id: 2,
      title: "新成员加入通知",
      content: "李华已加入「产品研发组」，请大家欢迎并同步相关项目文档",
      time: "昨天 16:45",
      unread: true,
    },
    {
      id: 3,
      title: "本周任务清单更新",
      content: "已更新本周迭代任务，请注意查看并确认分配给自己的任务项",
      time: "昨天 10:12",
      unread: false,
    },
    {
      id: 4,
      title: "系统维护通知",
      content:
        "本周五 23:00-次日1:00 系统将进行维护，期间可能无法访问，请提前安排工作",
      time: "3天前",
      unread: false,
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto">
      {/* 2. 外层容器：与 NotionMainContent 完全一致（max-w-5xl、px-20 py-16） */}
      <div className="max-w-5xl mx-auto px-20 py-16">
        {/* 3. 头部问候语：复用原样式的 flex 布局、标题大小、更多按钮 */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2 mb-4 text-gray-500">
            <Inbox size={16} />
            <h2 className="text-lg font-medium">收件箱</h2>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 4. 收件箱主区域：section 分区+图标标题（与原样式的「最近访问」「入门学习」结构一致） */}
        <section className="mb-12">
          {/* 4.2 操作栏：搜索框+新建按钮（保持与原样式卡片一致的视觉风格） */}
          <div className="flex flex-row items-center gap-4 mb-12">
            {/* 搜索框：保持原有样式，flex-1 占满剩余宽度，确保不被挤压 */}
            <Input
              placeholder="搜索消息..."
              prefix={<Search size={16} className="text-gray-400" />}
              variant="filled"
              className="bg-white/50 border-none hover:bg-white/80 focus:bg-white flex-1 min-w-[180px]" // min-w 避免小屏过度压缩
              style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
              size="middle" // 显式指定Input尺寸，与按钮高度对齐
            />

            {/* 新建消息按钮：固定高度/宽度，与搜索框垂直居中对齐 */}
            <button
              className="px-4 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-gray-500 whitespace-nowrap" // whitespace-nowrap 防止文字换行
              style={{ height: "40px" }} // 与Antd Input（middle尺寸）高度完全一致（40px）
            >
              <Plus size={16} />
              <span className="text-sm">新建消息</span>
            </button>
          </div>

          {/* 4.3 消息列表：网格布局（2列，与原样式「活动统计」一致）+ 统一卡片样式 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {messages.map((msg) => (
              // 消息卡片：完全仿照原样式「教程卡片」「最近访问卡片」的风格
              <div
                key={msg.id}
                className={`bg-gray-50 rounded-lg border ${
                  msg.unread ? "border-blue-200" : "border-gray-200"
                } p-6 hover:shadow-sm transition-shadow cursor-pointer group`}
              >
                {/* 卡片头部：未读标识+标题+时间 */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {msg.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    )}
                    <h3
                      className={`text-sm font-medium ${
                        msg.unread ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {msg.title}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>

                {/* 卡片内容：消息正文 */}
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {msg.content}
                </p>

                {/* 卡片底部：操作标识（仿照原样式「教程卡片」底部） */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    <Clock size={12} className="inline-block mr-1" />
                    标记为已读
                  </span>
                  <CheckCircle2
                    size={14}
                    className="text-gray-400 group-hover:text-blue-500 transition-colors"
                  />
                </div>
              </div>
            ))}

            {/* 空状态：仿照原样式，不用 Antd Empty */}
            {messages.length === 0 && (
              <div className="col-span-full p-12 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <Inbox size={24} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">暂无消息</p>
                <p className="text-xs text-gray-400 mt-1">
                  点击「新建消息」开始发送
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 5. 未读统计区域：新增分区，保持与原样式结构一致 */}
        {/* <section> */}
          {/* <div className="flex items-center gap-2 mb-4 text-gray-500">
            <CheckCircle2 size={16} />
            <h2 className="text-sm font-medium">消息统计</h2>
          </div> */}

          {/* <div className="grid grid-cols-2 gap-4"> */}
            {/* 未读消息统计卡片 */}
            {/* <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center h-24 mb-4">
                <div className="text-center">
                  <span className="text-3xl font-bold text-blue-500">
                    {messages.filter((m) => m.unread).length}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">未读消息</p>
                </div>
              </div>
              <div className="text-center">
                <button className="text-xs text-blue-500 hover:text-blue-600">
                  标记全部已读
                </button>
              </div>
            </div> */}

            {/* 总消息统计卡片 */}
            {/* <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-center h-24 mb-4">
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-700">
                    {messages.length}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">总消息数</p>
                </div>
              </div>
              <div className="text-center">
                <button className="text-xs text-gray-500 hover:text-gray-700">
                  清理历史消息
                </button>
              </div>
            </div>
          </div> */}
        {/* </section> */}
      </div>
    </main>
  );
}
