const revealItems = document.querySelectorAll(".reveal");
const tiltItems = document.querySelectorAll(".hover-tilt");
const themeToggle = document.querySelector("#theme-toggle");
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

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${index * 70}ms`;
  observer.observe(item);
});

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
