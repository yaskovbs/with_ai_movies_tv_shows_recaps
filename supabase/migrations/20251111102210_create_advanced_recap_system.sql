/*
  # מערכת יצירת סיכומי וידאו מתקדמת עם AI

  ## טבלאות חדשות
  
  ### 1. movies_metadata
  - `id` (uuid, primary key)
  - `title` (text) - כותרת הסרט/סדרה
  - `genre` (text) - ז'אנר
  - `description` (text) - תיאור
  - `imdb_id` (text) - מזהה IMDB
  - `youtube_trailer_url` (text) - קישור לטריילר
  - `created_at` (timestamptz)
  
  ### 2. recap_projects
  - `id` (uuid, primary key)
  - `user_id` (uuid) - מזהה משתמש
  - `movie_metadata_id` (uuid) - קישור למטא-דאטה
  - `video_file_name` (text)
  - `video_size` (bigint)
  - `duration_seconds` (integer) - אורך הסיכום המבוקש
  - `interval_seconds` (integer) - מרווח חיתוך
  - `capture_seconds` (integer) - משך כל קטע
  - `total_clips` (integer) - מספר קטעים משוער
  - `status` (text) - pending/processing/completed/failed
  - `output_video_url` (text)
  - `generated_script` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 3. youtube_learning_sources
  - `id` (uuid, primary key)
  - `channel_id` (text)
  - `channel_name` (text)
  - `video_id` (text)
  - `video_title` (text)
  - `style_patterns` (jsonb) - דפוסי סגנון שנלמדו
  - `editing_patterns` (jsonb) - דפוסי עריכה
  - `created_at` (timestamptz)
  
  ### 4. learning_models
  - `id` (uuid, primary key)
  - `model_version` (text)
  - `training_data` (jsonb) - נתוני אימון
  - `performance_metrics` (jsonb) - מדדי ביצוע
  - `style_weights` (jsonb) - משקלים לסגנונות שונים
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  
  ### 5. web_search_cache
  - `id` (uuid, primary key)
  - `query` (text)
  - `search_results` (jsonb)
  - `cached_at` (timestamptz)
  - `expires_at` (timestamptz)
  
  ### 6. user_feedback
  - `id` (uuid, primary key)
  - `recap_project_id` (uuid)
  - `rating` (integer) - 1-5
  - `feedback_text` (text)
  - `improvement_suggestions` (jsonb)
  - `created_at` (timestamptz)
  
  ## אבטחה
  - הפעלת RLS על כל הטבלאות
  - מדיניות גישה מבוססת משתמש
*/

-- טבלת מטא-דאטה לסרטים וסדרות
CREATE TABLE IF NOT EXISTS movies_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  genre text,
  description text,
  imdb_id text,
  youtube_trailer_url text,
  external_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE movies_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read movie metadata"
  ON movies_metadata FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create movie metadata"
  ON movies_metadata FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- טבלת פרויקטי סיכום
CREATE TABLE IF NOT EXISTS recap_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  movie_metadata_id uuid REFERENCES movies_metadata(id),
  video_file_name text NOT NULL,
  video_size bigint NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 30,
  interval_seconds integer NOT NULL DEFAULT 8,
  capture_seconds integer NOT NULL DEFAULT 1,
  total_clips integer GENERATED ALWAYS AS (
    CASE 
      WHEN interval_seconds > 0 THEN duration_seconds / interval_seconds
      ELSE 0
    END
  ) STORED,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  output_video_url text,
  generated_script text,
  error_message text,
  processing_metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recap_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON recap_projects FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can create own projects"
  ON recap_projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can update own projects"
  ON recap_projects FOR UPDATE
  TO authenticated
  USING (user_id = current_setting('request.jwt.claim.sub', true))
  WITH CHECK (user_id = current_setting('request.jwt.claim.sub', true));

-- טבלת מקורות למידה מיוטיוב
CREATE TABLE IF NOT EXISTS youtube_learning_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL,
  channel_name text,
  video_id text NOT NULL UNIQUE,
  video_title text,
  style_patterns jsonb DEFAULT '{}'::jsonb,
  editing_patterns jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE youtube_learning_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read youtube sources"
  ON youtube_learning_sources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can add youtube sources"
  ON youtube_learning_sources FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- טבלת מודלי למידה
CREATE TABLE IF NOT EXISTS learning_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL UNIQUE,
  training_data jsonb DEFAULT '{}'::jsonb,
  performance_metrics jsonb DEFAULT '{}'::jsonb,
  style_weights jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE learning_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active models"
  ON learning_models FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "System can manage models"
  ON learning_models FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- טבלת מטמון חיפוש אינטרנט
CREATE TABLE IF NOT EXISTS web_search_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL UNIQUE,
  search_results jsonb NOT NULL,
  cached_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

ALTER TABLE web_search_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cache"
  ON web_search_cache FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "System can manage cache"
  ON web_search_cache FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- טבלת משוב משתמשים
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recap_project_id uuid REFERENCES recap_projects(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  improvement_suggestions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback for own projects"
  ON user_feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recap_projects
      WHERE recap_projects.id = user_feedback.recap_project_id
      AND recap_projects.user_id = current_setting('request.jwt.claim.sub', true)
    )
  );

CREATE POLICY "Users can create feedback"
  ON user_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recap_projects
      WHERE recap_projects.id = user_feedback.recap_project_id
    )
  );

-- אינדקסים לשיפור ביצועים
CREATE INDEX IF NOT EXISTS idx_recap_projects_user_id ON recap_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_recap_projects_status ON recap_projects(status);
CREATE INDEX IF NOT EXISTS idx_youtube_sources_video_id ON youtube_learning_sources(video_id);
CREATE INDEX IF NOT EXISTS idx_web_search_cache_query ON web_search_cache(query);
CREATE INDEX IF NOT EXISTS idx_web_search_cache_expires ON web_search_cache(expires_at);

-- פונקציה לעדכון updated_at אוטומטי
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recap_projects_updated_at
  BEFORE UPDATE ON recap_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();