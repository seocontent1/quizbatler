import { useState } from 'react';
import AnswerButton from '../AnswerButton';

export default function AnswerButtonExample() {
  const [state, setState] = useState<"default" | "selected" | "correct" | "incorrect">("default");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
      <AnswerButton 
        text="Paris" 
        onClick={() => setState("correct")} 
        state={state}
        index={0}
      />
      <AnswerButton 
        text="London" 
        onClick={() => console.log('Answer clicked')} 
        state="default"
        index={1}
      />
      <AnswerButton 
        text="Berlin" 
        onClick={() => console.log('Answer clicked')} 
        state="default"
        index={2}
      />
      <AnswerButton 
        text="Madrid" 
        onClick={() => console.log('Answer clicked')} 
        state="default"
        index={3}
      />
    </div>
  );
}
