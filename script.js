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
      link.style.color = '#2491d0';
      link.style.fontWeight = '700';
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
