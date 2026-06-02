import React from 'react';
import { Heart, Activity, Compass, Flame } from 'lucide-react';
import { EmotionType } from '../types';

interface MoodStatsProps {
  emotionCounts: { [key in EmotionType]: number };
}

const EMOTION_LABELS: Record<EmotionType, { label: string; color: string; desc: string; emoji: string }> = {
  sad: { label: 'Sad', color: 'bg-indigo-500', desc: 'Feeling blue or heavy. Validating and processing helps.', emoji: '💙' },
  stressed: { label: 'Stressed', color: 'bg-emerald-500', desc: 'Overwhelmed with pressure. Try slowing down.', emoji: '🌱' },
  anxious: { label: 'Anxious', color: 'bg-amber-500', desc: 'Intense fluttery thoughts. Focus on immediate safety.', emoji: '⚡' },
  angry: { label: 'Angry', color: 'bg-rose-500', desc: 'Natural frustration. Process the underlying boundary.', emoji: '🔥' },
  happy: { label: 'Happy', color: 'bg-green-500', desc: 'Bright emotional sun. Celebrate positive moments!', emoji: '☀️' },
  lonely: { label: 'Lonely', color: 'bg-cyan-500', desc: 'Desire for deep connection. I am here to share space.', emoji: '🪐' },
  neutral: { label: 'Calm', color: 'bg-slate-400', desc: 'Balanced, stable baseline. A peaceful harbor.', emoji: '🧘' }
};

export default function MoodStats({ emotionCounts }: MoodStatsProps) {
  const totalDetections = Object.values(emotionCounts).reduce((a, b) => a + b, 0);

  // Find dominant emotion
  let dominantEmotion: EmotionType = 'neutral';
  let maxCount = 0;
  Object.entries(emotionCounts).forEach(([emotion, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantEmotion = emotion as EmotionType;
    }
  });

  const percent = (count: number) => {
    if (totalDetections === 0) return 0;
    return Math.round((count / totalDetections) * 100);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col space-y-5 h-full">
      <div>
        <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <Activity className="w-4.5 h-4.5 text-indigo-400" /> Active Session State
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          MindCare continuously listens to your emotions during chat to craft more attuned responses.
        </p>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3.5 flex-1">
        {Object.entries(EMOTION_LABELS).map(([key, item]) => {
          const count = emotionCounts[key as EmotionType] || 0;
          const pct = percent(count);
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center gap-1">
                  <span className="text-sm select-none">{item.emoji}</span>
                  {item.label}
                </span>
                <span className="text-slate-400 font-mono">{pct}% ({count})</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/40">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dominant Empathy Message */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-830/60 flex items-start gap-3">
        <div className="mt-0.5 p-1.5 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <Heart className="w-4 h-4 text-rose-400/90" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-slate-200">
            Detected: {EMOTION_LABELS[dominantEmotion].label} {EMOTION_LABELS[dominantEmotion].emoji}
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {EMOTION_LABELS[dominantEmotion].desc}
          </p>
        </div>
      </div>
    </div>
  );
}
