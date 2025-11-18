import { useState } from 'react';
import Timer from '../Timer';
import { Button } from '@/components/ui/button';

export default function TimerExample() {
  const [reset, setReset] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="space-y-4 max-w-md">
      <Timer 
        duration={7} 
        onTimeout={() => console.log('Time is up!')} 
        isPaused={isPaused}
        reset={reset}
      />
      <div className="flex gap-2">
        <Button onClick={() => setReset(!reset)}>Reset</Button>
        <Button onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
      </div>
    </div>
  );
}
