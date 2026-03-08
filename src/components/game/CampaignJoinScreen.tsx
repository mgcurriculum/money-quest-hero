import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import finquoLogo from '@/assets/finquo-logo-white.png';

interface CampaignJoinScreenProps {
  campaign: { name: string };
  existingSession: { player_name: string; fq_score: number | null; band_level: string | null };
  onJoinExisting: () => void;
  onRetake: () => void;
}

const CampaignJoinScreen = ({ campaign, existingSession, onJoinExisting, onRetake }: CampaignJoinScreenProps) => {
  return (
    <div className="min-h-screen game-gradient flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-6">
          <img src={finquoLogo} alt="FinQuo Versity" className="w-20 h-auto mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-game-text mb-1">
            Welcome to <span className="gold-text">{campaign.name}</span>
          </h2>
          <p className="text-game-muted font-body text-sm">
            We found your previous evaluation!
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 mb-5 text-center">
          <p className="text-game-muted text-xs font-body mb-2">Your Previous Score</p>
          <p className="text-4xl font-display font-bold gold-text">{existingSession.fq_score || 'N/A'}</p>
          <p className="text-game-muted text-sm mt-1">{existingSession.band_level || ''}</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onJoinExisting}
            className="w-full py-6 text-base gold-gradient text-white font-display font-semibold rounded-2xl hover:scale-105 active:scale-95 transition-transform"
          >
            ✅ Join with Existing Evaluation
          </Button>
          <Button
            onClick={onRetake}
            variant="outline"
            className="w-full py-6 text-base border-game-muted/30 text-game-text font-display font-semibold rounded-2xl hover:scale-105 active:scale-95 transition-transform bg-transparent"
          >
            🔄 Retake Test & Join
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CampaignJoinScreen;
