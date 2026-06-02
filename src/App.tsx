import React, { useState, useEffect } from 'react';
import { Eye, ShieldCheck, HeartPulse, Brain, AlertCircle, RefreshCw, Sparkles, Smile } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import CopingToolbox from './components/CopingToolbox';
import MoodStats from './components/MoodStats';
import { Message, EmotionType } from './types';

const INITIAL_WELCOME_MESSAGE: Message = {
  id: 'mindcare-welcome',
  role: 'assistant',
  text: "Hello there. I'm MindCare AI, your warm, supportive digital companion here to hold a compassionate, safe space for you. \n\nWhether you are feeling anxious, stressed, lonely, or just need to reflect out loud, we can navigate these thoughts together. I use gentle CBT (Cognitive Behavioral Therapy) and DBT (Dialectical Behavioral Therapy) tools to help you find balance. \n\nRemember, while I'm a helpful support tool, I'm an AI and not a licensed human therapist. If you're struggling, talking with clinical professionals can make a world of difference. \n\nHow is your heart feeling right in this moment?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  emotion: 'neutral'
};

const INITIAL_EMOTION_COUNTS: Record<EmotionType, number> = {
  sad: 0,
  stressed: 0,
  anxious: 0,
  angry: 0,
  happy: 0,
  lonely: 0,
  neutral: 1 // Start with the welcome neutral trigger
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [emotionCounts, setEmotionCounts] = useState<Record<EmotionType, number>>(INITIAL_EMOTION_COUNTS);
  const [isLoading, setIsLoading] = useState(false);

  // Load session from localStorage on startup
  useEffect(() => {
    try {
      const cachedMessages = localStorage.getItem('mindcare_messages');
      const cachedCounts = localStorage.getItem('mindcare_emotions');
      
      if (cachedMessages) {
        setMessages(JSON.parse(cachedMessages));
      } else {
        setMessages([INITIAL_WELCOME_MESSAGE]);
      }

      if (cachedCounts) {
        setEmotionCounts(JSON.parse(cachedCounts));
      } else {
        setEmotionCounts(INITIAL_EMOTION_COUNTS);
      }
    } catch (e) {
      console.error('Error reading localStorage cache:', e);
      setMessages([INITIAL_WELCOME_MESSAGE]);
      setEmotionCounts(INITIAL_EMOTION_COUNTS);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('mindcare_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('mindcare_emotions', JSON.stringify(emotionCounts));
  }, [emotionCounts]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessagesList = [...messages, userMsg];
    setMessages(newMessagesList);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          // Extract only the fields required by server history to save token bandwidth
          history: newMessagesList.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP diagnostics error: ${response.status}`);
      }

      const data = await response.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: data.emotion as EmotionType,
        isCrisis: data.isCrisis
      };

      setMessages(prev => [...prev, aiMsg]);

      // Count the emotion detected
      if (data.emotion) {
        setEmotionCounts(prev => {
          const currentCount = prev[data.emotion as EmotionType] || 0;
          return {
            ...prev,
            [data.emotion as EmotionType]: currentCount + 1
          };
        });
      }

    } catch (err: any) {
      console.error('Server query exception:', err);
      // Compassionate error message
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: "I am right here, but I encountered a slight connection issue. Emotional processing takes a lot of care, and sometimes our channels need a brief pause. Let's take a slow breath together. Would you mind telling me how you're feeling once more?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: 'neutral'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = () => {
    if (window.confirm("Would you like to reset your counseling chat and clear recorded emotion counts? This cannot be undone.")) {
      setMessages([INITIAL_WELCOME_MESSAGE]);
      setEmotionCounts(INITIAL_EMOTION_COUNTS);
      localStorage.removeItem('mindcare_messages');
      localStorage.removeItem('mindcare_emotions');
    }
  };

  const handleSuggestPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none selection:bg-indigo-500/35">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-[15%] w-80 h-80 bg-indigo-500/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-40 left-[10%] w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Main Container Wrapper */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col justify-start relative z-10 space-y-6">
        
        {/* Upper Navigation Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/60 pb-5 shrink-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-indigo-200 to-slate-200 select-text">
              MindCare AI
            </h1>
            <p className="text-xs text-slate-400 select-text font-medium">
              Your therapeutic sanctuary — Warm AI journaling, CBT Reframing, & DBT Exercises
            </p>
          </div>
          
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium font-mono px-2.5 py-1 rounded-lg flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" /> HIPAA and Privacy Guarded
            </span>
            <span className="text-[11px] bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 font-medium font-mono px-2.5 py-1 rounded-lg flex items-center gap-1.5 shrink-0">
              <Brain className="w-3.5 h-3.5 animate-pulse" /> CBT/DBT Attuned
            </span>
          </div>
        </header>

        {/* Responsive Flex / Grid Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          
          {/* Column A: Primary Chat Dialog View (Takes 7 columns on desktops for comfortable typing) */}
          <section className="lg:col-span-7 xl:col-span-8 flex flex-col h-full">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onClearSession={handleClearSession}
              onSelectPrompt={handleSuggestPrompt}
            />
          </section>

          {/* Column B: Therapeutic Side Deck (Takes 5 columns) */}
          <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            
            {/* Widget B1: Interactive Coping Toolbox */}
            <CopingToolbox onSuggestPrompt={handleSuggestPrompt} />

            {/* Widget B2: Real-time Empathy Stats */}
            <MoodStats emotionCounts={emotionCounts} />
            
          </aside>

        </div>
      </div>

      {/* Footer boundary disclaimer */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950/80 mt-auto shrink-0 select-text">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[11px] text-slate-500 max-w-2xl leading-relaxed">
            Mindcare AI is a compassionate coaching helper designed to support reflection and provide established CBT/DBT frameworks. This digital toolkit does not constitute personal therapy, psychiatric care, clinical counseling, or diagnostics. If you are experiencing distress, reach out to trusted support circles.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://988lifeline.org"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 transition underline whitespace-nowrap"
            >
              Emergency 988 Helpline
            </a>
            <span className="text-slate-700 font-mono">|</span>
            <span className="text-[11px] text-slate-500 whitespace-nowrap">
              © 2026 MindCare AI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
