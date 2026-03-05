import { useGame } from '@/context/GameContext';
import { GameProvider } from '@/context/GameContext';
import WelcomeScreen from '@/components/game/WelcomeScreen';
import ConsentScreen from '@/components/game/ConsentScreen';
import ProfileScreen from '@/components/game/ProfileScreen';
import JourneyMap from '@/components/game/JourneyMap';
import LevelPlay from '@/components/game/LevelPlay';
import ReflectionScreen from '@/components/game/ReflectionScreen';
import ReportScreen from '@/components/game/ReportScreen';

const GameFlow = () => {
  const { state } = useGame();

  switch (state.step) {
    case 'welcome': return <WelcomeScreen />;
    case 'consent': return <ConsentScreen />;
    case 'profile': return <ProfileScreen />;
    case 'journey': return <JourneyMap />;
    case 'level': return <LevelPlay />;
    case 'reflection': return <ReflectionScreen />;
    case 'report': return <ReportScreen />;
    default: return <WelcomeScreen />;
  }
};

const Index = () => (
  <GameProvider>
    <GameFlow />
  </GameProvider>
);

export default Index;
