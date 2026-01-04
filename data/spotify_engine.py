import requests
import base64
import time
import os
import json
from datetime import datetime

# ==============================================================================
# SPOTIFY ENGINE v1.0
# "The Truth Source"
# ==============================================================================

class SpotifyEngine:
    def __init__(self, client_id, client_secret):
        self.client_id = client_id
        self.client_secret = client_secret
        self.token = None
        self.token_expiry = 0
        
    def authenticate(self):
        """Get or refresh Bearer Token via Client Credentials Flow"""
        if self.token and time.time() < self.token_expiry:
            return

        auth_str = f"{self.client_id}:{self.client_secret}"
        b64_auth = base64.b64encode(auth_str.encode()).decode()

        headers = {
            'Authorization': f'Basic {b64_auth}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        data = {'grant_type': 'client_credentials'}

        response = requests.post('https://accounts.spotify.com/api/token', headers=headers, data=data)
        if response.status_code != 200:
            raise Exception(f"Spotify Auth Failed: {response.text}")

        json_resp = response.json()
        self.token = json_resp['access_token']
        # Expires in 3600 seconds, buffer by 60s
        self.token_expiry = time.time() + json_resp['expires_in'] - 60
        print("✅ Spotify Authenticated")

    def _get_headers(self):
        self.authenticate()
        return {'Authorization': f'Bearer {self.token}'}

    def get_playlist_tracks(self, playlist_id, limit=50):
        url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks?limit={limit}"
        response = requests.get(url, headers=self._get_headers())
        if response.status_code != 200:
            print(f"❌ Failed to fetch playlist {playlist_id}: {response.text}")
            return []
        
        return [item['track'] for item in response.json()['items'] if item['track']]

    def get_artists_details(self, artist_ids):
        """Batch fetch artist details (Genres, Popularity, Followers)"""
        artists = []
        # Spotify allows max 50 ids per call
        for i in range(0, len(artist_ids), 50):
            chunk = artist_ids[i:i+50]
            ids_str = ",".join(chunk)
            url = f"https://api.spotify.com/v1/artists?ids={ids_str}"
            response = requests.get(url, headers=self._get_headers())
            if response.status_code == 200:
                artists.extend(response.json()['artists'])
        return artists

    def fetch_global_pulse(self):
        """
        Fetches the OFFICIAL Global Top 50
        Playlist ID: 37i9dQZEVXbMDoHDwVN2tF
        """
        print("Fetching Global Top 50...")
        tracks = self.get_playlist_tracks('37i9dQZEVXbMDoHDwVN2tF')
        
        # Extract Artist IDs
        artist_ids = list(set([t['artists'][0]['id'] for t in tracks]))
        artist_details = {a['id']: a for a in self.get_artists_details(artist_ids)}
        
        ranking = []
        for i, track in enumerate(tracks):
            main_artist = track['artists'][0]
            details = artist_details.get(main_artist['id'], {})
            
            # Map to STELAR format
            profile = {
                'rank': i + 1,
                'name': main_artist['name'],
                'spotify_id': main_artist['id'],
                'avatar_url': details.get('images', [{}])[0].get('url'),
                'genres': details.get('genres', []),
                'popularity': details.get('popularity', 0),
                'followers': details.get('followers', {}).get('total', 0),
                'monthlyListeners': details.get('followers', {}).get('total', 0) * 3, # ROUGH ESTIMATE proxy
                'status': 'Superstar' if details.get('popularity', 0) > 85 else 'Viral',
                'powerScore': 1000 - (i * 10) # Simple linear score for Top 50
            }
            ranking.append(profile)
            
        print(f"✅ Pulse Generated: {len(ranking)} artists")
        return ranking

# ==============================================================================
# PROPRIETARY ALGORITHM: STELAR v2.0
# ==============================================================================

class StelarAlgorithm:
    """
    The STELAR Power Score Algorithm
    =====================================
    Combines multiple data sources into a single ranking score (0-1000).
    """
    
    # Weights for power score calculation
    WEIGHTS = {
        'streaming': 0.40,
        'charts': 0.25,
        'social': 0.20,
        'discovery': 0.15
    }
    
    def calculate_power_score(self, artist_profile) -> float:
        """Calculate the STELAR Power Score (0-1000) based on loaded profile"""
        # ... (Simplified logic for the API engine)
        ml = artist_profile.get('monthlyListeners', 0)
        pop = artist_profile.get('popularity', 0)
        followers = artist_profile.get('followers', 0)
        
        # Streaming Score (Approx)
        if ml >= 50_000_000: streaming_score = 900 + (ml / 1_000_000)
        elif ml >= 1_000_000: streaming_score = 500 + (ml / 100_000)
        else: streaming_score = ml / 2000
        
        # Chart/Pop Score
        chart_score = pop * 10 # 0-1000
        
        # Social Score
        social_score = min(followers / 100, 1000)
        
        power_score = (
            streaming_score * 0.4 +
            chart_score * 0.4 +
            social_score * 0.2
        )
        return min(round(power_score, 1), 1000)

    def calculate_arbitrage_signal(self, followers, popularity) -> float:
        """
        Arbitrage Signal (0-100)
        HIGH = High Social (Followers) but Low Streaming (Popularity)
        """
        if popularity == 0: return 0
        
        # Normalize followers (cap at 1M for emerging)
        social_norm = min(followers / 500_000, 1.0) * 100
        stream_norm = popularity # 0-100
        
        # Arbitrage is when Social > Streaming
        diff = social_norm - stream_norm
        return max(0, min(diff * 2, 100))

# ==============================================================================
# DATA ENGINE
# ==============================================================================

    def fetch_launchpad_candidates(self):
        """
        Fetches Viral 50s (US, UK, AU) and Filters for TRUE GEMS
        """
        viral_playlists = [
            '37i9dQZEVXbKuaTI1Z1Afx', # Viral 50 USA
            '37i9dQZEVXbL3DL0kPo8D', # Viral 50 UK
            '37i9dQZEVXbO5MSE9Re4n', # Viral 50 Australia
        ]
        
        all_tracks = []
        for pid in viral_playlists:
            print(f"Fetching Viral Playlist {pid}...")
            all_tracks.extend(self.get_playlist_tracks(pid))
            
        artist_ids = list(set([t['artists'][0]['id'] for t in all_tracks]))
        artist_details = {a['id']: a for a in self.get_artists_details(artist_ids)}
        
        candidates = []
        algo = StelarAlgorithm()

        for track in all_tracks:
            main_artist = track['artists'][0]
            details = artist_details.get(main_artist['id'])
            if not details: continue
            
            # === THE GOLDEN FILTERS (Strict Western Scouting) ===
            pop = details.get('popularity', 0)
            followers = details.get('followers', {}).get('total', 0)
            genres = details.get('genres', [])
            
            # 1. UNDERGROUND ONLY - STRICT
            if pop > 45: continue  # Pass on stars
            if followers > 200000: continue # Pass on established
            
            # 2. GENRE SANITIZATION
            blocked = ['bollywood', 'desi', 'punjabi', 'tamil', 'telugu', 'k-pop', 'korean']
            if any(b in g for g in genres for b in blocked):
                continue

            # 3. CALCULATE SCORES
            profile = {
                'name': main_artist['name'],
                'spotify_id': main_artist['id'],
                'avatar_url': details.get('images', [{}])[0].get('url'),
                'genres': genres,
                'popularity': pop,
                'followers': followers,
                'monthlyListeners': followers * 4, # Proxy
                'status': 'Up & Comer'
            }
            
            profile['powerScore'] = algo.calculate_power_score(profile)
            profile['arbitrageSignal'] = algo.calculate_arbitrage_signal(followers, pop)
            profile['growthVelocity'] = profile['arbitrageSignal'] * 1.5 # Proxy for momentum
            
            candidates.append(profile)
            
        # Deduplicate
        unique = {v['spotify_id']:v for v in candidates}.values()
        
        # Sort by Arbitrage Signal (Highest Opportunity First)
        sorted_candidates = sorted(unique, key=lambda x: x['arbitrageSignal'], reverse=True)[:50]
        
        # Assign Ranks
        for i, c in enumerate(sorted_candidates):
            c['rank'] = i + 1
            
        print(f"✅ Launchpad Generated: {len(sorted_candidates)} gems found via STELAR Algorithm")
        return list(sorted_candidates)

# ==============================================================================
# CLI HANDLER
# ==============================================================================

if __name__ == "__main__":
    CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
    CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
    
    if not CLIENT_ID or not CLIENT_SECRET:
        print("❌ ERROR: Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET env vars")
        exit(1)
        
    engine = SpotifyEngine(CLIENT_ID, CLIENT_SECRET)
    
    print("\n--- Generating PULSE ---")
    pulse = engine.fetch_global_pulse()
    
    print("\n--- Generating LAUNCHPAD ---")
    launchpad = engine.fetch_launchpad_candidates()
    
    # Save Output
    output = {
        "generated_at": datetime.now().isoformat(),
        "rankings": {
            "global": pulse,
            "up_and_comers": launchpad,
            # Fillers for existing frontend compatibility if needed
            "pop": pulse[:10],
            "hip_hop": pulse[:10], 
            "arbitrage": launchpad
        }
    }
    
    with open('../web/public/rankings.json', 'w') as f:
        json.dump(output, f, indent=2)
        
    print("\n✅ rankings.json updated successfully via Official API")
