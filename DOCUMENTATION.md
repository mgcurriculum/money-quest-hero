# FQ Test – Money Quest by FinQuo Versity

## 1. Overview

**FQ Test** (Money Quest) is a gamified Financial Quotient assessment tool built by **FinQuo Versity**. Players navigate through 7 themed levels — starting with a Financial Reality Check followed by 6 real-life financial scenario levels — to discover their financial personality, strengths, and areas for growth. The result is a personalized FQ Test Score (0–1000) along with financial personality archetypes and actionable quests.

---

## 2. Game Flow

The **FQ Test** follows a 7-step linear progression:

```
Welcome → Consent → Profile → Journey Map → Level Play (×7) → Reflection → Report
```

| Step | Screen | Description |
|------|--------|-------------|
| 1 | **Welcome** | Introduction to the FQ Test and language selection (English / Malayalam) |
| 2 | **Consent** | Data privacy consent before proceeding |
| 3 | **Profile** | Player fills in demographic details |
| 4 | **Journey Map** | Visual map showing all 7 levels; player picks a level to play |
| 5 | **Level Play** | Level 0: 11 reality-check questions; Levels 1–6: 3 scenario-based questions each (29 total questions) |
| 6 | **Reflection** | Post-game self-reflection on financial goals |
| 7 | **Report** | FQ Test Score, personality archetypes, dimension breakdown, and quests |

---

## 3. Player Profile Fields

| Field | Description |
|-------|-------------|
| `name` | Player's full name |
| `age` | Age |
| `gender` | Gender |
| `phone` | Phone number |
| `country` | Country (default: India) |
| `state` | State |
| `district` | District |
| `status` | Current status (e.g., student, employed) |
| `incomeType` | Type of income |

---

## 4. All 7 Levels with Full Questions

---

### Level 0: 📋 Financial Reality Check
**Theme:** Know your real financial situation
**Dimension:** Financial Reality
**Questions:** 11

#### Question 1: Current Stage of Life
> What best describes your current stage?

| # | Option | Score |
|---|--------|-------|
| 1 | 🎒 In school (Class 11/12) | 1 |
| 2 | 🎓 In college | 2 |
| 3 | 🧑‍💻 Doing a course or skill program | 3 |
| 4 | 💼 Working part-time or full-time | 4 |
| 5 | 🚀 Running a business / startup | 5 |

#### Question 2: Income Source
> How do you usually receive money?

| # | Option | Score |
|---|--------|-------|
| 1 | 👨‍👩‍👧 Fully dependent on parents | 1 |
| 2 | 💸 Pocket money from family | 2 |
| 3 | 🧑‍💻 Freelance / gig work | 3 |
| 4 | 💼 Salary from job | 4 |
| 5 | 🚀 Business / startup income | 5 |

#### Question 3: Monthly Income
> How much money do you receive or earn every month from all sources?

| # | Option | Score |
|---|--------|-------|
| 1 | 💰 Up to ₹5,000 | 1 |
| 2 | 💰 ₹5,000 – ₹10,000 | 2 |
| 3 | 💰 ₹10,000 – ₹25,000 | 3 |
| 4 | 💰 ₹25,000 – ₹50,000 | 4 |
| 5 | 🚀 Above ₹50,000 | 5 |

#### Question 4: Monthly Spending
> On average, how much do you spend every month?

| # | Option | Score |
|---|--------|-------|
| 1 | 🪙 Less than ₹1,000 | 1 |
| 2 | 💸 ₹1,000 – ₹2,500 | 2 |
| 3 | 💳 ₹2,500 – ₹5,000 | 3 |
| 4 | 🛍 ₹5,000 – ₹10,000 | 4 |
| 5 | 🚀 Above ₹10,000 | 5 |

#### Question 5: Current Savings
> How much money do you currently have saved?

| # | Option | Score |
|---|--------|-------|
| 1 | 🪙 No savings yet | 1 |
| 2 | 💰 Less than ₹500 | 2 |
| 3 | 💰 ₹500 – ₹2,000 | 3 |
| 4 | 💰 ₹2,000 – ₹10,000 | 4 |
| 5 | 🏦 More than ₹10,000 | 5 |

#### Question 6: Current Debt
> Do you currently owe money to anyone?

| # | Option | Score |
|---|--------|-------|
| 1 | 🟢 No debt at all | 1 |
| 2 | 🟡 Less than ₹1,000 | 2 |
| 3 | 🟠 ₹1,000 – ₹5,000 | 3 |
| 4 | 🔴 ₹5,000 – ₹25,000 | 4 |
| 5 | ⚠️ More than ₹25,000 | 5 |

#### Question 7: Investment Experience
> Have you ever invested money?

| # | Option | Score |
|---|--------|-------|
| 1 | 🪙 No investment yet | 1 |
| 2 | 🪙 Physical savings (gold or cash) | 2 |
| 3 | 🏦 Bank FD / RD | 3 |
| 4 | 📈 Mutual fund SIP | 4 |
| 5 | 🚀 Stocks / crypto / advanced investments | 5 |

#### Question 8: Insurance Coverage
> Does your family currently have any insurance coverage?

| # | Option | Score |
|---|--------|-------|
| 1 | ❌ No insurance | 1 |
| 2 | 🏛 Government scheme only | 2 |
| 3 | 🏥 One private insurance policy | 3 |
| 4 | 🛡 Multiple policies covering family | 4 |
| 5 | 🧠 I help manage or understand these policies | 5 |

#### Question 9: Tracking Expenses
> How often do you track your spending?

| # | Option | Score |
|---|--------|-------|
| 1 | ❌ Never track it | 1 |
| 2 | ⚠️ Rarely track | 2 |
| 3 | 🤔 Sometimes check my balance | 3 |
| 4 | 📊 Often review my spending | 4 |
| 5 | 📱 Track every expense carefully | 5 |

#### Question 10: Financial Knowledge Growth
> How interested are you in improving your financial knowledge?

| # | Option | Score |
|---|--------|-------|
| 1 | ❌ Not interested | 1 |
| 2 | 🤷 Slightly curious | 2 |
| 3 | 🤔 Somewhat interested | 3 |
| 4 | 📚 Interested in learning more | 4 |
| 5 | 🚀 Actively learning about money | 5 |

#### Question 11: Money Journey Commitment
> Are you ready to take charge of your money journey?

| # | Option | Score |
|---|--------|-------|
| 1 | 😴 Not ready yet | 1 |
| 2 | 🤔 Maybe later | 2 |
| 3 | 🙂 Thinking about it | 3 |
| 4 | 💪 Yes, I want to improve | 4 |
| 5 | 🚀 Absolutely! I'm ready to level up | 5 |

---

### Level 1: 💼 The Earning Quest
**Theme:** Discover your earning mindset  
**Dimension:** Earning Mindset

#### Scenario 1
> 🎬 Scene: It's a lazy Sunday afternoon. Your friends are binge-watching Netflix. Suddenly, your phone buzzes — someone on Instagram is looking for a freelance designer. Clock is ticking! ⏰

| # | Option | Score |
|---|--------|-------|
| 1 | 😴 Nah, pass the popcorn 🍿 | 1 |
| 2 | 🤔 Hmm, interesting... *scrolls past* | 2 |
| 3 | 📱 Maybe I'll DM them... tomorrow | 3 |
| 4 | ⚡ I'm on it! Sending my portfolio now | 4 |
| 5 | 🔥 Already have 3 freelance gigs running 💪 | 5 |

#### Scenario 2
> 🎓 Plot twist! A senior drops a hot tip: 'This startup pays ₹5K/month for interns AND teaches you real skills.' Your move, player?

| # | Option | Score |
|---|--------|-------|
| 1 | 💤 ₹5K? That's pocket change, skip! | 1 |
| 2 | 🐌 Sounds cool but... effort 😮‍💨 | 2 |
| 3 | 📝 I'll apply if the form is short | 3 |
| 4 | 🎯 Resume updated, application sent! 📨 | 4 |
| 5 | 🏆 I'm already interning + upskilling! | 5 |

#### Scenario 3
> 🎨 Quest unlocked! You realize your hobby — drawing, coding, gaming — could actually make money online. The internet is your marketplace! 🌐

| # | Option | Score |
|---|--------|-------|
| 1 | 🎈 Hobbies are for fun, not work | 1 |
| 2 | 😕 Too complicated to monetize | 2 |
| 3 | 📉 Posted once, got 2 likes... gave up | 3 |
| 4 | 🛠️ Setting up my Fiverr profile tonight! | 4 |
| 5 | 🌟 Already earning from my passion! 💸 | 5 |

---

### Level 2: 💳 Spending Challenge
**Theme:** Battle the impulse monster!  
**Dimension:** Spending Discipline

#### Scenario 1
> 🛍️ DANGER ZONE! You're at the mall and spot THE perfect bag. But wait... you already own 3 similar ones at home. The Impulse Monster whispers: 'Treat yourself!' 👹

| # | Option | Score |
|---|--------|-------|
| 1 | 🤑 YOLO! *taps card* 💸 | 1 |
| 2 | 👥 Friends say buy it, so... okay! | 2 |
| 3 | 😬 I know I shouldn't but... *buys* | 3 |
| 4 | 🧘 Walking away. Sleeping on it 😤 | 4 |
| 5 | 🛡️ Didn't even enter the store 😎 | 5 |

#### Scenario 2
> ⚡ FLASH SALE ALERT! Those sneakers you kinda wanted are 40% OFF for the next 2 hours! Your wallet is watching nervously... 👀

| # | Option | Score |
|---|--------|-------|
| 1 | 🏃 ORDERED! Can't miss this deal! | 1 |
| 2 | 🤡 40% off = basically free, right? | 2 |
| 3 | 🛒 Added to cart... thinking... | 3 |
| 4 | 📋 Let me check my budget first 📊 | 4 |
| 5 | 💪 Unplanned = Unwanted. Next! ✋ | 5 |

#### Scenario 3
> 📅 Month end boss fight! You check your balance and it's... dangerously low. The 'Where Did My Money Go?' mystery begins 🔍

| # | Option | Score |
|---|--------|-------|
| 1 | 👻 Money just... vanishes? 🤷 | 1 |
| 2 | 🍕 Too many hangouts with the squad | 2 |
| 3 | 💥 Some surprise expenses hit me | 3 |
| 4 | 📐 Slightly miscalculated, I'll adjust | 4 |
| 5 | 📊 This rarely happens — I track it all! | 5 |

---

### Level 3: 💰 Saving Mission
**Theme:** Build your treasure chest!  
**Dimension:** Saving Behaviour

#### Scenario 1
> 🎁 LOOT DROP! You just received ₹3,000 unexpectedly — birthday money, cashback, or that friend who finally paid back! What's your power move? ⚡

| # | Option | Score |
|---|--------|-------|
| 1 | 🎉 Shopping spree incoming! 🛒 | 1 |
| 2 | 🤫 Spend most, hide ₹500 maybe | 2 |
| 3 | ⚖️ Save some... spend some... balance? | 3 |
| 4 | 🎯 ₹2,000 saved first, rest is play money | 4 |
| 5 | 🏆 Straight to savings. Budget the rest! | 5 |

#### Scenario 2
> 🎮 SIDE QUEST: You've been eyeing a ₹15,000 gadget for weeks. It's calling your name! How do you plan this epic purchase?

| # | Option | Score |
|---|--------|-------|
| 1 | 🙏 Mom/Dad, pleeeease? 🥺 | 1 |
| 2 | 💸 Use whatever I have right now | 2 |
| 3 | 🤞 Save randomly and hope for the best | 3 |
| 4 | 📅 ₹3K/month × 5 months = MINE! | 4 |
| 5 | 🗂️ Savings plan with deadline + tracker! | 5 |

#### Scenario 3
> 📊 STATS CHECK! You peek at your savings after a few months. What does your treasure chest look like?

| # | Option | Score |
|---|--------|-------|
| 1 | 🕳️ What savings? 😅 | 1 |
| 2 | 🪄 Had some, but they vanished | 2 |
| 3 | 🌱 Small wins here and there | 3 |
| 4 | 📈 Growing steadily! Feels amazing | 4 |
| 5 | 👑 I track every rupee! Master saver! | 5 |

---

### Level 4: 🧾 Debt Trap
**Theme:** Escape the debt dungeon!  
**Dimension:** Debt Awareness

#### Scenario 1
> 🕸️ TRAP DETECTED! Your friend says: 'Just use Buy Now Pay Later — everyone does it!' The siren song of easy money plays... 🎵

| # | Option | Score |
|---|--------|-------|
| 1 | 🎪 Sounds genius! *clicks buy* | 1 |
| 2 | 🐑 If everyone does it, must be fine | 2 |
| 3 | 🤏 Only if the EMI is tiny... | 3 |
| 4 | 🏋️ Nah, I'll save up for it | 4 |
| 5 | 🛑 Hard pass! I don't borrow! | 5 |

#### Scenario 2
> 🤝 HONOR TEST! You borrowed ₹2,000 from a friend last week. Your repayment style reveals your character!

| # | Option | Score |
|---|--------|-------|
| 1 | 🙈 They'll forget... right? 😬 | 1 |
| 2 | 📞 I'll pay when they remind me | 2 |
| 3 | 🔔 Oh yeah! Almost forgot — transferring | 3 |
| 4 | ✅ Paid back within 2 days! ⚡ | 4 |
| 5 | 📒 I track all debts — already repaid! | 5 |

#### Scenario 3
> 📱 BOSS BATTLE! Flashy ads promise: 'Get ₹50,000 instantly! No documents! Download now!' The Debt Monster attacks! 🐉

| # | Option | Score |
|---|--------|-------|
| 1 | 📲 Downloading! Free money! 🤩 | 1 |
| 2 | 🧐 Hmm interesting, might try later | 2 |
| 3 | 😰 Seems sketchy but not sure why | 3 |
| 4 | 🆘 Only in a real emergency, maybe | 4 |
| 5 | 🛡️ I know these are traps — BLOCKED! 🚫 | 5 |

---

### Level 5: 📈 Investment World
**Theme:** Grow your wealth garden!  
**Dimension:** Investment Awareness

#### Scenario 1
> 🏛️ THE COUNCIL! Your friend group is debating: 'Should we invest in mutual funds?' The room looks at you. What's your vibe?

| # | Option | Score |
|---|--------|-------|
| 1 | 🙅 Investing? I'm 20, not 50! 😂 | 1 |
| 2 | 😨 Sounds risky, I'll keep my cash | 2 |
| 3 | 📚 Curious but I need to learn more | 3 |
| 4 | 🔍 Already researching! SIP calculator open | 4 |
| 5 | 💹 I started my first SIP last month! 🚀 | 5 |

#### Scenario 2
> 🎰 POWER-UP! Someone gifts you ₹10,000! This is your chance to make it grow or blow. Choose wisely, adventurer!

| # | Option | Score |
|---|--------|-------|
| 1 | 🛍️ Shopping spree! Treat yo'self! | 1 |
| 2 | 💤 Keep it under my mattress 🛏️ | 2 |
| 3 | 🏦 Park it in savings account | 3 |
| 4 | 📊 Invest 30% in index funds! | 4 |
| 5 | 🧠 70% invested + diversified! 📈 | 5 |

#### Scenario 3
> ⚔️ DEBATE TIME! A friend declares: 'Stock market is just gambling for rich people!' Your counter-move?

| # | Option | Score |
|---|--------|-------|
| 1 | 🎲 100% agree! It's all luck | 1 |
| 2 | ⚠️ Mostly agree — seems dangerous | 2 |
| 3 | 🤷 Honestly? I don't know enough | 3 |
| 4 | 📖 There's a difference — research matters | 4 |
| 5 | 🧘 I invest based on knowledge & patience! | 5 |

---

### Level 6: 🛡️ Protection Shield
**Theme:** Defend against digital villains!  
**Dimension:** Financial Safety

#### Scenario 1
> 📞 INCOMING THREAT! 'Hello, this is your bank. We need your OTP to verify your account or it will be BLOCKED!' They sound urgent! 😱

| # | Option | Score |
|---|--------|-------|
| 1 | 😱 OMG! Here's my OTP: **** | 1 |
| 2 | 😟 They sound legit... okay fine | 2 |
| 3 | 😰 Hmm that's weird... but maybe... | 3 |
| 4 | 📞 Nice try! Hanging up + calling bank | 4 |
| 5 | 🛡️ Reported to cyber cell already 🚔 | 5 |

#### Scenario 2
> 🏪 QUICK PAY! You're scanning a QR code to pay at a street food stall. But is that QR code legit or a villain's trap? 🦹‍♂️

| # | Option | Score |
|---|--------|-------|
| 1 | ⚡ Scan and pay, no time to check! | 1 |
| 2 | 🤷 The shop looks fine, just pay | 2 |
| 3 | 👀 At least I check the amount | 3 |
| 4 | ✅ Verify name + amount before confirming | 4 |
| 5 | 🔐 I triple-check everything! Always! | 5 |

#### Scenario 3
> 😨 PLOT TWIST! Your friend just lost ₹25,000 in an online scam! They're devastated. What's YOUR takeaway from this event?

| # | Option | Score |
|---|--------|-------|
| 1 | 🙄 Won't happen to me, I'm smart 😎 | 1 |
| 2 | 😢 Poor thing, just bad luck | 2 |
| 3 | 🤔 Okay, I'll be more careful now | 3 |
| 4 | 📖 Time to learn about common scams! | 4 |
| 5 | 🏅 Already following cyber safety practices! | 5 |

---

## 5. Scoring Criteria

### Per-Question Scoring
- Each question/scenario has **5 options** scored **1 to 5**
- Option 1 (first) = **1 point** (lowest financial awareness)
- Option 5 (last) = **5 points** (highest financial awareness)

### Per-Level Normalized Score
Each level's raw score is normalized to 0–100:

```
normalizedScore = ((userScore - minScore) / (maxScore - minScore)) × 100
```

Where:
- `userScore` = sum of selected option scores for the level
- `minScore` = number of questions × 1
- `maxScore` = number of questions × 5

For Level 0: minScore = 11, maxScore = 55
For Levels 1–6: minScore = 3, maxScore = 15

### Dimension Weights

| Dimension | Weight |
|-----------|--------|
| 📋 Financial Reality | 0.10 |
| 💼 Earning Mindset | 0.13 |
| 💳 Spending Discipline | 0.17 |
| 💰 Saving Behaviour | 0.17 |
| 🧾 Debt Awareness | 0.14 |
| 📈 Investment Awareness | 0.14 |
| 🛡️ Financial Safety | 0.15 |
| **Total** | **1.00** |

### FQ Test Score Calculation

```
FQ Test Score = (Σ normalizedScore[i] × weight[i]) × 10
```

**Range: 0 – 1000**

---

## 6. FQ Test Score Bands

| Score Range | Level | Meaning | Emoji |
|-------------|-------|---------|-------|
| 0 – 199 | Financial Beginner | Limited awareness — your journey starts here! | 🌱 |
| 200 – 399 | Financial Explorer | Basic awareness — keep exploring! | 🧭 |
| 400 – 599 | Developing Money Skills | Improving habits — you're on the right track! | 📚 |
| 600 – 799 | Financially Smart | Good control — strong financial instincts! | 🧠 |
| 800 – 899 | Wealth Builder | Strong discipline — building real wealth! | 🏗️ |
| 900 – 1000 | Financial Master | Highly optimized behaviour — you're a legend! | 👑 |

---

## 7. Financial Personality Archetypes

There are **14 archetypes** — 2 per dimension (High ≥ 50% normalized score, Low < 50%).

### Financial Reality

| Type | Name | Emoji | Trait | Strength/Risk | Quest |
|------|------|-------|-------|---------------|-------|
| High | Reality Checker | 📋 | Strong grasp of real financial situation | **Strength:** Self-awareness | Review your finances monthly |
| Low | Reality Explorer | 🔍 | Still discovering financial realities | **Risk:** Lack of financial self-awareness | List all your income and expenses this week |

### Earning Mindset

| Type | Name | Emoji | Trait | Strength/Risk | Quest |
|------|------|-------|-------|---------------|-------|
| High | Income Explorer | 💼 | Actively seeks earning opportunities | **Strength:** Income growth mindset | Diversify income streams |
| Low | Skill Monetizer | 🎯 | Turns skills or hobbies into money | **Risk:** Untapped earning potential | Start a freelance side project |

### Spending Discipline

| Type | Name | Emoji | Trait | Strength/Risk | Quest |
|------|------|-------|-------|---------------|-------|
| High | Smart Spender | 💳 | Controls impulse purchases | **Strength:** Budget awareness | Track every purchase for 30 days |
| Low | Lifestyle Drifter | 🛍️ | Spends based on social influence | **Risk:** Peer pressure spending | Follow the 24-hour rule before buying |

### Saving Behaviour

| Type | Name | Emoji | Trait | Strength/Risk | Quest |
|------|------|-------|-------|---------------|-------|
| High | Growing Saver | 💰 | Consistently builds savings | **Strength:** Emergency fund mindset | Save ₹500 weekly for 4 weeks |
| Low | Future Planner | 📊 | Plans financial goals ahead | **Risk:** Inconsistent savings habit | Set up automatic savings transfer |

### Debt Awareness

| Type | Name | Emoji | Trait | Strength/Risk | Quest |
|------|------|-------|-------|---------------|-------|
| High | Debt Avoider | 🧾 | Cautious about borrowing | **Strength:** Responsible repayment behaviour | Create a debt-free action plan |
| Low | Credit Juggler | ⚠️ | Uses debt casually | **Risk:** EMI-driven lifestyle | Review & eliminate one unnecessary subscription |

### Investment Awareness

| Type | Name | Emoji | Trait | Strength/Risk | Quest |
|------|------|-------|-------|---------------|-------|
| High | Future Investor | 📈 | Interested in wealth creation | **Strength:** Long-term mindset | Start a ₹500 monthly SIP |
| Low | Market Learner | 📚 | Early stage investment curiosity | **Risk:** Analysis paralysis | Read one investment article daily for a week |

### Financial Safety

| Type | Name | Emoji | Trait | Strength/Risk | Quest |
|------|------|-------|-------|---------------|-------|
| High | Money Protector | 🛡️ | High awareness of fraud and financial safety | **Strength:** Fraud awareness | Share one safety tip with a friend |
| Low | Risk Blind | 🚨 | Low financial safety awareness | **Risk:** Vulnerable to scams | Learn about 3 common financial scams |

---

## 8. Trait Profiles

Each dimension has a **5-tier trait label** corresponding to scores 1–5:

| Tier | 📋 Reality | 💼 Earning | 💳 Spending | 💰 Saving | 🧾 Debt | 📈 Investment | 🛡️ Safety |
|------|-----------|-----------|------------|----------|---------|--------------|----------|
| 1 | Reality Unaware | Income Ignorer | Impulse Buyer | Non-Saver | Debt Prone | Investment Avoider | Fraud Vulnerable |
| 2 | Reality Curious | Income Thinker | Social Spender | Occasional Saver | Casual Borrower | Investment Skeptic | Somewhat Aware |
| 3 | Reality Aware | Income Trier | Emotional Spender | Growing Saver | Cautious Borrower | Investment Curious | Getting Careful |
| 4 | Reality Checker | Income Explorer | Smart Spender | Consistent Saver | Debt Avoider | Future Investor | Money Protector |
| 5 | Reality Master | Income Builder | Mindful Spender | Savings Master | Debt Free Champion | Investment Explorer | Security Expert |

---

## 9. Reflection Options

After completing all levels, the player selects one financial goal to focus on:

1. 💼 Earn more actively
2. 💳 Spend smarter
3. 💰 Save consistently
4. 🧾 Avoid unnecessary debt
5. 📈 Start investing
6. 🛡️ Protect money from scams

---

## 10. Technical Architecture

| Component | Technology |
|-----------|------------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| State Management | React Context + useReducer (`GameContext`) |
| Routing | React Router v6 |
| Build Tool | Vite |

### Key Files

| File | Purpose |
|------|---------|
| `src/context/GameContext.tsx` | Global game state (step, profile, answers, completed levels) |
| `src/data/questions.ts` | All questions, scoring logic, archetypes, FQ bands |
| `src/pages/Index.tsx` | Main game page orchestrating all screens |
| `src/components/game/*.tsx` | Individual screen components (Welcome, Consent, Profile, JourneyMap, LevelPlay, RealityCheckPlay, Reflection, Report) |

### State Shape

```typescript
interface GameState {
  step: 'welcome' | 'consent' | 'profile' | 'journey' | 'level' | 'reflection' | 'report';
  profile: PlayerProfile;
  consentGiven: boolean;
  currentLevel: number;      // 0–6
  currentQuestion: number;   // 0–10 (Level 0) or 0–2 (Levels 1–6)
  answers: { [level: number]: { [questionIndex: number]: number } };
  completedLevels: number[];
  reflectionAnswer: string;
  language: 'en' | 'ml';
}
```
