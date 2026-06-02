import React, { useState, useEffect } from 'react';
import { Brain, Wind, Eye, Sparkles, ChevronRight, RefreshCw, ThumbsUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CopingToolboxProps {
  onSuggestPrompt: (prompt: string) => void;
}

const AFFIRMATIONS = [
  "My feelings are valid, and it's okay to feel this way.",
  "I am doing the best I can in this moment.",
  "This feeling is a wave; it will rise, reach its peak, and pass.",
  "I have gotten through challenging days before, and I can navigate this one too.",
  "In this moment, I am safe here. I can slow down and breathe.",
  "I am allowed to protect my peace and rest when I need to.",
  "My thoughts are just thoughts, they are not absolute facts.",
  "I am resilient, capable, and worthy of kindness and patience."
];

const COGNITIVE_DISTORTIONS = [
  { name: "Black-and-White Thinking", desc: "Seeing things in all-or-nothing terms (e.g., 'If I fail this exam, I'm a complete failure')." },
  { name: "Catastrophizing", desc: "Expecting the absolute worst outcome, even when it is highly unlikely." },
  { name: "Mind Reading", desc: "Assuming you know what others are thinking, usually imagining it's negative." },
  { name: "Emotional Reasoning", desc: "Believing that because you feel a negative emotion, it must reflect reality (e.g., 'I feel guilty, so I must have done something bad')." },
  { name: "Labeling", desc: "Assigning negative, global labels to yourself based on a single action (e.g., 'I made a mistake, so I am stupid')." }
];

export default function CopingToolbox({ onSuggestPrompt }: CopingToolboxProps) {
  const [activeTab, setActiveTab] = useState<'breathing' | 'cbt' | 'grounding' | 'affirmation'>('breathing');

  // Breathing pacer states
  const [breathState, setBreathState] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathCount, setBreathCount] = useState(0);

  // CBT thoughts record states
  const [cbtStep, setCbtStep] = useState(1);
  const [negativeThought, setNegativeThought] = useState('');
  const [distortionType, setDistortionType] = useState('');
  const [challengingEvidence, setChallengingEvidence] = useState('');
  const [balancedThought, setBalancedThought] = useState('');

  // 5-4-3-2-1 Grounding states
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingInputs, setGroundingInputs] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');

  // Affirmations states
  const [currentAffirmation, setCurrentAffirmation] = useState(AFFIRMATIONS[0]);

  // Breathing timer loop
  useEffect(() => {
    if (breathState === 'idle') return;

    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          if (breathState === 'inhale') {
            setBreathState('hold');
            return 4; // Hold for 4s
          } else if (breathState === 'hold') {
            setBreathState('exhale');
            return 4; // Exhale for 4s
          } else if (breathState === 'exhale') {
            setBreathState('inhale');
            setBreathCount(c => c + 1);
            return 4; // Inhale for 4s
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathState]);

  const startBreathing = () => {
    setBreathState('inhale');
    setBreathTimer(4);
    setBreathCount(0);
  };

  const stopBreathing = () => {
    setBreathState('idle');
  };

  const nextCbtStep = () => {
    if (cbtStep < 4) setCbtStep(cbtStep + 1);
  };

  const resetCbtForm = () => {
    setCbtStep(1);
    setNegativeThought('');
    setDistortionType('');
    setChallengingEvidence('');
    setBalancedThought('');
  };

  const submitCbtToChat = () => {
    const textToSend = `I completed the CBT Thought Record.
- Negative Thought: "${negativeThought}"
- Identified Distortion: ${distortionType}
- Counter-Evidence: "${challengingEvidence}"
- Restructured Balanced Thought: "${balancedThought}"

Can you help validate my balanced thought and discuss how I can practice this?`;
    onSuggestPrompt(textToSend);
  };

  // 5-4-3-2-1 Logic
  const groundingPrompts = [
    { count: 5, type: "things you can SEE right around you", placeholder: "e.g., A desk lamp, a green plant" },
    { count: 4, type: "things you can physically FEEL or touch", placeholder: "e.g., Soft sweater sleeve, textured keyboard" },
    { count: 3, type: "sounds you can HEAR in the distance", placeholder: "e.g., Humming of hum of AC, distant birds" },
    { count: 2, type: "things you can SMELL", placeholder: "e.g., Coffee aroma, fresh laundry" },
    { count: 1, type: "good thing about YOURSELF or a taste in your mouth", placeholder: "e.g., I am being patient with myself" }
  ];

  const handleGroundingNext = () => {
    if (!currentInput.trim()) return;
    const stepLabel = `Step ${5 - groundingStep}: Saw/felt/heard "${currentInput.trim()}"`;
    setGroundingInputs([...groundingInputs, stepLabel]);
    setCurrentInput('');
    if (groundingStep < 4) {
      setGroundingStep(groundingStep + 1);
    } else {
      setGroundingStep(5); // Completed state
    }
  };

  const submitGroundingToChat = () => {
    const textToSend = `I just finished the 5-4-3-2-1 Grounding exercise. Here's what I observed to ground myself:
${groundingInputs.map(item => `• ${item}`).join('\n')}

Thinking about these grounded me. Could we chat about staying present when anxiety spikes?`;
    onSuggestPrompt(textToSend);
  };

  const resetGrounding = () => {
    setGroundingStep(0);
    setGroundingInputs([]);
    setCurrentInput('');
  };

  const getRandomAffirmation = () => {
    let index = Math.floor(Math.random() * AFFIRMATIONS.length);
    while (AFFIRMATIONS[index] === currentAffirmation) {
      index = Math.floor(Math.random() * AFFIRMATIONS.length);
    }
    setCurrentAffirmation(AFFIRMATIONS[index]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Toolbox Tabs */}
      <div className="flex bg-slate-950 p-2 gap-1 border-b border-slate-800 shrink-0">
        <button
          id="btn-tab-breathing"
          onClick={() => setActiveTab('breathing')}
          className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition ${
            activeTab === 'breathing'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Wind className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Paced Breath</span>
          <span className="sm:hidden">Breath</span>
        </button>

        <button
          id="btn-tab-cbt"
          onClick={() => setActiveTab('cbt')}
          className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition ${
            activeTab === 'cbt'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Brain className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">CBT Thoughts</span>
          <span className="sm:hidden">CBT</span>
        </button>

        <button
          id="btn-tab-grounding"
          onClick={() => setActiveTab('grounding')}
          className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition ${
            activeTab === 'grounding'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Eye className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">5-4-3-2-1</span>
          <span className="sm:hidden">Ground</span>
        </button>

        <button
          id="btn-tab-affirmation"
          onClick={() => setActiveTab('affirmation')}
          className={`flex-1 py-2 px-3 text-xs md:text-sm font-medium rounded-lg flex items-center justify-center gap-1 transition ${
            activeTab === 'affirmation'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Affirmations</span>
          <span className="sm:hidden">Peace</span>
        </button>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 overflow-y-auto flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {activeTab === 'breathing' && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-6 py-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-emerald-300">DBT Paced Breathing</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Exhaling slowly activates your parasympathetic nervous system to decrease stress. Breathe with the visual expanding pulse.
                </p>
              </div>

              {/* Breathe Pulse Circle Animation */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Expand Background Glow */}
                <AnimatePresence>
                  {breathState === 'inhale' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.2 }}
                      animate={{ scale: 1.5, opacity: 0.4 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="absolute inset-0 bg-emerald-500/30 rounded-full filter blur-xl"
                    />
                  )}
                  {breathState === 'exhale' && (
                    <motion.div
                      initial={{ scale: 1.5, opacity: 0.4 }}
                      animate={{ scale: 0.8, opacity: 0.1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="absolute inset-0 bg-emerald-500/20 rounded-full filter blur-xl"
                    />
                  )}
                </AnimatePresence>

                {/* Main Orb Circle */}
                <motion.div
                  animate={{
                    scale: breathState === 'inhale' ? 1.4 : breathState === 'exhale' ? 0.95 : breathState === 'hold' ? 1.4 : 1.0,
                    backgroundColor: breathState === 'inhale' ? '#10b981' : breathState === 'exhale' ? '#34d399' : breathState === 'hold' ? '#059669' : '#047857'
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="w-28 h-28 rounded-full border border-emerald-400/30 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10 text-white z-10"
                >
                  <span className="text-xs font-mono tracking-wider opacity-80 uppercase">
                    {breathState === 'idle' ? 'Ready' : breathState}
                  </span>
                  <span className="text-xl font-bold mt-1">
                    {breathState === 'idle' ? '🧘' : `${breathTimer}s`}
                  </span>
                </motion.div>
              </div>

              {breathState !== 'idle' && (
                <div className="text-sm font-mono text-emerald-400/90">
                  Breath Turn Completed: {breathCount}
                </div>
              )}

              <div className="flex gap-3 justify-center w-full max-w-xs">
                {breathState === 'idle' ? (
                  <button
                    id="btn-start-breath"
                    onClick={startBreathing}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-sm font-semibold py-2.5 px-4 rounded-xl transition shadow-lg shadow-emerald-500/20"
                  >
                    Start Paced Breathing
                  </button>
                ) : (
                  <button
                    id="btn-stop-breath"
                    onClick={stopBreathing}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium py-2 px-4 rounded-xl transition border border-slate-700"
                  >
                    Pause Exercise
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'cbt' && (
            <motion.div
              key="cbt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col justify-between h-full space-y-4"
            >
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Brain className="w-5 h-5 text-indigo-400" /> CBT Thought Restructures
                  </h3>
                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md">Step {cbtStep}/4</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Reframing irrational beliefs using Cognitive Behavioral Therapy principles reduces physiological and emotional distress.
                </p>
              </div>

              <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800/60 flex flex-col justify-center min-h-[160px]">
                {cbtStep === 1 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-slate-300">
                      Step 1: Write down the negative or overwhelming thought you are experiencing.
                    </label>
                    <textarea
                      id="cbt-input-thought"
                      value={negativeThought}
                      onChange={(e) => setNegativeThought(e.target.value)}
                      placeholder="e.g., I'm going to fail my interview and everyone will think I am incompetent."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none h-20"
                    />
                  </div>
                )}

                {cbtStep === 2 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Step 2: What cognitive distortion pattern might this automatic thought fall under?
                    </label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {COGNITIVE_DISTORTIONS.map((cd) => (
                        <button
                          key={cd.name}
                          onClick={() => setDistortionType(cd.name)}
                          className={`w-full text-left p-2 rounded-lg text-xs transition border ${
                            distortionType === cd.name
                              ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-200'
                              : 'bg-slate-900 border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-slate-300'
                          }`}
                        >
                          <span className="font-semibold block text-indigo-300">{cd.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{cd.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {cbtStep === 3 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-slate-300">
                      Step 3: Write down evidence that challenges this thought. Is it actually 100% true or is there counter-evidence?
                    </label>
                    <textarea
                      id="cbt-input-evidence"
                      value={challengingEvidence}
                      onChange={(e) => setChallengingEvidence(e.target.value)}
                      placeholder="e.g., I have prepared thoroughly, I have passed complex interviews before, and one mistake doesn't define my worth."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none h-20"
                    />
                  </div>
                )}

                {cbtStep === 4 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-slate-300">
                      Step 4: Now, write a restructured, realistic, and self-compassionate balanced thought.
                    </label>
                    <textarea
                      id="cbt-input-balanced"
                      value={balancedThought}
                      onChange={(e) => setBalancedThought(e.target.value)}
                      placeholder="e.g., I might feel nervous or make errors, but I have prepared well, and this is just an opportunity. I will learn from it matter what happens."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none h-20"
                    />
                  </div>
                )}
              </div>

              {/* CBT Footer buttons */}
              <div className="flex gap-2 justify-end pt-2">
                {cbtStep > 1 && (
                  <button
                    onClick={() => setCbtStep(cbtStep - 1)}
                    className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-705 text-slate-300 rounded-lg transition"
                  >
                    Back
                  </button>
                )}
                {cbtStep < 4 ? (
                  <button
                    disabled={(cbtStep === 1 && !negativeThought.trim()) || (cbtStep === 2 && !distortionType) || (cbtStep === 3 && !challengingEvidence.trim())}
                    onClick={nextCbtStep}
                    className="px-3.5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-45 disabled:pointer-events-none text-white rounded-lg transition"
                  >
                    Next Step
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={resetCbtForm}
                      className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                    <button
                      onClick={submitCbtToChat}
                      disabled={!balancedThought.trim()}
                      className="px-3.5 py-1.5 text-xs bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-semibold rounded-lg transition flex items-center gap-1"
                    >
                      Process with AI <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'grounding' && (
            <motion.div
              key="grounding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col justify-between h-full space-y-4"
            >
              <div>
                <h3 className="text-base font-semibold text-amber-300 flex items-center gap-1.5">
                  <Eye className="w-5 h-5 text-amber-400" /> 5-4-3-2-1 Sensory Grounding
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Focusing on your immediate surroundings disrupts obsessive stress loops and anxiety by bringing you into the present moment.
                </p>
              </div>

              <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800/60 flex flex-col justify-center min-h-[160px]">
                {groundingStep < 5 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold font-mono">
                        {groundingPrompts[groundingStep].count}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        Acknowledge {groundingPrompts[groundingStep].count} {groundingPrompts[groundingStep].type}
                      </span>
                    </div>

                    <input
                      id="grounding-input"
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGroundingNext()}
                      placeholder={groundingPrompts[groundingStep].placeholder}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />

                    <p className="text-[10px] text-slate-500 italic">
                      Type one or count them mentally. Click Next to log your observation.
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-3 py-2">
                    <div className="w-10 h-10 bg-amber-500/20 text-amber-300 rounded-full flex items-center justify-center mx-auto">
                      <ThumbsUp className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-amber-200">Excellent Work Grounding</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      You have walked your senses through all 5 steps! You are safe and anchored here in the present.
                    </p>
                  </div>
                )}
              </div>

              {/* Grounding Footer Buttons */}
              <div className="flex gap-2 justify-end pt-2">
                {groundingStep < 5 ? (
                  <div className="flex gap-2">
                    <button
                      onClick={resetGrounding}
                      className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleGroundingNext}
                      disabled={!currentInput.trim()}
                      className="px-3.5 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Next Step
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full justify-between items-center">
                    <button
                      onClick={resetGrounding}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Restart
                    </button>
                    <button
                      onClick={submitGroundingToChat}
                      className="px-3.5 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition flex items-center gap-1"
                    >
                      Share observations with MindCare
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'affirmation' && (
            <motion.div
              key="affirmation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col justify-between h-full space-y-5"
            >
              <div>
                <h3 className="text-base font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-cyan-400" /> Grounding Affirmations
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Internalizing positive core beliefs helps reshape thinking neural networks, bringing comfort when stress takes over.
                </p>
              </div>

              <div className="flex-1 bg-slate-950 p-6 rounded-xl border border-slate-800/60 flex flex-col justify-center items-center text-center">
                <motion.div
                  key={currentAffirmation}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm md:text-base text-cyan-100 font-medium italic select-none"
                >
                  "{currentAffirmation}"
                </motion.div>
              </div>

              <div className="flex gap-2 w-full justify-between items-center pt-2">
                <button
                  onClick={() => onSuggestPrompt(`Let's talk about the affirmation: "${currentAffirmation}"`)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  Talk about this affirmation
                </button>
                <button
                  onClick={getRandomAffirmation}
                  className="px-3.5 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Another One
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
