import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const randomColorTool = tool(
  async () => {
    const colors = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#F333FF",
      "#FFF333",
      "#33FFF3",
    ];
    const picked = colors[Math.floor(Math.random() * colors.length)];
    console.log(`[工具执行] 随机选择了颜色: ${picked}`);
    return picked; // 返回给 AI 的结果
  },
  {
    name: "get_random_color",
    description:
      "当用户要求使用随机颜色、意想不到的颜色或随机换色时，调用此工具获取一个十六进制颜色码。",
    schema: z.object({}), // 无需参数
  },
);
