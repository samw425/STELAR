#!/usr/bin/env python3
"""
Fix broken artist images in rankings.json.
Replaces broken Spotify CDN URLs with fresh iTunes images.
"""

import json
import requests
import time
import os

def fetch_itunes_image(artist_name):
    """Fetch artist image from iTunes API"""
    try:
        search_url = f"https://itunes.apple.com/search?term={requests.utils.quote(artist_name)}&entity=musicArtist&limit=1"
        response = requests.get(search_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('resultCount', 0) > 0:
                artist_id = data['results'][0].get('artistId')
                if artist_id:
                    # Get their top album for artwork
                    album_url = f"https://itunes.apple.com/lookup?id={artist_id}&entity=album&limit=1"
                    album_response = requests.get(album_url, timeout=10)
                    if album_response.status_code == 200:
                        album_data = album_response.json()
                        for item in album_data.get('results', []):
                            if item.get('wrapperType') == 'collection':
                                artwork = item.get('artworkUrl100', '')
                                if artwork:
                                    # Get higher resolution
                                    return artwork.replace('100x100', '600x600')
    except Exception as e:
        print(f"  Error fetching {artist_name}: {e}")
    return None

def is_spotify_url(url):
    """Check if URL is from Spotify CDN (which often expires)"""
    return url and 'scdn.co' in url

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    rankings_path = os.path.join(script_dir, '..', 'web', 'public', 'rankings.json')
    
    print(f"Loading rankings from: {rankings_path}")
    
    with open(rankings_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Process global rankings
    artists = data.get('rankings', {}).get('global', [])
    updated_count = 0
    spotify_count = 0
    
    # Only process top 500 for speed
    for i, artist in enumerate(artists[:500]):
        name = artist.get('name', 'Unknown')
        current_url = artist.get('avatar_url', '')
        
        # Replace Spotify URLs with iTunes (they expire)
        if is_spotify_url(current_url):
            spotify_count += 1
            print(f"[{i+1}] {name}: Spotify URL detected, fetching iTunes...", end=' ')
            
            new_url = fetch_itunes_image(name)
            if new_url:
                artist['avatar_url'] = new_url
                updated_count += 1
                print("✓ Updated")
            else:
                print("✗ No iTunes image")
            
            time.sleep(0.3)  # Rate limiting
    
    # Save updated data
    print(f"\nSaving updated rankings...")
    
    with open(rankings_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Done!")
    print(f"   Spotify URLs found: {spotify_count}")
    print(f"   Updated to iTunes: {updated_count}")

if __name__ == '__main__':
    main()
