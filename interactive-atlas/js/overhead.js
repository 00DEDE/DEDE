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
var videoSubtitle = null;
var currentSubtitles = null;
var currentSubtitleStart = 0;
var lastSubtitleIndex = -1;
var videoFadeTimer = null;
var videoCutTimer = null;
var introTimer = null;
var videoStartTimer = null;
var contextShowTimer = null;
var contextHideTimer = null;
var audioFadeTimer = null;

function rampVolume(durationSec, fromVol, toVol) {
  if (!overheadVideo) return;
  if (fromVol == null) fromVol = 0;
  if (toVol == null) toVol = 1;
  var steps = 30;
  var interval = (durationSec * 1000) / steps;
  var i = 0;
  if (audioFadeTimer) clearInterval(audioFadeTimer);
  try { overheadVideo.volume = fromVol; } catch (e) {}
  audioFadeTimer = setInterval(function() {
    i++;
    var p = Math.min(1, i / steps);
    var v = fromVol + (toVol - fromVol) * p;
    try { overheadVideo.volume = Math.max(0, Math.min(1, v)); } catch (e) {}
    if (i >= steps) { clearInterval(audioFadeTimer); audioFadeTimer = null; }
  }, interval);
}

var AUDIO_FADE_OUT_SEC = 7;
var audioFadeOutTriggered = false;
function onVideoEnded() { gracefulClose(); }
function onTimeUpdateAudioFadeOut() {
  if (!overheadVideo || audioFadeOutTriggered) return;
  var dur = overheadVideo.duration;
  if (!isFinite(dur)) return;
  if (overheadVideo.currentTime >= dur - AUDIO_FADE_OUT_SEC) {
    audioFadeOutTriggered = true;
    var currentVol = overheadVideo.volume;
    rampVolume(AUDIO_FADE_OUT_SEC, currentVol, 0);
    // Pair the audio ramp-out with a visual opacity fade so picture and
    // sound disappear together.
    overheadVideo.classList.remove('playing');
    overheadVideo.classList.add('fading-out');
  }
}

function showSubtitle(text) {
  if (!videoSubtitle) return;
  videoSubtitle.textContent = text;
  videoSubtitle.classList.add('visible');
}

function hideSubtitle() {
  if (!videoSubtitle) return;
  videoSubtitle.classList.remove('visible');
}

// Subtitle entries' .start/.end are relative to videoStart, so subtract
// currentSubtitleStart from currentTime to get the elapsed-since-start clock.
function onTimeUpdateSubtitle() {
  if (!overheadVideo || !currentSubtitles) return;
  var t = overheadVideo.currentTime - currentSubtitleStart;
  var found = -1;
  for (var i = 0; i < currentSubtitles.length; i++) {
    var s = currentSubtitles[i];
    if (t >= s.start && t < s.end) { found = i; break; }
  }
  if (found === lastSubtitleIndex) return;
  lastSubtitleIndex = found;
  if (found === -1) {
    hideSubtitle();
  } else {
    showSubtitle(currentSubtitles[found].text);
  }
}

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

// Render a world-bar label on two lines. Long names like "The World Built Through Us"
// break after "The World"; short category labels ("Built Monuments") break at the
// first space.
function twoLineLabel(s) {
  if (!s) return '';
  var escape = function(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  var worldMatch = s.match(/^(The World)\s+(.+)$/i);
  if (worldMatch) return escape(worldMatch[1]) + '<br>' + escape(worldMatch[2]);
  var spaceIdx = s.indexOf(' ');
  if (spaceIdx > 0) return escape(s.slice(0, spaceIdx)) + '<br>' + escape(s.slice(spaceIdx + 1));
  return escape(s);
}

function startLabelToggle(shortText, longText) {
  if (labelToggleInterval) clearInterval(labelToggleInterval);
  labelTogglePhase = 0;
  labelToggleInterval = setInterval(function() {
    if (!worldBarText) return;
    worldBarText.classList.add('swap');
    setTimeout(function() {
      labelTogglePhase = 1 - labelTogglePhase;
      worldBarText.innerHTML = twoLineLabel(labelTogglePhase === 0 ? shortText : longText);
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
  videoSubtitle    = document.getElementById('video-subtitle');

  // Site context overlay
  contextPanel        = document.getElementById('context-panel');
  contextLocation     = document.getElementById('context-location');
  contextPronunciation = document.getElementById('context-pronunciation');
  contextCoordinates  = document.getElementById('context-coordinates');
  contextRegion       = document.getElementById('context-region');
  contextCivilization = document.getElementById('context-civilization');
  contextInsight      = document.getElementById('context-insight');

  // Introduction paragraphs — play first, then the intro overlay takes over.
  //   1. paragraphs fade in/out one at a time on the text overlay
  //   2. text overlay fades out
  //   3. intro overlay plays phase-1 → phase-2 → phase-3-solo → phase-3 → phase-4
  var introTextOverlay = document.getElementById('intro-text-overlay');
  var introTimeouts = [];
  function introTimeout(fn, delay) {
    var id = setTimeout(fn, delay);
    introTimeouts.push(id);
    return id;
  }
  var textFadeTime = 0;
  if (introTextOverlay) {
    var paragraphs = document.querySelectorAll('#intro-text-content p');
    var paraFadeIn = 2500;
    var paraFadeOut = 2000;
    var paraGap = 800;
    var paraHolds = [7800, 13700, 7800];

    var cursor = 0;
    for (var p = 0; p < paragraphs.length; p++) {
      (function(idx, t) {
        introTimeout(function() {
          paragraphs[idx].classList.add('para-visible');
        }, t);
        introTimeout(function() {
          paragraphs[idx].classList.remove('para-visible');
          paragraphs[idx].classList.add('para-exit');
        }, t + paraFadeIn + paraHolds[idx]);
      })(p, cursor);
      cursor += paraFadeIn + paraHolds[p] + paraFadeOut + paraGap;
    }

    textFadeTime = cursor - paraGap + 500;
    introTimeout(function() {
      introTextOverlay.classList.add('fade-out');
      introTimeout(function() { introTextOverlay.remove(); }, 2000);
    }, textFadeTime);
  }

  // Intro overlay choreography — mirrors table display's pacing:
  //   t=0        UNESCO logo drifts in (phase-1)
  //   t=4.5s     logo out, Digital Atlas splash in (phase-2)
  //   t=9.5s     splash out, each icon cycles solo at center (phase-3-solo)
  //   t=20.8s    all four icons stagger in as a row (phase-3 group)
  //   t=23.6s    phase-4 final resting: title above + horizontal logo below
  //              → this is the state that persists until a zone activates.
  if (introOverlay) {
    // Kick off intro phases after the text overlay has fully faded out
    var introStart = textFadeTime + 2000;
    var introIconItems = introOverlay.querySelectorAll('.intro-icon-item');
    introTimeout(function() {
      introOverlay.classList.add('phase-1');
      introTimeout(function() { introOverlay.classList.add('phase-2'); }, 4500);

      var soloStart = 9500;
      var soloDuration = 2600;
      introTimeout(function() { introOverlay.classList.add('phase-3-solo'); }, soloStart);
      for (var s = 0; s < 4; s++) {
        (function(idx) {
          introTimeout(function() {
            introIconItems.forEach(function(el) { el.classList.remove('solo-active'); });
            if (introIconItems[idx]) introIconItems[idx].classList.add('solo-active');
          }, soloStart + 500 + idx * soloDuration);
        })(s);
      }

      // phase-3 group — pin icons to opacity:0 first so the last solo icon's
      // opacity:1 doesn't bleed into the staggered group transition.
      var groupStart = soloStart + 500 + 4 * soloDuration + 400;
      introTimeout(function() {
        introIconItems.forEach(function(el) {
          el.classList.remove('solo-active');
          el.style.transition = 'none';
          el.style.opacity = '0';
        });
        introOverlay.classList.remove('phase-3-solo');
        void introOverlay.offsetWidth;
        requestAnimationFrame(function() {
          introIconItems.forEach(function(el) {
            el.style.transition = '';
            el.style.opacity = '';
          });
          void introOverlay.offsetWidth;
          introOverlay.classList.add('phase-3');
        });
      }, groupStart);

      // Phase-4 final resting — title above + horizontal logo below. Waits
      // for the slower phase-3 stagger to fully settle before revealing.
      // Icons settle at ~24500 (groupStart 20800 + 1.5s stagger + 2.2s transition).
      introTimeout(function() { introOverlay.classList.add('phase-4'); }, 25000);
    }, introStart);
  }

  // Jump the intro to its final resting state immediately (skip-intro).
  // Overhead stays on phase-4 until the first zone activation triggers dismissIntro().
  function skipIntroToRest() {
    introTimeouts.forEach(function(id) { clearTimeout(id); });
    introTimeouts.length = 0;
    if (introTextOverlay && introTextOverlay.parentNode) introTextOverlay.remove();
    if (!introOverlay) return;
    var iconItems = introOverlay.querySelectorAll('.intro-icon-item');
    iconItems.forEach(function(el) {
      el.classList.remove('solo-active');
      el.style.transition = 'none';
      el.style.opacity = '';
      el.style.transform = '';
      el.style.filter = '';
    });
    introOverlay.classList.remove('phase-1', 'phase-2', 'phase-3-solo');
    void introOverlay.offsetWidth;
    iconItems.forEach(function(el) { el.style.transition = ''; });
    introOverlay.classList.add('phase-3', 'phase-4');
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
    if (e.data.type === 'refresh-overhead') {
      location.reload();
    } else if (e.data.type === 'skip-intro') {
      skipIntroToRest();
    } else if (e.data.type === 'zone-activate') {
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
  if (audioFadeTimer) { clearInterval(audioFadeTimer); audioFadeTimer = null; }
  audioFadeOutTriggered = false;
  if (overheadVideo) {
    overheadVideo.removeEventListener('timeupdate', onTimeUpdateAudioFadeOut);
    overheadVideo.removeEventListener('timeupdate', onTimeUpdateSubtitle);
    overheadVideo.removeEventListener('ended', onVideoEnded);
  }
  hideSubtitle();
  currentSubtitles = null;
  lastSubtitleIndex = -1;
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

  // Fade the video itself out in sync with the audio ramp-down below.
  if (overheadVideo) {
    overheadVideo.classList.remove('playing');
    overheadVideo.classList.add('fading-out');
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
  if (audioFadeTimer) { clearInterval(audioFadeTimer); audioFadeTimer = null; }
  audioFadeOutTriggered = false;
  if (overheadVideo) {
    overheadVideo.removeEventListener('timeupdate', onTimeUpdateAudioFadeOut);
    overheadVideo.removeEventListener('timeupdate', onTimeUpdateSubtitle);
    overheadVideo.removeEventListener('ended', onVideoEnded);
  }
  hideSubtitle();

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
    // Nüshu: softens the harsh edge where the video's bottom black band
    // meets the video content, without covering the burned subtitles.
    if (data.location && data.location.indexOf('\u00fcshu') >= 0) {
      videoFrame.classList.add('has-bottom-fade');
    }
    var c = data.color;
    videoFrame.style.setProperty('--frame-glow', c + '18');
    videoFrame.style.setProperty('--frame-glow-wide', c + '0a');
  }

  // --- Phase 1: Show title, icon, context ---
  if (overheadIcon && ICON_MASKS[data.world]) {
    overheadIcon.style.webkitMaskImage = ICON_MASKS[data.world];
    overheadIcon.style.maskImage = ICON_MASKS[data.world];
    overheadIcon.style.backgroundColor = data.color;
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
  worldBarText.innerHTML = twoLineLabel(shortLabel);
  worldBar.style.color = data.color;
  startLabelToggle(shortLabel, longLabel);

  if (ICON_MASKS[data.world]) {
    worldBarIcon.style.webkitMaskImage = ICON_MASKS[data.world];
    worldBarIcon.style.maskImage = ICON_MASKS[data.world];
    worldBarIcon.style.backgroundColor = data.color;
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
      overheadVideo.style.transformOrigin = data.videoZoomOrigin || 'center center';
      overheadVideo.style.setProperty('--video-brightness', data.videoBrightness || 1);

      var startAt = data.videoStart || 0;
      // Default audio fade-in if the entry doesn't specify one — the user
      // wants every video to ease in audibly, not pop on at full volume.
      var fadeIn = data.audioFadeIn || 1.8;

      if (audioFadeTimer) { clearInterval(audioFadeTimer); audioFadeTimer = null; }
      if (fadeIn > 0) {
        overheadVideo.volume = 0;
      } else if (!overheadVideo.muted) {
        overheadVideo.volume = 1;
      }

      // Reset visual fade state — start fully transparent, then add .playing
      // after play() so the CSS transition runs.
      overheadVideo.classList.remove('playing', 'fading-out');

      // Subtitle setup — times in subtitle entries are RELATIVE to startAt,
      // so the same .start values map cleanly to where the video actually
      // begins playing (after seeking past the burned-in intro frames).
      currentSubtitles = (data.subtitles && data.subtitles.length) ? data.subtitles : null;
      currentSubtitleStart = startAt;
      lastSubtitleIndex = -1;
      hideSubtitle();

      var beginPlay = function() {
        overheadVideo.play().then(function() {
          if (videoFrame) videoFrame.classList.add('expanded');
          // Trigger the opacity fade-in on next frame so the transition
          // animates from 0 → 0.65 instead of jumping.
          requestAnimationFrame(function() {
            overheadVideo.classList.add('playing');
          });
          if (fadeIn > 0 && !overheadVideo.muted) rampVolume(fadeIn, 0, 1);
          overheadVideo.addEventListener('timeupdate', onTimeUpdateAudioFadeOut);
          if (currentSubtitles) {
            overheadVideo.addEventListener('timeupdate', onTimeUpdateSubtitle);
          }
          overheadVideo.addEventListener('ended', onVideoEnded, { once: true });
        }).catch(function() {
          if (videoFrame) videoFrame.classList.add('expanded');
          requestAnimationFrame(function() {
            overheadVideo.classList.add('playing');
          });
        });
      };
      var seekAndPlay = function() {
        try { if (startAt > 0) overheadVideo.currentTime = startAt; } catch (err) {}
        beginPlay();
      };
      if (startAt > 0 && overheadVideo.readyState < 1) {
        overheadVideo.addEventListener('loadedmetadata', seekAndPlay, { once: true });
      } else {
        try { overheadVideo.currentTime = startAt; } catch (err) {}
        beginPlay();
      }

      // Context overlay appears 18s into the video, lingers 10s, then fades.
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
      }, 18000);

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
