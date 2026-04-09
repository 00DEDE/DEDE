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

// World phase — runs before the site phase as a guided intro to the legend.
// Order is intentional: built → natural → intangible → endangered
var WORLD_PHASE_ORDER = ['monuments', 'nature', 'intangible', 'language'];

// Copy shown in the world context panel during the world phase
var WORLD_INFO = {
  monuments: {
    eyebrow: 'World One',
    title:   'Built Monuments',
    desc:    'Stone, brick, and ambition. The places we shaped to outlast us — temples, citadels, and ruined cities still keeping watch over the people who built them.'
  },
  nature: {
    eyebrow: 'World Two',
    title:   'Natural Sites',
    desc:    'Forests, reefs, deserts, and rivers. The living systems that hold us up — landscapes shaped by deep time, and the species woven into them.'
  },
  intangible: {
    eyebrow: 'World Three',
    title:   'Intangible Traditions',
    desc:    'Songs, dances, ceremonies, and crafts. Heritage carried in the body and passed down by repetition — the parts of culture that exist only when someone is doing them.'
  },
  language: {
    eyebrow: 'World Four',
    title:   'Endangered Languages',
    desc:    'Words and tongues at the edge of memory. Each language is a way of seeing the world — and when one falls silent, an entire perspective on being human goes with it.'
  }
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
var legend = null;

// World phase state
var phase = 'world';            // 'world' | 'sites'
var worldPhaseIndex = -1;       // index into WORLD_PHASE_ORDER
var isWorldActive = false;
var worldMarkerIndices = {};    // { monuments: [0,7,...], nature: [...], ... }
var legendItemEls = {};         // { monuments: el, nature: el, ... }

// World context panel refs
var worldContextPanel = null;
var wcpIcon = null;
var wcpEyebrow = null;
var wcpTitle = null;
var wcpDesc = null;
var wcpMeta = null;

function init() {
  worldIndicator = document.getElementById('world-indicator');
  statusZone = document.getElementById('status-zone');
  legend = document.getElementById('legend');

  // World context panel refs
  worldContextPanel = document.getElementById('world-context-panel');
  wcpIcon    = document.getElementById('wcp-icon');
  wcpEyebrow = document.getElementById('wcp-eyebrow');
  wcpTitle   = document.getElementById('wcp-title');
  wcpDesc    = document.getElementById('wcp-desc');
  wcpMeta    = document.getElementById('wcp-meta');

  // Cache legend item elements + build site-index lookup per world
  WORLD_PHASE_ORDER.forEach(function(key) {
    legendItemEls[key] = document.getElementById('legend-item-' + key);
    worldMarkerIndices[key] = [];
  });
  SEQUENCE.forEach(function(entry, i) {
    if (worldMarkerIndices[entry.world]) {
      worldMarkerIndices[entry.world].push(i);
    }
  });

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

    // Click handler — toggle activate/deactivate (sites phase only)
    marker.addEventListener('click', function() {
      if (phase !== 'sites') return;
      if (currentIndex === i && isActive) {
        deactivateZone();
      } else {
        activateZone(i);
      }
    });

    markersLayer.appendChild(marker);
    markerEls.push(marker);
  });

  // Keyboard controls — dispatched by phase
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleAdvance();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleRetreat();
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

// ==========================================================================
// PHASE DISPATCHERS — every clicker press routes through here
// ==========================================================================
function handleAdvance() {
  if (phase === 'world') {
    if (isWorldActive) {
      // Currently showing a world — close it. If it was the last world, hand off
      // to the sites phase; otherwise just wait for the next press to open the next world.
      var wasLast = (worldPhaseIndex >= WORLD_PHASE_ORDER.length - 1);
      deactivateWorld();
      if (wasLast) {
        transitionToSitesPhase();
      }
    } else {
      // Not currently showing a world — open the next one
      var next = worldPhaseIndex + 1;
      if (next < WORLD_PHASE_ORDER.length) {
        activateWorld(next);
      } else {
        // Safety net: shouldn't be reachable, but if we run off the end, advance phases.
        transitionToSitesPhase();
      }
    }
    return;
  }

  // Sites phase — original behavior
  if (isActive) {
    deactivateZone();
  } else {
    activateNext();
  }
}

function handleRetreat() {
  if (phase === 'world') {
    if (isWorldActive) {
      deactivateWorld();
    } else if (worldPhaseIndex > 0) {
      activateWorld(worldPhaseIndex - 1);
    }
    return;
  }

  // Sites phase — original behavior
  if (isActive) {
    deactivateZone();
  } else {
    activatePrev();
  }
}

// ==========================================================================
// WORLD PHASE — guided introduction to the four legend categories
// ==========================================================================
function activateWorld(phaseIndex) {
  // If a different world is currently active, tear it down quietly first
  if (isWorldActive && phaseIndex !== worldPhaseIndex) {
    quietlyClearWorld(WORLD_PHASE_ORDER[worldPhaseIndex]);
  }

  worldPhaseIndex = phaseIndex;
  isWorldActive = true;

  var key = WORLD_PHASE_ORDER[phaseIndex];
  var world = WORLDS[key];
  var info = WORLD_INFO[key];
  var indices = worldMarkerIndices[key] || [];

  // Highlight every marker that belongs to this world
  indices.forEach(function(i) {
    if (markerEls[i]) {
      markerEls[i].classList.add('world-highlight');
    }
  });

  // Update legend states — current world goes 'active', already-shown worlds go 'shown'
  WORLD_PHASE_ORDER.forEach(function(k, i) {
    var el = legendItemEls[k];
    if (!el) return;
    el.classList.remove('world-active', 'world-shown');
    if (i === phaseIndex) {
      el.classList.add('world-active');
    } else if (i < phaseIndex) {
      el.classList.add('world-shown');
    }
  });

  // Populate world context panel
  if (worldContextPanel) {
    var maskUrl = ICON_MASKS[key];
    if (maskUrl && wcpIcon) {
      wcpIcon.style.webkitMaskImage = maskUrl;
      wcpIcon.style.maskImage = maskUrl;
      wcpIcon.style.backgroundColor = world.color;
    }
    if (wcpEyebrow) {
      wcpEyebrow.textContent = info.eyebrow + ' \u2014 ' + world.name;
      wcpEyebrow.style.color = world.color;
    }
    if (wcpTitle) {
      wcpTitle.textContent = info.title;
      wcpTitle.style.color = world.color;
    }
    if (wcpDesc) {
      wcpDesc.textContent = info.desc;
    }
    if (wcpMeta) {
      var count = indices.length;
      wcpMeta.textContent = count + ' ' + (count === 1 ? 'site' : 'sites') + ' on this map';
    }

    worldContextPanel.style.borderColor = world.color + '22';
    worldContextPanel.classList.remove('exit');
    void worldContextPanel.offsetWidth;
    worldContextPanel.classList.add('active');
  }

  // World indicator (top center)
  if (worldIndicator) {
    worldIndicator.className = 'world-indicator visible';
    worldIndicator.style.color = world.color;
    worldIndicator.innerHTML = info.eyebrow +
      '<div class="world-name">' + info.title + '</div>';
  }

  // Status bar
  if (statusZone) {
    statusZone.textContent = info.eyebrow + ' \u2014 ' + info.title;
    statusZone.style.color = world.color;
  }

  // Broadcast to overhead — handler will be wired in a follow-up round
  channel.postMessage({
    type: 'world-activate',
    world: key,
    worldName: world.name,
    color: world.color,
    eyebrow: info.eyebrow,
    title: info.title,
    desc: info.desc,
    siteCount: indices.length,
    phaseIndex: phaseIndex,
    phaseTotal: WORLD_PHASE_ORDER.length
  });
}

function deactivateWorld() {
  if (!isWorldActive) return;
  isWorldActive = false;

  var key = WORLD_PHASE_ORDER[worldPhaseIndex];
  quietlyClearWorld(key);

  // Hide world context panel
  if (worldContextPanel) {
    worldContextPanel.classList.remove('active');
    worldContextPanel.classList.add('exit');
  }

  // Mark this world as 'shown' (no longer 'active') in the legend
  if (legendItemEls[key]) {
    legendItemEls[key].classList.remove('world-active');
    legendItemEls[key].classList.add('world-shown');
  }

  channel.postMessage({ type: 'world-deactivate', world: key });
}

// Strip world-highlight from all markers belonging to a given world
function quietlyClearWorld(key) {
  var indices = worldMarkerIndices[key] || [];
  indices.forEach(function(i) {
    if (markerEls[i]) {
      markerEls[i].classList.remove('world-highlight');
    }
  });
}

function transitionToSitesPhase() {
  phase = 'sites';

  // Push the legend into its quiet "reference" state
  if (legend) legend.classList.add('sites-phase');

  // Make sure no stray world-highlight survives into the sites phase
  WORLD_PHASE_ORDER.forEach(quietlyClearWorld);
}

// ==========================================================================
// SITE PHASE — original 20-site flow
// ==========================================================================
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

  // Tell overhead to gracefully close the video and dismiss its context panel
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

  // Strip any leftover world-highlight from this marker — the active state takes over
  if (markerEls[index]) {
    markerEls[index].classList.remove('visited');
    markerEls[index].classList.remove('deactivated');
    markerEls[index].classList.remove('world-highlight');
    markerEls[index].classList.add('active');
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
    desc: entry.desc,
    page: entry.page,
    index: index,
    total: SEQUENCE.length,
    video: entry.video || ''
  });
}

document.addEventListener('DOMContentLoaded', init);
