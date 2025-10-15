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
  const [selectedTodo, setSelectedTodo] = useState(null);
  // 新增：控制新增任务对话框显示/隐藏
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // 新增：存储新增任务的表单数据
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "中", // 默认优先级为“中”
    deadline: "",
    completed: false,
  });

  // 模拟收件箱数据（唯一数据源）
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
      content:
        "本周五 23:00-次日1:00 系统将进行维护，期间可能无法访问，请提前安排工作",
      time: "3天前",
      unread: true,
    },
  ]);

  // 仅保留 id、title、description、priority、completed、deadline 的 Todo 数据
  const [todos, setTodos] = useState([
    {
      id: 1,
      title: "完成项目需求文档",
      description:
        "需包含用户痛点分析、核心功能模块说明、交互逻辑简图，最终输出 PDF 版同步给团队",
      priority: "高",
      completed: false,
      deadline: "2025-10-15 18:00",
    },
    {
      id: 2,
      title: "与设计组评审UI方案",
      description:
        "重点确认首页布局、商品详情页交互、个人中心入口位置，需记录评审意见并同步给设计组修改",
      priority: "中",
      completed: false,
      deadline: "2025-10-16 14:00",
    },
    {
      id: 3,
      title: "修复首页滚动异常问题",
      description:
        "解决 iOS 端 Safari 浏览器下拉时白屏、安卓端滚动卡顿的问题，修复后需在测试环境验证",
      priority: "高",
      completed: true,
      deadline: "2025-10-14 24:00",
    },
    {
      id: 4,
      title: "整理上周测试反馈",
      description:
        "从测试报告中提取功能bug和体验优化点，按“紧急程度”分类，输出表格版反馈清单",
      priority: "低",
      completed: false,
      deadline: "2025-10-17 12:00",
    },
    {
      id: 5,
      title: "撰写周工作汇报",
      description:
        "总结本周完成的3项核心任务、遇到的问题及解决方案，规划下周2个重点任务",
      priority: "中",
      completed: false,
      deadline: "2025-10-18 10:00",
    },
  ]);

  // 对话框状态管理（仅保留控制显示/隐藏和筛选类型的状态）
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState("全部");

  // 打开对话框（无需复制数据）
  const openDialog = () => {
    setIsDialogOpen(true);
  };

  // 关闭对话框
  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // 应用筛选（仅更新筛选类型，不维护独立数据）
  const applyFilter = (type) => {
    setFilterType(type);
  };

  // 更新父组件的 messages 状态（Dialog 会自动同步）
  const readMessage = (id) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, unread: false } : msg))
    );
  };

  // 动态计算 Dialog 要显示的消息（基于当前 messages 和 filterType）
  const getFilteredMessages = () => {
    if (filterType === "未读") {
      return messages.filter((msg) => msg.unread);
    } else if (filterType === "已读") {
      return messages.filter((msg) => !msg.unread);
    }
    return messages;
  };

  // 切换任务完成状态
  const toggleTodoCompletion = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );

    // 如果正在查看该任务的详情，同步更新对话框中的状态
    if (selectedTodo && selectedTodo.id === id) {
      setSelectedTodo((prev) =>
        prev ? { ...prev, completed: !prev.completed } : null
      );
    }
  };

  // 新增：重置新增任务表单
  const resetAddForm = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "中",
      deadline: "",
      completed: false,
    });
  };

  // 新增：处理新增任务提交
  const handleAddTask = (e) => {
    e.preventDefault();
    // 简单验证：标题和截止时间为必填项
    if (!newTask.title.trim() || !newTask.deadline) return;

    // 格式化截止时间：将 datetime-local 的 "YYYY-MM-DDThh:mm" 转为 "YYYY-MM-DD hh:mm"
    const formattedDeadline = newTask.deadline.replace("T", " ");

    // 生成新任务（用时间戳作为唯一ID）
    const taskToAdd = {
      ...newTask,
      id: Date.now(), // 确保ID唯一
      deadline: formattedDeadline,
    };

    // 添加到任务列表
    setTodos([...todos, taskToAdd]);

    // 关闭对话框并重置表单
    setIsAddDialogOpen(false);
    resetAddForm();
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. 渲染未读消息（最多3条） */}
            {messages
              .filter((msg) => msg.unread)
              .slice(0, 3)
              .map((msg) => (
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

                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {msg.content}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="text-gray-400 flex items-center cursor-pointer hover:text-blue-500 transition-colors"
                      onClick={() => readMessage(msg.id)}
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
                <div className="text-sm text-gray-500 mb-1">
                  还有更多未读消息, 点击右上角查看
                </div>
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
                <div className="text-sm font-medium text-gray-700 mb-1">
                  暂无未读消息
                </div>
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

            {/* 新增：修改按钮，添加打开对话框事件 */}
            <button
              className="px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors flex items-center gap-2 text-sm font-medium"
              style={{ height: "40px" }}
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus size={16} />
              <span>新增任务</span>
            </button>
          </div>

          {/* 任务列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`rounded-lg p-5 cursor-pointer transition-all duration-200 bg-white border ${
                  todo.completed
                    ? "border-gray-100 opacity-80"
                    : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }`}
                onClick={() => setSelectedTodo(todo)} // 点击整个卡片打开详情对话框
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    {/* 复选框 - 添加点击事件切换完成状态 */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation(); // 阻止事件冒泡到父元素
                        toggleTodoCompletion(todo.id);
                      }}
                      className="cursor-pointer"
                    >
                      {todo.completed ? (
                        <CheckSquare
                          size={18}
                          className="text-green-500 mt-0.5 flex-shrink-0"
                        />
                      ) : (
                        <Square
                          size={18}
                          className="text-gray-300 hover:text-gray-500 mt-0.5 flex-shrink-0"
                        />
                      )}
                    </div>
                    <h3
                      className={`text-sm font-medium ${
                        todo.completed
                          ? "text-gray-400 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {todo.title}
                    </h3>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      todo.priority === "高"
                        ? "bg-red-50 text-red-600"
                        : todo.priority === "中"
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {todo.priority}优先级
                  </span>
                </div>

                <div className="flex items-center text-xs text-gray-400 mt-3">
                  <Calendar size={12} className="mr-1" />
                  <span>截止：{todo.deadline}</span>
                  {!todo.completed && new Date(todo.deadline) < new Date() && (
                    <span className="ml-2 flex items-center text-red-400">
                      <Flag size={12} className="mr-1" />
                      已逾期
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 任务详情对话框 */}
          {selectedTodo && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-md w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100">
                {/* 关闭按钮 */}
                <div className="flex justify-end p-3">
                  <button
                    onClick={() => setSelectedTodo(null)}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="关闭"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>

                {/* 对话框内容 */}
                <div className="px-6 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedTodo.title}
                  </h3>

                  <div className="space-y-4">
                    {/* 任务描述 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">任务描述</p>
                      <p className="text-sm text-gray-700">
                        {selectedTodo.description}
                      </p>
                    </div>

                    {/* 优先级 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">优先级</p>
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                          selectedTodo.priority === "高"
                            ? "bg-red-50 text-red-600"
                            : selectedTodo.priority === "中"
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {selectedTodo.priority}优先级
                      </span>
                    </div>

                    {/* 截止时间 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">截止时间</p>
                      <p className="text-sm text-gray-700 flex items-center">
                        <Calendar size={14} className="mr-1.5 text-gray-400" />
                        {selectedTodo.deadline}
                        {!selectedTodo.completed &&
                          new Date(selectedTodo.deadline) < new Date() && (
                            <span className="ml-2 flex items-center text-red-400 text-xs">
                              <Flag size={12} className="mr-1" />
                              已逾期
                            </span>
                          )}
                      </p>
                    </div>

                    {/* 完成状态 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">完成状态</p>
                      <p className="text-sm flex items-center">
                        {selectedTodo.completed ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle2 size={14} className="mr-1.5" />
                            已完成
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-600">
                            <Clock size={14} className="mr-1.5" />
                            未完成
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* 底部操作按钮 */}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        toggleTodoCompletion(selectedTodo.id);
                        // 如果是从已完成状态切换为未完成，保持对话框打开
                        if (!selectedTodo.completed) {
                          setSelectedTodo(null);
                        }
                      }}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedTodo.completed
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {selectedTodo.completed ? "标记为未完成" : "标记为已完成"}
                    </button>
                    <button
                      onClick={() => setSelectedTodo(null)}
                      className="px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 新增：新增任务对话框 */}
          {isAddDialogOpen && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-md w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100">
                {/* 对话框头部：标题 + 关闭按钮 */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">新增任务</h3>
                  <button
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetAddForm();
                    }}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="关闭"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>

                {/* 新增任务表单 */}
                <form onSubmit={handleAddTask} className="px-6 py-5">
                  <div className="space-y-4">
                    {/* 任务标题（必填） */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        任务标题 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={newTask.title}
                        onChange={(e) =>
                          setNewTask({ ...newTask, title: e.target.value })
                        }
                        placeholder="请输入任务标题（如：完成项目需求文档）"
                        className="w-full"
                        required
                      />
                    </div>

                    {/* 任务描述（可选） */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        任务描述
                      </label>
                      <textarea
                        value={newTask.description}
                        onChange={(e) =>
                          setNewTask({ ...newTask, description: e.target.value })
                        }
                        placeholder="请输入任务详情（可选，如：需包含用户痛点分析、功能模块说明）"
                        className="w-full min-h-[80px] p-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-green-400 focus:border-green-400 text-sm resize-none"
                      ></textarea>
                    </div>

                    {/* 优先级（必填） */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        优先级 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        {["高", "中", "低"].map((priority) => (
                          <button
                            key={priority}
                            type="button"
                            onClick={() =>
                              setNewTask({ ...newTask, priority })
                            }
                            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                              newTask.priority === priority
                                ? priority === "高"
                                  ? "bg-red-50 text-red-600 border border-red-200"
                                  : priority === "中"
                                  ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                                  : "bg-gray-50 text-gray-600 border border-gray-200"
                                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {priority}优先级
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 截止时间（必填） */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        截止时间 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="datetime-local"
                        value={newTask.deadline}
                        onChange={(e) =>
                          setNewTask({ ...newTask, deadline: e.target.value })
                        }
                        className="w-full"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        选择任务的截止日期和时间，格式：年-月-日 时:分
                      </p>
                    </div>
                  </div>

                  {/* 表单操作按钮 */}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        resetAddForm();
                      }}
                      className="px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      创建任务
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 修复后的筛选对话框（直接使用父组件 messages 数据） */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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

            {/* 筛选选项标签 */}
            <div className="flex px-4 pb-2">
              <button
                onClick={() => applyFilter("全部")}
                className={`flex-1 py-2.5 mx-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filterType === "全部"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                全部
              </button>
              <button
                onClick={() => applyFilter("未读")}
                className={`flex-1 py-2.5 mx-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filterType === "未读"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                未读
              </button>
              <button
                onClick={() => applyFilter("已读")}
                className={`flex-1 py-2.5 mx-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filterType === "已读"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                已读
              </button>
            </div>

            {/* 对话框内的消息列表（使用动态计算的过滤后数据） */}
            <div className="max-h-72 overflow-y-auto">
              {getFilteredMessages().length > 0 ? (
                getFilteredMessages().map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      index !== getFilteredMessages().length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                    onClick={() => readMessage(msg.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {msg.unread && (
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5"></div>
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
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {msg.content}
                    </p>
                  </div>
                ))
              ) : (
                // 空数据提示
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Inbox size={20} className="text-gray-400" />
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    暂无对应消息
                  </div>
                  <div className="text-xs text-gray-400">
                    当前筛选条件下没有匹配的消息
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}