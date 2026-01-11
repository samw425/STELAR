# STELAR: Complete Development Roadmap

## 🎯 Current Status (Jan 10, 2026)

**Live URL**: https://stelarmusic.pages.dev

### What's Working ✅
- Video playback via YouTube Data API
- OG images generating for track pages
- "Explore More" navigation section
- Watch buttons on all 50 tracks
- Twitter Player Cards meta tags

### Issues to Fix 🔴
- [ ] X/Twitter OG cards not displaying (caching issue)
- [ ] YouTube API quota limits (need caching)

---

## 📋 Full Development Plan

### Phase 1: Infrastructure (This Week)

| Task | Priority | Time | Notes |
|------|----------|------|-------|
| Video ID caching in rankings.json | 🔴 Critical | 3 hrs | Prevents API quota issues |
| Request YouTube quota increase | 🔴 Critical | 30 min | Apply at GCP console |
| Fix Twitter Card caching | 🔴 Critical | 1 hr | Validate at cards-dev.twitter.com |
| Deploy to production domain | 🟠 High | 30 min | stelarmusic.pages.dev |

### Phase 2: Stickiness (Next Week)

| Feature | Description | Impact |
|---------|-------------|--------|
| User Accounts | Save favorites, follow artists | 🔥🔥🔥 |
| Daily Discover | Curated 5 songs daily | 🔥🔥🔥 |
| Similar Artists | "Fans also like" carousel | 🔥🔥 |
| Artist Notifications | Push alerts for new releases | 🔥🔥 |
| Comments/Reactions | Social layer on tracks | 🔥 |

### Phase 3: Monetization (Week 3-4)

#### STELAR Pro ($4.99/mo)

| Free | Pro |
|------|-----|
| Top 10 rankings | Full Top 50 |
| Basic profiles | Deep analytics "Dossier" |
| Standard player | Ad-free, no YouTube redirects |
| - | Export to Spotify |
| - | Early Launchpad access |

#### Other Revenue Streams
- Affiliate links (Spotify, Apple Music, Ticketmaster)
- Artist promotion (paid Launchpad placement)
- Data licensing to labels/A&R

### Phase 4: Growth (Ongoing)

| Channel | Strategy |
|---------|----------|
| Twitter/X | Daily "Rising Artist" posts |
| TikTok | Breakout artist clips |
| SEO | Rank for "emerging artists 2025" |
| Discord | Music discovery community |

---

## 🗓️ 30-Day Sprint

### Week 1
- [ ] Implement video ID caching
- [ ] Fix Twitter OG cards
- [ ] Request YouTube quota increase
- [ ] Deploy to production

### Week 2
- [ ] Add Supabase auth
- [ ] Implement "Save to Favorites"
- [ ] User profile page

### Week 3
- [ ] Similar Artists carousel
- [ ] Daily Discover feature
- [ ] Share tracking

### Week 4
- [ ] STELAR Pro paywall
- [ ] Stripe integration
- [ ] Launch affiliate links

---

## 💡 Key Metrics

| Metric | Target |
|--------|--------|
| 1,000 monthly users | 2 weeks |
| First paying subscriber | 4 weeks |
| $100 MRR | 6 weeks |
| 10,000 monthly users | 8 weeks |
| $1,000 MRR | 12 weeks |

---

## 🔧 Key Files

```
stelar/
├── data/
│   └── generate_rankings.py    # Ranking algorithm
├── web/
│   ├── functions/
│   │   ├── track/[[path]].js   # Track page with video
│   │   ├── artist/[[path]].js  # Artist profiles
│   │   └── api/og.js           # OG image generator
│   └── src/
│       └── App.tsx             # Main app
```

---

## 📝 Notes

**Why YouTube API has limits:**
- Default: 10,000 units/day
- Each search: 100 units = 100 searches/day
- Solution: Cache video IDs in rankings.json

**Twitter Cards:**
- Need domain whitelisting for Player Cards
- Validate at: https://cards-dev.twitter.com/validator
