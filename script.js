// Hero brand icons — randomized on each load
(function() {
  var container = document.getElementById('heroIcons');
  if (!container) return;
  var colors = ['#675d52', '#1a1413', '#2490cf', '#f8e166', '#9dd3b2'];
  var icons = [];
  for (var i = 1; i <= 15; i++) icons.push('cursors/icon-' + i + '.svg');
  // Shuffle
  for (var j = icons.length - 1; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1));
    var tmp = icons[j]; icons[j] = icons[k]; icons[k] = tmp;
  }
  icons.forEach(function(src, idx) {
    var span = document.createElement('span');
    span.className = 'hero-icon';
    var color = colors[Math.floor(Math.random() * colors.length)];
    span.style.backgroundColor = color;
    span.style.webkitMaskImage = "url('" + src + "')";
    span.style.maskImage = "url('" + src + "')";
    var appearDelay = (Math.random() * 1.5).toFixed(2);
    span.style.animationDelay = appearDelay + 's, ' + (Math.random() * 3).toFixed(2) + 's';
    container.appendChild(span);
  });
})();

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Create menu backdrop
const menuBackdrop = document.createElement('div');
menuBackdrop.className = 'menu-backdrop';
document.body.appendChild(menuBackdrop);

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  menuToggle.classList.toggle('active');
  menuBackdrop.classList.toggle('active');
});

menuBackdrop.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.classList.remove('active');
  menuBackdrop.classList.remove('active');
});

// Hero slideshow with synced descriptions
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDescs = document.querySelectorAll('.hero-desc');
if (heroSlides.length > 0) {
  let slideIndex = 0;
  setInterval(() => {
    heroSlides[slideIndex].classList.remove('active');
    if (heroDescs[slideIndex]) heroDescs[slideIndex].classList.remove('active');
    slideIndex = (slideIndex + 1) % heroSlides.length;
    heroSlides[slideIndex].classList.add('active');
    if (heroDescs[slideIndex]) heroDescs[slideIndex].classList.add('active');
  }, 7500);
}

// Scroll fade-in animations
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Apply fade-in to sections (home, about, four worlds)
document.querySelectorAll('.stat-card, .world-block, .stats-heading, .worlds-heading, .about-block, .value-card, .timeline-item, .journey-card, .global-stats, .fw-world, .fw-intro').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Rotating text with gaussian blur transition
const rotatingItems = document.querySelectorAll('.rotating-text-item');
if (rotatingItems.length > 0) {
  let currentIndex = 0;
  setInterval(() => {
    rotatingItems[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % rotatingItems.length;
    rotatingItems[currentIndex].classList.add('active');
  }, 10000);
}

// Rotating word in "Preserve/Prepare/Protect What Makes Us Human"
const worldsWords = document.querySelectorAll('.worlds-word');
if (worldsWords.length > 0) {
  let worldsIndex = 0;
  setInterval(() => {
    worldsWords[worldsIndex].classList.remove('active');
    worldsIndex = (worldsIndex + 1) % worldsWords.length;
    worldsWords[worldsIndex].classList.add('active');
  }, 5000);
}

// Auto-size stat numbers to match the content width of the card
function sizeStatNumbers() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  document.querySelectorAll('.stat-card').forEach(card => {
    const number = card.querySelector('.stat-number');
    if (!number) return;
    if (number.hasAttribute('data-fixed')) return;

    const style = getComputedStyle(card);
    const targetWidth = card.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const fontFamily = getComputedStyle(number).fontFamily;
    const text = number.dataset.fullText || number.textContent;

    let lo = 10, hi = 600, best = 10;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      ctx.font = '700 ' + mid + 'px ' + fontFamily;
      const measured = ctx.measureText(text).width;
      if (measured <= targetWidth) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    number.style.fontSize = best + 'px';
  });
}

// Shared canvas-based fitter — measures the largest font-size that fits
// `lines` inside `targetWidth` for the given font properties. Used by both
// the page title and section headings.
function _measureFitSize(lines, targetWidth, fontFamily, fontWeight, letterSpacingEm) {
  var canvas = _measureFitSize._canvas || (_measureFitSize._canvas = document.createElement('canvas'));
  var ctx = canvas.getContext('2d');

  function lineFits(text, size) {
    ctx.font = fontWeight + ' ' + size + 'px ' + fontFamily;
    var w = ctx.measureText(text).width;
    var spacing = letterSpacingEm * size * Math.max(0, text.length - 1);
    return (w + spacing) <= targetWidth;
  }

  var lo = 20, hi = 2400, best = 20;
  while (lo <= hi) {
    var mid = Math.floor((lo + hi) / 2);
    var fits = true;
    for (var i = 0; i < lines.length; i++) {
      if (!lineFits(lines[i], mid)) { fits = false; break; }
    }
    if (fits) { best = mid; lo = mid + 1; }
    else { hi = mid - 1; }
  }
  return best;
}

function _extractLines(el) {
  return (el.innerHTML || '').split(/<br\s*\/?>/i)
    .map(function(s) { return s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim(); })
    .filter(Boolean);
}

function _availableWidth(section) {
  var s = getComputedStyle(section);
  return section.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
}

// Auto-size the Four Worlds / Who We Are title to fill the page-padding edges
function sizeFwTitle() {
  var heading = document.querySelector('.fw-title-heading');
  if (!heading) return;
  var section = heading.parentElement;
  if (!section) return;

  // Reset any previously-set inline size so we can re-measure on resize
  heading.style.fontSize = '';

  var targetWidth = _availableWidth(section);
  if (targetWidth <= 0) return;

  var hs = getComputedStyle(heading);
  var currentSize = parseFloat(hs.fontSize) || 16;
  var letterSpacingEm = (parseFloat(hs.letterSpacing) || 0) / currentSize;

  var lines = _extractLines(heading);
  if (lines.length === 0) return;

  var best = _measureFitSize(lines, targetWidth, hs.fontFamily, hs.fontWeight || '900', letterSpacingEm);
  heading.style.fontSize = best + 'px';
}

// Auto-size matched section headings — every heading in the same data-fit-group
// is sized to the smallest fitting size across the group, so they share a size.
function sizeFwSectionHeadings() {
  var groups = {};
  document.querySelectorAll('.fw-section-heading').forEach(function(el) {
    el.style.fontSize = '';
    var key = el.dataset.fitGroup || '__solo__' + Math.random();
    (groups[key] = groups[key] || []).push(el);
  });

  Object.keys(groups).forEach(function(key) {
    var els = groups[key];
    var minSize = Infinity;
    els.forEach(function(el) {
      var section = el.parentElement;
      if (!section) return;
      var targetWidth = _availableWidth(section);
      if (targetWidth <= 0) return;
      var hs = getComputedStyle(el);
      var currentSize = parseFloat(hs.fontSize) || 16;
      var letterSpacingEm = (parseFloat(hs.letterSpacing) || 0) / currentSize;
      var lines = _extractLines(el);
      if (lines.length === 0) return;
      var best = _measureFitSize(lines, targetWidth, hs.fontFamily, hs.fontWeight || '900', letterSpacingEm);
      if (best < minSize) minSize = best;
    });
    if (minSize !== Infinity) {
      els.forEach(function(el) { el.style.fontSize = minSize + 'px'; });
    }
  });
}

function _runSizers() {
  sizeStatNumbers();
  sizeFwTitle();
  sizeFwSectionHeadings();
}

// Run after fonts have loaded
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(_runSizers);
} else {
  window.addEventListener('load', _runSizers);
}
window.addEventListener('resize', _runSizers);

// Header scroll state — translucent + cream contents while scrolled,
// reverts to the default opaque header at the top of the page.
const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ---- ANIMATIONS (UNESCO pages only) ----
if (document.body.dataset.page !== 'living-traces') {

  // Staggered grid reveals
  document.querySelectorAll('.stats-grid, .values-grid').forEach(function(grid) {
    Array.from(grid.children).forEach(function(child, i) {
      child.style.transitionDelay = (i * 0.1) + 's';
    });
  });

  // Timeline / journey card stagger
  document.querySelectorAll('.timeline-item, .journey-card').forEach(function(item, i) {
    item.style.transitionDelay = (i * 0.12) + 's';
  });

  // Store original text for stat number sizing (prevents resize conflicts during count-up)
  document.querySelectorAll('.stat-number').forEach(function(el) {
    el.dataset.fullText = el.textContent.trim();
  });

  // Number slow fade-in on scroll
  document.querySelectorAll('.stat-number, .fw-stat-number, .global-stat-number').forEach(function(el) {
    el.style.opacity = '0';
    el.style.transition = 'opacity 2s ease';
  });

  var numberFadeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !entry.target.dataset.faded) {
        entry.target.dataset.faded = '1';
        entry.target.style.opacity = '1';
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stat-number, .fw-stat-number, .global-stat-number').forEach(function(el) {
    numberFadeObserver.observe(el);
  });

  // Subtle parallax on hero backgrounds (desktop only)
  var heroSlideshow = document.querySelector('.hero-slideshow');
  var pageHero = document.querySelector('.page-hero');
  if (heroSlideshow || pageHero) {
    window.addEventListener('scroll', function() {
      var y = window.scrollY;
      if (y > window.innerHeight) return;
      var isMobile = window.innerWidth <= 600;
      if (heroSlideshow && !isMobile) heroSlideshow.style.transform = 'translateY(' + (y * 0.18) + 'px)';
      if (pageHero) pageHero.style.backgroundPositionY = (y * 0.12) + 'px';
    }, { passive: true });
  }

  // Scroll progress bar
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);
  window.addEventListener('scroll', function() {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0) + '%';
  }, { passive: true });

  // Active nav link highlight
  var currentPage = window.location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.nav-links a:not(.btn-nav)').forEach(function(link) {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('is-active');
    }
  });
}

// Custom icon cursor — rotates icon + color every 5 seconds
// Skip on Living Traces page
if (document.body.dataset.page === 'living-traces') {
  document.body.style.cursor = 'auto';
  document.documentElement.style.setProperty('--custom-cursor', 'auto');
}
if (document.body.dataset.page !== 'living-traces')
(function() {
  const totalIcons = 15;
  const brandColors = ['#2490cf', '#f8e166', '#9dd3b2', '#e7e2de', '#675d52', '#1a1413'];
  const cachedSVGs = [];
  let cursorIndex = 0;
  let colorIndex = 0;

  function applyCursor(iconIdx, clrIdx) {
    const svg = cachedSVGs[iconIdx];
    if (!svg) return;
    const color = brandColors[clrIdx];
    // Replace the fill color in the SVG style
    const colored = svg.replace(/fill:\s*#[0-9a-fA-F]{6}/, 'fill: ' + color);
    const encoded = 'data:image/svg+xml,' + encodeURIComponent(colored);
    const cursorValue = 'url("' + encoded + '") 24 24, pointer';
    document.body.style.cursor = cursorValue;
    document.documentElement.style.setProperty('--custom-cursor', cursorValue);
  }

  // Fetch all cursor SVGs at startup; apply the first as soon as it loads
  let firstApplied = false;
  const fetches = [];
  for (let i = 1; i <= totalIcons; i++) {
    fetches.push(
      fetch('cursors/icon-' + i + '.svg')
        .then(r => r.text())
        .then(svg => {
          cachedSVGs[i - 1] = svg;
          // Apply the very first icon as soon as it's ready, don't wait for the rest
          if (!firstApplied && cachedSVGs[0]) {
            firstApplied = true;
            applyCursor(0, 0);
          }
        })
    );
  }

  Promise.all(fetches).then(function() {
    // Ensure first cursor is applied (in case icon-1 loaded last)
    if (!firstApplied) {
      firstApplied = true;
      applyCursor(0, 0);
    }

    // Rotate every 5 seconds
    setInterval(function() {
      cursorIndex = (cursorIndex + 1) % totalIcons;
      colorIndex = (colorIndex + 1) % brandColors.length;
      applyCursor(cursorIndex, colorIndex);
    }, 5000);
  });
})();

/* ========================================================================
   BRAND FRIENDS — catch & flee
   Click a brand-friend → it dashes off-screen and reappears in a fresh
   spot inside a different section on the same page. Every friend has a
   unique personality, and every click randomizes the escape further so
   no two flees feel identical.
   ======================================================================== */
(function() {
  const HOST_SELECTORS = [
    '.hero', '.stats-section', '.worlds-section',
    '.fw-title', '.fw-section', '.about-section',
    '.fw-world', '.fw-intro', '.atlas-cta'
  ].join(',');

  const PERSONALITIES = ['sprinter', 'spinner', 'bouncer', 'zigzagger', 'jumper', 'tumbler', 'driller'];
  const REST_OPACITY = 0.24;

  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // Pick a fresh edge-spot inside whatever new host the friend lands in
  function newSpot() {
    const spotMakers = [
      () => ({ top: rand(1.5, 7).toFixed(1)+'rem', left: rand(8, 88).toFixed(0)+'%',  right: 'auto', bottom: 'auto' }),
      () => ({ bottom: rand(2, 7).toFixed(1)+'rem', left: rand(8, 88).toFixed(0)+'%', right: 'auto', top: 'auto' }),
      () => ({ top: rand(20, 70).toFixed(0)+'%',    left: rand(1, 4).toFixed(1)+'rem', right: 'auto', bottom: 'auto' }),
      () => ({ top: rand(20, 70).toFixed(0)+'%',    right: rand(1, 4).toFixed(1)+'rem', left: 'auto', bottom: 'auto' }),
    ];
    return pick(spotMakers)();
  }

  function applySpot(el, spot) {
    el.style.top    = spot.top;
    el.style.right  = spot.right;
    el.style.bottom = spot.bottom;
    el.style.left   = spot.left;
  }

  // Build flee keyframes for a personality, with per-click randomization
  function fleeKeyframes(personality, x, y, spin) {
    const t = (xx, yy) => `translate(${xx}vw, ${yy}vh)`;

    switch (personality) {
      case 'sprinter':
        // Tiny startle, then a sharp dash. Low spin.
        return [
          { transform: 'scale(1) rotate(0deg)',                              opacity: REST_OPACITY, offset: 0 },
          { transform: `scale(${rand(1.25, 1.5).toFixed(2)}) rotate(${rand(-12,-6).toFixed(0)}deg)`, opacity: 0.65, offset: 0.10 },
          { transform: `scale(0.85) rotate(${rand(8,16).toFixed(0)}deg) translateY(4px)`, opacity: 0.5, offset: 0.20 },
          { transform: `${t(x, y)} scale(0.18) rotate(${(spin*0.4).toFixed(0)}deg)`, opacity: 0,             offset: 1 }
        ];

      case 'spinner':
        // Whirlwind exit — heavy rotation and a wide spiral
        return [
          { transform: 'scale(1) rotate(0deg)',                                  opacity: REST_OPACITY, offset: 0 },
          { transform: `scale(${rand(1.4,1.6).toFixed(2)}) rotate(${rand(-25,-15).toFixed(0)}deg)`, opacity: 0.7, offset: 0.10 },
          { transform: `scale(1.2) rotate(${(spin*0.25).toFixed(0)}deg) translate(${rand(-8,8).toFixed(0)}px, ${rand(-10,0).toFixed(0)}px)`, opacity: 0.6, offset: 0.30 },
          { transform: `scale(0.9) rotate(${(spin*0.55).toFixed(0)}deg)`,        opacity: 0.5,         offset: 0.50 },
          { transform: `${t(x, y)} scale(0.18) rotate(${(spin*1.6).toFixed(0)}deg)`, opacity: 0,         offset: 1 }
        ];

      case 'bouncer':
        // Three pogo hops then springs off-screen
        return [
          { transform: 'scale(1) translate(0,0)',                                opacity: REST_OPACITY, offset: 0 },
          { transform: `scale(1.35) translateY(-${rand(14,22).toFixed(0)}px)`,   opacity: 0.65,        offset: 0.10 },
          { transform: 'scale(1.05) translateY(2px)',                            opacity: 0.55,        offset: 0.18 },
          { transform: `scale(1.45) translateY(-${rand(18,26).toFixed(0)}px)`,   opacity: 0.6,         offset: 0.28 },
          { transform: 'scale(1.1) translateY(0)',                               opacity: 0.5,         offset: 0.36 },
          { transform: `scale(1.5) translateY(-${rand(20,30).toFixed(0)}px) rotate(${rand(-15,15).toFixed(0)}deg)`, opacity: 0.5, offset: 0.46 },
          { transform: `${t(x, y)} scale(0.18) rotate(${spin.toFixed(0)}deg)`,   opacity: 0,           offset: 1 }
        ];

      case 'zigzagger':
        // Panicked side-to-side wobble, then bolts off
        return [
          { transform: 'scale(1) rotate(0deg) translateX(0)',                    opacity: REST_OPACITY, offset: 0 },
          { transform: `scale(1.25) rotate(-18deg) translateX(-${rand(10,16).toFixed(0)}px)`, opacity: 0.6, offset: 0.10 },
          { transform: `scale(1.25) rotate(18deg)  translateX(${rand(10,16).toFixed(0)}px)`,  opacity: 0.6, offset: 0.20 },
          { transform: `scale(1.3)  rotate(-22deg) translateX(-${rand(12,18).toFixed(0)}px)`, opacity: 0.55,offset: 0.30 },
          { transform: `scale(1.3)  rotate(22deg)  translateX(${rand(12,18).toFixed(0)}px)`,  opacity: 0.5, offset: 0.40 },
          { transform: `${t(x, y)} scale(0.18) rotate(${spin.toFixed(0)}deg)`,   opacity: 0,           offset: 1 }
        ];

      case 'jumper':
        // Deep crouch, single huge leap
        return [
          { transform: 'scale(1)',                                               opacity: REST_OPACITY, offset: 0 },
          { transform: `scale(0.65) translateY(${rand(8,14).toFixed(0)}px) rotate(${rand(-8,8).toFixed(0)}deg)`, opacity: 0.55, offset: 0.18 },
          { transform: `scale(1.4) translateY(-${rand(28,40).toFixed(0)}px) rotate(${rand(-10,10).toFixed(0)}deg)`, opacity: 0.65, offset: 0.34 },
          { transform: `${t(x, y)} scale(0.15) rotate(${spin.toFixed(0)}deg)`,   opacity: 0,           offset: 1 }
        ];

      case 'driller':
        // Coils tightly then drills off-screen with extreme spin
        return [
          { transform: 'scale(1) rotate(0deg)',                                  opacity: REST_OPACITY, offset: 0 },
          { transform: `scale(0.55) rotate(${(spin*0.15).toFixed(0)}deg)`,       opacity: 0.5,         offset: 0.18 },
          { transform: `scale(0.7)  rotate(${(spin*0.45).toFixed(0)}deg)`,       opacity: 0.55,        offset: 0.34 },
          { transform: `${t(x, y)} scale(0.12) rotate(${(spin*2.2).toFixed(0)}deg)`, opacity: 0,       offset: 1 }
        ];

      case 'tumbler':
      default:
        // Original 6-stage flee with randomized magnitudes
        return [
          { transform: 'scale(1) rotate(0deg)',                                  opacity: REST_OPACITY, offset: 0 },
          { transform: `scale(${rand(1.45,1.65).toFixed(2)}) rotate(-14deg) translateY(-${rand(6,10).toFixed(0)}px)`, opacity: 0.7, offset: 0.09 },
          { transform: `scale(1.35) rotate(${rand(14,22).toFixed(0)}deg)`,       opacity: 0.65,        offset: 0.17 },
          { transform: `scale(1.5)  rotate(${rand(-26,-18).toFixed(0)}deg) translateY(-${rand(8,12).toFixed(0)}px)`, opacity: 0.6, offset: 0.25 },
          { transform: `scale(0.78) rotate(${rand(24,32).toFixed(0)}deg) translateY(${rand(4,8).toFixed(0)}px)`, opacity: 0.55, offset: 0.34 },
          { transform: `scale(1.1)  rotate(${rand(-18,-12).toFixed(0)}deg) translateY(-${rand(10,14).toFixed(0)}px)`, opacity: 0.5, offset: 0.44 },
          { transform: `${t(x, y)} scale(0.22) rotate(${spin.toFixed(0)}deg)`,   opacity: 0,           offset: 1 }
        ];
    }
  }

  // Build arrival keyframes — also personality-flavored
  function arriveKeyframes(personality) {
    switch (personality) {
      case 'sprinter':
        return [
          { opacity: 0,      transform: `translateX(${pick([-1,1]) * rand(35,55).toFixed(0)}px) scale(0.55)` },
          { opacity: 0.34,   transform: 'translateX(0) scale(1.15)', offset: 0.7 },
          { opacity: REST_OPACITY, transform: 'scale(1)' }
        ];
      case 'spinner':
        return [
          { opacity: 0,      transform: `rotate(${pick([-1,1]) * rand(360,540).toFixed(0)}deg) scale(0.4)` },
          { opacity: 0.42,   transform: 'rotate(15deg) scale(1.25)', offset: 0.6 },
          { opacity: REST_OPACITY, transform: 'rotate(0) scale(1)' }
        ];
      case 'bouncer':
        return [
          { opacity: 0,      transform: 'translateY(-30px) scale(0.6)' },
          { opacity: 0.42,   transform: 'translateY(8px)  scale(1.22)', offset: 0.45 },
          { opacity: 0.32,   transform: 'translateY(-5px) scale(0.94)', offset: 0.7 },
          { opacity: 0.27,   transform: 'translateY(2px)  scale(1.04)', offset: 0.88 },
          { opacity: REST_OPACITY, transform: 'translateY(0) scale(1)' }
        ];
      case 'zigzagger':
        return [
          { opacity: 0,      transform: 'translateX(-20px) scale(0.5)' },
          { opacity: 0.35,   transform: 'translateX(10px) scale(1.1) rotate(8deg)',  offset: 0.4 },
          { opacity: 0.32,   transform: 'translateX(-6px) scale(1.05) rotate(-5deg)', offset: 0.7 },
          { opacity: REST_OPACITY, transform: 'translateX(0) scale(1) rotate(0)' }
        ];
      case 'jumper':
        return [
          { opacity: 0,      transform: 'translateY(-40px) scale(0.4)' },
          { opacity: 0.4,    transform: 'translateY(6px)  scale(1.3)',  offset: 0.55 },
          { opacity: REST_OPACITY, transform: 'translateY(0) scale(1)' }
        ];
      case 'driller':
        return [
          { opacity: 0,      transform: `rotate(${pick([-1,1]) * 720}deg) scale(0.2)` },
          { opacity: 0.4,    transform: 'rotate(0) scale(1.2)', offset: 0.65 },
          { opacity: REST_OPACITY, transform: 'scale(1)' }
        ];
      case 'tumbler':
      default:
        return [
          { opacity: 0,      transform: 'scale(0.3) translateY(15px) rotate(-180deg)' },
          { opacity: 0.45,   transform: 'scale(1.32) rotate(15deg)', offset: 0.55 },
          { opacity: 0.27,   transform: 'scale(0.94) rotate(-6deg)', offset: 0.78 },
          { opacity: REST_OPACITY, transform: 'scale(1)' }
        ];
    }
  }

  function flee(friend) {
    if (friend.dataset.fleeing === '1') return;
    friend.dataset.fleeing = '1';
    friend.style.pointerEvents = 'none';

    const personality = friend.dataset.personality || 'tumbler';

    // Per-click randomization
    const fleeX    = pick([rand(85, 145), rand(-145, -85)]);
    const fleeY    = pick([rand(-95, -35), rand(35, 95)]);
    const spinDir  = pick([-1, 1]);
    const spin     = spinDir * rand(540, 1080);
    const duration = rand(950, 1450);
    const easing   = pick([
      'cubic-bezier(0.5, 0.05, 0.6, 1)',
      'cubic-bezier(0.45, 0, 0.55, 1)',
      'cubic-bezier(0.6, -0.05, 0.7, 0.95)',
      'cubic-bezier(0.4, 0.1, 0.7, 1.1)'
    ]);

    const fleeAnim = friend.animate(
      fleeKeyframes(personality, fleeX, fleeY, spin),
      { duration: duration, easing: easing, fill: 'forwards' }
    );

    fleeAnim.onfinish = function() {
      // Relocate to a fresh section + spot on the same page
      const hosts = Array.from(document.querySelectorAll(HOST_SELECTORS));
      const current = friend.parentElement;
      const others = hosts.filter(h => h !== current && !h.contains(friend));
      const newHost = others.length ? pick(others) : current;
      if (newHost !== current) newHost.appendChild(friend);
      applySpot(friend, newSpot());

      // Cancel flee + immediately start arrival in the same task — no flash
      fleeAnim.cancel();

      const arriveDuration = rand(720, 1100);
      const arriveAnim = friend.animate(
        arriveKeyframes(personality),
        { duration: arriveDuration, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'none' }
      );

      arriveAnim.onfinish = function() {
        friend.style.pointerEvents = '';
        friend.dataset.fleeing = '0';
      };
    };
  }

  function init() {
    document.querySelectorAll('.brand-friend').forEach(function(friend) {
      // Skip friends that are intentionally non-interactive (e.g. uncover.html)
      if (getComputedStyle(friend).pointerEvents === 'none') return;
      friend.style.cursor = 'pointer';
      // Each friend gets a persistent personality for the lifetime of the page
      friend.dataset.personality = pick(PERSONALITIES);
      friend.dataset.fleeing = '0';
      friend.addEventListener('click', function(e) {
        e.stopPropagation();
        flee(friend);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
