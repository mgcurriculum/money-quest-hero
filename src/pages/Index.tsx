import { useGame } from '@/context/GameContext';
import { GameProvider } from '@/context/GameContext';
import WelcomeScreen from '@/components/game/WelcomeScreen';
import ConsentScreen from '@/components/game/ConsentScreen';
import ProfileScreen from '@/components/game/ProfileScreen';
import LevelPlay from '@/components/game/LevelPlay';
import RealityCheckPlay from '@/components/game/RealityCheckPlay';
import AdaptivePlay from '@/components/game/AdaptivePlay';
import ReflectionScreen from '@/components/game/ReflectionScreen';
import ReportScreen from '@/components/game/ReportScreen';
import GlobalProgressBar from '@/components/game/GlobalProgressBar';

const GameFlow = () => {
  const { state } = useGame();

  switch (state.step) {
    case 'welcome': return <WelcomeScreen />;
    case 'consent': return <ConsentScreen />;
    case 'profile': return <ProfileScreen />;
    case 'level':
      if (state.assessmentMode === 'adaptive') {
        return <AdaptivePlay />;
      }
      return state.currentLevel === 0 ? <RealityCheckPlay /> : <LevelPlay />;
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
