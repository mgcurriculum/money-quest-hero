import { useGame } from '@/context/GameContext';
import { GameProvider } from '@/context/GameContext';
import WelcomeScreen from '@/components/game/WelcomeScreen';
import ConsentScreen from '@/components/game/ConsentScreen';
import ProfileScreen from '@/components/game/ProfileScreen';

import QuestionPlay from '@/components/game/QuestionPlay';
import ReflectionScreen from '@/components/game/ReflectionScreen';
import ReportScreen from '@/components/game/ReportScreen';
import GlobalProgressBar from '@/components/game/GlobalProgressBar';

const GameFlow = () => {
  const { state } = useGame();

  switch (state.step) {
    case 'welcome': return <WelcomeScreen />;
    case 'consent': return <ConsentScreen />;
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
