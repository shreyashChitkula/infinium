# YouMatter Gamification - API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://api.youmatter.com/api
```

## Authentication
Most endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": true|false,
  "data": {},
  "message": "string",
  "errors": []
}
```

## Endpoints

### Authentication
#### POST /auth/login
Login user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "uuid-string",
    "expiresIn": 3600
  }
}
```

### User Profile
#### GET /users/{userId}/profile
Get complete user profile with gamification data.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "currentPoints": 150,
    "level": 2,
    "levelProgress": 75.5,
    "badges": ["Beginner", "Explorer"],
    "streak": 5,
    "unlockedPremiumDiscount": true,
    "discountPercentage": 10,
    "joinDate": "2023-01-15T10:30:00Z",
    "lastActive": "2023-10-02T14:20:00Z",
    "totalWorkouts": 12,
    "totalArticlesRead": 8,
    "totalPoliciesViewed": 3,
    "achievements": [
      {
        "id": "uuid",
        "name": "First Steps",
        "description": "Completed first workout",
        "earnedAt": "2023-01-16T09:00:00Z"
      }
    ]
  }
}
```

### Events (Core Gamification)
#### POST /events
Record user action and award points.

**Request:**
```json
{
  "userId": "uuid",
  "eventType": "log_workout",
  "metadata": {
    "workoutType": "cardio",
    "duration": 30,
    "difficulty": "medium"
  },
  "timestamp": "2023-10-02T15:30:00Z"
}
```

**Event Types:**
- `daily_login` - 5 points
- `log_workout` - 10 points  
- `read_article` - 7 points
- `view_policy` - 15 points
- `complete_challenge` - 50 points
- `invite_friend` - 20 points
- `share_achievement` - 5 points
- `use_new_feature` - 30 points

**Response:**
```json
{
  "success": true,
  "data": {
    "pointsAwarded": 10,
    "totalPoints": 160,
    "levelUp": false,
    "newLevel": 2,
    "oldLevel": 2,
    "unlockedPremiumDiscount": true,
    "discountPercentage": 10,
    "challengeCompleted": null,
    "message": "Great workout! Your body will thank you! 💪"
  }
}
```

### Challenges
#### GET /users/{userId}/challenges
Get user's challenges categorized by status.

**Response:**
```json
{
  "success": true,
  "data": {
    "active": [
      {
        "challengeId": "uuid",
        "title": "Fitness Kick-start",
        "description": "Complete 3 workouts this week to build momentum!",
        "targetValue": 3,
        "currentProgress": 1,
        "progressPercentage": 33.33,
        "status": "active",
        "rewardPoints": 50,
        "category": "health",
        "difficulty": "easy",
        "startDate": "2023-10-01T00:00:00Z",
        "endDate": "2023-10-08T00:00:00Z",
        "tips": [
          "Start with short 20-minute sessions",
          "Try different workout types to stay engaged"
        ]
      }
    ],
    "completed": [],
    "available": []
  }
}
```

#### GET /users/{userId}/challenges/personalized
Get AI-generated personalized challenge for user.

**Response:**
```json
{
  "success": true,
  "data": {
    "challengeId": "uuid",
    "title": "Knowledge Seeker",
    "description": "Read 5 wellness articles to expand your knowledge!",
    "targetValue": 5,
    "currentProgress": 0,
    "progressPercentage": 0,
    "status": "available",
    "rewardPoints": 75,
    "category": "wellness",
    "difficulty": "medium",
    "startDate": null,
    "endDate": null,
    "tips": [
      "Focus on topics you're curious about",
      "Take notes to retain information better"
    ]
  }
}
```

### Leaderboard
#### GET /leaderboard
Get ranked list of top users.

**Query Parameters:**
- `period`: `alltime` | `monthly` | `weekly` (default: `alltime`)
- `limit`: number (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "uuid",
        "username": "alice123",
        "points": 850,
        "level": 4,
        "avatar": "https://example.com/avatar.jpg",
        "isCurrentUser": false
      }
    ],
    "period": "alltime",
    "totalUsers": 1250
  }
}
```

#### GET /leaderboard/user/{userId}
Get specific user's ranking.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "rank": 47,
    "points": 245
  }
}
```

### Content
#### GET /content/articles
Get wellness articles.

**Query Parameters:**
- `category`: `health` | `wellness` | `insurance`
- `featured`: `true` | `false`

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "uuid",
        "title": "10 Tips for Better Sleep",
        "summary": "Discover science-backed methods to improve your sleep quality...",
        "category": "wellness",
        "readTime": 5,
        "pointsReward": 7,
        "imageUrl": "https://example.com/sleep.jpg",
        "featured": true
      }
    ]
  }
}
```

#### GET /insurance/policies
Get available insurance policies.

**Response:**
```json
{
  "success": true,
  "data": {
    "policies": [
      {
        "id": "uuid",
        "name": "Health Shield Plus",
        "type": "Health Insurance",
        "description": "Comprehensive health coverage with wellness benefits...",
        "benefits": [
          "Annual health check-up",
          "Preventive care coverage",
          "Wellness program discounts"
        ],
        "pointsForViewing": 15,
        "isNew": false
      }
    ]
  }
}
```

### Social Features
#### POST /social/invite
Invite friend via email.

**Request:**
```json
{
  "email": "friend@example.com",
  "message": "Join me on YouMatter for better wellness!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inviteId": "uuid",
    "pointsAwarded": 20
  }
}
```

### Analytics
#### GET /users/{userId}/analytics
Get user analytics and insights.

**Response:**
```json
{
  "success": true,
  "data": {
    "weeklyProgress": {
      "pointsEarned": 85,
      "activeDays": 5,
      "topCategory": "health"
    },
    "monthlyTrends": {
      "totalPoints": 340,
      "averageDaily": 11.3,
      "streakRecord": 12
    },
    "featureUsage": {
      "workouts": 8,
      "articles": 5,
      "policies": 2
    },
    "recommendations": [
      "Try reading more wellness articles to earn bonus points",
      "You're close to a 7-day streak - keep it up!"
    ]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input parameters |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limits
- 100 requests per 15-minute window per IP
- 1000 requests per hour per authenticated user

## Webhooks (Future)
Register webhooks to receive real-time notifications:
- User level up
- Challenge completion
- Achievement unlock
- Premium discount activation