import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are a Fabric.js 6.x shape generation assistant. Generate valid Fabric.js canvas JSON based on user descriptions.

## Output Rules
1. Output ONLY a JSON code block wrapped in \`\`\`json ... \`\`\`, nothing else
2. JSON must contain "version", "objects" and "background" fields
3. Use reasonable canvas coordinates (canvas is ~1200x800), place shapes in center area
4. Use beautiful, coordinated colors - avoid plain black/white

## Fabric.js Object Reference

Rect: {"type":"Rect","left":100,"top":100,"width":200,"height":150,"fill":"#4A90D9","stroke":"#2C5F8A","strokeWidth":2,"rx":0,"ry":0}
Circle: {"type":"Circle","left":300,"top":200,"radius":80,"fill":"#E74C3C","stroke":"#C0392B","strokeWidth":2}
Ellipse: {"type":"Ellipse","left":200,"top":150,"rx":120,"ry":60,"fill":"#2ECC71","stroke":"#27AE60","strokeWidth":2}
Triangle: {"type":"Triangle","left":400,"top":100,"width":150,"height":130,"fill":"#F39C12","stroke":"#E67E22","strokeWidth":2}
Line: {"type":"Line","x1":0,"y1":0,"x2":200,"y2":0,"left":100,"top":300,"stroke":"#333","strokeWidth":2}
Textbox: {"type":"Textbox","left":200,"top":50,"width":300,"text":"Hello","fontSize":24,"fontWeight":"bold","fill":"#333","textAlign":"center"}
Polygon: {"type":"Polygon","points":[{"x":0,"y":-50},{"x":47,"y":-15},{"x":29,"y":40},{"x":-29,"y":40},{"x":-47,"y":-15}],"left":300,"top":300,"fill":"#9B59B6","stroke":"#8E44AD","strokeWidth":2}
Path: {"type":"Path","path":[["M",0,0],["L",100,0],["L",100,100],["Z"]],"left":100,"top":100,"fill":"#3498DB","stroke":"#2980B9","strokeWidth":2}

## Example

User: "Draw a blue card with a title"

\`\`\`json
{"version":"6.7.1","objects":[{"type":"Rect","left":400,"top":250,"width":300,"height":200,"fill":"#EBF5FB","stroke":"#3498DB","strokeWidth":2,"rx":12,"ry":12},{"type":"Textbox","left":420,"top":270,"width":260,"text":"Card Title","fontSize":22,"fontWeight":"bold","fill":"#2C3E50","textAlign":"left"},{"type":"Line","x1":0,"y1":0,"x2":260,"y2":0,"left":420,"top":310,"stroke":"#3498DB","strokeWidth":1},{"type":"Textbox","left":420,"top":325,"width":260,"text":"Card content here","fontSize":14,"fill":"#7F8C8D","textAlign":"left"}],"background":"#f0f0f0"}
\`\`\`

## Important
- ONLY output the JSON code block, absolutely NO other text before or after
- Keep background "#f0f0f0" unless user asks to change
- Ensure shapes have reasonable spacing, no overlapping
- If user says "modify" or "based on existing", modify provided data; otherwise generate new
- Respond in the user's language for text content in shapes`;

const API_URL = "https://api-inference.modelscope.cn/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    const { metadata, description, history } = await request.json();

    // Build messages array
    const messages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    // Build user message
    let userContent = description;
    if (metadata && metadata.objects && metadata.objects.length > 0) {
      userContent =
        "Current canvas (" +
        metadata.objects.length +
        " objects):\n" +
        JSON.stringify(metadata) +
        "\n\nRequest: " +
        description;
    }
    messages.push({ role: "user", content: userContent });

    // Call ModelScope API directly
    const requestBody = {
      model: "Qwen/Qwen3-32B",
      messages,
      temperature: 0.3,
      max_tokens: 4096,
      enable_thinking: false,
    };

    console.log("API request - model:", requestBody.model);
    console.log("API request - messages count:", messages.length);
    console.log("API request - API key present:", !!process.env.API_KEY);
    console.log("API request - first message role:", messages[0]?.role);

    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error("API error:", apiResponse.status, errText);
      throw new Error("API returned " + apiResponse.status + ": " + errText.substring(0, 200));
    }

    const apiResult = await apiResponse.json();

    // Log full API response for debugging
    console.log("Full API response:", JSON.stringify(apiResult).substring(0, 2000));
    const msg = apiResult.choices?.[0]?.message;
    console.log("API response message keys:", msg ? Object.keys(msg) : "no message");
    console.log("API response message:", JSON.stringify(msg)?.substring(0, 1000));

    // Qwen3 thinking mode: actual content may be in `content` after thinking,
    // or the thinking might be in `reasoning_content` with actual output in `content`
    const content: string = msg?.content || "";
    const reasoning: string = msg?.reasoning_content || "";

    console.log("Content length:", content.length, "Reasoning length:", reasoning.length);
    if (content) {
      console.log("Content (first 500):", content.substring(0, 500));
    }
    if (reasoning && !content) {
      console.log("Reasoning (first 500):", reasoning.substring(0, 500));
    }

    if (!content) {
      throw new Error(
        "Model returned empty content. Full message: " +
          JSON.stringify(msg)?.substring(0, 500)
      );
    }

    // Parse output - try multiple formats
    let fabricJson: any = null;

    // 1. Match ```json code block
    const codeBlockMatch = content.match(
      /```(?:json)?\s*\n?([\s\S]*?)\n?```/
    );
    if (codeBlockMatch) {
      try {
        fabricJson = JSON.parse(codeBlockMatch[1].trim());
      } catch (e) {
        console.warn("Code block JSON parse failed:", e);
      }
    }

    // 2. Fallback: match ( ) wrapped (legacy)
    if (!fabricJson) {
      const parenMatch = content.match(/\(([\s\S]*)\)/);
      if (parenMatch) {
        try {
          fabricJson = JSON.parse(parenMatch[1].trim());
        } catch {
          // skip
        }
      }
    }

    // 3. Last fallback: find raw JSON with "objects"
    if (!fabricJson) {
      const jsonMatch = content.match(/\{[\s\S]*"objects"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          fabricJson = JSON.parse(jsonMatch[0]);
        } catch {
          // skip
        }
      }
    }

    if (!fabricJson) {
      throw new Error(
        "Failed to parse Fabric.js JSON from model output: " +
          content.substring(0, 300)
      );
    }

    // Ensure basic structure
    if (!fabricJson.objects) {
      fabricJson = {
        version: "6.7.1",
        objects: [fabricJson],
        background: "#f0f0f0",
      };
    }
    if (!fabricJson.background) {
      fabricJson.background = "#f0f0f0";
    }

    return Response.json({
      fabricJson,
      aiMessage: "Generated and updated on canvas",
    });
  } catch (error: unknown) {
    console.error("generateChart error:", error);

    let message = "Internal Server Error";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
