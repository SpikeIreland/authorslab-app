# AuthorsLab.ai - Project Overview

## 🎯 Mission
Transform manuscript editing from a passive service into an active AI-powered collaboration, guiding authors from first draft to published book through four specialized editing phases.

## 🏗️ System Architecture

### **Frontend: Next.js 15 App**
- **Hosting:** Vercel (authorslab.ai)
- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS v4
- **Auth:** Supabase Authentication
- **Payments:** Stripe

### **Backend: n8n Workflows**
- **Hosting:** n8n Cloud (spikeislandstudios.app.n8n.cloud)
- **Purpose:** AI orchestration, manuscript processing, email delivery
- **AI Engine:** Claude Sonnet 4 via Anthropic API

### **Database: Supabase**
- **User accounts** (via Supabase Auth)
- **Manuscript metadata**
- **Chapter data**
- **Analysis results**
- **User progress tracking**

### **Storage: AWS S3**
- **Bucket Structure:**
  - `manuscript-submissions-phase1` - Developmental editing uploads
  - `manuscript-submissions-phase2` - Line editing uploads
  - `manuscript-submissions-phase3` - Copy editing uploads
  - `manuscript-submissions-phase4` - Publishing prep uploads

---

## 📦 Product Offerings

### 1. **Free Manuscript Analysis** ($0)
- **URL:** `/free-analysis`
- **Workflow:** `free-manuscript-analysis`
- **Delivers:** Comprehensive overview report (PDF) via email
- **Purpose:** Lead generation, showcase AI capabilities
- **Timeline:** 15 minutes
- **Restrictions:** Overview only, no chapter-by-chapter detail

### 2. **Complete Author Package** ($399 one-time)
- **URL:** `/pricing` → `/signup` → `/onboarding` → `/author-studio`
- **Workflows:** All 4 phases + chapter parsing + studio interactions
- **Delivers:** 
  - Full 4-phase editing journey
  - Real-time AI collaboration workspace
  - Chapter-by-chapter feedback
  - Publishing-ready manuscript
- **Timeline:** 10-16 days
- **Features:**
  - Phase 1: Developmental Editing (Alex)
  - Phase 2: Line Editing (Sam)
  - Phase 3: Copy Editing (Jordan)
  - Phase 4: Publishing Preparation

### 3. **Ghost Writer Package** ($2,499 - COMING SOON)
- Complete book creation from concept to finished manuscript
- Currently displayed as "Coming Soon" on pricing page

---

## 🔄 User Journey Flow
```
Landing Page (/)
    ↓
[Sign Up] → Supabase Auth
    ↓
Onboarding (/onboarding)
    ↓
    • Upload manuscript (.docx/.txt)
    • Extract text & analyze word count
    • Set chapter count, genre, title
    • Submit to n8n onboarding workflow
    ↓
Author Studio (/author-studio) ← **NEXT TO BUILD**
    ↓
    • Interactive AI workspace
    • Real-time collaboration with Alex, Sam, Jordan
    • Chapter-by-chapter editing
    • Progress tracking
    • Phase completion workflow triggers
```

---

## 🤖 The AI Editors

### **Alex - Developmental Editor** (Phase 1)
- **Specialty:** Story structure, character arcs, plot development, pacing
- **Focus:** Big picture narrative elements
- **Icon:** 🎯
- **Color:** Green (#27ae60)

### **Sam - Line Editor** (Phase 2)
- **Specialty:** Prose flow, sentence structure, dialogue, voice
- **Focus:** Sentence-level refinement
- **Icon:** ✨
- **Color:** Purple (#8e44ad)

### **Jordan - Copy Editor** (Phase 3)
- **Specialty:** Grammar, punctuation, consistency, accuracy
- **Focus:** Technical polish
- **Icon:** 🔍
- **Color:** Red (#e74c3c)

### **Publishing Team** (Phase 4)
- **Specialty:** Formatting, cover guidance, platform setup, marketing materials
- **Focus:** Launch preparation
- **Icon:** 🚀
- **Color:** Yellow (#f39c12)

---

## 🛠️ Key n8n Workflows

### **Active Workflows:**

1. **`free-manuscript-analysis`**
   - Webhook: `/webhook/free-manuscript-analysis`
   - Input: PDF file + author info
   - Process: Extract text → AI analysis → Generate PDF report
   - Output: Email delivery with PDF attachment

2. **`manuscript-word-count`**
   - Webhook: `/webhook/manuscript-word-count`
   - Input: PDF/DOCX file OR text string
   - Process: Extract text → count words
   - Output: JSON with word count + validation
   - Used by: Free analysis, onboarding, all phases

3. **`portal-word-count`**
   - Webhook: `/webhook/portal-word-count`
   - Input: Text string + manuscript metadata
   - Process: Word counting for onboarding uploads
   - Output: Word count + quality metrics

4. **`onboarding`**
   - Webhook: `/webhook/onboarding`
   - Input: Complete user + manuscript data
   - Process: Store in Supabase, trigger chapter parsing
   - Output: Success + manuscriptId for studio redirect

5. **`parse-chapters`**
   - Webhook: `/webhook/parse-chapters`
   - Input: Full manuscript text + chapter expectations
   - Process: Split into chapters, store in database
   - Output: Chapter structure for studio

### **Future Workflows (To Build):**
- Phase 1: Developmental editing
- Phase 2: Line editing
- Phase 3: Copy editing
- Phase 4: Publishing preparation
- Studio interactions (real-time AI chat)

---

## 📁 Current File Structure
```
authorslab-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home/Landing page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   ├── login/
│   │   │   └── page.tsx               # Login page
│   │   ├── signup/
│   │   │   └── page.tsx               # Signup page
│   │   ├── how-it-works/
│   │   │   └── page.tsx               # How It Works page
│   │   ├── pricing/
│   │   │   └── page.tsx               # Pricing page
│   │   ├── editors/
│   │   │   └── page.tsx               # Meet the Editors page
│   │   ├── faq/
│   │   │   └── page.tsx               # FAQ page
│   │   ├── free-analysis/
│   │   │   └── page.tsx               # Free analysis landing + upload
│   │   ├── onboarding/
│   │   │   └── page.tsx               # Post-signup onboarding
│   │   └── api/
│   │       └── auth/
│   │           ├── callback/
│   │           │   └── route.ts       # Supabase auth callback
│   │           └── signout/
│   │               └── route.ts       # Sign out handler
│   ├── components/
│   │   └── ui/
│   │       └── button.tsx             # Reusable button component
│   └── lib/
│       └── supabase/
│           ├── client.ts              # Supabase client
│           └── server.ts              # Supabase server utilities
├── public/
├── push.sh                            # Deployment script
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 Design System

### **Colors:**
- Primary Blue: `#3b82f6` to `#1d4ed8`
- Success Green: `#10b981` to `#059669`
- Purple Gradient: `#667eea` to `#764ba2`
- Yellow Accent: `#f1c40f` to `#f39c12`

### **Typography:**
- Headings: Bold, large sizes (text-4xl to text-6xl)
- Body: text-base to text-xl
- Font: System fonts (Inter, -apple-system)

### **Components:**
- Rounded corners: rounded-xl to rounded-3xl
- Shadows: shadow-lg to shadow-2xl
- Gradients: Linear gradients for CTAs and hero sections

---

## 🚀 Next: Author Studio Page

### **Purpose:**
The Author Studio is the core interactive workspace where authors collaborate with AI editors in real-time.

### **Key Features to Build:**
1. **Chapter Navigation**
   - Sidebar with all chapters
   - Progress indicators
   - Phase completion status

2. **Interactive Editor**
   - Text display with AI suggestions
   - Highlight problematic sections
   - Click-to-expand AI feedback

3. **AI Chat Panel**
   - Real-time conversation with Alex/Sam/Jordan
   - Context-aware responses
   - Manuscript-specific guidance

4. **Phase Progress Tracking**
   - Visual progress bars
   - Completed vs remaining chapters
   - Next steps guidance

5. **Manuscript Actions**
   - Download current version
   - Export to various formats
   - Move to next phase

### **Technical Requirements:**
- Real-time AI interactions via n8n webhooks
- Context management (store conversation history)
- Chapter state tracking
- Phase transition logic
- User session management

### **n8n Integration:**
- Studio chat workflow
- Phase-specific analysis triggers
- Progress update endpoints
- Export/download generation

---

## 🔐 Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# n8n Webhooks (public)
# These are hardcoded in components but could be env vars:
# - free-manuscript-analysis
# - manuscript-word-count
# - portal-word-count
# - onboarding
# - parse-chapters
```

---

## 📊 Database Schema (Supabase)

### **Tables to Create:**
```sql
-- Users (handled by Supabase Auth)

-- Manuscripts
CREATE TABLE manuscripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  genre TEXT,
  word_count INTEGER,
  chapter_count INTEGER,
  has_prologue BOOLEAN DEFAULT FALSE,
  has_epilogue BOOLEAN DEFAULT FALSE,
  current_phase INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chapters
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID REFERENCES manuscripts(id),
  chapter_number INTEGER,
  title TEXT,
  content TEXT,
  word_count INTEGER,
  phase_1_complete BOOLEAN DEFAULT FALSE,
  phase_2_complete BOOLEAN DEFAULT FALSE,
  phase_3_complete BOOLEAN DEFAULT FALSE,
  phase_4_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Feedback
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES chapters(id),
  phase INTEGER,
  editor_name TEXT, -- 'Alex', 'Sam', 'Jordan'
  feedback_type TEXT, -- 'structural', 'character', 'prose', 'grammar'
  feedback_content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Progress
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  manuscript_id UUID REFERENCES manuscripts(id),
  phase INTEGER,
  chapters_completed INTEGER DEFAULT 0,
  total_chapters INTEGER,
  phase_completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Completed So Far

- [x] Landing page with navigation
- [x] How It Works page (4-phase breakdown)
- [x] Pricing page (comparison table)
- [x] Meet the Editors page (Alex, Sam, Jordan)
- [x] FAQ page (comprehensive Q&A)
- [x] Free Analysis page (upload + processing)
- [x] Login page (Supabase auth)
- [x] Signup page (Supabase auth)
- [x] Onboarding page (manuscript upload + setup)
- [x] Navigation unified across all pages
- [x] n8n workflow for free analysis
- [x] n8n workflow for word count
- [x] n8n workflow for onboarding

## 🎯 Next Steps

- [ ] Author Studio page (**PRIORITY**)
- [ ] Dashboard (manuscript list, progress overview)
- [ ] Phase 1 editing workflow
- [ ] Phase 2 editing workflow
- [ ] Phase 3 editing workflow
- [ ] Phase 4 publishing workflow
- [ ] Payment integration (Stripe)
- [ ] Email notifications (phase completion)
- [ ] Admin panel (user management)

---

## 🔗 Important URLs

- **Production:** https://authorslab.ai
- **n8n:** https://spikeislandstudios.app.n8n.cloud
- **Supabase:** [Your Supabase Dashboard]
- **Vercel:** [Your Vercel Dashboard]
- **GitHub:** [Your Repo]

---

## 💡 Key Insights for Next Chat

1. **Author Studio is the heart of the product** - This is where users spend most of their time
2. **Each phase needs its own workflow** - 4 separate n8n workflows for editing
3. **State management is critical** - Track which chapters are complete, which phase user is in
4. **AI context is key** - Pass entire manuscript + current chapter + previous feedback for best results
5. **The "collaborative" feeling matters** - Make it feel like working WITH an editor, not just getting reports

---

## 🆘 Common Issues & Solutions

**Issue:** Build fails with "useSearchParams needs Suspense"
**Solution:** Wrap component using useSearchParams in `<Suspense>` boundary

**Issue:** Tailwind styles not applying
**Solution:** Check globals.css has `@import "tailwindcss";`

**Issue:** Supabase auth not working
**Solution:** Check environment variables, verify callback URL in Supabase dashboard

**Issue:** n8n webhook not receiving data
**Solution:** Check CORS settings, verify webhook URL, check request payload format

---

**Last Updated:** October 16, 2025
**Status:** Pre-launch development - Core pages complete, Studio in progress


# AuthorsLab.ai - Current Status (Oct 18 2025)

## ✅ Completed
- User authentication (Supabase Auth + RLS policies)
- Signup/Login flow with profile creation
- Onboarding page with PDF upload
- PDF text extraction workflow (extract-pdf-text)
- Word count analysis workflow (pdf-word-count)
- Manuscript creation in Supabase
- Author profiles synced with auth

## 🔧 Working Features
- Signup → Onboarding → Upload PDF → Word count → Submit
- All data stored in Supabase (author_profiles, manuscripts)
- n8n workflows: extract-pdf-text, pdf-word-count, onboarding

## 🚧 Next Steps (Author Studio Integration)
- Fix author-studio page to load manuscripts from Supabase
- Fix parse-chapters workflow (currently failing)
- Display chapters in studio interface
- Integrate Alex (developmental editing AI)
- Add Sam & Jordan specialists
- Connect analysis scores to UI

## 🔑 Key Technical Details
- PDF-only uploads (client sends text, not binary)
- Word count: analytical only, no DB writes
- Onboarding: creates manuscript with all metadata
- UUIDs: crypto.randomUUID() for all IDs
- RLS: Permissive for authenticated users

## 📂 Database Schema
- author_profiles (id, auth_user_id, email, first_name, last_name)
- manuscripts (id, author_id, title, genre, full_text, word_count, etc.)
- chapters (id, manuscript_id, chapter_number, title, content, status)
- manuscript_scores (structural, character, plot, pacing, thematic)

## 🔗 n8n Webhooks
- extract-pdf-text: Extracts text from PDF binary
- pdf-word-count: Analyzes text, returns word count
- onboarding: Creates manuscript + author profile
- parse-chapters: (needs fixing) Should parse chapters from text