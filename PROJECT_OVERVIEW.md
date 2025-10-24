# AuthorsLab.ai - Project Overview

## 🎯 Mission
Transform manuscript editing from a passive service into an active AI-powered collaboration, guiding authors from first draft to published book through specialized AI editing phases.

## 🏗️ System Architecture

### **Frontend: Next.js 15 App**
- **Hosting:** Vercel (authorslab.ai)
- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS v4
- **Auth:** Supabase Authentication
- **Payments:** Stripe (planned)

### **Backend: n8n Workflows**
- **Hosting:** n8n Cloud (spikeislandstudios.app.n8n.cloud)
- **Purpose:** AI orchestration, manuscript processing, email delivery
- **AI Engine:** Claude Sonnet 4 via Anthropic API

### **Database & Storage: Supabase**
- **User accounts** (via Supabase Auth)
- **Manuscript metadata & full text storage**
- **Chapter data with summaries and status tracking**
- **Manuscript issues (flagged, resolved, dismissed)**
- **Author profiles**
- **PDF report storage** (via Supabase Storage - planned)

---

## 📦 Product Offerings

### 1. **Free Manuscript Analysis** ($0)
- **URL:** `/free-analysis`
- **Workflow:** `free-manuscript-analysis`
- **Delivers:** Comprehensive overview report (PDF) via email
- **Purpose:** Lead generation, showcase AI capabilities
- **Timeline:** ~3 minutes
- **Status:** ✅ LIVE

### 2. **Complete Author Package - Phase 1** ($399 one-time)
- **URL:** `/pricing` → `/signup` → `/onboarding` → `/author-studio`
- **Workflows:** Full manuscript analysis + chapter-by-chapter editing
- **Delivers:** 
  - Comprehensive 5-dimensional manuscript analysis (PDF via email)
  - Real-time AI collaboration workspace
  - Chapter-by-chapter developmental editing with Alex
  - Actionable issue tracking and resolution
- **Timeline:** Analysis: ~3 minutes | Editing: Author's pace
- **Status:** ✅ PHASE 1 COMPLETE & LIVE
- **Features:**
  - ✅ Full manuscript analysis (Structure, Character, Plot, Pacing, Theme)
  - ✅ PDF report generation and email delivery
  - ✅ Manuscript summary generation (2-3 sentences)
  - ✅ Key points extraction (5-7 bullets)
  - ✅ Chapter summaries (for context)
  - ✅ On-demand chapter analysis (1-2 initial thoughts per chapter)
  - ✅ Interactive issues panel with filtering
  - ✅ Real-time chat with Alex
  - ✅ Chapter status tracking (D/C/L indicators)
  - ✅ Unsaved changes detection
  - ✅ Issue resolution workflow (Resolve, Discuss, Dismiss)

### 3. **Future Phases (Planned)**
- **Phase 2:** Line editing with Sam
- **Phase 3:** Copy editing with Jordan
- **Phase 4:** Publishing preparation

---

## 🔄 n8n Workflows

### Active Workflows:

1. **`alex-full-manuscript-analysis`** ✅
   - Webhook: `/webhook/alex-full-manuscript-analysis`
   - Input: manuscriptId, userId
   - Process: 
     - Fetches manuscript + all chapters from Supabase
     - Runs 5 parallel AI analyses (Structure, Character, Plot, Pacing, Theme)
     - Synthesizes into comprehensive report
     - Generates PDF with report
     - Emails PDF to author
     - Marks report complete in database (`report_pdf_completed_at`)
   - Output: Success response
   - Timeline: ~3-4 minutes

2. **`generate-summary-points`** ✅
   - Webhook: `/webhook/generate-summary-points`
   - Input: manuscriptId, userId
   - Process:
     - Fetches manuscript + all chapters
     - Runs 5 parallel AI analyses (same as full analysis)
     - Generates 2-3 sentence manuscript summary
     - Extracts 5-7 key point bullets
     - Stores both in database
     - Marks analysis complete (`full_analysis_completed_at`)
   - Output: Success when editing data is ready
   - Timeline: ~2-3 minutes
   - **Note:** Enables chapter editing; runs in parallel with full analysis

3. **`generate-chapter-summaries`** ✅
   - Webhook: `/webhook/generate-chapter-summaries`
   - Input: manuscriptId, userId
   - Process:
     - Fetches all chapters
     - Loops through each chapter individually
     - Generates 2-3 sentence summary per chapter
     - Updates chapter records with summaries
   - Output: Success when all summaries complete
   - Timeline: ~2-3 minutes (parallel with other workflows)

4. **`alex-chapter-analysis`** ✅
   - Webhook: `/webhook/alex-chapter-analysis`
   - Input: manuscriptId, chapterNumber, userId
   - Process:
     - Fetches manuscript context (summary + key points)
     - Fetches current chapter + previous chapter summary
     - Generates 1-2 conversational "initial thoughts"
     - Inserts as issues into manuscript_issues table
   - Output: Success when issues are ready
   - Timeline: ~30 seconds
   - **Strategy:** Conversation starters, not prescriptive fixes

5. **`alex-chat`** ✅
   - Webhook: `/webhook/alex-chat`
   - Input: message, context (chapter, manuscript, content)
   - Process: Context-aware AI conversation
   - Output: Alex's response + structured suggestions
   - Timeline: Real-time (~2-3 seconds)
   - **TODO:** Integrate manuscript summary + key points for better context

6. **`onboarding`** ✅
   - Webhook: `/webhook/onboarding`
   - Input: Complete user + manuscript data
   - Process: 
     - Creates/updates author profile
     - Creates manuscript record
     - Parses chapters from full text
     - Stores all chapters in database
   - Output: Success + manuscriptId
   - Timeline: ~30 seconds

---

## 📊 Database Schema Updates

### Recent Additions:

**manuscripts table:**
- `manuscript_summary` (TEXT) - 2-3 sentence story summary
- `full_analysis_key_points` (TEXT) - 5-7 bullet point takeaways
- `full_analysis_text` (TEXT) - Complete analysis text
- `report_pdf_completed_at` (TIMESTAMP) - When PDF report finished
- `report_pdf_url` (TEXT) - URL to stored PDF report

**chapters table:**
- `chapter_summary` (TEXT) - 2-3 sentence chapter summary for context

### Existing Core Tables:
- `author_profiles` - User data linked to Supabase Auth
- `manuscripts` - Manuscript metadata and analysis results
- `chapters` - Individual chapter content and summaries
- `manuscript_issues` - Flagged editing points with status tracking

---

## 🔧 Key Technical Improvements (Recent)

### 1. **Workflow Separation**
Split monolithic full-analysis workflow into 3 parallel workflows:
- `alex-full-manuscript-analysis` - PDF report generation
- `generate-summary-points` - Editing data (summary + key points)
- `generate-chapter-summaries` - Chapter context

**Benefits:**
- Studio unblocks faster (~2-3 min vs ~5 min)
- Easier debugging and maintenance
- True parallel execution
- Independent failure handling

### 2. **Chapter Analysis Strategy Shift**
**Old:** 2-5 prescriptive issues per dimension (10-25 total per chapter)
**New:** 1-2 conversational "initial thoughts" per chapter

**Rationale:** Authors prefer discussion over overwhelming issue lists

### 3. **Context-Rich Analysis**
Chapter analysis now includes:
- Manuscript summary (the "why" of the story)
- Key points from full analysis (high-level patterns)
- Previous chapter summary (continuity)
- Current chapter content

**Result:** More coherent, story-aware suggestions

### 4. **PostgreSQL Dollar Quoting**
All text storage uses `$delimiter$...$delimiter$` to handle apostrophes and special characters safely.

### 5. **Branding Update**
Changed from "Spike Island AI" to "AuthorsLab.ai" across:
- PDF report templates
- Email templates
- Frontend messaging

---

## 🎨 Frontend Architecture

### Author Studio Layout:
- **Left Panel:** Collapsible chapter navigation with status indicators (D/C/L)
- **Center Panel:** Rich text editor with real-time autosave
- **Right Panel:** Alex chat interface with issue integration
- **Overlay Panel:** Issue filtering and management

### Key Features:
- Real-time chapter editing with unsaved changes tracking
- One-click chapter analysis triggering
- Conversational AI assistance
- Issue status management (flagged → resolved/dismissed)
- Auto-scrolling chat interface
- Progressive status messages during long operations

---

## 🔐 Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# n8n Webhooks (hardcoded in app)
# - alex-full-manuscript-analysis
# - generate-summary-points
# - generate-chapter-summaries
# - alex-chapter-analysis
# - alex-chat
# - onboarding
# - manuscript-word-count
# - free-manuscript-analysis
```

---

## 🆘 Recent Solutions & Fixes

### **Workflow Timing Issues:**
- Solution: Split workflows to unblock studio faster
- Moved completion markers to fastest branch (summary generation)
- PDF generation continues in background

### **Chapter Analysis Context:**
- Problem: Alex generating irrelevant suggestions
- Solution: Fetch manuscript summary, key points, and previous chapter before analysis
- Result: Contextually aware, coherent suggestions

### **Text Storage with Apostrophes:**
- Problem: SQL syntax errors with author names like "Jonah's"
- Solution: PostgreSQL dollar quoting `$delimiter$text$delimiter$`
- Applied to: summary, key points, full analysis, chapter summaries

### **CORS Issues:**
- Solution: Database polling for completion status
- Frontend handles CORS gracefully, checks database instead of relying on webhook response

### **Chapter 0 Issue:**
- Problem: All issues assigned to prologue
- Solution: Fixed Prepare Chapter Data to use `find()` by `chapter_number` instead of array index

### **Unsaved Changes:**
- Solution: Track Set of unsaved chapter IDs, persist across navigation, browser warning on exit

---

## 📈 Performance Metrics

- **Full Analysis (PDF Report):** ~3-4 minutes
- **Summary + Key Points:** ~2-3 minutes (enables editing)
- **Chapter Summaries:** ~2-3 minutes (runs in parallel)
- **Chapter Analysis:** ~30 seconds per chapter (on-demand)
- **Chat Response:** Real-time (~2-3 seconds)
- **PDF Generation:** Included in full analysis time
- **Email Delivery:** Immediate after PDF generation

**Total Time to Start Editing:** ~2-3 minutes (waiting for summary + key points)
**PDF Report Arrival:** ~3-4 minutes (background, email notification)

---

## 💡 Key Technical Decisions

1. **Parallel Workflow Execution**
   - Three independent workflows triggered simultaneously
   - Studio unblocks as soon as editing data is ready
   - PDF report completes in background
   - Better UX and easier debugging

2. **On-Demand Chapter Analysis**
   - Users trigger analysis per chapter, not all at once
   - Faster UX (30 sec vs 20+ minutes)
   - Lower API costs
   - Progressive workflow feels more collaborative

3. **Database Polling vs Webhook Response**
   - Frontend polls database for completion
   - Handles CORS issues gracefully
   - More reliable than webhook responses
   - Better user feedback

4. **Two Analysis Types**
   - Strategic: Full manuscript analysis → PDF report
   - Tactical: Chapter-by-chapter → 1-2 initial thoughts
   - No redundancy, clear separation of concerns

5. **Context-First Chapter Analysis**
   - Every chapter analysis includes manuscript summary, key points, and previous chapter
   - Enables coherent, story-aware suggestions
   - Feels like working with an editor who's read the whole book

6. **Issue Status Workflow**
   - Flagged → In Progress → Resolved/Dismissed
   - Simple but effective
   - Tracks author progress
   - Enables analytics (future feature)

7. **Alex Personality**
   - Warm, encouraging, specific
   - Conversational rather than prescriptive
   - Invites discussion rather than dictating fixes
   - Professional but friendly tone

---

## 🚀 Future Enhancements

### **Phase 2 & 3: Sam (Line Editor) and Jordan (Copy Editor)**
- [ ] Additional AI editor personalities
- [ ] Phase-specific analysis workflows
- [ ] Transition workflow between phases

### **Platform Enhancements:**
- [ ] Stripe payment integration
- [ ] Dashboard (manuscript list)
- [ ] Progress analytics
- [ ] Export functionality (docx, PDF)
- [ ] Mobile responsiveness improvements
- [ ] Admin panel
- [ ] PDF report viewing in app (currently email-only)
- [ ] Supabase Storage integration for PDFs
- [ ] Enhanced alex-chat with full context (summary + key points)

### **User Experience:**
- [ ] Better progress indicators during analysis
- [ ] "View Report" button functionality
- [ ] Chapter comparison view
- [ ] Revision history tracking
- [ ] Collaborative features (share with beta readers)

---

**Last Updated:** October 24, 2025  
**Status:** Phase 1 Complete & Live - Author Studio fully functional with optimized workflows  
**Current Focus:** Testing split workflow performance and preparing for Phase 2 development

---

## 📝 Development Notes

### Custom Deployment:
```bash
./push.sh "commit message"
```

### Debugging Workflow Issues:
1. Check n8n execution logs for node-by-node output
2. Verify database updates via Supabase SQL editor
3. Use console.log statements in Code nodes
4. Test webhooks individually with Postman/Insomnia

### Common Pitfalls:
- Always use `$('NodeName').first().json` to reference other nodes
- Use dollar quoting for text with special characters
- Remember n8n doesn't show in-progress execution
- CORS errors don't mean workflow failed - check database
- Chapter numbers start at 1, not 0 (except in arrays)

---

## 🎯 Success Metrics

- Phase 1 fully operational
- Author studio provides real-time collaboration
- Analysis workflows optimized for speed and reliability
- Clean separation of concerns across workflows
- Maintainable, debuggable codebase
- Professional UX with proper loading states and error handling