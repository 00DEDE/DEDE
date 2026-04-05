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
