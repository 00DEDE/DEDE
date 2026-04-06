// BroadcastChannel for receiving from table display
var channel = new BroadcastChannel('atlas-channel');

// Icon map for each world category
var ICONS = {
  monuments:  'assets/graphic/UNESCO_MONUMENT.svg',
  nature:     'assets/graphic/UNESCO_NATURE.svg',
  intangible: 'assets/graphic/UNESCO_INTANGIBLE.svg',
  language:   'assets/graphic/UNESCO_LANGUAGE.svg'
};

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
var overheadVideo = null;
var overheadIcon = null;
var videoFadeOverlay = null;
var videoFadeTimer = null;
var videoCutTimer = null;

var VIDEO_DURATION = 240; // 4 minutes in seconds
var FADE_OUT_START = 230; // start fading 10 seconds before cut

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
  overheadVideo    = document.getElementById('overhead-video');
  overheadIcon     = document.getElementById('overhead-icon');
  videoFadeOverlay = document.getElementById('video-fade-overlay');

  // One-time click to unlock audio for the session
  var audioUnlocked = false;
  document.addEventListener('click', function() {
    if (!audioUnlocked) {
      audioUnlocked = true;
      // Play and immediately pause to unlock audio context
      overheadVideo.muted = false;
      overheadVideo.play().then(function() {
        overheadVideo.pause();
        overheadVideo.currentTime = 0;
      }).catch(function() {});
      idleState.querySelector('.idle-text').textContent = 'Waiting for activation';
    }
  }, { once: true });

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
    // World icon
    if (overheadIcon && ICONS[data.world]) {
      overheadIcon.src = ICONS[data.world];
    }

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

    // Video — fade in, play, 4 min cutoff with fade to black
    if (overheadVideo) {
      if (videoFadeTimer) clearTimeout(videoFadeTimer);
      if (videoCutTimer) clearTimeout(videoCutTimer);

      overheadVideo.currentTime = 0;
      overheadVideo.classList.remove('visible');
      if (videoFadeOverlay) videoFadeOverlay.classList.remove('fading');

      overheadVideo.play().then(function() {
        overheadVideo.classList.add('visible');
      }).catch(function() {
        overheadVideo.classList.add('visible');
      });

      // Fade to black starting 10s before the 4 min mark
      videoFadeTimer = setTimeout(function() {
        if (videoFadeOverlay) videoFadeOverlay.classList.add('fading');
      }, FADE_OUT_START * 1000);

      // Pause at 4 minutes
      videoCutTimer = setTimeout(function() {
        overheadVideo.classList.remove('visible');
        overheadVideo.pause();
      }, VIDEO_DURATION * 1000);
    }
  }, 150);
}

document.addEventListener('DOMContentLoaded', init);
