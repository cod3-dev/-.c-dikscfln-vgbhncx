const revealItems = document.querySelectorAll(".reveal");
const tiltItems = document.querySelectorAll(".hover-tilt");
const themeToggle = document.querySelector("#theme-toggle");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsTilt =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !prefersReducedMotion;

function animateCount(element, target, duration = 1200) {
  if (!element) return;

  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased).toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
}

function startTicker(element, base) {
  if (!element) return;

  let currentValue = base;

  window.setInterval(() => {
    currentValue += Math.random() < 0.5 ? 1 : -1;
    currentValue = Math.max(base - 8, Math.min(base + 8, currentValue));
    element.textContent = `${currentValue.toLocaleString()} active care handoffs`;
  }, 3200);
}

const navBadge = document.querySelector(".nav-badge");
if (navBadge) {
  navBadge.innerHTML = '<span class="live-dot" aria-hidden="true"></span>Emergency Live';
}

const themeStorageKey = "carepath-theme-v2";

function getInitialTheme() {
  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }
  } catch (error) {
    // Ignore localStorage access problems.
  }

  return "dark";
}

function setTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);

  if (themeToggle) {
    themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Enable light mode" : "Enable dark mode");
    themeToggle.classList.toggle("is-active", isDark);
  }

  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch (error) {
    // Ignore localStorage access problems.
  }
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${index * 70}ms`;
  revealObserver.observe(item);
});

const consoleSection = document.querySelector(".console-section");
const countEls = document.querySelectorAll(".count-grid strong");
const countTargets = [6, 22, 0, 45];

if (consoleSection && countEls.length) {
  let countersAnimated = false;
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || countersAnimated) return;

        countersAnimated = true;
        countEls.forEach((element, index) => {
          animateCount(element, countTargets[index] || 0);
        });
        counterObserver.disconnect();
      });
    },
    { threshold: 0.3 }
  );

  counterObserver.observe(consoleSection);
}

const heroSection = document.querySelector(".hero-section");
const handoffEl = document.querySelector(".hero-panel h2");
const handoffBase = 1248;

if (heroSection && handoffEl) {
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(handoffEl, handoffBase, 1600);
        window.setTimeout(() => startTicker(handoffEl, handoffBase), 1700);
        heroObserver.disconnect();
      });
    },
    { threshold: 0.4 }
  );

  heroObserver.observe(heroSection);
}

setTheme(getInitialTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    setTheme(nextTheme);
  });
}

if (supportsTilt) {
  tiltItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 6;
      const rotateX = (0.5 - y) * 5;

      item.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      item.classList.add("is-tilting");
    });

    item.addEventListener("pointerleave", () => {
      item.style.transform = "";
      item.classList.remove("is-tilting");
    });
  });
}

const triageLauncher = document.querySelector("#ai-triage");
const triagePanel = document.querySelector("#triage-chat");
const triageLog = document.querySelector("#triage-chat-log");
const triageStatus = document.querySelector("#triage-chat-status");
const triageQuickActions = document.querySelector("#triage-quick-actions");
const triageForm = document.querySelector("#triage-chat-form");
const triageInput = document.querySelector("#triage-chat-input");
const triageReset = document.querySelector("#triage-reset");
const triagePhotoInput = document.querySelector("#triage-photo-input");
const triageVideoInput = document.querySelector("#triage-video-input");
const triageMediaStatus = document.querySelector("#triage-media-status");
const triageMediaPreview = document.querySelector("#triage-media-preview");

const starterChoices = [
  { type: "prompt", label: "Bleeding", prompt: "I need triage help for bleeding." },
  { type: "prompt", label: "Burn", prompt: "I need triage help for a burn." },
  { type: "prompt", label: "Fracture", prompt: "I need triage help for a suspected fracture." },
  { type: "prompt", label: "Choking", prompt: "I need triage help for choking." },
  { type: "prompt", label: "Breathing", prompt: "I need triage help for breathing difficulty." },
  { type: "prompt", label: "Fever", prompt: "I need triage help for fever or flu symptoms." }
];

const followUpChoices = [
  { type: "action", value: "restart", label: "Start over" },
  { type: "target", value: "#first-aid-console", label: "First Aid Hub" },
  { type: "target", value: "#matching", label: "Facility Matching" },
  { type: "target", value: "#telemedicine", label: "Telemedicine" }
];

const triageState = {
  active: false,
  pending: false,
  messages: [],
  attachments: []
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entityMap[character];
  });
}

function formatTextAsHtml(text) {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function scrollToElement(element) {
  if (!element) return;

  element.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start"
  });
}

function formatFileSize(size) {
  if (!size || size < 1024 * 1024) {
    return `${Math.max(1, Math.round((size || 0) / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function describeTriageMedia() {
  if (!triageState.attachments.length) {
    return "No media attached";
  }

  const counts = triageState.attachments.reduce(
    (summary, attachment) => {
      summary[attachment.kind] += 1;
      return summary;
    },
    { photo: 0, video: 0 }
  );

  const parts = [];
  if (counts.photo) {
    parts.push(`${counts.photo} photo${counts.photo > 1 ? "s" : ""}`);
  }
  if (counts.video) {
    parts.push(`${counts.video} video${counts.video > 1 ? "s" : ""}`);
  }

  return parts.join(" and ");
}

function clearTriageMedia() {
  triageState.attachments.forEach((attachment) => {
    if (attachment.previewUrl) {
      window.URL.revokeObjectURL(attachment.previewUrl);
    }
  });

  triageState.attachments = [];
}

function getQuickChoices() {
  if (!triageState.messages.length) {
    return starterChoices;
  }

  return [...starterChoices, ...followUpChoices];
}

function getTriageStatusText() {
  if (triageState.pending) {
    return "CarePath AI is reviewing the case now.";
  }

  if (!triageState.messages.length) {
    return "Ready to start. Tap the AI Triage card or type the problem below.";
  }

  return "Live GPT triage is active. Add more detail or choose the next route.";
}

function renderTriageMedia() {
  if (!triageMediaStatus || !triageMediaPreview) return;

  if (!triageState.attachments.length) {
    triageMediaStatus.textContent = "No photo or video attached yet. On mobile, this can open the camera directly.";
    triageMediaPreview.innerHTML = "";
    return;
  }

  const photoCount = triageState.attachments.filter((attachment) => attachment.kind === "photo" && attachment.dataUrl).length;
  const videoCount = triageState.attachments.filter((attachment) => attachment.kind === "video").length;

  triageMediaStatus.textContent =
    `${describeTriageMedia()} attached for this triage session. ` +
    `${photoCount ? "Photos will be included in the live AI review. " : ""}` +
    `${videoCount ? "Videos stay linked locally for handoff context." : ""}`.trim();

  triageMediaPreview.innerHTML = triageState.attachments
    .map((attachment) => {
      const mediaMarkup = attachment.kind === "photo"
        ? `<img src="${attachment.previewUrl}" alt="${escapeHtml(attachment.name)}" />`
        : `<video src="${attachment.previewUrl}" controls preload="metadata" playsinline></video>`;

      return `
        <article class="triage-media-card">
          <div class="triage-media-thumb">${mediaMarkup}</div>
          <div class="triage-media-copy">
            <strong>${attachment.kind === "photo" ? "Photo evidence" : "Video handoff"}</strong>
            <span>${escapeHtml(attachment.name)}</span>
            <span>${formatFileSize(attachment.size)}</span>
          </div>
          <button class="triage-media-remove" type="button" data-triage-media-remove="${attachment.id}">Remove</button>
        </article>
      `;
    })
    .join("");
}

function renderTriage() {
  if (!triagePanel || !triageLog || !triageQuickActions || !triageStatus) return;

  const isAwake = triageState.active || triageState.messages.length > 0;
  triagePanel.classList.toggle("is-awake", isAwake);

  if (triageLauncher) {
    triageLauncher.classList.toggle("is-active", isAwake);
    triageLauncher.setAttribute("aria-expanded", String(isAwake));
  }

  triageStatus.textContent = getTriageStatusText();

  if (!triageState.messages.length) {
    triageLog.innerHTML = `
      <article class="triage-message assistant">
        <strong>CarePath AI</strong>
        <p>Describe what is happening and I will use live GPT triage to guide the next safe steps.</p>
      </article>
    `;
  } else {
    triageLog.innerHTML = triageState.messages
      .map(
        (message) => `
          <article class="triage-message ${message.role}">
            <strong>${message.role === "assistant" ? "CarePath AI" : "You"}</strong>
            ${message.html}
          </article>
        `
      )
      .join("");
  }

  triageQuickActions.innerHTML = getQuickChoices()
    .map((choice) => {
      if (choice.type === "target") {
        return `<button class="triage-chip triage-chip-secondary" type="button" data-triage-target="${choice.value}">${choice.label}</button>`;
      }

      if (choice.type === "action") {
        return `<button class="triage-chip triage-chip-secondary" type="button" data-triage-action="${choice.value}">${choice.label}</button>`;
      }

      return `<button class="triage-chip" type="button" data-triage-prompt="${escapeHtml(choice.prompt)}">${choice.label}</button>`;
    })
    .join("");

  renderTriageMedia();
  triageLog.scrollTop = triageLog.scrollHeight;
}

function appendMessage(role, text) {
  triageState.messages.push({
    role,
    text,
    html: formatTextAsHtml(text)
  });
}

function openTriagePanel({ reset = false, focus = true } = {}) {
  triageState.active = true;

  if (reset) {
    triageState.pending = false;
    triageState.messages = [];
    clearTriageMedia();
  }

  renderTriage();
  scrollToElement(triagePanel);

  if (focus && triageInput) {
    window.setTimeout(() => triageInput.focus(), prefersReducedMotion ? 0 : 220);
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

async function attachTriageMedia(file, kind) {
  if (!file) return;

  triageState.active = true;

  const previewUrl = window.URL.createObjectURL(file);
  let dataUrl = null;

  if (kind === "photo") {
    dataUrl = await readFileAsDataUrl(file);
  }

  triageState.attachments
    .filter((attachment) => attachment.kind === kind)
    .forEach((attachment) => {
      if (attachment.previewUrl) {
        window.URL.revokeObjectURL(attachment.previewUrl);
      }
    });

  triageState.attachments = [
    ...triageState.attachments.filter((attachment) => attachment.kind !== kind),
    {
      id: `${kind}-${Date.now()}`,
      kind,
      name: file.name || (kind === "photo" ? "captured-photo" : "captured-video"),
      size: file.size || 0,
      previewUrl,
      dataUrl
    }
  ];

  if (kind === "photo") {
    appendMessage("assistant", "Photo attached. It will be included in the live AI triage review.");
  } else {
    appendMessage("assistant", "Video attached. It will stay linked for handoff context while the live AI reviews text and any attached photos.");
  }

  renderTriage();
  scrollToElement(triagePanel);
}

async function requestTriageReply() {
  const response = await fetch("/api/triage-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: triageState.messages.map((message) => ({
        role: message.role,
        text: message.text
      })),
      attachments: triageState.attachments.map((attachment) => ({
        kind: attachment.kind,
        name: attachment.name,
        dataUrl: attachment.dataUrl
      }))
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = typeof payload.message === "string"
      ? payload.message
      : "Live AI triage is not available right now.";

    throw new Error(errorMessage);
  }

  return payload;
}

async function sendTriageMessage(text) {
  const value = text.trim();
  if (!value || triageState.pending) return;

  triageState.active = true;
  appendMessage("user", value);
  triageState.pending = true;
  renderTriage();

  try {
    const payload = await requestTriageReply();
    let assistantReply = payload.reply || "I could not generate a triage response for that message.";

    if (payload.attachedVideos) {
      assistantReply += `\n\nNote: ${payload.attachedVideos} video attachment(s) remain linked locally for handoff context in this workflow.`;
    }

    appendMessage("assistant", assistantReply);
  } catch (error) {
    appendMessage("assistant", `Live AI triage is unavailable right now.\n\n${error.message}`);
  } finally {
    triageState.pending = false;
    renderTriage();
  }
}

if (triageLauncher) {
  triageLauncher.addEventListener("click", () => {
    openTriagePanel();
  });

  triageLauncher.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openTriagePanel();
  });
}

if (triageForm) {
  triageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!triageInput) return;

    const value = triageInput.value;
    triageInput.value = "";
    await sendTriageMessage(value);
    triageInput.focus();
  });
}

if (triageQuickActions) {
  triageQuickActions.addEventListener("click", async (event) => {
    const promptButton = event.target.closest("[data-triage-prompt]");
    if (promptButton) {
      await sendTriageMessage(promptButton.dataset.triagePrompt || "");
      return;
    }

    const actionButton = event.target.closest("[data-triage-action]");
    if (actionButton && actionButton.dataset.triageAction === "restart") {
      openTriagePanel({ reset: true });
      return;
    }

    const targetButton = event.target.closest("[data-triage-target]");
    if (targetButton) {
      const target = document.querySelector(targetButton.dataset.triageTarget);
      scrollToElement(target);
    }
  });
}

if (triageReset) {
  triageReset.addEventListener("click", () => {
    openTriagePanel({ reset: true });
  });
}

if (triageMediaPreview) {
  triageMediaPreview.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-triage-media-remove]");
    if (!removeButton) return;

    const mediaToRemove = triageState.attachments.find(
      (attachment) => attachment.id === removeButton.dataset.triageMediaRemove
    );

    if (!mediaToRemove) return;

    if (mediaToRemove.previewUrl) {
      window.URL.revokeObjectURL(mediaToRemove.previewUrl);
    }

    triageState.attachments = triageState.attachments.filter(
      (attachment) => attachment.id !== mediaToRemove.id
    );

    renderTriage();
  });
}

if (triagePhotoInput) {
  triagePhotoInput.addEventListener("change", async (event) => {
    const file = event.currentTarget.files && event.currentTarget.files[0];
    await attachTriageMedia(file, "photo");
    event.currentTarget.value = "";
  });
}

if (triageVideoInput) {
  triageVideoInput.addEventListener("change", async (event) => {
    const file = event.currentTarget.files && event.currentTarget.files[0];
    await attachTriageMedia(file, "video");
    event.currentTarget.value = "";
  });
}

renderTriage();

async function getFollowUpNotifications() {
  try {
    const res = await fetch("http://localhost:4003/api/notifications?status=unread", { method: "GET" });

    if (!res.ok) return [];

    const payload = await res.json().catch(() => ({}));
    const notifications = Array.isArray(payload?.notifications) ? payload.notifications : [];

    const followUpTypes = new Set([
      "consultation.note.added",
      "consultation.scheduled",
      "appointment.requested",
    ]);

    return notifications.filter((n) => followUpTypes.has(n.type));
  } catch (e) {
    return [];
  }
}

async function seedDemoEvents() {
  // 1. Create an appointment via telemedicine-service (fires appointment.requested notification)
  const apptRes = await fetch("http://localhost:4002/api/telemedicine/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId: "patient-1", requestedSpecialty: "General Medicine", symptoms: "Follow-up check" }),
  }).catch(() => null);

  if (apptRes && apptRes.ok) {
    const appt = await apptRes.json().catch(() => null);
    if (appt?.id) {
      // 2. Schedule a consultation (fires consultation.scheduled notification)
      const consultRes = await fetch("http://localhost:4002/api/telemedicine/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appt.id, mode: "video", clinicianId: "clinician-1" }),
      }).catch(() => null);

      if (consultRes && consultRes.ok) {
        const consult = await consultRes.json().catch(() => null);
        if (consult?.id) {
          // 3. Add a clinician note (fires consultation.note.added notification)
          await fetch(`http://localhost:4002/api/telemedicine/consultations/${consult.id}/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Patient stable, follow-up in 48 hours.", authorRole: "clinician", authorId: "clinician-1" }),
          }).catch(() => null);
        }
      }
    }
  } else {
    // telemedicine unreachable — fall back to direct seed on notification-service
    await fetch("http://localhost:4003/api/notifications/seed", { method: "POST" }).catch(() => null);
  }
}

async function markNotificationRead(id) {
  await fetch(`http://localhost:4003/api/notifications/${id}/read`, { method: "PATCH" }).catch(() => null);
}

function ensureFollowUpPanel() {
  let panel = document.querySelector("#follow-up-sidepanel");
  if (panel) return panel;

  panel = document.createElement("aside");
  panel.id = "follow-up-sidepanel";
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = `
    <div class="follow-up-panel-inner">
      <div class="follow-up-panel-head">
        <div>
          <p class="panel-kicker">Follow-Up</p>
          <h3 style="margin: 0;">Care follow-ups</h3>
        </div>
        <button type="button" class="ghost-button small-button" id="follow-up-close" aria-label="Close follow-up panel">Close</button>
      </div>
      <div class="follow-up-panel-body" id="follow-up-panel-body"></div>
    </div>
  `;
  document.body.appendChild(panel);

  const style = document.createElement("style");
  style.textContent = `
    #follow-up-sidepanel{
      position: fixed;
      top: 0;
      right: -420px;
      width: 420px;
      height: 100vh;
      background: rgba(15, 18, 26, 0.98);
      color: #fff;
      border-left: 1px solid rgba(255,255,255,0.12);
      z-index: 9999;
      transition: right 180ms ease;
      overflow: auto;
      padding: 16px;
    }
    body.dark-mode #follow-up-sidepanel{ background: rgba(12, 14, 20, 0.98); }
    #follow-up-sidepanel.is-open{ right: 0; }
    .follow-up-panel-inner{ display:flex; flex-direction:column; gap: 12px; }
    .follow-up-panel-head{ display:flex; align-items:flex-start; justify-content:space-between; gap: 12px; }
    .follow-up-empty{ padding: 14px; border: 1px dashed rgba(255,255,255,0.25); border-radius: 12px; opacity: 0.9; }
    .follow-up-item{ padding: 12px; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; margin-bottom: 10px; background: rgba(255,255,255,0.04); }
    .follow-up-item small{ opacity: 0.75; }
    #follow-up-close{ white-space: nowrap; }
  `;
  document.head.appendChild(style);

  const closeBtn = panel.querySelector("#follow-up-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeFollowUpPanel());
  }

  return panel;
}

function openFollowUpPanel() {
  const panel = ensureFollowUpPanel();
  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
}

function closeFollowUpPanel() {
  const panel = document.querySelector("#follow-up-sidepanel");
  if (!panel) return;
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
}

async function renderFollowUpPanel() {
  const panel = ensureFollowUpPanel();
  const bodyEl = panel.querySelector("#follow-up-panel-body");
  if (!bodyEl) return;

  openFollowUpPanel();
  bodyEl.innerHTML = `<p style="opacity:0.8; margin:0;">Loading follow-ups…</p>`;

  let followUps = await getFollowUpNotifications();

  if (!followUps.length) {
    bodyEl.innerHTML = `<p style="opacity:0.8; margin:0;">Seeding demo events…</p>`;
    await seedDemoEvents();
    followUps = await getFollowUpNotifications();
  }

  if (!followUps.length) {
    bodyEl.innerHTML = `
      <div class="follow-up-empty">
        <strong>No follow-ups</strong>
        <div style="height:6px"></div>
        <div style="opacity:0.85;">Services may be offline. Start notification-service (port 4003) and telemedicine-service (port 4002) then reopen this panel.</div>
      </div>
    `;
    return;
  }

  bodyEl.innerHTML = followUps
    .slice(0, 20)
    .map((n) => {
      const title = n.title || "Follow-up";
      const message = n.message || "";
      const at = n.createdAt ? new Date(n.createdAt).toLocaleString() : "";
      return `
        <div class="follow-up-item" data-notification-id="${escapeHtml(n.id)}">
          <strong>${escapeHtml(title)}</strong>
          ${message ? `<div style="height:6px"></div><div>${escapeHtml(message)}</div>` : ""}
          <div style="height:8px"></div>
          <small>${escapeHtml(n.type || "")}${at ? ` · ${escapeHtml(at)}` : ""}</small>
          <div style="height:8px"></div>
          <button class="ghost-button small-button" type="button" data-mark-read="${escapeHtml(n.id)}">Mark read</button>
        </div>
      `;
    })
    .join("");

  bodyEl.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-mark-read]");
    if (!btn) return;
    const id = btn.dataset.markRead;
    await markNotificationRead(id);
    const item = bodyEl.querySelector(`[data-notification-id="${id}"]`);
    if (item) item.remove();
    if (!bodyEl.querySelector(".follow-up-item")) {
      bodyEl.innerHTML = `<div class="follow-up-empty"><strong>All caught up</strong></div>`;
    }
  }, { once: true });
}

const followUpLauncher = document.querySelector("#follow-up");
if (followUpLauncher) {
  followUpLauncher.addEventListener("click", (e) => {
    e.preventDefault();
    renderFollowUpPanel();
  });
}

