export type EmotionType = 'sad' | 'stressed' | 'anxious' | 'angry' | 'happy' | 'lonely' | 'neutral';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  emotion?: EmotionType;
  isCrisis?: boolean;
}

export interface ConversationSession {
  id: string;
  messages: Message[];
  startedAt: string;
  detectedEmotions: { [key in EmotionType]: number };
}

export interface CopingExercise {
  id: string;
  title: string;
  subtitle: string;
  category: 'CBT' | 'DBT' | 'Grounding' | 'Mindfulness';
  description: string;
  steps: string[];
}
