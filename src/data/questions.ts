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
    scenarios: [],
  },
  {
    id: 1,
    title: "Earning Mindset",
    theme: "Discover your earning potential",
    icon: "💼",
    color: "game-blue",
    bgEmoji: "🚀",
    scenarios: [
      {
        situation: "It is the weekend. You receive a message online about a paid task that matches your skills, but the deadline is soon. What would you do?",
        scene: "🌅",
        character: "🧑‍💻",
        options: [
          { text: "I am not interested, I prefer to relax", emoji: "😴" },
          { text: "It sounds interesting but I will skip it", emoji: "🤔" },
          { text: "I will look into it later", emoji: "📱" },
          { text: "I will apply for it right away", emoji: "⚡" },
          { text: "I already do such tasks regularly", emoji: "🔥" },
        ],
      },
      {
        situation: "You realise your hobby — such as drawing, coding, or cooking — could actually earn you money through online platforms. What would you do?",
        scene: "💡",
        character: "🎮",
        options: [
          { text: "Hobbies are for enjoyment, not for earning", emoji: "🎈" },
          { text: "It is too complicated to start", emoji: "😕" },
          { text: "I tried once but it did not work out", emoji: "📉" },
          { text: "I am setting up my online profile to start", emoji: "🛠️" },
          { text: "I am already earning from my skills", emoji: "🌟" },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Spending Discipline",
    theme: "Control your spending habits",
    icon: "💳",
    color: "game-purple",
    bgEmoji: "🛒",
    scenarios: [
      {
        situation: "You see something you like on sale, but you already have something similar at home. What would you do?",
        scene: "🏬",
        character: "👜",
        options: [
          { text: "I will buy it because I deserve it", emoji: "🤑" },
          { text: "My friends say I should buy it, so I will", emoji: "👥" },
          { text: "I know I should not, but I will buy it anyway", emoji: "😬" },
          { text: "I will walk away and think about it first", emoji: "🧘" },
          { text: "I will not even look at the sale", emoji: "🛡️" },
        ],
      },
      {
        situation: "There is a flash sale with 40 percent off on something you wanted. It is available for only 2 hours. What would you do?",
        scene: "⏰",
        character: "👟",
        options: [
          { text: "I will order it immediately", emoji: "🏃" },
          { text: "40 percent off is a good deal, I should buy it", emoji: "🤡" },
          { text: "I have added it to the cart but I am still thinking", emoji: "🛒" },
          { text: "Let me check my budget first", emoji: "📋" },
          { text: "If it is not planned, I do not need it", emoji: "💪" },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Saving Behaviour",
    theme: "Build your savings habit",
    icon: "💰",
    color: "game-green",
    bgEmoji: "🏦",
    scenarios: [
      {
        situation: "You receive some unexpected money — a gift, cashback, or someone returned money they owed you. What would you do with it?",
        scene: "✨",
        character: "💎",
        options: [
          { text: "I will spend it all on shopping", emoji: "🎉" },
          { text: "I will spend most of it and save a little", emoji: "🤫" },
          { text: "I will save some and spend some equally", emoji: "⚖️" },
          { text: "I will save most of it and keep a little for myself", emoji: "🎯" },
          { text: "I will save all of it and plan my spending separately", emoji: "🏆" },
        ],
      },
      {
        situation: "You have been wanting to buy something expensive for a few weeks now. How would you plan this purchase?",
        scene: "📱",
        character: "🎮",
        options: [
          { text: "I will ask someone else to buy it for me", emoji: "🙏" },
          { text: "I will use whatever money I have right now", emoji: "💸" },
          { text: "I will save when I can and hope for the best", emoji: "🤞" },
          { text: "I will make a monthly savings plan for it", emoji: "📅" },
          { text: "I will create a savings plan with a deadline and track my progress", emoji: "🗂️" },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Debt Awareness",
    theme: "Understand borrowing and credit",
    icon: "🧾",
    color: "game-red",
    bgEmoji: "⚠️",
    scenarios: [
      {
        situation: "Your friend suggests using Buy Now Pay Later for a purchase you do not really need right now. What would you do?",
        scene: "🚨",
        character: "🕸️",
        options: [
          { text: "That sounds like a good idea, I will use it", emoji: "🎪" },
          { text: "If everyone does it, it must be fine", emoji: "🐑" },
          { text: "Only if the monthly payment is small", emoji: "🤏" },
          { text: "No thank you, I will save up and buy later", emoji: "🏋️" },
          { text: "I never borrow money for things I just want", emoji: "🛑" },
        ],
      },
      {
        situation: "You see advertisements promising instant money — no documents needed, just download an app. What would you do?",
        scene: "⚔️",
        character: "🐉",
        options: [
          { text: "I will download it, easy money is welcome", emoji: "📲" },
          { text: "It looks interesting, I might try it later", emoji: "🧐" },
          { text: "It seems risky but I am not sure why", emoji: "😰" },
          { text: "I would only consider it in a real emergency", emoji: "🆘" },
          { text: "I know these are predatory lending traps and I will avoid them", emoji: "🛡️" },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Investment Awareness",
    theme: "Grow your wealth wisely",
    icon: "📈",
    color: "game-gold",
    bgEmoji: "🌱",
    scenarios: [
      {
        situation: "Your friends are discussing whether they should start investing in mutual funds. They ask for your opinion. What would you say?",
        scene: "🗣️",
        character: "🧠",
        options: [
          { text: "Investing is not for people like me", emoji: "🙅" },
          { text: "It sounds risky, I prefer to keep my money safe", emoji: "😨" },
          { text: "I am curious but I need to learn more first", emoji: "📚" },
          { text: "I am already researching my options", emoji: "🔍" },
          { text: "I have already started investing", emoji: "💹" },
        ],
      },
      {
        situation: "Someone gifts you ₹10,000. You have the choice to spend it or invest it. What would you do?",
        scene: "🌟",
        character: "💎",
        options: [
          { text: "I will spend it on something I want", emoji: "🛍️" },
          { text: "I will keep it at home for now", emoji: "💤" },
          { text: "I will deposit it in my savings account", emoji: "🏦" },
          { text: "I will invest a portion of it wisely", emoji: "📊" },
          { text: "I will invest most of it across different options", emoji: "🧠" },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Financial Safety",
    theme: "Protect yourself from fraud",
    icon: "🛡️",
    color: "game-orange",
    bgEmoji: "🔒",
    scenarios: [
      {
        situation: "You receive a phone call. The caller claims to be from your bank and says they need your OTP to verify your account or it will be blocked. What would you do?",
        scene: "🚨",
        character: "🦹",
        options: [
          { text: "I will share my OTP immediately", emoji: "😱" },
          { text: "They sound genuine, I might share it", emoji: "😟" },
          { text: "Something feels wrong but I am not sure", emoji: "😰" },
          { text: "I will hang up and call my bank directly to verify", emoji: "📞" },
          { text: "I know banks never ask for OTPs and I will report this call", emoji: "🛡️" },
        ],
      },
      {
        situation: "Your friend just lost ₹25,000 in an online scam. They are very upset. What would you learn from this experience?",
        scene: "🎭",
        character: "🧠",
        options: [
          { text: "It will not happen to me, I am careful enough", emoji: "🙄" },
          { text: "That is unfortunate, but it is just bad luck", emoji: "😢" },
          { text: "I should be more careful going forward", emoji: "🤔" },
          { text: "I will learn about common online scams to protect myself", emoji: "📖" },
          { text: "I already follow cyber safety practices and I will help my friend too", emoji: "🏅" },
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
