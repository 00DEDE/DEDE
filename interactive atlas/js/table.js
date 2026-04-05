// BroadcastChannel for communicating with overhead display
var channel = new BroadcastChannel('atlas-channel');

// World categories
var WORLDS = {
  monuments:  { name: 'The World Built Through Us',       color: '#2491d0', css: 'monuments'  },
  nature:     { name: 'The World That Sustains Us',        color: '#9dd3b2', css: 'nature'     },
  language:   { name: 'The World That Remembers Us',       color: '#f8e166', css: 'language'   },
  intangible: { name: 'The World That Moves Within Us',    color: '#675d52', css: 'intangible' }
};

// Full 20-site activation sequence
var SEQUENCE = [
  // Monuments (Blue)
  { zone: 1,  world: 'monuments',  location: 'Machu Picchu',               region: 'Cusco Region, Peru' },
  { zone: 2,  world: 'monuments',  location: 'Joya de Cer\u00e9n',         region: 'La Libertad, El Salvador' },
  { zone: 3,  world: 'monuments',  location: 'Borobudur',                  region: 'Central Java, Indonesia' },
  { zone: 4,  world: 'monuments',  location: 'Petra',                      region: "Ma'an Governorate, Jordan" },
  { zone: 5,  world: 'monuments',  location: 'Timbuktu',                   region: 'Mali, West Africa' },
  { zone: 6,  world: 'monuments',  location: 'Nan Madol',                  region: 'Pohnpei, Micronesia' },
  // Nature (Green)
  { zone: 7,  world: 'nature',     location: 'Great Barrier Reef',         region: 'Queensland, Australia' },
  { zone: 8,  world: 'nature',     location: 'Serengeti National Park',    region: 'Northern Tanzania' },
  { zone: 9,  world: 'nature',     location: 'Socotra Archipelago',        region: 'Arabian Sea, Yemen' },
  { zone: 10, world: 'nature',     location: 'Wulingyuan Scenic Area',     region: 'Hunan Province, China' },
  { zone: 11, world: 'nature',     location: 'Lake Turkana',               region: 'Northern Kenya' },
  { zone: 12, world: 'nature',     location: 'Grand Canyon',               region: 'Arizona, United States' },
  // Intangible Heritage (Brown)
  { zone: 13, world: 'intangible', location: 'Flamenco',                   region: 'Andalusia, Spain' },
  { zone: 14, world: 'intangible', location: 'Jazz',                       region: 'New Orleans, United States' },
  { zone: 15, world: 'intangible', location: 'Backstrap Loom Weaving',     region: 'Guatemalan Highlands' },
  { zone: 16, world: 'intangible', location: 'Tango',                      region: 'Buenos Aires, Argentina' },
  // Languages (Yellow)
  { zone: 17, world: 'language',   location: '\u02bbŌlelo Hawai\u02bbi',   region: 'Hawaii, United States' },
  { zone: 18, world: 'language',   location: 'N\u00fcshu Script',          region: 'Hunan Province, China' },
  { zone: 19, world: 'language',   location: 'Occitan',                    region: 'Southern France' },
  { zone: 20, world: 'language',   location: 'Ainu',                       region: 'Hokkaido, Japan' }
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
  SEQUENCE.forEach(function(entry) {
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

  // Click on zone markers
  markers.forEach(function(marker, i) {
    marker.addEventListener('click', function() {
      activateZone(i);
    });
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
    markers[prev].classList.remove('world-' + WORLDS[SEQUENCE[prev].world].css);
  }

  // Activate current marker
  if (markers[index]) {
    markers[index].classList.add('active');
    markers[index].classList.add('world-' + world.css);
  }

  // Position and show label near the marker
  var svgEl = document.querySelector('.map-svg');
  var markerEl = markers[index];
  var svgRect = svgEl.getBoundingClientRect();
  var markerTransform = markerEl.getAttribute('transform');
  var match = markerTransform.match(/translate\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
  if (match) {
    var mx = parseFloat(match[1]);
    var my = parseFloat(match[2]);
    // Convert SVG coords to screen coords
    var viewBox = svgEl.viewBox.baseVal;
    var lx = svgRect.left + (mx / viewBox.width) * svgRect.width;
    var ly = svgRect.top + (my / viewBox.height) * svgRect.height;

    label.className = 'zone-label visible';
    label.style.left = (lx + 20) + 'px';
    label.style.top = (ly - 28) + 'px';
    label.style.borderColor = world.color;
    label.innerHTML = '<span class="label-category" style="color:' + world.color + '">' + world.name + '</span>' +
                      '<span class="label-location">' + entry.location + '</span>' +
                      '<span class="label-region">' + entry.region + '</span>';
  }

  // World indicator
  worldIndicator.className = 'world-indicator visible';
  worldIndicator.style.color = world.color;
  worldIndicator.innerHTML = 'Zone ' + entry.zone + ' of ' + SEQUENCE.length +
    '<div class="world-name">' + entry.location + '</div>';

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
    region: entry.region,
    color: world.color,
    index: index,
    total: SEQUENCE.length
  });
}

document.addEventListener('DOMContentLoaded', init);
