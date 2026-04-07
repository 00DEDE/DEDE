// BroadcastChannel for communicating with overhead display
var channel = new BroadcastChannel('atlas-channel');

// Icon SVG paths for CSS mask
var ICON_MASKS = {
  monuments:  "url('assets/graphic/UNESCO_MONUMENT.svg')",
  nature:     "url('assets/graphic/UNESCO_NATURE.svg')",
  intangible: "url('assets/graphic/UNESCO_INTANGIBLE.svg')",
  language:   "url('assets/graphic/UNESCO_LANGUAGE.svg')"
};

// World categories — cream (#e7e2de) for intangible
var WORLDS = {
  monuments:  { name: 'The World Built Through Us',    color: '#2491d0', css: 'monuments'  },
  nature:     { name: 'The World That Sustains Us',     color: '#9dd3b2', css: 'nature'     },
  language:   { name: 'The World That Remembers Us',    color: '#f8e166', css: 'language'   },
  intangible: { name: 'The World That Moves Within Us', color: '#e7e2de', css: 'intangible' }
};

// 20 heritage sites — positions based on atlas reference map
// Coordinates as % of map-wrap (left, top)
var SEQUENCE = [
  // 1. Machu Picchu
  { zone: 1,  world: 'monuments',  location: 'Machu Picchu',             region: 'Cusco Region, Peru',         desc: 'High in the Andes Mountains, Machu Picchu stands as a remarkable expression of Inca ingenuity and environmental understanding. Built in the fifteenth century, the city was carefully integrated into steep mountain ridges, with agricultural terraces and precisely carved stone buildings shaping the landscape. Rather than dominating nature, the Inca worked in harmony with it, studying drainage, soil stability, and sacred geography.',                    page: 40, left: 34, top: 69, video: 'assets/videos/machu_picchu_video_1.mp4' },
  // 2. Nüshu Script
  { zone: 2,  world: 'language',   location: 'N\u00fcshu Script',        region: 'Hunan Province, China',      desc: 'N\u00fcshu is one of the world\u2019s most unique writing systems, developed and used exclusively by women in rural China. For generations, women in Hunan Province created this delicate script to communicate through letters, poems, and songs. In societies where formal education for women was limited, N\u00fcshu became a space for emotional expression, friendship, and resistance \u2014 a remarkable testament to female solidarity and creativity.',                                          page: 78, left: 73, top: 32, video: 'assets/videos/nushu_video%201.mp4' },
  // 3. Socotra
  { zone: 3,  world: 'nature',     location: 'Socotra Archipelago',      region: 'Arabian Sea, Yemen',         desc: 'Isolated in the Arabian Sea, the Socotra Archipelago contains one of the most unique ecosystems on Earth. Over millions of years, the islands evolved in isolation, allowing plants and animals to develop forms found nowhere else. The iconic dragon blood tree, with its umbrella-shaped canopy, stands as a symbol of this extraordinary biological heritage and the fragile beauty of island ecosystems.',                                              page: 48, left: 63, top: 51 },
  // 4. Backstrap Loom Weaving
  { zone: 4,  world: 'intangible', location: 'Backstrap Loom Weaving',   region: 'Guatemalan Highlands',       desc: 'Across the highlands of Guatemala, Maya artisans continue a weaving tradition that stretches back thousands of years. Using simple backstrap looms attached to their bodies, weavers transform cotton and wool threads into vibrant textiles rich with symbolic meaning. Each pattern carries cultural identity, community history, and spiritual significance \u2014 a living language expressed through color and form.',                                    page: 68, left: 30, top: 55 },
  // 5. Great Barrier Reef
  { zone: 5,  world: 'nature',     location: 'Great Barrier Reef',       region: 'Queensland, Australia',      desc: 'Stretching across the warm waters of the Coral Sea, the Great Barrier Reef forms the largest coral ecosystem on Earth. Built slowly by tiny coral polyps over hundreds of thousands of years, the reef is a living structure shaped by cooperation between organisms and environment. These vibrant reefs regulate coastal ecosystems and sustain biodiversity on a planetary scale, sheltering fish, sea turtles, sharks, and countless other species.',                                    page: 56, left: 83, top: 76 },
  // 6. Flamenco
  { zone: 6,  world: 'intangible', location: 'Flamenco',                 region: 'Andalusia, Spain',           desc: 'Emerging from the cultural crossroads of southern Spain, Flamenco is a powerful artistic expression that blends music, dance, and poetry. Rooted in Andalusian communities, the tradition evolved through centuries of cultural exchange among Roma, Moorish, Jewish, and Spanish influences. Performers channel emotion through rhythmic footwork, expressive singing, and intricate guitar playing, creating conversations shaped by improvisation and deep emotional intensity.',                                    page: 64, left: 45, top: 38 },
  // 7. Ainu
  { zone: 7,  world: 'language',   location: 'Ainu',                     region: 'Hokkaido, Japan',            desc: 'The Ainu language carries the cultural memory and worldview of the Indigenous Ainu people of northern Japan. Traditionally spoken across Hokkaido, Sakhalin, and the Kuril Islands, the language reflects a deep relationship between people, animals, and the natural environment. Oral storytelling and epic songs known as yukar transmit history, spirituality, and ecological knowledge through generations.',                                              page: 82, left: 83, top: 42 },
  // 8. Petra
  { zone: 8,  world: 'monuments',  location: 'Petra',                    region: "Ma'an Governorate, Jordan",  desc: 'Hidden within narrow desert canyons in southern Jordan, Petra was once a thriving crossroads of ancient trade routes linking Arabia, Egypt, and the Mediterranean world. Founded by the Nabataean civilization more than two thousand years ago, the city is renowned for monumental structures carved directly into rose-colored sandstone cliffs. Sophisticated water management systems allowed Petra to flourish in an otherwise arid environment.',                                  page: 34, left: 58, top: 45 },
  // 9. Jazz
  { zone: 9,  world: 'intangible', location: 'Jazz',                     region: 'New Orleans, United States', desc: 'Born in the vibrant cultural city of New Orleans, jazz transformed music by placing improvisation at its core. Emerging from African American communities in the late nineteenth and early twentieth centuries, jazz blended blues, spirituals, ragtime, and marching band traditions into a new musical language. Musicians responded to one another spontaneously, creating performances that were never repeated exactly the same way.',                                          page: 66, left: 31, top: 41 },
  // 10. Serengeti
  { zone: 10, world: 'nature',     location: 'Serengeti National Park',  region: 'Northern Tanzania',          desc: 'Across the vast savannas of northern Tanzania, the Serengeti unfolds as one of the most dynamic ecosystems on Earth. Rolling grasslands stretch toward distant horizons where the seasonal rains guide the movement of millions of animals. Each year enormous herds of wildebeest, zebras, and gazelles migrate across the plains in search of fresh grazing, followed by predators that depend on the same cycle of life.',                                        page: 46, left: 58, top: 68 },
  // 11. Timbuktu
  { zone: 11, world: 'monuments',  location: 'Timbuktu',                 region: 'Mali, West Africa',          desc: 'At the southern edge of the Sahara Desert, Timbuktu emerged as one of the most influential centers of scholarship and trade in medieval Africa. Merchants carried gold, salt, manuscripts, and ideas across vast desert routes, transforming Timbuktu into a hub of intellectual life. Its famous mosques and universities attracted scholars from across the Islamic world, and thousands of handwritten manuscripts preserved knowledge of science, philosophy, and law.',                                       page: 36, left: 47, top: 49 },
  // 12. ʻŌlelo Hawaiʻi
  { zone: 12, world: 'language',   location: '\u02bbŌlelo Hawai\u02bbi', region: 'Hawaii, United States',      desc: 'For centuries, the Hawaiian language carried the knowledge, history, and worldview of Native Hawaiian culture. Oral traditions, chants, and genealogies preserved deep connections between people, land, and the natural world. By the late twentieth century, community leaders launched a powerful revitalization movement. Language immersion schools and cultural programs began teaching Hawaiian to new generations, ensuring this voice endures.',                                   page: 76, left: 10, top: 58 },
  // 13. Wulingyuan
  { zone: 13, world: 'nature',     location: 'Wulingyuan Scenic Area',   region: 'Hunan Province, China',      desc: 'In the mountainous region of Hunan Province, the Wulingyuan Scenic Area presents one of the most dramatic geological landscapes in the world. Thousands of towering sandstone pillars rise vertically from forested valleys, many reaching heights of more than two hundred meters. Over millions of years, wind, water, and erosion sculpted these formations into narrow spires, bridges, and ravines wrapped in drifting mist.',                                   page: 50, left: 73, top: 41 },
  // 14. Tango
  { zone: 14, world: 'intangible', location: 'Tango',                    region: 'Buenos Aires, Argentina',    desc: 'In the port cities of Buenos Aires and Montevideo, tango emerged from a fusion of cultures during the nineteenth century. Immigrants from Europe, enslaved Africans, and local communities contributed musical rhythms and dance traditions that evolved into this deeply expressive art form. Tango music combines violin, piano, and the distinctive sound of the bandon\u00e9on, while dancers communicate emotion through dramatic steps and close partnership.',                                     page: 70, left: 38, top: 82 },
  // 15. Lake Turkana
  { zone: 15, world: 'nature',     location: 'Lake Turkana',             region: 'Northern Kenya',             desc: 'In the arid landscapes of northern Kenya lies Lake Turkana, the largest desert lake in the world. Surrounded by volcanic formations and barren desert terrain, the lake creates a striking contrast between water and wilderness. The region contains important fossil sites that reveal crucial chapters in human evolution, with ancient hominid remains that have helped scientists understand possible origins of humanity.',                                   page: 52, left: 57, top: 60 },
  // 16. Borobudur
  { zone: 16, world: 'monuments',  location: 'Borobudur',                region: 'Central Java, Indonesia',    desc: 'Rising from the fertile plains of central Java, Borobudur stands as the largest Buddhist monument ever constructed. Built in the ninth century during the Sailendra dynasty, the temple was designed as a massive stone mandala symbolizing the Buddhist path toward enlightenment. Pilgrims ascend through nine terraces decorated with intricate relief carvings narrating stories of moral lessons, cosmology, and spiritual transformation.',         page: 32, left: 77, top: 58 },
  // 17. Occitan
  { zone: 17, world: 'language',   location: 'Occitan',                  region: 'Southern France',            desc: 'Once widely spoken across southern Europe, the Occitan language shaped one of the earliest literary traditions in medieval Europe. During the twelfth and thirteenth centuries, troubadour poets composed songs and poetry in Occitan that celebrated love, philosophy, and courtly culture. These works influenced the development of European literature and music far beyond their region of origin. Today Occitan survives through regional communities and cultural associations.',                                             page: 80, left: 51, top: 34 },
  // 18. Grand Canyon
  { zone: 18, world: 'nature',     location: 'Grand Canyon',             region: 'Arizona, United States',     desc: 'Believed to have been carved over millions of years by the relentless flow of the Colorado River, the Grand Canyon reveals one of the most extraordinary geological records on Earth. Layer upon layer of exposed rock tells a story of ancient oceans, deserts, and shifting continents. The canyon\u2019s immense scale stretches for hundreds of kilometers across the Arizona desert, holding deep spiritual and cultural significance for Indigenous peoples.',                                   page: 54, left: 25, top: 46 },
  // 19. Nan Madol
  { zone: 19, world: 'monuments',  location: 'Nan Madol',                region: 'Pohnpei, Micronesia',        desc: 'Rising from a lagoon along the island of Pohnpei, Nan Madol forms one of the most remarkable urban landscapes in the Pacific Ocean. Constructed between the twelfth and seventeenth centuries by the Saudeleur dynasty, the city was built upon a network of artificial islets connected by canals. Massive basalt columns, transported from distant quarries, were stacked into towering walls enclosing temples, residences, and ceremonial compounds.',                                 page: 38, left: 88, top: 54 },
  // 20. Joya de Cerén
  { zone: 20, world: 'monuments',  location: 'Joya de Cer\u00e9n',       region: 'La Libertad, El Salvador',   desc: 'Joya de Cer\u00e9n preserves an extraordinary snapshot of daily life in a Maya farming village. Around 600 CE, the nearby Loma Caldera volcano erupted, covering the settlement in ash and perfectly preserving homes, tools, crops, and communal buildings. Unlike many archaeological sites that highlight royal monuments, Joya de Cer\u00e9n reveals how ordinary people lived, worked, and organized their community.',                  page: 30, left: 33, top: 60 }
];

var currentIndex = -1;
var isActive = false;
var markerEls = [];
var worldIndicator = null;
var statusZone = null;
var progressDots = [];
var contextPanel = null;
var contextPanelIcon = null;
var contextLocation = null;
var contextRegion = null;
var contextWorld = null;
var contextDesc = null;
var legend = null;

function init() {
  worldIndicator = document.getElementById('world-indicator');
  statusZone = document.getElementById('status-zone');
  contextPanel = document.getElementById('context-panel');
  contextPanelIcon = document.getElementById('context-panel-icon');
  contextLocation = document.getElementById('context-location');
  contextRegion = document.getElementById('context-region');
  contextWorld = document.getElementById('context-world');
  contextDesc = document.getElementById('context-desc');
  legend = document.getElementById('legend');

  var markersLayer = document.getElementById('markers-layer');

  // Set legend icon masks
  var legendKeys = ['monuments', 'nature', 'language', 'intangible'];
  legendKeys.forEach(function(key) {
    var el = document.getElementById('legend-icon-' + key);
    if (el) {
      el.style.webkitMaskImage = ICON_MASKS[key];
      el.style.maskImage = ICON_MASKS[key];
    }
  });

  // Set intro icon masks
  legendKeys.forEach(function(key) {
    var el = document.getElementById('intro-icon-' + key);
    if (el) {
      el.style.webkitMaskImage = ICON_MASKS[key];
      el.style.maskImage = ICON_MASKS[key];
    }
  });

  // Intro overlay — fade out after 4 seconds, then remove
  var introOverlay = document.getElementById('intro-overlay');
  if (introOverlay) {
    // Tell overhead to show intro
    channel.postMessage({ type: 'intro-show' });

    setTimeout(function() {
      introOverlay.classList.add('fade-out');
      setTimeout(function() {
        introOverlay.remove();
      }, 1300);
    }, 4000);
  }

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
    marker.style.setProperty('--world-color', WORLDS[entry.world].color);
    marker.style.setProperty('--pulse-dur', (5 + Math.random() * 8) + 's');
    marker.style.setProperty('--pulse-delay', (Math.random() * 6) + 's');

    // Pulse rings (3 staggered)
    for (var p = 0; p < 3; p++) {
      var pulse = document.createElement('div');
      pulse.className = 'marker-pulse marker-pulse-' + (p + 1);
      marker.appendChild(pulse);
    }

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

    // Click handler — toggle activate/deactivate
    marker.addEventListener('click', function() {
      if (currentIndex === i && isActive) {
        deactivateZone();
      } else {
        activateZone(i);
      }
    });

    markersLayer.appendChild(marker);
    markerEls.push(marker);
  });

  // Keyboard controls
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (isActive) {
        deactivateZone();
      } else {
        activateNext();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (isActive) {
        deactivateZone();
      } else {
        activatePrev();
      }
    }
  });

  // Media controls
  var btnMute = document.getElementById('btn-mute');
  var btnPause = document.getElementById('btn-pause');
  var btnPlay = document.getElementById('btn-play');

  btnMute.addEventListener('click', function() {
    channel.postMessage({ type: 'media-mute' });
    btnMute.classList.toggle('active-state');
  });
  btnPause.addEventListener('click', function() {
    channel.postMessage({ type: 'media-pause' });
  });
  btnPlay.addEventListener('click', function() {
    channel.postMessage({ type: 'media-play' });
  });
}

function activateNext() {
  var next = currentIndex + 1;
  if (next < SEQUENCE.length) {
    activateZone(next);
  }
}

function activatePrev() {
  var prev = currentIndex - 1;
  if (prev >= 0) {
    activateZone(prev);
  }
}

function deactivateZone() {
  if (currentIndex < 0 || !isActive) return;
  isActive = false;

  // Shrink marker back to normal size but keep world color
  if (markerEls[currentIndex]) {
    markerEls[currentIndex].classList.remove('active');
    markerEls[currentIndex].classList.add('deactivated');
  }

  // Animate context panel out
  if (contextPanel) {
    contextPanel.classList.remove('active');
    contextPanel.classList.add('exit');
  }

  // Show legend labels again
  if (legend) legend.classList.remove('labels-hidden');

  // Tell overhead to gracefully close the video
  channel.postMessage({ type: 'zone-deactivate' });
}

function activateZone(index) {
  var prev = currentIndex;
  currentIndex = index;
  isActive = true;
  var entry = SEQUENCE[index];
  var world = WORLDS[entry.world];

  // Deactivate previous marker
  if (prev >= 0 && markerEls[prev]) {
    markerEls[prev].classList.remove('active');
    markerEls[prev].classList.remove('deactivated');
    markerEls[prev].classList.add('visited');
  }

  // Activate current marker
  if (markerEls[index]) {
    markerEls[index].classList.remove('visited');
    markerEls[index].classList.remove('deactivated');
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

  // Hide legend labels
  if (legend) legend.classList.add('labels-hidden');

  // Animate context panel border accent
  contextPanel.style.borderColor = world.color + '18';

  // Animate context panel in
  contextPanel.classList.remove('exit');
  // Force reflow for re-triggering animation if already active
  void contextPanel.offsetWidth;
  contextPanel.classList.add('active');

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
    page: entry.page,
    index: index,
    total: SEQUENCE.length,
    video: entry.video || ''
  });
}

document.addEventListener('DOMContentLoaded', init);
