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
