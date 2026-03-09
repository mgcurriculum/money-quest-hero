// Dynamic narration prompt generator for varied, context-aware TTS lines

const dimensionPrompts: Record<string, string[]> = {
  'Financial Reality': [
    "Let's see where you stand with money right now.",
    "Time for a reality check on your finances.",
    "How well do you know your money situation?",
    "This one is about understanding your current financial picture.",
    "Let's get real about where your money stands today.",
    "Here's a question to check your financial awareness.",
  ],
  'Earning Mindset': [
    "This one is about how you think about earning.",
    "Let's explore your approach to making money.",
    "How do you view your income and earning potential?",
    "Time to think about the earning side of things.",
    "Here's a question about your income mindset.",
    "Let's see how you approach your earning journey.",
  ],
  'Spending Discipline': [
    "This one is about your spending habits.",
    "Let's talk about where your money goes.",
    "How do you handle the urge to spend?",
    "Time to look at your spending decisions.",
    "Here's a question about managing your expenses.",
    "Let's see how disciplined you are with spending.",
    "This is about making smart choices with your money.",
  ],
  'Saving Behaviour': [
    "Saving money — easier said than done, right?",
    "Let's see how you handle putting money aside.",
    "This one is about building your savings habit.",
    "How do you approach saving for the future?",
    "Time to check your saving instincts.",
    "Here's a question about your saving strategy.",
    "Let's explore how you protect your future self.",
  ],
  'Debt Awareness': [
    "Now let's talk about debt and borrowing.",
    "This one is about understanding how debt works.",
    "How aware are you when it comes to borrowing?",
    "Let's see how you handle credit and loans.",
    "Here's a question about managing debt wisely.",
    "Time to check your awareness around borrowing.",
  ],
  'Investment Awareness': [
    "Now we're getting into investment territory.",
    "This one is about growing your money.",
    "How do you think about investing?",
    "Let's explore your investment awareness.",
    "Here's a question about making your money work for you.",
    "Time to see how you approach wealth building.",
  ],
  'Financial Safety': [
    "This one is about protecting yourself financially.",
    "Let's talk about financial safety and security.",
    "How prepared are you for the unexpected?",
    "Here's a question about safeguarding your finances.",
    "Time to check your financial protection instincts.",
    "Let's see how you handle risk and safety.",
  ],
};

const genericPrompts = [
  "Here's the next one for you.",
  "Alright, let's move on to this question.",
  "Take a moment and think about this one.",
  "Here's something interesting to consider.",
  "Let's see what you think about this.",
];

const milestonePrompts: Record<number, string[]> = {
  5: [
    "You're doing great! Five questions in already.",
    "Nice pace! You've covered 5 questions so far.",
  ],
  10: [
    "You're on a roll! Question 10 already.",
    "Impressive! You're powering through this.",
  ],
  15: [
    "Almost there! Just a few more to go.",
    "You've come a long way. Keep it up!",
  ],
  20: [
    "Final stretch! You're nearly done.",
    "So close to the finish line now!",
  ],
};

// Score-aware feedback with dimension-specific variants
const feedbackByScore: Record<string, string[]> = {
  low: [
    "That's honest, and honesty is the first step.",
    "There's room to grow here, and that's okay.",
    "Good to know where you stand. You can build from here.",
    "Recognising your habits is how improvement begins.",
  ],
  mid: [
    "Not bad at all!",
    "You're on the right track.",
    "Solid choice. You've got some good instincts.",
    "That shows decent awareness. Keep going!",
  ],
  high: [
    "Now that's a smart move!",
    "You really know your stuff!",
    "Impressive thinking right there.",
    "That shows real financial maturity!",
  ],
};

const dimensionFeedback: Record<string, Record<string, string[]>> = {
  'Spending Discipline': {
    high: ["Your spending discipline is on point!", "That's some serious self-control with money."],
    low: ["Spending wisely is a skill you can build.", "Small changes in spending can make a big difference."],
  },
  'Saving Behaviour': {
    high: ["Your saving game is strong!", "You've got the saving mindset locked in."],
    low: ["Even small savings add up over time.", "Building a saving habit starts with one step."],
  },
  'Investment Awareness': {
    high: ["You think like an investor!", "Great investment awareness for your age."],
    low: ["Investing can feel complex, but you'll get there.", "Learning about investments is a great next step."],
  },
  'Debt Awareness': {
    high: ["You handle debt like a pro!", "Smart approach to credit and borrowing."],
    low: ["Understanding debt early will save you a lot.", "Being aware of debt traps is really important."],
  },
  'Financial Safety': {
    high: ["You take financial safety seriously. Love it!", "Your protection instincts are sharp."],
    low: ["Financial safety is worth thinking about more.", "A little preparation goes a long way."],
  },
};

// Track last used index per pool to avoid repeats
const lastUsed = new Map<string, number>();

function pickRandom(pool: string[], poolKey: string): string {
  if (pool.length === 0) return '';
  if (pool.length === 1) return pool[0];

  const lastIdx = lastUsed.get(poolKey) ?? -1;
  let idx: number;
  do {
    idx = Math.floor(Math.random() * pool.length);
  } while (idx === lastIdx && pool.length > 1);

  lastUsed.set(poolKey, idx);
  return pool[idx];
}

/**
 * Get a dynamic, context-aware narration prompt for a question.
 */
export function getQuestionNarration(
  dimension: string | null | undefined,
  category: string,
  questionNumber: number,
  totalQuestions: number
): string {
  // Check milestones first (Q5, Q10, Q15, Q20)
  if (milestonePrompts[questionNumber]) {
    const milestone = pickRandom(milestonePrompts[questionNumber], `milestone-${questionNumber}`);
    // Append a dimension prompt after milestone
    const dim = dimension && dimensionPrompts[dimension]
      ? pickRandom(dimensionPrompts[dimension], `dim-${dimension}`)
      : pickRandom(genericPrompts, 'generic');
    return `${milestone} ${dim}`;
  }

  // Dimension-specific prompt
  if (dimension && dimensionPrompts[dimension]) {
    return pickRandom(dimensionPrompts[dimension], `dim-${dimension}`);
  }

  // Fallback generic
  return pickRandom(genericPrompts, 'generic');
}

/**
 * Get dynamic, score-aware feedback after answering.
 */
export function getAnswerFeedback(score: number, dimension?: string | null): string {
  const tier = score <= 2 ? 'low' : score >= 4 ? 'high' : 'mid';

  // 40% chance to use dimension-specific feedback if available
  if (dimension && dimensionFeedback[dimension]?.[tier] && Math.random() < 0.4) {
    return pickRandom(dimensionFeedback[dimension][tier], `dfb-${dimension}-${tier}`);
  }

  return pickRandom(feedbackByScore[tier], `fb-${tier}`);
}
