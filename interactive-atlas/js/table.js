// BroadcastChannel for communicating with overhead display
var channel = new BroadcastChannel('atlas-channel');

// Icon map for each world category
var ICONS = {
  monuments:  '../UNESCO_ICON_KNOWLEDGE.svg',
  nature:     '../UNESCO_ICON_NATURE.svg',
  intangible: '../UNESCO_ICON_HERITAGE.svg',
  language:   '../UNESCO_ICON_LANGUAGE.svg'
};

// World categories — cream (#e7e2de) for intangible
var WORLDS = {
  monuments:  { name: 'The World Built Through Us',       color: '#2491d0', css: 'monuments'  },
  nature:     { name: 'The World That Sustains Us',        color: '#9dd3b2', css: 'nature'     },
  language:   { name: 'The World That Remembers Us',       color: '#f8e166', css: 'language'   },
  intangible: { name: 'The World That Moves Within Us',    color: '#e7e2de', css: 'intangible' }
};

// Full 20-site activation sequence with descriptions
var SEQUENCE = [
  // Monuments (Blue)
  { zone: 1,  world: 'monuments',  location: 'Machu Picchu',               region: 'Cusco Region, Peru',            desc: 'A 15th-century Inca citadel set high in the Andes Mountains, renowned for its sophisticated dry-stone construction and panoramic terraces.' },
  { zone: 2,  world: 'monuments',  location: 'Joya de Cer\u00e9n',         region: 'La Libertad, El Salvador',      desc: 'A pre-Columbian Maya farming village buried by volcanic ash around 600 CE, offering an extraordinary snapshot of daily life in Mesoamerica.' },
  { zone: 3,  world: 'monuments',  location: 'Borobudur',                  region: 'Central Java, Indonesia',       desc: 'The world\u2019s largest Buddhist temple, built in the 9th century with over 2,600 relief panels and 504 Buddha statues across nine stacked platforms.' },
  { zone: 4,  world: 'monuments',  location: 'Petra',                      region: "Ma'an Governorate, Jordan",     desc: 'An ancient Nabataean city carved into rose-red sandstone cliffs, blending Eastern and Hellenistic architectural traditions.' },
  { zone: 5,  world: 'monuments',  location: 'Timbuktu',                   region: 'Mali, West Africa',             desc: 'A historic center of Islamic scholarship and trade, home to three great mosques and thousands of ancient manuscripts.' },
  { zone: 6,  world: 'monuments',  location: 'Nan Madol',                  region: 'Pohnpei, Micronesia',           desc: 'A ceremonial center built on artificial islands of basalt and coral, sometimes called the \u201cVenice of the Pacific.\u201d' },
  // Nature (Green)
  { zone: 7,  world: 'nature',     location: 'Great Barrier Reef',         region: 'Queensland, Australia',         desc: 'The world\u2019s largest coral reef system, spanning over 2,300 kilometres and home to extraordinary marine biodiversity.' },
  { zone: 8,  world: 'nature',     location: 'Serengeti National Park',    region: 'Northern Tanzania',             desc: 'A vast ecosystem famous for the annual migration of over 1.5 million wildebeest and hundreds of thousands of zebra.' },
  { zone: 9,  world: 'nature',     location: 'Socotra Archipelago',        region: 'Arabian Sea, Yemen',            desc: 'An isolated archipelago with one of the most distinct floras on Earth, including the iconic dragon blood tree.' },
  { zone: 10, world: 'nature',     location: 'Wulingyuan Scenic Area',     region: 'Hunan Province, China',         desc: 'Over 3,000 quartzite sandstone pillars and peaks rising above subtropical forest, shaped by millions of years of erosion.' },
  { zone: 11, world: 'nature',     location: 'Lake Turkana',               region: 'Northern Kenya',                desc: 'The world\u2019s largest desert lake and a critical site for the study of human evolution, with major fossil discoveries.' },
  { zone: 12, world: 'nature',     location: 'Grand Canyon',               region: 'Arizona, United States',        desc: 'A steep-sided canyon carved by the Colorado River, revealing nearly two billion years of Earth\u2019s geological history.' },
  // Intangible Heritage (Cream)
  { zone: 13, world: 'intangible', location: 'Flamenco',                   region: 'Andalusia, Spain',              desc: 'A deeply expressive art form combining cante (singing), baile (dance), and toque (guitar), rooted in Andalusian culture.' },
  { zone: 14, world: 'intangible', location: 'Jazz',                       region: 'New Orleans, United States',    desc: 'Born from African American communities, jazz is defined by improvisation, syncopated rhythms, and blues tonality.' },
  { zone: 15, world: 'intangible', location: 'Backstrap Loom Weaving',     region: 'Guatemalan Highlands',          desc: 'An ancient Maya textile tradition using portable looms, producing vibrant handwoven fabrics that carry cultural identity.' },
  { zone: 16, world: 'intangible', location: 'Tango',                      region: 'Buenos Aires, Argentina',       desc: 'A passionate dance and musical genre born in the R\u00edo de la Plata region, blending European and African influences.' },
  // Languages (Yellow)
  { zone: 17, world: 'language',   location: '\u02bbŌlelo Hawai\u02bbi',   region: 'Hawaii, United States',         desc: 'The native language of Hawaii, nearly lost by the 1980s, now being revived through immersion schools and cultural programs.' },
  { zone: 18, world: 'language',   location: 'N\u00fcshu Script',          region: 'Hunan Province, China',         desc: 'The only known writing system created and used exclusively by women, a remarkable expression of female solidarity.' },
  { zone: 19, world: 'language',   location: 'Occitan',                    region: 'Southern France',               desc: 'A Romance language that was the literary language of medieval troubadours, now classified as severely endangered.' },
  { zone: 20, world: 'language',   location: 'Ainu',                       region: 'Hokkaido, Japan',               desc: 'A critically endangered language isolate of the indigenous Ainu people, known for its rich oral epic traditions.' }
];

var currentIndex = -1;
var markers = [];
var worldIndicator = null;
var statusZone = null;
var progressDots = [];

// Context panel elements
var contextIcon = null;
var contextLocation = null;
var contextRegion = null;
var contextWorld = null;
var contextDesc = null;

function init() {
  worldIndicator = document.getElementById('world-indicator');
  statusZone = document.getElementById('status-zone');

  // Context panel
  contextIcon = document.getElementById('context-icon');
  contextLocation = document.getElementById('context-location');
  contextRegion = document.getElementById('context-region');
  contextWorld = document.getElementById('context-world');
  contextDesc = document.getElementById('context-desc');

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

  // Update bottom context panel
  contextIcon.src = ICONS[entry.world];
  contextIcon.style.display = 'block';
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
