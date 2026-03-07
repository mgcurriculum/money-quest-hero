import { useGame } from '@/context/GameContext';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface MuteButtonProps {
  isPlaying?: boolean;
  isLoading?: boolean;
  className?: string;
}

const MuteButton = ({ isPlaying = false, isLoading = false, className = '' }: MuteButtonProps) => {
  const { state, dispatch } = useGame();

  return (
    <button
      onClick={() => dispatch({ type: 'SET_MUTE', value: !state.isMuted })}
      className={`glass-card rounded-full p-2.5 transition-colors ${state.isMuted ? 'text-game-muted' : 'text-game-gold'} ${className}`}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : state.isMuted ? (
        <VolumeX size={18} />
      ) : (
        <Volume2 size={18} className={isPlaying ? 'animate-pulse' : ''} />
      )}
    </button>
  );
};

export default MuteButton;
