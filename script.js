// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

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

// Auto-size stat numbers to fill card width
function sizeStatNumbers() {
  document.querySelectorAll('.stat-card').forEach(card => {
    const number = card.querySelector('.stat-number');
    if (!number) return;
    const cardWidth = card.clientWidth - parseFloat(getComputedStyle(card).paddingLeft) - parseFloat(getComputedStyle(card).paddingRight);
    let fontSize = 10;
    number.style.fontSize = fontSize + 'px';
    while (number.scrollWidth < cardWidth && fontSize < 400) {
      fontSize += 2;
      number.style.fontSize = fontSize + 'px';
    }
    number.style.fontSize = (fontSize - 2) + 'px';
  });
}
sizeStatNumbers();
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
