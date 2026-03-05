

## Plan: Convert Voice Narration from Direct Reading to Assistant-Style Explanations

The current narration reads screen text verbatim. The change is to replace all narration strings with conversational, assistant-style explanations that guide the user rather than repeat what's on screen.

### Narration Text Changes

**WelcomeScreen.tsx**
- Current: "Welcome to the FQ Test by FinQuo Versity. Discover how smart you are with money..."
- New: "Hey there! I'm your financial guide. This is a quick and fun quiz that'll help you understand how smart you really are with money. It only takes about 5 minutes. Ready? Just tap Start!"

**ConsentScreen.tsx**
- Current: "Before we begin. We respect your privacy..."
- New: "Alright, just a quick heads up! We need your consent before we start. Don't worry, your data stays safe and private. Just check both boxes and we're good to go!"

**ProfileScreen.tsx**
- Step 0 current: "Create your money profile. Enter your name, age and gender..."
- Step 0 new: "Let's get to know you a bit! Just fill in your name, and optionally your age and gender. This helps us personalize your results."
- Step 1 current: "What best describes your current stage?..."
- Step 1 new: "Great! Now tell me a little about where you are in life and how money comes your way. This helps me tailor the scenarios to you."

**JourneyMap.tsx**
- Mount: "Here's your quest board! Each level covers a different money skill. Start from the top and work your way down. Tap any unlocked level to begin!"
- All complete: "Wow, you crushed it! All levels done. Let's see how you scored. Tap the button below to view your results!"

**RealityCheckPlay.tsx** (questions)
- Instead of reading the question text verbatim, narrate: "Here's a question about [category]. Take a moment to read it and pick the answer that feels most like you."
- Use `question.category` to make it contextual

**LevelPlay.tsx** (scenario questions)
- Instead of reading `scenario.situation` verbatim, narrate: "Alright, picture this scenario. Read through the situation and choose how you'd handle it."
- Keep feedback voice as-is (short phrases like "Noted!", "Bold move!")

**ReflectionScreen.tsx**
- Step 0 current: "How interested are you in improving..."
- Step 0 new: "We're almost done! I'm curious — how interested are you in actually getting better with money? Be honest!"
- Step 1 current: "Final reflection..."
- Step 1 new: "Last question! If you could level up just one money skill this year, which would it be? Pick the one that matters most to you."

### Files to Change
- `src/components/game/WelcomeScreen.tsx` — Update WELCOME_TEXT
- `src/components/game/ConsentScreen.tsx` — Update CONSENT_TEXT
- `src/components/game/ProfileScreen.tsx` — Update PROFILE_TEXT_0 and PROFILE_TEXT_1
- `src/components/game/JourneyMap.tsx` — Update both narration strings
- `src/components/game/RealityCheckPlay.tsx` — Change from `question.question` to assistant-style text using category
- `src/components/game/LevelPlay.tsx` — Change from `scenario.situation` to assistant-style text
- `src/components/game/ReflectionScreen.tsx` — Update REFLECTION_TEXT_0 and REFLECTION_TEXT_1

