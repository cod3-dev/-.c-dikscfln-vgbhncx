const http = require("http");

const port = process.env.PORT || 4002;

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4003";
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

function postNotification(payload) {
  return new Promise((resolve) => {
    try {
      const body = JSON.stringify(payload || {});
      const url = new URL(NOTIFICATION_SERVICE_URL);

      const req = http.request(
        {
          method: "POST",
          hostname: url.hostname,
          port: url.port || 80,
          path: "/api/notifications",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": Buffer.byteLength(body),
          },
        },
        (res) => {
          // Drain response
          res.on("data", () => {});
          res.on("end", () => resolve());
        }
      );

      req.on("error", () => resolve());
      req.write(body);
      req.end();
    } catch (e) {
      resolve();
    }
  });
}

let appointmentSeq = 1;
let consultationSeq = 1;

/** @type {Map<string, any>} */
const appointments = new Map();
/** @type {Map<string, any>} */
const consultations = new Map();

function createAppointment(payload) {
  const patientId = payload?.patientId;
  const requestedSpecialty = payload?.requestedSpecialty || "General Medicine";
  const symptoms = payload?.symptoms || "";
  const requestedAt = payload?.requestedAt || nowIso();

  if (!patientId) {
    return { error: "invalid_request", message: "patientId is required" };
  }

  const id = String(appointmentSeq++);
  const appointment = {
    id,
    patientId,
    requestedSpecialty,
    symptoms,
    status: "requested",
    requestedAt,
    createdAt: nowIso(),
  };

  appointments.set(id, appointment);

  postNotification({
    type: "appointment.requested",
    recipientId: patientId,
    actorId: payload?.actorId ?? null,
    title: "Appointment requested",
    message: `Your appointment request was received for ${requestedSpecialty}.`,
    entity: { type: "appointment", id },
    meta: { requestedAt },
  });

  return { appointment };
}

function getAppointment(id) {
  return appointments.get(id) || null;
}

function createConsultation(payload) {
  const appointmentId = payload?.appointmentId;
  const clinicianId = payload?.clinicianId || null;
  const mode = payload?.mode || "video";

  if (!appointmentId) {
    return { error: "invalid_request", message: "appointmentId is required" };
  }

  const appt = appointments.get(String(appointmentId));
  if (!appt) {
    return { error: "not_found", message: "Appointment not found" };
  }

  const id = String(consultationSeq++);
  const consultation = {
    id,
    appointmentId: String(appointmentId),
    clinicianId,
    mode,
    status: "scheduled",
    notes: [],
    createdAt: nowIso(),
  };

  consultations.set(id, consultation);
  appt.status = "consultation_scheduled";
  appointments.set(appt.id, appt);

  postNotification({
    type: "consultation.scheduled",
    recipientId: appt.patientId,
    actorId: payload?.actorId ?? null,
    title: "Consultation scheduled",
    message: `Your consultation has been scheduled (${mode}).`,
    entity: { type: "consultation", id },
    meta: { appointmentId: String(appointmentId), mode },
  });

  return { consultation };
}

function appendConsultationNotes(id, payload) {
  const consultation = consultations.get(String(id));
  if (!consultation) {
    return { error: "not_found", message: "Consultation not found" };
  }

  const message = payload?.message;
  const authorRole = payload?.authorRole || "patient"; // patient/clinician/system
  const authorId = payload?.authorId || null;

  if (!message || typeof message !== "string") {
    return { error: "invalid_request", message: "message must be a string" };
  }

  const note = {
    at: nowIso(),
    authorRole,
    authorId,
    message,
  };

  consultation.notes.push(note);
  consultations.set(consultation.id, consultation);

  // Best-effort: notify about new notes.
  // We don't have appointment/patientId in this function, so we notify "unknown" recipient.
  postNotification({
    type: "consultation.note.added",
    recipientId: null,
    actorId: authorId,
    title: "New consultation note",
    message,
    entity: { type: "consultation", id },
    meta: { consultationId: String(id), authorRole },
  });

  return { consultation };
}

function parsePath(url) {
  const [path] = url.split("?");
  return path;
}

const server = http.createServer(async (request, response) => {
  const method = request.method;
  const path = parsePath(request.url);

  // Health
  if (path === "/health" || path === "/api/health") {
    sendJson(response, 200, { status: "ok", service: "telemedicine-service" });
    return;
  }

  // Appointments
  if (path === "/api/telemedicine/appointments" && method === "POST") {
    try {
      const payload = await readJsonBody(request);
      const result = createAppointment(payload);
      if (result.error) {
        sendJson(response, 400, result);
        return;
      }
      sendJson(response, 201, result.appointment);
    } catch (e) {
      sendJson(response, 400, { error: "invalid_json", message: e.message || "Invalid JSON" });
    }
    return;
  }

  const apptMatch = path.match(/^\/api\/telemedicine\/appointments\/(\d+)$/);
  if (apptMatch && method === "GET") {
    const id = apptMatch[1];
    const appt = getAppointment(id);
    if (!appt) {
      sendJson(response, 404, { error: "not_found", message: "Appointment not found" });
      return;
    }
    sendJson(response, 200, appt);
    return;
  }

  // Consultations
  if (path === "/api/telemedicine/consultations" && method === "POST") {
    try {
      const payload = await readJsonBody(request);
      const result = createConsultation(payload);
      if (result.error) {
        const status = result.error === "not_found" ? 404 : 400;
        sendJson(response, status, result);
        return;
      }
      sendJson(response, 201, result.consultation);
    } catch (e) {
      sendJson(response, 400, { error: "invalid_json", message: e.message || "Invalid JSON" });
    }
    return;
  }

  const consultNotesMatch = path.match(/^\/api\/telemedicine\/consultations\/(\d+)\/notes$/);
  if (consultNotesMatch && method === "POST") {
    try {
      const id = consultNotesMatch[1];
      const payload = await readJsonBody(request);
      const result = appendConsultationNotes(id, payload);
      if (result.error) {
        const status = result.error === "not_found" ? 404 : 400;
        sendJson(response, status, result);
        return;
      }
      sendJson(response, 200, result.consultation);
    } catch (e) {
      sendJson(response, 400, { error: "invalid_json", message: e.message || "Invalid JSON" });
    }
    return;
  }

  sendJson(response, 404, { error: "not_found", message: "Endpoint not available." });
});

server.listen(port, host, () => {
  console.log(`Telemedicine service running at http://${host}:${port}`);
});

