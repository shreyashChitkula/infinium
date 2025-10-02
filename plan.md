# The Core Game Plan: 9:45 AM - 6:00 PM

This plan assumes a minimum of two developers working in parallel (one backend, one frontend), with a third person potentially focusing on documentation and project management/QA if available. If it's a solo effort, the "parallel" tasks will need to be executed sequentially or very quickly iterated.

## Phase 1: Strategy, Architecture, and Design (9:45 AM - 11:00 AM)

**Goal:** Create a complete blueprint before any major coding begins. This ensures everyone is aligned and covers key documentation requirements early.

### 9:45 AM - 10:30 AM: Define Game Mechanics & Full API Specification

**Task:** On a whiteboard, define all the core game rules (e.g., points for logging workouts, reading articles, viewing insurance policies to address the Feature Discovery Gap).

**Detailed Breakdown:**
* **Point System:**
    * Daily Login: 5 points
    * Log Workout: 10 points
    * Read Wellness Article: 7 points
    * View Insurance Policy (Feature Discovery Gap): 15 points (high value to encourage discovery)
    * Complete Personalized Challenge: 50 points
    * Invite Friend (Viral/Social): 20 points
* **Levels/Progression:**
    * Level 1: 0-99 points (Beginner)
    * Level 2: 100-299 points (Explorer)
    * Level 3: 300-599 points (Advocate)
    * Level 4: 600+ points (Champion)
* **Rewards:**
    * Level-up badges (visual recognition)
    * Completion of personalized challenge: small in-app coin bonus / discount on premium (for Business Model Integration).
    * Leaderboard placement (social recognition).
* **Personalized Challenges:** Simple "complete X workouts this week" or "read Y articles this month" based on past inactivity or low engagement in a specific wellness category.
* **Social Features:** Leaderboard showing top users by points. Friend invite mechanism (even if just a share button for now).
* **Documentation Output (initial thoughts):** Start a `README.md` or a `DESIGN.md` file to quickly jot these down.

**Task:** Specify the entire API surface area for both MVP and advanced features.

**Detailed Breakdown (Backend Developer Focus):**
* **Authentication (Simplified for Hackathon):** Assume a single hardcoded user or a very basic token. Don't waste time on full auth.
* **`POST /api/events`** (Core Engine):
    * Request Body:
        ```json
        { "userId": "user123", "eventType": "log_workout", "timestamp": "ISO_DATE" }
        ```
    * Response:
        ```json
        { "success": true, "pointsAwarded": 10, "currentPoints": 150, "levelUp": true, "newLevel": 2 }
        ```
* **`GET /api/users/{userId}/profile`** (Core Engine):
    * Response:
        ```json
        { "userId": "user123", "username": "John Doe", "currentPoints": 150, "level": 2, "badges": ["Beginner", "Explorer"], "unlockedPremiumDiscount": false }
        ```
* **`GET /api/users/{userId}/personalized-challenge`** (AI Component - simplified):
    * Response:
        ```json
        { "challengeId": "c001", "description": "Complete 3 workouts this week!", "progress": "1/3", "status": "active", "rewardPoints": 50 }
        ```
* **`GET /api/leaderboard`** (Social Feature):
    * Response:
        ```json
        [ { "userId": "user001", "username": "Alice", "points": 850 }, { "userId": "user002", "username": "Bob", "points": 720 }, ... ]
        ```
* **Documentation Output:** Create an `API_SPECS.md` file. Use a simple text format for speed, like Markdown.

### 10:30 AM - 11:00 AM: Database Schema & UI/UX Wireframing

**Task:** Design the database schemas for users, events, and any other required tables.

**Detailed Breakdown (Backend Developer Focus):**
* **Users Table:**
    * `id` (PK, UUID)
    * `username` (TEXT)
    * `points` (INTEGER, default 0)
    * `level` (INTEGER, default 1)
    * `badges` (JSONB/ARRAY of TEXT) - Store strings like "Beginner", "Explorer".
    * `unlocked_premium_discount` (BOOLEAN, default false)
    * `last_active` (DATETIME)
    * `created_at` (DATETIME)
* **Events Table:**
    * `id` (PK, UUID)
    * `user_id` (FK to Users.id)
    * `event_type` (TEXT - e.g., 'log_workout', 'read_article', 'view_policy', 'invite_friend', 'challenge_complete')
    * `points_awarded` (INTEGER)
    * `timestamp` (DATETIME)
* **Challenges Table (Optional, or just generate on the fly for MVP):**
    * `id` (PK, UUID)
    * `user_id` (FK)
    * `description` (TEXT)
    * `target_value` (INTEGER - e.g., 3 workouts)
    * `current_value` (INTEGER)
    * `event_type_trigger` (TEXT - what event counts towards this challenge)
    * `status` (TEXT - 'active', 'completed', 'failed')
    * `reward_points` (INTEGER)
    * `start_date`, `end_date` (DATETIME)
* **Documentation Output:** Add a `DATABASE_SCHEMA.md` to your project.

**Task:** Create low-fidelity wireframes (sketches) of all UI components. This forms the basis for your User Journey Maps.

**Detailed Breakdown (Frontend Developer Focus):**
* **Tools:** Pen and paper, or a very fast digital tool like Excalidraw, Balsamiq, or even Figma's quick shape tools. No need for high fidelity yet.
* **Dashboard:**
    * User's name, current points, level.
    * Badges earned (icons/small images).
    * "Log Workout," "Read Article," "View Policy" buttons (mock actions).
    * Current Personalized Challenge display (description, progress bar).
    * Call to action for "Invite Friend."
* **Leaderboard:**
    * List of top 10-20 users: Rank, Username, Points. Highlight current user.
* **User Journey Maps (Verbal/Quick Flow):**
    * User logs in -> sees dashboard -> clicks "Log Workout" -> points increase, possibly levels up -> sees new challenge -> navigates to leaderboard.
* **Documentation Output:** Take photos of your sketches or export quick screenshots from your digital tool. Bundle them into a `WIREFRAMES.pdf` or `UX_FLOWS.md`.

## Phase 2: Parallel Development Sprints (11:00 AM - 3:00 PM)

**Goal:** Build the backend services and the frontend UI concurrently.

### Track A: Backend Sprint (Lead Developer)
* **Tools:** Node.js/Express, Python/Flask, Go. SQLite for the database.
* **11:00 AM - 1:00 PM: Build the Core Gamification Engine**
    * Set up the server and database connection (`db.js`).
    * Implement the Users and Events data models.
    * Build and test the two core MVP endpoints: `POST /api/events` and `GET /api/users/{userId}/profile`.
    * Testing: Use Postman/Insomnia or `curl`.
* **1:00 PM - 1:30 PM: LUNCH BREAK**
* **1:30 PM - 3:00 PM: Build Advanced Feature Endpoints**
    * Implement `GET /api/leaderboard`.
    * Implement `GET /api/users/{userId}/personalized-challenge` with simplified "AI/ML" rules.

### Track B: Frontend Sprint (UI/UX Developer)
* **Tools:** React, Vue, Svelte, or plain HTML/CSS/JS. Figma/Sketch for mockups.
* **11:00 AM - 1:00 PM: Create High-Fidelity User Interface Mockups**
    * Based on wireframes, create visually appealing mockups in Figma.
    * Design the dashboard, leaderboard, and notifications.
    * **Documentation Output:** Export as `MOCKUPS.pdf` or `MOCKUPS.png`.
* **1:00 PM - 1:30 PM: LUNCH BREAK**
* **1:30 PM - 3:00 PM: Build Static Frontend Components**
    * Initialize Frontend Project (e.g., `npx create-react-app`).
    * Create components (`Dashboard.js`, `Leaderboard.js`, etc.).
    * Hardcode dummy JSON data to populate components while the backend is being built.
    * Apply styling to match the mockups.

## Phase 3: Integration, Business Logic & Polish (3:00 PM - 5:00 PM)

**Goal:** Merge the frontend and backend, implement the business feature, and create a polished Working Prototype.

### 3:00 PM - 4:15 PM: Full Stack Integration
* **Task:** Connect the frontend to the backend.
* **Detailed Breakdown:**
    * Replace all hardcoded dummy data with `fetch` or Axios calls to your backend endpoints.
    * Implement action handlers for buttons to send `POST /api/events` requests.
    * Re-fetch user profile after a `POST` request to update the UI.
    * Add basic error handling (`try...catch`).
    * Test each user action from the frontend, verifying that the UI reflects changes.

### 4:15 PM - 5:00 PM: Implement Business Model Integration & Polish
* **Task (Backend):** Modify the logic where user levels are updated.
    * `IF newLevel >= 3 THEN user.unlocked_premium_discount = true;`
    * Ensure this flag is returned in the `GET /api/users/{userId}/profile` response.
    * **Documentation Output:** Update `API_SPECS.md` to show this new field.
* **Task (Frontend):** Add UI logic to display a special banner or badge if `profile.unlockedPremiumDiscount` is true.
* **User Experience (Polish):**
    * Add subtle animations for points increase or level-up.
    * Ensure all buttons are responsive and check visual consistency.

## Phase 4: Documentation & Final Submission (5:00 PM - 6:00 PM)

**Goal:** Finalize all Documentation Requirements and submit the project on time.

### 5:00 PM - 5:30 PM: Finalize All Documents
* **Compile the Technical Documentation:**
    * Review `API_SPECS.md` and `DATABASE_SCHEMA.md` for accuracy.
    * Create a simple `ARCHITECTURE.md` explaining your tech stack.
* **Write the Business Case Analysis:**
    * Create `BUSINESS_CASE.md`.
    * Explain how gamification addresses problem areas and achieves KPIs.
    * **Increase DAU by 40%:** Daily login points & personalized daily challenges.
    * **Drive downloads by 50%:** Leaderboard and "Invite Friend" feature.
    * **Improve feature adoption by 60%:** High point value & challenges for unused features.
    * **ROI:** The premium discount links engagement to revenue and increases user LTV.
* **Create the Implementation Roadmap:**
    * Create `ROADMAP.md`.
    * **Short-term (1-2 weeks):** Real auth, more challenge types, visual feedback.
    * **Mid-term (1-3 months):** Enhance AI, team challenges, Blockchain rewards.
    * **Long-term (3-6+ months):** AR integration, healthcare provider partnerships.
    * **Scalability Plan:** Discuss using cloud services (AWS Lambda, Google Cloud Run) and managed databases.

### 5:30 PM - 5:50 PM: Record Demo & Package Project
* **Record a concise video (3-5 minutes).**
    * **Script:**
        1.  Start on the dashboard.
        2.  Perform actions ("Log Workout", "View Policy"), showing points increase.
        3.  Show the personalized challenge.
        4.  Navigate to the leaderboard.
        5.  Showcase a user who has unlocked the premium discount banner and explain its business impact.
* **Zip up your source code, documentation, and demo video.**
    * Create a clean folder structure:
        ```
        my_gamification_challenge/
        ├── frontend/
        ├── backend/
        ├── docs/
        │   ├── README.md
        │   ├── API_SPECS.md
        │   ├── DATABASE_SCHEMA.md
        │   ├── ARCHITECTURE.md
        │   ├── BUSINESS_CASE.md
        │   ├── ROADMAP.md
        │   ├── WIREFRAMES/
        │   └── MOCKUPS/
        └── demo.mp4
        ```

### 5:50 PM: SUBMIT
* **Final Check:** Ensure the zip file is complete and all parts are accessible. Good luck!