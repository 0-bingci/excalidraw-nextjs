# Excalidraw Clone

一个基于 Next.js 和 Fabric.js 构建的协作式在线白板应用，支持 AI 智能生成图形和多人实时协作。

## 功能特性

### 画布绘图工具
- **基础图形**：矩形、菱形、圆形、线条、箭头
- **自由绘制**：画笔工具、文字工具、图片插入
- **辅助工具**：选择、平移、橡皮擦、撤销/重做
- **画布操作**：缩放、导出 PNG/JSON、复制为图片

### 图形属性编辑
- 描边颜色 / 填充颜色
- 描边宽度 / 虚线样式
- 透明度调节
- 图层排序（置前/置后）
- 复制 / 删除

### AI 智能生成
- 侧边栏 AI 助手面板，支持多轮对话
- 通过自然语言描述生成 Fabric.js 图形
- 感知画布现有内容，可在已有图形基础上修改
- 基于 LangChain + Qwen3-32B 模型

### 实时协作
- 创建/加入协作房间
- 基于 Yjs CRDT 的实时同步
- 用户光标追踪与在线状态显示
- IndexedDB 离线持久化
- 压缩链接分享房间

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 + React 19 + TypeScript |
| 画布 | Fabric.js 6 |
| AI | LangChain + ModelScope API (Qwen3-32B) |
| 协作 | Yjs + y-websocket + y-indexeddb |
| 样式 | Tailwind CSS + Ant Design |
| 图标 | Lucide React |

## 项目结构

```
src/
├── app/
│   ├── page.tsx                 # 首页（欢迎页）
│   ├── board/page.tsx           # 主画板页面
│   └── api/generateChart/       # AI 生成图形 API
├── components/
│   ├── agent/                   # AI 助手面板
│   ├── canvas-tools/            # 画布工具定义与事件处理
│   ├── collaboration/           # 协作用户头像
│   └── tools/                   # 右键菜单、属性面板、分享菜单
├── hooks/
│   ├── useCanvasHistory.ts      # 撤销/重做
│   └── useCollaboration.ts      # 协作管理
├── lib/collaboration/           # Yjs 绑定与用户感知
└── server/
    └── yjs-server.mjs           # 协作 WebSocket 服务
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm / yarn / pnpm

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
API_KEY=your_modelscope_api_key
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 启动协作服务器（可选）

如需使用实时协作功能，需要单独启动 WebSocket 服务：

```bash
npm run collab-server
```

默认端口 `1234`，可通过 `YJS_PORT` 环境变量自定义。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（Turbopack） |
| `npm run build` | 构建生产版本 |
| `npm start` | 运行生产服务器 |
| `npm run lint` | 代码检查 |
| `npm run collab-server` | 启动协作 WebSocket 服务 |

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `API_KEY` | ModelScope API 密钥 | — |
| `NEXT_PUBLIC_YJS_WS_URL` | 协作 WebSocket 地址 | `ws://localhost:1234` |
| `YJS_PORT` | Yjs 服务端口 | `1234` |
