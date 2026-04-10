//====================================================
// BOARD SIZE
//====================================================
boardRow = 15;
boardCol = 15;

//====================================================
// UNIT DATABASE
//====================================================
const master_unit = {
  king: {
    icon: "img/king.svg",
    name: "King",
    cost: 0,
    def: 4,
    mp: "square",
    mr: 1,
    ap: "square",
    ar: 1,
    area: false,
    aap: null,
    aar: 0,
    siege: false,
    traits: ["Protect"],
    description:
      "Jantung pasukan. Memberi perlindungan anti-venom pada rekan terdekat.",
  },
  peasant: {
    icon: "img/peasant.svg",
    name: "Peasant",
    cost: 1,
    def: 1,
    mp: "cross",
    mr: 1,
    ap: "cross",
    ar: 1,
    area: false,
    aap: null,
    aar: 0,
    siege: false,
    traits: [],
    description: "Unit murah untuk memblokir pergerakan lawan.",
  },
  infantry: {
    icon: "img/swordman.svg",
    name: "Infantry",
    cost: 4,
    def: 4,
    mp: "cross",
    mr: 2,
    ap: "cross",
    ar: 1,
    area: false,
    aap: null,
    aar: 0,
    siege: true,
    traits: [],
    description: "Pertahanan kokoh, namun hanya bisa bergerak ATAU menyerang.",
  },
  cavalry: {
    icon: "img/cavalry.svg",
    name: "Cavalry",
    cost: 7,
    def: 3,
    mp: "cross",
    mr: 4,
    ap: "cross",
    ar: 1,
    area: false,
    aap: null,
    aar: 0,
    siege: false,
    traits: ["Charge"],
    description:
      "Unit tercepat. Efek Charge aktif jika bergerak lurus min 2 tile.",
  },
  archer: {
    icon: "img/archer.svg",
    name: "Archer",
    cost: 4,
    def: 2,
    mp: "cross",
    mr: 2,
    ap: "omni",
    ar: 3,
    area: false,
    aap: null,
    aar: 0,
    siege: false,
    traits: [],
    description: "Penembak jitu. Serangannya bisa melompati unit lain.",
  },
  mage: {
    icon: "img/mage.svg",
    name: "Mage",
    cost: 5,
    def: 2,
    mp: "square",
    mr: 2,
    ap: "square",
    ar: 2,
    area: true,
    aap: "circle",
    aar: 1,
    siege: false,
    traits: ["Arc"],
    description: "Penghancur massal. Menyerang area di sekitar target.",
  },
  assassin: {
    icon: "img/assassin.svg",
    name: "Assassin",
    cost: 6,
    def: 2,
    mp: "diagonal",
    mr: 3,
    ap: "omni",
    ar: 1,
    area: false,
    aap: null,
    aar: 0,
    siege: false,
    traits: ["Jump", "Venom"],
    description:
      "Penyusup. Bisa melompati unit dan memberikan racun mematikan.",
  },
  priest: {
    icon: "img/priest.svg",
    name: "Priest",
    cost: 4,
    def: 2,
    mp: "cross",
    mr: 2,
    ap: "omni",
    ar: 2,
    area: false,
    aap: null,
    aar: 0,
    siege: false,
    traits: ["Protect"],
    description: "Penyembuh. Memberikan buff anti-venom kepada rekan.",
  },
  barbarian: {
    icon: "img/barbarian.svg",
    name: "Barbarian",
    cost: 5,
    def: 3,
    mp: "omni",
    mr: 2,
    ap: "cross",
    ar: 1,
    area: false,
    aap: null,
    aar: 0,
    siege: false,
    traits: ["Berserk", "Charge"],
    description:
      "Petarung agresif. Melakukan counter-attack otomatis jarak dekat.",
  },
};

//====================================================
// AI STRATEGY LIBRARIES
//====================================================
const ai_strategies = {
  // 1. Classic Hold-the-Line
  phalanx: {
    name: "Iron Wall",
    priority: { infantry: 4, peasant: 2, priest: 1, king: 1 },
    behavior: "defensive", // Will not move until player enters range
    rowBias: 0,
  },
  // 2. High-Risk/High-Reward
  assassin_scout: {
    name: "Shadow Strike",
    priority: { assassin: 4, archer: 2, king: 1 },
    behavior: "hit-and-run", // Will try to jump to backline and retreat
    rowBias: 2,
  },
  // 3. Heavy Artillery / Siege
  artillery_core: {
    name: "Siege Engine",
    priority: { archer: 3, mage: 3, king: 1, infantry: 2 },
    behavior: "zoning", // Stay back, focus fire on player king
    rowBias: 0,
  },
  // 4. Overwhelming Numbers
  peasant_swarm: {
    name: "Tide of War",
    priority: { peasant: 8, king: 1, priest: 1 },
    behavior: "aggressive", // Swarm tactics
    rowBias: 1,
  },
  // 5. Elite Cavalry Charge
  blitzkrieg: {
    name: "Lightning Strike",
    priority: { cavalry: 3, barbarian: 2, infantry: 2, king: 1 },
    behavior: "aggressive", // Charge straight at the nearest unit
    rowBias: 2,
  },
  // 6. Magic Focused
  arcane_circle: {
    name: "Arcane Masters",
    priority: { mage: 3, priest: 2, king: 1, infantry: 2 },
    behavior: "zoning", // Maintain distance, use AOE
    rowBias: 1,
  },
};
