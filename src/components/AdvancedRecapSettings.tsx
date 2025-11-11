import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Clock, Scissors, FileVideo, Youtube, Search, Brain, Info } from 'lucide-react'

interface AdvancedRecapSettingsProps {
  settings: {
    duration: number
    intervalSeconds: number
    captureSeconds: number
    title: string
    genre: string
    description: string
    youtubeChannelId: string
    enableWebSearch: boolean
    enableYoutubeLearning: boolean
    youtubeDataApiKey: string
    googleSearchApiKey: string
    googleSearchEngineId: string
  }
  onSettingsChange: (settings: any) => void
}

const AdvancedRecapSettings = ({ settings, onSettingsChange }: AdvancedRecapSettingsProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = (field: string, value: any) => {
    onSettingsChange({
      ...settings,
      [field]: value
    })
  }

  const handleDurationChange = (part: 'hours' | 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value, 10) || 0
    const currentHours = Math.floor(settings.duration / 3600)
    const currentMinutes = Math.floor((settings.duration % 3600) / 60)
    const currentSeconds = settings.duration % 60

    let newHours = currentHours
    let newMinutes = currentMinutes
    let newSeconds = currentSeconds

    if (part === 'hours') newHours = Math.min(numValue, 3)
    if (part === 'minutes') newMinutes = Math.min(numValue, 59)
    if (part === 'seconds') newSeconds = Math.min(numValue, 59)

    let newTotalSeconds = (newHours * 3600) + (newMinutes * 60) + newSeconds
    newTotalSeconds = Math.min(Math.max(newTotalSeconds, 1), 10800)

    handleChange('duration', newTotalSeconds)
  }

  const handleIntervalChange = (part: 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value, 10) || 0
    const intervalMinutes = Math.floor(settings.intervalSeconds / 60)
    const intervalRemainingSeconds = settings.intervalSeconds % 60

    let newMinutes = intervalMinutes
    let newSeconds = intervalRemainingSeconds

    if (part === 'minutes') newMinutes = numValue
    if (part === 'seconds') newSeconds = numValue

    let newTotalSeconds = (newMinutes * 60) + newSeconds
    newTotalSeconds = Math.max(newTotalSeconds, 1)

    handleChange('intervalSeconds', newTotalSeconds)
  }

  const durationHours = Math.floor(settings.duration / 3600)
  const durationMinutes = Math.floor((settings.duration % 3600) / 60)
  const durationSeconds = settings.duration % 60

  const intervalMinutes = Math.floor(settings.intervalSeconds / 60)
  const intervalSeconds = settings.intervalSeconds % 60

  const estimatedClips = Math.floor(settings.duration / settings.intervalSeconds)

  return (
    <motion.div
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Settings className="h-6 w-6 text-blue-400 ml-3" />
          <h2 className="text-xl font-semibold text-white">הגדרות סיכום מתקדמות</h2>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showAdvanced ? 'הסתר מתקדם' : 'הצג מתקדם'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <FileVideo className="h-4 w-4 ml-2" />
              כותרת הסרט/סדרה *
            </label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="לדוגמה: Inception"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <FileVideo className="h-4 w-4 ml-2" />
              ז'אנר
            </label>
            <select
              value={settings.genre}
              onChange={(e) => handleChange('genre', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">בחר ז'אנר</option>
              <option value="action">אקשן</option>
              <option value="comedy">קומדיה</option>
              <option value="drama">דרמה</option>
              <option value="horror">אימה</option>
              <option value="scifi">מדע בדיוני</option>
              <option value="thriller">מותחן</option>
              <option value="romance">רומנטי</option>
              <option value="documentary">תיעודי</option>
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
            <FileVideo className="h-4 w-4 ml-2" />
            תיאור הסרט/סדרה
          </label>
          <textarea
            value={settings.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="תאר את העלילה, דמויות ראשיות ורגעים חשובים..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
        </div>

        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg p-4 border border-blue-600/20">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-400 ml-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-1">טיפ לשיפור איכות</h4>
              <p className="text-xs text-gray-300">
                תיאור מפורט יעזור ל-AI ליצור סיכום מדויק יותר ולכלול את הרגעים החשובים ביותר.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
            <Clock className="h-4 w-4 ml-2" />
            אורך הסיכום (עד 3 שעות)
          </label>
          <div className="flex items-start space-x-2 space-x-reverse">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="3"
                value={String(durationHours).padStart(2, '0')}
                onChange={(e) => handleDurationChange('hours', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 text-center mt-1">שעות</p>
            </div>
            <span className="text-xl font-bold text-gray-400 pt-2">:</span>
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="59"
                value={String(durationMinutes).padStart(2, '0')}
                onChange={(e) => handleDurationChange('minutes', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 text-center mt-1">דקות</p>
            </div>
            <span className="text-xl font-bold text-gray-400 pt-2">:</span>
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="59"
                value={String(durationSeconds).padStart(2, '0')}
                onChange={(e) => handleDurationChange('seconds', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 text-center mt-1">שניות</p>
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
            <Scissors className="h-4 w-4 ml-2" />
            חתוך כל (דקות : שניות)
          </label>
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="number"
              min="0"
              max="59"
              value={intervalMinutes}
              onChange={(e) => handleIntervalChange('minutes', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xl font-bold text-gray-400">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={intervalSeconds}
              onChange={(e) => handleIntervalChange('seconds', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            כל {intervalMinutes > 0 ? `${intervalMinutes} דקות ו-` : ''}{intervalSeconds} שניות ייחתך קטע של {settings.captureSeconds} שניות
          </p>
        </div>

        {showAdvanced && (
          <motion.div
            className="space-y-4 pt-4 border-t border-gray-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center">
                <Search className="h-5 w-5 text-green-400 ml-2" />
                <div>
                  <h4 className="text-sm font-semibold text-white">חיפוש באינטרנט</h4>
                  <p className="text-xs text-gray-400">איסוף מידע נוסף לשיפור הדיוק</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableWebSearch}
                  onChange={(e) => handleChange('enableWebSearch', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {settings.enableWebSearch && (
              <div className="space-y-4 pl-8">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Search className="h-4 w-4 ml-2" />
                    Google Search API Key
                  </label>
                  <input
                    type="text"
                    value={settings.googleSearchApiKey}
                    onChange={(e) => handleChange('googleSearchApiKey', e.target.value)}
                    placeholder="הזן את מפתח ה-API של Google Search"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Search className="h-4 w-4 ml-2" />
                    Search Engine ID
                  </label>
                  <input
                    type="text"
                    value={settings.googleSearchEngineId}
                    onChange={(e) => handleChange('googleSearchEngineId', e.target.value)}
                    placeholder="הזן את מזהה מנוע החיפוש"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center">
                <Youtube className="h-5 w-5 text-red-400 ml-2" />
                <div>
                  <h4 className="text-sm font-semibold text-white">למידה מיוטיוב</h4>
                  <p className="text-xs text-gray-400">שיפור הסגנון על בסיס ערוצים מצליחים</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableYoutubeLearning}
                  onChange={(e) => handleChange('enableYoutubeLearning', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.enableYoutubeLearning && (
              <div className="space-y-4 pl-8">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Youtube className="h-4 w-4 ml-2" />
                    מפתח YouTube Data API v3 (אופציונלי)
                  </label>
                  <input
                    type="text"
                    value={settings.youtubeDataApiKey}
                    onChange={(e) => handleChange('youtubeDataApiKey', e.target.value)}
                    placeholder="הזן מפתח YouTube Data API v3..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                   <a href="https://developers.google.com/youtube/v3/getting-started" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 mt-1">
                      איך להשיג מפתח API?
                  </a>
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Youtube className="h-4 w-4 ml-2" />
                    קישור ליוטיוב ללמידה (אופציונלי)
                  </label>
                  <input
                    type="text"
                    value={settings.youtubeChannelId}
                    onChange={(e) => handleChange('youtubeChannelId', e.target.value)}
                    placeholder="הדבק כאן קישור לערוץ היוטיוב..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    המערכת תלמד מהסגנון של הערוץ לשיפור איכות הסיכום
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center p-3 bg-purple-600/10 rounded-lg border border-purple-600/20">
              <Brain className="h-5 w-5 text-purple-400 ml-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-purple-400">למידה מתמשכת פעילה</h4>
                <p className="text-xs text-gray-300">
                  המערכת לומדת מכל סיכום שנוצר ומשתפרת עם הזמן
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">סיכום הגדרות:</h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-400">
            <div>
              <span className="font-semibold text-white">אורך סיכום:</span>
              <p className="text-blue-400">
                {durationHours > 0 ? `${durationHours}:` : ''}
                {String(durationMinutes).padStart(2, '0')}:
                {String(durationSeconds).padStart(2, '0')}
              </p>
            </div>
            <div>
              <span className="font-semibold text-white">מרווח חיתוך:</span>
              <p className="text-blue-400">
                {intervalMinutes > 0 ? `${intervalMinutes}:` : ''}
                {String(intervalSeconds).padStart(2, '0')}
              </p>
            </div>
            <div>
              <span className="font-semibold text-white">קטעים משוערים:</span>
              <p className="text-green-400">~{estimatedClips} קטעים</p>
            </div>
            <div>
              <span className="font-semibold text-white">משך כל קטע:</span>
              <p className="text-green-400">{settings.captureSeconds} שניות</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AdvancedRecapSettings
