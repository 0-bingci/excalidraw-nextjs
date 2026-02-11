// app/api/generate-chart/route.ts
import { NextRequest } from "next/server";
import { ChatOpenAI } from "@langchain/openai";

export async function POST(request: NextRequest) {
  try {
    const { metadata, description } = await request.json();

    // 构建系统提示词（保持不变）
    const systemPrompt = `你是一个专业的 Fabric.js 图形生成助手。用户会提供：
1. 一个现有的 Fabric.js 画布 JSON 数据（包含 objects 和 background）
2. 一段自然语言描述，要求你基于描述生成或修改图形

你的任务：
- 严格保持 Fabric.js JSON 格式（version、objects 数组、每个 object 的属性）
- 不要生成图片，只输出 JSON
- 严格要求在 objects 中添加或修改图形元素以满足描述
- 所有新增对象必须包含完整的 Fabric.js 属性（如 left, top, width, height, fill, stroke 等）
- 背景颜色按描述设置
- 输出必须是纯 JSON，不要任何解释、markdown 或额外文本
- 用 (内容) 包裹整个 JSON（按用户要求）

示例输出格式：
( { "version": "6.7.1", "objects": [...], "background": "#ffffff" } )`;

    const userPrompt = `
原始图形数据（UserComment）：
${JSON.stringify(metadata, null, 2)}

用户新需求（ChartData）：
${description}
`;
    const model = new ChatOpenAI({
      modelName: "Qwen/Qwen3-32B",
      apiKey: process.env.API_KEY,
      configuration: {
        baseURL: "https://api-inference.modelscope.cn/v1",
      },
      modelKwargs: {
        extra_body: {
          enable_thinking: true,
        },
      },
      temperature: 0,
      streaming: true,
    });

    // 调用模型
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const content = response.content as string;

    // 提取 ( ... ) 中的 JSON
    const match = content.match(/\(([\s\S]*)\)/);
    if (!match) {
      throw new Error("模型未按要求用 ( ) 包裹 JSON 输出");
    }

    const jsonStr = match[1].trim();
    const fabricJson = JSON.parse(jsonStr);

    // 验证结构
    if (!fabricJson.objects || !Array.isArray(fabricJson.objects)) {
      throw new Error("无效的 Fabric.js JSON 结构");
    }

    return Response.json({ fabricJson });
  } catch (error: any) {
    console.error("Generate chart error:", error);
    return Response.json(
      { error: error.message || "Failed to generate chart structure" },
      { status: 500 },
    );
  }
}
