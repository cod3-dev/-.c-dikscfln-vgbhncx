const http = require("http");

const port = process.env.PORT || 4003;
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

function nowIso() {
  return new Date().toISOString();
}

let notificationSeq = 1;

/** @type {Map<string, any>} */
const notifications = new Map();

/**
 * Expected payload shape (flexible):
 * {
 *   type: "appointment.requested" | string,
 *   recipientId: string | null,
 *   actorId: string | null,
 *   title?: string,
 *   message?: string,
 *   entity?: { type: string, id: string },
 *   meta?: object
 * }
 */
function createNotification(payload) {
  const type = payload?.type || "notification";
  const recipientId = payload?.recipientId ?? null;
  const actorId = payload?.actorId ?? null;
  const title = payload?.title || "New notification";
  const message = payload?.message || "";
  const entity = payload?.entity ?? null;
  const meta = payload?.meta ?? null;

  const id = String(notificationSeq++);

  const notification = {
    id,
    type,
    recipientId,
    actorId,
    title,
    message,
    entity,
    meta,
    status: "unread",
    createdAt: nowIso(),
  };

  notifications.set(id, notification);
  return { notification };
}

function listNotifications(query) {
  // Query supports recipientId and status.
  const recipientId = query?.recipientId;
  const status = query?.status;

  const all = Array.from(notifications.values());
  return all
    .filter((n) => (recipientId ? String(n.recipientId) === String(recipientId) : true))
    .filter((n) => (status ? String(n.status) === String(status) : true))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function parsePathAndQuery(url) {
  const [path, queryString] = url.split("?");
  const query = {};

  if (queryString) {
    for (const part of queryString.split("&")) {
      const [k, v] = part.split("=");
      if (!k) continue;
      query[decodeURIComponent(k)] = v === undefined ? "" : decodeURIComponent(v);
    }
  }

  return { path, query };
}

const server = http.createServer(async (request, response) => {
  const method = request.method;
  const { path, query } = parsePathAndQuery(request.url);

  if (path === "/health" || path === "/api/health") {
    sendJson(response, 200, { status: "ok", service: "notification-service" });
    return;
  }

  if (path === "/api/notifications" && method === "POST") {
    try {
      const payload = await readJsonBody(request);
      const { notification } = createNotification(payload);
      sendJson(response, 201, notification);
    } catch (e) {
      sendJson(response, 400, { error: "invalid_json", message: e.message || "Invalid JSON" });
    }
    return;
  }

  if (path === "/api/notifications" && method === "GET") {
    const list = listNotifications(query);
    sendJson(response, 200, { notifications: list, count: list.length });
    return;
  }

  const idMatch = path.match(/^\/api\/notifications\/(\d+)$/);
  if (idMatch && method === "GET") {
    const id = idMatch[1];
    const n = notifications.get(id);
    if (!n) {
      sendJson(response, 404, { error: "not_found", message: "Notification not found" });
      return;
    }
    sendJson(response, 200, n);
    return;
  }

  const readMatch = path.match(/^\/api\/notifications\/(\d+)\/read$/);
  if (readMatch && method === "PATCH") {
    const id = readMatch[1];
    const n = notifications.get(id);
    if (!n) {
      sendJson(response, 404, { error: "not_found", message: "Notification not found" });
      return;
    }
    n.status = "read";
    notifications.set(id, n);
    sendJson(response, 200, n);
    return;
  }

  // Seed demo notifications for development
  if (path === "/api/notifications/seed" && method === "POST") {
    const seeds = [
      {
        type: "appointment.requested",
        recipientId: "patient-1",
        title: "Appointment requested",
        message: "Your appointment request was received for General Medicine.",
        entity: { type: "appointment", id: "demo-1" },
      },
      {
        type: "consultation.scheduled",
        recipientId: "patient-1",
        title: "Consultation scheduled",
        message: "Your consultation has been scheduled (video).",
        entity: { type: "consultation", id: "demo-1" },
        meta: { appointmentId: "demo-1", mode: "video" },
      },
      {
        type: "consultation.note.added",
        recipientId: "patient-1",
        actorId: "clinician-1",
        title: "New consultation note",
        message: "Clinician added: Patient stable, follow-up in 48 hours.",
        entity: { type: "consultation", id: "demo-1" },
        meta: { consultationId: "demo-1", authorRole: "clinician" },
      },
    ];
    const created = seeds.map((s) => createNotification(s).notification);
    sendJson(response, 201, { seeded: created.length, notifications: created });
    return;
  }

  sendJson(response, 404, { error: "not_found", message: "Endpoint not available." });
});

server.listen(port, host, () => {
  console.log(`Notification service running at http://${host}:${port}`);
});

