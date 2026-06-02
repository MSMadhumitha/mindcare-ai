import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Smile, RefreshCw, AlertTriangle, ShieldCheck, HeartPulse, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, EmotionType } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onClearSession: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  { text: "I feel lonely & isolated lately", label: "Lonely" },
  { text: "I'm stressed about exams & pressure", label: "Exam Stress" },
  { text: "Help me identify a cognitive distortion", label: "Identify Distortion" },
  { text: "Let's do a quick DBT breathing break", label: "Calming Breath" }
];

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  onClearSession,
  onSelectPrompt
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Check if session contains any crisis flag
  const activeCrisisMessageCount = messages.filter(m => m.isCrisis).length;
  const isCrisisTriggered = activeCrisisMessageCount > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[650px] overflow-hidden shadow-2xl relative">
      {/* Upper Brand Header */}
      <div className="flex justify-between items-center bg-slate-950 px-5 py-3.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-sm">
            M
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              MindCare AI <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-medium">Assistant</span>
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-medium">Empathetic Companion</span>
            </div>
          </div>
        </div>

        <button
          id="btn-clear-chat"
          onClick={onClearSession}
          className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-indigo-950/40 px-5 py-2 border-b border-indigo-900/30 flex items-center gap-2 text-[11px] text-indigo-300">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
        <span>MindCare AI provides CBT & DBT coping tools. This tool does not diagnose and shouldn't replace real mental health therapy.</span>
      </div>

      {/* Extreme Distress / Crisis Safety Card */}
      {isCrisisTriggered && (
        <div className="bg-rose-950/80 border-b border-rose-900/60 p-4 shrink-0 z-20">
          <div className="flex gap-3 items-start max-w-3xl mx-auto">
            <HeartPulse className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wide">Emergency & Crisis Helplines</h4>
              <p className="text-xs text-rose-300/90 leading-relaxed">
                If you are going through an intense emotional crisis or have thoughts of harming yourself, please connect with a real clinical professional immediately. You are valuable, and you are not alone.
              </p>
              <div className="flex flex-wrap gap-2 pt-1.5">
                <span className="bg-rose-500/20 border border-rose-500/50 text-rose-200 rounded-lg text-[11px] font-semibold font-mono px-3 py-1">
                  📞 National Hotline: Call 988 (US/Canada)
                </span>
                <span className="bg-rose-500/20 border border-rose-500/50 text-rose-200 rounded-lg text-[11px] font-semibold font-mono px-3 py-1">
                  💬 Crisis Text: Text HOME to 741741
                </span>
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 rounded-lg text-[11px] font-semibold px-3 py-1 transition flex items-center gap-1"
                >
                  🌐 Find A Helpline International
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversational Screen */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/20 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-5">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <Smile className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-100">Welcome to MindCare AI</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                I am here to companion you through stressful and difficult periods. We can share a calm dialogue, or you can use the Coping Toolbox on the side at any point.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-indigo-300 bg-indigo-500/15 border border-indigo-500/20 text-[11px] font-bold select-none">
                    M
                  </div>
                )}

                {/* Message Bubble */}
                <div className="space-y-1.5 max-w-[85%] md:max-w-[75%]">
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed select-text ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Emotion / Timestamp Tagging */}
                  {!isUser && msg.emotion && (
                    <div className="flex items-center gap-1 my-0.5">
                      <span className="text-[10px] text-slate-500">MindCare attuned to:</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${
                        msg.emotion === 'happy' ? 'bg-green-500/15 text-green-300' :
                        msg.emotion === 'sad' ? 'bg-indigo-500/15 text-indigo-300' :
                        msg.emotion === 'anxious' ? 'bg-amber-500/15 text-amber-300' :
                        msg.emotion === 'stressed' ? 'bg-emerald-500/15 text-emerald-300' :
                        msg.emotion === 'angry' ? 'bg-rose-500/15 text-rose-300' :
                        msg.emotion === 'lonely' ? 'bg-cyan-500/15 text-cyan-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {msg.emotion === 'neutral' ? 'Calm/Neutral' : msg.emotion}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-indigo-100 bg-indigo-600 border border-indigo-500 text-xs shadow-md select-none">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Typing placeholder indicator */}
        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-[70%] text-slate-400">
            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-indigo-300 bg-indigo-500/15 border border-indigo-500/20 text-[11px] font-bold">
              M
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts on Empty list */}
      {messages.length <= 1 && (
        <div className="px-5 shrink-0 bg-slate-900/40 py-2 border-t border-slate-800/50">
          <p className="text-[10px] text-slate-500 mb-2 font-medium tracking-wide uppercase">Suggested prompts:</p>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt.label}
                onClick={() => onSelectPrompt(prompt.text)}
                className="text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-xs transition duration-200 text-slate-400 hover:text-slate-200 font-medium truncate flex justify-between items-center"
              >
                <span>{prompt.text}</span>
                <Sparkles className="w-3 h-3 text-indigo-400 shrink-0 ml-1.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Input Panel */}
      <form
        id="chat-input-form"
        onSubmit={handleSend}
        className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 flex gap-2.5"
      >
        <input
          id="chat-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          placeholder="Share your thoughts honestly... MindCare is listening"
          className="flex-1 bg-slate-900 focus:bg-slate-950 text-slate-100 text-xs md:text-sm border border-slate-800 focus:border-indigo-500/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition pr-10 disabled:opacity-50"
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:opacity-40 disabled:text-slate-500 text-white p-3 rounded-xl transition font-medium text-xs shadow-lg shadow-indigo-600/15 flex items-center justify-center shrink-0 active:scale-95 duration-100 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
