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

// 11 Financial Reality Check questions (Level 0)
export const realityQuestions: RealityQuestion[] = [
  {
    question: "What best describes your current stage?",
    category: "Player Segmentation",
    options: [
      { text: "In school (Class 11/12)", emoji: "🎒" },
      { text: "In college", emoji: "🎓" },
      { text: "Doing a course or skill program", emoji: "🧑‍💻" },
      { text: "Working part-time or full-time", emoji: "💼" },
      { text: "Running a business / startup", emoji: "🚀" },
    ],
  },
  {
    question: "How do you usually receive money?",
    category: "Player Segmentation",
    options: [
      { text: "Fully dependent on parents", emoji: "👨‍👩‍👧" },
      { text: "Pocket money from family", emoji: "💸" },
      { text: "Freelance / gig work", emoji: "🧑‍💻" },
      { text: "Salary from job", emoji: "💼" },
      { text: "Business / startup income", emoji: "🚀" },
    ],
  },
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
    question: "Do you currently owe money to anyone?",
    category: "Debt Situation",
    options: [
      { text: "No debt at all", emoji: "🟢" },
      { text: "Less than ₹1,000", emoji: "🟡" },
      { text: "₹1,000 – ₹5,000", emoji: "🟠" },
      { text: "₹5,000 – ₹25,000", emoji: "🔴" },
      { text: "More than ₹25,000", emoji: "⚠️" },
    ],
  },
  {
    question: "Have you ever invested money?",
    category: "Investment Participation",
    options: [
      { text: "No investment yet", emoji: "🪙" },
      { text: "Physical savings (gold or cash)", emoji: "🪙" },
      { text: "Bank FD / RD", emoji: "🏦" },
      { text: "Mutual fund SIP", emoji: "📈" },
      { text: "Stocks / crypto / advanced investments", emoji: "🚀" },
    ],
  },
  {
    question: "Does your family currently have any insurance coverage?",
    category: "Insurance Protection",
    options: [
      { text: "No insurance", emoji: "❌" },
      { text: "Government scheme only", emoji: "🏛" },
      { text: "One private insurance policy", emoji: "🏥" },
      { text: "Multiple policies covering family", emoji: "🛡" },
      { text: "I help manage or understand these policies", emoji: "🧠" },
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
  {
    question: "How interested are you in improving your financial knowledge?",
    category: "Financial Learning Mindset",
    options: [
      { text: "Not interested", emoji: "❌" },
      { text: "Slightly curious", emoji: "🤷" },
      { text: "Somewhat interested", emoji: "🤔" },
      { text: "Interested in learning more", emoji: "📚" },
      { text: "Actively learning about money", emoji: "🚀" },
    ],
  },
  {
    question: "Are you ready to take charge of your money journey?",
    category: "Final Commitment",
    options: [
      { text: "Not ready yet", emoji: "😴" },
      { text: "Maybe later", emoji: "🤔" },
      { text: "Thinking about it", emoji: "🙂" },
      { text: "Yes, I want to improve", emoji: "💪" },
      { text: "Absolutely! I'm ready to level up", emoji: "🚀" },
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

// 12 Financial Personality Archetypes (2 per dimension: high & low)
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
        situation: "🎬 Scene: It's a lazy Sunday afternoon. Your friends are binge-watching Netflix. Suddenly, your phone buzzes — someone on Instagram is looking for a freelance designer. Clock is ticking! ⏰",
        scene: "🌅",
        character: "🧑‍💻",
        options: [
          { text: "Nah, pass the popcorn 🍿", emoji: "😴" },
          { text: "Hmm, interesting... *scrolls past*", emoji: "🤔" },
          { text: "Maybe I'll DM them... tomorrow", emoji: "📱" },
          { text: "I'm on it! Sending my portfolio now", emoji: "⚡" },
          { text: "Already have 3 freelance gigs running 💪", emoji: "🔥" },
        ],
      },
      {
        situation: "🎓 Plot twist! A senior drops a hot tip: 'This startup pays ₹5K/month for interns AND teaches you real skills.' Your move, player?",
        scene: "🏢",
        character: "🎯",
        options: [
          { text: "₹5K? That's pocket change, skip!", emoji: "💤" },
          { text: "Sounds cool but... effort 😮‍💨", emoji: "🐌" },
          { text: "I'll apply if the form is short", emoji: "📝" },
          { text: "Resume updated, application sent! 📨", emoji: "🎯" },
          { text: "I'm already interning + upskilling!", emoji: "🏆" },
        ],
      },
      {
        situation: "🎨 Quest unlocked! You realize your hobby — drawing, coding, gaming — could actually make money online. The internet is your marketplace! 🌐",
        scene: "💡",
        character: "🎮",
        options: [
          { text: "Hobbies are for fun, not work", emoji: "🎈" },
          { text: "Too complicated to monetize", emoji: "😕" },
          { text: "Posted once, got 2 likes... gave up", emoji: "📉" },
          { text: "Setting up my Fiverr profile tonight!", emoji: "🛠️" },
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
        situation: "🛍️ DANGER ZONE! You're at the mall and spot THE perfect bag. But wait... you already own 3 similar ones at home. The Impulse Monster whispers: 'Treat yourself!' 👹",
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
        situation: "⚡ FLASH SALE ALERT! Those sneakers you kinda wanted are 40% OFF for the next 2 hours! Your wallet is watching nervously... 👀",
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
      {
        situation: "📅 Month end boss fight! You check your balance and it's... dangerously low. The 'Where Did My Money Go?' mystery begins 🔍",
        scene: "💰",
        character: "🕵️",
        options: [
          { text: "Money just... vanishes? 🤷", emoji: "👻" },
          { text: "Too many hangouts with the squad", emoji: "🍕" },
          { text: "Some surprise expenses hit me", emoji: "💥" },
          { text: "Slightly miscalculated, I'll adjust", emoji: "📐" },
          { text: "This rarely happens — I track it all!", emoji: "📊" },
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
        situation: "🎁 LOOT DROP! You just received ₹3,000 unexpectedly — birthday money, cashback, or that friend who finally paid back! What's your power move? ⚡",
        scene: "✨",
        character: "💎",
        options: [
          { text: "Shopping spree incoming! 🛒", emoji: "🎉" },
          { text: "Spend most, hide ₹500 maybe", emoji: "🤫" },
          { text: "Save some... spend some... balance?", emoji: "⚖️" },
          { text: "₹2,000 saved first, rest is play money", emoji: "🎯" },
          { text: "Straight to savings. Budget the rest!", emoji: "🏆" },
        ],
      },
      {
        situation: "🎮 SIDE QUEST: You've been eyeing a ₹15,000 gadget for weeks. It's calling your name! How do you plan this epic purchase?",
        scene: "📱",
        character: "🎮",
        options: [
          { text: "Mom/Dad, pleeeease? 🥺", emoji: "🙏" },
          { text: "Use whatever I have right now", emoji: "💸" },
          { text: "Save randomly and hope for the best", emoji: "🤞" },
          { text: "₹3K/month × 5 months = MINE!", emoji: "📅" },
          { text: "Savings plan with deadline + tracker!", emoji: "🗂️" },
        ],
      },
      {
        situation: "📊 STATS CHECK! You peek at your savings after a few months. What does your treasure chest look like?",
        scene: "🔮",
        character: "📈",
        options: [
          { text: "What savings? 😅", emoji: "🕳️" },
          { text: "Had some, but they vanished", emoji: "🪄" },
          { text: "Small wins here and there", emoji: "🌱" },
          { text: "Growing steadily! Feels amazing", emoji: "📈" },
          { text: "I track every rupee! Master saver!", emoji: "👑" },
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
        situation: "🕸️ TRAP DETECTED! Your friend says: 'Just use Buy Now Pay Later — everyone does it!' The siren song of easy money plays... 🎵",
        scene: "🚨",
        character: "🕸️",
        options: [
          { text: "Sounds genius! *clicks buy*", emoji: "🎪" },
          { text: "If everyone does it, must be fine", emoji: "🐑" },
          { text: "Only if the EMI is tiny...", emoji: "🤏" },
          { text: "Nah, I'll save up for it", emoji: "🏋️" },
          { text: "Hard pass! I don't borrow!", emoji: "🛑" },
        ],
      },
      {
        situation: "🤝 HONOR TEST! You borrowed ₹2,000 from a friend last week. Your repayment style reveals your character!",
        scene: "⏳",
        character: "🤝",
        options: [
          { text: "They'll forget... right? 😬", emoji: "🙈" },
          { text: "I'll pay when they remind me", emoji: "📞" },
          { text: "Oh yeah! Almost forgot — transferring", emoji: "🔔" },
          { text: "Paid back within 2 days! ⚡", emoji: "✅" },
          { text: "I track all debts — already repaid!", emoji: "📒" },
        ],
      },
      {
        situation: "📱 BOSS BATTLE! Flashy ads promise: 'Get ₹50,000 instantly! No documents! Download now!' The Debt Monster attacks! 🐉",
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
        situation: "🏛️ THE COUNCIL! Your friend group is debating: 'Should we invest in mutual funds?' The room looks at you. What's your vibe?",
        scene: "🗣️",
        character: "🧠",
        options: [
          { text: "Investing? I'm 20, not 50! 😂", emoji: "🙅" },
          { text: "Sounds risky, I'll keep my cash", emoji: "😨" },
          { text: "Curious but I need to learn more", emoji: "📚" },
          { text: "Already researching! SIP calculator open", emoji: "🔍" },
          { text: "I started my first SIP last month! 🚀", emoji: "💹" },
        ],
      },
      {
        situation: "🎰 POWER-UP! Someone gifts you ₹10,000! This is your chance to make it grow or blow. Choose wisely, adventurer!",
        scene: "🌟",
        character: "💎",
        options: [
          { text: "Shopping spree! Treat yo'self!", emoji: "🛍️" },
          { text: "Keep it under my mattress 🛏️", emoji: "💤" },
          { text: "Park it in savings account", emoji: "🏦" },
          { text: "Invest 30% in index funds!", emoji: "📊" },
          { text: "70% invested + diversified! 📈", emoji: "🧠" },
        ],
      },
      {
        situation: "⚔️ DEBATE TIME! A friend declares: 'Stock market is just gambling for rich people!' Your counter-move?",
        scene: "💬",
        character: "🎭",
        options: [
          { text: "100% agree! It's all luck", emoji: "🎲" },
          { text: "Mostly agree — seems dangerous", emoji: "⚠️" },
          { text: "Honestly? I don't know enough", emoji: "🤷" },
          { text: "There's a difference — research matters", emoji: "📖" },
          { text: "I invest based on knowledge & patience!", emoji: "🧘" },
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
        situation: "📞 INCOMING THREAT! 'Hello, this is your bank. We need your OTP to verify your account or it will be BLOCKED!' They sound urgent! 😱",
        scene: "🚨",
        character: "🦹",
        options: [
          { text: "OMG! Here's my OTP: ****", emoji: "😱" },
          { text: "They sound legit... okay fine", emoji: "😟" },
          { text: "Hmm that's weird... but maybe...", emoji: "😰" },
          { text: "Nice try! Hanging up + calling bank", emoji: "📞" },
          { text: "Reported to cyber cell already 🚔", emoji: "🛡️" },
        ],
      },
      {
        situation: "🏪 QUICK PAY! You're scanning a QR code to pay at a street food stall. But is that QR code legit or a villain's trap? 🦹‍♂️",
        scene: "📱",
        character: "🔍",
        options: [
          { text: "Scan and pay, no time to check!", emoji: "⚡" },
          { text: "The shop looks fine, just pay", emoji: "🤷" },
          { text: "At least I check the amount", emoji: "👀" },
          { text: "Verify name + amount before confirming", emoji: "✅" },
          { text: "I triple-check everything! Always!", emoji: "🔐" },
        ],
      },
      {
        situation: "😨 PLOT TWIST! Your friend just lost ₹25,000 in an online scam! They're devastated. What's YOUR takeaway from this event?",
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
