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
var introLayer = null;
var worldBar = null;
var worldBarText = null;
var worldBarIcon = null;
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
var videoFrame = null;
var videoFadeTimer = null;
var videoCutTimer = null;
var introTimer = null;
var videoStartTimer = null;

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
  introLayer       = document.getElementById('intro-layer');
  worldBar         = document.getElementById('world-bar');
  worldBarText     = document.getElementById('world-bar-text');
  worldBarIcon     = document.getElementById('world-bar-icon');
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
  videoFrame       = document.getElementById('video-frame');

  // One-time click to unlock audio for the session
  var audioUnlocked = false;
  document.addEventListener('click', function() {
    if (!audioUnlocked) {
      audioUnlocked = true;
      overheadVideo.muted = false;
      overheadVideo.play().then(function() {
        overheadVideo.pause();
        overheadVideo.currentTime = 0;
      }).catch(function() {});
      idleState.querySelector('.idle-text').textContent = 'Waiting for activation';
    }
  }, { once: true });

  // Listen for messages from table display
  channel.onmessage = function(e) {
    if (e.data.type === 'zone-activate') {
      showActivation(e.data);
    } else if (e.data.type === 'zone-deactivate') {
      gracefulClose();
    } else if (e.data.type === 'media-mute') {
      if (overheadVideo) overheadVideo.muted = !overheadVideo.muted;
    } else if (e.data.type === 'media-pause') {
      if (overheadVideo) overheadVideo.pause();
    } else if (e.data.type === 'media-play') {
      if (overheadVideo) overheadVideo.play();
    }
  };
}

var volumeFadeInterval = null;

function gracefulClose() {
  if (videoFadeTimer) clearTimeout(videoFadeTimer);
  if (videoCutTimer) clearTimeout(videoCutTimer);
  if (introTimer) clearTimeout(introTimer);
  if (videoStartTimer) clearTimeout(videoStartTimer);
  if (volumeFadeInterval) clearInterval(volumeFadeInterval);

  // Fade video to black
  if (videoFadeOverlay) videoFadeOverlay.classList.add('fading');

  // Gradually lower volume over 3 seconds
  if (overheadVideo) {
    var startVolume = overheadVideo.volume;
    var steps = 30;
    var stepTime = 3000 / steps;
    var stepAmount = startVolume / steps;

    volumeFadeInterval = setInterval(function() {
      if (overheadVideo.volume > stepAmount) {
        overheadVideo.volume -= stepAmount;
      } else {
        overheadVideo.volume = 0;
        clearInterval(volumeFadeInterval);
        overheadVideo.pause();
        overheadVideo.classList.remove('visible');
        overheadVideo.volume = startVolume;
      }
    }, stepTime);
  }
}

function showActivation(data) {
  // Clear any pending timers from previous activation
  if (introTimer) clearTimeout(introTimer);
  if (videoStartTimer) clearTimeout(videoStartTimer);
  if (videoFadeTimer) clearTimeout(videoFadeTimer);
  if (videoCutTimer) clearTimeout(videoCutTimer);

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

  // Reset states
  introLayer.classList.remove('fade-out');
  introLayer.classList.add('visible');
  worldBarIcon.classList.remove('visible');
  overheadVideo.classList.remove('visible');
  if (videoFadeOverlay) videoFadeOverlay.classList.remove('fading');

  // Set world-specific video frame mask
  if (videoFrame) {
    videoFrame.className = 'video-frame';
    if (data.world === 'monuments') {
      videoFrame.classList.add('frame-monuments');
    }
  }

  // --- Phase 1: Show title, icon, context ---
  // World icon in intro layer
  if (overheadIcon && ICONS[data.world]) {
    overheadIcon.src = ICONS[data.world];
  }

  // Location title
  locationTitle.textContent = data.location;
  locationTitle.style.color = data.color;

  // Accent line
  accentLine.style.background = data.color;

  // Category description
  categoryDesc.textContent = CATEGORY_LABELS[data.world] || '';

  // World bar (persistent)
  worldBarText.textContent = data.worldName;
  worldBar.style.color = data.color;

  // World bar icon (hidden initially, shown after intro fades)
  if (ICONS[data.world]) {
    worldBarIcon.src = ICONS[data.world];
  }

  // Zone number
  zoneNumber.textContent = String(data.zone).padStart(2, '0');
  zoneNumber.style.color = data.color;

  // Sequence counter
  sequenceCounter.textContent = (data.index + 1) + ' / ' + data.total;

  // --- Phase 2: After 3s, fade out intro, show icon above world bar ---
  introTimer = setTimeout(function() {
    introLayer.classList.add('fade-out');

    // After intro fades (1s transition), show icon above world bar
    setTimeout(function() {
      worldBarIcon.classList.add('visible');
    }, 600);
  }, 3000);

  // --- Phase 3: Start video after intro fades ---
  if (data.video && overheadVideo) {
    overheadVideo.src = data.video;
    overheadVideo.load();

    videoStartTimer = setTimeout(function() {
      overheadVideo.currentTime = 0;
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
    }, 4200);
  }
}

document.addEventListener('DOMContentLoaded', init);
