import { motion } from 'framer-motion'
import { Settings, Clock, Scissors, FileVideo } from 'lucide-react'
import type { RecapSettings } from '../types'

interface RecapSettingsProps {
  settings: RecapSettings;
  onSettingsChange: (settings: RecapSettings) => void;
}

const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `00:${paddedMinutes}:${paddedSeconds}`;
};

const RecapSettingsComponent = ({ 
  settings, 
  onSettingsChange 
}: RecapSettingsProps) => {
  const handleChange = <K extends keyof RecapSettings>(field: K, value: RecapSettings[K]) => {
    onSettingsChange({
      ...settings,
      [field]: value
    })
  }

  const handleDurationChange = (part: 'hours' | 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;

    const currentHours = Math.floor(settings.duration / 3600);
    const currentMinutes = Math.floor((settings.duration % 3600) / 60);
    const currentSeconds = settings.duration % 60;

    let newHours = currentHours;
    let newMinutes = currentMinutes;
    let newSeconds = currentSeconds;

    if (part === 'hours') newHours = numValue;
    if (part === 'minutes') newMinutes = numValue;
    if (part === 'seconds') newSeconds = numValue;

    let newTotalSeconds = (newHours * 3600) + (newMinutes * 60) + newSeconds;

    if (newTotalSeconds > 10800) {
      newTotalSeconds = 10800;
    }
    if (newTotalSeconds < 1) {
      newTotalSeconds = 1;
    }

    handleChange('duration', newTotalSeconds);
  };

  const durationHours = Math.floor(settings.duration / 3600);
  const durationMinutes = Math.floor((settings.duration % 3600) / 60);
  const durationSeconds = settings.duration % 60;

  const intervalMinutes = Math.floor(settings.intervalSeconds / 60);
  const intervalRemainingSeconds = settings.intervalSeconds % 60;

  const handleIntervalChange = (part: 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return;

    let newMinutes = intervalMinutes;
    let newSeconds = intervalRemainingSeconds;

    if (part === 'minutes') {
        newMinutes = numValue;
    } else { // 'seconds'
        newSeconds = numValue;
    }
    
    let newTotalSeconds = (newMinutes * 60) + newSeconds;
    
    if (newTotalSeconds < 1) {
        newTotalSeconds = 1;
    }

    handleChange('intervalSeconds', newTotalSeconds);
  };

  return (
    <motion.div 
      className="bg-gray-800 rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center mb-6">
        <Settings className="h-6 w-6 text-blue-400 ml-3" />
        <h2 className="text-xl font-semibold text-white">הגדרות סיכום</h2>
      </div>

      <div className="space-y-6">
        {/* אורך הסיכום */}
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

        {/* תדירות חיתוך */}
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
              placeholder="00"
            />
            <span className="text-xl font-bold text-gray-400">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={intervalRemainingSeconds}
              onChange={(e) => handleIntervalChange('seconds', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="08"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            כל {intervalMinutes > 0 ? `${intervalMinutes} דקות ו-` : ''}{intervalRemainingSeconds} שניות ייחתך קטע של שנייה אחת.
          </p>
        </div>

        {/* תיאור הווידאו */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
            <FileVideo className="h-4 w-4 ml-2" />
            תיאור הווידאו
          </label>
          <textarea
            value={settings.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="תאר את תוכן הווידאו לצורך יצירת סיכום מדויק..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-400 mt-1">
            תיאור מפורט יעזור ל-AI ליצור סיכום איכותי יותר
          </p>
        </div>

        {/* סיכום הגדרות */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">סיכום הגדרות:</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <p>• אורך סיכום: {formatDuration(settings.duration)}</p>
            <p>• חיתוך כל: {formatDuration(settings.intervalSeconds)}</p>
            <p>• קטעים כוללים: ~{settings.intervalSeconds > 0 ? Math.floor(settings.duration / settings.intervalSeconds) : 0} קטעים</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default RecapSettingsComponent
