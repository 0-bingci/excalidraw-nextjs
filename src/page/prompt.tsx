"use client";

import { MoreHorizontal, Clock, BookOpen, Plus, FileText } from "lucide-react";
import Link from "next/link";
import {
  faPaintBrush,
  faCode,
  faBriefcase,
  faBarChart,
  faPencil,
  faLineChart,
  faCamera,
  faFilm,
  faTimes,
  faCopy,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

// 定义提示词卡片数据（数据不变，仅调整渲染样式）
const promptCardList = [
  {
    icon: faPaintBrush,
    title: "UI设计师",
    prompts: [
      "创建一个现代、简洁的移动应用界面，具有清晰的视觉层次结构和直观的用户流程。使用柔和的配色方案，注重留白和交互反馈。",
      "设计一个响应式网站界面，优先考虑移动端体验，包含动画过渡效果和微交互，符合当代设计趋势。",
    ],
  },
  {
    icon: faCode,
    title: "前端开发",
    prompts: [
      "使用HTML、CSS和JavaScript创建一个响应式网页，实现平滑滚动效果和响应式导航栏，确保在所有设备上都有良好表现。",
      "用React框架开发一个交互式单页应用，包含表单验证、状态管理和API集成，代码需遵循最佳实践和性能优化原则。",
    ],
  },
  {
    icon: faBriefcase,
    title: "产品经理",
    prompts: [
      "分析用户需求并创建产品需求文档(PRD)，包含功能描述、用户故事、交互流程和验收标准，确保开发团队理解产品目标。",
      "制定产品路线图，确定功能优先级，平衡业务目标与用户需求，创建可衡量的成功指标和迭代计划。",
    ],
  },
  {
    icon: faBarChart,
    title: "数据科学家",
    prompts: [
      "分析用户行为数据集，识别关键趋势和模式，创建预测模型来预测用户留存率，提供可操作的业务洞察。",
      "使用Python和机器学习库构建分类模型，处理缺失数据，优化模型性能，可视化结果并解释模型决策过程。",
    ],
  },
  {
    icon: faPencil,
    title: "内容创作者",
    prompts: [
      "创作一篇关于人工智能在日常生活中应用的博客文章，面向普通读者，语言生动有趣，包含实际案例和未来展望。",
      "设计一个社交媒体内容日历，包括引人入胜的标题、关键词和视觉元素建议，针对目标受众优化内容以提高参与度。",
    ],
  },
  {
    icon: faLineChart,
    title: "市场营销",
    prompts: [
      "制定一个新产品上市的数字营销策略，包括社交媒体推广、内容营销和影响者合作，设定明确的KPI和预算分配。",
      "分析竞争对手的营销策略，识别市场机会和差异化优势，创建定位声明和独特的价值主张，吸引目标客户群体。",
    ],
  },
  {
    icon: faCamera,
    title: "摄影师",
    prompts: [
      "拍摄一组城市夜景照片，突出建筑轮廓和灯光效果，使用长时间曝光技术捕捉车流轨迹，营造梦幻氛围。",
      "创作一套人像摄影系列，探索自然光线的运用，通过构图和姿势传达人物个性，后期处理保持自然质感。",
    ],
  },
  {
    icon: faFilm,
    title: "视频编辑",
    prompts: [
      "编辑一个产品演示视频，结合动态图文、特写镜头和用户见证，节奏明快，突出核心功能和使用场景，时长控制在60秒内。",
      "制作一个旅行vlog，使用转场效果和背景音乐营造情绪变化，平衡风景镜头与人物互动，讲述一个连贯的旅行故事。",
    ],
  },
];

export default function NotionMainContent() {
  const cardList = [
    {
      src: "https://picsum.photos/800/600?random=1",
      alt: "Design Preview 1",
      title: "Supercharge your Symbols",
      description: "Enhance your design workflow with powerful tools.",
    },
    {
      src: "https://picsum.photos/800/600?random=2",
      alt: "Design Preview 2",
      title: "Relvise",
      description: "A modern template for business websites.",
    },
    {
      src: "https://picsum.photos/800/600?random=3",
      alt: "Design Preview 3",
      title: "Indicorp",
      description: "Corporate web template with sleek interactions.",
    },
    {
      src: "https://picsum.photos/800/600?random=4",
      alt: "Design Preview 4",
      title: "Atlas 会议网页设计模板",
      description: "Vibrant conference web page template with responsive layout.",
    },
  ];

  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  const toggleCard = (index: number) => {
    if (expandedCardIndex === index) {
      setExpandedCardIndex(null);
    } else {
      setExpandedCardIndex(index);
    }
  };

  const copyPrompt = (prompts: string[]) => {
    const content = prompts.join("\n\n");
    navigator.clipboard.writeText(content).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-20 py-16">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold text-gray-900">提示词</h1>
        </div>

        {/* 最近访问区域（原样式不变，作为配色参考） */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4 text-gray-500">
            <Clock size={16} />
            <h2 className="text-sm font-medium">一些推荐的网站</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {cardList.map((card, idx) => (
              <div
                key={idx}
                className="group relative w-full h-64 rounded-lg overflow-hidden transition-all duration-300"
              >
                <img
                  src={card.src}
                  alt={card.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0">
                  <h3 className="text-white text-lg font-semibold mb-2">
                    {card.title}
                  </h3>
                  <p className="text-white/90 text-sm">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 入门学习区域（配色调整核心区域） */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4 text-gray-500">
            <BookOpen size={16} />
            <h2 className="text-sm font-medium">一些好用的提示词</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {promptCardList.map((card, idx) => (
              <div
                key={idx}
                className="group relative w-full h-64 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer"
              >
                {/* 卡片容器：中性灰阴影，与上方图片卡片风格对齐 */}
                <div className="w-full h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-500">
                  {/* 卡片正面：灰色图标背景+深灰图标，无彩色 */}
                  {expandedCardIndex !== idx && (
                    <div
                      className="h-full flex flex-col items-center justify-center text-center p-6"
                      onClick={() => toggleCard(idx)}
                    >
                      {/* 图标背景：浅灰（与页面文字辅助色呼应） */}
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                        {/* 图标颜色：深灰（与页面标题色阶匹配） */}
                        <FontAwesomeIcon
                          icon={card.icon}
                          className="text-gray-600 text-2xl"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {card.title}
                      </h3>
                      <p className="text-gray-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        点击查看提示词
                      </p>
                    </div>
                  )}

                  {/* 卡片背面：浅灰渐变+中性文字，无彩色 */}
                  {expandedCardIndex === idx && (
                    // 背景渐变：极浅灰过渡，避免生硬
                    <div className="h-full p-6 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {card.title}
                        </h3>
                        <button
                          onClick={() => toggleCard(idx)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTimes} size="lg" />
                        </button>
                      </div>
                      {/* 提示词文字：中灰，确保可读性且不抢视觉焦点 */}
                      <div className="text-gray-700 space-y-3 mb-4">
                        {card.prompts.map((prompt, pIdx) => (
                          <p key={pIdx} className="text-sm leading-relaxed">
                            "{prompt}"
                          </p>
                        ))}
                      </div>
                      {/* 复制按钮：深灰文字，hover加深（与关闭按钮交互逻辑一致） */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => copyPrompt(card.prompts)}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center transition-colors"
                        >
                          <FontAwesomeIcon icon={faCopy} className="mr-1" />
                          复制提示词
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 复制提示：保持原有深灰，与上方图片卡片的黑色半透明层呼应 */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center transform translate-y-0 opacity-100 transition-all duration-300">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
          <span className="text-sm">提示词已复制到剪贴板</span>
        </div>
      )}
    </main>
  );
}