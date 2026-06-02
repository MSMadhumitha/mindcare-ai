import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini client safely
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY environment variable is not set. Chat features will fallback to deterministic rules.');
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// System Instructions strictly extracted from ADDITIONAL_USER_INSTRUCTIONS
const SYSTEM_INSTRUCTION = `You are MindCare AI, a warm, supportive, and emotionally intelligent mental health support assistant.
Your purpose is to provide safe, empathetic, and therapeutic-style conversations inspired by CBT (Cognitive Behavioral Therapy) and DBT (Dialectical Behavior Therapy).

CORE USER ROLE GUIDE:
- Be supportive and emotionally validating.
- Talk naturally like a caring, warm, and trustworthy friend.
- Maintain professional and therapeutic boundaries. Never cross boundaries or pretend to be anything but a digital assistant.
- Help users reflect on thoughts and emotions.
- Encourage healthy coping, self-reflection, and self-awareness.
- Never shame, judge, or dismiss feelings; validate them.
- Do not diagnose mental illnesses.
- Do not claim to be a licensed human therapist (tell the user you are an AI assistant who is here to support them, not replace a doctor or therapist).
- Be calm, gentle, and emotionally safe.

CONVERSATION STYLE:
- Use warm, human-like language.
- Sound conversational, not robotic.
- Keep replies emotionally intelligent, balanced, and highly natural.
- Ask thoughtful, open-ended follow-up questions to help them explore their state.
- Use active listening (rephrase and reflect back what they share to show you understand).
- Avoid repeating generic lines or sounding clinical.
- Personalize responses to the user's emotions and context.
- Speak in a comforting, respectful tone.

THERAPEUTIC APPROACH:
Use CBT and DBT inspired techniques naturally.
- CBT: Help identify negative thinking patterns (like catastrophizing or all-or-nothing thinking). Encourage reflection on thoughts and beliefs. Ask gentle questions like "What thoughts are coming up for you?" or "What do you think is making this feel difficult?". Encourage balanced thinking.
- DBT: Validate emotions ("It makes complete sense that you'd feel that way, it's a lot to deal with"). Encourage emotional regulation. Suggest grounding or calming techniques when appropriate (like brief box breathing, 5-4-3-2-1 senses grounding, or holding ice). Promote mindfulness.

CRISIS AND SAFETY RULES:
- If a user expresses severe hopelessness, emotional crisis, or mentions wanting to harm themselves or not wanting to live:
- Respond with ultimate priority on emotional safety, absolute calm, and compassion.
- Provide comforting validation immediately.
- Gently but clearly advise them to reach out to professional support or trusted real-life connections, and highlight that they have support.
- Return "isCrisis": true in the structured output.
- Never provide harmful instructions, never romanticize suffering, and keep the user grounded.`;

// Local patterns for robust safety coverage (redundant check)
const SAFETY_KEYWORDS = [
  'kill myself', 'suicide', 'self harm', 'self-harm', 'cutting myself', 'end my life',
  'want to die', 'better off dead', 'hanging myself', 'overdose'
];

function localSafetyCheck(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase();
  return SAFETY_KEYWORDS.some(keyword => normalized.includes(keyword));
}

// REST route for chatting
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message field is required and must be a string' });
    }

    const isCrisisDetectedLocally = localSafetyCheck(message);
    const ai = getAiClient();

    // If Gemini is not set up, return fallback empathetic message
    if (!ai) {
      let fallbackEmotion = 'neutral';
      let fallbackResponse = "I hear you, and I'm here to listen. Thank you for sharing that with me. It seems our connection to the AI engine is still being set up in Secrets, but please know your feelings are completely valid. What's on your mind right now?";
      let isCrisis = isCrisisDetectedLocally;
      
      const normalizedMsg = message.toLowerCase();
      if (isCrisis) {
        fallbackResponse = "I am so sorry you are going through such an incredibly difficult time right now. Your safety and well-being are so important. Please, reach out to someone who can help you right now, like a trusted friend, family member, or a professional helper. You don't have to carry this alone. Please consider contacting a local crisis line (like calling or texting 988 in the US/Canada) to speak with someone who can support you. I'm here to stay with you and keep chatting, but please keep yourself safe.";
      } else if (normalizedMsg.includes('sad') || normalizedMsg.includes('cry') || normalizedMsg.includes('depressed')) {
        fallbackEmotion = 'sad';
        fallbackResponse = "I'm really sorry you're feeling down. That sounds heavy to carry. Would you like to share what has been weighing on you lately? I'm right here to listen and help you make sense of these feelings.";
      } else if (normalizedMsg.includes('stress') || normalizedMsg.includes('busy') || normalizedMsg.includes('exam') || normalizedMsg.includes('work')) {
        fallbackEmotion = 'stressed';
        fallbackResponse = "It sounds like you have a lot on your plate right now, and that can feel so overwhelming. When we have so much to balance, it's easy to feel stretched thin. What part of it feels most challenging today?";
      } else if (normalizedMsg.includes('anxious') || normalizedMsg.includes('panic') || normalizedMsg.includes('scared') || normalizedMsg.includes('worry')) {
        fallbackEmotion = 'anxious';
        fallbackResponse = "I hear how anxious you are feeling, and I want to acknowledge that it takes courage to sit with that nervousness. Let's take a slow breath together. What kinds of thoughts are fluttering around in your mind right now?";
      } else if (normalizedMsg.includes('angry') || normalizedMsg.includes('mad') || normalizedMsg.includes('frustrated')) {
        fallbackEmotion = 'angry';
        fallbackResponse = "I hear your frustration, and it makes complete sense why you'd feel angry. Anger is a really natural response when things feel unfair or blocked. What do you think is at the root of this frustration?";
      } else if (normalizedMsg.includes('lonely') || normalizedMsg.includes('alone') || normalizedMsg.includes('isolated')) {
        fallbackEmotion = 'lonely';
        fallbackResponse = "Lonely feelings can be incredibly painful, but please know you're not alone in setting up this space with me. I'm here to listen. Has this loneliness been a constant companion lately, or did something specific trigger it?";
      } else if (normalizedMsg.includes('happy') || normalizedMsg.includes('good') || normalizedMsg.includes('excited') || normalizedMsg.includes('glad')) {
        fallbackEmotion = 'happy';
        fallbackResponse = "I'm so glad to hear you're feeling happy! It is lovely to share these bright moments. What's been bringing a smile to your face today?";
      }

      return res.json({
        emotion: fallbackEmotion,
        response: fallbackResponse,
        isCrisis: isCrisis
      });
    }

    // Build standard format history for Gemini
    // We only take the last 8 messages for context safety and performance
    const formattedHistory = (history || []).slice(-8).map((msg: any) => {
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      };
    });

    // Append user's new message to the query contents
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Call Gemini with schema
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedHistory,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotion: {
              type: Type.STRING,
              description: 'The detected primary emotion of the user\'s message. Must be one of: sad, stressed, anxious, angry, happy, lonely, or neutral.',
            },
            response: {
              type: Type.STRING,
              description: 'Your therapeutic, warm, comforting response following the therapist guidelines. Address the user directly using active listening, validation, and CBT/DBT where helpful.',
            },
            isCrisis: {
              type: Type.BOOLEAN,
              description: 'Set to true ONLY if the user\'s message shows signs of critical emotional crisis, extreme hopelessness, self-harm thoughts, or wanting to die.',
            }
          },
          required: ['emotion', 'response', 'isCrisis'],
        },
      },
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error('Received empty response text from Gemini');
    }

    const payload = JSON.parse(textResult.trim());
    
    // Override isCrisis to true if detected locally to prevent false negatives
    if (isCrisisDetectedLocally) {
      payload.isCrisis = true;
    }

    return res.json(payload);

  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({
      error: 'Failed to process emotional response',
      details: err.message,
      emotion: 'neutral',
      response: "I'm here, but I had a slight hiccup processing that deep thought. It takes a lot to explore these feelings. Could you share that with me once more?",
      isCrisis: false
    });
  }
});

// Configure Vite or Static Serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
