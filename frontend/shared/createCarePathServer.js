const http = require("http");
const fs = require("fs");
const path = require("path");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

const TRIAGE_INSTRUCTIONS = [
  "You are CarePath AI Triage, a cautious first-response assistant for a healthcare response platform.",
  "You are not a replacement for emergency services or a clinician.",
  "Your job is to help a user describe what is happening, identify obvious urgent danger signs, and give practical next steps.",
  "Keep responses concise, calm, and easy to follow on mobile.",
  "Always state when the situation sounds like an emergency.",
  "If information is missing, ask at most two short follow-up questions and still give one immediate safety step.",
  "When enough information is available, structure the response with these headings exactly: Urgency, What To Do Now, Next Care Route.",
  "Under What To Do Now, give 2 to 4 numbered steps.",
  "Under Next Care Route, recommend one of: First Aid Hub, Facility Matching, Telemedicine, or Emergency transport.",
  "If the user attached an image, use it as supporting context.",
  "If the request mentions a video attachment, acknowledge it, but do not claim to have watched the full video unless the prompt explicitly includes extracted visual details."
].join(" ");

function loadDotEnv(projectRoot) {
  const envPath = path.join(projectRoot, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envLines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  envLines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      return;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendFile(filePath, response) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    response.end(data);
  });
}

function readJsonBody(request, maxBytes = 15 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    request.on("data", (chunk) => {
      size += chunk.length;

      if (size > maxBytes) {
        reject(new Error("Payload too large"));
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => {
      try {
        const body = chunks.length ? Buffer.concat(chunks).toString("utf8") : "{}";
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });

    request.on("error", (error) => {
      reject(error);
    });
  });
}

function extractOutputText(responsePayload) {
  if (typeof responsePayload.output_text === "string" && responsePayload.output_text.trim()) {
    return responsePayload.output_text.trim();
  }

  const parts = [];

  (responsePayload.output || []).forEach((item) => {
    if (item.type !== "message" || !Array.isArray(item.content)) {
      return;
    }

    item.content.forEach((contentItem) => {
      if (contentItem.type === "output_text" && typeof contentItem.text === "string") {
        parts.push(contentItem.text.trim());
      }
    });
  });

  return parts.filter(Boolean).join("\n\n").trim();
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .map((message) => ({
      role: message.role,
      text: typeof message.text === "string" ? message.text.trim() : ""
    }))
    .filter((message) => message.text)
    .slice(-12);
}

function sanitizeAttachments(attachments) {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments
    .filter((attachment) => attachment && (attachment.kind === "photo" || attachment.kind === "video"))
    .map((attachment) => ({
      kind: attachment.kind,
      name: typeof attachment.name === "string" ? attachment.name.trim() : attachment.kind,
      dataUrl: typeof attachment.dataUrl === "string" ? attachment.dataUrl : null
    }))
    .slice(0, 4);
}

function buildOpenAIInput(messages, attachments) {
  return messages.map((message, index) => {
    const content = [{ type: "input_text", text: message.text }];
    const isLatestUserMessage = message.role === "user" && index === messages.length - 1;

    if (isLatestUserMessage) {
      attachments
        .filter((attachment) => attachment.kind === "photo" && attachment.dataUrl)
        .slice(0, 2)
        .forEach((attachment) => {
          content.push({
            type: "input_image",
            image_url: attachment.dataUrl,
            detail: "auto"
          });
        });

      const videoAttachments = attachments.filter((attachment) => attachment.kind === "video");
      if (videoAttachments.length) {
        content.push({
          type: "input_text",
          text: `The user also attached ${videoAttachments.length} video file(s): ${videoAttachments.map((item) => item.name).join(", ")}. Treat them as referenced handoff material, not directly-viewed content.`
        });
      }
    }

    return {
      role: message.role,
      content
    };
  });
}

async function createTriageReply({ messages, attachments }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      status: 503,
      body: {
        error: "missing_api_key",
        message: "OPENAI_API_KEY is not set. Add it to your environment or .env file to enable live AI triage."
      }
    };
  }

  const model = process.env.OPENAI_TRIAGE_MODEL || "gpt-5-mini";
  const input = buildOpenAIInput(messages, attachments);

  const upstreamResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions: TRIAGE_INSTRUCTIONS,
      max_output_tokens: 500,
      input
    })
  });

  const upstreamBody = await upstreamResponse.json().catch(() => ({}));

  if (!upstreamResponse.ok) {
    const message =
      typeof upstreamBody.error?.message === "string"
        ? upstreamBody.error.message
        : "OpenAI request failed.";

    return {
      status: upstreamResponse.status,
      body: {
        error: "openai_error",
        message
      }
    };
  }

  const reply = extractOutputText(upstreamBody);

  return {
    status: 200,
    body: {
      reply: reply || "I could not generate a triage reply for that message.",
      model,
      analyzedPhotos: attachments.filter((attachment) => attachment.kind === "photo" && attachment.dataUrl).length,
      attachedVideos: attachments.filter((attachment) => attachment.kind === "video").length
    }
  };
}

function createCarePathServer({ rootDir, defaultPort, appLabel }) {
  const port = process.env.PORT || defaultPort;
  const projectRoot = path.resolve(rootDir, "..", "..");

  loadDotEnv(projectRoot);

  const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url, "http://localhost");

    if (requestUrl.pathname === "/api/triage-chat") {
      if (request.method !== "POST") {
        sendJson(response, 405, { error: "method_not_allowed" });
        return;
      }

      try {
        const payload = await readJsonBody(request);
        const messages = sanitizeMessages(payload.messages);
        const attachments = sanitizeAttachments(payload.attachments);

        if (!messages.length || messages[messages.length - 1].role !== "user") {
          sendJson(response, 400, {
            error: "invalid_request",
            message: "The triage request must include at least one user message."
          });
          return;
        }

        const triageResponse = await createTriageReply({ messages, attachments });
        sendJson(response, triageResponse.status, triageResponse.body);
      } catch (error) {
        sendJson(response, 500, {
          error: "triage_server_error",
          message: error.message || "Unexpected triage server error."
        });
      }
      return;
    }

    const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(rootDir, safePath);

    if (!filePath.startsWith(rootDir)) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    sendFile(filePath, response);
  });

  server.listen(port, () => {
    console.log(`African Healthcare ${appLabel} app running at http://localhost:${port}`);
  });
}

module.exports = { createCarePathServer };
