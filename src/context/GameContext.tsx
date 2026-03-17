import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface PlayerProfile {
  name: string;
  age: number; // actual age entered
  ageGroup: string; // '18-25', '26-39', '40-59', '60+'
  gender: string;
  phone: string;
  country: string;
  state: string;
  district: string;
  role: string; // 'SAL', 'STU', etc.
  roleLabel: string;
  profileCode: string; // 'A1_SAL', etc.
}

export interface GameState {
  step: 'welcome' | 'consent' | 'profile' | 'phone-verify' | 'quiz' | 'reflection' | 'report';
  phoneVerified: boolean;
  profile: PlayerProfile;
  consentGiven: boolean;
  currentQuestion: number; // 0-17
  answers: { [questionIndex: number]: number }; // question index -> score (10-50)
  reflectionAnswer: string;
  language: 'en' | 'ml';
  isMuted: boolean;
  campaignId: string | null;
  campaignCode: string | null;
}

type Action =
  | { type: 'SET_STEP'; step: GameState['step'] }
  | { type: 'SET_PROFILE'; profile: PlayerProfile }
  | { type: 'SET_CONSENT'; value: boolean }
  | { type: 'START_QUIZ' }
  | { type: 'SET_PHONE_VERIFIED'; verified: boolean }
  | { type: 'ANSWER_QUESTION'; question: number; score: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'SET_REFLECTION'; answer: string }
  | { type: 'SET_LANGUAGE'; lang: 'en' | 'ml' }
  | { type: 'SET_MUTE'; value: boolean }
  | { type: 'SET_CAMPAIGN'; campaignId: string | null }
  | { type: 'SET_CAMPAIGN_CODE'; code: string | null }
  | { type: 'RETAKE' }
  | { type: 'RESET' };

const initialProfile: PlayerProfile = {
  name: '', age: 0, ageGroup: '', gender: '', phone: '',
  country: 'India', state: '', district: '',
  role: '', roleLabel: '', profileCode: '',
};

const initialState: GameState = {
  step: 'welcome',
  profile: { ...initialProfile },
  consentGiven: false,
  phoneVerified: false,
  currentQuestion: 0,
  answers: {},
  reflectionAnswer: '',
  language: 'en',
  isMuted: false,
  campaignId: null,
  campaignCode: null,
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_STEP': return { ...state, step: action.step };
    case 'SET_PROFILE': return { ...state, profile: action.profile };
    case 'SET_CONSENT': return { ...state, consentGiven: action.value };
    case 'START_QUIZ': return { ...state, currentQuestion: 0, answers: {}, step: 'quiz' };
    case 'SET_PHONE_VERIFIED': return { ...state, phoneVerified: action.verified };
    case 'ANSWER_QUESTION': {
      return { ...state, answers: { ...state.answers, [action.question]: action.score } };
    }
    case 'NEXT_QUESTION': return { ...state, currentQuestion: state.currentQuestion + 1 };
    case 'PREV_QUESTION': return { ...state, currentQuestion: Math.max(0, state.currentQuestion - 1) };
    case 'SET_REFLECTION': return { ...state, reflectionAnswer: action.answer };
    case 'SET_LANGUAGE': return { ...state, language: action.lang };
    case 'SET_MUTE': return { ...state, isMuted: action.value };
    case 'SET_CAMPAIGN': return { ...state, campaignId: action.campaignId };
    case 'SET_CAMPAIGN_CODE': return { ...state, campaignCode: action.code };
    case 'RETAKE': return {
      ...state,
      currentQuestion: 0,
      answers: {},
      reflectionAnswer: '',
      step: 'profile',
    };
    case 'RESET': return { ...initialState, campaignId: state.campaignId, campaignCode: state.campaignCode };
    default: return state;
  }
}

const GameContext = createContext<{ state: GameState; dispatch: React.Dispatch<Action> } | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

export const useGameSafe = () => {
  return useContext(GameContext);
};
