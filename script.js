// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Hero slideshow
const heroSlides = document.querySelectorAll('.hero-slide');
if (heroSlides.length > 0) {
  let slideIndex = 0;
  setInterval(() => {
    heroSlides[slideIndex].classList.remove('active');
    slideIndex = (slideIndex + 1) % heroSlides.length;
    heroSlides[slideIndex].classList.add('active');
  }, 5000);
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
document.querySelectorAll('.stat-card, .world-block, .stats-heading, .worlds-heading, .about-block, .value-card, .timeline-item, .global-stats, .fw-world, .fw-intro').forEach(el => {
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

// Run after fonts have loaded
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(sizeStatNumbers);
} else {
  window.addEventListener('load', sizeStatNumbers);
}
window.addEventListener('resize', sizeStatNumbers);

// Header background on scroll
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
  } else {
    header.style.boxShadow = 'none';
  }
});

// ---- ANIMATIONS (UNESCO pages only) ----
if (document.body.dataset.page !== 'living-traces') {

  // Staggered grid reveals
  document.querySelectorAll('.stats-grid, .values-grid').forEach(function(grid) {
    Array.from(grid.children).forEach(function(child, i) {
      child.style.transitionDelay = (i * 0.1) + 's';
    });
  });

  // Timeline stagger
  document.querySelectorAll('.timeline-item').forEach(function(item, i) {
    item.style.transitionDelay = (i * 0.12) + 's';
  });

  // Store original text for stat number sizing (prevents resize conflicts during count-up)
  document.querySelectorAll('.stat-number').forEach(function(el) {
    el.dataset.fullText = el.textContent.trim();
  });

  // Number count-up on scroll
  function countUp(el) {
    var text = el.dataset.fullText || el.textContent.trim();
    var suffix = '';
    if (text.endsWith('+')) { suffix = '+'; text = text.slice(0, -1).trim(); }
    if (text.endsWith('K')) { suffix = 'K'; text = text.slice(0, -1).trim(); }

    var useCommas = text.includes(',');
    var target = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (isNaN(target) || target === 0) return;

    var duration = 1800;
    var start = performance.now();

    function step(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(target * eased);
      el.textContent = (useCommas ? current.toLocaleString() : current.toString()) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  }

  var countObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        countUp(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stat-number, .fw-stat-number, .global-stat-number').forEach(function(el) {
    countObserver.observe(el);
  });

  // Subtle parallax on hero backgrounds
  var heroSlideshow = document.querySelector('.hero-slideshow');
  var pageHero = document.querySelector('.page-hero');
  if (heroSlideshow || pageHero) {
    window.addEventListener('scroll', function() {
      var y = window.scrollY;
      if (y > window.innerHeight) return;
      if (heroSlideshow) heroSlideshow.style.transform = 'translateY(' + (y * 0.18) + 'px)';
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
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
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
  const totalIcons = 13;
  const brandColors = ['#2490cf', '#f8e166', '#9dd3b2', '#e7e2de', '#675d52', '#1a1413'];
  const cachedSVGs = [];
  let cursorIndex = 0;
  let colorIndex = 0;

  // Fetch all cursor SVGs at startup
  const fetches = [];
  for (let i = 1; i <= totalIcons; i++) {
    fetches.push(
      fetch('cursors/icon-' + i + '.svg')
        .then(r => r.text())
        .then(svg => { cachedSVGs[i - 1] = svg; })
    );
  }

  function applyCursor(iconIdx, clrIdx) {
    const svg = cachedSVGs[iconIdx];
    if (!svg) return;
    const color = brandColors[clrIdx];
    // Replace the fill color in the SVG style
    const colored = svg.replace(/fill:\s*#[0-9a-fA-F]{6}/, 'fill: ' + color);
    const encoded = 'data:image/svg+xml,' + encodeURIComponent(colored);
    document.body.style.cursor = 'url("' + encoded + '") 24 24, auto';
    // Also apply to all interactive elements
    document.documentElement.style.setProperty('--custom-cursor', 'url("' + encoded + '") 24 24, auto');
  }

  Promise.all(fetches).then(function() {
    // Apply first cursor immediately
    applyCursor(cursorIndex, colorIndex);

    // Rotate every 10 seconds
    setInterval(function() {
      cursorIndex = (cursorIndex + 1) % totalIcons;
      colorIndex = (colorIndex + 1) % brandColors.length;
      applyCursor(cursorIndex, colorIndex);
    }, 5000);
  });
})();
