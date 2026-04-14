// BroadcastChannel for receiving from table display
var channel = new BroadcastChannel('atlas-channel');

// Icon map for each world category
var ICONS = {
  monuments:  'assets/graphic/UNESCO_MONUMENT.svg',
  nature:     'assets/graphic/UNESCO_NATURE.svg',
  intangible: 'assets/graphic/UNESCO_INTANGIBLE.svg',
  language:   'assets/graphic/UNESCO_LANGUAGE.svg'
};

// CSS mask url() forms for the migrated context panel icon
var ICON_MASKS = {
  monuments:  "url('assets/graphic/UNESCO_MONUMENT.svg')",
  nature:     "url('assets/graphic/UNESCO_NATURE.svg')",
  intangible: "url('assets/graphic/UNESCO_INTANGIBLE.svg')",
  language:   "url('assets/graphic/UNESCO_LANGUAGE.svg')"
};

// World names — for the migrated site context panel "world" label
var WORLD_NAMES = {
  monuments:  'The World Built Through Us',
  nature:     'The World That Sustains Us',
  intangible: 'The World That Moves Within Us',
  language:   'The World That Remembers Us'
};

var introOverlay = null;
var activeContent = null;
var introLayer = null;
var worldBar = null;
var worldBarText = null;
var worldBarIcon = null;
var locationTitle = null;
var locationPronunciation = null;
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
var contextShowTimer = null;
var contextHideTimer = null;

// Site context overlay refs
var contextPanel = null;
var contextLocation = null;
var contextPronunciation = null;
var contextCoordinates = null;
var contextRegion = null;
var contextCivilization = null;
var contextInsight = null;

var VIDEO_DURATION = 240;
var FADE_OUT_START = 230;

var CATEGORY_LABELS = {
  monuments:  'Built Monuments',
  nature:     'Natural Sites',
  language:   'Endangered Languages',
  intangible: 'Intangible Traditions'
};

var labelToggleInterval = null;
var labelTogglePhase = 0; // 0 = short, 1 = long

function startLabelToggle(shortText, longText) {
  if (labelToggleInterval) clearInterval(labelToggleInterval);
  labelTogglePhase = 0;
  labelToggleInterval = setInterval(function() {
    if (!worldBarText) return;
    worldBarText.classList.add('swap');
    setTimeout(function() {
      labelTogglePhase = 1 - labelTogglePhase;
      worldBarText.textContent = labelTogglePhase === 0 ? shortText : longText;
      worldBarText.classList.remove('swap');
    }, 700);
  }, 10000);
}

function stopLabelToggle() {
  if (labelToggleInterval) {
    clearInterval(labelToggleInterval);
    labelToggleInterval = null;
  }
}

function init() {
  introOverlay     = document.getElementById('intro-overlay');
  activeContent    = document.getElementById('active-content');
  introLayer       = document.getElementById('intro-layer');
  worldBar         = document.getElementById('world-bar');
  worldBarText     = document.getElementById('world-bar-text');
  worldBarIcon     = document.getElementById('world-bar-icon');
  locationTitle        = document.getElementById('location-title');
  locationPronunciation = document.getElementById('location-pronunciation');
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

  // Site context overlay
  contextPanel        = document.getElementById('context-panel');
  contextLocation     = document.getElementById('context-location');
  contextPronunciation = document.getElementById('context-pronunciation');
  contextCoordinates  = document.getElementById('context-coordinates');
  contextRegion       = document.getElementById('context-region');
  contextCivilization = document.getElementById('context-civilization');
  contextInsight      = document.getElementById('context-insight');

  // Intro overlay choreography:
  //   t=0      logo fades in at center
  //   t=1000ms logo slides to bottom, title fades in at center
  //   t=2100ms title slides to top, icon groups fade in (staggered)
  if (introOverlay) {
    requestAnimationFrame(function() {
      introOverlay.classList.add('phase-1');
      setTimeout(function() { introOverlay.classList.add('phase-2'); }, 2000);
      setTimeout(function() { introOverlay.classList.add('phase-3'); }, 3100);
    });
  }

  // Click on intro overlay unlocks audio
  var audioUnlocked = false;
  if (introOverlay) {
    introOverlay.addEventListener('click', function() {
      if (!audioUnlocked) {
        audioUnlocked = true;
        overheadVideo.muted = false;
        overheadVideo.play().then(function() {
          overheadVideo.pause();
          overheadVideo.currentTime = 0;
        }).catch(function() {});
      }
    });
  }

  // Listen for messages from table display
  channel.onmessage = function(e) {
    if (e.data.type === 'zone-activate') {
      dismissIntro();
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

function dismissIntro() {
  if (introOverlay) {
    introOverlay.classList.add('fade-out');
  }
}

function showIntro() {
  if (introOverlay) {
    introOverlay.classList.remove('fade-out');
  }
}

var volumeFadeInterval = null;

function gracefulClose() {
  if (videoFadeTimer) clearTimeout(videoFadeTimer);
  if (videoCutTimer) clearTimeout(videoCutTimer);
  if (introTimer) clearTimeout(introTimer);
  if (videoStartTimer) clearTimeout(videoStartTimer);
  if (contextShowTimer) clearTimeout(contextShowTimer);
  if (contextHideTimer) clearTimeout(contextHideTimer);
  if (volumeFadeInterval) clearInterval(volumeFadeInterval);
  stopLabelToggle();

  // Animate site context panel out
  if (contextPanel) {
    contextPanel.classList.remove('active');
    contextPanel.classList.add('exit');
  }

  // Contract video frame
  if (videoFrame) {
    videoFrame.classList.remove('expanded', 'dim');
    videoFrame.classList.add('contracting');
  }

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
        overheadVideo.volume = startVolume;
      }
    }, stepTime);
  }

  // Fade out all active content after 2s, then show intro
  setTimeout(function() {
    activeContent.classList.remove('visible');
    ambientGlow.classList.remove('active');
    showIntro();
  }, 2000);
}

function showActivation(data) {
  // Clear any pending timers from previous activation
  if (introTimer) clearTimeout(introTimer);
  if (videoStartTimer) clearTimeout(videoStartTimer);
  if (videoFadeTimer) clearTimeout(videoFadeTimer);
  if (videoCutTimer) clearTimeout(videoCutTimer);
  if (contextShowTimer) clearTimeout(contextShowTimer);
  if (contextHideTimer) clearTimeout(contextHideTimer);

  // Flash transition
  transitionFlash.style.background = data.color;
  transitionFlash.classList.remove('flash');
  void transitionFlash.offsetWidth;
  transitionFlash.classList.add('flash');

  // Show active content
  activeContent.classList.add('visible');

  // Set ambient glow
  ambientGlow.style.background = 'radial-gradient(ellipse at center, ' + data.color + '08 0%, transparent 70%)';
  ambientGlow.classList.add('active');

  // Reset states
  introLayer.classList.remove('fade-out');
  introLayer.classList.add('visible');
  worldBarIcon.classList.remove('visible');
  if (videoFrame) {
    videoFrame.classList.remove('expanded', 'contracting', 'dim');
  }
  if (videoFadeOverlay) videoFadeOverlay.classList.remove('fading');

  // Set world-specific video frame mask and glow color
  if (videoFrame) {
    videoFrame.className = 'video-frame';
    if (data.world === 'monuments') {
      videoFrame.classList.add('frame-monuments');
    } else if (data.world === 'language') {
      videoFrame.classList.add('frame-language');
    }
    var c = data.color;
    videoFrame.style.setProperty('--frame-glow', c + '18');
    videoFrame.style.setProperty('--frame-glow-wide', c + '0a');
  }

  // --- Phase 1: Show title, icon, context ---
  if (overheadIcon && ICONS[data.world]) {
    overheadIcon.src = ICONS[data.world];
  }

  locationTitle.textContent = data.location;
  locationTitle.style.color = data.color;
  if (locationPronunciation) {
    locationPronunciation.textContent = data.pronunciation || '';
  }
  accentLine.style.background = data.color;
  categoryDesc.textContent = CATEGORY_LABELS[data.world] || '';

  var shortLabel = CATEGORY_LABELS[data.world] || '';
  var longLabel  = data.worldName || WORLD_NAMES[data.world] || '';
  worldBarText.classList.remove('swap');
  worldBarText.textContent = shortLabel;
  worldBar.style.color = data.color;
  startLabelToggle(shortLabel, longLabel);

  if (ICONS[data.world]) {
    worldBarIcon.src = ICONS[data.world];
  }

  zoneNumber.textContent = String(data.zone).padStart(2, '0');
  zoneNumber.style.color = data.color;
  sequenceCounter.textContent = (data.index + 1) + ' / ' + data.total;

  // --- Populate site context overlay (shown 20s into video) ---
  if (contextPanel) {
    contextLocation.textContent = data.location;
    contextLocation.style.color = data.color;
    if (contextPronunciation) {
      contextPronunciation.textContent = data.pronunciation || '';
    }
    if (contextCoordinates) {
      contextCoordinates.textContent = data.coordinates || '';
    }
    contextRegion.textContent = data.region;
    contextCivilization.textContent = data.civilization || '';
    contextInsight.textContent = data.keyInsight || '';
    contextPanel.classList.remove('active', 'exit');
  }

  // --- Phase 2: After 3s, fade out intro, show icon above world bar ---
  introTimer = setTimeout(function() {
    introLayer.classList.add('fade-out');

    setTimeout(function() {
      worldBarIcon.classList.add('visible');
    }, 600);
  }, 3000);

  // --- Phase 3: Start video after intro fades ---
  if (data.video && overheadVideo) {
    overheadVideo.src = data.video;
    overheadVideo.load();

    videoStartTimer = setTimeout(function() {
      var zoom = data.videoZoom || 1;
      overheadVideo.style.transform = zoom === 1 ? '' : 'scale(' + zoom + ')';
      overheadVideo.style.transformOrigin = 'center center';

      var startAt = data.videoStart || 0;
      var seekAndPlay = function() {
        try { if (startAt > 0) overheadVideo.currentTime = startAt; } catch (err) {}
        overheadVideo.play().then(function() {
          if (videoFrame) videoFrame.classList.add('expanded');
        }).catch(function() {
          if (videoFrame) videoFrame.classList.add('expanded');
        });
      };
      if (startAt > 0 && overheadVideo.readyState < 1) {
        overheadVideo.addEventListener('loadedmetadata', seekAndPlay, { once: true });
      } else {
        try { overheadVideo.currentTime = startAt; } catch (err) {}
        overheadVideo.play().then(function() {
          if (videoFrame) videoFrame.classList.add('expanded');
        }).catch(function() {
          if (videoFrame) videoFrame.classList.add('expanded');
        });
      }

      // Context overlay appears 20s into the video, lingers 10s, then fades.
      // Video frame darkens underneath while the text is on screen.
      contextShowTimer = setTimeout(function() {
        if (videoFrame) videoFrame.classList.add('dim');
        if (contextPanel) {
          contextPanel.classList.remove('exit');
          void contextPanel.offsetWidth;
          contextPanel.classList.add('active');
        }
        contextHideTimer = setTimeout(function() {
          if (contextPanel) {
            contextPanel.classList.remove('active');
            contextPanel.classList.add('exit');
          }
          if (videoFrame) videoFrame.classList.remove('dim');
        }, 10000);
      }, 20000);

      videoFadeTimer = setTimeout(function() {
        if (videoFadeOverlay) videoFadeOverlay.classList.add('fading');
      }, FADE_OUT_START * 1000);

      videoCutTimer = setTimeout(function() {
        if (videoFrame) {
          videoFrame.classList.remove('expanded');
          videoFrame.classList.add('contracting');
        }
        setTimeout(function() {
          overheadVideo.pause();
        }, 800);
      }, VIDEO_DURATION * 1000);
    }, 4200);
  }
}

document.addEventListener('DOMContentLoaded', init);
