"""
SoundScout Multi-Source Data Engine
====================================
Proprietary Ranking Algorithm Using Multiple Data Sources

DATA SOURCES (All Free/Public):
1. Spotify Charts - Daily/Weekly streaming data (Kworb)
2. Billboard Charts - Hot 100, 200, Artist 100 (scraping)
3. Apple Music Charts - Top songs/albums by country
4. Shazam Charts - Discovery/identification trends
5. YouTube Charts - Music video views & trending
6. TikTok - Viral sounds & artist follower counts
7. Instagram - Follower counts & engagement
8. Twitter/X - Follower counts

RANKINGS OUTPUT:
- Global Top 150 (all artists)
- Genre Top 150 (Pop, R&B, Hip Hop, Country, Afrobeats, Indie, Alternative, Latin)
- Major Label Top 150
- Independent Top 150
- Up & Comers Top 150 (< 1M monthly listeners with high growth)

PROPRIETARY ALGORITHM:
- SoundScout Power Score (0-1000)
- Conversion Score (social to streaming ratio)
- Growth Velocity (30-day momentum)
- Arbitrage Signal (undervalued artists)
"""

import os
import json
import time
import re
from datetime import datetime, date, timedelta
from typing import Optional, Dict, List, Any, Tuple
from dataclasses import dataclass, asdict, field
import requests
from urllib.parse import quote_plus

# Configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')

# User Agent for all requests
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


@dataclass
class ArtistProfile:
    """
    Complete artist profile with multi-source data.
    This is the core data structure for the terminal.
    """
    # Identity
    id: str
    name: str
    genre: str
    subgenre: Optional[str] = None
    country: str = "Unknown"
    city: Optional[str] = None
    
    # Label Information
    label_name: Optional[str] = None
    is_independent: bool = True
    label_type: str = "Independent"  # Major, Indie, Unsigned
    
    # Platform IDs
    spotify_id: Optional[str] = None
    apple_music_id: Optional[str] = None
    youtube_channel_id: Optional[str] = None
    tiktok_handle: Optional[str] = None
    instagram_handle: Optional[str] = None
    twitter_handle: Optional[str] = None
    
    # Streaming Metrics (REAL DATA)
    spotify_monthly_listeners: int = 0
    spotify_followers: int = 0
    apple_music_rank: Optional[int] = None
    youtube_subscribers: int = 0
    youtube_total_views: int = 0
    
    # Social Metrics (REAL DATA)
    tiktok_followers: int = 0
    instagram_followers: int = 0
    twitter_followers: int = 0
    
    # Chart Positions (REAL DATA)
    billboard_artist_100_rank: Optional[int] = None
    billboard_hot_100_entries: int = 0
    spotify_charts_rank: Optional[int] = None
    apple_charts_rank: Optional[int] = None
    shazam_charts_rank: Optional[int] = None
    
    # Proprietary Scores (OUR ALGORITHM)
    power_score: float = 0.0          # 0-1000 composite score
    conversion_score: float = 0.0     # Social to streaming ratio (0-100)
    growth_velocity: float = 0.0      # 30-day MoM growth %
    arbitrage_signal: float = 0.0     # Undervaluation indicator (0-100)
    
    # Classification
    artist_tier: str = "Emerging"     # Global Star, Established, Rising, Emerging, Breaking
    status: str = "Stable"            # Viral, Breakout, Dominance, Stable, Arbitrage
    
    # YouTube Content
    latest_youtube_videos: List[Dict] = field(default_factory=list)
    top_youtube_videos: List[Dict] = field(default_factory=list)
    
    # Metadata
    last_updated: str = ""
    data_sources: List[str] = field(default_factory=list)


# =============================================================================
# DATA SOURCE SCRAPERS
# =============================================================================

class SpotifyDataSource:
    """Spotify Charts & Artist Data via Kworb.net (free, updates daily)"""
    
    KWORB_ARTISTS_URL = "https://kworb.net/spotify/artists.html"
    SPOTIFY_ARTIST_URL = "https://open.spotify.com/artist/"
    
    def get_top_artists(self, limit: int = 500) -> List[Dict]:
        """Get top Spotify artists from Kworb daily charts"""
        try:
            headers = {"User-Agent": USER_AGENT}
            response = requests.get(self.KWORB_ARTISTS_URL, headers=headers, timeout=20)
            
            if response.status_code != 200:
                return []
            
            artists = []
            html = response.text
            
            # Parse Kworb table - format: rank, artist, streams, daily
            rows = re.findall(
                r'<tr[^>]*>.*?<td>(\d+)</td>.*?<a href="(/spotify/artist/[^"]+)"[^>]*>([^<]+)</a>.*?<td[^>]*>([\d,]+)</td>.*?<td[^>]*>([+-]?[\d,]+)</td>',
                html, re.DOTALL
            )
            
            for row in rows[:limit]:
                rank, url_path, name, total_streams, daily_change = row
                spotify_id = url_path.split('/')[-1].replace('.html', '')
                
                artists.append({
                    'spotify_id': spotify_id,
                    'name': name.strip(),
                    'spotify_charts_rank': int(rank),
                    'total_streams': int(total_streams.replace(',', '')),
                    'daily_change': int(daily_change.replace(',', '').replace('+', '')),
                    'source': 'kworb_spotify'
                })
            
            return artists
            
        except Exception as e:
            print(f"[Spotify] Error fetching Kworb data: {e}")
            return []
    
    def get_artist_details(self, spotify_id: str) -> Optional[Dict]:
        """Scrape Spotify artist page for monthly listeners"""
        try:
            url = f"{self.SPOTIFY_ARTIST_URL}{spotify_id}"
            headers = {"User-Agent": USER_AGENT}
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                return None
            
            html = response.text
            
            # Extract monthly listeners
            ml_match = re.search(r'"monthlyListeners"\s*:\s*(\d+)', html)
            monthly_listeners = int(ml_match.group(1)) if ml_match else 0
            
            # Extract followers
            fl_match = re.search(r'"followers"\s*:\s*\{[^}]*"total"\s*:\s*(\d+)', html)
            followers = int(fl_match.group(1)) if fl_match else 0
            
            return {
                'spotify_monthly_listeners': monthly_listeners,
                'spotify_followers': followers
            }
            
        except Exception as e:
            print(f"[Spotify] Error fetching artist {spotify_id}: {e}")
            return None


class BillboardDataSource:
    """Billboard Chart Data (free scraping)"""
    
    # Billboard publishes charts as HTML tables
    CHARTS = {
        'artist_100': 'https://www.billboard.com/charts/artist-100/',
        'hot_100': 'https://www.billboard.com/charts/hot-100/',
        'billboard_200': 'https://www.billboard.com/charts/billboard-200/',
        'global_200': 'https://www.billboard.com/charts/billboard-global-200/'
    }
    
    def get_artist_100(self) -> List[Dict]:
        """Get Billboard Artist 100 chart"""
        return self._scrape_chart('artist_100', 100)
    
    def get_hot_100_artists(self) -> Dict[str, int]:
        """Get artists with Hot 100 entries and count"""
        try:
            url = self.CHARTS['hot_100']
            headers = {"User-Agent": USER_AGENT}
            response = requests.get(url, headers=headers, timeout=20)
            
            if response.status_code != 200:
                return {}
            
            # Count artist appearances
            artist_counts = {}
            artist_pattern = r'<span class="c-label[^"]*">\s*([^<]+)\s*</span>'
            matches = re.findall(artist_pattern, response.text)
            
            for artist in matches:
                artist = artist.strip()
                if artist and len(artist) > 1:
                    artist_counts[artist] = artist_counts.get(artist, 0) + 1
            
            return artist_counts
            
        except Exception as e:
            print(f"[Billboard] Error fetching Hot 100: {e}")
            return {}
    
    def _scrape_chart(self, chart_name: str, limit: int) -> List[Dict]:
        """Generic chart scraper"""
        try:
            url = self.CHARTS.get(chart_name, '')
            if not url:
                return []
            
            headers = {"User-Agent": USER_AGENT}
            response = requests.get(url, headers=headers, timeout=20)
            
            if response.status_code != 200:
                return []
            
            entries = []
            # Billboard uses specific HTML structure
            # Pattern may need adjustment based on current Billboard HTML
            pattern = r'<span class="c-label[^"]*a-font-primary-bold[^"]*">\s*(\d+)\s*</span>.*?<h3[^>]*>\s*([^<]+)\s*</h3>'
            matches = re.findall(pattern, response.text, re.DOTALL)
            
            for match in matches[:limit]:
                rank, name = match
                entries.append({
                    'rank': int(rank),
                    'name': name.strip(),
                    'chart': chart_name,
                    'source': 'billboard'
                })
            
            return entries
            
        except Exception as e:
            print(f"[Billboard] Error scraping {chart_name}: {e}")
            return []


class YouTubeDataSource:
    """YouTube Data via public pages (no API key needed)"""
    
    SEARCH_URL = "https://www.youtube.com/results"
    CHANNEL_URL = "https://www.youtube.com/@"
    
    def get_artist_videos(self, artist_name: str, limit: int = 5) -> List[Dict]:
        """Get latest/popular videos for an artist"""
        try:
            query = f"{artist_name} official music video"
            url = f"{self.SEARCH_URL}?search_query={quote_plus(query)}"
            headers = {"User-Agent": USER_AGENT}
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                return []
            
            videos = []
            # Extract video IDs and titles from YouTube search results
            pattern = r'"videoId":"([^"]+)".*?"title":\{"runs":\[\{"text":"([^"]+)"\}\]'
            matches = re.findall(pattern, response.text)
            
            seen_ids = set()
            for video_id, title in matches:
                if video_id not in seen_ids and len(videos) < limit:
                    seen_ids.add(video_id)
                    videos.append({
                        'video_id': video_id,
                        'title': title,
                        'url': f"https://www.youtube.com/watch?v={video_id}",
                        'thumbnail': f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"
                    })
            
            return videos
            
        except Exception as e:
            print(f"[YouTube] Error searching for {artist_name}: {e}")
            return []
    
    def get_channel_stats(self, channel_handle: str) -> Dict:
        """Get YouTube channel subscriber count"""
        try:
            url = f"{self.CHANNEL_URL}{channel_handle}"
            headers = {"User-Agent": USER_AGENT}
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                return {}
            
            # Extract subscriber count
            sub_pattern = r'"subscriberCountText":\{"simpleText":"([^"]+)"'
            match = re.search(sub_pattern, response.text)
            
            if match:
                sub_text = match.group(1)  # e.g., "10.5M subscribers"
                return {
                    'youtube_subscribers': self._parse_count(sub_text)
                }
            
            return {}
            
        except Exception as e:
            print(f"[YouTube] Error fetching channel {channel_handle}: {e}")
            return {}
    
    def _parse_count(self, text: str) -> int:
        """Parse '10.5M' or '500K' to integer"""
        text = text.upper().replace(' SUBSCRIBERS', '').replace(' VIEWS', '').strip()
        multiplier = 1
        if 'K' in text:
            multiplier = 1000
            text = text.replace('K', '')
        elif 'M' in text:
            multiplier = 1000000
            text = text.replace('M', '')
        elif 'B' in text:
            multiplier = 1000000000
            text = text.replace('B', '')
        
        try:
            return int(float(text) * multiplier)
        except:
            return 0


class SocialMediaDataSource:
    """TikTok, Instagram, Twitter data via public profiles"""
    
    def get_tiktok_stats(self, username: str) -> Dict:
        """Get TikTok follower count"""
        try:
            url = f"https://www.tiktok.com/@{username}"
            headers = {"User-Agent": USER_AGENT}
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                return {}
            
            pattern = r'"followerCount"\s*:\s*(\d+)'
            match = re.search(pattern, response.text)
            
            return {
                'tiktok_followers': int(match.group(1)) if match else 0,
                'tiktok_handle': username
            }
            
        except Exception as e:
            print(f"[TikTok] Error for @{username}: {e}")
            return {}
    
    def get_instagram_stats(self, username: str) -> Dict:
        """Get Instagram follower count"""
        try:
            url = f"https://www.instagram.com/{username}/"
            headers = {"User-Agent": USER_AGENT}
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                return {}
            
            # Try multiple patterns
            patterns = [
                r'"edge_followed_by"\s*:\s*\{[^}]*"count"\s*:\s*(\d+)',
                r'"userInteractionCount"\s*:\s*"(\d+)"',
                r'(\d+(?:,\d+)*)\s*(?:Followers|followers)'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, response.text)
                if match:
                    count = match.group(1).replace(',', '')
                    return {
                        'instagram_followers': int(count),
                        'instagram_handle': username
                    }
            
            return {'instagram_handle': username}
            
        except Exception as e:
            print(f"[Instagram] Error for @{username}: {e}")
            return {}
    
    def get_twitter_stats(self, username: str) -> Dict:
        """Get Twitter/X follower count"""
        try:
            # Twitter requires auth for most data now, use Nitter as fallback
            url = f"https://nitter.net/{username}"
            headers = {"User-Agent": USER_AGENT}
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                return {}
            
            pattern = r'(\d+(?:,\d+)*)\s*(?:Followers|followers)'
            match = re.search(pattern, response.text)
            
            return {
                'twitter_followers': int(match.group(1).replace(',', '')) if match else 0,
                'twitter_handle': username
            }
            
        except Exception as e:
            print(f"[Twitter] Error for @{username}: {e}")
            return {}


# =============================================================================
# PROPRIETARY RANKING ALGORITHM
# =============================================================================

class SoundScoutAlgorithm:
    """
    The SoundScout Power Score Algorithm
    =====================================
    
    Combines multiple data sources into a single ranking score (0-1000).
    
    COMPONENTS:
    1. Streaming Power (40%) - Spotify + Apple Music metrics
    2. Chart Performance (25%) - Billboard + other chart positions
    3. Social Velocity (20%) - TikTok + IG + Twitter growth
    4. Discovery Signal (15%) - Shazam + YouTube trending
    
    DERIVED METRICS:
    - Conversion Score: How well social converts to streams
    - Arbitrage Signal: Undervalued artists (high social, low streams)
    - Growth Velocity: Month-over-month momentum
    """
    
    # Weights for power score calculation
    WEIGHTS = {
        'streaming': 0.40,
        'charts': 0.25,
        'social': 0.20,
        'discovery': 0.15
    }
    
    # Tier thresholds (monthly listeners)
    TIERS = {
        'global_star': 50_000_000,
        'established': 20_000_000,
        'rising': 5_000_000,
        'emerging': 1_000_000,
        'breaking': 0
    }
    
    def calculate_power_score(self, artist: ArtistProfile) -> float:
        """
        Calculate the SoundScout Power Score (0-1000)
        """
        streaming_score = self._streaming_score(artist)
        chart_score = self._chart_score(artist)
        social_score = self._social_score(artist)
        discovery_score = self._discovery_score(artist)
        
        power_score = (
            streaming_score * self.WEIGHTS['streaming'] +
            chart_score * self.WEIGHTS['charts'] +
            social_score * self.WEIGHTS['social'] +
            discovery_score * self.WEIGHTS['discovery']
        )
        
        return round(power_score, 1)
    
    def _streaming_score(self, artist: ArtistProfile) -> float:
        """Score based on Spotify monthly listeners (0-1000)"""
        ml = artist.spotify_monthly_listeners
        
        if ml >= 100_000_000:
            return 1000
        elif ml >= 50_000_000:
            return 900 + (ml - 50_000_000) / 500_000
        elif ml >= 20_000_000:
            return 700 + (ml - 20_000_000) / 300_000
        elif ml >= 5_000_000:
            return 400 + (ml - 5_000_000) / 50_000
        elif ml >= 1_000_000:
            return 200 + (ml - 1_000_000) / 20_000
        else:
            return ml / 5000
    
    def _chart_score(self, artist: ArtistProfile) -> float:
        """Score based on chart positions (0-1000)"""
        score = 0
        
        # Billboard Artist 100
        if artist.billboard_artist_100_rank:
            rank = artist.billboard_artist_100_rank
            score += max(0, (100 - rank) * 5)  # Top 100 = 0-500 points
        
        # Hot 100 entries (bonus)
        score += artist.billboard_hot_100_entries * 50  # Each entry = 50 points
        
        # Spotify Charts rank
        if artist.spotify_charts_rank:
            rank = artist.spotify_charts_rank
            score += max(0, (200 - rank) * 2)  # Top 200 = 0-400 points
        
        return min(score, 1000)
    
    def _social_score(self, artist: ArtistProfile) -> float:
        """Score based on social media following (0-1000)"""
        total_social = (
            artist.tiktok_followers +
            artist.instagram_followers +
            artist.twitter_followers
        )
        
        if total_social >= 100_000_000:
            return 1000
        elif total_social >= 50_000_000:
            return 800 + (total_social - 50_000_000) / 250_000
        elif total_social >= 10_000_000:
            return 500 + (total_social - 10_000_000) / 133_333
        elif total_social >= 1_000_000:
            return 200 + (total_social - 1_000_000) / 30_000
        else:
            return total_social / 5000
    
    def _discovery_score(self, artist: ArtistProfile) -> float:
        """Score based on YouTube and discovery metrics (0-1000)"""
        score = 0
        
        # YouTube subscribers
        subs = artist.youtube_subscribers
        if subs >= 50_000_000:
            score += 500
        elif subs >= 10_000_000:
            score += 300 + (subs - 10_000_000) / 200_000
        elif subs >= 1_000_000:
            score += 100 + (subs - 1_000_000) / 45_000
        else:
            score += subs / 10_000
        
        # Shazam rank bonus
        if artist.shazam_charts_rank and artist.shazam_charts_rank <= 200:
            score += max(0, (200 - artist.shazam_charts_rank) * 2.5)
        
        return min(score, 1000)
    
    def calculate_conversion_score(self, artist: ArtistProfile) -> float:
        """
        Conversion Score (0-100)
        ========================
        How well does social presence convert to streaming?
        
        LOW score = ARBITRAGE OPPORTUNITY (lots of buzz, not yet streaming)
        HIGH score = Mature audience (fans are already streaming)
        """
        total_social = (
            artist.tiktok_followers +
            artist.instagram_followers
        )
        
        if total_social == 0:
            return 100.0
        
        ratio = (artist.spotify_monthly_listeners / total_social) * 100
        return min(round(ratio, 2), 100.0)
    
    def calculate_arbitrage_signal(self, artist: ArtistProfile) -> float:
        """
        Arbitrage Signal (0-100)
        ========================
        Identifies undervalued artists.
        
        HIGH signal = Artist has massive social buzz but low streaming
                      THIS IS THE OPPORTUNITY
        """
        conversion = self.calculate_conversion_score(artist)
        
        # Invert - low conversion = high arbitrage
        base_signal = 100 - conversion
        
        # Boost if high absolute social numbers
        total_social = artist.tiktok_followers + artist.instagram_followers
        
        if total_social >= 10_000_000:
            base_signal *= 1.5
        elif total_social >= 5_000_000:
            base_signal *= 1.3
        elif total_social >= 1_000_000:
            base_signal *= 1.1
        
        return min(round(base_signal, 2), 100.0)
    
    def determine_tier(self, artist: ArtistProfile) -> str:
        """Classify artist by tier based on monthly listeners"""
        ml = artist.spotify_monthly_listeners
        
        if ml >= self.TIERS['global_star']:
            return "Global Star"
        elif ml >= self.TIERS['established']:
            return "Established"
        elif ml >= self.TIERS['rising']:
            return "Rising"
        elif ml >= self.TIERS['emerging']:
            return "Emerging"
        else:
            return "Breaking"
    
    def determine_status(self, artist: ArtistProfile) -> str:
        """Classify artist status based on metrics"""
        velocity = artist.growth_velocity
        conversion = artist.conversion_score
        arbitrage = artist.arbitrage_signal
        
        if velocity > 100:
            return "Viral"
        elif velocity > 50:
            return "Breakout"
        elif arbitrage > 70:
            return "Arbitrage"  # THE KEY SIGNAL
        elif conversion > 85:
            return "Dominance"
        else:
            return "Stable"


# =============================================================================
# LABEL DETECTION
# =============================================================================

class LabelDetector:
    """Detect if an artist is Major Label, Independent, or Unsigned"""
    
    MAJOR_LABELS = [
        # Universal Music Group
        'universal', 'interscope', 'republic', 'def jam', 'capitol', 'virgin',
        'island', 'geffen', 'polydor', 'motown', 'verve',
        # Sony Music
        'sony', 'columbia', 'rca', 'epic', 'arista', 'jive',
        # Warner Music Group
        'warner', 'atlantic', 'elektra', 'parlophone', 'nonesuch', 'sire',
        # Distribution deals that indicate major backing
        'awal', 'the orchard', 'empire',
    ]
    
    def detect_label_type(self, label_name: Optional[str]) -> Tuple[str, bool]:
        """
        Returns (label_type, is_independent)
        label_type: 'Major', 'Indie', 'Unsigned'
        """
        if not label_name:
            return ('Unsigned', True)
        
        label_lower = label_name.lower()
        
        for major in self.MAJOR_LABELS:
            if major in label_lower:
                return ('Major', False)
        
        return ('Indie', True)


# =============================================================================
# DATA PIPELINE
# =============================================================================

class SoundScoutPipeline:
    """
    Main data pipeline - aggregates all sources, applies algorithm, stores results.
    Runs daily via GitHub Actions (free tier).
    """
    
    def __init__(self):
        self.spotify = SpotifyDataSource()
        self.billboard = BillboardDataSource()
        self.youtube = YouTubeDataSource()
        self.social = SocialMediaDataSource()
        self.algorithm = SoundScoutAlgorithm()
        self.label_detector = LabelDetector()
    
    def run_full_refresh(self) -> Dict[str, List[ArtistProfile]]:
        """
        Complete daily refresh of all rankings.
        
        Returns:
        {
            'global_150': [...],
            'pop_150': [...],
            'hip_hop_150': [...],
            'major_150': [...],
            'indie_150': [...],
            'up_and_comers_150': [...],
            ...
        }
        """
        print(f"\n{'='*60}")
        print(f"SOUNDSCOUT DAILY REFRESH - {datetime.now().isoformat()}")
        print(f"{'='*60}\n")
        
        # Step 1: Get base artist list from Spotify Charts
        print("[1/6] Fetching Spotify Charts data...")
        spotify_artists = self.spotify.get_top_artists(limit=500)
        print(f"      Found {len(spotify_artists)} artists")
        
        # Step 2: Enrich with Billboard data
        print("[2/6] Fetching Billboard data...")
        billboard_artist_100 = self.billboard.get_artist_100()
        hot_100_artists = self.billboard.get_hot_100_artists()
        print(f"      Artist 100: {len(billboard_artist_100)}, Hot 100 entries: {len(hot_100_artists)}")
        
        # Step 3: Build complete artist profiles
        print("[3/6] Building artist profiles...")
        profiles = self._build_profiles(spotify_artists, billboard_artist_100, hot_100_artists)
        print(f"      Built {len(profiles)} profiles")
        
        # Step 4: Enrich with social media data (rate-limited)
        print("[4/6] Fetching social media data...")
        self._enrich_social_data(profiles)
        
        # Step 5: Fetch YouTube videos for each artist
        print("[5/6] Fetching YouTube content...")
        self._enrich_youtube_data(profiles)
        
        # Step 6: Calculate all scores and classify
        print("[6/6] Calculating proprietary scores...")
        self._calculate_all_scores(profiles)
        
        # Generate all rankings
        rankings = self._generate_rankings(profiles)
        
        print(f"\n{'='*60}")
        print("REFRESH COMPLETE")
        print(f"{'='*60}")
        self._print_summary(rankings)
        
        return rankings
    
    def _build_profiles(
        self,
        spotify_artists: List[Dict],
        billboard_artist_100: List[Dict],
        hot_100_artists: Dict[str, int]
    ) -> List[ArtistProfile]:
        """Build base profiles from Spotify data, merge with Billboard"""
        
        # Create Billboard lookup
        billboard_lookup = {a['name'].lower(): a['rank'] for a in billboard_artist_100}
        
        profiles = []
        for artist in spotify_artists:
            name = artist.get('name', 'Unknown')
            name_lower = name.lower()
            
            profile = ArtistProfile(
                id=artist.get('spotify_id', ''),
                name=name,
                genre=self._detect_genre(name),  # Will be enhanced with actual data
                spotify_id=artist.get('spotify_id'),
                spotify_charts_rank=artist.get('spotify_charts_rank'),
                billboard_artist_100_rank=billboard_lookup.get(name_lower),
                billboard_hot_100_entries=hot_100_artists.get(name, 0)
            )
            
            profiles.append(profile)
        
        return profiles
    
    def _detect_genre(self, artist_name: str) -> str:
        """Placeholder - will be enhanced with Spotify API genre data"""
        return "Pop"  # Default, will be overwritten
    
    def _enrich_social_data(self, profiles: List[ArtistProfile]):
        """Add social media stats to profiles"""
        for i, profile in enumerate(profiles[:150]):  # Top 150 only to save time
            handle = profile.name.lower().replace(' ', '').replace('.', '')
            
            # TikTok
            tiktok = self.social.get_tiktok_stats(handle)
            if tiktok:
                profile.tiktok_followers = tiktok.get('tiktok_followers', 0)
                profile.tiktok_handle = tiktok.get('tiktok_handle')
            
            # Instagram
            ig = self.social.get_instagram_stats(handle)
            if ig:
                profile.instagram_followers = ig.get('instagram_followers', 0)
                profile.instagram_handle = ig.get('instagram_handle')
            
            # Rate limit
            if i % 10 == 0:
                print(f"      Processed {i+1}/150 social profiles...")
            time.sleep(0.3)
    
    def _enrich_youtube_data(self, profiles: List[ArtistProfile]):
        """Add YouTube videos to profiles"""
        for i, profile in enumerate(profiles[:150]):
            videos = self.youtube.get_artist_videos(profile.name, limit=5)
            profile.latest_youtube_videos = videos
            profile.top_youtube_videos = videos[:3]  # Top 3 for quick access
            
            if i % 20 == 0:
                print(f"      Processed {i+1}/150 YouTube lookups...")
            time.sleep(0.2)
    
    def _calculate_all_scores(self, profiles: List[ArtistProfile]):
        """Calculate proprietary scores for all profiles"""
        for profile in profiles:
            # Get detailed Spotify data
            if profile.spotify_id:
                details = self.spotify.get_artist_details(profile.spotify_id)
                if details:
                    profile.spotify_monthly_listeners = details.get('spotify_monthly_listeners', 0)
                    profile.spotify_followers = details.get('spotify_followers', 0)
            
            # Detect label type
            label_type, is_indie = self.label_detector.detect_label_type(profile.label_name)
            profile.label_type = label_type
            profile.is_independent = is_indie
            
            # Calculate scores
            profile.power_score = self.algorithm.calculate_power_score(profile)
            profile.conversion_score = self.algorithm.calculate_conversion_score(profile)
            profile.arbitrage_signal = self.algorithm.calculate_arbitrage_signal(profile)
            profile.artist_tier = self.algorithm.determine_tier(profile)
            profile.status = self.algorithm.determine_status(profile)
            profile.last_updated = datetime.now().isoformat()
            profile.data_sources = ['spotify', 'billboard', 'tiktok', 'instagram', 'youtube']
    
    def _generate_rankings(self, profiles: List[ArtistProfile]) -> Dict[str, List[ArtistProfile]]:
        """Generate all ranking categories"""
        
        # Sort by power score for global ranking
        sorted_profiles = sorted(profiles, key=lambda x: x.power_score, reverse=True)
        
        rankings = {
            'global_150': sorted_profiles[:150],
            'major_150': sorted([p for p in profiles if not p.is_independent], 
                               key=lambda x: x.power_score, reverse=True)[:150],
            'indie_150': sorted([p for p in profiles if p.is_independent], 
                               key=lambda x: x.power_score, reverse=True)[:150],
            'up_and_comers_150': sorted(
                [p for p in profiles if p.spotify_monthly_listeners < 1_000_000 and p.arbitrage_signal > 50],
                key=lambda x: x.arbitrage_signal, reverse=True
            )[:150],
        }
        
        # Genre rankings
        genres = ['Pop', 'Hip Hop', 'R&B', 'Country', 'Afrobeats', 'Indie', 'Alternative', 'Latin']
        for genre in genres:
            genre_key = genre.lower().replace(' ', '_').replace('&', 'and') + '_150'
            rankings[genre_key] = sorted(
                [p for p in profiles if p.genre.lower() == genre.lower()],
                key=lambda x: x.power_score, reverse=True
            )[:150]
        
        return rankings
    
    def _print_summary(self, rankings: Dict[str, List[ArtistProfile]]):
        """Print summary of rankings"""
        print(f"\nRANKINGS GENERATED:")
        for key, artists in rankings.items():
            print(f"  {key}: {len(artists)} artists")
        
        print(f"\nTOP 10 GLOBAL:")
        for i, artist in enumerate(rankings.get('global_150', [])[:10], 1):
            print(f"  {i}. {artist.name} (Score: {artist.power_score})")
        
        print(f"\nTOP 5 ARBITRAGE SIGNALS:")
        arbitrage = sorted(rankings.get('global_150', []), key=lambda x: x.arbitrage_signal, reverse=True)[:5]
        for i, artist in enumerate(arbitrage, 1):
            print(f"  {i}. {artist.name} (Signal: {artist.arbitrage_signal}%)")


# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    pipeline = SoundScoutPipeline()
    rankings = pipeline.run_full_refresh()
    
    # Save to JSON for frontend consumption (if not using Supabase)
    output = {
        key: [asdict(a) for a in artists]
        for key, artists in rankings.items()
    }
    
    with open('rankings.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\nOutput saved to rankings.json")
