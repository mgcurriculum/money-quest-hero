import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface PlayerProfile {
  name: string;
  age: string;
  gender: string;
  phone: string;
  country: string;
  state: string;
  district: string;
  status: string;
  incomeType: string;
}

export interface LevelAnswers {
  [questionIndex: number]: number; // score 1-5
}

export interface GameState {
  step: 'welcome' | 'consent' | 'profile' | 'level' | 'reflection' | 'report';
  profile: PlayerProfile;
  consentGiven: boolean;
  currentLevel: number; // 0-6
  currentQuestion: number; // 0-6 for level 0, 0-2 for levels 1-6
  answers: { [level: number]: LevelAnswers };
  completedLevels: number[];
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
  | { type: 'START_LEVEL'; level: number }
  | { type: 'ANSWER_QUESTION'; level: number; question: number; score: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'COMPLETE_LEVEL'; level: number }
  | { type: 'SET_REFLECTION'; answer: string }
  | { type: 'SET_LANGUAGE'; lang: 'en' | 'ml' }
  | { type: 'SET_MUTE'; value: boolean }
  | { type: 'SET_CAMPAIGN'; campaignId: string | null }
  | { type: 'SET_CAMPAIGN_CODE'; code: string | null }
  | { type: 'RESET' };

const initialState: GameState = {
  step: 'welcome',
  profile: { name: '', age: '', gender: '', phone: '', country: 'India', state: '', district: '', status: '', incomeType: '' },
  consentGiven: false,
  currentLevel: 0,
  currentQuestion: 0,
  answers: {},
  completedLevels: [],
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
    case 'START_LEVEL': return { ...state, currentLevel: action.level, currentQuestion: 0, step: 'level' };
    case 'ANSWER_QUESTION': {
      const levelAnswers = { ...state.answers[action.level], [action.question]: action.score };
      return { ...state, answers: { ...state.answers, [action.level]: levelAnswers } };
    }
    case 'NEXT_QUESTION': return { ...state, currentQuestion: state.currentQuestion + 1 };
    case 'COMPLETE_LEVEL': {
      const newCompleted = [...new Set([...state.completedLevels, action.level])];
      // Auto-advance: if level < 6, start next level; if level === 6, go to reflection
      if (action.level < 6) {
        return {
          ...state,
          completedLevels: newCompleted,
          currentLevel: action.level + 1,
          currentQuestion: 0,
          step: 'level',
        };
      }
      return {
        ...state,
        completedLevels: newCompleted,
        step: 'reflection',
      };
    }
    case 'SET_REFLECTION': return { ...state, reflectionAnswer: action.answer };
    case 'SET_LANGUAGE': return { ...state, language: action.lang };
    case 'SET_MUTE': return { ...state, isMuted: action.value };
    case 'SET_CAMPAIGN': return { ...state, campaignId: action.campaignId };
    case 'SET_CAMPAIGN_CODE': return { ...state, campaignCode: action.code };
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
