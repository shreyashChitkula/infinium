# YouMatter Backend API Documentation

## Overview
This is the backend API for the YouMatter gamification platform. It provides endpoints for user authentication, event tracking, and gamification features.

## Tech Stack
- Node.js
- Express.js
- SQLite3
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
cd backend
npm install

# Start the server
npm start
```

The server will start on `http://localhost:3001` by default.

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
```

Request Body:
```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```

Response (201):
```json
{
    "success": true,
    "data": {
        "token": "jwt-token",
        "user": {
            "id": "uuid",
            "username": "string",
            "email": "string"
        }
    }
}
```

#### Login User
```http
POST /api/auth/login
```

Request Body:
```json
{
    "email": "string",
    "password": "string"
}
```

Response (200):
```json
{
    "success": true,
    "data": {
        "token": "jwt-token",
        "user": {
            "id": "uuid",
            "username": "string",
            "email": "string",
            "points": number,
            "level": number
        }
    }
}
```

### Event Endpoints

All event endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

#### Record Event
```http
POST /api/events
```

Request Body:
```json
{
    "eventType": "string",
    "metadata": {} // optional
}
```

Available Event Types:
- LOG_WORKOUT
- READ_ARTICLE
- VIEW_POLICY
- DAILY_LOGIN
- COMPLETE_CHALLENGE
- INVITE_FRIEND
- SHARE_ACHIEVEMENT
- USE_NEW_FEATURE

Response (200):
```json
{
    "success": true,
    "data": {
        "event": {
            "id": "uuid",
            "eventType": "string",
            "pointsAwarded": number,
            "timestamp": "ISO-date"
        },
        "pointsAwarded": number,
        "totalPoints": number,
        "levelUp": boolean,
        "newLevel": number,
        "unlockedPremiumDiscount": boolean,
        "discountPercentage": number,
        "message": "string"
    }
}
```

#### Get Event History
```http
GET /api/events/history
```

Response (200):
```json
{
    "success": true,
    "data": {
        "events": [
            {
                "id": "uuid",
                "eventType": "string",
                "pointsAwarded": number,
                "metadata": {},
                "timestamp": "ISO-date"
            }
        ]
    }
}
```

### Points System

Points are awarded for different actions:
- Daily Login: 5 points
- Log Workout: 10 points
- Read Article: 7 points
- View Policy: 15 points
- Complete Challenge: 50 points
- Invite Friend: 20 points
- Share Achievement: 5 points
- Use New Feature: 30 points

### Level System

Levels are calculated based on total points:
- Level 1: 0-99 points
- Level 2: 100-299 points
- Level 3: 300-599 points
- Level 4: 600-999 points
- Level 5: 1000+ points

Premium features unlock at Level 3, including:
- Premium discount (10%)
- Advanced challenges
- Exclusive content

### Error Responses

#### 400 Bad Request
```json
{
    "success": false,
    "message": "Validation error",
    "errors": ["Array of error messages"]
}
```

#### 401 Unauthorized
```json
{
    "success": false,
    "message": "No authentication token provided",
    "errors": ["Authentication required"]
}
```

#### 500 Server Error
```json
{
    "success": false,
    "message": "Internal server error",
    "errors": ["Error details"]
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    last_streak_date TEXT,
    badges TEXT DEFAULT '[]',
    unlocked_premium_discount BOOLEAN DEFAULT 0,
    discount_percentage INTEGER DEFAULT 0,
    avatar_url TEXT,
    preferences TEXT DEFAULT '{}',
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Events Table
```sql
CREATE TABLE events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    points_awarded INTEGER NOT NULL,
    metadata TEXT DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

## Testing

The backend includes a comprehensive test suite. Run the tests using:
```bash
npm test
```

This will execute tests for:
- User registration
- User login
- Authentication
- Event recording
- Event history
- Error handling
- Authorization checks

## Frontend Integration Tips

1. Store the JWT token securely (e.g., in localStorage)
2. Include the token in all API requests:
```javascript
const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};
```

3. Handle token expiration:
- If you receive a 401 response, redirect to login
- Consider implementing token refresh logic

4. Implement real-time point/level updates:
- Update UI after each successful event recording
- Show animations for point gains
- Display level-up notifications

5. Error handling:
- Show user-friendly error messages
- Implement retry logic for failed requests
- Handle offline scenarios

## Environment Variables

Create a `.env` file in the root directory:
```
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Development Notes

- The server uses SQLite for simplicity, but can be easily migrated to PostgreSQL or MySQL
- All routes are rate-limited to prevent abuse
- Passwords are hashed using bcrypt with salt rounds of 10
- JWTs expire after 24 hours