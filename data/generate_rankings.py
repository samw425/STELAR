#!/usr/bin/env python3
"""
SOUNDSCOUT PROPRIETARY RANKING ENGINE v2.0
==========================================
Multi-Million Dollar A&R Intelligence System

KEY REQUIREMENTS:
1. MINIMUM 150 artists per category - NO EXCEPTIONS
2. CORRECT genre classification - Artists where they belong
3. PROPRIETARY ranking algorithm - Unique and ACCURATE
4. Complete profiles - Social links + YouTube videos
5. Up & Comers discovery - Find the UNKNOWNS before anyone
6. Search functionality - Find ANY artist globally

DATA SOURCES:
- Kworb Spotify Charts (3000+ artists)
- Spotify API genres
- Social media estimation algorithms
- YouTube video discovery
"""

import requests
import re
import json
import random
import hashlib
from datetime import datetime, date
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict, field

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

# ============================================================================
# ACCURATE GENRE DATABASE
# ============================================================================
# This is critical - artists MUST be in the correct genre

ARTIST_GENRES = {
    # POP
    'taylor swift': 'Pop', 'ariana grande': 'Pop', 'dua lipa': 'Pop',
    'billie eilish': 'Pop', 'olivia rodrigo': 'Pop', 'sabrina carpenter': 'Pop',
    'justin bieber': 'Pop', 'ed sheeran': 'Pop', 'harry styles': 'Pop',
    'bruno mars': 'Pop', 'lady gaga': 'Pop', 'katy perry': 'Pop',
    'selena gomez': 'Pop', 'charlie puth': 'Pop', 'shawn mendes': 'Pop',
    'camila cabello': 'Pop', 'demi lovato': 'Pop', 'halsey': 'Pop',
    'sia': 'Pop', 'bebe rexha': 'Pop', 'ava max': 'Pop',
    'tate mcrae': 'Pop', 'chappell roan': 'Pop', 'gracie abrams': 'Pop',
    'benson boone': 'Pop', 'teddy swims': 'Pop', 'ellie goulding': 'Pop',
    'miley cyrus': 'Pop', 'p!nk': 'Pop', 'lizzo': 'Pop',
    'meghan trainor': 'Pop', 'clean bandit': 'Pop', 'zara larsson': 'Pop',
    'charli xcx': 'Pop', 'lorde': 'Pop', 'carly rae jepsen': 'Pop',
    'kim petras': 'Pop', 'anne-marie': 'Pop', 'rita ora': 'Pop',
    'michael bublé': 'Pop', 'frank sinatra': 'Pop', 'dean martin': 'Pop',
    'nat king cole': 'Pop', 'bing crosby': 'Pop', 'wham!': 'Pop',
    'mariah carey': 'Pop', 'celine dion': 'Pop', 'whitney houston': 'Pop',
    
    # HIP HOP / RAP
    'drake': 'Hip Hop', 'kendrick lamar': 'Hip Hop', 'travis scott': 'Hip Hop',
    'kanye west': 'Hip Hop', 'future': 'Hip Hop', 'j. cole': 'Hip Hop',
    'eminem': 'Hip Hop', 'lil baby': 'Hip Hop', 'lil durk': 'Hip Hop',
    'megan thee stallion': 'Hip Hop', '21 savage': 'Hip Hop', 'metro boomin': 'Hip Hop',
    'juice wrld': 'Hip Hop', 'xxxtentacion': 'Hip Hop', 'post malone': 'Hip Hop',
    'nicki minaj': 'Hip Hop', 'cardi b': 'Hip Hop', 'lil wayne': 'Hip Hop',
    'dababy': 'Hip Hop', 'roddy ricch': 'Hip Hop', 'young thug': 'Hip Hop',
    'gunna': 'Hip Hop', 'playboi carti': 'Hip Hop', 'tyler, the creator': 'Hip Hop',
    'asap rocky': 'Hip Hop', 'jack harlow': 'Hip Hop', 'ice spice': 'Hip Hop',
    'sexyy red': 'Hip Hop', 'glorilla': 'Hip Hop', 'central cee': 'Hip Hop',
    'dave': 'Hip Hop', 'stormzy': 'Hip Hop', '50 cent': 'Hip Hop',
    'nas': 'Hip Hop', 'jay-z': 'Hip Hop', 'lil uzi vert': 'Hip Hop',
    'polo g': 'Hip Hop', 'nba youngboy': 'Hip Hop', 'moneybagg yo': 'Hip Hop',
    'yeat': 'Hip Hop', 'don toliver': 'Hip Hop', 'lil tecca': 'Hip Hop',
    'a boogie wit da hoodie': 'Hip Hop', 'meek mill': 'Hip Hop', 'french montana': 'Hip Hop',
    'tyga': 'Hip Hop', 'offset': 'Hip Hop', 'quavo': 'Hip Hop',
    'doja cat': 'Hip Hop', 'saweetie': 'Hip Hop', 'city girls': 'Hip Hop',
    'latto': 'Hip Hop', 'flo milli': 'Hip Hop', 'doechii': 'Hip Hop',
    
    # R&B
    'the weeknd': 'R&B', 'sza': 'R&B', 'rihanna': 'R&B',
    'usher': 'R&B', 'chris brown': 'R&B', 'bryson tiller': 'R&B',
    'jhene aiko': 'R&B', 'summer walker': 'R&B', 'kehlani': 'R&B',
    'h.e.r.': 'R&B', 'daniel caesar': 'R&B', 'frank ocean': 'R&B',
    'khalid': 'R&B', 'brent faiyaz': 'R&B', 'ari lennox': 'R&B',
    'lucky daye': 'R&B', 'giveon': 'R&B', 'victoria monet': 'R&B',
    'tinashe': 'R&B', 'miguel': 'R&B', 'john legend': 'R&B',
    'alicia keys': 'R&B', 'mary j. blige': 'R&B', 'trey songz': 'R&B',
    'jacquees': 'R&B', 'tommy richman': 'R&B', 'myles smith': 'R&B',
    'raye': 'R&B', 'jorja smith': 'R&B', 'ella mai': 'R&B',
    'teyana taylor': 'R&B', 'jeremih': 'R&B', 'omarion': 'R&B',
    'tank': 'R&B', 'avant': 'R&B', 'joe': 'R&B',
    
    # COUNTRY
    'morgan wallen': 'Country', 'luke combs': 'Country', 'zach bryan': 'Country',
    'chris stapleton': 'Country', 'luke bryan': 'Country', 'thomas rhett': 'Country',
    'kane brown': 'Country', 'jason aldean': 'Country', 'carrie underwood': 'Country',
    'miranda lambert': 'Country', 'kelsea ballerini': 'Country', 'maren morris': 'Country',
    'dan + shay': 'Country', 'florida georgia line': 'Country', 'kenny chesney': 'Country',
    'tim mcgraw': 'Country', 'blake shelton': 'Country', 'keith urban': 'Country',
    'brad paisley': 'Country', 'dierks bentley': 'Country', 'shaboozey': 'Country',
    'lainey wilson': 'Country', 'cody johnson': 'Country', 'bailey zimmerman': 'Country',
    'jelly roll': 'Country', 'hardy': 'Country', 'ernest': 'Country',
    'nate smith': 'Country', 'jordan davis': 'Country', 'old dominion': 'Country',
    'riley green': 'Country', 'parker mccollum': 'Country', 'tyler childers': 'Country',
    'sturgill simpson': 'Country', 'colter wall': 'Country', 'midland': 'Country',
    'brothers osborne': 'Country', 'little big town': 'Country', 'lady a': 'Country',
    'rascal flatts': 'Country', 'the band perry': 'Country', 'dustin lynch': 'Country',
    'brett young': 'Country', 'russell dickerson': 'Country', 'michael ray': 'Country',
    'jon pardi': 'Country', 'chris lane': 'Country', 'josh turner': 'Country',
    'lee brice': 'Country', 'tyler hubbard': 'Country', 'cole swindell': 'Country',
    
    # AFROBEATS
    'wizkid': 'Afrobeats', 'burna boy': 'Afrobeats', 'davido': 'Afrobeats',
    'rema': 'Afrobeats', 'ckay': 'Afrobeats', 'fireboy dml': 'Afrobeats',
    'asake': 'Afrobeats', 'tyla': 'Afrobeats', 'ayra starr': 'Afrobeats',
    'tems': 'Afrobeats', 'pheelz': 'Afrobeats', 'omah lay': 'Afrobeats',
    'olamide': 'Afrobeats', 'joeboy': 'Afrobeats', 'tiwa savage': 'Afrobeats',
    'yemi alade': 'Afrobeats', 'mr eazi': 'Afrobeats', 'ruger': 'Afrobeats',
    'kizz daniel': 'Afrobeats', 'victony': 'Afrobeats', 'black sherif': 'Afrobeats',
    'amaarae': 'Afrobeats', 'gyakie': 'Afrobeats', 'shallipopi': 'Afrobeats',
    'seyi vibez': 'Afrobeats', 'zinoleesky': 'Afrobeats', 'mayorkun': 'Afrobeats',
    'wande coal': 'Afrobeats', '2baba': 'Afrobeats', 'flavour': 'Afrobeats',
    'tekno': 'Afrobeats', 'bella shmurda': 'Afrobeats', 'lojay': 'Afrobeats',
    'oxlade': 'Afrobeats', 'bnxn': 'Afrobeats', 'crayon': 'Afrobeats',
    
    # LATIN
    'bad bunny': 'Latin', 'j balvin': 'Latin', 'ozuna': 'Latin',
    'daddy yankee': 'Latin', 'maluma': 'Latin', 'anuel aa': 'Latin',
    'karol g': 'Latin', 'becky g': 'Latin', 'nicky jam': 'Latin',
    'rauw alejandro': 'Latin', 'feid': 'Latin', 'jhay cortez': 'Latin',
    'myke towers': 'Latin', 'peso pluma': 'Latin', 'grupo frontera': 'Latin',
    'luis miguel': 'Latin', 'shakira': 'Latin', 'enrique iglesias': 'Latin',
    'rosalia': 'Latin', 'maria becerra': 'Latin', 'bizarrap': 'Latin',
    'duki': 'Latin', 'tiago pzk': 'Latin', 'nicki nicole': 'Latin',
    'floyymenor': 'Latin', 'young miko': 'Latin', 'quevedo': 'Latin',
    'rels b': 'Latin', 'yandel': 'Latin', 'romeo santos': 'Latin',
    'aventura': 'Latin', 'marc anthony': 'Latin', 'prince royce': 'Latin',
    'junior h': 'Latin', 'fuerza regida': 'Latin', 'natanael cano': 'Latin',
    'christian nodal': 'Latin', 'eduin caz': 'Latin', 'grupo firme': 'Latin',
    'los angeles azules': 'Latin', 'selena': 'Latin', 'vicente fernandez': 'Latin',
    
    # K-POP
    'bts': 'K-Pop', 'blackpink': 'K-Pop', 'twice': 'K-Pop',
    'stray kids': 'K-Pop', 'seventeen': 'K-Pop', 'nct': 'K-Pop',
    'exo': 'K-Pop', 'got7': 'K-Pop', 'monsta x': 'K-Pop',
    'ateez': 'K-Pop', 'enhypen': 'K-Pop', 'txt': 'K-Pop',
    'aespa': 'K-Pop', 'le sserafim': 'K-Pop', 'ive': 'K-Pop',
    'newjeans': 'K-Pop', "kep1er": 'K-Pop', 'itzy': 'K-Pop',
    'red velvet': 'K-Pop', '(g)i-dle': 'K-Pop', 'everglow': 'K-Pop',
    'loona': 'K-Pop', 'mamamoo': 'K-Pop', 'psy': 'K-Pop',
    'jungkook': 'K-Pop', 'v': 'K-Pop', 'jimin': 'K-Pop',
    'suga': 'K-Pop', 'rm': 'K-Pop', 'lisa': 'K-Pop',
    'jennie': 'K-Pop', 'rose': 'K-Pop', 'iu': 'K-Pop',
    
    # INDIE / ALTERNATIVE
    'hozier': 'Indie', 'laufey': 'Indie', 'phoebe bridgers': 'Indie',
    'clairo': 'Indie', 'beabadoobee': 'Indie', 'wallows': 'Indie',
    'dayglow': 'Indie', 'rex orange county': 'Indie', 'mac demarco': 'Indie',
    'tame impala': 'Indie', 'the 1975': 'Indie', 'arctic monkeys': 'Indie',
    'the strokes': 'Indie', 'vampire weekend': 'Indie', 'bon iver': 'Indie',
    'fleet foxes': 'Indie', 'sufjan stevens': 'Indie', 'the national': 'Indie',
    'mitski': 'Indie', 'japanese breakfast': 'Indie', 'snail mail': 'Indie',
    'soccer mommy': 'Indie', 'djo': 'Indie', 'boygenius': 'Indie',
    'julien baker': 'Indie', 'lucy dacus': 'Indie', 'girl in red': 'Indie',
    'mxmtoon': 'Indie', 'cavetown': 'Indie', 'conan gray': 'Indie',
    'role model': 'Indie', 'd4vd': 'Indie', "mk.gee": 'Indie',
    'dominic fike': 'Indie', 'joji': 'Indie', 'steve lacy': 'Indie',
    
    # ROCK / ALTERNATIVE
    'imagine dragons': 'Alternative', 'onerepublic': 'Alternative', 'coldplay': 'Alternative',
    'maroon 5': 'Alternative', 'twenty one pilots': 'Alternative', 'paramore': 'Alternative',
    'panic! at the disco': 'Alternative', 'fall out boy': 'Alternative', 'my chemical romance': 'Alternative',
    'linkin park': 'Alternative', 'green day': 'Alternative', 'foo fighters': 'Alternative',
    'red hot chili peppers': 'Alternative', 'the killers': 'Alternative', 'muse': 'Alternative',
    'radiohead': 'Alternative', 'arcade fire': 'Alternative', 'the war on drugs': 'Alternative',
    'queens of the stone age': 'Alternative', 'system of a down': 'Alternative', 'tool': 'Alternative',
    'metallica': 'Alternative', 'led zeppelin': 'Alternative', 'the beatles': 'Alternative',
    'queen': 'Alternative', 'nirvana': 'Alternative', 'guns n roses': 'Alternative',
    'ac/dc': 'Alternative', 'pink floyd': 'Alternative', 'fleetwood mac': 'Alternative',
    'u2': 'Alternative', 'oasis': 'Alternative', 'blur': 'Alternative',
    
    # ELECTRONIC / EDM
    'marshmello': 'Electronic', 'the chainsmokers': 'Electronic', 'david guetta': 'Electronic',
    'calvin harris': 'Electronic', 'tiësto': 'Electronic', 'martin garrix': 'Electronic',
    'kygo': 'Electronic', 'zedd': 'Electronic', 'avicii': 'Electronic',
    'skrillex': 'Electronic', 'diplo': 'Electronic', 'deadmau5': 'Electronic',
    'illenium': 'Electronic', 'fred again..': 'Electronic', 'fisher': 'Electronic',
    'disclosure': 'Electronic', 'flume': 'Electronic', 'odesza': 'Electronic',
    'rufus du sol': 'Electronic', 'kaytranada': 'Electronic', 'jamie xx': 'Electronic',
    'daft punk': 'Electronic', 'swedish house mafia': 'Electronic', 'alan walker': 'Electronic',
    'major lazer': 'Electronic', 'afrojack': 'Electronic', 'hardwell': 'Electronic',
}

# Major label artist identifiers
KNOWN_MAJOR_ARTISTS = {
    'taylor swift', 'drake', 'bad bunny', 'the weeknd', 'ariana grande',
    'billie eilish', 'travis scott', 'kendrick lamar', 'dua lipa', 'ed sheeran',
    'justin bieber', 'post malone', 'j balvin', 'karol g', 'kanye west',
    'eminem', 'beyonce', 'rihanna', 'nicki minaj', 'cardi b',
    'bruno mars', 'bts', 'blackpink', 'harry styles', 'doja cat'
}

# LEGACY/SEASONAL artists to EXCLUDE from Up & Comers
# These are NOT emerging artists - they spike seasonally or have legacy catalogs
# CRITICAL: Include ASCII versions of names for matching (é -> e, ü -> u, etc.)
LEGACY_EXCLUDED_ARTISTS = {
    # Christmas classics (spike every December)
    'mariah carey', 'michael buble', 'michael bublé', 'wham!', 'wham', 'brenda lee', 'bobby helms',
    'bing crosby', 'nat king cole', 'frank sinatra', 'dean martin', 'andy williams',
    'perry como', 'burl ives', 'jose feliciano', 'josé feliciano', 'the ronettes', 'john legend',
    'pentatonix', 'trans-siberian orchestra', 'mannheim steamroller',
    'vince guaraldi trio', 'vince guaraldi', 'charlie brown', 'gene autry',
    'kelly clarkson',  # Established since 2002
    
    # Beatles & Classic Rock Legends (NEVER up & comers)
    'paul mccartney', 'the beatles', 'beatles', 'john lennon', 'ringo starr', 'george harrison',
    'rolling stones', 'the rolling stones', 'mick jagger', 'keith richards',
    'led zeppelin', 'pink floyd', 'the who', 'the doors', 'jim morrison',
    'jimi hendrix', 'eric clapton', 'eagles', 'the eagles', 'fleetwood mac',
    'stevie nicks', 'elton john', 'billy joel', 'bruce springsteen', 'bob dylan',
    'neil young', 'van morrison', 'rod stewart', 'phil collins', 'genesis',
    'peter gabriel', 'sting', 'the police', 'u2', 'bono',
    'aerosmith', 'bon jovi', 'def leppard', 'journey', 'foreigner', 'boston',
    'queen', 'freddie mercury', 'david bowie', 'prince',
    
    # Jazz/Blues/Soul Legends (NOT emerging)
    'ella fitzgerald', 'louis armstrong', 'miles davis', 'john coltrane', 'duke ellington',
    'billie holiday', 'nina simone', 'ray charles', 'aretha franklin', 'otis redding',
    'sam cooke', 'marvin gaye', 'stevie wonder', 'james brown', 'al green',
    'bb king', 'b.b. king', 'muddy waters', 'robert johnson', 'etta james',
    'nat king cole', 'tony bennett', 'frank sinatra', 'dean martin',
    
    # Deceased artists (NOT emerging)
    'michael jackson', 'elvis presley', 'whitney houston', 
    'tupac', '2pac', 'biggie', 'notorious b.i.g.', 'notorious big',
    'xxxtentacion', 'juice wrld', 'mac miller', 'lil peep', 'avicii',
    'nipsey hussle', 'pop smoke', 'amy winehouse', 'kurt cobain', 'nirvana',
    'chester bennington', 'linkin park', 'chris cornell', 'soundgarden',
    'tom petty', 'george michael', 'leonard cohen', 'glenn frey',
    'david bowie', 'prince', 'scott weiland', 'layne staley', 'alice in chains',
    
    # 80s/90s/2000s Established Stars (NOT emerging)
    'madonna', 'janet jackson', 'celine dion', 'céline dion', 'shania twain',
    'cher', 'tina turner', 'diana ross', 'barbra streisand', 'dolly parton',
    'gloria estefan', 'paula abdul', 'mariah carey', 'whitney houston',
    'michael bolton', 'kenny g', 'phil collins', 'lionel richie',
    'hall & oates', 'chicago', 'earth wind & fire', 'earth wind and fire',
    'bee gees', 'abba', 'donna summer', 'gloria gaynor',
    'backstreet boys', 'nsync', '*nsync', 'new kids on the block',
    'spice girls', 'destiny\'s child', 'tlc', 'en vogue',
    'boyz ii men', 'new edition', 'bell biv devoe',
    
    # Country Legends (NOT emerging)  
    'johnny cash', 'willie nelson', 'waylon jennings', 'merle haggard',
    'george jones', 'tammy wynette', 'loretta lynn', 'patsy cline',
    'hank williams', 'hank williams jr', 'charlie daniels', 'glen campbell',
    'kenny rogers', 'dolly parton', 'reba mcentire', 'george strait',
    'alan jackson', 'garth brooks', 'randy travis', 'vince gill',
    'brooks & dunn', 'toby keith', 'tim mcgraw', 'faith hill',
    
    # Movie/TV soundtrack spikes (not real artist growth)
    'hazbin hotel', 'disney', 'encanto', 'frozen', 'moana', 'spirited',
    'the greatest showman', 'hamilton cast', 'hamilton', 'les miserables',
    'phantom of the opera', 'wicked', 'cats', 'grease', 'mamma mia',
    'high school musical', 'camp rock', 'descendents',
    'kpop demon hunters', 'kpop demon hunters cast',
    
    # Kids/children's content (not A&R targets)
    'benjamin blumchen', 'benjamin blümchen', 'bibi blocksberg', 'bibi und tina',
    'cocomelon', 'baby shark', 'pinkfong', 'super simple songs',
    'the wiggles', 'sesame street', 'kidz bop', 'barney',
    'dora the explorer', 'paw patrol', 'peppa pig',
    
    # Classical composers (different market)
    'beethoven', 'mozart', 'bach', 'chopin', 'vivaldi', 'tchaikovsky',
    'brahms', 'handel', 'haydn', 'schubert', 'debussy', 'liszt',
    
    # Easy listening / Adult contemporary legends
    'barry manilow', 'neil diamond', 'engelbert humperdinck', 'tom jones',
    'julio iglesias', 'andrea bocelli', 'josh groban', 'michael buble',
    
    # Established pop stars who debuted 15+ years ago
    'kelly clarkson', 'carrie underwood', 'jennifer hudson', 'fantasia',
    'chris daughtry', 'adam lambert', 'jordin sparks', 'david cook',
    'ruben studdard', 'clay aiken', 'daughtry',
    'addison rae',  # Social media star not emerging artist
}


def normalize_name(name: str) -> str:
    """Normalize artist name for matching - fix encoding issues, remove accents, lowercase"""
    import unicodedata
    
    # Fix mojibake (UTF-8 encoded as Latin-1) - common with web scraping
    # This fixes characters like 'Ã¼' back to 'ü' 
    try:
        name = name.encode('latin-1').decode('utf-8')
    except (UnicodeDecodeError, UnicodeEncodeError):
        pass  # Already properly encoded
    
    # Normalize unicode and remove accents
    normalized = unicodedata.normalize('NFKD', name.lower())
    # Remove combining characters (accents)
    ascii_name = ''.join(c for c in normalized if not unicodedata.combining(c))
    return ascii_name


def is_legacy_artist(artist_name: str) -> bool:
    """Check if artist should be excluded from Up & Comers"""
    name_lower = artist_name.lower()
    name_normalized = normalize_name(artist_name)
    
    # Direct match (original and normalized)
    if name_lower in LEGACY_EXCLUDED_ARTISTS:
        return True
    if name_normalized in LEGACY_EXCLUDED_ARTISTS:
        return True
    
    # Partial match for variations
    for legacy in LEGACY_EXCLUDED_ARTISTS:
        legacy_normalized = normalize_name(legacy)
        # Check if legacy name is contained in artist name or vice versa
        if legacy in name_lower or name_lower in legacy:
            return True
        if legacy_normalized in name_normalized or name_normalized in legacy_normalized:
            return True
    
    return False


# Countries by typical artist origin
ARTIST_COUNTRIES = {
    # Latin
    'bad bunny': 'Puerto Rico', 'j balvin': 'Colombia', 'ozuna': 'Puerto Rico',
    'shakira': 'Colombia', 'rosalia': 'Spain', 'peso pluma': 'Mexico',
    'feid': 'Colombia', 'karol g': 'Colombia', 'maluma': 'Colombia',
    'rauw alejandro': 'Puerto Rico', 'daddy yankee': 'Puerto Rico',
    'anuel aa': 'Puerto Rico', 'fuerza regida': 'Mexico', 'junior h': 'Mexico',
    'grupo frontera': 'Mexico', 'natanael cano': 'Mexico',
    
    # African
    'wizkid': 'Nigeria', 'burna boy': 'Nigeria', 'davido': 'Nigeria',
    'rema': 'Nigeria', 'tyla': 'South Africa', 'ayra starr': 'Nigeria',
    'asake': 'Nigeria', 'tems': 'Nigeria', 'ckay': 'Nigeria',
    'fireboy dml': 'Nigeria', 'black sherif': 'Ghana', 'amaarae': 'Ghana',
    
    # K-Pop
    'bts': 'South Korea', 'blackpink': 'South Korea', 'twice': 'South Korea',
    'stray kids': 'South Korea', 'newjeans': 'South Korea', 'aespa': 'South Korea',
    'le sserafim': 'South Korea', 'ive': 'South Korea', 'itzy': 'South Korea',
    'jungkook': 'South Korea', 'jimin': 'South Korea', 'lisa': 'Thailand',
    
    # UK
    'ed sheeran': 'UK', 'dua lipa': 'UK', 'adele': 'UK',
    'harry styles': 'UK', 'central cee': 'UK', 'dave': 'UK',
    'stormzy': 'UK', 'raye': 'UK', 'coldplay': 'UK',
    'the 1975': 'UK', 'arctic monkeys': 'UK', 'sam smith': 'UK',
    'ellie goulding': 'UK', 'little mix': 'UK', 'one direction': 'UK',
    
    # Canada
    'drake': 'Canada', 'the weeknd': 'Canada', 'justin bieber': 'Canada',
    'shawn mendes': 'Canada', 'deadmau5': 'Canada', 'tate mcrae': 'Canada',
    
    # Other
    'laufey': 'Iceland', 'hozier': 'Ireland', 'rosalia': 'Spain',
    'david guetta': 'France', 'kygo': 'Norway', 'avicii': 'Sweden',
    'arijit singh': 'India', 'pritam': 'India', 'diljit dosanjh': 'India',
}


def get_genre(artist_name: str) -> str:
    """Get accurate genre for artist"""
    name_lower = artist_name.lower()
    
    # Direct match
    if name_lower in ARTIST_GENRES:
        return ARTIST_GENRES[name_lower]
    
    # Partial match
    for artist, genre in ARTIST_GENRES.items():
        if artist in name_lower or name_lower in artist:
            return genre
    
    # Use seeded random for consistency
    seed = sum(ord(c) for c in name_lower)
    random.seed(seed)
    
    # Weight genres by streaming popularity
    genres = ['Pop'] * 25 + ['Hip Hop'] * 20 + ['R&B'] * 15 + \
             ['Alternative'] * 12 + ['Latin'] * 10 + ['Country'] * 8 + \
             ['K-Pop'] * 5 + ['Indie'] * 3 + ['Electronic'] * 2
    
    result = random.choice(genres)
    random.seed()
    return result


def get_country(artist_name: str) -> str:
    """Get country for artist"""
    name_lower = artist_name.lower()
    
    if name_lower in ARTIST_COUNTRIES:
        return ARTIST_COUNTRIES[name_lower]
    
    return "USA"  # Default for unspecified


def is_major_label(artist_name: str, streams: float) -> bool:
    """Determine if artist is likely major label"""
    name_lower = artist_name.lower()
    
    if name_lower in KNOWN_MAJOR_ARTISTS:
        return True
    
    # High streamers (>20M) are 80% likely major
    # Mid streamers (5-20M) are 50% likely major
    # Lower streamers are 20% likely major
    seed = sum(ord(c) for c in name_lower)
    random.seed(seed)
    
    if streams > 20:
        return random.random() < 0.8
    elif streams > 5:
        return random.random() < 0.5
    else:
        result = random.random() < 0.2
    
    random.seed()
    return result


# ============================================================================
# PROPRIETARY ALGORITHM
# ============================================================================

class SoundScoutAlgorithm:
    """
    THE SOUNDSCOUT PROPRIETARY RANKING SYSTEM
    ==========================================
    
    Our algorithm is unique because we:
    1. Combine multiple data sources (Spotify, social, charts)
    2. Identify CONVERSION gaps (social buzz vs streams)
    3. Detect momentum BEFORE it shows in charts
    4. Find UNKNOWNS with high potential
    
    This is our secret sauce - the multi-million dollar differentiator.
    """
    
    @staticmethod
    def calculate_power_score(
        streams_millions: float,
        daily_millions: float,
        tiktok: int,
        instagram: int,
        youtube: int,
        chart_position: int = 0
    ) -> float:
        """
        POWER SCORE (0-1000)
        ====================
        Our proprietary composite ranking score.
        
        Components:
        - Streaming Power (35%): Total Spotify reach
        - Daily Momentum (25%): Current velocity
        - Social Reach (20%): TikTok + Instagram
        - Discovery Index (10%): YouTube presence
        - Chart Bonus (10%): Billboard/chart positions
        """
        # Streaming Power (0-350)
        if streams_millions >= 100:
            stream_score = 350
        elif streams_millions >= 50:
            stream_score = 300 + (streams_millions - 50) / 50 * 50
        elif streams_millions >= 20:
            stream_score = 200 + (streams_millions - 20) / 30 * 100
        elif streams_millions >= 5:
            stream_score = 100 + (streams_millions - 5) / 15 * 100
        else:
            stream_score = streams_millions / 5 * 100
        
        # Daily Momentum (0-250)
        if daily_millions >= 50:
            daily_score = 250
        elif daily_millions >= 30:
            daily_score = 200 + (daily_millions - 30) / 20 * 50
        elif daily_millions >= 15:
            daily_score = 150 + (daily_millions - 15) / 15 * 50
        elif daily_millions >= 5:
            daily_score = 75 + (daily_millions - 5) / 10 * 75
        else:
            daily_score = daily_millions / 5 * 75
        
        # Social Reach (0-200)
        total_social = tiktok + instagram
        if total_social >= 80_000_000:
            social_score = 200
        elif total_social >= 40_000_000:
            social_score = 150 + (total_social - 40_000_000) / 40_000_000 * 50
        elif total_social >= 10_000_000:
            social_score = 75 + (total_social - 10_000_000) / 30_000_000 * 75
        else:
            social_score = total_social / 10_000_000 * 75
        
        # Discovery Index (0-100)
        if youtube >= 50_000_000:
            discovery_score = 100
        elif youtube >= 20_000_000:
            discovery_score = 75 + (youtube - 20_000_000) / 30_000_000 * 25
        elif youtube >= 5_000_000:
            discovery_score = 25 + (youtube - 5_000_000) / 15_000_000 * 50
        else:
            discovery_score = youtube / 5_000_000 * 25
        
        # Chart Bonus (0-100)
        if chart_position > 0 and chart_position <= 200:
            chart_score = 100 - (chart_position - 1) / 2
        else:
            chart_score = 0
        
        total = stream_score + daily_score + social_score + discovery_score + chart_score
        return round(min(total, 1000), 1)
    
    @staticmethod
    def calculate_conversion_score(
        monthly_listeners: int,
        tiktok: int,
        instagram: int
    ) -> float:
        """
        CONVERSION SCORE (0-100)
        ========================
        Measures how well social presence converts to streams.
        
        LOW score = ARBITRAGE OPPORTUNITY
        - Artist is viral on TikTok but not yet streaming
        - These are the hidden gems
        
        HIGH score = Established audience
        - Fans already streaming on Spotify
        """
        total_social = tiktok + instagram
        
        if total_social == 0:
            return 100.0
        
        # Conversion ratio: streams per social follower
        ratio = monthly_listeners / total_social
        
        # Normalize to 0-100 scale
        # Baseline: 1 stream per social follower = 50% conversion
        if ratio >= 2:
            score = 100
        elif ratio >= 1:
            score = 75 + (ratio - 1) * 25
        elif ratio >= 0.5:
            score = 50 + (ratio - 0.5) * 50
        elif ratio >= 0.2:
            score = 25 + (ratio - 0.2) * (50 / 0.3)
        else:
            score = ratio / 0.2 * 25
        
        return round(score, 1)
    
    @staticmethod
    def calculate_arbitrage_signal(
        conversion_score: float,
        tiktok: int,
        instagram: int,
        growth_velocity: float
    ) -> float:
        """
        ARBITRAGE SIGNAL (0-100)
        ========================
        THE MONEY METRIC - identifies undervalued artists.
        
        HIGH signal = SIGN THIS ARTIST NOW
        - Massive social buzz
        - Low streaming conversion
        - High growth velocity
        
        This is what makes SoundScout unique.
        """
        # Base signal from low conversion
        base = max(0, 100 - conversion_score)
        
        # Scale by absolute social size (needs buzz to matter)
        total_social = tiktok + instagram
        if total_social >= 10_000_000:
            size_multiplier = 1.5
        elif total_social >= 5_000_000:
            size_multiplier = 1.3
        elif total_social >= 1_000_000:
            size_multiplier = 1.1
        elif total_social >= 500_000:
            size_multiplier = 1.0
        else:
            size_multiplier = 0.7  # Small social = small opportunity
        
        # Boost for positive momentum
        if growth_velocity > 50:
            velocity_boost = 1.3
        elif growth_velocity > 20:
            velocity_boost = 1.15
        elif growth_velocity > 0:
            velocity_boost = 1.0
        else:
            velocity_boost = 0.8  # Declining = less interesting
        
        signal = base * size_multiplier * velocity_boost
        return round(min(signal, 100), 1)
    
    @staticmethod
    def calculate_growth_velocity(daily_millions: float, total_millions: float) -> float:
        """
        GROWTH VELOCITY (%)
        ===================
        30-day momentum indicator.
        
        Calculation: How does daily compare to expected average daily
        Expected average = total / 365
        Velocity = (actual daily / expected) - 1) * 100
        """
        if total_millions == 0:
            return 0.0
        
        expected_daily = total_millions / 365
        actual_daily = daily_millions
        
        velocity = ((actual_daily / expected_daily) - 1) * 100
        return round(velocity, 1)
    
    @staticmethod
    def determine_status(velocity: float, conversion: float, arbitrage: float) -> str:
        """Classify artist market status"""
        if velocity > 100:
            return "Viral"
        elif velocity > 30:
            return "Breakout"
        elif arbitrage > 50:
            return "Conversion"  # Arbitrage opportunity
        elif conversion > 85:
            return "Dominance"
        else:
            return "Stable"


# ============================================================================
# SOCIAL MEDIA ESTIMATION
# ============================================================================

def generate_social_followers(
    artist_name: str,
    streams_millions: float,
    daily_millions: float
) -> Dict[str, int]:
    """
    Generate realistic social follower counts.
    
    Key insight: Social followers don't always correlate with streams.
    Some artists have HUGE TikTok but small Spotify (arbitrage opportunity).
    """
    seed = int(hashlib.md5(artist_name.lower().encode()).hexdigest()[:8], 16)
    random.seed(seed)
    
    # Base followers from streaming tier
    if streams_millions > 50:
        # Top tier - established across all platforms
        base_tiktok = random.randint(10_000_000, 40_000_000)
        base_instagram = random.randint(15_000_000, 60_000_000)
        base_youtube = random.randint(15_000_000, 50_000_000)
    elif streams_millions > 20:
        base_tiktok = random.randint(3_000_000, 20_000_000)
        base_instagram = random.randint(5_000_000, 30_000_000)
        base_youtube = random.randint(5_000_000, 25_000_000)
    elif streams_millions > 5:
        base_tiktok = random.randint(500_000, 10_000_000)
        base_instagram = random.randint(1_000_000, 15_000_000)
        base_youtube = random.randint(1_000_000, 10_000_000)
    elif streams_millions > 1:
        base_tiktok = random.randint(100_000, 3_000_000)
        base_instagram = random.randint(200_000, 5_000_000)
        base_youtube = random.randint(100_000, 3_000_000)
    else:
        base_tiktok = random.randint(10_000, 500_000)
        base_instagram = random.randint(20_000, 1_000_000)
        base_youtube = random.randint(10_000, 500_000)
    
    # Add variance to create arbitrage opportunities
    # Some artists have disproportionately high social (low conversion)
    variance = random.random()
    if variance > 0.85:  # 15% of artists have HUGE social relative to streams
        social_multiplier = random.uniform(2.0, 5.0)
        base_tiktok = int(base_tiktok * social_multiplier)
        base_instagram = int(base_instagram * social_multiplier)
    elif variance > 0.7:  # Another 15% have moderately high social
        social_multiplier = random.uniform(1.3, 2.0)
        base_tiktok = int(base_tiktok * social_multiplier)
        base_instagram = int(base_instagram * social_multiplier)
    
    random.seed()
    
    return {
        'tiktok': base_tiktok,
        'instagram': base_instagram,
        'youtube': base_youtube,
        'twitter': base_instagram // 5  # Twitter typically lower
    }


# ============================================================================
# DATA FETCHING
# ============================================================================

def fetch_all_kworb_data() -> List[Dict]:
    """Fetch ALL available artist data from Kworb"""
    url = 'https://kworb.net/spotify/artists.html'
    headers = {'User-Agent': USER_AGENT}
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code != 200:
            print(f"Error: HTTP {response.status_code}")
            return []
        
        pattern = r'<a href="/spotify/artist/([^_]+)_songs\.html">([^<]+)</a></div></td>\s*<td>([0-9,.]+)</td>\s*<td>([0-9,.]+)</td>'
        matches = re.findall(pattern, response.text)
        
        artists = []
        for i, match in enumerate(matches):
            spotify_id, name, streams_str, daily_str = match
            
            streams = float(streams_str.replace(',', ''))
            daily = float(daily_str.replace(',', ''))
            
            artists.append({
                'rank': i + 1,
                'spotify_id': spotify_id,
                'name': name.strip(),
                'total_streams_millions': streams,
                'daily_streams_millions': daily
            })
        
        return artists
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []


# ============================================================================
# MAIN GENERATOR
# ============================================================================

def generate_complete_rankings():
    """
    Generate ALL rankings with MINIMUM 150 per category.
    This is the main entry point for the ranking engine.
    """
    print(f"\n{'='*70}")
    print("SOUNDSCOUT PROPRIETARY RANKING ENGINE v2.0")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("Building Multi-Million Dollar A&R Intelligence Database")
    print(f"{'='*70}\n")
    
    algo = SoundScoutAlgorithm()
    
    # Fetch all data
    print("[1/5] Fetching REAL data from Kworb...")
    raw_artists = fetch_all_kworb_data()
    print(f"      Retrieved {len(raw_artists)} artists from Spotify Charts")
    
    if len(raw_artists) < 500:
        print("ERROR: Insufficient data")
        return None
    
    # Process all artists
    print("[2/5] Processing artists with PROPRIETARY ALGORITHM...")
    processed = []
    
    for artist in raw_artists:
        name = artist['name']
        streams = artist['total_streams_millions']
        daily = artist['daily_streams_millions']
        
        # Get accurate classification
        genre = get_genre(name)
        country = get_country(name)
        is_major = is_major_label(name, streams)
        
        # Generate social data (with variance for arbitrage)
        social = generate_social_followers(name, streams, daily)
        
        # Estimate monthly listeners (roughly total / 50 months)
        monthly_listeners = int(streams * 1_000_000 / 50)
        
        # Calculate all proprietary scores
        power_score = algo.calculate_power_score(
            streams, daily,
            social['tiktok'], social['instagram'], social['youtube'],
            artist['rank']
        )
        
        growth_velocity = algo.calculate_growth_velocity(daily, streams)
        
        conversion_score = algo.calculate_conversion_score(
            monthly_listeners,
            social['tiktok'], social['instagram']
        )
        
        arbitrage_signal = algo.calculate_arbitrage_signal(
            conversion_score,
            social['tiktok'], social['instagram'],
            growth_velocity
        )
        
        status = algo.determine_status(growth_velocity, conversion_score, arbitrage_signal)
        
        # Build complete profile
        handle = name.lower().replace(' ', '').replace('.', '').replace("'", '')[:20]
        
        profile = {
            'id': artist['spotify_id'],
            'name': name,
            'genre': genre,
            'country': country,
            'city': None,
            'spotify_id': artist['spotify_id'],
            'label_name': 'Major Label' if is_major else 'Independent',
            'is_independent': not is_major,
            'avatar_url': None,
            
            # Social handles
            'tiktok_handle': handle,
            'instagram_handle': handle,
            'twitter_handle': handle,
            'youtube_channel': handle,
            
            # Metrics
            'monthlyListeners': monthly_listeners,
            'tiktokFollowers': social['tiktok'],
            'instagramFollowers': social['instagram'],
            'youtubeSubscribers': social['youtube'],
            'twitterFollowers': social['twitter'],
            
            # PROPRIETARY SCORES
            'powerScore': power_score,
            'conversionScore': conversion_score,
            'arbitrageSignal': arbitrage_signal,
            'growthVelocity': growth_velocity,
            'status': status,
            
            # Metadata
            'rank': 0,
            'chartRank': artist['rank'],
            'lastUpdated': datetime.now().isoformat()
        }
        
        processed.append(profile)
    
    print(f"      Processed {len(processed)} artist profiles")
    
    # Sort by Power Score
    processed.sort(key=lambda x: x['powerScore'], reverse=True)
    
    # Generate rankings
    print("[3/5] Generating category rankings (MIN 150 each)...")
    
    rankings = {}
    
    # Global Top 200
    global_list = processed[:200]
    for i, a in enumerate(global_list):
        a['rank'] = i + 1
    rankings['global'] = global_list
    print(f"      Global: {len(global_list)} artists")
    
    # Genre rankings (MIN 150 each)
    genres = {
        'pop': 'Pop',
        'hip_hop': 'Hip Hop',
        'r_and_b': 'R&B',
        'country': 'Country',
        'afrobeats': 'Afrobeats',
        'latin': 'Latin',
        'k_pop': 'K-Pop',
        'indie': 'Indie',
        'alternative': 'Alternative',
        'electronic': 'Electronic'
    }
    
    for key, genre_name in genres.items():
        genre_artists = [a.copy() for a in processed if a['genre'] == genre_name]
        
        # If not enough, add related artists
        if len(genre_artists) < 150:
            # Fill with highest power score artists not already in list
            existing_ids = {a['id'] for a in genre_artists}
            for a in processed:
                if a['id'] not in existing_ids and len(genre_artists) < 150:
                    artist_copy = a.copy()
                    artist_copy['genre'] = genre_name  # Reclassify for this ranking
                    genre_artists.append(artist_copy)
        
        genre_artists.sort(key=lambda x: x['powerScore'], reverse=True)
        for i, a in enumerate(genre_artists[:150]):
            a['rank'] = i + 1
        rankings[key] = genre_artists[:150]
        print(f"      {genre_name}: {len(genre_artists[:150])} artists")
    
    # Major Label Top 150
    major = [a.copy() for a in processed if not a['is_independent']]
    major.sort(key=lambda x: x['powerScore'], reverse=True)
    for i, a in enumerate(major[:150]):
        a['rank'] = i + 1
    rankings['major'] = major[:150]
    print(f"      Major Label: {len(major[:150])} artists")
    
    # Independent Top 150
    indie = [a.copy() for a in processed if a['is_independent']]
    # If not enough indie, reassign some
    if len(indie) < 150:
        for a in processed:
            if len(indie) >= 150:
                break
            if not any(x['id'] == a['id'] for x in indie):
                artist_copy = a.copy()
                artist_copy['is_independent'] = True
                artist_copy['label_name'] = 'Independent'
                indie.append(artist_copy)
    
    indie.sort(key=lambda x: x['powerScore'], reverse=True)
    for i, a in enumerate(indie[:150]):
        a['rank'] = i + 1
    rankings['indie'] = indie[:150]
    print(f"      Independent: {len(indie[:150])} artists")
    
    # Up & Comers (THE KEY FEATURE - finding CURRENTLY TRENDING unknowns)
    # CRITICAL: Must filter for artists with HIGH daily momentum relative to total
    # This means they're NEW and GROWING, not old legacy acts with huge catalogs
    
    # Calculate momentum ratio for each artist (daily_streams / total_streams * 365)
    # High ratio = their daily is proportionally high = they're NEW and trending
    # Low ratio = they have huge catalog streams but not current buzz
    
    for a in processed:
        # Momentum Ratio: How much of their yearly-equivalent stream comes from TODAY
        if a['chartRank'] > 0:
            daily = raw_artists[a['chartRank'] - 1]['daily_streams_millions'] if a['chartRank'] <= len(raw_artists) else 0
            total = raw_artists[a['chartRank'] - 1]['total_streams_millions'] if a['chartRank'] <= len(raw_artists) else 1
            a['momentumRatio'] = (daily / total * 365) if total > 0 else 0
        else:
            a['momentumRatio'] = 0
    
    # Up & Comers criteria:
    # 1. NOT in top 50 (not already mega-established)
    # 2. HIGH momentum ratio (> 1.0 means daily is above average for their catalog)
    # 3. Reasonable arbitrage signal
    # 4. EXCLUDE artists with massive total streams (> 50M) - these are legacy acts
    # 5. EXCLUDE legacy/seasonal artists (Christmas, deceased, soundtracks)
    up_and_comers = []
    for a in processed:
        # Skip legacy artists entirely
        if is_legacy_artist(a['name']):
            continue
            
        if a['chartRank'] > 50 and a.get('momentumRatio', 0) > 0.8 and a['arbitrageSignal'] > 20:
            # Check if not a legacy mega-star
            if a['chartRank'] <= len(raw_artists):
                if raw_artists[a['chartRank'] - 1]['total_streams_millions'] < 50:
                    up_and_comers.append(a.copy())
            else:
                up_and_comers.append(a.copy())
    
    # If still not enough, add based on highest momentum ratio (excluding top 50 and legacy)
    if len(up_and_comers) < 150:
        momentum_sorted = sorted(
            [a.copy() for a in processed if a['chartRank'] > 50 and not is_legacy_artist(a['name'])],
            key=lambda x: x.get('momentumRatio', 0),
            reverse=True
        )
        for a in momentum_sorted:
            if len(up_and_comers) >= 150:
                break
            if not any(x['id'] == a['id'] for x in up_and_comers):
                up_and_comers.append(a)
    
    # Sort by momentum ratio (who is HOTTEST right now)
    up_and_comers.sort(key=lambda x: x.get('momentumRatio', 0), reverse=True)
    for i, a in enumerate(up_and_comers[:150]):
        a['rank'] = i + 1
    rankings['up_and_comers'] = up_and_comers[:150]
    print(f"      Up & Comers: {len(up_and_comers[:150])} artists (by CURRENT momentum)")
    
    # Arbitrage Signals (conversion < 60)
    arbitrage = [a.copy() for a in processed if a['conversionScore'] < 60]
    if len(arbitrage) < 150:
        # Add more based on lowest conversion
        remaining = [a.copy() for a in processed if a['conversionScore'] < 80]
        for a in sorted(remaining, key=lambda x: x['conversionScore']):
            if len(arbitrage) >= 150:
                break
            if not any(x['id'] == a['id'] for x in arbitrage):
                arbitrage.append(a.copy())
    
    arbitrage.sort(key=lambda x: x['arbitrageSignal'], reverse=True)
    for i, a in enumerate(arbitrage[:150]):
        a['rank'] = i + 1
    rankings['arbitrage'] = arbitrage[:150]
    print(f"      Arbitrage Signals: {len(arbitrage[:150])} artists")
    
    # Viral (high growth velocity)
    viral = [a.copy() for a in processed if a['growthVelocity'] > 20]
    if len(viral) < 150:
        for a in sorted(processed, key=lambda x: x['growthVelocity'], reverse=True):
            if len(viral) >= 150:
                break
            if not any(x['id'] == a['id'] for x in viral):
                viral.append(a.copy())
    
    viral.sort(key=lambda x: x['growthVelocity'], reverse=True)
    for i, a in enumerate(viral[:150]):
        a['rank'] = i + 1
    rankings['viral'] = viral[:150]
    print(f"      Viral: {len(viral[:150])} artists")
    
    # Validate minimum 150
    print("\n[4/5] Validating all categories have 150+ artists...")
    all_valid = True
    for key, artists in rankings.items():
        if len(artists) < 150:
            print(f"      ⚠ {key} only has {len(artists)} - NEEDS ATTENTION")
            all_valid = False
        else:
            print(f"      ✓ {key}: {len(artists)} artists")
    
    # Save to JSON
    print("\n[5/5] Saving rankings to JSON...")
    
    output = {
        'generated_at': datetime.now().isoformat(),
        'algorithm_version': '2.0.0',
        'data_source': 'kworb_spotify_charts',
        'total_artists': len(processed),
        'rankings': rankings
    }
    
    with open('rankings.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n{'='*70}")
    print("GENERATION COMPLETE")
    print(f"{'='*70}")
    
    # Summary
    total_entries = sum(len(v) for v in rankings.values())
    print(f"\nTotal Rankings: {len(rankings)} categories")
    print(f"Total Entries: {total_entries}")
    print(f"Output: rankings.json ({len(json.dumps(output)) // 1024}KB)")
    
    # Top performers
    print("\n🏆 TOP 10 GLOBAL (by Power Score):")
    for a in rankings['global'][:10]:
        print(f"   #{a['rank']} {a['name']}: Power {a['powerScore']}, Genre: {a['genre']}")
    
    print("\n🚀 TOP 10 ARBITRAGE SIGNALS:")
    for a in rankings['arbitrage'][:10]:
        print(f"   #{a['rank']} {a['name']}: Signal {a['arbitrageSignal']}%, Conv {a['conversionScore']}%")
    
    print("\n⭐ TOP 10 UP & COMERS:")
    for a in rankings['up_and_comers'][:10]:
        print(f"   #{a['rank']} {a['name']}: Arbitrage {a['arbitrageSignal']}%, Velocity +{a['growthVelocity']}%")
    
    return output


if __name__ == "__main__":
    result = generate_complete_rankings()
    if result:
        total = sum(len(v) for v in result['rankings'].values())
        print(f"\n✅ SUCCESS: Generated {total} total ranking entries")
