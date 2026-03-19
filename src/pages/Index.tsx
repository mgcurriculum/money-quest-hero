import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGame, useGameSafe } from '@/context/GameContext';
import { GameProvider } from '@/context/GameContext';
import WelcomeScreen from '@/components/game/WelcomeScreen';
import ConsentScreen from '@/components/game/ConsentScreen';
import ProfileScreen from '@/components/game/ProfileScreen';

import QuestionPlay from '@/components/game/QuestionPlay';
import ReflectionScreen from '@/components/game/ReflectionScreen';
import ReportScreen from '@/components/game/ReportScreen';
import GlobalProgressBar from '@/components/game/GlobalProgressBar';
import { getAgeGroup } from '@/components/game/ProfileScreen';

const GameFlow = () => {
  const { state, dispatch } = useGame();
  const location = useLocation();

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
      // Clear location state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, []);

  switch (state.step) {
    case 'welcome': return <WelcomeScreen />;
    case 'consent': return <ConsentScreen />;
    case 'phone-verify': return <PhoneVerificationScreen />;
    case 'profile': return <ProfileScreen />;
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
