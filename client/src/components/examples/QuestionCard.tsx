import QuestionCard from '../QuestionCard';

export default function QuestionCardExample() {
  return (
    <QuestionCard 
      question="What is the capital of France?" 
      roundNumber={3} 
      totalRounds={10}
      isVisible={true}
    />
  );
}
