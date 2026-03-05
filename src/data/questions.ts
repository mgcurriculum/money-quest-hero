export interface Scenario {
  situation: string;
  options: string[];
}

export interface Level {
  id: number;
  title: string;
  theme: string;
  icon: string;
  color: string;
  scenarios: Scenario[];
}

export const levels: Level[] = [
  {
    id: 0,
    title: "The Earning Quest",
    theme: "Discover your earning mindset",
    icon: "💼",
    color: "game-blue",
    scenarios: [
      {
        situation: "You have free time after college. Your friends are relaxing, but you spot a chance to freelance or teach tuition. What do you do?",
        options: [
          "Ignore it and enjoy free time",
          "Think about it but don't act",
          "Try once if it's easy",
          "Actively search for opportunities",
          "Start building regular side income",
        ],
      },
      {
        situation: "A senior tells you about internships that pay small stipends but teach valuable skills.",
        options: [
          "Not interested unless salary is high",
          "Maybe apply if convenient",
          "Apply casually",
          "Apply seriously and prepare",
          "Actively hunt for internships",
        ],
      },
      {
        situation: "You discover your hobby could earn money online.",
        options: [
          "Keep it only as a hobby",
          "Think it's difficult to monetize",
          "Try once or twice",
          "Offer services occasionally",
          "Build a small income stream",
        ],
      },
    ],
  },
  {
    id: 1,
    title: "Spending Challenge",
    theme: "Evaluate impulse spending behaviour",
    icon: "💳",
    color: "game-purple",
    scenarios: [
      {
        situation: "You see a bag you like but already have similar ones at home.",
        options: [
          "Buy immediately",
          "Buy because friends encourage",
          "Think but still buy",
          "Wait a day to decide",
          "Walk away confidently",
        ],
      },
      {
        situation: "You spot a limited-time sneaker sale online with 40% off.",
        options: [
          "Order immediately",
          "Order because of the discount",
          "Think and maybe buy",
          "Check budget first",
          "Skip — it's unplanned",
        ],
      },
      {
        situation: "At month end your money is low. What's the most likely reason?",
        options: [
          "Spent without noticing",
          "Mostly outings with friends",
          "Unexpected spending came up",
          "Slightly miscalculated budget",
          "I planned carefully — rarely happens",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Saving Mission",
    theme: "Evaluate saving habits",
    icon: "💰",
    color: "game-green",
    scenarios: [
      {
        situation: "You receive ₹3,000 unexpectedly. What's your first move?",
        options: [
          "Spend it quickly on wants",
          "Spend most, save a little",
          "Save a portion casually",
          "Save a fixed portion first",
          "Save first, then budget the rest",
        ],
      },
      {
        situation: "You want a ₹15,000 gadget badly. How do you plan?",
        options: [
          "Ask parents to buy it",
          "Use whatever money I have now",
          "Save slowly without a plan",
          "Set a monthly savings goal",
          "Create a structured savings plan with a deadline",
        ],
      },
      {
        situation: "You check your savings after a few months. What do you see?",
        options: [
          "I rarely have savings",
          "Savings disappear quickly",
          "Sometimes I manage to save",
          "Proud to see steady growth",
          "I track and grow savings actively",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Debt Trap",
    theme: "Borrowing awareness",
    icon: "🧾",
    color: "game-red",
    scenarios: [
      {
        situation: "A friend suggests using Buy Now Pay Later for a purchase you can't afford right now.",
        options: [
          "Use it immediately — sounds great",
          "Use it because everyone does",
          "Use it only if EMI is small",
          "Prefer to save up instead",
          "Avoid borrowing completely",
        ],
      },
      {
        situation: "You borrow ₹2,000 from a friend. How do you handle repayment?",
        options: [
          "Delay as long as possible",
          "Repay only when reminded",
          "Repay eventually when I remember",
          "Repay quickly within days",
          "Repay on time — I track borrowed amounts",
        ],
      },
      {
        situation: "You see ads for instant loan apps promising easy money.",
        options: [
          "Sounds useful — might try",
          "Interested but not sure",
          "Unsure if they're safe",
          "Avoid unless real emergency",
          "Completely avoid — I know the risks",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Investment World",
    theme: "Wealth awareness",
    icon: "📈",
    color: "game-gold",
    scenarios: [
      {
        situation: "Friends are discussing mutual funds and stocks. What's your reaction?",
        options: [
          "Ignore — not relevant to me",
          "Think it's too risky",
          "Curious but take no action",
          "Start learning about it",
          "Already investing small amounts",
        ],
      },
      {
        situation: "You receive ₹10,000 as a gift. What do you do with it?",
        options: [
          "Spend most of it",
          "Keep as cash at home",
          "Put in bank savings account",
          "Invest a small portion",
          "Invest a major portion thoughtfully",
        ],
      },
      {
        situation: "A friend says 'Stock market is just gambling.' Your take?",
        options: [
          "Totally agree",
          "Mostly agree — seems risky",
          "Not sure what to think",
          "I understand the difference",
          "I know investing requires knowledge & patience",
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Protection Shield",
    theme: "Financial safety awareness",
    icon: "🛡️",
    color: "game-orange",
    scenarios: [
      {
        situation: "Your bank calls asking for your OTP to 'verify your account.' What do you do?",
        options: [
          "Share it — they're from the bank",
          "Share if they sound urgent",
          "Hesitate but share anyway",
          "Refuse and call bank directly",
          "Refuse, report as potential fraud",
        ],
      },
      {
        situation: "You're paying via UPI QR code at a shop. How careful are you?",
        options: [
          "Pay without checking anything",
          "Trust the shop — just pay",
          "Check the amount shown",
          "Verify merchant name and amount",
          "Always verify carefully before confirming",
        ],
      },
      {
        situation: "A friend lost money in an online scam. What's your takeaway?",
        options: [
          "Ignore — won't happen to me",
          "Feel bad but think it's bad luck",
          "Become more careful going forward",
          "Learn about common fraud types",
          "Already follow safe digital practices",
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

export const levelTraits = [
  { label: "Income Mindset", icon: "💼" },
  { label: "Spending Behaviour", icon: "💳" },
  { label: "Saving Behaviour", icon: "💰" },
  { label: "Debt Awareness", icon: "🧾" },
  { label: "Investment Awareness", icon: "📈" },
  { label: "Safety Awareness", icon: "🛡️" },
];

export const traitProfiles: { [key: number]: string[] } = {
  0: ["Income Ignorer", "Income Thinker", "Income Trier", "Income Explorer", "Income Builder"],
  1: ["Impulse Buyer", "Social Spender", "Emotional Spender", "Smart Spender", "Mindful Spender"],
  2: ["Non-Saver", "Occasional Saver", "Growing Saver", "Consistent Saver", "Savings Master"],
  3: ["Debt Prone", "Casual Borrower", "Cautious Borrower", "Debt Avoider", "Debt Free Champion"],
  4: ["Investment Avoider", "Investment Skeptic", "Investment Curious", "Future Investor", "Investment Explorer"],
  5: ["Fraud Vulnerable", "Somewhat Aware", "Getting Careful", "Money Protector", "Security Expert"],
};
