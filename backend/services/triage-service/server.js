const http = require("http");

const port = process.env.PORT || 4001;
const host = process.env.HOST || "0.0.0.0";

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";

    request.on("data", (chunk) => {
      raw += chunk.toString();
    });

    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

function buildTriageReply(messages, attachments) {
  const text = messages[messages.length - 1]?.content?.toLowerCase() || "";
  let urgency = "Moderate urgency";
  let route = "Telemedicine";
  let checklist = [
    "Capture the main symptom and any changes in breathing or consciousness.",
    "Keep the person comfortable and supported while you gather details.",
    "Prepare to escalate to emergency care if the condition worsens."
  ];

  if (/\b(choking|not breathing|unconscious|severe pain|bleeding|poison|burn|fracture|head injury)\b/.test(text)) {
    urgency = "High urgency";
    route = "Emergency transport";
    checklist = [
      "Call emergency services immediately or move the person to a safe area.",
      "Control heavy bleeding or stabilize the injured area without moving it unnecessarily.",
      "Monitor breathing and responsiveness while awaiting help."
    ];
  } else if (/\b(fever|cough|cold|sprain|minor pain|rash|nausea|diarrhea)\b/.test(text)) {
    urgency = "Lower urgency";
    route = "Telemedicine";
    checklist = [
      "Note the symptom duration and severity before follow-up.",
      "Offer fluids, rest, and home care while watching for worsening signs.",
      "Schedule a remote consult if symptoms persist or worsen."
    ];
  } else if (/\b(allergy|breathing difficulty|asthma|wheezing|anaphylaxis)\b/.test(text)) {
    urgency = "High urgency";
    route = "Emergency transport";
    checklist = [
      "Help with prescribed inhalers or epinephrine if available.",
      "Keep the airway clear and prepare to call for urgent help.",
      "Stay with the person until emergency responders arrive."
    ];
  }

  const reply = [
    `Urgency: ${urgency}`,
    "What To Do Now:",
    `1. ${checklist[0]}`,
    `2. ${checklist[1]}`,
    `3. ${checklist[2]}`,
    `Next Care Route: ${route}.`
  ].join("\n");

  const analyzedPhotos = attachments.filter((attachment) => attachment.kind === "photo" && attachment.dataUrl).length;
  const attachedVideos = attachments.filter((attachment) => attachment.kind === "video" && attachment.dataUrl).length;

  return {
    reply,
    model: "mock-triage-service",
    analyzedPhotos,
    attachedVideos
  };
}

const server = http.createServer(async (request, response) => {
  const { method, url } = request;

  if (url === "/api/triage-chat") {
    if (method !== "POST") {
      sendJson(response, 405, { error: "method_not_allowed" });
      return;
    }

    try {
      const payload = await readJsonBody(request);
      const messages = Array.isArray(payload.messages) ? payload.messages : [];
      const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];

      if (!messages.length || messages[messages.length - 1].role !== "user") {
        sendJson(response, 400, {
          error: "invalid_request",
          message: "The triage request must include at least one user message."
        });
        return;
      }

      sendJson(response, 200, buildTriageReply(messages, attachments));
    } catch (error) {
      sendJson(response, 400, {
        error: "invalid_json",
        message: error.message || "Invalid request payload."
      });
    }

    return;
  }

  if (url === "/health" || url === "/api/health") {
    sendJson(response, 200, { status: "ok", service: "triage-service" });
    return;
  }

  sendJson(response, 404, { error: "not_found", message: "Endpoint not available." });
});

server.listen(port, host, () => {
  console.log(`Triage service running at http://${host}:${port}`);
});
