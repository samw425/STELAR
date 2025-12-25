-- ============================================================================
-- SOUNDSCOUT DATABASE SCHEMA
-- Complete A&R Intelligence Platform
-- ============================================================================
-- Target: Supabase (PostgreSQL)
-- Free Tier: 500MB storage, 2GB bandwidth
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Artists Master Table
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identity
    name TEXT NOT NULL,
    slug TEXT UNIQUE, -- URL-safe name
    genre TEXT NOT NULL,
    subgenre TEXT,
    country TEXT,
    city TEXT,
    bio TEXT,
    image_url TEXT,
    
    -- Label Information
    label_name TEXT,
    label_type TEXT DEFAULT 'Unsigned', -- 'Major', 'Indie', 'Unsigned'
    is_independent BOOLEAN DEFAULT TRUE,
    
    -- Platform IDs (for linking to external profiles)
    spotify_id TEXT UNIQUE,
    apple_music_id TEXT,
    youtube_channel_id TEXT,
    tiktok_handle TEXT,
    instagram_handle TEXT,
    twitter_handle TEXT,
    soundcloud_handle TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Stats (Historical tracking for growth velocity)
CREATE TABLE daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    
    -- Streaming Metrics (REAL DATA)
    spotify_monthly_listeners BIGINT DEFAULT 0,
    spotify_followers BIGINT DEFAULT 0,
    spotify_streams_daily BIGINT DEFAULT 0,
    apple_music_plays BIGINT DEFAULT 0,
    
    -- Social Metrics (REAL DATA)
    tiktok_followers BIGINT DEFAULT 0,
    instagram_followers BIGINT DEFAULT 0,
    twitter_followers BIGINT DEFAULT 0,
    youtube_subscribers BIGINT DEFAULT 0,
    youtube_total_views BIGINT DEFAULT 0,
    
    -- Chart Positions (REAL DATA)
    spotify_charts_rank INT,
    billboard_artist_100_rank INT,
    billboard_hot_100_entries INT DEFAULT 0,
    apple_charts_rank INT,
    shazam_charts_rank INT,
    
    -- PROPRIETARY SCORES (Our Algorithm)
    power_score FLOAT DEFAULT 0.0,        -- 0-1000 composite score
    conversion_score FLOAT DEFAULT 0.0,   -- Social to streaming ratio (0-100)
    arbitrage_signal FLOAT DEFAULT 0.0,   -- Undervaluation indicator (0-100)
    
    -- Metadata
    data_sources TEXT[], -- ['spotify', 'billboard', 'tiktok', etc.]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one entry per artist per day
    UNIQUE(artist_id, date)
);

-- Rankings Table (Pre-computed daily rankings)
CREATE TABLE rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE DEFAULT CURRENT_DATE,
    
    -- Category
    category TEXT NOT NULL, -- 'global', 'pop', 'hip_hop', 'major', 'indie', 'up_and_comers', etc.
    
    -- Ranking Data (JSON array of ranked artists)
    -- Format: [{ rank: 1, artist_id: '...', power_score: 850.5, ... }, ...]
    rankings JSONB NOT NULL,
    
    -- Metadata
    total_artists INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One ranking per category per day
    UNIQUE(category, date)
);

-- YouTube Videos (Cached for artist profiles)
CREATE TABLE youtube_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    
    video_id TEXT NOT NULL,
    title TEXT,
    thumbnail_url TEXT,
    view_count BIGINT DEFAULT 0,
    publish_date DATE,
    video_type TEXT, -- 'music_video', 'lyric_video', 'live', 'interview'
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(artist_id, video_id)
);

-- Genre Definitions
CREATE TABLE genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_genre_id UUID REFERENCES genres(id),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Artist lookups
CREATE INDEX idx_artists_genre ON artists(genre);
CREATE INDEX idx_artists_country ON artists(country);
CREATE INDEX idx_artists_label_type ON artists(label_type);
CREATE INDEX idx_artists_is_independent ON artists(is_independent);
CREATE INDEX idx_artists_spotify_id ON artists(spotify_id);

-- Stats lookups
CREATE INDEX idx_stats_date ON daily_stats(date DESC);
CREATE INDEX idx_stats_artist_date ON daily_stats(artist_id, date DESC);
CREATE INDEX idx_stats_power_score ON daily_stats(power_score DESC);
CREATE INDEX idx_stats_arbitrage ON daily_stats(arbitrage_signal DESC);

-- Rankings lookups
CREATE INDEX idx_rankings_category_date ON rankings(category, date DESC);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Latest stats for each artist (most recent entry)
CREATE OR REPLACE VIEW artist_latest_stats AS
SELECT DISTINCT ON (artist_id) *
FROM daily_stats
ORDER BY artist_id, date DESC;

-- Global Top 150 (current)
CREATE OR REPLACE VIEW global_top_150 AS
SELECT 
    a.*,
    s.spotify_monthly_listeners,
    s.tiktok_followers,
    s.instagram_followers,
    s.power_score,
    s.conversion_score,
    s.arbitrage_signal,
    s.spotify_charts_rank,
    s.billboard_artist_100_rank
FROM artists a
JOIN artist_latest_stats s ON a.id = s.artist_id
ORDER BY s.power_score DESC
LIMIT 150;

-- Arbitrage Opportunities (high social, low streaming)
CREATE OR REPLACE VIEW arbitrage_opportunities AS
SELECT 
    a.*,
    s.spotify_monthly_listeners,
    s.tiktok_followers,
    s.instagram_followers,
    s.power_score,
    s.conversion_score,
    s.arbitrage_signal
FROM artists a
JOIN artist_latest_stats s ON a.id = s.artist_id
WHERE s.arbitrage_signal > 50
ORDER BY s.arbitrage_signal DESC
LIMIT 150;

-- Up & Comers (< 1M listeners with high growth potential)
CREATE OR REPLACE VIEW up_and_comers AS
SELECT 
    a.*,
    s.spotify_monthly_listeners,
    s.tiktok_followers,
    s.instagram_followers,
    s.power_score,
    s.arbitrage_signal
FROM artists a
JOIN artist_latest_stats s ON a.id = s.artist_id
WHERE s.spotify_monthly_listeners < 1000000
  AND s.arbitrage_signal > 40
ORDER BY s.arbitrage_signal DESC
LIMIT 150;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Calculate growth velocity (30-day MoM)
CREATE OR REPLACE FUNCTION calculate_growth_velocity(p_artist_id UUID)
RETURNS FLOAT AS $$
DECLARE
    current_ml BIGINT;
    previous_ml BIGINT;
    velocity FLOAT;
BEGIN
    -- Get current monthly listeners
    SELECT spotify_monthly_listeners INTO current_ml
    FROM daily_stats
    WHERE artist_id = p_artist_id
    ORDER BY date DESC
    LIMIT 1;
    
    -- Get monthly listeners from 30 days ago
    SELECT spotify_monthly_listeners INTO previous_ml
    FROM daily_stats
    WHERE artist_id = p_artist_id
      AND date <= CURRENT_DATE - INTERVAL '30 days'
    ORDER BY date DESC
    LIMIT 1;
    
    -- Calculate velocity
    IF previous_ml IS NULL OR previous_ml = 0 THEN
        RETURN 0.0;
    END IF;
    
    velocity := ((current_ml - previous_ml)::FLOAT / previous_ml) * 100;
    RETURN ROUND(velocity::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA - Genres
-- ============================================================================

INSERT INTO genres (name, slug, display_order) VALUES
    ('Pop', 'pop', 1),
    ('Hip Hop', 'hip-hop', 2),
    ('R&B', 'r-and-b', 3),
    ('Country', 'country', 4),
    ('Afrobeats', 'afrobeats', 5),
    ('Indie', 'indie', 6),
    ('Alternative', 'alternative', 7),
    ('Latin', 'latin', 8),
    ('Rock', 'rock', 9),
    ('Electronic', 'electronic', 10),
    ('K-Pop', 'k-pop', 11),
    ('Reggaeton', 'reggaeton', 12)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (for Supabase)
-- ============================================================================

-- Enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

-- Public read access (anonymous users can read)
CREATE POLICY "Public read access" ON artists FOR SELECT USING (true);
CREATE POLICY "Public read access" ON daily_stats FOR SELECT USING (true);
CREATE POLICY "Public read access" ON rankings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON youtube_videos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON genres FOR SELECT USING (true);

-- Service role write access (for scraper)
CREATE POLICY "Service write access" ON artists FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write access" ON daily_stats FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write access" ON rankings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write access" ON youtube_videos FOR ALL USING (auth.role() = 'service_role');
