// MCP Streamable HTTP client for Canva
// Handles: initialize → list tools → call tools → agentic loop with Claude

const MCP_URL = "https://mcp.canva.com/mcp";

function getCanvaToken() {
  const token = process.env.CANVA_ACCESS_TOKEN;
  if (!token) throw new Error("CANVA_ACCESS_TOKEN is not set. Add it to your Vercel Environment Variables.");
  return token;
}

async function mcpRequest(method, params, sessionId) {
  const body = {
    jsonrpc: "2.0",
    method,
    id: Date.now(),
    ...(params ? { params } : {}),
  };

  const token = getCanvaToken();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Authorization: `Bearer ${token}`,
  };
  if (sessionId) {
    headers["Mcp-Session-Id"] = sessionId;
  }

  const res = await fetch(MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const newSessionId = res.headers.get("Mcp-Session-Id") || sessionId;
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("text/event-stream")) {
    const text = await res.text();
    const lines = text.split("\n");
    let lastData = null;
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        lastData = line.slice(6);
      }
    }
    if (lastData) {
      const parsed = JSON.parse(lastData);
      return { result: parsed.result, error: parsed.error, sessionId: newSessionId };
    }
    return { result: null, error: { message: "No data in SSE response" }, sessionId: newSessionId };
  }

  if (!res.ok) {
    const errText = await res.text();
    return { result: null, error: { message: `MCP HTTP ${res.status}: ${errText}` }, sessionId: newSessionId };
  }

  const json = await res.json();
  return { result: json.result, error: json.error, sessionId: newSessionId };
}

export async function createMCPSession() {
  const token = getCanvaToken();

  const init = await mcpRequest("initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "dreambound-pipeline", version: "1.0.0" },
  }, null);

  if (init.error) {
    throw new Error(`MCP initialize error: ${JSON.stringify(init.error)}`);
  }

  const sessionId = init.sessionId;

  // Send initialized notification
  await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Mcp-Session-Id": sessionId,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    }),
  });

  return sessionId;
}

export async function listTools(sessionId) {
  const { result, error } = await mcpRequest("tools/list", {}, sessionId);
  if (error) throw new Error(`MCP tools/list error: ${JSON.stringify(error)}`);
  return result.tools || [];
}

export async function callTool(sessionId, toolName, args) {
  const { result, error } = await mcpRequest("tools/call", {
    name: toolName,
    arguments: args,
  }, sessionId);
  if (error) throw new Error(`MCP tools/call error: ${JSON.stringify(error)}`);
  return result;
}

// Convert MCP tools to Claude API tools format
function mcpToolsToClaude(mcpTools) {
  return mcpTools.map((t) => ({
    name: t.name,
    description: t.description || "",
    input_schema: t.inputSchema || { type: "object", properties: {} },
  }));
}

// Run agentic loop: Claude decides which tools to call, we execute them via MCP
export async function runAgenticLoop({ client, model, maxTokens, system, userMessage, sessionId, mcpTools }) {
  const claudeTools = mcpToolsToClaude(mcpTools);

  let messages = [{ role: "user", content: userMessage }];

  const MAX_ITERATIONS = 25;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      tools: claudeTools,
      messages,
    });

    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    const textBlocks = response.content.filter((b) => b.type === "text");

    // If no tool calls or end_turn, we're done
    if (toolUseBlocks.length === 0 || response.stop_reason === "end_turn") {
      const finalText = textBlocks.length > 0 ? textBlocks[textBlocks.length - 1].text : null;
      return finalText;
    }

    // Execute each tool call via MCP
    const toolResults = [];
    for (const toolUse of toolUseBlocks) {
      try {
        const mcpResult = await callTool(sessionId, toolUse.name, toolUse.input);
        const resultText = (mcpResult.content || [])
          .map((c) => (c.type === "text" ? c.text : JSON.stringify(c)))
          .join("\n");
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: resultText,
        });
      } catch (err) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: `Error: ${err.message}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  }

  throw new Error("Agentic loop exceeded maximum iterations");
}
