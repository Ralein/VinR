╔══════════════════════════════════════════════════════════════════╗
║          VINℛ — EMOTIONAL WELLNESS & COMEBACK PLATFORM          ║
║     "We don't just support you. We make you a WINNER."          ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCT VISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VinR (vin = Navin | ℛ = Ralein + Raj Chandrasekharan) is a 
science-backed, AI-powered emotional support companion that turns 
mental health management into a 21-day winning streak — just like 
Duolingo did for language learning. Users describe how they feel. 
The AI listens, triages, and delivers a personalized rescue plan 
with two pathways: immediate relief and 21-day habit formation.

The MOAT: Not the AI suggestions (those exist everywhere). 
The MOAT is the 21-day nudge engine — personalized, streak-tracked, 
notification-driven follow-through that transforms a single moment 
of vulnerability into a lasting identity shift.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECH STACK — PRODUCTION GRADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FRONTEND:
  - React Native (Expo SDK 51+) — iOS + Android from one codebase
  - Expo Router v3 — file-based navigation
  - NativeWind v4 (Tailwind for RN) — styling system
  - React Native Reanimated 3 — fluid 60fps animations
  - React Native Gesture Handler — swipe, drag, haptics
  - Lottie React Native — premium micro-animations
  - React Native Skia — canvas-level visual effects
  - Zustand — global state management
  - React Query (TanStack) — server state, caching, background sync
  - Expo Notifications — push notifications (streak reminders)
  - Expo AV — audio playback (sleep music, breathing guides)
  - Expo Haptics — tactile feedback
  - React Native WebView — YouTube embed player

BACKEND (Python):
  - FastAPI — REST API framework
  - PostgreSQL + pgvector — relational DB + vector embeddings for RAG
  - Redis — session cache, streak state, rate limiting
  - Celery + Redis — async task queue (notification scheduling)
  - LangChain — LLM orchestration + RAG pipeline
  - Anthropic Claude API — core LLM (claude-sonnet-4)
  - Pinecone (or pgvector) — vector store for RAG documents
  - Firebase Cloud Messaging — push notification delivery
  - AWS S3 — audio file storage (sleep music, guided meditations)
  - Docker + Docker Compose — containerized deployment
  - Railway or Render — cloud hosting

AUTH & DATA:
  - Supabase Auth (Email, Google, Apple Sign-In)
  - Supabase Realtime — live streak updates
  - Row Level Security — HIPAA-conscious data isolation

RAG KNOWLEDGE BASE (curated US government + validated sources):
  - NIMH (nimh.nih.gov) — anxiety, depression, stress
  - SAMHSA (samhsa.gov) — crisis resources, treatment
  - CDC Mental Health (cdc.gov/mentalhealth)
  - APA (apa.org) — evidence-based techniques
  - MentalHealth.gov — general wellness
  - Headspace Research Papers — meditation evidence
  - Harvard Health Publishing — CBT, DBT techniques
  - Mayo Clinic — yoga, breathing, exercise for mental health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — FOUNDATION (Weeks 1–4) — MVP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Goal: Shippable TestFlight/Play Store internal beta
Deliverable: Core loop working end-to-end

SPRINT 1.1 — Project Scaffolding (Days 1–3)
  Backend:
    □ FastAPI project init with folder structure:
        /app
          /api/v1/routes/ — auth, checkin, streaks, notifications
          /core/ — config, security, database
          /models/ — SQLAlchemy ORM models
          /schemas/ — Pydantic request/response models
          /services/ — llm_service, rag_service, streak_service
          /tasks/ — celery notification tasks
        /alembic/ — DB migrations
        docker-compose.yml (FastAPI + PostgreSQL + Redis)
    □ PostgreSQL schema:
        users(id, email, name, avatar_url, onboarding_complete,
              music_genre, preferred_language, timezone, created_at)
        checkins(id, user_id, mood_tag, raw_text, emotion_analysis,
                 is_emergency, created_at)
        plans(id, checkin_id, user_id, immediate_relief JSON,
              daily_habits JSON, affirmation, created_at)
        streaks(id, user_id, plan_id, current_streak, longest_streak,
                total_days_completed, start_date, last_completed_date)
        daily_completions(id, streak_id, day_number, completed_at,
                          habit_completed, reflection_note)
        push_tokens(id, user_id, token, platform, active)
    □ Supabase Auth integration (JWT validation middleware)
    □ Env config (.env) for all secrets

  Frontend:
    □ Expo project init (managed workflow, SDK 51)
    □ Expo Router file structure:
        app/
          (auth)/
            welcome.tsx      — onboarding splash
            sign-in.tsx
            sign-up.tsx
            onboarding/
              step1-name.tsx    — name + avatar
              step2-mood.tsx    — mood baseline
              step3-music.tsx   — music genre preferences
              step4-notify.tsx  — notification permission
          (tabs)/
            index.tsx        — Home / Dashboard
            checkin.tsx      — Daily check-in
            journey.tsx      — 21-day tracker
            journal.tsx      — Gratitude journal
            profile.tsx      — Settings + profile
          _layout.tsx        — Root layout + auth guard
    □ NativeWind + custom theme tokens setup
    □ Zustand stores: authStore, checkinStore, streakStore, uiStore
    □ React Query setup with API client (axios, interceptors, 
      refresh token logic)
    □ Custom font loading (Playfair, DM Sans, Cormorant)

SPRINT 1.2 — Auth + Onboarding (Days 4–7)
  □ Welcome screen:
      Full-screen animated gradient background (Skia)
      VinR logo with entrance animation (scale + fade, spring)
      "vin" white + "ℛ" gold italic lettermark 64px
      Tagline reveal with letter-by-letter stagger
      "Begin your comeback →" CTA button (gold, glow pulse)
      "Already winning? Sign in" secondary link
  □ Sign Up / Sign In:
      Glassmorphism card on dark background
      Email + Password OR Google/Apple OAuth
      Field validation with animated error states
      Loading state: pulsing VinR logo
  □ Onboarding Flow (4 steps, progress dots):
      Step 1 — "What should we call you?" 
               Name input + avatar selection (8 illustrated avatars)
      Step 2 — "How have you been feeling lately?"
               Mood baseline grid (8 mood chips, multi-select)
               "No pressure — this helps us personalize for you"
      Step 3 — "What music moves your soul?"
               Genre picker: Pop, R&B, Hip-Hop, Classical, 
               Indie, Electronic, Country, K-Pop, Jazz, Rock
               (saves to user.music_genre for YouTube integration)
      Step 4 — "Let VinR check on you daily"
               Notification permission request
               Time picker for daily reminder (default 8:00 AM)
               Preview of what notification looks like

SPRINT 1.3 — Check-in + AI Core (Days 8–14)
  Backend:
    □ RAG pipeline setup:
        Scrape + chunk NIMH, SAMHSA, APA, CDC content
        Generate embeddings (text-embedding-3-small)
        Store in pgvector with metadata (source, topic, technique_type)
        Retrieval function: top-5 chunks by cosine similarity
        Prompt augmentation: inject retrieved context into Claude prompt
    □ POST /api/v1/checkin endpoint:
        Input: { mood_tag, text, user_id }
        Step 1: Retrieve relevant RAG context based on text
        Step 2: Call Claude API with system prompt + RAG context
        Step 3: Parse structured JSON response
        Step 4: Store checkin + plan in DB
        Step 5: Create/update streak record
        Step 6: Return full plan to client
    □ Claude system prompt (production version):
        You are VinR, a compassionate AI wellness companion. 
        Your responses are grounded in evidence-based mental 
        health resources from NIMH, SAMHSA, APA, and Mayo Clinic.
        
        TRIAGE RULES:
        - If input contains: suicidal ideation, self-harm, 
          harming others, crisis language → isEmergency: true
        - All other inputs → isEmergency: false
        
        For non-emergency, respond in strict JSON:
        {
          "isEmergency": false,
          "primaryEmotion": "string",
          "emotionSummary": "2 sentences — warm, reflective",
          "supportMessage": "1 empathetic sentence",
          "immediateRelief": [
            {
              "id": "unique_id",
              "name": "Technique name",
              "emoji": "emoji",
              "category": "breathing|grounding|movement|
                           meditation|social|creative",
              "duration": "e.g. 5 minutes",
              "instructions": ["Step 1", "Step 2", "Step 3"],
              "scienceNote": "1 sentence — why this works",
              "source": "NIMH / APA / Mayo Clinic"
            }
          ] (3 items),
          "dailyHabits": [ same schema, 3 items ],
          "affirmation": "Short powerful affirmation",
          "gratitudePrompt": "Tonight, reflect on...",
          "therapistNote": "Why professional support helps here"
        }
        
        Use the provided RAG context to ground your suggestions. 
        Always prefer scientifically validated techniques.

  Frontend:
    □ Check-in screen:
        Header: "How are you feeling?" in Playfair Display
        Mood grid: 8 chips (emoji + label), animated selection
        Text area: "Tell me what's weighing on you..."
                   500 char limit, char counter
                   Placeholder rotates between 5 warm prompts
        "Analyze my feelings →" button — disabled until input
        Privacy badge: "🔒 Private & secure"
    □ Loading state:
        Full-screen: pulsing VinR wordmark
        Rotating affirmations while waiting
        "VinR is listening..." subtitle, pulse animation
    □ Emergency screen:
        Red border pulsing card
        Crisis numbers grid: 988, 741741, 911, 1-800-662-4357
        "Call 988 Now" primary button (opens dialer)
        "Text HOME to 741741" secondary button (opens SMS)
        "I'm safe — show me support" tertiary link
    □ Results screen:
        VinR reflection card (Cormorant italic quote)
        Therapist nudge banner (sapphire blue)
        TWO PATHWAY CARDS side by side (or stacked mobile):
          Card 1 "⚡ Immediate Relief" (gold top border):
            3 technique items, each expandable to show 
            full instructions in a bottom sheet
          Card 2 "🌱 21-Day Daily Habit" (emerald top border):
            3 habit items
        "Start my 21-day journey →" CTA at bottom
        Saves plan + creates streak record on tap

SPRINT 1.4 — Streak Tracker (Days 15–21)
  Backend:
    □ GET /api/v1/streaks/{user_id}/active — current streak data
    □ POST /api/v1/streaks/{streak_id}/complete-day — mark day done
    □ GET /api/v1/streaks/{user_id}/history — all past streaks
    □ Streak logic:
        Complete day → increment current_streak
        Miss a day → reset streak to 0 (grace period: 2 hours 
        past midnight before reset triggers)
        Milestone detection: 5, 10, 15, 21 days
        Milestone triggers: push notification + in-app celebration

  Frontend:
    □ Journey tab — 21-day tracker screen:
        Header: active plan's primary emotion + start date
        Streak counter: large Playfair number, "day streak 🔥"
        21-day grid:
          - Completed: gold filled circle with ✓
          - Today: gold border, pulsing
          - Missed: dim red tint
          - Future: ghost border
          - Tap today's cell → opens "Mark Complete" sheet
        Progress bar: gold gradient, animated fill
        Milestone badges row: 🌱(5) 🌿(10) 🌸(15) 🏆(21)
          Locked: grey border | Unlocked: gold glow + scale bounce
        Active habit reminder: shows today's daily habit card
        "Mark today complete ✓" bottom action button
    □ Mark Complete bottom sheet:
        Habit reminder card
        Optional reflection input: "How did it go today?"
        Mood check: "How are you feeling now?" (1–5 stars)
        "I did it! ✓" confirm button → haptic heavy + 
        confetti burst animation (Lottie)
    □ Milestone celebration screen (modal):
        Day 5:  "🌱 You're sprouting! 5 days strong."
        Day 10: "🌿 Halfway hero! Habits are forming in your brain."
        Day 15: "🌸 Almost there! You're in the top 5% of people 
                  who stick with this."
        Day 21: "🏆 YOU ARE A WINNER! 21 days. New you."
        Each has: Lottie celebration animation, share button,
                  gold card design, progress summary

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — ENGAGEMENT ENGINE (Weeks 5–8) — Growth Features
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Goal: Retention, daily engagement, content depth
Deliverable: Public App Store beta launch

SPRINT 2.1 — Smart Notifications (Days 22–28)
  Backend:
    □ Celery beat scheduler:
        Daily reminder: user's chosen time → "Hey [name], your 
        21-day streak is waiting. Day [X] — don't break the chain!"
        Streak at risk (11 PM, if not completed): 
        "⚠️ Day [X] isn't checked yet. You've got 1 hour!"
        Milestone upcoming: day before 5/10/15/21: 
        "Tomorrow you hit [X] days. Legendary."
        Post-milestone: next day after milestone:
        "You hit [X] days. The old you wouldn't believe this."
        Re-engagement (if lapsed 3+ days):
        "VinR misses you. Start fresh — no judgment."
    □ Dynamic notification content from Claude:
        Each user gets slightly different phrasing based on 
        their primary emotion and username → feels personal

  Frontend:
    □ Notification permission flow with value-prop preview
    □ Notification tap → deep links to correct screen:
        Daily reminder → Journey tab, Mark Complete sheet open
        Re-engagement → Check-in screen
        Milestone → Celebration modal
    □ Notification settings screen:
        Toggle types on/off
        Time picker (per notification type)
        Snooze option: "Remind me in 2 hours"

SPRINT 2.2 — Gratitude Journal (Days 29–33)
  Backend:
    □ journal_entries table:
        (id, user_id, date, gratitude_items JSON[], 
         reflection_text, mood_at_entry, ai_response, created_at)
    □ POST /api/v1/journal — create entry
    □ GET /api/v1/journal?month=YYYY-MM — paginated by month
    □ AI journal response: Claude reads entry and reflects back 
      one warm sentence + one gentle prompt for tomorrow
    □ Weekly insight: every Sunday, Claude summarizes the week's 
      journal themes: "This week you kept mentioning 'work stress' 
      and 'gratitude for family'..."

  Frontend:
    □ Journal tab screen:
        Calendar view: dots on days with entries (gold = journal done)
        "Today's Gratitude" prompt from AI (rotates daily)
        Entry input:
          3 gratitude fields: "I'm grateful for..."
          Free reflection: "What else is on my mind..."
          Mood rating 1-5 stars before submit
        AI reflection card appears after submit
          Cormorant italic, gold border
        Monthly calendar dots: visual proof of consistency
        Search across all entries

SPRINT 2.3 — Audio & Media Hub (Days 34–40)
  Backend:
    □ S3 audio library:
        Sleep music tracks (10 tracks, royalty-free)
        Guided breathing audio (box breathing, 4-7-8)
        Guided meditation (5min, 10min, 15min)
        Morning affirmation audio (personalized by emotion)
    □ POST /api/v1/media/session — log listening session
    □ YouTube search proxy:
        Endpoint wraps YouTube Data API v3
        GET /api/v1/media/youtube?genre={genre}&type={motivation|music}
        Returns curated playlist IDs based on user's genre preference
        type=motivation → motivational speeches in their genre
        type=music → relaxing/uplifting music of chosen genre

  Frontend:
    □ Media player component (persistent bottom bar):
        Mini player: track thumbnail, title, play/pause
        Expand to full player: Blur backdrop, album art,
          progress scrubber, volume, sleep timer
    □ Audio categories:
        🌙 Sleep Sounds — rain, white noise, ocean, binaural
        🫁 Guided Breathing — box, 4-7-8, coherent breathing
        🧘 Meditations — 5/10/15 min guided (Lottie mandala visuals)
        ☀️ Morning Affirmations — AI-personalized daily audio
    □ YouTube integration (WebView):
        "Your Vibe" section on Home tab
        Shows 3 YouTube cards based on music_genre
        Motivation reel section: "Get fired up"
        Opens in in-app WebView with minimal chrome
    □ Sleep mode:
        Activatable from Home or Journal
        Dims screen, shows slow-breathing animation
        Queues sleep music + sets auto-stop timer (30/45/60 min)
        Blocks notifications during sleep mode

SPRINT 2.4 — Social Event Finder (Days 41–45)
  Backend:
    □ GET /api/v1/events?lat={lat}&lon={lon}&radius=25mi
    □ Integrates Eventbrite API + Meetup API
    □ Filters for: mental wellness, yoga, meditation, social clubs,
      support groups, outdoor activities, art therapy
    □ Caches results per city for 12 hours (Redis)
    □ Personalization: matches event type to user's current 
      emotion/plan (e.g., anxious → small social events, 
      yoga classes; depressed → outdoor walk groups)

  Frontend:
    □ "Get out & connect" section on Home tab
    □ Events cards: venue, date, distance, category chip
    □ Tap → opens in Maps app (directions) or Eventbrite deep link
    □ "Not ready to go out?" → virtual events section
    □ Bookmark events → saved to profile

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — INTELLIGENCE LAYER (Weeks 9–12) — AI Depth
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Goal: Personalization engine, insights, premium AI features
Deliverable: Version 1.0 public launch

SPRINT 3.1 — Mood Analytics Dashboard (Days 46–52)
  Backend:
    [x] Emotion trend aggregation:
        Weekly average mood score (1-5 mapped from emotion)
        Most frequent emotion per week
        Streak correlation: does streak length correlate with 
        better mood scores? (show this to user — it WILL)
        Time-of-day pattern: when do they check in most?
    [x] GET /api/v1/analytics/{user_id}/summary
    [x] GET /api/v1/analytics/{user_id}/trends?period=30d

  Frontend:
    [x] Profile tab → "My Journey" section:
        Mood trend line chart (Recharts/Victory Native)
          x: last 30 days | y: mood score 1–5
          Color: gold line, emerald dots on streak days
        Emotion distribution: donut chart (top 5 emotions)
        Streak history: horizontal bar chart per plan
        Insight cards (AI-generated weekly):
          "You feel 40% better on days you complete your habit"
          "Your best mood days are Tuesdays"
          "You've been most anxious on Sunday evenings"
        Total stats row:
          [X] Check-ins | [X] Days Completed | [X] Best Streak
          [X] Journal Entries | [X] Meditations

SPRINT 3.2 — Adaptive AI (Days 53–58)
  Backend:
    [x] User context builder:
        Pulls last 5 check-ins + mood trend + streak data
        Injects into every new Claude prompt as "user_context"
        Claude now knows: "This user has been anxious for 
        3 weeks, completed 12 streak days, responds well to 
        breathing techniques, struggles with consistency on weekends"
    [x] Adaptive habit selection:
        Tracks which habits user completes vs. skips
        Over time, de-prioritizes skipped habits, surfaces 
        completed ones first — learns preferences
    [x] Escalation detection:
        If mood score drops 3 consecutive check-ins → 
        surfaces therapist directory prominently
        If user hasn't checked in for 5 days → sends 
        special re-engagement sequence (not generic)

  Frontend:
    [x] "VinR knows you better now" nudge cards on Home
    [x] Adaptive home feed: surfaces most relevant content 
      based on time of day, recent emotion, streak status
    [x] Therapist directory screen:
        Psychology Today embed or BetterHelp deep link
        Filter by: insurance, specialty, telehealth
        "Why therapy?" section — destigmatizing copy

SPRINT 3.3 — Morning Ritual & Evening Wind-Down (Days 59–64)
  Backend:
    [x] GET /api/v1/rituals/morning — personalized by user history
    [x] GET /api/v1/rituals/evening — journal prompt + wind-down

  Frontend:
    [x] Morning Ritual screen (accessible at 6–10 AM):
        Time-aware greeting: "Good morning, [name]."
        Today's affirmation (AI-personalized, audio playable)
        Streak status: "Day X — you're on a roll"
        Today's daily habit reminder card
        "3 things to be grateful for" quick capture
        Morning breathing (animated circle guide, 2 min)
    [x] Evening Wind-Down screen (accessible at 8–11 PM):
        "How did your day go?" quick mood tap (1–5)
        Today's habit: "Did you complete it?" Yes/No
        Tonight's gratitude prompt
        Sleep music player auto-suggested
        Breathing animation for sleep (4-7-8 technique)
        Gently dims screen over 60 seconds

SPRINT 3.4 — Breathing & Meditation Guides (Days 65–70)
  Frontend:
    [x] Interactive breathing guide (built in React Native Skia):
        Animated circle: expands (inhale), holds, contracts (exhale)
        Techniques: Box (4-4-4-4), 4-7-8, Coherent (5-5),
                    Physiological sigh (2 in, 1 out)
        Circle: gold glow, pulse animation synced to timer
        Voice guide option (TTS via Expo Speech or audio file)
        Duration selector: 2 / 5 / 10 minutes
        Session complete: Lottie celebration + streak credit
    [x] Guided yoga screen:
        12 illustrated yoga cards (simple asanas for anxiety/depression)
        Each card: pose name, emoji, 30-sec hold timer, benefit note
        Sources cited (Johns Hopkins, Mayo Clinic)
        "Sequence builder": user picks 3–5 poses for a session
    [x] Grounding 5-4-3-2-1 interactive:
        Step-by-step animated prompts
        User types their answers into each field
        At end: AI reflects: "You noticed a lot of nature — 
        that's a beautiful instinct" (Claude mini call)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — MONETIZATION & SCALE (Weeks 13–16) — Business Layer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Goal: Revenue model, App Store optimization, VC readiness

SPRINT 4.1 — Freemium + VinR Pro (Days 71–77)
  FREE TIER:
    □ 3 check-ins per month
    □ Basic immediate relief (1 technique shown)
    □ 7-day streak tracker (not 21)
    □ 5 journal entries per month
    □ Standard notifications
    □ 3 sleep sounds (not full library)

  VINℛ PRO ($12.99/month or $79.99/year):
    □ Unlimited check-ins
    □ Full immediate + 21-day plan
    □ All 4 mode buttons active
    □ Full audio library (sleep, meditation, breathing)
    □ YouTube integration (music + motivation reels)
    □ Mood analytics dashboard
    □ Adaptive AI (learns your patterns)
    □ Morning ritual + evening wind-down
    □ Social events finder
    □ Gratitude journal (unlimited)
    □ Priority streak recovery (1 free miss per 7 days)
    □ Export journal as PDF
    □ Ad-free forever

  Backend:
    □ Stripe subscription API integration
    □ Entitlements service: checks user tier before serving content
    □ Paywall screens with value-prop illustrations
    □ 7-day free trial for Pro on signup
    □ Annual plan nudge (saves 50%)

  Frontend:
    □ Paywall modal: gold gradient, feature list, trial CTA
    □ "Pro" gold crown badge on profile avatar
    □ Upgrade nudge: tasteful, contextual (never intrusive):
        After 3rd check-in in free tier: "Unlock your full plan →"
        On day 7 of free streak: "Keep going — unlock 21 days →"

SPRINT 4.2 — Referral & Community (Days 78–82)
  Backend:
    □ Referral codes: user gets 1 free Pro month per referral
    □ Leaderboard: opt-in streak leaderboard 
      (anonymized: "You're in top 10% this week 🏆")
    □ Community challenges: monthly "21-day challenge" 
      with shared progress counter ("847 people are on Day 12 today")

  Frontend:
    □ Share streak card (beautiful shareable image):
        "I'm on Day [X] of my VinR 21-day journey 🔥"
        VinR branding, gold design
        Sharable to IG Stories, WhatsApp, Twitter
    □ "Invite a friend" screen with unique referral link
    □ Community challenge banner on Home tab

SPRINT 4.3 — App Store Launch Prep (Days 83–88)
  □ App Store screenshots (6 per platform):
      Screen 1: Onboarding — "Your comeback starts here"
      Screen 2: Check-in → AI response
      Screen 3: Two pathways (Immediate + 21-day)
      Screen 4: 21-day tracker with streak
      Screen 5: Journal + analytics
      Screen 6: Pro paywall value prop
  □ App Store description:
      Keywords: mental health app, anxiety relief, 
      depression support, daily habits, streak tracker, 
      emotional wellness, guided meditation, breathing exercises
  □ Privacy policy (HIPAA-conscious language)
  □ Support email + FAQ
  □ Crash reporting: Sentry integration
  □ Analytics: Mixpanel (track: check-in completed, 
    streak day marked, habit type clicked, paywall viewed, 
    conversion rate, D1/D7/D30 retention)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5 — VC READINESS & SCALE (Weeks 17–20)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Goal: Data story, growth metrics, Series A narrative

KEY METRICS TO TRACK & PRESENT TO VCs:
  □ DAU/MAU ratio (target: >40% = highly engaged)
  □ D1 retention (day 1 return rate, target: >60%)
  □ D21 completion rate (% of users who complete 21-day plan)
  □ Average streak length (the core engagement metric)
  □ Check-ins per user per month
  □ Free-to-Pro conversion rate (target: 8–12%)
  □ LTV:CAC ratio
  □ NPS score (monthly survey)

TECHNICAL SCALE PREP:
  □ API rate limiting per user tier (Redis)
  □ CDN for audio files (CloudFront)
  □ Database read replicas (Supabase)
  □ Background job monitoring (Flower for Celery)
  □ APM: Datadog or New Relic
  □ Load testing: Locust (simulate 10k concurrent users)

FUTURE ROADMAP (Phase 6+) — Pitch this to VCs:
  □ VinR for Teens (12–17, parental consent, safer content)
  □ VinR for Employers (B2B wellness — EAP replacement)
  □ VinR Coach (licensed therapist marketplace, 
    in-app video sessions — rev share model)
  □ VinR Wearable (Apple Watch companion, 
    HRV-triggered check-in prompts)
  □ Multilingual (Spanish, Hindi, Arabic — large TAM expansion)
  □ Clinical partnerships (insurance reimbursement pathway)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOLDER STRUCTURE (Full Production)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

vinr-app/
├── apps/
│   ├── mobile/                  ← React Native (Expo)
│   │   ├── app/                 ← Expo Router screens
│   │   ├── components/          ← Reusable UI components
│   │   │   ├── ui/              ← Buttons, Cards, Inputs
│   │   │   ├── streaks/         ← Tracker, Grid, Milestones
│   │   │   ├── checkin/         ← MoodGrid, TextInput, Results
│   │   │   ├── journal/         ← Entry, Calendar, AIReflect
│   │   │   ├── media/           ← AudioPlayer, BreathingGuide
│   │   │   └── analytics/       ← Charts, Stats
│   │   ├── stores/              ← Zustand state stores
│   │   ├── hooks/               ← Custom React hooks
│   │   ├── services/            ← API client, notifications
│   │   ├── utils/               ← Helpers, formatters
│   │   ├── constants/           ← Theme, routes, config
│   │   └── assets/              ← Fonts, images, Lottie JSON
│   └── backend/                 ← FastAPI (Python)
│       ├── app/
│       │   ├── api/v1/routes/
│       │   ├── core/
│       │   ├── models/
│       │   ├── schemas/
│       │   ├── services/
│       │   │   ├── llm_service.py
│       │   │   ├── rag_service.py
│       │   │   ├── streak_service.py
│       │   │   ├── notification_service.py
│       │   │   └── media_service.py
│       │   └── tasks/           ← Celery async tasks
│       ├── alembic/
│       ├── tests/
│       ├── docker-compose.yml
│       └── Dockerfile
└── docs/
    ├── PRD.md
    ├── API_SPEC.md
    └── DESIGN_SYSTEM.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTION COMMAND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build VinR starting with Phase 1. At each phase boundary, 
generate: (1) all code files, (2) DB migration scripts, 
(3) test cases, (4) a one-page progress summary.

The gold standard for every screen: "Does this feel like 
a $10M-funded mental health startup built it?" If not, 
redesign until it does.

VinR doesn't compete on features. It wins on follow-through.