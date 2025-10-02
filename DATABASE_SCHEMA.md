# YouMatter Gamification - Database Schema

## Overview
SQLite database designed for high performance with proper indexing and relationships.

## Tables

### users
Primary user information and gamification data.

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,                          -- UUID v4
    username TEXT UNIQUE NOT NULL,               -- Display name
    email TEXT UNIQUE NOT NULL,                  -- Login email
    password_hash TEXT NOT NULL,                 -- Bcrypt hashed password
    points INTEGER DEFAULT 0,                    -- Total points earned
    level INTEGER DEFAULT 1,                     -- Current level (1-5)
    streak INTEGER DEFAULT 0,                    -- Consecutive login days
    last_streak_date TEXT,                       -- Last streak increment date
    badges TEXT DEFAULT '[]',                    -- JSON array of badge names
    unlocked_premium_discount BOOLEAN DEFAULT 0, -- Premium discount eligibility
    discount_percentage INTEGER DEFAULT 0,        -- Discount percentage (10-30%)
    avatar_url TEXT,                             -- Profile picture URL
    preferences TEXT DEFAULT '{}',               -- JSON user preferences
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_users_last_active ON users(last_active);
```

### events
Activity tracking for all user actions.

```sql
CREATE TABLE events (
    id TEXT PRIMARY KEY,                         -- UUID v4
    user_id TEXT NOT NULL,                       -- Foreign key to users.id
    event_type TEXT NOT NULL,                    -- Type of event performed
    points_awarded INTEGER NOT NULL,             -- Points given for this event
    metadata TEXT DEFAULT '{}',                  -- JSON additional event data
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes  
CREATE INDEX idx_user_events ON events(user_id, timestamp DESC);
CREATE INDEX idx_event_type ON events(event_type);
CREATE INDEX idx_timestamp ON events(timestamp DESC);
CREATE INDEX idx_points_awarded ON events(points_awarded);
```

**Event Types:**
- `daily_login` - User logged in for the day
- `log_workout` - User logged a workout session
- `read_article` - User read a wellness article
- `view_policy` - User viewed an insurance policy
- `complete_challenge` - User completed a challenge
- `invite_friend` - User invited a friend
- `share_achievement` - User shared an achievement
- `use_new_feature` - User tried a new feature

### challenges
Gamified tasks for users to complete.

```sql
CREATE TABLE challenges (
    id TEXT PRIMARY KEY,                         -- UUID v4
    user_id TEXT NOT NULL,                       -- Foreign key to users.id
    challenge_type TEXT NOT NULL,                -- Type of challenge
    title TEXT NOT NULL,                         -- Display title
    description TEXT,                            -- Detailed description
    target_value INTEGER NOT NULL,               -- Goal to reach
    current_progress INTEGER DEFAULT 0,          -- Current progress
    status TEXT DEFAULT 'active',                -- active, completed, failed, expired
    category TEXT NOT NULL,                      -- health, wellness, insurance, social
    difficulty TEXT DEFAULT 'medium',            -- easy, medium, hard
    reward_points INTEGER NOT NULL,              -- Points awarded on completion
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,                          -- Challenge expiration
    completed_at TIMESTAMP,                      -- Completion timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_user_challenges ON challenges(user_id, status);
CREATE INDEX idx_challenge_type ON challenges(challenge_type);
CREATE INDEX idx_category ON challenges(category);
CREATE INDEX idx_status ON challenges(status);
CREATE INDEX idx_end_date ON challenges(end_date);
```

**Challenge Types:**
- `workout_streak` - Complete X workouts in Y days
- `article_reader` - Read X articles
- `policy_explorer` - View X insurance policies
- `social_connector` - Invite X friends
- `feature_discoverer` - Use X different features

### achievements
Unlockable badges and milestones.

```sql
CREATE TABLE achievements (
    id TEXT PRIMARY KEY,                         -- UUID v4
    name TEXT UNIQUE NOT NULL,                   -- Achievement name
    description TEXT,                            -- What user accomplished
    category TEXT,                               -- health, wellness, insurance, social
    icon_url TEXT,                               -- Badge icon image
    points_required INTEGER,                     -- Points needed to unlock
    rarity TEXT DEFAULT 'common',                -- common, rare, epic, legendary
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
CREATE INDEX idx_achievements_points ON achievements(points_required);
```

### user_achievements
Many-to-many relationship for user badges.

```sql
CREATE TABLE user_achievements (
    id TEXT PRIMARY KEY,                         -- UUID v4
    user_id TEXT NOT NULL,                       -- Foreign key to users.id
    achievement_id TEXT NOT NULL,                -- Foreign key to achievements.id
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_user_achievements ON user_achievements(user_id, earned_at DESC);
CREATE INDEX idx_achievement_users ON user_achievements(achievement_id);
```

### friendships
Social connections between users.

```sql
CREATE TABLE friendships (
    id TEXT PRIMARY KEY,                         -- UUID v4
    requester_id TEXT NOT NULL,                  -- User who sent friend request
    addressee_id TEXT NOT NULL,                  -- User who received request
    status TEXT DEFAULT 'pending',               -- pending, accepted, declined, blocked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(requester_id, addressee_id),
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id, status);
```

### articles
Wellness content for users to read.

```sql
CREATE TABLE articles (
    id TEXT PRIMARY KEY,                         -- UUID v4
    title TEXT NOT NULL,                         -- Article title
    content TEXT NOT NULL,                       -- Full article content
    summary TEXT,                                -- Brief description
    category TEXT NOT NULL,                      -- health, wellness, insurance
    author TEXT,                                 -- Article author
    read_time INTEGER,                           -- Estimated read time (minutes)
    points_reward INTEGER DEFAULT 7,             -- Points for reading
    featured BOOLEAN DEFAULT 0,                  -- Featured article flag
    image_url TEXT,                              -- Header image
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (read_time > 0),
    CHECK (points_reward >= 0)
);

-- Indexes
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_featured ON articles(featured, published_at DESC);
CREATE INDEX idx_articles_published ON articles(published_at DESC);
```

### user_article_reads
Track which articles users have read.

```sql
CREATE TABLE user_article_reads (
    id TEXT PRIMARY KEY,                         -- UUID v4
    user_id TEXT NOT NULL,                       -- Foreign key to users.id
    article_id TEXT NOT NULL,                    -- Foreign key to articles.id
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_user_reads ON user_article_reads(user_id, read_at DESC);
CREATE INDEX idx_article_reads ON user_article_reads(article_id);
```

### insurance_policies
Insurance products available for viewing.

```sql
CREATE TABLE insurance_policies (
    id TEXT PRIMARY KEY,                         -- UUID v4
    name TEXT NOT NULL,                          -- Policy name
    type TEXT NOT NULL,                          -- Policy type (Health, Life, etc.)
    description TEXT,                            -- Policy description
    benefits TEXT DEFAULT '[]',                  -- JSON array of benefits
    points_for_viewing INTEGER DEFAULT 15,       -- Points awarded for viewing
    is_new BOOLEAN DEFAULT 0,                    -- New policy flag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_policies_type ON insurance_policies(type);
CREATE INDEX idx_policies_new ON insurance_policies(is_new, created_at DESC);
```

### user_policy_views
Track which policies users have viewed.

```sql
CREATE TABLE user_policy_views (
    id TEXT PRIMARY KEY,                         -- UUID v4
    user_id TEXT NOT NULL,                       -- Foreign key to users.id
    policy_id TEXT NOT NULL,                     -- Foreign key to insurance_policies.id
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, policy_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (policy_id) REFERENCES insurance_policies(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_user_policy_views ON user_policy_views(user_id, viewed_at DESC);
CREATE INDEX idx_policy_views ON user_policy_views(policy_id);
```

### daily_stats
Aggregated daily analytics for performance.

```sql
CREATE TABLE daily_stats (
    id TEXT PRIMARY KEY,                         -- UUID v4
    user_id TEXT NOT NULL,                       -- Foreign key to users.id
    date TEXT NOT NULL,                          -- YYYY-MM-DD format
    points_earned INTEGER DEFAULT 0,             -- Points earned this day
    events_count INTEGER DEFAULT 0,              -- Number of events
    time_spent INTEGER DEFAULT 0,               -- Time in app (seconds)
    features_used TEXT DEFAULT '[]',             -- JSON array of features used
    
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_daily_stats_user ON daily_stats(user_id, date DESC);
CREATE INDEX idx_daily_stats_date ON daily_stats(date);
```

## Sample Data

### Default Achievements
```sql
INSERT INTO achievements (id, name, description, category, points_required, rarity) VALUES
('ach_first_steps', 'First Steps', 'Completed your first workout', 'health', 0, 'common'),
('ach_bookworm', 'Bookworm', 'Read your first wellness article', 'wellness', 0, 'common'),
('ach_policy_wise', 'Policy Wise', 'Viewed your first insurance policy', 'insurance', 0, 'common'),
('ach_social_butterfly', 'Social Butterfly', 'Invited your first friend', 'social', 0, 'common'),
('ach_week_warrior', 'Week Warrior', '7-day login streak', 'engagement', 35, 'rare'),
('ach_fitness_fan', 'Fitness Fanatic', 'Logged 10 workouts', 'health', 100, 'rare'),
('ach_knowledge_seeker', 'Knowledge Seeker', 'Read 25 articles', 'wellness', 175, 'epic'),
('ach_insurance_expert', 'Insurance Expert', 'Viewed 10 policies', 'insurance', 150, 'epic'),
('ach_wellness_master', 'Wellness Master', 'Reached Level 5', 'engagement', 1000, 'legendary');
```

### Sample Insurance Policies
```sql
INSERT INTO insurance_policies (id, name, type, description, benefits) VALUES
('pol_health_shield', 'Health Shield Plus', 'Health Insurance', 
 'Comprehensive health coverage with wellness benefits', 
 '["Annual health check-up", "Preventive care coverage", "Wellness program discounts"]'),
('pol_life_secure', 'Life Secure Pro', 'Life Insurance',
 'Term life insurance with investment benefits',
 '["Life coverage up to 1 Crore", "Tax benefits", "Flexible premium payment"]'),
('pol_critical_care', 'Critical Care Guard', 'Critical Illness',
 'Protection against major critical illnesses',
 '["Coverage for 36 critical illnesses", "Lump sum payout", "No medical tests up to 35 years"]');
```

### Sample Articles
```sql
INSERT INTO articles (id, title, summary, category, read_time, content) VALUES
('art_sleep_tips', '10 Tips for Better Sleep', 'Discover science-backed methods to improve sleep quality', 'wellness', 5,
 'Good sleep is essential for health. Here are 10 proven tips: 1. Maintain a consistent sleep schedule...'),
('art_home_workout', 'Effective Home Workouts', 'Get fit without expensive gym memberships', 'health', 8,
 'You don''t need a gym to stay fit. These home workout routines can help you build strength and endurance...'),
('art_insurance_basics', 'Insurance 101: Basics Everyone Should Know', 'Understanding the fundamentals of insurance', 'insurance', 6,
 'Insurance can seem complex, but understanding the basics is crucial for financial planning...');
```

## Performance Considerations

### Indexing Strategy
- Primary keys are UUIDs for better distribution
- Composite indexes on frequently queried combinations
- Covering indexes for leaderboard queries
- Partial indexes on active records only

### Query Optimization
- Use LIMIT clauses for pagination
- Implement query result caching
- Use prepared statements to prevent SQL injection
- Regular VACUUM operations for SQLite maintenance

### Scaling Options
- Read replicas for analytics queries
- Partitioning by date for large tables
- Archive old data to separate storage
- Consider migration to PostgreSQL for larger scale