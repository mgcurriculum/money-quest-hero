import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useGame, useGameSafe, GameState } from '@/context/GameContext';
import { GameProvider } from '@/context/GameContext';
import WelcomeScreen from '@/components/game/WelcomeScreen';
import ConsentScreen from '@/components/game/ConsentScreen';
import PhoneVerificationScreen from '@/components/game/PhoneVerificationScreen';
import ProfileScreen from '@/components/game/ProfileScreen';
import ExistingUserScreen from '@/components/game/ExistingUserScreen';
import QuestionPlay from '@/components/game/QuestionPlay';
import ReflectionScreen from '@/components/game/ReflectionScreen';
import ReportScreen from '@/components/game/ReportScreen';
import GlobalProgressBar from '@/components/game/GlobalProgressBar';
import { getAgeGroup } from '@/components/game/ProfileScreen';

const STEP_ORDER: GameState['step'][] = [
  'welcome', 'consent', 'phone-verify', 'profile', 'existing-user', 'quiz', 'reflection', 'report',
];

function getPreviousStep(currentStep: GameState['step']): GameState['step'] | null {
  switch (currentStep) {
    case 'consent': return 'welcome';
    case 'phone-verify': return 'consent';
    case 'profile': return 'phone-verify';
    case 'existing-user': return 'phone-verify';
    case 'quiz': return 'profile';
    case 'reflection': return 'quiz';
    case 'report': return 'reflection';
    default: return null;
  }
}

const GameFlow = () => {
  const { state, dispatch } = useGame();
  const location = useLocation();
  const isPopstateRef = useRef(false);
  const prevStepRef = useRef(state.step);

  useEffect(() => {
    const routeState = location.state as any;
    if (routeState?.retake && routeState?.profile) {
      const p = routeState.profile;
      const ageGroup = getAgeGroup(p.age) || '';
      dispatch({
        type: 'SET_PROFILE',
        profile: {
          name: p.name || '',
          age: p.age || 0,
          ageGroup,
          gender: p.gender || '',
          phone: p.phone || '',
          country: p.country || 'India',
          state: '',
          district: '',
          role: '',
          roleLabel: '',
          profileCode: '',
        },
      });
      dispatch({ type: 'SET_PHONE_VERIFIED', verified: true });
      dispatch({ type: 'SET_STEP', step: 'profile' });
      window.history.replaceState({}, document.title);
    }
  }, []);

  // Push browser history when step changes (forward navigation)
  useEffect(() => {
    if (isPopstateRef.current) {
      isPopstateRef.current = false;
      prevStepRef.current = state.step;
      return;
    }
    if (state.step !== prevStepRef.current && state.step !== 'welcome') {
      window.history.pushState({ gameStep: state.step }, '');
    }
    prevStepRef.current = state.step;
  }, [state.step]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      isPopstateRef.current = true;
      const prev = getPreviousStep(prevStepRef.current);
      if (prev) {
        dispatch({ type: 'SET_STEP', step: prev });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [dispatch]);

  switch (state.step) {
    case 'welcome': return <WelcomeScreen />;
    case 'consent': return <ConsentScreen />;
    case 'phone-verify': return <PhoneVerificationScreen />;
    case 'profile': return <ProfileScreen />;
    case 'existing-user': return <ExistingUserScreen />;
    case 'quiz': return <QuestionPlay />;
    case 'reflection': return <ReflectionScreen />;
    case 'report': return <ReportScreen />;
    default: return <WelcomeScreen />;
  }
};

const Index = () => (
  <GameProvider>
    <GlobalProgressBar />
    <GameFlow />
  </GameProvider>
);

export default Index;
