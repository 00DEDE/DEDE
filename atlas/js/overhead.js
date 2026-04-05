// BroadcastChannel for receiving from table display
var channel = new BroadcastChannel('atlas-channel');

var idleState = null;
var activeContent = null;
var worldBar = null;
var locationTitle = null;
var zoneNumber = null;
var accentLine = null;
var categoryDesc = null;
var sequenceCounter = null;
var transitionFlash = null;
var ambientGlow = null;
var videoPlaceholder = null;

var CATEGORY_LABELS = {
  monuments:  'Monuments & Built Heritage',
  nature:     'Natural World Heritage Sites',
  language:   'Endangered Languages',
  intangible: 'Intangible Cultural Heritage'
};

function init() {
  idleState        = document.getElementById('idle-state');
  activeContent    = document.getElementById('active-content');
  worldBar         = document.getElementById('world-bar');
  locationTitle    = document.getElementById('location-title');
  zoneNumber       = document.getElementById('zone-number');
  accentLine       = document.getElementById('accent-line');
  categoryDesc     = document.getElementById('category-desc');
  sequenceCounter  = document.getElementById('sequence-counter');
  transitionFlash  = document.getElementById('transition-flash');
  ambientGlow      = document.getElementById('ambient-glow');
  videoPlaceholder = document.getElementById('video-placeholder');

  // Listen for activations from table display
  channel.onmessage = function(e) {
    if (e.data.type === 'zone-activate') {
      showActivation(e.data);
    }
  };
}

function showActivation(data) {
  // Flash transition
  transitionFlash.style.background = data.color;
  transitionFlash.classList.remove('flash');
  void transitionFlash.offsetWidth;
  transitionFlash.classList.add('flash');

  // Hide idle, show active
  idleState.classList.add('hidden');
  activeContent.classList.add('visible');

  // Set ambient glow
  ambientGlow.style.background = 'radial-gradient(ellipse at center, ' + data.color + '08 0%, transparent 70%)';
  ambientGlow.classList.add('active');

  // Update content with slight delay for drama
  setTimeout(function() {
    // World category bar
    worldBar.textContent = data.worldName;
    worldBar.style.color = data.color;

    // Location title
    locationTitle.textContent = data.location;
    locationTitle.style.color = data.color;

    // Zone number
    zoneNumber.textContent = String(data.zone).padStart(2, '0');
    zoneNumber.style.color = data.color;

    // Accent line
    accentLine.style.background = data.color;

    // Category description
    categoryDesc.textContent = CATEGORY_LABELS[data.world] || '';

    // Sequence counter
    sequenceCounter.textContent = (data.index + 1) + ' / ' + data.total;

    // Video placeholder
    videoPlaceholder.textContent = 'Video \u2014 ' + data.location;
    videoPlaceholder.style.borderColor = data.color + '20';
  }, 150);
}

document.addEventListener('DOMContentLoaded', init);
