export interface VideoFile {
  id: string
  name: string
  size: number
  type: string
  file: File
}

export interface RecapSettings {
  duration: number // בשניות
  intervalSeconds: number // כל כמה שניות לחתוך
  captureSeconds: number // כמה שניות לקחת בכל פעם
  description: string
  apiKey: string
}

export interface ProcessingStatus {
  stage: 'loading_engine' | 'cutting_video' | 'generating_script' | 'generating_audio' | 'completed' | 'error'
  progress: number
  message: string
  generatedVideoUrl?: string
}

export interface Stats {
  recapsCreated: number
  activeUsers: number
  uptime: number
  rating: number
}

export interface FAQ {
  question: string
  answer: string
}

export interface RecapOutput {
  videoUrl: string;
  script: string;
}
