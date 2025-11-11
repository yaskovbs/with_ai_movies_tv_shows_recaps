import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface RecapProject {
  id: string
  user_id: string
  movie_metadata_id?: string
  video_file_name: string
  video_size: number
  duration_seconds: number
  interval_seconds: number
  capture_seconds: number
  total_clips?: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  output_video_url?: string
  generated_script?: string
  error_message?: string
  processing_metadata?: any
  created_at: string
  updated_at: string
}

export interface MovieMetadata {
  id: string
  title: string
  genre?: string
  description?: string
  imdb_id?: string
  youtube_trailer_url?: string
  external_data?: any
  created_at: string
}

export interface YoutubeLearningSource {
  id: string
  channel_id: string
  channel_name?: string
  video_id: string
  video_title?: string
  style_patterns?: any
  editing_patterns?: any
  metadata?: any
  created_at: string
}

export class SupabaseService {
  async createMovieMetadata(data: Partial<MovieMetadata>): Promise<MovieMetadata | null> {
    const { data: movie, error } = await supabase
      .from('movies_metadata')
      .insert([data])
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error creating movie metadata:', error)
      return null
    }

    return movie
  }

  async createRecapProject(data: Partial<RecapProject>): Promise<RecapProject | null> {
    const { data: project, error } = await supabase
      .from('recap_projects')
      .insert([data])
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error creating recap project:', error)
      return null
    }

    return project
  }

  async updateRecapProject(id: string, updates: Partial<RecapProject>): Promise<boolean> {
    const { error } = await supabase
      .from('recap_projects')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating recap project:', error)
      return false
    }

    return true
  }

  async getRecapProjects(userId: string): Promise<RecapProject[]> {
    const { data, error } = await supabase
      .from('recap_projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recap projects:', error)
      return []
    }

    return data || []
  }

  async addYoutubeLearningSource(data: Partial<YoutubeLearningSource>): Promise<boolean> {
    const { error } = await supabase
      .from('youtube_learning_sources')
      .insert([data])

    if (error) {
      console.error('Error adding youtube learning source:', error)
      return false
    }

    return true
  }

  async getWebSearchCache(query: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('web_search_cache')
      .select('search_results')
      .eq('query', query)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return data.search_results
  }

  async setWebSearchCache(query: string, results: any): Promise<boolean> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { error } = await supabase
      .from('web_search_cache')
      .upsert([
        {
          query,
          search_results: results,
          expires_at: expiresAt.toISOString()
        }
      ])

    if (error) {
      console.error('Error setting web search cache:', error)
      return false
    }

    return true
  }

  async addUserFeedback(projectId: string, rating: number, feedbackText?: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_feedback')
      .insert([
        {
          recap_project_id: projectId,
          rating,
          feedback_text: feedbackText
        }
      ])

    if (error) {
      console.error('Error adding user feedback:', error)
      return false
    }

    return true
  }
}

export const supabaseService = new SupabaseService()
