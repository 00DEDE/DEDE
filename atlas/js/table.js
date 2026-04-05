// BroadcastChannel for communicating with overhead display
var channel = new BroadcastChannel('atlas-channel');

// World categories
var WORLDS = {
  monuments:  { name: 'The World Built Through Us',       color: '#2491d0', css: 'monuments'  },
  nature:     { name: 'The World That Sustains Us',        color: '#9dd3b2', css: 'nature'     },
  language:   { name: 'The World That Remembers Us',       color: '#f8e166', css: 'language'   },
  intangible: { name: 'The World That Moves Within Us',    color: '#e7e2de', css: 'intangible' }
};

// Demo activation sequence
var SEQUENCE = [
  { zone: 1,  world: 'monuments',  location: 'Angkor Wat',                 coords: { x: 74, y: 48 } },
  { zone: 2,  world: 'nature',     location: 'Gal\u00e1pagos Islands',     coords: { x: 22, y: 55 } },
  { zone: 3,  world: 'language',   location: 'Ainu Language Region',       coords: { x: 82, y: 32 } },
  { zone: 4,  world: 'intangible', location: 'Djemaa el-Fna',              coords: { x: 44, y: 38 } },
  { zone: 5,  world: 'monuments',  location: 'Machu Picchu',               coords: { x: 24, y: 60 } },
  { zone: 6,  world: 'nature',     location: 'Great Barrier Reef',         coords: { x: 84, y: 66 } },
  { zone: 7,  world: 'language',   location: 'Welsh Language Heartland',   coords: { x: 43, y: 28 } },
  { zone: 8,  world: 'intangible', location: 'Tango of Buenos Aires',      coords: { x: 27, y: 74 } },
  { zone: 9,  world: 'monuments',  location: 'Petra',                      coords: { x: 54, y: 38 } },
  { zone: 10, world: 'nature',     location: 'Serengeti Plains',           coords: { x: 52, y: 56 } }
];

var currentIndex = -1;
var markers = [];
var label = null;
var worldIndicator = null;
var statusZone = null;
var progressDots = [];

function init() {
  label = document.getElementById('zone-label');
  worldIndicator = document.getElementById('world-indicator');
  statusZone = document.getElementById('status-zone');

  // Create progress dots
  var dotsContainer = document.getElementById('progress-dots');
  SEQUENCE.forEach(function(_, i) {
    var dot = document.createElement('div');
    dot.className = 'progress-dot';
    dotsContainer.appendChild(dot);
    progressDots.push(dot);
  });

  // Collect zone markers from SVG
  SEQUENCE.forEach(function(entry, i) {
    var marker = document.getElementById('zone-' + entry.zone);
    if (marker) markers.push(marker);
  });

  // Keyboard controls
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      activateNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      activatePrev();
    }
  });
}

function activateNext() {
  if (currentIndex < SEQUENCE.length - 1) {
    activateZone(currentIndex + 1);
  }
}

function activatePrev() {
  if (currentIndex > 0) {
    activateZone(currentIndex - 1);
  }
}

function activateZone(index) {
  var prev = currentIndex;
  currentIndex = index;
  var entry = SEQUENCE[index];
  var world = WORLDS[entry.world];

  // Deactivate previous marker
  if (prev >= 0 && markers[prev]) {
    markers[prev].classList.remove('active');
    var prevDot = markers[prev].querySelector('.zone-dot');
    var prevRing = markers[prev].querySelector('.zone-ring');
    var prevPulse = markers[prev].querySelector('.zone-pulse');
    if (prevDot) { prevDot.classList.remove('fill-' + WORLDS[SEQUENCE[prev].world].css); }
    if (prevRing) { prevRing.classList.remove('stroke-' + WORLDS[SEQUENCE[prev].world].css); }
    if (prevPulse) { prevPulse.classList.remove('stroke-' + WORLDS[SEQUENCE[prev].world].css); }
  }

  // Activate current marker
  if (markers[index]) {
    markers[index].classList.add('active');
    var dot = markers[index].querySelector('.zone-dot');
    var ring = markers[index].querySelector('.zone-ring');
    var pulse = markers[index].querySelector('.zone-pulse');
    if (dot) { dot.classList.add('fill-' + world.css); }
    if (ring) { ring.classList.add('stroke-' + world.css); }
    if (pulse) { pulse.classList.add('stroke-' + world.css); }
  }

  // Position and show label
  var svgEl = document.querySelector('.map-svg');
  var svgRect = svgEl.getBoundingClientRect();
  var lx = svgRect.left + (entry.coords.x / 100) * svgRect.width;
  var ly = svgRect.top + (entry.coords.y / 100) * svgRect.height;

  label.className = 'zone-label visible';
  label.style.left = (lx + 16) + 'px';
  label.style.top = (ly - 24) + 'px';
  label.style.borderColor = world.color;
  label.innerHTML = '<span class="label-category" style="color:' + world.color + '">' + world.name + '</span>' + entry.location;

  // World indicator
  worldIndicator.className = 'world-indicator visible';
  worldIndicator.style.color = world.color;
  worldIndicator.innerHTML = 'Zone ' + entry.zone + '<div class="world-name">' + entry.location + '</div>';

  // Status bar
  statusZone.textContent = 'Zone ' + entry.zone + ' \u2014 ' + entry.location;
  statusZone.style.color = world.color;

  // Progress dots
  progressDots.forEach(function(dot, i) {
    dot.className = 'progress-dot';
    if (i < index) dot.classList.add('visited');
    if (i === index) {
      dot.classList.add('current');
      dot.style.background = world.color;
    } else {
      dot.style.background = '';
    }
  });

  // Broadcast to overhead display
  channel.postMessage({
    type: 'zone-activate',
    zone: entry.zone,
    world: entry.world,
    worldName: world.name,
    location: entry.location,
    color: world.color,
    index: index,
    total: SEQUENCE.length
  });
}

document.addEventListener('DOMContentLoaded', init);
