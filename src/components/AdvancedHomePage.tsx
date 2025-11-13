import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Brain, Sparkles, TrendingUp, CheckCircle2, Youtube } from 'lucide-react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import VideoUploader from './VideoUploader'
import AdvancedRecapSettings from './AdvancedRecapSettings'
import ProcessingStatus from './ProcessingStatus'
import ResultsSection from './ResultsSection'
import { aiLearningService } from '../services/aiLearningService'
import { supabaseService } from '../lib/supabaseClient'
import type { VideoFile, ProcessingStatus as ProcessingStatusType, RecapOutput } from '../types'

interface AdvancedHomePageProps {
  apiKey: string
}

const AdvancedHomePage = ({ apiKey }: AdvancedHomePageProps) => {
  const [selectedFile, setSelectedFile] = useState<VideoFile | null>(null)
  const [settings, setSettings] = useState({
    duration: 30,
    intervalSeconds: 8,
    captureSeconds: 1,
    title: '',
    genre: '',
    description: '',
    youtubeChannelId: '',
    youtubeApiKey: '',
    googleSearchApiKey: '',
    searchEngineId: '',
    enableWebSearch: true,
    enableYoutubeLearning: true
  })
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusType | null>(null)
  const [recapOutput, setRecapOutput] = useState<RecapOutput | null>(null)
  const [learningInsights, setLearningInsights] = useState<string[]>([])
  const ffmpegRef = useRef(new FFmpeg())

  useEffect(() => {
    aiLearningService.loadLearningData()
  }, [])

  useEffect(() => {
    if (settings.genre) {
      const optimal = aiLearningService.getOptimalSettings(settings.genre)
      if (optimal.clipDuration && optimal.intervalPattern) {
        const insight = `AI ממליץ: מרווח של ${optimal.intervalPattern} שניות לז'אנר ${settings.genre}`
        setLearningInsights([insight])
      }
    }
  }, [settings.genre])

  const handleCreateRecap = async () => {
    if (!selectedFile) {
      alert('אנא בחר קובץ וידאו')
      return
    }
    if (!apiKey) {
      alert('אנא הכנס מפתח Gemini AI API')
      return
    }
    if (!settings.title.trim()) {
      alert('אנא הכנס כותרת')
      return
    }
    if (!settings.description.trim()) {
      alert('אנא הכנס תיאור')
      return
    }

    setRecapOutput(null)
    setProcessingStatus({ stage: 'loading_engine', progress: 0, message: 'מתכונן לעיבוד מתקדם...' })

    const ffmpeg = ffmpegRef.current
    ffmpeg.on('log', ({ message }) => { console.log(message) })

    try {
      setProcessingStatus({
        stage: 'loading_engine',
        progress: 10,
        message: 'טוען מנוע וידאו מתקדם...'
      })

      if (!ffmpeg.loaded) {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
      }

      let movieInfo = null
      if (settings.enableWebSearch) {
        setProcessingStatus({
          stage: 'loading_engine',
          progress: 20,
          message: 'מחפש מידע נוסף באינטרנט...'
        })

        const cached = await supabaseService.getWebSearchCache(`${settings.title} ${settings.genre}`)
        if (cached) {
          movieInfo = cached
        } else {
          movieInfo = await aiLearningService.searchMovieInfo(settings.title, settings.genre)
          if (movieInfo) {
            await supabaseService.setWebSearchCache(`${settings.title} ${settings.genre}`, movieInfo)
          }
        }
      }

      let youtubeStyle: any[] = []
      if (settings.enableYoutubeLearning && settings.youtubeChannelId) {
        setProcessingStatus({
          stage: 'loading_engine',
          progress: 30,
          message: 'מנתח סגנון מערוצי YouTube...'
        })

        youtubeStyle = await aiLearningService.analyzeYoutubeChannel(settings.youtubeChannelId, apiKey)

        if (youtubeStyle.length > 0) {
          await supabaseService.addYoutubeLearningSource({
            channel_id: settings.youtubeChannelId,
            video_id: youtubeStyle[0].videoId,
            style_patterns: { editingStyle: youtubeStyle[0].editingStyle },
            editing_patterns: { transitions: youtubeStyle[0].transitionPatterns }
          })
        }
      }

      setProcessingStatus({
        stage: 'cutting_video',
        progress: 40,
        message: 'כותב קובץ למערכת...'
      })

      await ffmpeg.writeFile(selectedFile.name, await fetchFile(selectedFile.file))

      ffmpeg.on('progress', ({ progress }) => {
        if (progress >= 0 && progress <= 1) {
          setProcessingStatus(prev => ({
            ...prev!,
            stage: 'cutting_video',
            progress: 40 + Math.round(progress * 30),
            message: `מעבד וידאו עם AI... ${Math.round(progress * 100)}%`
          }))
        }
      })

      const outputFileName = 'advanced_recap.mp4'
      const selectFilter = `select='lt(mod(t,${settings.intervalSeconds}),${settings.captureSeconds})',setpts=N/FRAME_RATE/TB`

      await ffmpeg.exec([
        '-i', selectedFile.name,
        '-vf', selectFilter,
        '-an',
        '-t', `${settings.duration}`,
        '-y',
        outputFileName
      ])

      const data = await ffmpeg.readFile(outputFileName)
      const videoUrl = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: 'video/mp4' }))

      setProcessingStatus({
        stage: 'generating_script',
        progress: 75,
        message: 'יוצר תסריט משופר עם AI...'
      })

      const enhancedScript = await aiLearningService.generateEnhancedScript(
        settings.description,
        movieInfo,
        youtubeStyle,
        apiKey
      )

      setProcessingStatus({
        stage: 'generating_script',
        progress: 90,
        message: 'שומר נתוני למידה...'
      })

      const movieMetadata = await supabaseService.createMovieMetadata({
        title: settings.title,
        genre: settings.genre,
        description: settings.description,
        external_data: movieInfo
      })

      if (movieMetadata) {
        await supabaseService.createRecapProject({
          user_id: localStorage.getItem('visitor_id') || 'anonymous',
          movie_metadata_id: movieMetadata.id,
          video_file_name: selectedFile.name,
          video_size: selectedFile.size,
          duration_seconds: settings.duration,
          interval_seconds: settings.intervalSeconds,
          capture_seconds: settings.captureSeconds,
          status: 'completed',
          generated_script: enhancedScript,
          processing_metadata: {
            movieInfo,
            youtubeStyle,
            learningEnabled: settings.enableYoutubeLearning
          }
        })
      }

      setProcessingStatus({
        stage: 'completed',
        progress: 100,
        message: 'הסיכום המתקדם נוצר בהצלחה!'
      })

      setRecapOutput({
        videoUrl: videoUrl,
        script: enhancedScript,
      })

      await ffmpeg.deleteFile(selectedFile.name)
      await ffmpeg.deleteFile(outputFileName)

    } catch (error: unknown) {
      console.error("Error during advanced recap creation:", error)
      let userMessage = 'שגיאה לא ידועה התרחשה. אנא נסה שוב.'
      if (error instanceof Error) {
        if (error.message.includes('overloaded')) {
          userMessage = 'שרתי ה-AI עמוסים כרגע. אנא נסה שוב בעוד מספר דקות.'
        } else if (error.message.includes('API key')) {
          userMessage = 'מפתח ה-API אינו תקין. אנא בדוק את המפתח ונסה שוב.'
        } else if (error.message) {
          userMessage = error.message
        }
      }
      setProcessingStatus({
        stage: 'error',
        progress: 0,
        message: userMessage
      })
    }
  }

  const isProcessing = !!(processingStatus && processingStatus.stage !== 'completed' && processingStatus.stage !== 'error')

  const features = [
    {
      icon: Brain,
      title: 'AI חכם ולומד',
      description: 'מערכת שמשתפרת עם כל סיכום',
      color: 'text-purple-400'
    },
    {
      icon: Sparkles,
      title: 'למידה מיוטיוב',
      description: 'לומד מערוצים מצליחים',
      color: 'text-yellow-400'
    },
    {
      icon: TrendingUp,
      title: 'מיטוב מתמשך',
      description: 'תוצאות משתפרות עם הזמן',
      color: 'text-green-400'
    },
    {
      icon: CheckCircle2,
      title: 'דיוק מקסימלי',
      description: 'חיפוש באינטרנט לדיוק',
      color: 'text-blue-400'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <section className="py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            יוצר סיכומי וידאו חכם עם AI
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
            מערכת מתקדמת ליצירת סיכומי וידאו עם בינה מלאכותית שלומדת ומשתפרת עם כל סיכום. הפלטפורמה שלנו מאפשרת לכם ליצור סיכומים מקצועיים לסרטים וסדרות בקלות ובמהירות.
          </p>
          <motion.a
            href="https://youtube.com/@movies_and_tv_show_recap?si=KmCPgoiLvOaDQlu3"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Youtube className="h-5 w-5 ml-2" />
            צפו בסרטונים מקצועיים בערוץ שלנו
          </motion.a>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <VideoUploader
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onRemoveFile={() => setSelectedFile(null)}
            />

            <AdvancedRecapSettings settings={settings} onSettingsChange={setSettings} />

            {learningInsights.length > 0 && (
              <motion.div
                className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-4 border border-purple-600/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start">
                  <Brain className="h-5 w-5 text-purple-400 ml-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">תובנות AI</h4>
                    {learningInsights.map((insight, index) => (
                      <p key={index} className="text-xs text-gray-300">{insight}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <motion.button
              onClick={handleCreateRecap}
              disabled={!selectedFile || !apiKey || isProcessing}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                selectedFile && apiKey && !isProcessing
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={{ scale: (selectedFile && apiKey && !isProcessing) ? 1.02 : 1 }}
              whileTap={{ scale: (selectedFile && apiKey && !isProcessing) ? 0.98 : 1 }}
            >
              <Play className="inline-block h-5 w-5 ml-2" />
              {isProcessing ? 'מעבד עם AI...' : 'צור סיכום חכם'}
            </motion.button>
          </div>

          <div className="space-y-6">
            {processingStatus && processingStatus.stage === 'error' && (
              <ProcessingStatus status={processingStatus} />
            )}

            {recapOutput && !isProcessing && (
              <ResultsSection output={recapOutput} />
            )}

            {isProcessing && processingStatus && (
              <ProcessingStatus status={processingStatus} />
            )}

            {!processingStatus && !recapOutput && (
              <motion.div
                className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  מערכת AI מתקדמת עם למידה מתמשכת
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-700/50 rounded-lg p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <feature.icon className={`h-8 w-8 ${feature.color} mx-auto mb-2`} />
                      <h4 className="font-semibold text-white text-sm mb-1">{feature.title}</h4>
                      <p className="text-gray-400 text-xs">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-400 text-sm">
                  המערכת משתמשת בטכנולוגיות AI מתקדמות כולל למידה מיוטיוב, חיפוש באינטרנט ולמידה מתמשכת לשיפור איכות הסיכומים
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdvancedHomePage
