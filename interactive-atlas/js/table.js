// BroadcastChannel for communicating with overhead display
var channel = new BroadcastChannel('atlas-channel');

// Icon SVG paths for CSS mask
var ICON_MASKS = {
  monuments:  "url('../UNESCO_ICON_KNOWLEDGE.svg')",
  nature:     "url('../UNESCO_ICON_NATURE.svg')",
  intangible: "url('../UNESCO_ICON_HERITAGE.svg')",
  language:   "url('../UNESCO_ICON_LANGUAGE.svg')"
};

// Icon paths for context panel
var ICON_SRCS = {
  monuments:  '../UNESCO_ICON_KNOWLEDGE.svg',
  nature:     '../UNESCO_ICON_NATURE.svg',
  intangible: '../UNESCO_ICON_HERITAGE.svg',
  language:   '../UNESCO_ICON_LANGUAGE.svg'
};

// World categories — cream (#e7e2de) for intangible
var WORLDS = {
  monuments:  { name: 'The World Built Through Us',    color: '#2491d0', css: 'monuments'  },
  nature:     { name: 'The World That Sustains Us',     color: '#9dd3b2', css: 'nature'     },
  language:   { name: 'The World That Remembers Us',    color: '#f8e166', css: 'language'   },
  intangible: { name: 'The World That Moves Within Us', color: '#e7e2de', css: 'intangible' }
};

// 20 heritage sites — positioned on geographic grid
// Grid columns (%): 13, 24, 37, 48, 57, 69, 81
// Grid rows (%):    19, 34, 48, 63, 76
var SEQUENCE = [
  { zone: 1,  world: 'monuments',  location: 'Machu Picchu',             region: 'Cusco Region, Peru',         desc: 'A 15th-century Inca citadel set high in the Andes Mountains, renowned for its sophisticated dry-stone construction and panoramic terraces.',                    left: 24, top: 63 },
  { zone: 2,  world: 'monuments',  location: 'Joya de Cer\u00e9n',       region: 'La Libertad, El Salvador',   desc: 'A pre-Columbian Maya farming village buried by volcanic ash around 600 CE, offering an extraordinary snapshot of daily life in Mesoamerica.',                  left: 13, top: 48 },
  { zone: 3,  world: 'monuments',  location: 'Borobudur',                region: 'Central Java, Indonesia',    desc: 'The world\u2019s largest Buddhist temple, built in the 9th century with over 2,600 relief panels and 504 Buddha statues across nine stacked platforms.',         left: 69, top: 48 },
  { zone: 4,  world: 'monuments',  location: 'Petra',                    region: "Ma'an Governorate, Jordan",  desc: 'An ancient Nabataean city carved into rose-red sandstone cliffs, blending Eastern and Hellenistic architectural traditions.',                                  left: 57, top: 34 },
  { zone: 5,  world: 'monuments',  location: 'Timbuktu',                 region: 'Mali, West Africa',          desc: 'A historic center of Islamic scholarship and trade, home to three great mosques and thousands of ancient manuscripts.',                                       left: 37, top: 48 },
  { zone: 6,  world: 'monuments',  location: 'Nan Madol',                region: 'Pohnpei, Micronesia',        desc: 'A ceremonial center built on artificial islands of basalt and coral, sometimes called the \u201cVenice of the Pacific.\u201d',                                 left: 81, top: 48 },
  { zone: 7,  world: 'nature',     location: 'Great Barrier Reef',       region: 'Queensland, Australia',      desc: 'The world\u2019s largest coral reef system, spanning over 2,300 kilometres and home to extraordinary marine biodiversity.',                                    left: 69, top: 63 },
  { zone: 8,  world: 'nature',     location: 'Serengeti National Park',  region: 'Northern Tanzania',          desc: 'A vast ecosystem famous for the annual migration of over 1.5 million wildebeest and hundreds of thousands of zebra.',                                        left: 48, top: 63 },
  { zone: 9,  world: 'nature',     location: 'Socotra Archipelago',      region: 'Arabian Sea, Yemen',         desc: 'An isolated archipelago with one of the most distinct floras on Earth, including the iconic dragon blood tree.',                                              left: 57, top: 48 },
  { zone: 10, world: 'nature',     location: 'Wulingyuan Scenic Area',   region: 'Hunan Province, China',      desc: 'Over 3,000 quartzite sandstone pillars and peaks rising above subtropical forest, shaped by millions of years of erosion.',                                   left: 69, top: 19 },
  { zone: 11, world: 'nature',     location: 'Lake Turkana',             region: 'Northern Kenya',             desc: 'The world\u2019s largest desert lake and a critical site for the study of human evolution, with major fossil discoveries.',                                   left: 48, top: 48 },
  { zone: 12, world: 'nature',     location: 'Grand Canyon',             region: 'Arizona, United States',     desc: 'A steep-sided canyon carved by the Colorado River, revealing nearly two billion years of Earth\u2019s geological history.',                                   left: 24, top: 19 },
  { zone: 13, world: 'intangible', location: 'Flamenco',                 region: 'Andalusia, Spain',           desc: 'A deeply expressive art form combining cante (singing), baile (dance), and toque (guitar), rooted in Andalusian culture.',                                    left: 48, top: 34 },
  { zone: 14, world: 'intangible', location: 'Jazz',                     region: 'New Orleans, United States', desc: 'Born from African American communities, jazz is defined by improvisation, syncopated rhythms, and blues tonality.',                                          left: 24, top: 34 },
  { zone: 15, world: 'intangible', location: 'Backstrap Loom Weaving',   region: 'Guatemalan Highlands',       desc: 'An ancient Maya textile tradition using portable looms, producing vibrant handwoven fabrics that carry cultural identity.',                                    left: 24, top: 48 },
  { zone: 16, world: 'intangible', location: 'Tango',                    region: 'Buenos Aires, Argentina',    desc: 'A passionate dance and musical genre born in the R\u00edo de la Plata region, blending European and African influences.',                                     left: 37, top: 76 },
  { zone: 17, world: 'language',   location: '\u02bbŌlelo Hawai\u02bbi', region: 'Hawaii, United States',      desc: 'The native language of Hawaii, nearly lost by the 1980s, now being revived through immersion schools and cultural programs.',                                   left: 13, top: 34 },
  { zone: 18, world: 'language',   location: 'N\u00fcshu Script',        region: 'Hunan Province, China',      desc: 'The only known writing system created and used exclusively by women, a remarkable expression of female solidarity.',                                          left: 81, top: 34 },
  { zone: 19, world: 'language',   location: 'Occitan',                  region: 'Southern France',            desc: 'A Romance language that was the literary language of medieval troubadours, now classified as severely endangered.',                                             left: 48, top: 19 },
  { zone: 20, world: 'language',   location: 'Ainu',                     region: 'Hokkaido, Japan',            desc: 'A critically endangered language isolate of the indigenous Ainu people, known for its rich oral epic traditions.',                                              left: 81, top: 19 }
];

var currentIndex = -1;
var markerEls = [];
var worldIndicator = null;
var statusZone = null;
var progressDots = [];
var contextPanelIcon = null;
var contextLocation = null;
var contextRegion = null;
var contextWorld = null;
var contextDesc = null;

function init() {
  worldIndicator = document.getElementById('world-indicator');
  statusZone = document.getElementById('status-zone');
  contextPanelIcon = document.getElementById('context-panel-icon');
  contextLocation = document.getElementById('context-location');
  contextRegion = document.getElementById('context-region');
  contextWorld = document.getElementById('context-world');
  contextDesc = document.getElementById('context-desc');

  var markersLayer = document.getElementById('markers-layer');

  // Create progress dots
  var dotsContainer = document.getElementById('progress-dots');
  SEQUENCE.forEach(function(_, i) {
    var dot = document.createElement('div');
    dot.className = 'progress-dot';
    dotsContainer.appendChild(dot);
    progressDots.push(dot);
  });

  // Generate HTML markers
  SEQUENCE.forEach(function(entry, i) {
    var marker = document.createElement('div');
    marker.className = 'marker';
    marker.id = 'marker-' + entry.zone;
    marker.style.left = entry.left + '%';
    marker.style.top = entry.top + '%';
    marker.style.setProperty('--delay', (i * 0.08) + 's');
    marker.style.setProperty('--float-delay', (Math.random() * 4) + 's');
    marker.style.setProperty('--world-color', WORLDS[entry.world].color);

    // Pulse ring
    var pulse = document.createElement('div');
    pulse.className = 'marker-pulse';
    marker.appendChild(pulse);

    // Glow
    var glow = document.createElement('div');
    glow.className = 'marker-glow';
    marker.appendChild(glow);

    // Ring
    var ring = document.createElement('div');
    ring.className = 'marker-ring';
    marker.appendChild(ring);

    // Icon (using mask)
    var icon = document.createElement('div');
    icon.className = 'marker-icon';
    var mask = ICON_MASKS[entry.world];
    icon.style.webkitMaskImage = mask;
    icon.style.maskImage = mask;
    marker.appendChild(icon);

    // Click handler
    marker.addEventListener('click', function() {
      activateZone(i);
    });

    markersLayer.appendChild(marker);
    markerEls.push(marker);
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
  if (prev >= 0 && markerEls[prev]) {
    markerEls[prev].classList.remove('active');
    markerEls[prev].classList.add('visited');
  }

  // Activate current marker
  if (markerEls[index]) {
    markerEls[index].classList.remove('visited');
    markerEls[index].classList.add('active');
  }

  // Update context panel icon mask
  var panelMask = ICON_MASKS[entry.world];
  contextPanelIcon.style.webkitMaskImage = panelMask;
  contextPanelIcon.style.maskImage = panelMask;
  contextPanelIcon.style.backgroundColor = world.color;
  contextPanelIcon.style.display = 'block';

  // Update context panel text
  contextLocation.textContent = entry.location;
  contextLocation.style.color = world.color;
  contextRegion.textContent = entry.region;
  contextWorld.textContent = world.name;
  contextWorld.style.color = world.color;
  contextDesc.textContent = entry.desc;

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
    desc: entry.desc,
    index: index,
    total: SEQUENCE.length
  });
}

document.addEventListener('DOMContentLoaded', init);
