"use client";

import { useState } from "react";
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
  Flag,
  X,
} from "lucide-react";
import { Input } from "antd";

export default function InboxPage() {
  // 模拟收件箱数据
  const [messages, setMessages] = useState([
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
      unread: true,
    },
    {
      id: 4,
      title: "系统维护通知",
      content: "本周五 23:00-次日1:00 系统将进行维护，期间可能无法访问，请提前安排工作",
      time: "3天前",
      unread: true,
    },
  ]);

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

  // 对话框状态管理
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState("全部");
  const [dialogMessages, setDialogMessages] = useState(messages);

  // 打开对话框
  const openDialog = () => {
    setIsDialogOpen(true);
    setDialogMessages(messages);
  };

  // 关闭对话框
  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // 应用筛选
  const applyFilter = (type) => {
    setFilterType(type);
    if (type === "未读") {
      setDialogMessages(messages.filter((msg) => msg.unread));
    } else if (type === "已读") {
      setDialogMessages(messages.filter((msg) => !msg.unread));
    } else {
      setDialogMessages(messages);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-20 py-16">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold text-gray-900">消息与任务</h1>
        </div>

        {/* 收件箱模块 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Inbox size={16} />
              <h2 className="text-sm font-medium">收件箱</h2>
              {/* <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                未读
              </span> */}
            </div>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={openDialog}
              aria-label="消息筛选选项"
            >
              <MoreHorizontal size={18} className="text-gray-500" />
            </button>
          </div>

          {/* 消息列表 */}
          {/* 消息列表 - 最多显示3条 + 超量提示 + 空数据处理 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. 渲染未读消息（最多3条） */}
            {messages
              .filter((msg) => msg.unread) // 只筛选未读消息
              .slice(0, 3) // 限制最多显示3条
              .map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg p-5 cursor-pointer transition-all duration-200 ${msg.unread
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
                    <span
                      className="text-gray-400 flex items-center cursor-pointer hover:text-blue-500 transition-colors"
                      onClick={() => {
                        // 点击标记为已读（这里按业务逻辑调整：通常是unread从true→false，如需false→true可改值）
                        setMessages(prev => prev.map(item =>
                          item.id === msg.id ? { ...item, unread: false } : item
                        ));
                      }}
                    >
                      <Clock size={12} className="mr-1" />
                      标记为已读
                    </span>
                  </div>
                </div>
              ))}

            {/* 2. 处理超量情况（未读消息>3条时，显示提示） */}
            {messages.filter((msg) => msg.unread).length > 3 && (
              <div className="rounded-lg p-5 bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="text-sm text-gray-500 mb-1">还有更多未读消息, 点击右上角查看</div>
                <div className="text-xs text-gray-400">
                  共 {messages.filter((msg) => msg.unread).length - 3} 条未显示
                </div>
              </div>
            )}

            {/* 3. 处理空数据情况（无未读消息时，显示提示） */}
            {messages.filter((msg) => msg.unread).length === 0 && (
              <div className="rounded-lg p-8 bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center col-span-1 md:col-span-2">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} className="text-gray-400" />
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">暂无未读消息</div>
                {/* <div className="text-xs text-gray-400">所有消息已标记为已读</div> */}
              </div>
            )}
          </div>
        </section>

        {/* 待办事项模块 */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`rounded-lg p-5 cursor-pointer transition-all duration-200 bg-white border ${todo.completed
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
                    <h3 className={`text-sm font-medium ${todo.completed ? "text-gray-400 line-through" : "text-gray-900"
                      }`}>
                      {todo.title}
                    </h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${todo.priority === "高"
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

      {/* 优化后的筛选对话框 */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* 对话框主体 - 增加圆角，优化阴影 */}
          <div className="bg-white rounded-xl shadow-md w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100">
            {/* 关闭按钮区域 */}
            <div className="flex justify-end p-3">
              <button
                onClick={closeDialog}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="关闭"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* 搜索框 - 与页面搜索框样式统一 */}
            <div className="px-5 mb-4">
              <Input
                placeholder="搜索消息..."
                prefix={<Search size={16} className="text-gray-400" />}
                variant="filled"
                className="bg-gray-50 border-0 hover:bg-gray-100 focus:bg-white rounded-lg"
                size="middle"
              />
            </div>

            {/* 筛选选项标签 - 一行排列，优化圆角和颜色 */}
            <div className="flex px-4 pb-2">
              <button
                onClick={() => applyFilter("全部")}
                className={`flex-1 py-2.5 mx-1 text-sm font-medium rounded-lg transition-all duration-200 ${filterType === "全部"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-blue-600 hover:bg-blue-50"
                  }`}
              >
                全部
              </button>
              <button
                onClick={() => applyFilter("未读")}
                className={`flex-1 py-2.5 mx-1 text-sm font-medium rounded-lg transition-all duration-200 ${filterType === "未读"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-blue-600 hover:bg-blue-50"
                  }`}
              >
                未读
              </button>
              <button
                onClick={() => applyFilter("已读")}
                className={`flex-1 py-2.5 mx-1 text-sm font-medium rounded-lg transition-all duration-200 ${filterType === "已读"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-blue-600 hover:bg-blue-50"
                  }`}
              >
                已读
              </button>
            </div>

            {/* 对话框内的消息列表 - 增加圆角和间距 */}
            <div className="max-h-72 overflow-y-auto">
              {/* 有数据时渲染消息列表 */}
              {dialogMessages.length > 0 ? (
                dialogMessages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${index !== dialogMessages.length - 1 ? 'border-b border-gray-100' : ''
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
                    <p className="text-sm text-gray-500 line-clamp-2">{msg.content}</p>
                  </div>
                ))
              ) : (
                // 空数据时显示提示文字，填充位置
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Inbox size={20} className="text-gray-400" />
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-1">暂无对应消息</div>
                  <div className="text-xs text-gray-400">当前筛选条件下没有匹配的消息</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
