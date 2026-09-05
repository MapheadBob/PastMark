// The single Subject Pack driving every day's session (see PRD "Open Questions:
// content pipeline capacity" — a real deployment rotates subjects daily; this
// build has one hardcoded pack, matching the design mockups' worked example).
export const subjectPack = {
  id: "constantinople",
  dailyNumber: 412,
  theme: "Constantinople",
  collections: ["Byzantine Empire", "Ottoman Empire", "World Capitals"],

  pin: {
    prompt: "Where was Constantinople located?",
    trueLocation: { lat: 41.0082, lon: 28.9784, label: "Istanbul, Türkiye" },
    blurb:
      "Founded as Byzantium, refounded by Constantine in 330 on the European shore of the Bosphorus — the hinge between two continents, and the reason the city could be held for a thousand years.",
  },

  when: {
    prompt: "In what year did the city stop being called Constantinople?",
    min: 1850,
    max: 2000,
    trueYear: 1930,
    tags: ["LATE OTTOMAN", "EARLY REPUBLIC", "NAMES & PLACES"],
    blurb:
      "Both names had been in use for centuries. In 1930 the Turkish postal service made Istanbul the only official name, and foreign mail addressed to Constantinople began to be returned to sender.",
  },

  know: {
    prompt: "What is the current name of the city once called Constantinople?",
    options: ["Ankara", "Istanbul", "İzmir", "Bursa"],
    correctIndex: 1,
    blurb:
      "Istanbul has carried that name officially since 1930, though visitors and residents alike had called it that for generations before.",
    discovery: null,
  },

  see: {
    prompt: "Which of these is Constantinople's most famous landmark?",
    options: [
      { label: "Hagia Sophia", caption: "LANDMARK PHOTO 1" },
      { label: "Süleymaniye Mosque", caption: "LANDMARK PHOTO 2" },
      { label: "Basilica of San Vitale", caption: "LANDMARK PHOTO 3" },
      { label: "Church of the Holy Sepulchre", caption: "LANDMARK PHOTO 4" },
    ],
    correctIndex: 0,
    blurb:
      "Both stand in the same city, which is what makes the distractor work. Hagia Sophia went up nine centuries earlier, under Justinian, and held the largest dome in the world for most of them.",
  },

  era: {
    prompt: "Which empire held Constantinople as its capital for most of its history?",
    options: ["Achaemenid Persia", "Byzantine Empire", "Abbasid Caliphate", "Holy Roman Empire"],
    correctIndex: 1,
    blurb:
      "The eastern half of the Roman world outlived the west by nearly a thousand years, ruled from this city, speaking Greek, and calling itself Roman to the end.",
    discovery: "Byzantine Empire",
  },

  succession: {
    prompt: "Which empire took the city in 1453 and made it their capital?",
    options: ["Seljuk Sultanate", "Republic of Venice", "Ottoman Empire", "Safavid Empire"],
    correctIndex: 2,
    blurb:
      "Mehmed II took the city in 1453, ending the Byzantine line and making it the Ottoman capital for the next four and a half centuries.",
    discovery: "Ottoman Empire",
  },

  match: {
    prompt: "Match each ruler to what they did here.",
    pairs: [
      { left: "Constantine I", right: "Refounded the city, 330" },
      { left: "Justinian I", right: "Built Hagia Sophia, 537" },
      { left: "Theodosius II", right: "Raised the land walls, 413" },
      { left: "Mehmed II", right: "Took the city, 1453" },
    ],
    blurb:
      "Four rulers, four turning points — refounding, building, defending and conquest — that shaped the city across eleven centuries.",
    discovery: "World Capitals",
  },
};

export const marksOrder = ["pin", "when", "know", "see", "era", "succession", "match"];

export const markMeta = {
  pin: { label: "PIN", title: "Pin", kicker: "MARK 1 · PLACE" },
  when: { label: "WHEN", title: "When", kicker: "MARK 2 · TIME" },
  know: { label: "KNOW", title: "Know", kicker: "IDENTITY · ALL OR NOTHING" },
  see: { label: "SEE", title: "See", kicker: "FOUR REAL LANDMARKS — ONE IS THIS CITY'S" },
  era: { label: "ERA", title: "Era", kicker: "THE PERIOD · ALL OR NOTHING" },
  succession: { label: "SUCCESSION", title: "Succession", kicker: "WHAT CAME NEXT · ALL OR NOTHING" },
  match: { label: "MATCH", title: "Match", kicker: "PARTIAL CREDIT — EACH CORRECT PAIR EARNS ITS SHARE" },
};
