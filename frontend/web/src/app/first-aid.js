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

const youtubeParams = '?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1';

const videosByProtocol = {
  'fa-bleeding': {
    protocolKey: 'bleeding',
    youtubeId: 'L6jjyikFwmA',
    iframeDataAttr: 'bleeding-video'
  },
  'fa-burn': {
    protocolKey: 'burns',
    youtubeId: 'TLr2qsEhpC8',
    iframeDataAttr: 'burns-video'
  },
  'fa-fracture': {
    protocolKey: 'fractures',
    youtubeId: '2v8vlXgGXwE',
    iframeDataAttr: 'fractures-video'
  },
  'fa-choking': {
    protocolKey: 'choking',
    youtubeId: 'HGBBu4zr8sM',
    iframeDataAttr: 'choking-video'
  },
  'fa-road': {
    protocolKey: 'road-accident',
    youtubeId: 'uMAgxMFjz6A',
    iframeDataAttr: 'road-video'
  },
  'fa-nosebleed': {
    protocolKey: 'nosebleeds',
    youtubeId: 'PmmhxW0vVXA',
    iframeDataAttr: 'nosebleeds-video'
  },
  'fa-fainting': {
    protocolKey: 'fainting',
    youtubeId: 'ddHKwkMwNyI',
    iframeDataAttr: 'fainting-video'
  },
  'fa-electric': {
    protocolKey: 'electric-shock',
    youtubeId: 'myq7NBgsMD0',
    iframeDataAttr: 'electric-video'
  },
  'fa-poisoning': {
    protocolKey: 'poisoning',
    youtubeId: 'b2ieb8BZJuY',
    iframeDataAttr: 'poisoning-video'
  },
  'fa-bites': {
    protocolKey: 'animal-bites',
    youtubeId: 'RSJzuk226RI',
    iframeDataAttr: 'bites-video'
  }
};

function injectVideoForProtocol(protocolId) {
  const protocolEl = document.querySelector(`#${protocolId}`);
  if (!protocolEl) return;

  const config = videosByProtocol[protocolId];
  if (!config) return;

  if (protocolEl.querySelector(`iframe[data-${config.iframeDataAttr}="1"]`)) return;

  const slot = protocolEl.querySelector('.fa-video-slot');
  if (!slot) return;

  const youtubeEmbed = `https://www.youtube.com/embed/${config.youtubeId}${youtubeParams}`;

  slot.innerHTML = `
    <div class="fa-video-wrap">
      <div class="fa-video-aspect">
        <iframe
          data-${config.iframeDataAttr}="1"
          src="${youtubeEmbed}"
          title="${config.protocolKey} first aid walkthrough"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  `;
}

Object.keys(videosByProtocol).forEach((protocolId) => {
  injectVideoForProtocol(protocolId);
});


navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;

    navBtns.forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    protocols.forEach((p) => {
      const isMatch = p.id === `fa-${target}`;
      p.classList.toggle('is-active', isMatch);

      // If user navigates back to bleeding, ensure the player exists.
      if (isMatch && p.id === 'fa-bleeding') {
        ensureBleedingVideo();
      }
    });
  });
});

