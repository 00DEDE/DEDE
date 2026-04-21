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
  { zone: 1,  world: 'monuments',  location: 'Machu Picchu',             pronunciation: '[MAH-choo PEE-choo]',    coordinates: '13.1631\u00b0 S, 72.5450\u00b0 W',                                region: 'Cusco Region, Peru',         civilization: 'Inca civilization \u00b7 Built c.1450 CE',     keyInsight: 'Built with ashlar masonry \u2014 stones cut so precisely no mortar was needed.',                                    desc: 'High in the Andes Mountains, Machu Picchu stands as a remarkable expression of Inca ingenuity and environmental understanding. Built in the fifteenth century, the city was carefully integrated into steep mountain ridges, with agricultural terraces and precisely carved stone buildings shaping the landscape. Rather than dominating nature, the Inca worked in harmony with it, studying drainage, soil stability, and sacred geography.',                    page: 40, left: 36, top: 65, video: 'assets/videos/machu_picchu_video_1.mp4' },
  // 2. Nüshu Script
  { zone: 2,  world: 'language',   location: 'N\u00fcshu Script',        pronunciation: '[NYOO-shoo]',    coordinates: '25.2739\u00b0 N, 111.3308\u00b0 E',                                        region: 'Hunan Province, China',      civilization: 'Jiangyong, Hunan \u00b7 Documented since the 19th century', keyInsight: 'The only known writing system created and used exclusively by women \u2014 in poetry, songs, and embroidered textiles.',                                                desc: 'N\u00fcshu is one of the world\u2019s most unique writing systems, developed and used exclusively by women in rural China. For generations, women in Hunan Province created this delicate script to communicate through letters, poems, and songs. In societies where formal education for women was limited, N\u00fcshu became a space for emotional expression, friendship, and resistance \u2014 a remarkable testament to female solidarity and creativity.',                                          page: 78, left: 68, top: 36, video: 'assets/videos/nushu_video%201.mp4', videoBrightness: 1.15, contextStart: 16000, labelPos: 'above' },
  // 3. Serengeti
  { zone: 3,  world: 'nature',     location: 'Serengeti National Park',  pronunciation: '[seh-ren-GEH-tee]',    coordinates: '2.3333\u00b0 S, 34.8333\u00b0 E',                                  region: 'Northern Tanzania',          civilization: 'UNESCO inscribed 1981 \u00b7 ~14,750 sq km',   keyInsight: 'Home to the largest land mammal migration on Earth, extending into Kenya\u2019s Maasai Mara.',                                                         desc: 'Across the vast savannas of northern Tanzania, the Serengeti unfolds as one of the most dynamic ecosystems on Earth. Rolling grasslands stretch toward distant horizons where the seasonal rains guide the movement of millions of animals. Each year enormous herds of wildebeest, zebras, and gazelles migrate across the plains in search of fresh grazing, followed by predators that depend on the same cycle of life.',                                        page: 46, left: 58, top: 68, video: 'assets/videos/serengeti_video%201.mp4', videoStart: 4, videoZoom: 1.2, videoBrightness: 1.15 },
  // 4. Backstrap Loom Weaving
  { zone: 4,  world: 'intangible', location: 'Backstrap Loom Weaving',   pronunciation: '[BAK-strap LOOM WEE-ving]',    coordinates: '14.8333\u00b0 N, 91.5167\u00b0 W',                          region: 'Guatemalan Highlands',       civilization: 'Pre-Columbian Maya \u00b7 Living tradition',   keyInsight: 'Passed down for thousands of years; patterns often encode cosmology and natural symbolism.',                                                desc: 'Across the highlands of Guatemala, Maya artisans continue a weaving tradition that stretches back thousands of years. Using simple backstrap looms attached to their bodies, weavers transform cotton and wool threads into vibrant textiles rich with symbolic meaning. Each pattern carries cultural identity, community history, and spiritual significance \u2014 a living language expressed through color and form.',                                    page: 68, left: 32, top: 55, video: 'assets/videos/backstrap%20weaving_video%201.mp4', videoStart: 20, videoBrightness: 1.15, audioFadeIn: 3, labelPos: 'right' },
  // 5. Great Barrier Reef
  { zone: 5,  world: 'nature',     location: 'Great Barrier Reef',       pronunciation: '[grayt BA-ree-er REEF]',    coordinates: '18.2871\u00b0 S, 147.6992\u00b0 E',                             region: 'Queensland, Australia',      civilization: 'UNESCO inscribed 1981 \u00b7 ~2,300 km long',  keyInsight: 'The largest living structure on Earth \u2014 visible from outer space.',                                           desc: 'Stretching across the warm waters of the Coral Sea, the Great Barrier Reef forms the largest coral ecosystem on Earth. Built slowly by tiny coral polyps over hundreds of thousands of years, the reef is a living structure shaped by cooperation between organisms and environment. These vibrant reefs regulate coastal ecosystems and sustain biodiversity on a planetary scale, sheltering fish, sea turtles, sharks, and countless other species.',                                    page: 56, left: 74, top: 76, labelPos: 'above' },
  // 6. Flamenco
  { zone: 6,  world: 'intangible', location: 'Flamenco',                 pronunciation: '[flah-MEN-koh]',    coordinates: '37.5443\u00b0 N, 4.7278\u00b0 W',                                     region: 'Andalusia, Spain',           civilization: 'Andalusia, Spain \u00b7 UNESCO inscribed 2010', keyInsight: 'Cante, Baile, Toque \u2014 an emotional intensity known as \u201cduende\u201d.',                                       desc: 'Emerging from the cultural crossroads of southern Spain, Flamenco is a powerful artistic expression that blends music, dance, and poetry. Rooted in Andalusian communities, the tradition evolved through centuries of cultural exchange among Roma, Moorish, Jewish, and Spanish influences. Performers channel emotion through rhythmic footwork, expressive singing, and intricate guitar playing, creating conversations shaped by improvisation and deep emotional intensity.',                                    page: 64, left: 50, top: 38, labelPos: 'above' },
  // 7. Ainu
  { zone: 7,  world: 'language',   location: 'Ainu',                     pronunciation: '[EYE-noo]',    coordinates: '43.2203\u00b0 N, 142.8635\u00b0 E',                                          region: 'Hokkaido, Japan',            civilization: 'Indigenous language isolate \u00b7 Critically endangered', keyInsight: 'Unrelated to Japanese or other major language families \u2014 known for its oral epic tradition (yukar).',                                       desc: 'The Ainu language carries the cultural memory and worldview of the Indigenous Ainu people of northern Japan. Traditionally spoken across Hokkaido, Sakhalin, and the Kuril Islands, the language reflects a deep relationship between people, animals, and the natural environment. Oral storytelling and epic songs known as yukar transmit history, spirituality, and ecological knowledge through generations.',                                              page: 82, left: 72, top: 46 },
  // 8. Petra
  { zone: 8,  world: 'monuments',  location: 'Petra',                    pronunciation: '[PEH-trah]',    coordinates: '30.3285\u00b0 N, 35.4444\u00b0 E',                                         region: "Ma'an Governorate, Jordan",  civilization: 'Nabataean Kingdom \u00b7 c.4th century BCE',   keyInsight: 'A Silk Road and incense trade hub \u2014 the \u201cRose City\u201d carved in colored stone.',                                      desc: 'Hidden within narrow desert canyons in southern Jordan, Petra was once a thriving crossroads of ancient trade routes linking Arabia, Egypt, and the Mediterranean world. Founded by the Nabataean civilization more than two thousand years ago, the city is renowned for monumental structures carved directly into rose-colored sandstone cliffs. Sophisticated water management systems allowed Petra to flourish in an otherwise arid environment.',                                  page: 34, left: 60, top: 53 },
  // 9. Jazz
  { zone: 9,  world: 'intangible', location: 'Jazz',                     pronunciation: '[JAZ]',    coordinates: '29.9511\u00b0 N, 90.0715\u00b0 W',                                              region: 'New Orleans, United States', civilization: 'New Orleans, Louisiana \u00b7 UNESCO inscribed 2011', keyInsight: 'Born of African American musical traditions; influenced swing, bebop, rock, and hip-hop.',                                        desc: 'Born in the vibrant cultural city of New Orleans, jazz transformed music by placing improvisation at its core. Emerging from African American communities in the late nineteenth and early twentieth centuries, jazz blended blues, spirituals, ragtime, and marching band traditions into a new musical language. Musicians responded to one another spontaneously, creating performances that were never repeated exactly the same way.',                                          page: 66, left: 35, top: 45, labelPos: 'above' },
  // 10. Socotra
  { zone: 10, world: 'nature',     location: 'Socotra Archipelago',      pronunciation: '[soh-KOH-trah ar-ki-PEL-ah-go]',    coordinates: '12.5087\u00b0 N, 53.9065\u00b0 E',                     region: 'Arabian Sea, Yemen',         civilization: 'UNESCO inscribed 2008 \u00b7 ~3,796 sq km',    keyInsight: 'Home to 700+ endemic species and the iconic Dragon\u2019s Blood Tree (Dracaena cinnabari).',                                                 desc: 'Isolated in the Arabian Sea, the Socotra Archipelago contains one of the most unique ecosystems on Earth. Over millions of years, the islands evolved in isolation, allowing plants and animals to develop forms found nowhere else. The iconic dragon blood tree, with its umbrella-shaped canopy, stands as a symbol of this extraordinary biological heritage and the fragile beauty of island ecosystems.',                                              page: 48, left: 61, top: 63, labelPos: 'right-up' },
  // 11. Timbuktu
  { zone: 11, world: 'monuments',  location: 'Timbuktu',                 pronunciation: '[tim-buhk-TOO]',    coordinates: '16.7735\u00b0 N, 3.0074\u00b0 W',                                     region: 'Mali, West Africa',          civilization: 'Mali and Songhai Empires \u00b7 c.12th century', keyInsight: 'A hub of trans-Saharan trade and a major center of Islamic scholarship.',                                 desc: 'At the southern edge of the Sahara Desert, Timbuktu emerged as one of the most influential centers of scholarship and trade in medieval Africa. Merchants carried gold, salt, manuscripts, and ideas across vast desert routes, transforming Timbuktu into a hub of intellectual life. Its famous mosques and universities attracted scholars from across the Islamic world, and thousands of handwritten manuscripts preserved knowledge of science, philosophy, and law.',                                       page: 36, left: 52, top: 57, labelPos: 'above' },
  // 12. ʻŌlelo Hawaiʻi
  { zone: 12, world: 'language',   location: '\u02bbŌlelo Hawai\u02bbi', pronunciation: '[OH-leh-loh hah-VAI-ee]',    coordinates: '21.3099\u00b0 N, 157.8581\u00b0 W',                            region: 'Hawaii, United States',      civilization: 'Indigenous Polynesian \u00b7 UNESCO Endangered Languages Programme', keyInsight: 'Nearly silenced by the 1980s (<50 child speakers) \u2014 revived through P\u016bnana Leo immersion schools.',                                                        desc: 'For centuries, the Hawaiian language carried the knowledge, history, and worldview of Native Hawaiian culture. Oral traditions, chants, and genealogies preserved deep connections between people, land, and the natural world. By the late twentieth century, community leaders launched a powerful revitalization movement. Language immersion schools and cultural programs began teaching Hawaiian to new generations, ensuring this voice endures.',                                   page: 76, left: 26, top: 54 },
  // 13. Wulingyuan
  { zone: 13, world: 'nature',     location: 'Wulingyuan Scenic Area',   pronunciation: '[woo-LING-ywen]',    coordinates: '29.3453\u00b0 N, 110.4792\u00b0 E',                                    region: 'Hunan Province, China',      civilization: 'UNESCO inscribed 1992 \u00b7 ~397 sq km',      keyInsight: 'Over 3,000 quartz sandstone pillars, with caves, ravines, waterfalls, and natural bridges.',                                            desc: 'In the mountainous region of Hunan Province, the Wulingyuan Scenic Area presents one of the most dramatic geological landscapes in the world. Thousands of towering sandstone pillars rise vertically from forested valleys, many reaching heights of more than two hundred meters. Over millions of years, wind, water, and erosion sculpted these formations into narrow spires, bridges, and ravines wrapped in drifting mist.',                                   page: 50, left: 66, top: 45, labelPos: 'above' },
  // 14. Tango
  { zone: 14, world: 'intangible', location: 'Tango',                    pronunciation: '[TANG-goh]',    coordinates: '34.6037\u00b0 S, 58.3816\u00b0 W',                                         region: 'Buenos Aires, Argentina',    civilization: 'Buenos Aires & Montevideo \u00b7 Late 19th century', keyInsight: 'Born of working-class immigrant communities; its signature instrument is the Bandone\u00f3n.',                                     desc: 'In the port cities of Buenos Aires and Montevideo, tango emerged from a fusion of cultures during the nineteenth century. Immigrants from Europe, enslaved Africans, and local communities contributed musical rhythms and dance traditions that evolved into this deeply expressive art form. Tango music combines violin, piano, and the distinctive sound of the bandon\u00e9on, while dancers communicate emotion through dramatic steps and close partnership.',                                     page: 70, left: 38, top: 74, labelPos: 'above' },
  // 15. Lake Turkana
  { zone: 15, world: 'nature',     location: 'Lake Turkana',             pronunciation: '[layk tur-KAH-nah]',    coordinates: '3.5833\u00b0 N, 36.1167\u00b0 E',                                 region: 'Northern Kenya',             civilization: 'UNESCO inscribed 1997 \u00b7 ~161,485 hectares', keyInsight: 'The largest permanent desert lake in the world.',                                  desc: 'In the arid landscapes of northern Kenya lies Lake Turkana, the largest desert lake in the world. Surrounded by volcanic formations and barren desert terrain, the lake creates a striking contrast between water and wilderness. The region contains important fossil sites that reveal crucial chapters in human evolution, with ancient hominid remains that have helped scientists understand possible origins of humanity.',                                   page: 52, left: 56, top: 55.83, labelPos: 'above' },
  // 16. Borobudur
  { zone: 16, world: 'monuments',  location: 'Borobudur',                pronunciation: '[bor-oh-boo-DOOR]',    coordinates: '7.6079\u00b0 S, 110.2038\u00b0 E',                                  region: 'Central Java, Indonesia',    civilization: 'Sailendra Dynasty \u00b7 8th\u20139th century CE', keyInsight: 'Nine stacked terraces forming a massive mandala plan \u2014 the largest Buddhist monument.',                                      desc: 'Rising from the fertile plains of central Java, Borobudur stands as the largest Buddhist monument ever constructed. Built in the ninth century during the Sailendra dynasty, the temple was designed as a massive stone mandala symbolizing the Buddhist path toward enlightenment. Pilgrims ascend through nine terraces decorated with intricate relief carvings narrating stories of moral lessons, cosmology, and spiritual transformation.',         page: 32, left: 68, top: 58 },
  // 17. Occitan
  { zone: 17, world: 'language',   location: 'Occitan',                  pronunciation: '[OK-si-tan]',    coordinates: '43.9493\u00b0 N, 2.5825\u00b0 E',                                        region: 'Southern France',            civilization: 'Romance language from Latin \u00b7 12th\u201313th century Troubadour era', keyInsight: 'One of the earliest known literary languages of medieval Europe.',                                                   desc: 'Once widely spoken across southern Europe, the Occitan language shaped one of the earliest literary traditions in medieval Europe. During the twelfth and thirteenth centuries, troubadour poets composed songs and poetry in Occitan that celebrated love, philosophy, and courtly culture. These works influenced the development of European literature and music far beyond their region of origin. Today Occitan survives through regional communities and cultural associations.',                                             page: 80, left: 54, top: 38, labelPos: 'above' },
  // 18. Grand Canyon
  { zone: 18, world: 'nature',     location: 'Grand Canyon',             pronunciation: '[grand KAN-yun]',    coordinates: '36.0544\u00b0 N, 112.1401\u00b0 W',                                    region: 'Arizona, United States',     civilization: 'UNESCO inscribed 1979 \u00b7 ~446 km long, ~1,800 m deep', keyInsight: 'Geological layers record ~2 billion years of Earth\u2019s history \u2014 a sacred landscape for the Havasupai and Hopi.',                                           desc: 'Believed to have been carved over millions of years by the relentless flow of the Colorado River, the Grand Canyon reveals one of the most extraordinary geological records on Earth. Layer upon layer of exposed rock tells a story of ancient oceans, deserts, and shifting continents. The canyon\u2019s immense scale stretches for hundreds of kilometers across the Arizona desert, holding deep spiritual and cultural significance for Indigenous peoples.',                                   page: 54, left: 31, top: 46 },
  // 19. Nan Madol
  { zone: 19, world: 'monuments',  location: 'Nan Madol',                pronunciation: '[nahn mah-DOHL]',    coordinates: '6.8436\u00b0 N, 158.3319\u00b0 E',                                    region: 'Pohnpei, Micronesia',        civilization: 'Saudeleur Dynasty \u00b7 c.1200\u20131600 CE',  keyInsight: 'Political and ritual capital of ancient Micronesia \u2014 one of the most mysterious sites in Oceania.',                                                desc: 'Rising from a lagoon along the island of Pohnpei, Nan Madol forms one of the most remarkable urban landscapes in the Pacific Ocean. Constructed between the twelfth and seventeenth centuries by the Saudeleur dynasty, the city was built upon a network of artificial islets connected by canals. Massive basalt columns, transported from distant quarries, were stacked into towering walls enclosing temples, residences, and ceremonial compounds.',                                 page: 38, left: 77, top: 62, labelPos: 'above' },
  // 20. Joya de Cerén
  { zone: 20, world: 'monuments',  location: 'Joya de Cer\u00e9n',       pronunciation: '[HOY-ah deh seh-REHN]',    coordinates: '13.8264\u00b0 N, 89.3583\u00b0 W',                              region: 'La Libertad, El Salvador',   civilization: 'Maya \u00b7 Buried by volcanic eruption ~600 CE', keyInsight: 'Preserved entirely in volcanic ash \u2014 homes, gardens, storage spaces, and workshops intact.',                                     desc: 'Joya de Cer\u00e9n preserves an extraordinary snapshot of daily life in a Maya farming village. Around 600 CE, the nearby Loma Caldera volcano erupted, covering the settlement in ash and perfectly preserving homes, tools, crops, and communal buildings. Unlike many archaeological sites that highlight royal monuments, Joya de Cer\u00e9n reveals how ordinary people lived, worked, and organized their community.',                  page: 30, left: 35, top: 56, labelPos: 'above' }
];

var currentIndex = -1;
var isActive = false;
var markerEls = [];
var worldIndicator = null;
var statusZone = null;
var progressDots = [];
var legend = null;
var arrowIncentive = null;
var stageEl = null;
var arrowTimeout = null;

// Closing overlay — fades in after the 4 world-tour videos (zones 1-4) have
// all been watched and dismissed. Shown once per session.
var CLOSING_ZONES = [1, 2, 3, 4];
var closingVisitedZones = {};
var closingShown = false;

// Ambient background audio — quietly plays at all times, ducks during overhead
var ambientAudio = null;
var ambientFadeRAF = null;
var ambientManuallyPaused = false;
var AMBIENT_BASE_VOLUME = 0.1125;  // 25% quieter than the original 0.15
var AMBIENT_FADE_MS = 1500;

function fadeAmbient(targetVolume, durationMs) {
  if (!ambientAudio) return;
  if (ambientFadeRAF) cancelAnimationFrame(ambientFadeRAF);
  var duration = durationMs || AMBIENT_FADE_MS;
  var startVolume = ambientAudio.volume;
  var startTime = performance.now();
  function tick(now) {
    var t = Math.min(1, (now - startTime) / duration);
    ambientAudio.volume = startVolume + (targetVolume - startVolume) * t;
    if (t < 1) ambientFadeRAF = requestAnimationFrame(tick);
    else ambientFadeRAF = null;
  }
  ambientFadeRAF = requestAnimationFrame(tick);
}

function startAmbient(fadeInMs) {
  if (!ambientAudio || ambientManuallyPaused) return;
  ambientAudio.volume = 0;
  var dur = fadeInMs || AMBIENT_FADE_MS;
  var attempt = function() {
    var p = ambientAudio.play();
    if (p && typeof p.then === 'function') {
      p.then(function() { fadeAmbient(AMBIENT_BASE_VOLUME, dur); })
       .catch(function() {
         var onFirst = function() {
           document.removeEventListener('click', onFirst, true);
           document.removeEventListener('keydown', onFirst, true);
           attempt();
         };
         document.addEventListener('click', onFirst, true);
         document.addEventListener('keydown', onFirst, true);
       });
    }
  };
  attempt();
}

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

// Populate the drifting ocean rows with brand-friend icons.
// Each row gets a different count — some small (3–5), some the full set.
function buildOceanRows() {
  var oceanLayer = document.getElementById('ocean-layer');
  if (!oceanLayer) return;

  var FRIEND_TOTAL = 11;
  // [count, rowClass]. Count < 11 picks a rotating slice of friends.
  var ROWS = [
    [4,  'row-1'],
    [11, 'row-2'],
    [5,  'row-3'],
    [3,  'row-4'],
    [11, 'row-5'],
    [4,  'row-6'],
    [3,  'row-7'],
    [3,  'row-8']
  ];

  ROWS.forEach(function(spec, rowIdx) {
    var count = spec[0];
    var row = document.createElement('div');
    row.className = 'ocean-row ' + spec[1];
    for (var i = 0; i < count; i++) {
      var friendNum = ((rowIdx * 3 + i) % FRIEND_TOTAL) + 1;
      var url = "url('../brand-friends/friend-" + friendNum + ".svg')";
      var el = document.createElement('div');
      el.className = 'ocean-friend';
      el.style.webkitMaskImage = url;
      el.style.maskImage = url;
      row.appendChild(el);
    }
    oceanLayer.appendChild(row);
  });
}

// Wrap each visual line of every .closing-body paragraph in a span so the CSS
// can reveal them one at a time with --line-index-based staggered delays.
function splitClosingIntoLines() {
  var paragraphs = document.querySelectorAll('.closing-body');
  if (!paragraphs.length) return;
  var globalIndex = 0;
  paragraphs.forEach(function(p) {
    var tokens = p.textContent.split(' ');
    p.innerHTML = tokens.map(function(t) {
      return '<span class="closing-word">' + t + '</span>';
    }).join(' ');
    var words = p.querySelectorAll('.closing-word');
    var lines = [];
    var curLine = [];
    var lastTop = null;
    words.forEach(function(w) {
      var top = w.offsetTop;
      if (lastTop !== null && top !== lastTop) {
        lines.push(curLine);
        curLine = [];
      }
      curLine.push(w.textContent);
      lastTop = top;
    });
    if (curLine.length) lines.push(curLine);
    p.innerHTML = lines.map(function(line) {
      var html = '<span class="closing-line" style="--line-index:' + globalIndex + ';">' + line.join(' ') + '</span>';
      globalIndex++;
      return html;
    }).join('');
  });
  // Bottom UNESCO logo fades in right after the final line begins revealing.
  var bottomLogo = document.querySelector('.closing-bottom-logo');
  if (bottomLogo) {
    var logoDelay = 4 + (globalIndex - 1) * 0.9 + 0.6;
    bottomLogo.style.setProperty('--logo-delay', logoDelay + 's');
  }
}

function init() {
  // Table is authoritative for the intro sequence — when it reloads, pull the
  // overhead along so both pages restart their intros in lockstep. Fire
  // immediately and once more on a short delay in case overhead is mid-boot
  // and hasn't attached its listener yet.
  channel.postMessage({ type: 'refresh-overhead' });
  setTimeout(function() { channel.postMessage({ type: 'refresh-overhead' }); }, 400);

  buildOceanRows();
  splitClosingIntoLines();

  worldIndicator = document.getElementById('world-indicator');
  statusZone = document.getElementById('status-zone');
  legend = document.getElementById('legend');
  arrowIncentive = document.getElementById('arrow-incentive');
  stageEl = document.querySelector('.stage');
  ambientAudio = document.getElementById('ambient-audio');

  // Music toggle button — sits outside the stage frame
  var ambientToggle = document.getElementById('ambient-toggle');
  if (ambientToggle) {
    ambientToggle.addEventListener('click', function() {
      if (!ambientAudio) return;
      if (ambientAudio.paused) {
        ambientManuallyPaused = false;
        ambientAudio.play().then(function() {
          fadeAmbient(AMBIENT_BASE_VOLUME, 800);
        }).catch(function() {});
        ambientToggle.classList.remove('paused');
        ambientToggle.setAttribute('title', 'Pause music');
      } else {
        ambientManuallyPaused = true;
        if (ambientFadeRAF) cancelAnimationFrame(ambientFadeRAF);
        ambientAudio.pause();
        ambientToggle.classList.add('paused');
        ambientToggle.setAttribute('title', 'Play music');
      }
    });
  }

  // Build arrow indicators (8 arrows in a ring)
  if (arrowIncentive) {
    for (var a = 0; a < 8; a++) {
      var arrow = document.createElement('div');
      arrow.className = 'arrow-indicator';
      arrowIncentive.appendChild(arrow);
    }
  }

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
  var legendKeys = ['monuments', 'nature', 'intangible', 'language'];
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

  // Intro sequence:
  //   1. Text paragraphs animate in (music fades in with first paragraph)
  //   2. Text overlay fades out
  //   3. Intro overlay plays phases 1/2/3-solo/3-group
  //   4. Intro overlay fades out → map revealed
  var introOverlay = document.getElementById('intro-overlay');
  var introTextOverlay = document.getElementById('intro-text-overlay');
  var introTimeouts = [];
  function introTimeout(fn, delay) {
    var id = setTimeout(fn, delay);
    introTimeouts.push(id);
    return id;
  }

  // Text overlay now sits at z-index 150 (above intro overlay at 100), so text
  // renders on top while intro overlay (same dark background) sits behind it.
  // When text fades out, the intro overlay's empty dark background is already
  // painted — no flash of the map underneath.

  var textFadeTime = 0;
  if (introTextOverlay) {
    var paragraphs = document.querySelectorAll('#intro-text-content p');
    var paraFadeIn = 2500;
    var paraFadeOut = 2000;
    var paraGap = 800;
    var paraHolds = [7800, 13700, 7800];

    // Music fades in at t=0 alongside the first paragraph — silent before that
    startAmbient(paraFadeIn);

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

  if (introOverlay) {
    // Start intro overlay phases after the text overlay has fully faded out
    var introStart = textFadeTime + 2000;

    introTimeout(function() {
      channel.postMessage({ type: 'intro-show' });

      var introIconItems = document.querySelectorAll('.intro-icon-item');
      requestAnimationFrame(function() {
        // phase-1: UNESCO logo fades in at center
        introOverlay.classList.add('phase-1');

        // phase-2: logo fades out, Digital Atlas splash title fades in
        introTimeout(function() { introOverlay.classList.add('phase-2'); }, 4500);

        // phase-3-solo: title fades out, each icon cycles solo at center
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

        // phase-3 group: solo wraps up, all 4 icons stagger into a row.
        // Pin icons to opacity:0 first so the last solo icon doesn't bleed
        // its opacity:1 into the group transition.
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
      });

      // Fade out overlay after the group row has fully settled.
      // groupStart = 9500+500+10400+400 = 20800; last icon stagger 1.5s + 2.2s
      // → settled ~24500; hold ~1500ms; fade begins ~26000.
      var introFadeTime = 26000;
      introTimeout(function() {
        introOverlay.classList.add('fade-out');
        introTimeout(function() { introOverlay.remove(); }, 1800);
      }, introFadeTime);
    }, introStart);
  }

  // Skip Intro — tear down the intro sequence immediately and reveal the map.
  // Also tells the overhead page to jump to its final resting state in sync.
  var skipIntroBtn = document.getElementById('skip-intro');
  if (skipIntroBtn) {
    skipIntroBtn.addEventListener('click', function() {
      introTimeouts.forEach(function(id) { clearTimeout(id); });
      introTimeouts.length = 0;
      if (introTextOverlay && introTextOverlay.parentNode) introTextOverlay.remove();
      if (introOverlay && introOverlay.parentNode) introOverlay.remove();
      if (ambientAudio && ambientAudio.paused && !ambientManuallyPaused) {
        startAmbient(800);
      }
      channel.postMessage({ type: 'skip-intro' });
      skipIntroBtn.classList.add('hidden');
    });
    // Auto-hide the button once the intro overlay has been removed
    var skipWatcher = setInterval(function() {
      if (!document.getElementById('intro-overlay') && !document.getElementById('intro-text-overlay')) {
        skipIntroBtn.classList.add('hidden');
        clearInterval(skipWatcher);
      }
    }, 500);
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

    // Location label (visible during legend tour)
    var label = document.createElement('div');
    label.className = 'marker-label' + (entry.labelPos ? ' label-' + entry.labelPos : '');
    label.textContent = entry.location;
    marker.appendChild(label);

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
  // Right/Up → advance, Left/Down → retreat
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageDown') {
      e.preventDefault();
      handleAdvance();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'PageUp') {
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
    // World phase — step back one category; if at the first and it's open, just close it.
    if (worldPhaseIndex > 0) {
      activateWorld(worldPhaseIndex - 1);
    } else if (isWorldActive) {
      deactivateWorld();
      worldPhaseIndex = -1;
    }
    return;
  }

  // Sites phase — LEFT always means "go back one zone".
  if (currentIndex > 0) {
    activateZone(currentIndex - 1);
  } else if (currentIndex === 0) {
    // At the first zone — collapse back to pre-zone state
    if (isActive) {
      deactivateZone();
    }
    currentIndex = -1;
    isActive = false;
    if (markerEls[0]) {
      markerEls[0].classList.remove('active', 'visited', 'deactivated');
    }
    progressDots.forEach(function(dot) {
      dot.className = 'progress-dot';
      dot.style.background = '';
    });
    if (statusZone) {
      statusZone.textContent = '';
    }
    if (worldIndicator) {
      worldIndicator.className = 'world-indicator';
    }
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
  if (legend) {
    legend.classList.add('sites-phase');
    legend.classList.add('tour-complete');
  }

  // Enable world colors on map markers
  var ml = document.getElementById('markers-layer');
  if (ml) ml.classList.add('world-colors-active');

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

  // Hide arrow incentive + remove table dim
  if (arrowTimeout) { clearTimeout(arrowTimeout); arrowTimeout = null; }
  if (arrowIncentive) {
    arrowIncentive.classList.remove('visible');
    arrowIncentive.classList.add('exit');
  }
  if (stageEl) stageEl.classList.remove('overhead-active');

  // Ambient returns as overhead backs away (unless user manually paused it).
  // Fade-in takes 2.5s (1s longer than default) for a gentler return.
  if (!ambientManuallyPaused) fadeAmbient(AMBIENT_BASE_VOLUME, 2500);

  // Tell overhead to gracefully close the video and dismiss its context panel
  channel.postMessage({ type: 'zone-deactivate' });

  // After the viewer deactivates the 4th site (Backstrap Loom Weaving, zone 4),
  // fade in the closing "Thank You" page. Fires once per session.
  if (!closingShown && currentIndex >= 0) {
    var justDeactivated = SEQUENCE[currentIndex];
    if (justDeactivated && justDeactivated.zone === 4) {
      closingShown = true;
      var closingOverlay = document.getElementById('closing-overlay');
      if (closingOverlay) {
        setTimeout(function() { closingOverlay.classList.add('visible'); }, 1200);
      }
    }
  }
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

  // Keep WCP content aligned with the active marker's world so the faint
  // text visible during the dim state matches (instead of the last-tour world).
  var info = WORLD_INFO[entry.world];
  if (worldContextPanel && info) {
    var maskUrl = ICON_MASKS[entry.world];
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
    if (wcpDesc) wcpDesc.textContent = info.desc;
    if (wcpMeta) {
      var siteCount = (worldMarkerIndices[entry.world] || []).length;
      wcpMeta.textContent = siteCount + ' ' + (siteCount === 1 ? 'site' : 'sites') + ' on this map';
    }
    worldContextPanel.style.borderColor = world.color + '22';
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

  // Arrow incentive — show arrows briefly, then dim table
  if (arrowTimeout) { clearTimeout(arrowTimeout); arrowTimeout = null; }
  if (stageEl) stageEl.classList.remove('overhead-active');
  if (arrowIncentive && markerEls[index]) {
    var rect = markerEls[index].getBoundingClientRect();
    arrowIncentive.style.left = (rect.left + rect.width / 2) + 'px';
    arrowIncentive.style.top = (rect.top + rect.height / 2) + 'px';
    arrowIncentive.style.setProperty('--arrow-color', world.color);
    arrowIncentive.classList.remove('exit');
    arrowIncentive.classList.add('visible');
  }
  arrowTimeout = setTimeout(function() {
    if (arrowIncentive) {
      arrowIncentive.classList.remove('visible');
      arrowIncentive.classList.add('exit');
    }
    if (stageEl) stageEl.classList.add('overhead-active');
  }, 3500);

  // Duck the ambient audio while the overhead takes the stage
  fadeAmbient(0);

  // Broadcast to overhead display
  channel.postMessage({
    type: 'zone-activate',
    zone: entry.zone,
    world: entry.world,
    worldName: world.name,
    location: entry.location,
    pronunciation: entry.pronunciation || '',
    coordinates: entry.coordinates || '',
    region: entry.region,
    civilization: entry.civilization || '',
    keyInsight: entry.keyInsight || '',
    color: world.color,
    desc: entry.desc,
    page: entry.page,
    index: index,
    total: SEQUENCE.length,
    video: entry.video || '',
    videoStart: entry.videoStart || 0,
    videoZoom: entry.videoZoom || 1,
    videoZoomOrigin: entry.videoZoomOrigin || 'center center',
    videoBrightness: entry.videoBrightness || 1,
    audioFadeIn: entry.audioFadeIn || 0,
    contextStart: entry.contextStart || 20000,
    subtitles: entry.subtitles || null
  });
}

document.addEventListener('DOMContentLoaded', init);
