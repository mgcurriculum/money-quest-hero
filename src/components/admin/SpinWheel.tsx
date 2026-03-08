import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Participant {
  id: string;
  player_name: string;
  fq_score: number | null;
}

interface SpinWheelProps {
  participants: Participant[];
  onComplete: (winner: Participant) => void;
  existingWinner: Participant | null;
}

const COLORS = [
  'hsl(260, 58%, 26%)', 'hsl(200, 92%, 64%)', 'hsl(145, 70%, 50%)',
  'hsl(38, 95%, 55%)', 'hsl(0, 72%, 55%)', 'hsl(263, 58%, 50%)',
  'hsl(180, 60%, 45%)', 'hsl(320, 60%, 50%)',
];

const SpinWheel = ({ participants, onComplete, existingWinner }: SpinWheelProps) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState<Participant | null>(existingWinner);

  const spin = () => {
    if (spinning || participants.length === 0) return;
    setSpinning(true);
    setSelected(null);

    const winnerIndex = Math.floor(Math.random() * participants.length);
    const segmentAngle = 360 / participants.length;
    const targetAngle = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    const totalRotation = rotation + 360 * 5 + targetAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      setSelected(participants[winnerIndex]);
      setSpinning(false);
      onComplete(participants[winnerIndex]);
    }, 4000);
  };

  const displayParticipants = participants.slice(0, 20); // max 20 on wheel
  const segmentAngle = 360 / displayParticipants.length;

  return (
    <div className="flex flex-col items-center gap-6">
      {selected && !spinning && (
        <div className="text-center bg-primary/10 rounded-xl p-4 w-full max-w-sm">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-bold text-foreground text-lg">{selected.player_name}</p>
          <p className="text-sm text-muted-foreground">Winner! Score: {selected.fq_score || 'N/A'}</p>
        </div>
      )}

      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary" />
        </div>

        {/* Wheel */}
        <motion.div
          className="w-72 h-72 rounded-full relative overflow-hidden border-4 border-primary/30"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {displayParticipants.map((p, i) => {
              const startAngle = i * segmentAngle;
              const endAngle = startAngle + segmentAngle;
              const startRad = (startAngle - 90) * Math.PI / 180;
              const endRad = (endAngle - 90) * Math.PI / 180;
              const x1 = 100 + 100 * Math.cos(startRad);
              const y1 = 100 + 100 * Math.sin(startRad);
              const x2 = 100 + 100 * Math.cos(endRad);
              const y2 = 100 + 100 * Math.sin(endRad);
              const largeArc = segmentAngle > 180 ? 1 : 0;
              const midRad = ((startAngle + endAngle) / 2 - 90) * Math.PI / 180;
              const textX = 100 + 60 * Math.cos(midRad);
              const textY = 100 + 60 * Math.sin(midRad);
              const textRotation = (startAngle + endAngle) / 2;

              return (
                <g key={p.id}>
                  <path
                    d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={COLORS[i % COLORS.length]}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize={displayParticipants.length > 10 ? "4" : "6"}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  >
                    {p.player_name.length > 8 ? p.player_name.substring(0, 8) + '..' : p.player_name}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>

      <Button
        onClick={spin}
        disabled={spinning || participants.length === 0}
        size="lg"
        className="px-8"
      >
        {spinning ? 'Spinning...' : existingWinner ? 'Spin Again' : '🎡 Spin the Wheel'}
      </Button>

      {participants.length > 20 && (
        <p className="text-xs text-muted-foreground">Showing first 20 of {participants.length} participants on wheel. All are eligible.</p>
      )}
    </div>
  );
};

export default SpinWheel;
