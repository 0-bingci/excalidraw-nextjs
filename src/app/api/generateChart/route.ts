import { NextRequest } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { randomColorTool } from "@/utils/tools";

export async function POST(request: NextRequest) {
  try {
    const { metadata, description } = await request.json();

    const systemPrompt = `你是一个专业的 Fabric.js 图形生成助手。
你的任务是基于描述生成或修改 Fabric.js JSON。
注意：如果用户要求随机颜色，请务必先调用 get_random_color 工具获取颜色，然后将得到的颜色应用到 JSON 的 fill 或 stroke 属性中。
输出必须是纯 JSON 且用 ( 内容 ) 包裹。`;

    const userPrompt = `原始数据：${JSON.stringify(metadata)}\n需求：${description}`;

    // 2. 初始化模型并绑定工具
    const model = new ChatOpenAI({
      modelName: "Qwen/Qwen3-32B",
      apiKey: process.env.API_KEY,
      configuration: { baseURL: "https://api-inference.modelscope.cn/v1" },
      temperature: 0,
      streaming: true,
    }).bindTools([randomColorTool]); // 绑定工具

    // 3. 第一次调用：询问模型
    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt),
    ];
    let response = await model.invoke(messages);

    // 4. 核心逻辑：处理 Tool Call
    // 如果 AI 决定调用工具
    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        if (toolCall.name === "get_random_color") {
          // 执行本地函数
          const color = await randomColorTool.invoke(toolCall);

          // 将工具执行结果存入消息历史，让 AI 知道颜色是什么
          messages.push(response); // 存入 AI 的调用意图
          messages.push(
            new ToolMessage({
              tool_call_id: toolCall.id!,
              content: String(color),
            }),
          );

          // 第二次调用：让 AI 根据拿到的颜色生成最终 JSON
          response = await model.invoke(messages);
        }
      }
    }

    // 5. 解析输出（与你之前逻辑一致）
    const content = response.content as string;
    const match = content.match(/\(([\s\S]*)\)/);
    if (!match) throw new Error("模型未按要求输出格式化数据");

    const fabricJson = JSON.parse(match[1].trim());
    return Response.json({ fabricJson });
  } catch (error: unknown) {
    console.error("Agent Error:", error);

    let message = "Internal Server Error";
    if (error instanceof Error) {
      message = error.message;
    }
    // 可选：处理字符串错误
    else if (typeof error === "string") {
      message = error;
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
