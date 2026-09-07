// The single Subject Pack driving every day's session (see PRD "Open Questions:
// content pipeline capacity" — a real deployment rotates subjects daily; this
// build has one hardcoded pack, matching the design mockups' worked example).
//
// Reveal copy IA: every mark carries two independent text slots —
//   - `fact`: a fixed, two-sentence piece of real history about the subject.
//     Never changes with performance. Rendered once, under the answer, via
//     <FactNote>.
//   - `commentary`: { positive, negative } — a short remark on *how the
//     player did*, never history. Rendered in the FeedbackBanner subline.
// The two must never restate each other — commentary talks about the guess,
// fact talks about the place.
export const subjectPack = {
  id: "constantinople",
  dailyNumber: 412,
  theme: "Constantinople",
  collections: ["Byzantine Empire", "Ottoman Empire", "World Capitals"],

  pin: {
    prompt: "Where was Constantinople located?",
    trueLocation: { lat: 41.0082, lon: 28.9784, label: "Istanbul, Türkiye" },
    fact:
      "Founded as Byzantium, refounded by Constantine in 330 on the European shore of the Bosphorus — the hinge between two continents, and the reason the city could be held for a thousand years.",
    commentary: {
      positive: "Placed right where the old walls stood — a strong read on the map.",
      negative: "A fair distance off — the peninsula's exact position takes some pinning down.",
    },
  },

  when: {
    prompt: "In what year did the city stop being called Constantinople?",
    min: 1850,
    max: 2000,
    trueYear: 1930,
    tags: ["LATE OTTOMAN", "EARLY REPUBLIC", "NAMES & PLACES"],
    fact:
      "Both names had been in use for centuries. In 1930 the Turkish postal service made Istanbul the only official name, and foreign mail addressed to Constantinople began to be returned to sender.",
    commentary: {
      positive: "A tight read on the timeline — right in the right decade.",
      negative: "Off by a wide stretch — the name change is easy to place decades from where it fell.",
    },
  },

  know: {
    prompt: "What is the current name of the city once called Constantinople?",
    options: ["Ankara", "Istanbul", "İzmir", "Bursa"],
    correctIndex: 1,
    fact:
      "Istanbul has carried that name officially since 1930, though visitors and residents alike had called it that for generations before.",
    commentary: {
      positive: "Straightforward and correct — the modern name stuck.",
      negative: "Not the modern name — worth filing away for next time.",
    },
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
    fact:
      "Both stand in the same city, which is what makes the distractor work. Hagia Sophia went up nine centuries earlier, under Justinian, and held the largest dome in the world for most of them.",
    commentary: {
      positive: "The right landmark, first try.",
      negative: "A convincing distractor — both of these stand in the same city.",
    },
  },

  era: {
    prompt: "Which empire held Constantinople as its capital for most of its history?",
    options: ["Achaemenid Persia", "Byzantine Empire", "Abbasid Caliphate", "Holy Roman Empire"],
    correctIndex: 1,
    fact:
      "The eastern half of the Roman world outlived the west by nearly a thousand years, ruled from this city, speaking Greek, and calling itself Roman to the end.",
    commentary: {
      positive: "Correctly placed in its longest-held era.",
      negative: "Not the empire that held it longest — worth another look.",
    },
    discovery: "Byzantine Empire",
  },

  succession: {
    prompt: "Which empire took the city in 1453 and made it their capital?",
    options: ["Seljuk Sultanate", "Republic of Venice", "Ottoman Empire", "Safavid Empire"],
    correctIndex: 2,
    fact:
      "Mehmed II took the city in 1453, ending the Byzantine line and making it the Ottoman capital for the next four and a half centuries.",
    commentary: {
      positive: "The right successor, and the right year.",
      negative: "Not who took the city in 1453 — a pivotal year worth remembering.",
    },
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
    fact:
      "Four rulers, four turning points — refounding, building, defending and conquest — that shaped the city across eleven centuries.",
    commentary: {
      positive: "Every ruler placed correctly.",
      negative: "Partial credit — some pairs landed, some didn't.",
    },
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
