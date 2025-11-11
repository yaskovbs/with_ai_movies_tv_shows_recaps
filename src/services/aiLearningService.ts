interface LearningPattern {
  clipDuration: number
  intervalPattern: number
  genrePreference: string
  styleWeights: {
    pacing: number
    dramaTiming: number
    comedyTiming: number
    actionSequence: number
  }
}

interface YoutubeVideoAnalysis {
  videoId: string
  editingStyle: string
  averageClipLength: number
  transitionPatterns: string[]
  popularityScore: number
}

class AILearningService {
  private learningData: LearningPattern[] = []

  async analyzeYoutubeChannel(channelId: string, apiKey: string): Promise<YoutubeVideoAnalysis[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=viewCount&maxResults=10&type=video`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch YouTube data')
      }

      const data = await response.json()

      const analyses: YoutubeVideoAnalysis[] = data.items.map((item: any) => ({
        videoId: item.id.videoId,
        editingStyle: this.inferEditingStyle(item.snippet),
        averageClipLength: this.estimateClipLength(item.snippet.title),
        transitionPatterns: this.analyzeTransitionPatterns(item.snippet),
        popularityScore: Math.random() * 100
      }))

      return analyses
    } catch (error) {
      console.error('YouTube analysis error:', error)
      return []
    }
  }

  private inferEditingStyle(snippet: any): string {
    const title = snippet.title.toLowerCase()

    if (title.includes('recap') || title.includes('summary')) {
      return 'fast-paced'
    } else if (title.includes('analysis') || title.includes('review')) {
      return 'detailed'
    } else if (title.includes('trailer') || title.includes('teaser')) {
      return 'dramatic'
    }

    return 'balanced'
  }

  private estimateClipLength(title: string): number {
    if (title.toLowerCase().includes('quick') || title.toLowerCase().includes('fast')) {
      return 2
    } else if (title.toLowerCase().includes('detailed') || title.toLowerCase().includes('full')) {
      return 5
    }

    return 3
  }

  private analyzeTransitionPatterns(snippet: any): string[] {
    const patterns: string[] = []
    const description = snippet.description.toLowerCase()

    if (description.includes('action')) patterns.push('quick-cut')
    if (description.includes('drama')) patterns.push('fade')
    if (description.includes('comedy')) patterns.push('jump-cut')

    return patterns.length > 0 ? patterns : ['standard']
  }

  async searchMovieInfo(title: string, genre: string): Promise<any> {
    const query = `${title} ${genre} movie plot summary`

    try {
      const mockResults = {
        title,
        genre,
        plot: `A comprehensive plot summary for ${title}`,
        keyScenes: [
          'Opening scene establishing the world',
          'Introduction of main characters',
          'Rising action and conflict development',
          'Climax and turning point',
          'Resolution and conclusion'
        ],
        themes: ['Adventure', 'Character Development', 'Conflict Resolution'],
        criticalMoments: [
          { timestamp: '00:15:00', description: 'First major plot point' },
          { timestamp: '00:45:00', description: 'Midpoint twist' },
          { timestamp: '01:30:00', description: 'Climactic scene' }
        ]
      }

      return mockResults
    } catch (error) {
      console.error('Web search error:', error)
      return null
    }
  }

  async generateEnhancedScript(
    description: string,
    movieInfo: any,
    youtubeStyle: YoutubeVideoAnalysis[],
    apiKey: string
  ): Promise<string> {
    const styleContext = youtubeStyle.length > 0
      ? `Style inspiration: ${youtubeStyle[0].editingStyle} editing with ${youtubeStyle[0].averageClipLength}s clips`
      : ''

    const movieContext = movieInfo
      ? `Movie context: ${movieInfo.plot}. Key scenes: ${movieInfo.keyScenes.join(', ')}`
      : ''

    const enhancedPrompt = `
      You are a professional video recap scriptwriter. Create an engaging Hebrew voice-over script for a video recap.

      ${description}

      ${movieContext}

      ${styleContext}

      Requirements:
      - Write in Hebrew language
      - Create an exciting, cinematic tone
      - Include only the most crucial moments
      - Keep it concise (3-4 sentences)
      - Use dramatic pacing appropriate for the genre
      - NO introductory text, just the script

      Generate the script:
    `

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`

    const maxRetries = 3
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: enhancedPrompt }] }]
          })
        })

        if (response.status === 503) {
          if (attempt === maxRetries) break
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || 'API error')
        }

        const data = await response.json()
        const script = data.candidates[0]?.content?.parts[0]?.text

        if (!script) {
          throw new Error('No script generated')
        }

        this.learnFromGeneration({
          description,
          movieInfo,
          youtubeStyle,
          generatedScript: script
        })

        return script.trim()
      } catch (error) {
        if (attempt === maxRetries) throw error
      }
    }

    throw new Error('Failed to generate script after multiple attempts')
  }

  private learnFromGeneration(data: any) {
    const pattern: LearningPattern = {
      clipDuration: 3,
      intervalPattern: 8,
      genrePreference: data.movieInfo?.genre || 'unknown',
      styleWeights: {
        pacing: 0.8,
        dramaTiming: 0.7,
        comedyTiming: 0.6,
        actionSequence: 0.9
      }
    }

    this.learningData.push(pattern)

    if (this.learningData.length > 100) {
      this.learningData.shift()
    }

    this.saveLearningData()
  }

  private saveLearningData() {
    try {
      localStorage.setItem('ai_learning_data', JSON.stringify(this.learningData))
    } catch (error) {
      console.error('Failed to save learning data:', error)
    }
  }

  loadLearningData() {
    try {
      const saved = localStorage.getItem('ai_learning_data')
      if (saved) {
        this.learningData = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load learning data:', error)
    }
  }

  getOptimalSettings(genre: string): Partial<LearningPattern> {
    const genrePatterns = this.learningData.filter(p => p.genrePreference === genre)

    if (genrePatterns.length === 0) {
      return this.getDefaultSettings(genre)
    }

    const avgClipDuration = genrePatterns.reduce((sum, p) => sum + p.clipDuration, 0) / genrePatterns.length
    const avgInterval = genrePatterns.reduce((sum, p) => sum + p.intervalPattern, 0) / genrePatterns.length

    return {
      clipDuration: Math.round(avgClipDuration),
      intervalPattern: Math.round(avgInterval)
    }
  }

  private getDefaultSettings(genre: string): Partial<LearningPattern> {
    const defaults: Record<string, Partial<LearningPattern>> = {
      action: { clipDuration: 2, intervalPattern: 6 },
      comedy: { clipDuration: 3, intervalPattern: 8 },
      drama: { clipDuration: 4, intervalPattern: 10 },
      horror: { clipDuration: 3, intervalPattern: 7 },
      scifi: { clipDuration: 3, intervalPattern: 8 },
      thriller: { clipDuration: 2, intervalPattern: 6 },
      romance: { clipDuration: 4, intervalPattern: 10 },
      documentary: { clipDuration: 5, intervalPattern: 12 }
    }

    return defaults[genre] || { clipDuration: 3, intervalPattern: 8 }
  }

  async saveToDatabase(projectData: any) {
    console.log('Saving project data:', projectData)
  }
}

export const aiLearningService = new AILearningService()
