export interface Scenario {
  situation: string;
  scene: string; // emoji scene illustration
  character: string; // character emoji
  options: { text: string; emoji: string }[];
}

export interface Level {
  id: number;
  title: string;
  theme: string;
  icon: string;
  color: string;
  bgEmoji: string; // background decoration
  scenarios: Scenario[];
}

export const levels: Level[] = [
  {
    id: 0,
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
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
