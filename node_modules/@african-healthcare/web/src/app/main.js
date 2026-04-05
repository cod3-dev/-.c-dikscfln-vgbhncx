const revealItems = document.querySelectorAll(".reveal");
const tiltItems = document.querySelectorAll(".hover-tilt");
const themeToggle = document.querySelector("#theme-toggle");

function animateCount(el, target, duration = 1200) {
  const start = performance.now();
  const update = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased).toLocaleString();
    if (t < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function startTicker(el, base) {
  let val = base;
  setInterval(() => {
    val += Math.random() < 0.5 ? 1 : -1;
    val = Math.max(base - 8, Math.min(base + 8, val));
    el.textContent = val.toLocaleString() + " active care handoffs";
  }, 3200);
}

const navBadge = document.querySelector(".nav-badge");
if (navBadge) {
  navBadge.innerHTML = '<span class="live-dot" aria-hidden="true"></span>Emergency Live';
}
const themeStorageKey = "carepath-theme-v2";
const supportsTilt =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getInitialTheme() {
  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);

    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }
  } catch (error) {
    // Ignore storage access issues and fall back to system preference.
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
    // Ignore storage access issues so the toggle still works for the session.
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16
  }
);

const countTargets = [6, 22, 0, 45];
const countEls = document.querySelectorAll(".count-grid strong");
let countAnimated = false;

const handoffEl = document.querySelector(".hero-panel h2");
const handoffBase = 1248;

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${index * 70}ms`;
  observer.observe(item);
});

const consoleSection = document.querySelector(".console-section");
if (consoleSection) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !countAnimated) {
        countAnimated = true;
        countEls.forEach((el, i) => animateCount(el, countTargets[i]));
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  counterObserver.observe(consoleSection);
}

const heroSection = document.querySelector(".hero-section");
if (heroSection && handoffEl) {
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(handoffEl, handoffBase, 1600);
        setTimeout(() => startTicker(handoffEl, handoffBase), 1700);
        heroObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
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
