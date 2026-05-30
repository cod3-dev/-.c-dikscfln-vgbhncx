const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeToggle = document.querySelector('#theme-toggle');
const themeStorageKey = 'carepath-theme-v2';

function getInitialTheme() {
  try {
    const stored = window.localStorage.getItem(themeStorageKey);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch (_) {}
  return 'dark';
}

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  if (themeToggle) {
    themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Enable light mode' : 'Enable dark mode');
    themeToggle.classList.toggle('is-active', isDark);
  }
  try { window.localStorage.setItem(themeStorageKey, theme); } catch (_) {}
}

setTheme(getInitialTheme());
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    setTheme(document.body.classList.contains('dark-mode') ? 'light' : 'dark');
  });
}

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${i * 60}ms`;
  revealObserver.observe(el);
});

// Nav badge live dot
const navBadge = document.querySelector('.nav-badge');
if (navBadge) {
  navBadge.innerHTML = '<span class="live-dot" aria-hidden="true"></span>Emergency Live';
}

// Case switcher
const navBtns = document.querySelectorAll('.fa-nav-btn');
const protocols = document.querySelectorAll('.fa-protocol');

navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;

    navBtns.forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    protocols.forEach((p) => {
      const isMatch = p.id === `fa-${target}`;
      p.classList.toggle('is-active', isMatch);
    });
  });
});
