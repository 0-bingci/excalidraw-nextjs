// src/component/pages/InboxPage.tsx
"use client";

import {
  Inbox,
  Plus,
  Search,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  CheckSquare,
  Square,
  Calendar,
  Flag
} from "lucide-react";
import { Input } from "antd";

export default function InboxPage() {
  // 模拟收件箱数据
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
      content: "本周五 23:00-次日1:00 系统将进行维护，期间可能无法访问，请提前安排工作",
      time: "3天前",
      unread: false,
    },
  ];

  // 新增待办事项数据
  const todos = [
    {
      id: 1,
      title: "完成项目需求文档",
      deadline: "今天 18:00",
      priority: "高",
      completed: false,
    },
    {
      id: 2,
      title: "与设计组评审UI方案",
      deadline: "明天 14:00",
      priority: "中",
      completed: false,
    },
    {
      id: 3,
      title: "修复首页滚动异常问题",
      deadline: "昨天",
      priority: "高",
      completed: true,
    },
    {
      id: 4,
      title: "整理上周测试反馈",
      deadline: "周五 12:00",
      priority: "低",
      completed: false,
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto">
      {/* 头部问候语 */}
      {/* <div className="max-w-5xl mx-auto px-20 py-16">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold text-gray-900">消息与任务</h1>
        </div>
      </div> */}

      <div className="max-w-5xl mx-auto px-20 py-16">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold text-gray-900">消息与任务</h1>
        </div>
        {/* 1. 新增现代风格收件箱模块 */}
        <section className="mb-10">
          {/* 收件箱标题 - 改为text-sm */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Inbox size={16} />
              <h2 className="text-sm font-medium">收件箱</h2> {/* 改为text-sm */}
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal size={18} className="text-gray-500" />
            </button>
          </div>

          {/* 现代风格收件箱操作栏 */}
          <div className="flex flex-row items-center gap-3 mb-5"> {/* 减小底部间距 */}
            <Input
              placeholder="搜索消息..."
              prefix={<Search size={16} className="text-gray-400" />}
              variant="filled"
              className="bg-white border border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 flex-1 min-w-[180px] rounded-md"
              size="middle"
            />

            <button
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium"
              style={{ height: "40px" }}
            >
              <Plus size={16} />
              <span>新建消息</span>
            </button>
          </div>

          {/* 现代风格消息列表 - 减小与标题距离 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {/* 减小卡片间距 */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg p-5 cursor-pointer transition-all duration-200 ${
                  msg.unread 
                    ? "bg-white border border-blue-100 shadow-sm hover:shadow" 
                    : "bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {msg.unread && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5"></div>
                    )}
                    <h3 className={`text-sm font-medium ${msg.unread ? "text-gray-900" : "text-gray-700"}`}>
                      {msg.title}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>

                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {msg.content}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center">
                    <Clock size={12} className="mr-1" />
                    标记为已读
                  </span>
                  <CheckCircle2
                    size={14}
                    className={`transition-colors ${
                      msg.unread ? "text-gray-300" : "text-gray-400 hover:text-blue-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 原收件箱模块改为待办事项模块 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-500">
              <CheckSquare size={16} />
              <h2 className="text-sm font-medium">待办事项</h2>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal size={18} className="text-gray-500" />
            </button>
          </div>

          {/* 待办事项操作栏 */}
          <div className="flex flex-row items-center gap-3 mb-5">
            <Input
              placeholder="搜索任务..."
              prefix={<Search size={16} className="text-gray-400" />}
              variant="filled"
              className="bg-white border border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-green-400 focus:border-green-400 flex-1 min-w-[180px] rounded-md"
              size="middle"
            />

            <button
              className="px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors flex items-center gap-2 text-sm font-medium"
              style={{ height: "40px" }}
            >
              <Plus size={16} />
              <span>新增任务</span>
            </button>
          </div>

          {/* 待办事项列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`rounded-lg p-5 cursor-pointer transition-all duration-200 bg-white border ${
                  todo.completed 
                    ? "border-gray-100 opacity-80" 
                    : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    {todo.completed ? (
                      <CheckSquare size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Square size={18} className="text-gray-300 hover:text-gray-500 mt-0.5 flex-shrink-0" />
                    )}
                    <h3 className={`text-sm font-medium ${
                      todo.completed ? "text-gray-400 line-through" : "text-gray-900"
                    }`}>
                      {todo.title}
                    </h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    todo.priority === "高" 
                      ? "bg-red-50 text-red-600" 
                      : todo.priority === "中"
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-gray-50 text-gray-600"
                  }`}>
                    {todo.priority}优先级
                  </span>
                </div>

                <div className="flex items-center text-xs text-gray-400 mt-3">
                  <Calendar size={12} className="mr-1" />
                  <span>截止：{todo.deadline}</span>
                  {!todo.completed && todo.deadline.includes("昨天") && (
                    <span className="ml-2 flex items-center text-red-400">
                      <Flag size={12} className="mr-1" />
                      已逾期
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}