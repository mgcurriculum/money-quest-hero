export interface Scenario {
  situation: string;
  scene: string;
  character: string;
  options: { text: string; emoji: string }[];
}

export interface RealityQuestion {
  question: string;
  category: string;
  options: { text: string; emoji: string }[];
}

export interface Level {
  id: number;
  title: string;
  theme: string;
  icon: string;
  color: string;
  bgEmoji: string;
  scenarios: Scenario[];
}

// 4 Financial Reality Check questions (Level 0) — fallback
export const realityQuestions: RealityQuestion[] = [
  {
    question: "How much money do you receive or earn every month from all sources?",
    category: "Real Income Level",
    options: [
      { text: "Up to ₹5,000", emoji: "💰" },
      { text: "₹5,000 – ₹10,000", emoji: "💰" },
      { text: "₹10,000 – ₹25,000", emoji: "💰" },
      { text: "₹25,000 – ₹50,000", emoji: "💰" },
      { text: "Above ₹50,000", emoji: "🚀" },
    ],
  },
  {
    question: "On average, how much do you spend every month?",
    category: "Spending Reality",
    options: [
      { text: "Less than ₹1,000", emoji: "🪙" },
      { text: "₹1,000 – ₹2,500", emoji: "💸" },
      { text: "₹2,500 – ₹5,000", emoji: "💳" },
      { text: "₹5,000 – ₹10,000", emoji: "🛍" },
      { text: "Above ₹10,000", emoji: "🚀" },
    ],
  },
  {
    question: "How much money do you currently have saved?",
    category: "Savings Status",
    options: [
      { text: "No savings yet", emoji: "🪙" },
      { text: "Less than ₹500", emoji: "💰" },
      { text: "₹500 – ₹2,000", emoji: "💰" },
      { text: "₹2,000 – ₹10,000", emoji: "💰" },
      { text: "More than ₹10,000", emoji: "🏦" },
    ],
  },
  {
    question: "How often do you track your spending?",
    category: "Financial Habit Check",
    options: [
      { text: "Never track it", emoji: "❌" },
      { text: "Rarely track", emoji: "⚠️" },
      { text: "Sometimes check my balance", emoji: "🤔" },
      { text: "Often review my spending", emoji: "📊" },
      { text: "Track every expense carefully", emoji: "📱" },
    ],
  },
];

// Dimension weights for FQ scoring (total = 1.0) — 7 dimensions
export const dimensionWeights = [0.10, 0.13, 0.17, 0.17, 0.14, 0.14, 0.15];

export const dimensionLabels = [
  "Financial Reality",
  "Earning Mindset",
  "Spending Discipline",
  "Saving Behaviour",
  "Debt Awareness",
  "Investment Awareness",
  "Financial Safety",
];

export const dimensionIcons = ["📋", "💼", "💳", "💰", "🧾", "📈", "🛡️"];

// 14 Financial Personality Archetypes (2 per dimension: high & low)
export const archetypes: { dimension: number; high: { name: string; emoji: string; trait: string; strength: string; quest: string }; low: { name: string; emoji: string; trait: string; risk: string; quest: string } }[] = [
  {
    dimension: 0,
    high: { name: "Reality Checker", emoji: "📋", trait: "Strong grasp of real financial situation", strength: "Self-awareness", quest: "Review your finances monthly" },
    low: { name: "Reality Explorer", emoji: "🔍", trait: "Still discovering financial realities", risk: "Lack of financial self-awareness", quest: "List all your income and expenses this week" },
  },
  {
    dimension: 1,
    high: { name: "Income Explorer", emoji: "💼", trait: "Actively seeks earning opportunities", strength: "Income growth mindset", quest: "Diversify income streams" },
    low: { name: "Skill Monetizer", emoji: "🎯", trait: "Turns skills or hobbies into money", risk: "Untapped earning potential", quest: "Start a freelance side project" },
  },
  {
    dimension: 2,
    high: { name: "Smart Spender", emoji: "💳", trait: "Controls impulse purchases", strength: "Budget awareness", quest: "Track every purchase for 30 days" },
    low: { name: "Lifestyle Drifter", emoji: "🛍️", trait: "Spends based on social influence", risk: "Peer pressure spending", quest: "Follow the 24-hour rule before buying" },
  },
  {
    dimension: 3,
    high: { name: "Growing Saver", emoji: "💰", trait: "Consistently builds savings", strength: "Emergency fund mindset", quest: "Save ₹500 weekly for 4 weeks" },
    low: { name: "Future Planner", emoji: "📊", trait: "Plans financial goals ahead", risk: "Inconsistent savings habit", quest: "Set up automatic savings transfer" },
  },
  {
    dimension: 4,
    high: { name: "Debt Avoider", emoji: "🧾", trait: "Cautious about borrowing", strength: "Responsible repayment behaviour", quest: "Create a debt-free action plan" },
    low: { name: "Credit Juggler", emoji: "⚠️", trait: "Uses debt casually", risk: "EMI-driven lifestyle", quest: "Review & eliminate one unnecessary subscription" },
  },
  {
    dimension: 5,
    high: { name: "Future Investor", emoji: "📈", trait: "Interested in wealth creation", strength: "Long-term mindset", quest: "Start a ₹500 monthly SIP" },
    low: { name: "Market Learner", emoji: "📚", trait: "Early stage investment curiosity", risk: "Analysis paralysis", quest: "Read one investment article daily for a week" },
  },
  {
    dimension: 6,
    high: { name: "Money Protector", emoji: "🛡️", trait: "High awareness of fraud and financial safety", strength: "Fraud awareness", quest: "Share one safety tip with a friend" },
    low: { name: "Risk Blind", emoji: "🚨", trait: "Low financial safety awareness", risk: "Vulnerable to scams", quest: "Learn about 3 common financial scams" },
  },
];

// FQ Score interpretation bands
export const fqBands: { min: number; max: number; level: string; meaning: string; emoji: string }[] = [
  { min: 0, max: 200, level: "Financial Beginner", meaning: "Limited awareness — your journey starts here!", emoji: "🌱" },
  { min: 200, max: 400, level: "Financial Explorer", meaning: "Basic awareness — keep exploring!", emoji: "🧭" },
  { min: 400, max: 600, level: "Developing Money Skills", meaning: "Improving habits — you're on the right track!", emoji: "📚" },
  { min: 600, max: 800, level: "Financially Smart", meaning: "Good control — strong financial instincts!", emoji: "🧠" },
  { min: 800, max: 900, level: "Wealth Builder", meaning: "Strong discipline — building real wealth!", emoji: "🏗️" },
  { min: 900, max: 1001, level: "Financial Master", meaning: "Highly optimized behaviour — you're a legend!", emoji: "👑" },
];

export const levels: Level[] = [
  {
    id: 0,
    title: "Financial Reality Check",
    theme: "Know your real financial situation",
    icon: "📋",
    color: "game-blue",
    bgEmoji: "🔍",
    scenarios: [], // Level 0 uses realityQuestions instead
  },
  {
    id: 1,
    title: "The Earning Quest",
    theme: "Discover your earning mindset",
    icon: "💼",
    color: "game-blue",
    bgEmoji: "🚀",
    scenarios: [
      {
        situation: "🎬 It's a lazy Sunday afternoon. Your phone buzzes — someone online is looking for help with a paid gig that matches your skills. Clock is ticking! ⏰",
        scene: "🌅",
        character: "🧑‍💻",
        options: [
          { text: "Nah, pass the popcorn 🍿", emoji: "😴" },
          { text: "Hmm, interesting... *scrolls past*", emoji: "🤔" },
          { text: "Maybe I'll respond... tomorrow", emoji: "📱" },
          { text: "I'm on it! Sending my details now", emoji: "⚡" },
          { text: "Already have multiple gigs running 💪", emoji: "🔥" },
        ],
      },
      {
        situation: "🎨 Quest unlocked! You realize your hobby — drawing, coding, cooking — could actually make money. The internet is your marketplace! 🌐",
        scene: "💡",
        character: "🎮",
        options: [
          { text: "Hobbies are for fun, not work", emoji: "🎈" },
          { text: "Too complicated to monetize", emoji: "😕" },
          { text: "Tried once, didn't work out", emoji: "📉" },
          { text: "Setting up my profile tonight!", emoji: "🛠️" },
          { text: "Already earning from my passion! 💸", emoji: "🌟" },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Spending Challenge",
    theme: "Battle the impulse monster!",
    icon: "💳",
    color: "game-purple",
    bgEmoji: "🛒",
    scenarios: [
      {
        situation: "🛍️ DANGER ZONE! You spot something you love on sale. But wait... you already own something similar. The Impulse Monster whispers: 'Treat yourself!' 👹",
        scene: "🏬",
        character: "👜",
        options: [
          { text: "YOLO! *taps card* 💸", emoji: "🤑" },
          { text: "Friends say buy it, so... okay!", emoji: "👥" },
          { text: "I know I shouldn't but... *buys*", emoji: "😬" },
          { text: "Walking away. Sleeping on it 😤", emoji: "🧘" },
          { text: "Didn't even enter the store 😎", emoji: "🛡️" },
        ],
      },
      {
        situation: "⚡ FLASH SALE ALERT! Something you kinda wanted is 40% OFF for the next 2 hours! Your wallet is watching nervously... 👀",
        scene: "⏰",
        character: "👟",
        options: [
          { text: "ORDERED! Can't miss this deal!", emoji: "🏃" },
          { text: "40% off = basically free, right?", emoji: "🤡" },
          { text: "Added to cart... thinking...", emoji: "🛒" },
          { text: "Let me check my budget first 📊", emoji: "📋" },
          { text: "Unplanned = Unwanted. Next! ✋", emoji: "💪" },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Saving Mission",
    theme: "Build your treasure chest!",
    icon: "💰",
    color: "game-green",
    bgEmoji: "🏦",
    scenarios: [
      {
        situation: "🎁 LOOT DROP! You just received some unexpected money — a gift, cashback, or repayment! What's your power move? ⚡",
        scene: "✨",
        character: "💎",
        options: [
          { text: "Shopping spree incoming! 🛒", emoji: "🎉" },
          { text: "Spend most, save a little maybe", emoji: "🤫" },
          { text: "Save some... spend some... balance?", emoji: "⚖️" },
          { text: "Save most of it first, rest is play money", emoji: "🎯" },
          { text: "Straight to savings. Budget the rest!", emoji: "🏆" },
        ],
      },
      {
        situation: "🎮 SIDE QUEST: You've been eyeing something expensive for weeks. It's calling your name! How do you plan this purchase?",
        scene: "📱",
        character: "🎮",
        options: [
          { text: "Ask someone else to buy it for me", emoji: "🙏" },
          { text: "Use whatever I have right now", emoji: "💸" },
          { text: "Save randomly and hope for the best", emoji: "🤞" },
          { text: "Create a monthly savings plan for it", emoji: "📅" },
          { text: "Savings plan with deadline + tracker!", emoji: "🗂️" },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Debt Trap",
    theme: "Escape the debt dungeon!",
    icon: "🧾",
    color: "game-red",
    bgEmoji: "⚠️",
    scenarios: [
      {
        situation: "🕸️ TRAP DETECTED! Someone says: 'Just use Buy Now Pay Later — everyone does it!' The siren song of easy money plays... 🎵",
        scene: "🚨",
        character: "🕸️",
        options: [
          { text: "Sounds genius! *clicks buy*", emoji: "🎪" },
          { text: "If everyone does it, must be fine", emoji: "🐑" },
          { text: "Only if the EMI is tiny...", emoji: "🤏" },
          { text: "Nah, I'll save up for it", emoji: "🏋️" },
          { text: "Hard pass! I don't borrow for wants!", emoji: "🛑" },
        ],
      },
      {
        situation: "📱 BOSS BATTLE! Flashy ads promise: 'Get money instantly! No documents! Download now!' The Debt Monster attacks! 🐉",
        scene: "⚔️",
        character: "🐉",
        options: [
          { text: "Downloading! Free money! 🤩", emoji: "📲" },
          { text: "Hmm interesting, might try later", emoji: "🧐" },
          { text: "Seems sketchy but not sure why", emoji: "😰" },
          { text: "Only in a real emergency, maybe", emoji: "🆘" },
          { text: "I know these are traps — BLOCKED! 🚫", emoji: "🛡️" },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Investment World",
    theme: "Grow your wealth garden!",
    icon: "📈",
    color: "game-gold",
    bgEmoji: "🌱",
    scenarios: [
      {
        situation: "🏛️ THE COUNCIL! People around you are debating: 'Should we invest our money?' Everyone looks at you. What's your vibe?",
        scene: "🗣️",
        character: "🧠",
        options: [
          { text: "Investing? Not for me! 😂", emoji: "🙅" },
          { text: "Sounds risky, I'll keep my cash", emoji: "😨" },
          { text: "Curious but I need to learn more", emoji: "📚" },
          { text: "Already researching options!", emoji: "🔍" },
          { text: "I've already started investing! 🚀", emoji: "💹" },
        ],
      },
      {
        situation: "🎰 POWER-UP! You receive a windfall of money! This is your chance to make it grow or blow. Choose wisely, adventurer!",
        scene: "🌟",
        character: "💎",
        options: [
          { text: "Shopping spree! Treat myself!", emoji: "🛍️" },
          { text: "Keep it safe at home", emoji: "💤" },
          { text: "Park it in a savings account", emoji: "🏦" },
          { text: "Invest a portion wisely", emoji: "📊" },
          { text: "Diversify across multiple investments! 📈", emoji: "🧠" },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Protection Shield",
    theme: "Defend against digital villains!",
    icon: "🛡️",
    color: "game-orange",
    bgEmoji: "🔒",
    scenarios: [
      {
        situation: "📞 INCOMING THREAT! 'We need your OTP/PIN to verify your account or it will be BLOCKED!' They sound urgent! 😱",
        scene: "🚨",
        character: "🦹",
        options: [
          { text: "OMG! Here's my details!", emoji: "😱" },
          { text: "They sound legit... okay fine", emoji: "😟" },
          { text: "Hmm that's weird... but maybe...", emoji: "😰" },
          { text: "Nice try! Hanging up + calling bank", emoji: "📞" },
          { text: "Reported to cyber cell already 🚔", emoji: "🛡️" },
        ],
      },
      {
        situation: "😨 PLOT TWIST! Someone you know just lost a large sum in an online scam! They're devastated. What's YOUR takeaway?",
        scene: "🎭",
        character: "🧠",
        options: [
          { text: "Won't happen to me, I'm smart 😎", emoji: "🙄" },
          { text: "Poor thing, just bad luck", emoji: "😢" },
          { text: "Okay, I'll be more careful now", emoji: "🤔" },
          { text: "Time to learn about common scams!", emoji: "📖" },
          { text: "Already following cyber safety practices!", emoji: "🏅" },
        ],
      },
    ],
  },
];

export const reflectionOptions = [
  "💼 Earn more actively",
  "💳 Spend smarter",
  "💰 Save consistently",
  "🧾 Avoid unnecessary debt",
  "📈 Start investing",
  "🛡️ Protect money from scams",
];

// Legacy exports for compatibility
export const levelTraits = [
  { label: "Financial Reality", icon: "📋" },
  { label: "Earning Mindset", icon: "💼" },
  { label: "Spending Behaviour", icon: "💳" },
  { label: "Saving Behaviour", icon: "💰" },
  { label: "Debt Awareness", icon: "🧾" },
  { label: "Investment Awareness", icon: "📈" },
  { label: "Safety Awareness", icon: "🛡️" },
];

export const traitProfiles: { [key: number]: string[] } = {
  0: ["Reality Unaware", "Reality Curious", "Reality Aware", "Reality Checker", "Reality Master"],
  1: ["Income Ignorer", "Income Thinker", "Income Trier", "Income Explorer", "Income Builder"],
  2: ["Impulse Buyer", "Social Spender", "Emotional Spender", "Smart Spender", "Mindful Spender"],
  3: ["Non-Saver", "Occasional Saver", "Growing Saver", "Consistent Saver", "Savings Master"],
  4: ["Debt Prone", "Casual Borrower", "Cautious Borrower", "Debt Avoider", "Debt Free Champion"],
  5: ["Investment Avoider", "Investment Skeptic", "Investment Curious", "Future Investor", "Investment Explorer"],
  6: ["Fraud Vulnerable", "Somewhat Aware", "Getting Careful", "Money Protector", "Security Expert"],
};

// FQ Scoring utility functions
export function calculateNormalizedScore(levelAnswers: { [q: number]: number }): number {
  const vals = Object.values(levelAnswers);
  if (vals.length === 0) return 0;
  const userScore = vals.reduce((a, b) => a + b, 0);
  const minScore = vals.length * 1;
  const maxScore = vals.length * 5;
  return ((userScore - minScore) / (maxScore - minScore)) * 100;
}

export function calculateFQScore(answers: { [level: number]: { [q: number]: number } }): {
  fqScore: number;
  normalizedScores: number[];
  primaryArchetype: { name: string; emoji: string; trait: string; quest: string };
  secondaryArchetype: { name: string; emoji: string; trait: string; quest: string };
  band: typeof fqBands[0];
} {
  const normalizedScores = Array.from({ length: 7 }, (_, level) => {
    const levelAnswers = answers[level] || {};
    return calculateNormalizedScore(levelAnswers);
  });

  const weightedTotal = normalizedScores.reduce(
    (sum, score, idx) => sum + score * dimensionWeights[idx],
    0
  );

  const fqScore = Math.round(weightedTotal * 10);

  // Determine primary & secondary archetypes
  const scored = normalizedScores.map((s, i) => ({ score: s, index: i }));
  scored.sort((a, b) => b.score - a.score);

  const primaryIdx = scored[0].index;
  const secondaryIdx = scored[1]?.index ?? scored[0].index;

  const threshold = 50;
  const primaryArchetype = normalizedScores[primaryIdx] >= threshold
    ? archetypes[primaryIdx].high
    : archetypes[primaryIdx].low;
  const secondaryArchetype = normalizedScores[secondaryIdx] >= threshold
    ? archetypes[secondaryIdx].high
    : archetypes[secondaryIdx].low;

  const band = fqBands.find(b => fqScore >= b.min && fqScore < b.max) || fqBands[0];

  return { fqScore, normalizedScores, primaryArchetype, secondaryArchetype, band };
}
