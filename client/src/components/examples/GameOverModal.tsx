import { useState } from 'react';
import GameOverModal from '../GameOverModal';
import { Button } from '@/components/ui/button';

export default function GameOverModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex gap-4">
      <Button onClick={() => setIsOpen(true)}>Show Victory Modal</Button>
      <GameOverModal
        isOpen={isOpen}
        isVictory={true}
        finalScore={1250}
        correctAnswers={9}
        totalQuestions={10}
        onRestart={() => {
          console.log('Restarting game...');
          setIsOpen(false);
        }}
      />
    </div>
  );
}
