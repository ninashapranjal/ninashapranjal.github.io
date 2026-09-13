const typewriter = document.getElementById("typewriter");

if (typewriter) {
  const text = "hi i'm pranjal";
  let index = 0;
  const typingSpeed = 110;

  function typeText() {
    if (index < text.length) {
      typewriter.textContent += text.charAt(index);
      index++;

      setTimeout(typeText, typingSpeed);
    }
  }

  typeText();
}

const wipe = document.getElementById('wipe');

function circleRadiusToCover(x, y) {
  const w = window.innerWidth, h = window.innerHeight;
  const dx = Math.max(x, w - x);
  const dy = Math.max(y, h - y);
  return Math.sqrt(dx * dx + dy * dy);
}

// expand the circle from originEl until it covers the screen, then navigate
function expandWipeAndNavigate(originEl, destinationUrl) {
  const rect = originEl.getBoundingClientRect();
  const ox = rect.left + rect.width / 2;
  const oy = rect.top + rect.height / 2;
  const maxR = circleRadiusToCover(ox, oy);

  wipe.style.transition = 'none';
  wipe.style.clipPath = `circle(0px at ${ox}px ${oy}px)`;
  void wipe.offsetWidth; // force reflow
  wipe.style.transition = 'clip-path .5s cubic-bezier(.65,0,.35,1)';
  wipe.style.clipPath = `circle(${maxR}px at ${ox}px ${oy}px)`;

  // remember where the circle was centered so the next page can shrink from the same spot
  sessionStorage.setItem('wipeOrigin', JSON.stringify({ x: ox, y: oy }));

  setTimeout(() => {
    window.location.href = destinationUrl;
  }, 520); // slightly longer than the .5s transition so it fully covers before navigating
}

// on load: if we arrived here via a wipe, shrink the circle back down to reveal this page
function revealFromStoredOrigin() {
  const stored = sessionStorage.getItem('wipeOrigin');
  if (!stored) return; // direct/fresh load — no animation needed
  sessionStorage.removeItem('wipeOrigin');

  const { x, y } = JSON.parse(stored);
  const maxR = circleRadiusToCover(x, y);

  wipe.style.transition = 'none';
  wipe.style.clipPath = `circle(${maxR}px at ${x}px ${y}px)`;
  void wipe.offsetWidth;

  requestAnimationFrame(() => {
    wipe.style.transition = 'clip-path .5s cubic-bezier(.65,0,.35,1)';
    wipe.style.clipPath = `circle(0px at ${x}px ${y}px)`;
  });
}
revealFromStoredOrigin();

/* ---------- hero page (index.html) ---------- */
const aboutBtn = document.getElementById('aboutBtn');
if (aboutBtn) {
  aboutBtn.addEventListener('mousedown', () => aboutBtn.classList.add('pressed'));
  aboutBtn.addEventListener('mouseup', () => aboutBtn.classList.remove('pressed'));
  aboutBtn.addEventListener('mouseleave', () => aboutBtn.classList.remove('pressed'));
  aboutBtn.addEventListener('click', () => expandWipeAndNavigate(aboutBtn, 'about.html'));
}

/* ---------- about page (about.html) ---------- */
const backLink = document.getElementById('backLink');
if (backLink) {
  backLink.addEventListener('click', (e) => {
    e.preventDefault();
    expandWipeAndNavigate(backLink, 'index.html');
  });
}

// fade/slide each .panel in as it scrolls into view
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => observer.observe(el));
}