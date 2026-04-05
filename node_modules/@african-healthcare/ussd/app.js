const session = window.createUssdSession();
const display = document.querySelector("#ussd-display");
const input = document.querySelector("#ussd-input");
const statusBadge = document.querySelector("#ussd-status");
const summary = document.querySelector("#session-summary");
const form = document.querySelector("#ussd-form");
const backButton = document.querySelector("#back-button");
const restartButton = document.querySelector("#restart-button");

function render() {
  const screen = session.getScreen();
  statusBadge.textContent = screen.state;
  display.textContent = `${screen.state} ${screen.text}`;
  backButton.disabled = !screen.canGoBack;

  summary.innerHTML = `
    <p><strong>Last match:</strong> ${screen.context.lastMatch ? screen.context.lastMatch.name : "None"}</p>
    <p><strong>Appointment:</strong> ${screen.context.appointmentSlot || "Not booked"}</p>
    <p><strong>Telemedicine:</strong> ${screen.context.telemedicine ? screen.context.telemedicine.mode : "Not queued"}</p>
    <p><strong>Alerts:</strong> ${screen.context.alerts.length}</p>
  `;
}

function submitValue(value) {
  const cleaned = value.trim();
  if (!cleaned) return;
  session.submit(cleaned);
  input.value = "";
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitValue(input.value);
});

document.querySelector(".keypad").addEventListener("click", (event) => {
  const button = event.target.closest("[data-key]");
  if (!button) return;

  const key = button.dataset.key;
  if (key === "#") {
    submitValue(input.value);
    return;
  }

  input.value += key;
  input.focus();
});

backButton.addEventListener("click", () => {
  session.back();
  render();
});

restartButton.addEventListener("click", () => {
  session.restart();
  input.value = "";
  render();
});

render();
