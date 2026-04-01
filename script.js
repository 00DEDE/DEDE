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
  }, 6000);
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

// Apply fade-in to sections
document.querySelectorAll('.stat-card, .world-block, .stats-heading, .worlds-heading').forEach(el => {
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
    const text = number.textContent;

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
