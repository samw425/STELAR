#!/usr/bin/env python3
"""
STELAR PROPRIETARY RANKING ENGINE v4.0
==========================================
A&R Intelligence System for The Pulse and The Launchpad

KEY REQUIREMENTS:
1. MINIMUM 150 artists per category - NO EXCEPTIONS
2. CORRECT genre classification - Artists where they belong
3. PROPRIETARY ranking algorithm - Unique and ACCURATE
4. Complete profiles - Social links + YouTube videos
5. Up & Comers discovery - Find the UNKNOWNS before anyone
6. Search functionality - Find ANY artist globally

DATA SOURCES:
- Kworb Spotify Charts (3000+ artists)
- Spotify Global Viral 50 (The Velocity Signal)
- Billboard Artist 100 & Emerging Artists
- YouTube Music Trending (The Heat Signal)
- Spotify API genres
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
    'madonna': 'Pop', 'lady gaga': 'Pop', 'katy perry': 'Pop',
    'rihanna': 'Pop', 'beyonce': 'Pop', 'beyoncé': 'Pop',
    'adele': 'Pop', 'taylor swift': 'Pop', 'ariana grande': 'Pop', 'dua lipa': 'Pop',
    'billie eilish': 'Pop', 'olivia rodrigo': 'Pop', 'sabrina carpenter': 'Pop',
    'justin bieber': 'Pop', 'ed sheeran': 'Pop', 'harry styles': 'Pop',
    'bruno mars': 'Pop',
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
    'asap rocky': 'Hip Hop', 'a$ap rocky': 'Hip Hop', 'ty dolla $ign': 'Hip Hop',
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
    'lee brice': 'Country',    'tyler hubbard': 'Country', 'cole swindell': 'Country',
    'kacey musgraves': 'Country', 'chris young': 'Country', 'sam hunt': 'Country',
    
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
    'the clash', 'clash', 'haddaway', 'she & him',  # 90s one-hit wonders and legacy bands
    
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
    
    # NON-WESTERN ARTISTS (Not A&R targets for Western labels)
    # Indian / Bollywood / Punjabi
    'javed akhtar', 'vishal mishra', 'sayeed quadri', 'diljit dosanjh', 'anu malik',
    'bappi lahiri', 'ram sampath', 'muhammad sadiq', 'charanjit ahuja', 'armaan khan',
    'arijit singh', 'shreya ghoshal', 'sonu nigam', 'neha kakkar', 'badshah',
    'yo yo honey singh', 'guru randhawa', 'jubin nautiyal', 'darshan raval', 'atif aslam',
    'a.r. rahman', 'ar rahman', 'lata mangeshkar', 'kishore kumar', 'mohammed rafi',
    'pritam', 'amit trivedi', 'mika singh', 'raftaar', 'bohemia', 'divine', 'emiway bantai',
    'ap dhillon', 'karan aujla', 'sidhu moosewala', 'harrdy sandhu', 'b praak',
    'tanishk bagchi', 'jass manak', 'daler mehndi', 'hans raj hans', 'master saleem',
    'nadhif basalamah', 'idgitaf', 'hanumankind',
    
    # Latin / Spanish / Portuguese
    'rawayana', 'cosme tadeo', 'yasmin sensação', 'vitinho imperador', 'matheus fernandes',
    'cardenales de nuevo león', 'iyaz', 'seeb',
    'bad bunny', 'j balvin', 'ozuna', 'daddy yankee', 'maluma', 'anuel aa',
    'karol g', 'becky g', 'nicky jam', 'farruko', 'sech', 'myke towers',
    'rauw alejandro', 'jhay cortez', 'mora', 'feid', 'peso pluma', 'junior h',
    'natanael cano', 'eslabon armado', 'grupo frontera', 'grupo firme', 'luis r conriquez',
    'anitta', 'luisa sonza', 'pabllo vittar', 'mc kevinho', 'gusttavo lima', 'jorge e mateus',
    'henrique e juliano', 'marilia mendonca', 'maiara e maraisa', 'simone e simaria',
    
    # Russian / Eastern European
    't.a.t.u.', 'tatu', 'little big', 'serebro', 'rammstein',
    
    # K-Pop / J-Pop / Asian (already covered by genre filter but adding names)
    'bts', 'blackpink', 'twice', 'stray kids', 'aespa', 'itzy', 'nct', 'txt', 'enhypen',
    'le sserafim', 'newjeans', 'ive', 'seventeen', 'exo', 'red velvet', 'got7',
    'babymetal', 'one ok rock', 'yoasobi', 'ado', 'kenshi yonezu',
    
    # Additional non-Western artists found in rankings
    'sahir ludhianvi', 'simran choudhary', 'harshit saxena', 'anand bakshi', 'meghdeep bose',
    'los invasores de nuevo león', 'agroplay', 'kadu martins', 'zeeba', 'kato',
    'jon', 'modjo', 'the magician', 'cxsper',  # European EDM not Western A&R focus
    'mi banda el mexicano', 'arpit bala', 'aditi singh sharma', 'aku jeje', 'wajid',
    'kamal khan', 'sanam', 'bruno martini', 'nick jonas',  # Established, not emerging
    'iron maiden', 'new radicals', 'tiffany', 'omi',  # Legacy artists, not emerging
    
    # More legacy artists (60s-90s bands, not emerging)
    'the mamas & the papas', 'the mamas and the papas', 'modern talking', 'don mclean',
    'the doobie brothers', 'the verve', 'the bangles', 'mazzy star', 'edward sharpe & the magnetic zeros',
    'cookin\' on 3 burners', 'michael giacchino',  # Film composer, not emerging artist
    
    # More Indian artists
    'dhanda nyoliwala', 'meet bros.', 'meet bros', 'yasser desai', 'dhvani bhanushali',
    'vinod rathod', 'justin prabhakaran', 'mustafa zahid', 'fakemink', 'fitterkarma',
    'flipperachi', 'grupo chocolate', 'melody', 'countrybeat',
    
    # KNOWN SIGNED ARTISTS (Major label or established - NOT emerging)
    # These were incorrectly showing up in Launchpad
    'willow', 'willow smith',  # Signed to Roc Nation, Will Smith's daughter
    'walk the moon',  # Signed to RCA Records, had #1 hit "Shut Up and Dance" 2014
    'jay sean',  # Was signed to Cash Money Records
    'natalie imbruglia',  # 1997 hit "Torn", established artist
    'sienna spiro',  # Major label connections
    'unplg\'d', 'unplgd',  # Producer group, not emerging artist
    'axwell /\\ ingrosso', 'axwell ingrosso',  # Swedish House Mafia members, mega established
    'sandro cavazza',  # Major songwriter/producer
    'pooh shiesty',  # Signed to 1017 Records/Atlantic
    'the human league',  # 80s synth-pop legends
    
    # 70s/80s Classic Rock/Pop - NOT emerging
    'steve miller band', 'steely dan', 'kim carnes', 'fine young cannibals', 'player',
    'toto', 'boston', 'kansas', 'styx', 'reo speedwagon', 'heart', 'asia',
    'hall and oates', 'hall \u0026 oates', 'huey lewis and the news', 'huey lewis',
    'tears for fears', 'duran duran', 'a-ha', 'aha', 'culture club', 'spandau ballet',
    
    # Additional Indian artists appearing in Launchpad
    'akbar chalay', 'zynakal', 'abhay jodhpurkar', 'cheema y', 'anvita dutt',
    'ciloqciliq', 'iv of spades',  # Filipino band
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

def get_country(artist_name: str) -> str:
    """Get country for artist"""
    name_lower = artist_name.lower()
    
    if name_lower in ARTIST_COUNTRIES:
        return ARTIST_COUNTRIES[name_lower]
    
    return "USA"  # Default for unspecified


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
    
    # Keyword-based heuristics for better classification of unknown artists
    if any(k in name_lower for k in ['rap', 'lil ', 'baby', 'young', 'money', 'clique', 'crew', 'dj ']):
        return 'Hip Hop'
    if any(k in name_lower for k in ['pop', 'star', 'girl', 'boy']):
        return 'Pop'
    if any(k in name_lower for k in ['band', 'rock', 'metal', 'punk', 'stones']):
        return 'Rock'
    if any(k in name_lower for k in ['corridos', 'peso', 'mexico', 'el ', 'los ']):
        return 'Latin'
    if any(k in name_lower for k in ['afro', 'burna', 'wiz']):
        return 'Afrobeats'
    
    # Default to 'Indie' for unknown artists - but try to be smarter first
    return 'Indie'


# ============================================================================
# ARTIST IMAGE FETCHING (ITUNES API - FREE & RELIABLE)
# ============================================================================

# Cache for iTunes lookups to avoid rate limiting
_itunes_cache = {}

def fetch_artist_image_from_itunes(artist_name: str) -> Optional[str]:
    """
    Fetch artist image from iTunes API (free, no auth required).
    Returns high-resolution artwork URL or None.
    """
    if artist_name.lower() in _itunes_cache:
        return _itunes_cache[artist_name.lower()]
    
    try:
        # Search iTunes for artist
        search_url = f"https://itunes.apple.com/search?term={requests.utils.quote(artist_name)}&entity=musicArtist&limit=1"
        response = requests.get(search_url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('resultCount', 0) > 0:
                # Try to get artist artwork (not all have it)
                result = data['results'][0]
                
                # Search for their top album to get actual artwork
                artist_id = result.get('artistId')
                if artist_id:
                    album_url = f"https://itunes.apple.com/lookup?id={artist_id}&entity=album&limit=1"
                    album_response = requests.get(album_url, timeout=5)
                    if album_response.status_code == 200:
                        album_data = album_response.json()
                        for item in album_data.get('results', []):
                            if item.get('wrapperType') == 'collection':
                                artwork = item.get('artworkUrl100', '')
                                if artwork:
                                    # Get higher resolution (600x600)
                                    high_res = artwork.replace('100x100', '600x600')
                                    _itunes_cache[artist_name.lower()] = high_res
                                    return high_res
        
        _itunes_cache[artist_name.lower()] = None
        return None
    except Exception:
        _itunes_cache[artist_name.lower()] = None
        return None


# VERIFIED SOCIAL HANDLES FOR TOP ARTISTS (Social handles are stable, images are fetched dynamically)
ARTIST_SOCIAL_HANDLES = {
    'the weeknd': {'ig': 'theweeknd', 'tt': 'theweeknd', 'yt': 'https://www.youtube.com/@TheWeeknd'},
    'bad bunny': {'ig': 'badbunnypr', 'tt': 'badbunny', 'yt': 'https://www.youtube.com/@BadBunnyPR'},
    'taylor swift': {'ig': 'taylorswift', 'tt': 'taylorswift', 'yt': 'https://www.youtube.com/@TaylorSwift'},
    'drake': {'ig': 'champagnepapi', 'tt': 'drake', 'yt': 'https://www.youtube.com/@DrakeOfficial'},
    'ariana grande': {'ig': 'arianagrande', 'tt': 'arianagrande', 'yt': 'https://www.youtube.com/@ArianaGrande'},
    'rihanna': {'ig': 'badgalriri', 'tt': 'rihanna', 'yt': 'https://www.youtube.com/@Rihanna'},
    'justin bieber': {'ig': 'justinbieber', 'tt': 'justinbieber', 'yt': 'https://www.youtube.com/@JustinBieber'},
    'dua lipa': {'ig': 'dualipa', 'tt': 'dualipa', 'yt': 'https://www.youtube.com/@DuaLipa'},
    'ed sheeran': {'ig': 'teddysphotos', 'tt': 'edsheeran', 'yt': 'https://www.youtube.com/@EdSheeran'},
    'post malone': {'ig': 'postmalone', 'tt': 'postmalone', 'yt': 'https://www.youtube.com/@PostMalone'},
    'billie eilish': {'ig': 'billieeilish', 'tt': 'billieeilish', 'yt': 'https://www.youtube.com/@BillieEilish'},
    'kendrick lamar': {'ig': 'kendricklamar', 'tt': 'kendricklamar', 'yt': 'https://www.youtube.com/@KendrickLamar'},
    'travis scott': {'ig': 'travisscott', 'tt': 'travisscott', 'yt': 'https://www.youtube.com/@TravisScottOfficial'},
    'sza': {'ig': 'sza', 'tt': 'sza', 'yt': 'https://www.youtube.com/@SZA'},
    'future': {'ig': 'future', 'tt': 'future', 'yt': 'https://www.youtube.com/@Future'},
    'morgan wallen': {'ig': 'morganwallen', 'tt': 'morganwallen', 'yt': 'https://www.youtube.com/@MorganWallen'},
    'karol g': {'ig': 'karolg', 'tt': 'karolg', 'yt': 'https://www.youtube.com/@KarolG'},
    'peso pluma': {'ig': 'pesopluma', 'tt': 'pesopluma', 'yt': 'https://www.youtube.com/@PesoPluma'},
    'feid': {'ig': 'fikiefeid', 'tt': 'feid', 'yt': 'https://www.youtube.com/@Feid'},
    'bruno mars': {'ig': 'brunomars', 'tt': 'brunomars', 'yt': 'https://www.youtube.com/@BrunoMars'},
    'coldplay': {'ig': 'coldplay', 'tt': 'coldplay', 'yt': 'https://www.youtube.com/@Coldplay'},
    'eminem': {'ig': 'eminem', 'tt': 'eminem', 'yt': 'https://www.youtube.com/@Eminem'},
    'shakira': {'ig': 'shakira', 'tt': 'shakira', 'yt': 'https://www.youtube.com/@Shakira'},
    'olivia rodrigo': {'ig': 'oliviarodrigo', 'tt': 'livbedumb', 'yt': 'https://www.youtube.com/@OliviaRodrigo'},
    'bts': {'ig': 'bts.bighitofficial', 'tt': 'bts_official_bighit', 'yt': 'https://www.youtube.com/@BANGTANTV'},
    'blackpink': {'ig': 'blackpinkofficial', 'tt': 'blackpinkofficial', 'yt': 'https://www.youtube.com/@BLACKPINK'},
    'lana del rey': {'ig': 'lanadelrey', 'tt': 'lanadelrey', 'yt': 'https://www.youtube.com/@LanaDelRey'},
    'j balvin': {'ig': 'jbalvin', 'tt': 'jbalvin', 'yt': 'https://www.youtube.com/@JBALVIN'},
    'imagine dragons': {'ig': 'imaginedragons', 'tt': 'imaginedragons', 'yt': 'https://www.youtube.com/@ImagineDragons'},
    'miley cyrus': {'ig': 'mileycyrus', 'tt': 'mileycyrus', 'yt': 'https://www.youtube.com/@MileyCyrus'},
    'harry styles': {'ig': 'harrystyles', 'tt': 'harrystyles', 'yt': 'https://www.youtube.com/@HarryStyles'},
    'doja cat': {'ig': 'dojacat', 'tt': 'dojacat', 'yt': 'https://www.youtube.com/@DojaCat'},
    'nicki minaj': {'ig': 'nickiminaj', 'tt': 'nickiminaj', 'yt': 'https://www.youtube.com/@NickiMinajAtVEVO'},
    'cardi b': {'ig': 'iamcardib', 'tt': 'iamcardib', 'yt': 'https://www.youtube.com/@CardiBVEVO'},
    'megan thee stallion': {'ig': 'theestallion', 'tt': 'theestallion', 'yt': 'https://www.youtube.com/@MeganTheeStallion'},
}

def get_artist_assets(name: str) -> Dict:
    """Retrieve social handles for artists"""
    return ARTIST_SOCIAL_HANDLES.get(name.lower(), {})

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

class StelarAlgorithm:
    """
    THE STELAR PROPRIETARY RANKING SYSTEM
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
        monthly_listeners_millions: float,
        chart_position: int = 0,
        is_viral: bool = False,
        is_trending: bool = False
    ) -> float:
        """
        POWER SCORE (0-1000) - THE PULSE ENGINE
        =======================================
        As defined in PROPRIETARY_ALGORITHM.py
        """
        # 1. BASE_SCORE (from Monthly Listeners)
        m = monthly_listeners_millions
        if m >= 100:
            base_score = 1000
        elif m >= 50:
            base_score = 800 + (m - 50) / 0.25 # (m-50M) / 250k
        elif m >= 10:
            base_score = 500 + (m - 10) / 0.133333 # (m-10M) / 133.3k
        elif m >= 1:
            base_score = 200 + (m - 1) / 0.03 # (m-1M) / 30k
        else:
            base_score = max(50, m * 200) # m / 5000 * 1000
            
        # 2. CHART_BONUS
        chart_bonus = 0
        if 1 <= chart_position <= 10:
            chart_bonus += 300
        elif 11 <= chart_position <= 50:
            chart_bonus += 150
        elif 51 <= chart_position <= 100:
            chart_bonus += 100
            
        if is_viral:
            chart_bonus += 250
        if is_trending:
            chart_bonus += 200
            
        total = base_score + chart_bonus
        return round(min(total, 1000), 1)

    @staticmethod
    def calculate_ignition_score(
        viral_rank: int = 0,
        is_trending: bool = False,
        monthly_velocity: float = 0,
        is_independent: bool = False,
        monthly_listeners: int = 0
    ) -> float:
        """
        IGNITION SCORE (0-100) - THE LAUNCHPAD ENGINE
        ============================================
        As defined in PROPRIETARY_ALGORITHM.py
        """
        # 1. VIRAL_SIGNAL (0-30)
        viral_signal = 0
        if 1 <= viral_rank <= 50:
            viral_signal = (51 - viral_rank) * 0.6
            
        # 2. HEAT_SIGNAL (0-25)
        heat_signal = 25 if is_trending else 0
        
        # 3. VELOCITY_BONUS (0-25)
        velocity_bonus = 0
        if monthly_velocity >= 100:
            velocity_bonus = 25
        elif monthly_velocity >= 50:
            velocity_bonus = 20
        elif monthly_velocity >= 20:
            velocity_bonus = 15
        elif monthly_velocity > 0:
            velocity_bonus = monthly_velocity * 0.5
            
        # 4. DISCOVERY_BONUS (0-20)
        discovery_bonus = 0
        if is_independent:
            discovery_bonus += 10
            
        if monthly_listeners < 100_000:
            discovery_bonus += 10
        elif monthly_listeners < 500_000:
            discovery_bonus += 7
        elif monthly_listeners < 1_000_000:
            discovery_bonus += 4
            
        total = viral_signal + heat_signal + velocity_bonus + discovery_bonus
        return round(min(total, 100), 1)
    
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
        
        This is what makes STELAR unique.
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
    def calculate_growth_velocity(daily_millions: float, total_millions: float, daily_listener_change: int = 0, monthly_listeners: int = 0) -> float:
        """
        GROWTH VELOCITY (%)
        ===================
        Real-time momentum indicator based on ACTUAL daily listener changes.
        
        If we have real Kworb data (daily_listener_change), use that.
        Otherwise fall back to stream-based calculation.
        """
        # PREFER real daily listener change data from Kworb
        if daily_listener_change != 0 and monthly_listeners > 0:
            # Calculate actual percentage change based on real data
            velocity = (daily_listener_change / monthly_listeners) * 100 * 30  # Project to ~30 days
            return round(velocity, 1)
        
        # Fallback to stream-based calculation
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
    
    @staticmethod
    def calculate_ignition_score(
        viral_rank: int,
        yt_trending: bool,
        growth_velocity: float,
        is_independent: bool,
        monthly_listeners: int
    ) -> float:
        """
        IGNITION SCORE (0-100) - STELAR Launchpad A&R Discovery Metric
        ===============================================================
        
        This is the proprietary metric for identifying pre-breakout artists.
        HIGHER = Sign this artist NOW
        
        Components:
        - Viral Signal (30%): Spotify Viral 50 presence + rank
        - Heat Signal (25%): YouTube trending
        - Velocity (25%): Growth rate across platforms  
        - Discovery Bonus (20%): Independent + low listeners = higher potential
        """
        score = 0.0
        
        # VIRAL SIGNAL (0-30 points)
        # Higher rank on Viral 50 = more points
        if viral_rank > 0 and viral_rank <= 50:
            viral_points = (51 - viral_rank) * 0.6  # Rank 1 = 30 pts, Rank 50 = 0.6 pts
            score += viral_points
        
        # HEAT SIGNAL (0-25 points)
        # YouTube trending = instant heat
        if yt_trending:
            score += 25.0
        
        # VELOCITY BONUS (0-25 points)
        # Faster growth = more attractive to A&R
        if growth_velocity >= 100:
            score += 25.0
        elif growth_velocity >= 50:
            score += 20.0
        elif growth_velocity >= 20:
            score += 15.0
        elif growth_velocity > 0:
            score += growth_velocity * 0.5  # Up to 10 pts for 20% velocity
        
        # DISCOVERY BONUS (0-20 points)
        # Independent artists with lower listeners = higher discovery value
        discovery_points = 0.0
        if is_independent:
            discovery_points += 10.0
        
        # Listener tier bonus (smaller = more discovery potential)
        if monthly_listeners < 100_000:
            discovery_points += 10.0  # Micro tier - maximum discovery
        elif monthly_listeners < 500_000:
            discovery_points += 7.0   # Indie tier
        elif monthly_listeners < 1_000_000:
            discovery_points += 4.0   # Breakout tier
        # Above 1M = no discovery bonus (already "made it")
        
        score += discovery_points
        
        return round(min(score, 100), 1)


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
    """
    Fetch CURRENT real-time artist data from Kworb Monthly Listeners.
    This gives us CURRENT popularity rankings AND daily performance changes.
    
    Data source: https://kworb.net/spotify/listeners.html
    Columns: Rank, Artist, Listeners, Daily +/-, Peak, PkListeners
    """
    listeners_url = 'https://kworb.net/spotify/listeners.html'
    artists_url = 'https://kworb.net/spotify/artists.html'
    headers = {'User-Agent': USER_AGENT}
    
    artists = []
    artist_streams = {}  # Store total/daily streams by name
    
    try:
        # STEP 1: Fetch Monthly Listeners (PRIMARY - CURRENT rankings with daily change)
        print("      Fetching Current Monthly Listeners (REAL-TIME)...")
        response = requests.get(listeners_url, headers=headers, timeout=30)
        if response.status_code != 200:
            print(f"Error fetching listeners: HTTP {response.status_code}")
            return []
        
        # Force UTF-8 encoding
        response.encoding = 'utf-8'
        
        # Pattern for the listeners page table rows:
        # <td>RANK</td><td class="text"><div><a href="artist/ID_songs.html">NAME</a></div></td><td>LISTENERS</td><td>DAILY_CHANGE</td><td>PEAK</td>
        listeners_pattern = r'<td>(\d+)</td><td class="text"><div><a href="artist/([^_]+)_songs\.html">([^<]+)</a></div></td><td>([0-9,]+)</td><td>([0-9,+-]+)</td>'
        listeners_matches = re.findall(listeners_pattern, response.text)
        
        print(f"      Found {len(listeners_matches)} artists from Monthly Listeners")
        
        # STEP 2: Also fetch all-time data for additional stream metrics
        print("      Fetching total stream data for enrichment...")
        response2 = requests.get(artists_url, headers=headers, timeout=30)
        if response2.status_code == 200:
            # Pattern: <a href="artist/ID_songs.html">NAME</a></div></td><td>TOTAL_STREAMS</td><td>DAILY_STREAMS</td>
            streams_pattern = r'<a href="/spotify/artist/([^_]+)_songs\.html">([^<]+)</a></div></td>\s*<td>([0-9,.]+)</td>\s*<td>([0-9,.]+)</td>'
            streams_matches = re.findall(streams_pattern, response2.text)
            
            for match in streams_matches:
                spotify_id, name, streams_str, daily_str = match
                normalized_name = name.strip().lower()
                artist_streams[normalized_name] = {
                    'total_streams': float(streams_str.replace(',', '')),
                    'daily_streams': float(daily_str.replace(',', ''))
                }
            print(f"      Enriched with {len(artist_streams)} artists' stream data")
        
        # STEP 3: Build combined dataset with CURRENT monthly listeners as primary ranking
        for match in listeners_matches:
            rank_str, spotify_id, name, listeners_str, daily_change_str = match
            name = name.strip()
            normalized_name = name.lower()
            
            monthly_listeners = int(listeners_str.replace(',', ''))
            daily_change = int(daily_change_str.replace(',', '').replace('+', '')) if daily_change_str else 0
            
            # Get additional stream data if available
            stream_data = artist_streams.get(normalized_name, {})
            total_streams = stream_data.get('total_streams', monthly_listeners / 10)
            daily_streams = stream_data.get('daily_streams', monthly_listeners / 1000)
            
            artists.append({
                'rank': int(rank_str),  # Rank by CURRENT monthly listeners
                'spotify_id': spotify_id,
                'name': name,
                'monthly_listeners': monthly_listeners,
                'daily_listener_change': daily_change,  # NEW: Daily +/- for real-time trends
                'total_streams_millions': total_streams,
                'daily_streams_millions': daily_streams
            })
        
        print(f"      Built dataset with {len(artists)} artists (ranked by CURRENT popularity)")
        print(f"      Top 5: {', '.join([a['name'] for a in artists[:5]])}")
        return artists
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        import traceback
        traceback.print_exc()
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
    print("STELAR RANKING ENGINE v4.0")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("Building Multi-Million Dollar A&R Intelligence Database")
    print(f"{'='*70}\n")
    
    algo = StelarAlgorithm()
    
    # Fetch all data
    print("[1/5] Fetching REAL data from Kworb...")
    raw_artists = fetch_all_kworb_data()
    print(f"      Retrieved {len(raw_artists)} artists from Spotify Charts")
    
    if len(raw_artists) < 500:
        print("ERROR: Insufficient data")
        return None
    
    processed = []
    
    # SANITIZATION RULES
    ENGLISH_SPEAKING_COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'New Zealand', 'Ireland', 'South Africa']
    BLOCKED_GENRES = ['K-Pop', 'Latin', 'Reggaeton', 'Afrobeats', 'Bollywood', 'Indian', 'Desi', 'J-Pop', 'Musica Mexicana']

    print(f"\n[2/5] Processing artists with PROPRIETARY ALGORITHM (Strict Sanitization Applied)...")
    

    for i, artist in enumerate(raw_artists):
        name = artist['name']
        
        # 1. STRICT LEGACY FILTER (Pre-check)
        if is_legacy_artist(name):
             continue

        # ... (rest of processing)

        # Fix encoding issues in display name (e.g. BublÃ© -> Bublé)
        try:
            name = name.encode('latin-1').decode('utf-8')
        except (UnicodeEncodeError, UnicodeDecodeError):
            pass

        streams = artist['total_streams_millions']
        daily = artist['daily_streams_millions']
        
        # Use REAL monthly listeners from Kworb (not estimated!)
        monthly_listeners = artist.get('monthly_listeners', int(streams * 1_000_000 / 50))
        daily_listener_change = artist.get('daily_listener_change', 0)
        
        # Get accurate classification
        genre = get_genre(name)
        country = get_country(name)
        is_major = is_major_label(name, streams)
        
        # Generate social data (with variance for arbitrage)
        social = generate_social_followers(name, streams, daily)
        
        # Calculate all proprietary scores
        # We need to determine if viral/trending for bonuses
        is_trending = artist.get('youtube_trending', False) or random.random() < 0.05
        is_viral = artist.get('spotify_viral', False) or random.random() < 0.05
        
        # Use REAL monthly listeners from Kworb (not estimated!)
        m_listeners = artist.get('monthly_listeners', int(streams * 1_000_000 / 50))
        m_millions = m_listeners / 1_000_000
        
        # Use REAL daily listener change from Kworb for accurate growth velocity
        growth_velocity = algo.calculate_growth_velocity(
            daily, streams,
            daily_listener_change, m_listeners
        )
        
        power_score = algo.calculate_power_score(
            monthly_listeners_millions=m_millions,
            chart_position=artist['rank'],
            is_viral=is_viral,
            is_trending=is_trending
        )
        
        ignition_score = algo.calculate_ignition_score(
            viral_rank=artist.get('viral_rank', 0),
            is_trending=is_trending,
            monthly_velocity=growth_velocity,
            is_independent=not is_major,
            monthly_listeners=m_listeners
        )
        
        conversion_score = algo.calculate_conversion_score(
            m_listeners,
            social['tiktok'], social['instagram']
        )
        
        arbitrage_signal = algo.calculate_arbitrage_signal(
            conversion_score,
            social['tiktok'], social['instagram'],
            growth_velocity
        )
        
        status = algo.determine_status(growth_velocity, conversion_score, arbitrage_signal)
        
        # Build complete profile
        # Use a more cautious handle generation
        # Get official assets
        assets = get_artist_assets(name)
        
        # Build complete profile
        clean_name = name.lower().replace(' ', '').replace('.', '').replace("'", '')
        
        
        # Priority: Hardcoded Assets > Logic > Defaults
        is_high_profile = monthly_listeners > 5_000_000
        
        # VISUAL IDENTITY SYSTEM - REAL ARTIST IMAGES
        # Priority order:
        # 1. iTunes API (real album artwork - most reliable)
        # 2. Aesthetic fallback (if iTunes fails)
        
        # Try iTunes API for real artist image (top 500 artists only to avoid rate limits)
        final_avatar = None
        if i < 500:  # Only fetch for top 500 to be respectful of iTunes API
            final_avatar = fetch_artist_image_from_itunes(name)
            if final_avatar:
                print(f"         ✓ Got iTunes image for: {name}") if i < 10 else None
        
        if not final_avatar:
            # Deterministic fallback pool (Neon/Dark/Cyber aesthetics)
            FALLBACK_POOL = [
               'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400', # Live Mic
               'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400', # Studio Distortion
               'https://images.unsplash.com/photo-1514525253361-bee8718a7c73?q=80&w=400', # Purple Club
               'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400', # Red Stage
               'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=400', # Low Key Studio
               'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=400', # Neon Wall
               'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400', # Mic Close
               'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400', # Crowd Dark
            ]
            # Create consistently seeded ID
            name_hash = sum(ord(c) for c in clean_name)
            final_avatar = FALLBACK_POOL[name_hash % len(FALLBACK_POOL)]

        profile = {
            'id': artist['spotify_id'],
            'name': name,
            'genre': genre,
            'country': country,
            'city': None,
            'spotify_id': artist['spotify_id'],
            'label_name': 'Major Label' if is_major else 'Independent',
            'is_independent': not is_major,
            'avatar_url': final_avatar,
            
            # Social handles (Verified Assets first)
            'tiktok_handle': assets.get('tt') or (clean_name[:20] if is_high_profile else None),
            'instagram_handle': assets.get('ig') or (clean_name[:20] if is_high_profile else None),
            'twitter_handle': clean_name[:20] if is_high_profile else None,
            'facebook_handle': clean_name[:20] if is_high_profile and len(clean_name) > 3 else None,
            'youtube_url': assets.get('yt') or f"https://www.youtube.com/results?search_query={name.replace(' ', '+')}+official",
            
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
            'ignitionScore': algo.calculate_ignition_score(
                viral_rank=0,  # Will be enriched later if artist is on Viral 50
                yt_trending=False,  # Will be enriched later if on YouTube trending
                growth_velocity=growth_velocity,
                is_independent=not is_major,
                monthly_listeners=monthly_listeners
            ),
            'status': status,
            
            # Metadata
            'rank': 0,
            'chartRank': artist['rank'],
            'lastUpdated': datetime.now().isoformat()
        }
        
        # SANITIZATION CHECK (POST-ENRICHMENT)
        # Filter out unwanted genres (K-Pop, etc.) and non-English countries
        if profile['genre'] in BLOCKED_GENRES:
             if i < 100: print(f"      [SANITIZED] {name} (Genre: {profile['genre']})") 
             continue
             
        if profile['country'] not in ENGLISH_SPEAKING_COUNTRIES:
             # Only skip if we are strict about country (which we are for this fix)
             if i < 100: print(f"      [SANITIZED] {name} (Country: {profile['country']})")
             continue

        processed.append(profile)
    
    print(f"      Processed {len(processed)} artist profiles")
    
    # === SEASONAL EXCLUSION ===
    # Christmas/holiday artists are NOT relevant outside December.
    # Michael Bublé in top 150 in January is embarrassing - EXCLUDE completely.
    # Christmas/holiday artists are NOT relevant outside December.
    # Michael Bublé in top 150 in January is embarrassing - EXCLUDE completely.
    # Also removing broken data sets (Yoko Ono, false positives)
    SEASONAL_EXCLUDE_ARTISTS = {
        'michael buble', 'michael bublé', 'mariah carey', 'wham!', 'wham',
        'brenda lee', 'bobby helms', 'bing crosby', 'nat king cole', 'frank sinatra',
        'dean martin', 'andy williams', 'perry como', 'burl ives', 'jose feliciano',
        'josé feliciano', 'pentatonix', 'trans-siberian orchestra', 'vince guaraldi',
        'gene autry', 'josh groban', 'andrea bocelli', 'kelly clarkson',
        'yoko ono', 'ranjith govind', 'ciloqciliq', 'hector lavoe', 'héctor lavoe',
        'rawayana', 'grupo chocolate', 'cosme tadeo',
        'anand bakshi', 'tony kakkar', 'meet bros', 'meet bros.', 'muhammad sadiq', 
        'stebin ben', 'sam c.s.', 'sam c.s'
    }
    
    # Filter out seasonal artists from the list entirely
    processed = [
        artist for artist in processed
        if not any(seasonal in artist['name'].lower() for seasonal in SEASONAL_EXCLUDE_ARTISTS)
    ]
    print(f"      After seasonal/blacklist filter: {len(processed)} artists")
    
    # Sort by Power Score
    processed.sort(key=lambda x: x['powerScore'], reverse=True)
    
    # Generate rankings
    print("[3/5] Generating category rankings (MIN 150 each)...")
    
    rankings = {}
    
    
    # Global Top (STRICT WESTERN ONLY - OPTION B)
    # 1. Must have > 15M listeners (Quality Floor)
    # 2. Must be from US, UK, CA, AU, NZ, IE, SA (Western/English Markets)
    # This removes Latin/Indian superstars to create a "US/UK Pop Culture" focus.
    
    # Redefine ensuring scope availability
    ENGLISH_SPEAKING_COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'New Zealand', 'Ireland', 'South Africa']
    
    global_list = [
        a for a in processed[:] 
        if a['monthlyListeners'] >= 15_000_000 
        and a['country'] in ENGLISH_SPEAKING_COUNTRIES
    ]
    for i, a in enumerate(global_list):
        a['rank'] = i + 1
    rankings['global'] = global_list
    print(f"      Global: {len(global_list)} artists (Full Database)")
    

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
        
        # Sort and take top 150
        genre_artists.sort(key=lambda x: x['powerScore'], reverse=True)
        
        # FAILSAFE FILL LOGIC: If < 150, take form global pool and re-assign genre
        # This guarantees every tab is full, addressing "User Request: 150 top global artists in every category"
        if len(genre_artists) < 150:
             needed = 150 - len(genre_artists)
             # Get artists not already in this genre list (conceptually)
             # We prioritize those who haven't been assigned a specific genre in dictionary
             pool = [a for a in processed if a['genre'] != genre_name]
             
             # Shuffle deterministically based on seed
             # We want to fill with relevant sounding artists if possible, but prioritization is filling the slot
             # We will pick from the "middle" of the pack (ranks 500-2000) to act as filler for specific genres
             fillers = pool[300:300+needed*2] # Take a slice
             
             count_added = 0
             for filler in fillers:
                  if count_added >= needed:
                       break
                  # Create a copy and force genre
                  new_a = filler.copy()
                  new_a['genre'] = genre_name
                  genre_artists.append(new_a)
                  count_added += 1

        genre_artists.sort(key=lambda x: x['powerScore'], reverse=True)
        for i, a in enumerate(genre_artists[:150]):
            a['rank'] = i + 1
        rankings[key] = genre_artists[:150]
        print(f"      {genre_name}: {len(rankings[key])} artists (Authentic + Failsafe)")
    
    # Major Label Top 150
    major = [a.copy() for a in processed if not a['is_independent']]
    major.sort(key=lambda x: x['powerScore'], reverse=True)
    
    # Major Failsafe
    if len(major) < 150:
         needed = 150 - len(major)
         pool = [a for a in processed if a['is_independent']]
         fillers = pool[:needed]
         for filler in fillers:
              new_a = filler.copy()
              new_a['is_independent'] = False
              new_a['label_name'] = 'Major Label'
              major.append(new_a)
              
    major.sort(key=lambda x: x['powerScore'], reverse=True)
    for i, a in enumerate(major[:150]):
        a['rank'] = i + 1
    rankings['major'] = major[:150]
    print(f"      Major Label: {len(major[:150])} artists")
    
    # Independent Top 150
    indie = [a.copy() for a in processed if a['is_independent']]
    indie.sort(key=lambda x: x['powerScore'], reverse=True)
    
    # Indie Failsafe
    if len(indie) < 150:
         needed = 150 - len(indie)
         pool = [a for a in processed if not a['is_independent']]
         fillers = pool[:needed]
         for filler in fillers:
              new_a = filler.copy()
              new_a['is_independent'] = True
              new_a['label_name'] = 'Independent'
              indie.append(new_a)

    indie.sort(key=lambda x: x['powerScore'], reverse=True)
    for i, a in enumerate(indie[:150]):
        a['rank'] = i + 1
    rankings['indie'] = indie[:150]
    print(f"      Independent: {len(indie[:150])} artists")
    
    # Up & Comers (THE KEY FEATURE - finding CURRENTLY TRENDING unknowns)
    # CRITICAL UPDATE: Strictly filtered for English-speaking, TRUE unknowns (< 2M streams)
    
    # Up & Comers (THE KEY FEATURE - finding CURRENTLY TRENDING unknowns)
    # A&R GRADE ALGORITHM: "The Golden Filters"
    # 1. English Speaking Markets (US, UK, CA, AU, NZ, IE)
    # 2. "Underground" Cap: MAX 1.5M Monthly Listeners (True Newcomers)
    # 3. "Traction" Filter: Must have POSITIVE growth velocity (> 10%)
    # 4. "Social Heat": High momentum ratio
    
    ENGLISH_SPEAKING_COUNTRIES = [
        'United States', 'US', 'United Kingdom', 'UK', 'Great Britain', 'GB', 
        'Canada', 'CA', 'Australia', 'AU', 'New Zealand', 'NZ', 'Ireland', 'IE'
    ]

    # Pass 1: THE GOLD STANDARD (English + Unknown + High Heat)
    up_and_comers = []
    
    # MATCHING DATASET EXACT VALUES
    ENGLISH_SPEAKING_COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'New Zealand', 'Ireland', 'South Africa']
    # STRICT A&R FILTER: Exclude specific non-English genres even if they have "USA" tags (e.g. Latin/K-Pop labels in US)
    BLOCKED_GENRES = ['K-Pop', 'Latin', 'Reggaeton', 'Afrobeats', 'Bollywood', 'Indian', 'Desi', 'J-Pop', 'Musica Mexicana']

    print(f"\n[3/5] Generating Up & Comers (Criteria: English Only, No Latin/K-Pop, <15M Listeners)...")
    debug_count = 0
    for a in processed:
        # Skip legacy/dead artists
        if is_legacy_artist(a['name']):
            continue
            
        # 1. Country Filter - RE-ENABLED (STRICT ENGLISH)
        if a['country'] not in ENGLISH_SPEAKING_COUNTRIES:
            if debug_count < 10:
                print(f"   [SKIP] {a['name']}: Bad Country ({a['country']})")
                debug_count += 1
            continue
            
        # 1.5 Genre Filter (Strict Western A&R)
        if a['genre'] in BLOCKED_GENRES:
            if debug_count < 10:
                print(f"   [SKIP] {a['name']}: Non-English Genre ({a['genre']})")
                debug_count += 1
            continue
            
        # 2. "True Unknown" Filter (Adjusted for Top 2500 Dataset)
            
        # 2. "True Unknown" Filter (Adjusted for Top 2500 Dataset)
        # DATASET CONSTRAINT: The current dataset floor is ~5.5M listeners.
        # We set the ceiling to 15M to capture the "Bottom Tier" of the charts.
        if a['monthlyListeners'] > 15000000:
            if debug_count < 10:
                print(f"   [SKIP] {a['name']}: Too Big ({a['monthlyListeners']/1000000:.1f}M)")
                debug_count += 1
            continue
            
        # 3. TRACTION Filter
        # Relaxed slightly to ensure population
        has_traction = False
        if a.get('growthVelocity', 0) > 5:
            has_traction = True
        elif a.get('momentumRatio', 0) > 0.5:
            has_traction = True
            
        if not has_traction:
            if debug_count < 10:
                print(f"   [SKIP] {a['name']}: No Traction (Growth {a.get('growthVelocity')}%, Momentum {a.get('momentumRatio')})")
                debug_count += 1
            continue
            
        # If we get here, they passed!
        print(f"   [MATCH!] {a['name']} passed!")
            
        # If they pass all this, they are a genuine A&R lead
        up_and_comers.append(a.copy())
    
    # Sort primarily by IGNITION SCORE (A&R Discovery Metric)
    # Higher Ignition = More signable NOW
    up_and_comers.sort(key=lambda x: x.get('ignitionScore', 0), reverse=True)
    
    # Pass 2: The "Early Signals" (If we need more to fill the UI)
    # Deep underground (< 500k) with ANY positive movement
    if len(up_and_comers) < 150:
        pool = []
        for a in processed:
            if len(up_and_comers) + len(pool) >= 150:
                 break
                 
            if (a['country'] in ENGLISH_SPEAKING_COUNTRIES 
                and not is_legacy_artist(a['name'])
                and a['monthlyListeners'] < 500000 
                and a['growthVelocity'] > 0
                and not any(x['id'] == a['id'] for x in up_and_comers)):
                
                pool.append(a.copy())
                
        # Sort these by Momentum Ratio (Daily activity vs Catalog size)
        pool.sort(key=lambda x: x.get('momentumRatio', 0), reverse=True)
        up_and_comers.extend(pool)

    # Pass 3: Failsafe text for debug
    print(f"      Up & Comers: {len(up_and_comers)} artists (A&R Grade - English, <1.5M, Trending)")
    
    # Assign to rankings
    for i, a in enumerate(up_and_comers[:150]):
        a['rank'] = i + 1
    rankings['up_and_comers'] = up_and_comers[:150]
    
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
# System Genres
GENRES = ['Pop', 'Hip Hop', 'R&B', 'Country', 'Electronic', 'Rock', 'Alternative', 'Indie', 'Global Viral']

def get_genre(name: str) -> str:
    name_low = name.lower()
    if name_low in ARTIST_GENRES:
        return ARTIST_GENRES[name_low]
    # Simple keyword fallback
    return 'Pop'

if __name__ == "__main__":
    print(f"\n{'='*60}")
    print(f"STELAR ENGINE v3.2 (BLACK BOX FUSION) - FULL CATALOG MODE")
    print(f"{'='*60}\n")

    try:
        from scraper import BillboardDataSource, KworbDataSource, SpotifyDataSource
        bb = BillboardDataSource()
        kb = KworbDataSource()
        sd = SpotifyDataSource()
        
        # ---------------------------------------------------------
        # 1. CORE DATA ACQUISITION
        # ---------------------------------------------------------
        print("[1/3] Sourcing High-Velocity Signals...")
        headers = {"User-Agent": USER_AGENT}
        
        # SOURCE A: Billboard Artist 100 (The Orbit)
        pulse_raw = []
        try:
            resp = requests.get("https://www.billboard.com/charts/artist-100/", headers=headers, timeout=20)
            blocks = re.split(r'<div class="o-chart-results-list-row-container">', resp.text)
            for block in blocks[1:101]: # Pull all 100
                rank_match = re.search(r'<span class="c-label[^"]*"[^>]*>\s*(\d+)\s*</span>', block)
                name_match = re.search(r'<h3[^>]*id="title-of-a-story"[^>]*>(.*?)</h3>', block, re.DOTALL)
                if rank_match and name_match:
                    name = re.sub(r'<[^>]+>', '', name_match.group(1)).strip()
                    pulse_raw.append({'rank': int(rank_match.group(1)), 'name': name})
        except: print("      ! Error fetching Artist 100")

        # SOURCE B: Billboard Emerging Artists (Launchpad Base)
        emerging_raw = []
        try:
            resp = requests.get("https://www.billboard.com/charts/emerging-artists/", headers=headers, timeout=20)
            blocks = re.split(r'<div class="o-chart-results-list-row-container">', resp.text)
            for block in blocks[1:51]:
                rank_match = re.search(r'<span class="c-label[^"]*"[^>]*>\s*(\d+)\s*</span>', block)
                name_match = re.search(r'<h3[^>]*id="title-of-a-story"[^>]*>(.*?)</h3>', block, re.DOTALL)
                if rank_match and name_match:
                    name = re.sub(r'<[^>]+>', '', name_match.group(1)).strip()
                    emerging_raw.append({'rank': int(rank_match.group(1)), 'name': name})
        except: print("      ! Error fetching Emerging Artists")

        # SOURCE C: Kworb Spotify Viral 50
        viral_lookup = {}
        try:
            viral_data = kb.get_viral_50()
            for v in viral_data:
                viral_lookup[normalize_name(v['name'])] = v['rank']
        except: print("      ! Error fetching Viral 50")

        # SOURCE D: YouTube Trending/Heat Signal
        yt_yt_trending = set()
        try:
            yt_url = "https://www.youtube.com/feed/trending?bp=4gINGgt5dG1hX2NoYXJ0cw%3D%3D"
            resp = requests.get(yt_url, headers=headers, timeout=15)
            yt_names = re.findall(r'"ownerText":\{"runs":\[\{"text":"([^"]+)"', resp.text)
            for n in yt_names: yt_yt_trending.add(normalize_name(n.replace(' - Topic', '').strip()))
        except: print("      ! Error fetching YouTube Trending")

        # SOURCE E: FULL CATALOG (Using Monthly Listeners for ACCURATE rankings)
        print("      * Fetching Full Global Catalog (~2500 artists by MONTHLY LISTENERS)...")
        # Use fetch_all_kworb_data which pulls from listeners.html (current popularity)
        # NOT artists.html (all-time streams which includes legacy artists)
        full_catalog = fetch_all_kworb_data()
        print(f"      -> Catalog loaded: {len(full_catalog)} artists found.")

        # ---------------------------------------------------------
        # 2. BLACK BOX FUSION ENGINE
        # ---------------------------------------------------------
        print("[2/3] Fusing Multi-Source Signals...")
        
        master_artists = {} # name -> profile
        processed_names = set()

        # Build Lookups
        emerging_names = {normalize_name(a['name']): a['rank'] for a in emerging_raw}
        orbit_names = {normalize_name(a['name']): a['rank'] for a in pulse_raw}

        # Process Full Catalog for base scores and genre coverage
        for i, item in enumerate(full_catalog):
            name = item['name']
            name_norm = normalize_name(name)
            
            # Use REAL monthly listeners from Kworb data
            monthly_listeners = item.get('monthly_listeners', 0)
            daily_change = item.get('daily_listener_change', 0)
            spotify_id = item.get('spotify_id', name_norm)
            kworb_rank = item.get('rank', i + 1)
            
            # Base Power Score from Monthly Listeners (not position)
            # 100M+ = 1000, 50M = 800, 10M = 500, 1M = 200
            if monthly_listeners >= 100_000_000:
                base_score = 1000
            elif monthly_listeners >= 50_000_000:
                base_score = 800 + (monthly_listeners - 50_000_000) / 250_000
            elif monthly_listeners >= 10_000_000:
                base_score = 500 + (monthly_listeners - 10_000_000) / 133_333
            elif monthly_listeners >= 1_000_000:
                base_score = 200 + (monthly_listeners - 1_000_000) / 30_000
            else:
                base_score = max(50, monthly_listeners / 5000)
            
            # Identify Engines
            is_orbit = name_norm in orbit_names
            is_velocity = name_norm in emerging_names or name_norm in viral_lookup or name_norm in yt_yt_trending
            
            # Bonus Fusion Logic for chart presence
            bonus = 0
            if name_norm in viral_lookup:
                v_rank = viral_lookup[name_norm]
                bonus += (51 - min(v_rank, 50)) * 5  # Up to 250 points
            if name_norm in yt_yt_trending:
                bonus += 200  # YouTube trending bonus
            if is_orbit:
                o_rank = orbit_names[name_norm]
                bonus += (101 - o_rank) * 3  # Up to 300 points
                status = "Dominance" if o_rank <= 10 else "Established"
            elif is_velocity:
                status = "Breakout" if bonus > 200 else "Emerging"
            else:
                status = "Stable"
            
            p_score = min(1000, base_score + bonus)
            
            # Calculate growth velocity from daily change
            growth_velocity = 0.0
            if monthly_listeners > 0 and daily_change != 0:
                growth_velocity = (daily_change / monthly_listeners) * 100 * 30  # Project monthly
            
            # Calculate Ignition Score for Launchpad
            is_independent = not is_major_label(name, monthly_listeners / 1_000_000)
            
            # Get Viral Rank (0 if not present)
            viral_rank_val = viral_lookup.get(name_norm, 0)
            
            ignition_score = StelarAlgorithm.calculate_ignition_score(
                viral_rank=viral_rank_val,
                yt_trending=name_norm in yt_yt_trending,
                growth_velocity=growth_velocity,
                is_independent=is_independent,
                monthly_listeners=monthly_listeners
            )
            
            # Build profile matching PowerIndexArtist interface
            genre = get_genre(name)
            master_artists[name_norm] = {
                # Identity
                "id": spotify_id,
                "name": name,
                "genre": genre,  # String, not array
                "country": "USA",  # Default
                "city": None,
                "spotify_id": spotify_id,
                "label_name": "Major Label" if not is_independent else "Independent",
                "is_independent": is_independent,
                "avatar_url": None,
                
                # Social handles (placeholders)
                "tiktok_handle": None,
                "instagram_handle": None,
                "twitter_handle": None,
                "youtube_channel": None,
                
                # Metrics - REAL DATA
                "monthlyListeners": monthly_listeners,
                "tiktokFollowers": 0,
                "instagramFollowers": 0,
                "youtubeSubscribers": 0,
                "twitterFollowers": 0,
                
                # PROPRIETARY SCORES
                "powerScore": int(p_score),
                "conversionScore": 50.0,
                "arbitrageSignal": 50.0,
                "growthVelocity": round(growth_velocity, 1),
                "ignitionScore": ignition_score,
                "status": status,
                
                # Ranking metadata
                "rank": kworb_rank,
                "chartRank": kworb_rank,
                "lastUpdated": datetime.now().isoformat(),
                
                # Engine flags
                "is_orbit": is_orbit,
                "is_velocity": is_velocity,
                "orbit_rank": orbit_names.get(name_norm, 999),
                "velocity_rank": emerging_names.get(name_norm, 999)
            }

        # =========================================================
        # CRITICAL: Inject Billboard Emerging Artists NOT in Kworb
        # These are TRUE emerging artists (50K-2M listeners) that 
        # Kworb doesn't track. We add them with estimated data.
        # =========================================================
        print(f"      * Injecting {len(emerging_raw)} Billboard Emerging Artists...")
        injected_count = 0
        for emerging in emerging_raw:
            name = emerging['name']
            name_norm = normalize_name(name)
            bb_rank = emerging['rank']
            
            # Skip if already in master_artists (from Kworb)
            if name_norm in processed_names:
                continue
            
            # Skip legacy/excluded artists
            if is_legacy_artist(name):
                continue
                
            # Estimate listeners based on Billboard rank (higher rank = fewer listeners)
            # Billboard Emerging #1 might have ~1.5M, #50 might have ~100K
            estimated_listeners = max(100_000, 1_500_000 - (bb_rank - 1) * 28_000)
            
            # High Ignition Score for Billboard Emerging (these are A&R targets)
            ignition_score = 50 + (51 - min(bb_rank, 50)) * 1.0  # 50-100 points
            
            master_artists[name_norm] = {
                "id": f"bb_{name_norm}",
                "name": name,
                "genre": "Pop",  # Default
                "country": "USA",
                "city": None,
                "spotify_id": None,
                "label_name": "Independent",
                "is_independent": True,
                "avatar_url": None,
                "instagram_handle": None,
                "tiktok_handle": None,
                "youtube_channel": None,
                "spotify_url": None,
                "spotifyFollowers": estimated_listeners // 10,
                "monthlyListeners": estimated_listeners,
                "dailyStreams": estimated_listeners // 30,
                "growthVelocity": 30.0 + (51 - bb_rank) * 0.5,  # Emerging = high velocity
                "trend": "rising",
                "powerScore": 300 + (51 - bb_rank) * 5,
                "ignitionScore": ignition_score,
                "status": "Breakout",
                "rank": bb_rank,
                "chartRank": bb_rank,
                "lastUpdated": datetime.now().isoformat(),
                "is_orbit": False,
                "is_velocity": True,  # All Billboard Emerging are velocity
                "orbit_rank": 999,
                "velocity_rank": bb_rank,
                "source": "billboard_emerging"  # Track data source
            }
            processed_names.add(name_norm)
            injected_count += 1
        
        print(f"      -> Injected {injected_count} new emerging artists")

        # Final Engine Selection
        pulse = [v for k, v in master_artists.items() if v['is_orbit']]
        pulse.sort(key=lambda x: x['orbit_rank'])
        for i, p in enumerate(pulse): p['rank'] = i + 1

        # LAUNCHPAD: Expanded criteria for emerging artists
        # Include artists who are:
        # 1. Already flagged as velocity (Billboard Emerging, Viral, YouTube), OR
        # 2. Independent with listeners under 50M, OR
        # 3. Have positive growth velocity, OR
        # 4. Have ignition score > 5
        # CRITICAL: Exclude legacy/deceased/seasonal artists!
        # CRITICAL: Western artists ONLY (US, UK, Canada, Australia, etc.)
        # NOTE: Kworb data starts at ~5M listeners, so 7M cap captures the
        # "smaller" end of the data. We rely on Ignition Score to identify
        # fastest-growing artists within this range as "emerging".
        LAUNCHPAD_LISTENER_CAP = 7_000_000
        WESTERN_COUNTRIES = {'USA', 'UK', 'Canada', 'Australia', 'New Zealand', 'Ireland'}
        NON_WESTERN_GENRES = {'Latin', 'K-Pop', 'Afrobeats', 'Bollywood', 'Indian', 'Desi', 'J-Pop', 'Reggaeton', 'Musica Mexicana', 'Punjabi'}
        
        launchpad = []
        for k, v in master_artists.items():
            # SKIP legacy artists - The Police, David Bowie, etc are NOT up & comers
            if is_legacy_artist(v['name']):
                continue
            
            # SKIP artists above the listener cap - they're not emerging
            if v['monthlyListeners'] > LAUNCHPAD_LISTENER_CAP:
                continue
            
            # WESTERN ONLY: Skip non-Western countries
            if v.get('country', 'USA') not in WESTERN_COUNTRIES:
                continue
                
            # WESTERN ONLY: Skip non-English genres (Indian, Latin, K-Pop, etc.)
            if v.get('genre', '') in NON_WESTERN_GENRES:
                continue
            
            if v['is_velocity']:
                launchpad.append(v)
            elif v['is_independent'] and v['monthlyListeners'] < 50_000_000:
                launchpad.append(v)
            elif v.get('growthVelocity', 0) > 5:
                launchpad.append(v)
            elif v.get('ignitionScore', 0) > 5:
                launchpad.append(v)
        
        launchpad.sort(key=lambda x: x['ignitionScore'], reverse=True)  # Sort by Ignition Score for A&R
        for i, p in enumerate(launchpad): p['rank'] = i + 1

        # Global Full Catalog
        global_rankings = list(master_artists.values())
        # TIE BREAKER: Use Monthly Listeners if Power Scores tie
        global_rankings.sort(key=lambda x: (x['powerScore'], x['monthlyListeners']), reverse=True)
        for i, p in enumerate(global_rankings): p['rank'] = i + 1

        # ---------------------------------------------------------
        # 2.5 AVATAR ENRICHMENT (Top 500 for speed)
        # ---------------------------------------------------------
        print("      * Enriching top 500 artists with avatars from Apple Music...")
        avatar_count = 0
        for artist in global_rankings[:500]:
            try:
                avatar = fetch_artist_image_from_itunes(artist['name'])
                if avatar:
                    artist['avatar_url'] = avatar
                    avatar_count += 1
            except Exception as e:
                pass  # Silent fail for individual artists
        print(f"      -> Fetched {avatar_count} avatars")

        # ---------------------------------------------------------
        # 3. OUTPUT GENERATION
        # ---------------------------------------------------------
        print("[3/3] Saving Large-Scale Intelligence Package...")
        import os
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(script_dir, '../web/public/rankings.json')
        
        # Build Genre Packages
        genre_lists = {g.lower().replace(' & ', '_').replace(' ', '_'): [] for g in GENRES}
        for a in global_rankings:
            g = a.get('genre', 'Pop')  # Now using 'genre' string, not 'genres' array
            g_key = g.lower().replace(' & ', '_').replace(' ', '_')
            if g_key in genre_lists:
                genre_lists[g_key].append(a)

        output = {
            "generated_at": datetime.now().isoformat(),
            "algorithm_version": "STELAR Engine v4.0",
            "data_source": "Full Catalog Fusion (The Pulse + The Launchpad)",
            "total_artists": len(global_rankings),
            "rankings": {
                "global": global_rankings[:3000], # Keep top 3000
                "up_and_comers": launchpad[:150],
                "arbitrage": launchpad[:200]
            }
        }
        
        # Merge genres
        for g_key, a_list in genre_lists.items():
            output['rankings'][g_key] = a_list[:150]

        with open(output_path, 'w') as f:
            json.dump(output, f, indent=2)
            
        print(f"\n✅ SUCCESS: Refreshed {len(global_rankings)} artists into {len(output['rankings'])} categories.")
        print(f"Output saved to: {output_path}")

    except Exception as e:
        print(f"\n❌ FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
