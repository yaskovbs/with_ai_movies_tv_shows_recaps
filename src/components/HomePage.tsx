import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Users, Zap, Shield, Cpu } from 'lucide-react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
// import VideoUploader from './VideoUploader' // Removed, as AdvancedHomePage handles media uploads
import RecapSettings from './RecapSettings'
import ProcessingStatus from './ProcessingStatus'
import StatsSection from './StatsSection'
import ResultsSection from './ResultsSection'
import { localStorageService } from '../lib/localStorage'
import type { VideoFile, RecapSettings as RecapSettingsType, ProcessingStatus as ProcessingStatusType, RecapOutput } from '../types'

interface HomePageProps {
  apiKey: string
}

async function generateScriptWithGemini(description: string, apiKey: string): Promise<string> {
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
  
  const prompt = `
    You are a professional video scriptwriter. Your task is to write a short, engaging voice-over script for a video recap.
    The video is about: "${description}".
    The script must be in Hebrew.
    Keep it concise, around 3-4 sentences.
    The tone should be exciting and cinematic.
    Do not include any introductory or concluding remarks like "Here is the script:". Just provide the script text.
  `;

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (response.status === 503) {
      if (attempt === maxRetries) {
        break; 
      }
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`Gemini API overloaded. Retrying in ${delay / 1000}s (Attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'An unknown API error occurred.');
    }

    const data = await response.json();
    const script = data.candidates[0]?.content?.parts[0]?.text;
    if (!script) {
      throw new Error('Failed to extract script from API response.');
    }
    return script.trim();
  }

  throw new Error('The model is currently overloaded. Please try again in a few moments.');
}


const HomePage = ({ apiKey }: HomePageProps) => {
  // const [selectedFile, setSelectedFile] = useState<VideoFile | null>(null) // Removed, as this page is simplified
  const [settings, setSettings] = useState<RecapSettingsType>({
    duration: 30,
    intervalSeconds: 8,
    captureSeconds: 1,
    description: '',
    apiKey: ''
  })
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusType | null>(null)
  const [recapOutput, setRecapOutput] = useState<RecapOutput | null>(null)
  const ffmpegRef = useRef(new FFmpeg())

  const handleCreateRecap = async () => {
    alert('פונקציונליות העלאת וידאו הועברה לדף המתקדם. אנא עבור לדף המתקדם.'); // Inform user
    return;
  }

  const features = [
    { icon: Zap, title: 'עיבוד מהיר', description: 'טכנולוגיית AI מתקדמת לעיבוד מהיר ויעיל' },
    { icon: Cpu, title: 'מנוע FFmpeg', description: 'עיבוד וידאו מתקדם ישירות בדפדפן' },
    { icon: Shield, title: 'בטוח ומאובטח', description: 'הקבצים שלכם מוגנים והמפתחות לא נשמרים' },
    { icon: Users, title: 'קל לשימוש', description: 'ממשק פשוט ונוח לכל הגילאים' }
  ]

  const isProcessing = !!(processingStatus && processingStatus.stage !== 'completed' && processingStatus.stage !== 'error');

  const renderRightPanel = () => {
    if (processingStatus && processingStatus.stage === 'error') {
      return <ProcessingStatus status={processingStatus} />;
    }
    if (recapOutput) {
      return <ResultsSection output={recapOutput} />;
    }
    if (isProcessing && processingStatus) {
      return <ProcessingStatus status={processingStatus} />;
    }
    
    // Default welcome message
    return (
      <motion.div 
        className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">
          ברוכים הבאים! ב-3 צעדים פשוטים תיצרו סיכום וידאו מדהים:
        </h3>
        <ol className="text-right text-gray-300 space-y-4 max-w-md mx-auto">
          <li className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center ml-4 flex-shrink-0 text-lg font-bold">1</span>
            <div>
              <span className="font-semibold text-white">העלאת וידאו:</span> פונקציונליות זו הועברה לדף המתקדם.
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center ml-4 flex-shrink-0 text-lg font-bold">2</span>
            <div>
              <span className="font-semibold text-white">הגדרות סיכום:</span> קבעו את אורך הסיכום ותארו את הווידאו ל-AI.
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center ml-4 flex-shrink-0 text-lg font-bold">3</span>
            <div>
              <span className="font-semibold text-white">יצירת סיכום:</span> לחצו על הכפתור ותנו לקסם לקרות!
            </div>
          </li>
        </ol>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <section className="py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            יוצר סיכומי וידאו
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            הפלטפורמה המתקדמת ביותר ליצירת סיכומי וידאו מקצועיים לסרטים וסדרות באמצעות בינה מלאכותית של Google Gemini
          </p>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-600 text-gray-400 text-center">
              <p>העלאת קובץ וידאו אינה זמינה כרגע בדף זה.</p>
              <p>אנא השתמש בדף המתקדם להעלאת קבצי מדיה.</p>
            </div>

            <RecapSettings settings={settings} onSettingsChange={setSettings} />
            <motion.button
              onClick={handleCreateRecap}
              disabled={!apiKey || isProcessing}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                apiKey && !isProcessing
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={{ scale: (apiKey && !isProcessing) ? 1.02 : 1 }}
              whileTap={{ scale: (apiKey && !isProcessing) ? 0.98 : 1 }}
            >
              <Play className="inline-block h-5 w-5 ml-2" />
              {isProcessing ? 'מעבד...' : 'צור סיכום וידאו'}
            </motion.button>
          </div>

          <div className="space-y-6">
            {renderRightPanel()}

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <feature.icon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white text-sm mb-1">{feature.title}</h4>
                  <p className="text-gray-400 text-xs">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StatsSection />
    </div>
  )
}

export default HomePage
