# YouMatter Gamification Backend

## Implementation Status & Progress

### ✅ Core Features Implemented

#### 1. Authentication System
- [x] User Registration (`POST /api/auth/register`)
- [x] User Login (`POST /api/auth/login`)
- [x] JWT-based Authentication
- [x] Protected Routes Middleware
- [x] Password Hashing with bcrypt

#### 2. Event Tracking System
- [x] Event Recording (`POST /api/events`)
- [x] Event History (`GET /api/events/history`)
- [x] Points System
- [x] Level Progression
- [x] Premium Discount Unlocks

#### 3. Challenge System
- [x] Personalized Challenges (`GET /api/challenges/personalized`)
- [x] Active Challenges (`GET /api/challenges/active`)
- [x] Challenge Progress (`POST /api/challenges/:challengeId/progress`)
- [x] AI-based Challenge Generation
- [x] Multiple Challenge Types

#### 4. Leaderboard System
- [x] Global Leaderboard (`GET /api/leaderboard`)
- [x] Period-based Rankings (weekly/monthly/all-time)
- [x] Nearby Rankings (`GET /api/leaderboard/nearby`)
- [x] User Position Tracking

#### 5. Analytics System
- [x] User Analytics (`GET /api/analytics/user/:userId`)
- [x] Platform Analytics (`GET /api/analytics/platform`)
- [x] Feature Usage Tracking
- [x] Achievement Progress

## Tech Stack & Architecture
- **Runtime:** Node.js with Express framework
- **Database:** SQLite3 with comprehensive schema
- **Authentication:** JWT tokens with bcrypt hashing
- **Testing:** Automated test suite with 15 test cases
- **Documentation:** Swagger/OpenAPI specification

## Core Features

### 1. Authentication & User Management
- Secure user registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Profile management and customization
- Session handling and token management

### 2. Event System
- Comprehensive event tracking
- Supported event types:
  ```javascript
  {
    DAILY_LOGIN: { type: 'daily_login', points: 5 },
    LOG_WORKOUT: { type: 'exercise', points: 10 },
    READ_ARTICLE: { type: 'read_article', points: 7 },
    VIEW_POLICY: { type: 'view_policy', points: 15 },
    COMPLETE_CHALLENGE: { type: 'complete_challenge', points: 50 },
    INVITE_FRIEND: { type: 'invite_friend', points: 20 },
    SHARE_ACHIEVEMENT: { type: 'share_achievement', points: 5 },
    USE_NEW_FEATURE: { type: 'use_new_feature', points: 30 },
    HEALTH_SCORE: { type: 'health_score', points: 15 },
    CHECKUP: { type: 'checkup', points: 25 }
  }
  ```
- Event metadata tracking
- Points system integration

### 3. Challenge System
- Personalized challenge generation
- Progress tracking
- Achievement system
- Reward distribution
- Multi-level challenges

### 4. Insurance Integration
#### Available Plans
1. **Basic Health Coverage**
   - Premium: $200/month
   - Coverage: Up to $100,000
   - Max Discount: 15%
   - Features: Basic medical, emergency, prescriptions, annual checkup

2. **Premium Health Plan**
   - Premium: $350/month
   - Coverage: Up to $250,000
   - Max Discount: 25%
   - Features: All basic features + specialists, mental health, preventive care

3. **Family Coverage**
   - Premium: $500/month
   - Coverage: Up to $500,000
   - Max Discount: 30%
   - Features: All premium features + maternity, dental, vision

#### Dynamic Discount System
- **Health Score Based:**
  ```
  90-100: 15% discount
  80-89:  12% discount
  70-79:  10% discount
  60-69:   7% discount
  ```
- **Activity Based:**
  ```
  180+ days exercise: 8% additional
  90+ days exercise: 5% additional
  30+ days exercise: 2% additional
  ```
- **Preventive Care:**
  ```
  Annual checkup: 3% additional
  ```

### 5. Analytics & Reporting
- User activity tracking
- Health metrics monitoring
- Insurance usage analytics
- Challenge completion rates
- Engagement metrics

## Frontend Integration Guide

### 1. Project Setup
```bash
# Install required dependencies
npm install axios @tanstack/react-query jwt-decode dayjs

# Optional but recommended UI libraries
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

### 2. API Client Setup
```javascript
// src/api/client.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add error handling interceptor
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error);
    }
);
```

### 3. Authentication Integration
```javascript
// src/api/auth.js
import { apiClient } from './client';

export const authAPI = {
    register: (userData) => 
        apiClient.post('/auth/register', userData),
    
    login: (credentials) => 
        apiClient.post('/auth/login', credentials),
    
    getProfile: () => 
        apiClient.get('/auth/profile')
};

// Usage in components
const LoginForm = () => {
    const handleLogin = async (values) => {
        try {
            const { token, user } = await authAPI.login(values);
            localStorage.setItem('token', token);
            // Handle successful login
        } catch (error) {
            // Handle login error
        }
    };
};
```

### 4. Event Recording
```javascript
// src/api/events.js
import { apiClient } from './client';

export const eventAPI = {
    recordEvent: (eventType, metadata = {}) => 
        apiClient.post('/events', { eventType, metadata }),
    
    getHistory: (params) => 
        apiClient.get('/events/history', { params })
};

// Event recording utility
export const recordUserAction = async (eventType, metadata) => {
    try {
        const result = await eventAPI.recordEvent(eventType, metadata);
        if (result.levelUp) {
            // Show level up celebration
        }
        if (result.unlockedPremiumDiscount) {
            // Show discount unlock notification
        }
        return result;
    } catch (error) {
        console.error('Failed to record event:', error);
    }
};
```

### 5. Insurance Integration
```javascript
// src/api/insurance.js
import { apiClient } from './client';

export const insuranceAPI = {
    getPlans: () => 
        apiClient.get('/insurance/plans'),
    
    getPlan: (planId) => 
        apiClient.get(`/insurance/plans/${planId}`),
    
    calculateDiscount: () => 
        apiClient.get('/insurance/calculate-discount'),
    
    enroll: (planId) => 
        apiClient.post('/insurance/enroll', { planId }),
    
    getCurrentPlan: () => 
        apiClient.get('/insurance/current')
};

// React Query integration
import { useQuery, useMutation } from '@tanstack/react-query';

export const useInsurancePlans = () => {
    return useQuery(['insurancePlans'], insuranceAPI.getPlans);
};

export const useCurrentPlan = () => {
    return useQuery(['currentPlan'], insuranceAPI.getCurrentPlan);
};

export const useEnrollMutation = () => {
    return useMutation(insuranceAPI.enroll);
};
```

### 6. Real-time Updates Integration
```javascript
// src/hooks/useEventSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useEventSocket = (onEvent) => {
    const socket = useRef();

    useEffect(() => {
        socket.current = io('http://localhost:3001', {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        socket.current.on('event', onEvent);
        
        return () => {
            socket.current.disconnect();
        };
    }, [onEvent]);

    return socket.current;
};
```

### 7. Error Handling
```javascript
// src/utils/errorHandler.js
export const handleApiError = (error) => {
    if (error.code === 'VALIDATION_ERROR') {
        return {
            type: 'validation',
            message: error.message,
            errors: error.errors
        };
    }

    if (error.code === 'UNAUTHORIZED') {
        return {
            type: 'auth',
            message: 'Please login to continue'
        };
    }

    return {
        type: 'general',
        message: error.message || 'An unexpected error occurred'
    };
};
```

### 8. Component Examples

#### Insurance Plan Card
```jsx
const InsurancePlanCard = ({ plan }) => {
    const enrollMutation = useEnrollMutation();
    const { data: discount } = useQuery(
        ['discount'],
        insuranceAPI.calculateDiscount
    );

    const handleEnroll = () => {
        enrollMutation.mutate(plan.id, {
            onSuccess: () => {
                toast({
                    title: 'Enrolled Successfully',
                    description: `You've enrolled in ${plan.name}`,
                    status: 'success'
                });
            }
        });
    };

    const discountedPremium = plan.premium * (1 - (discount || 0));

    return (
        <Card>
            <CardHeader>
                <Heading size="md">{plan.name}</Heading>
            </CardHeader>
            <CardBody>
                <VStack align="start" spacing={4}>
                    <Text>Coverage: ${plan.coverage.toLocaleString()}</Text>
                    <Text>
                        Premium: ${discountedPremium.toFixed(2)}/month
                        {discount > 0 && (
                            <Badge ml={2} colorScheme="green">
                                {(discount * 100).toFixed(0)}% off
                            </Badge>
                        )}
                    </Text>
                    <List spacing={2}>
                        {Object.entries(plan.features).map(([key, enabled]) => (
                            <ListItem key={key}>
                                <ListIcon 
                                    as={enabled ? CheckIcon : CloseIcon} 
                                    color={enabled ? 'green.500' : 'red.500'} 
                                />
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </ListItem>
                        ))}
                    </List>
                </VStack>
            </CardBody>
            <CardFooter>
                <Button
                    colorScheme="blue"
                    onClick={handleEnroll}
                    isLoading={enrollMutation.isLoading}
                >
                    Enroll Now
                </Button>
            </CardFooter>
        </Card>
    );
};
```

### 9. State Management Example
```javascript
// src/store/userStore.js
import create from 'zustand';

export const useUserStore = create((set) => ({
    user: null,
    insurancePlan: null,
    healthScore: 0,
    discount: 0,
    
    setUser: (user) => set({ user }),
    setInsurancePlan: (plan) => set({ insurancePlan: plan }),
    updateHealthScore: (score) => set({ healthScore: score }),
    updateDiscount: (discount) => set({ discount }),
    
    reset: () => set({
        user: null,
        insurancePlan: null,
        healthScore: 0,
        discount: 0
    })
}));
```

## Testing

### Unit Tests
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test
```

### E2E Tests
```bash
# Install Cypress
npm install --save-dev cypress

# Run Cypress tests
npm run cypress:open
```

## Security Best Practices

1. **Token Management**
   - Store JWT in httpOnly cookies
   - Implement token refresh mechanism
   - Clear tokens on logout

2. **API Security**
   - Use HTTPS in production
   - Implement rate limiting
   - Validate all inputs
   - Sanitize responses

3. **Error Handling**
   - Never expose internal errors
   - Log errors securely
   - Provide user-friendly messages

## API Documentation

### Authentication Routes

#### POST /api/auth/register
Register a new user account.
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt_token",
      "user": {
        "id": "string",
        "username": "string",
        "email": "string",
        "createdAt": "timestamp"
      }
    }
  }
  ```

#### POST /api/auth/login
Login to existing account.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** Same as register

### Event Routes

#### POST /api/events
Record a new event.
- **Auth:** Required
- **Request Body:**
  ```json
  {
    "eventType": "string",
    "metadata": {
      "key": "value"
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "event": {
        "id": "string",
        "userId": "string",
        "eventType": "string",
        "metadata": "object",
        "timestamp": "date"
      }
    }
  }
  ```

#### GET /api/events/history
Get user's event history.
- **Auth:** Required
- **Query Parameters:**
  - `limit`: number (optional)
  - `offset`: number (optional)
  - `type`: string (optional)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "events": [
        {
          "id": "string",
          "eventType": "string",
          "metadata": "object",
          "timestamp": "date"
        }
      ],
      "total": "number"
    }
  }
  ```

### Challenge Routes

#### GET /api/challenges/personalized
Get personalized challenge for user.
- **Auth:** Required
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "challenge": {
        "id": "string",
        "title": "string",
        "description": "string",
        "type": "string",
        "difficulty": "number",
        "reward": "object",
        "progress": "number",
        "target": "number",
        "deadline": "date"
      }
    }
  }
  ```

#### GET /api/challenges/active
Get all active challenges.
- **Auth:** Required
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "challenges": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "type": "string",
          "difficulty": "number",
          "reward": "object",
          "progress": "number",
          "target": "number",
          "deadline": "date"
        }
      ]
    }
  }
  ```

#### POST /api/challenges/:challengeId/progress
Update challenge progress.
- **Auth:** Required
- **URL Parameters:**
  - `challengeId`: string
- **Request Body:**
  ```json
  {
    "increment": "number"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "progress": "number",
      "completed": "boolean",
      "reward": "object"
    }
  }
  ```

### Leaderboard Routes

#### GET /api/leaderboard/global
Get global leaderboard.
- **Auth:** Required
- **Query Parameters:**
  - `limit`: number (optional)
  - `offset`: number (optional)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "leaderboard": [
        {
          "userId": "string",
          "username": "string",
          "score": "number",
          "rank": "number"
        }
      ],
      "total": "number"
    }
  }
  ```

#### GET /api/leaderboard/nearby
Get nearby rankings.
- **Auth:** Required
- **Query Parameters:**
  - `range`: number (optional, default: 5)
- **Response:** Same as global leaderboard

### Analytics Routes

#### GET /api/analytics/user
Get user-specific analytics.
- **Auth:** Required
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "totalEvents": "number",
        "challengesCompleted": "number",
        "currentStreak": "number",
        "bestStreak": "number",
        "achievements": [
          {
            "id": "string",
            "title": "string",
            "progress": "number"
          }
        ]
      }
    }
  }
  ```

#### GET /api/analytics/platform
Get platform-wide analytics.
- **Auth:** Required (Admin only)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "totalUsers": "number",
        "activeUsers": "number",
        "totalEvents": "number",
        "popularChallenges": [
          {
            "id": "string",
            "title": "string",
            "completions": "number"
          }
        ]
      }
    }
  }
  ```

### Error Responses
All routes may return the following error responses:

#### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "string"
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## Insurance Plans & Performance Benefits

### Available Insurance Plans

#### 1. Basic Health Coverage
- **Premium:** $200/month
- **Coverage:** Up to $100,000
- **Features:**
  - Basic medical coverage
  - Emergency services
  - Prescription drugs
  - Annual health checkup
- **Performance Discount:** Up to 15% based on health score

#### 2. Premium Health Plan
- **Premium:** $350/month
- **Coverage:** Up to $250,000
- **Features:**
  - Everything in Basic plan
  - Specialist consultations
  - Mental health coverage
  - Preventive care
  - Wellness programs
- **Performance Discount:** Up to 25% based on health score

#### 3. Family Coverage
- **Premium:** $500/month
- **Coverage:** Up to $500,000
- **Features:**
  - Coverage for spouse and children
  - Maternity benefits
  - Dental and vision
  - Regular family checkups
- **Performance Discount:** Up to 30% based on family health score

### Performance-Based Discounts

#### 1. Health Score Discounts
| Health Score | Basic Plan | Premium Plan | Family Plan |
|--------------|------------|--------------|-------------|
| 90-100       | 15%        | 25%         | 30%         |
| 80-89        | 12%        | 20%         | 25%         |
| 70-79        | 10%        | 15%         | 20%         |
| 60-69        | 7%         | 10%         | 15%         |
| Below 60     | 0%         | 0%          | 0%          |

#### 2. Activity-Based Benefits
1. **Daily Exercise Tracking**
   - 30+ days streak: Additional 2% discount
   - 90+ days streak: Additional 5% discount
   - 180+ days streak: Additional 8% discount

2. **Preventive Health Checkups**
   - Regular checkup completion: 3% discount
   - Annual wellness assessment: 5% discount
   - Vaccination schedule maintenance: 2% discount

3. **Healthy Lifestyle Rewards**
   - Maintaining BMI in healthy range: 3% discount
   - Non-smoking status: 5% discount
   - Regular mental health check-ins: 2% discount

#### 3. Challenge Completion Benefits
1. **Monthly Health Challenges**
   - Bronze completion: $20 premium reduction
   - Silver completion: $35 premium reduction
   - Gold completion: $50 premium reduction

2. **Quarterly Wellness Programs**
   - Program completion: Up to 10% additional discount
   - Perfect attendance: $100 wellness bonus
   - Group challenge winner: Extra 5% discount

### Special Discount Programs

#### 1. Family Wellness Program
- **Family Activity Tracking**
  - 50% family participation: 5% extra discount
  - 100% family participation: 10% extra discount
  - Family challenge winners: Additional $200 annual discount

#### 2. Preventive Care Incentives
- **Annual Health Screening:** $150 premium reduction
- **Dental Checkups:** $50 reduction per visit (max 2/year)
- **Vision Care:** $100 reduction for annual eye exam

#### 3. Chronic Condition Management
- **Diabetes Management:** Up to 15% additional discount
- **Hypertension Control:** Up to 12% additional discount
- **Weight Management:** Up to 10% additional discount

### How to Claim Discounts

1. **Automatic Discounts**
   - Health score discounts applied automatically monthly
   - Activity streaks calculated and applied automatically
   - Challenge completion rewards credited next billing cycle

2. **Manual Claims**
   - Submit preventive care documentation through portal
   - Upload medical records for chronic condition management
   - Family program enrollment through customer service

3. **Verification Process**
   - Health metrics verified through connected devices
   - Medical records verified within 48 hours
   - Challenge completions validated automatically

### Discount Stacking Rules

1. **Maximum Combined Discount**
   - Basic Plan: Up to 30% total discount
   - Premium Plan: Up to 40% total discount
   - Family Plan: Up to 50% total discount

2. **Priority Order**
   - Base health score discount applied first
   - Activity-based discounts second
   - Special program discounts last

3. **Annual Caps**
   - Maximum annual discount: $2,500 for Basic
   - Maximum annual discount: $5,000 for Premium
   - Maximum annual discount: $7,500 for Family

### Terms and Conditions
- Discounts subject to annual review
- Must maintain minimum health score for continued discounts
- Fraudulent activities will result in program termination
- Company reserves right to modify discount structure
- 90-day waiting period for new enrollees

## Frontend Integration Guide

### 1. Authentication Integration

```javascript
// api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const authAPI = {
    // Registration
    register: async (username, email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                username,
                email,
                password
            });
            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                return response.data.data;
            }
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Login
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });
            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                return response.data.data;
            }
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

// Setup axios interceptor for authentication
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
```

### 2. Event System Integration

```javascript
// api/events.js
export const eventAPI = {
    // Record an event
    recordEvent: async (eventType, metadata = {}) => {
        try {
            const response = await axios.post(`${API_URL}/events`, {
                eventType,
                metadata
            });
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get event history
    getHistory: async () => {
        try {
            const response = await axios.get(`${API_URL}/events/history`);
            return response.data.data.events;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

// Event Types Constants
export const EVENT_TYPES = {
    DAILY_LOGIN: 'daily_login',
    LOG_WORKOUT: 'log_workout',
    READ_ARTICLE: 'read_article',
    VIEW_POLICY: 'view_policy',
    COMPLETE_CHALLENGE: 'complete_challenge',
    INVITE_FRIEND: 'invite_friend',
    SHARE_ACHIEVEMENT: 'share_achievement',
    USE_NEW_FEATURE: 'use_new_feature'
};
```

### 3. Challenge System Integration

```javascript
// api/challenges.js
export const challengeAPI = {
    // Get personalized challenge
    getPersonalized: async () => {
        try {
            const response = await axios.get(`${API_URL}/challenges/personalized`);
            return response.data.data.challenge;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get active challenges
    getActive: async () => {
        try {
            const response = await axios.get(`${API_URL}/challenges/active`);
            return response.data.data.challenges;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update challenge progress
    updateProgress: async (challengeId, increment = 1) => {
        try {
            const response = await axios.post(
                `${API_URL}/challenges/${challengeId}/progress`,
                { increment }
            );
            return response.data.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
```

### 4. React Context Setup

```javascript
// contexts/GameContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { eventAPI, challengeAPI, leaderboardAPI, analyticsAPI } from '../api';

const GameContext = createContext();

const initialState = {
    user: null,
    events: [],
    challenges: [],
    leaderboard: [],
    analytics: null,
    loading: false,
    error: null
};

function gameReducer(state, action) {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'SET_EVENTS':
            return { ...state, events: action.payload };
        case 'SET_CHALLENGES':
            return { ...state, challenges: action.payload };
        case 'SET_LEADERBOARD':
            return { ...state, leaderboard: action.payload };
        case 'SET_ANALYTICS':
            return { ...state, analytics: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
}

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    const loadData = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const [events, challenges, leaderboard] = await Promise.all([
                eventAPI.getHistory(),
                challengeAPI.getActive(),
                leaderboardAPI.getGlobal()
            ]);

            dispatch({ type: 'SET_EVENTS', payload: events });
            dispatch({ type: 'SET_CHALLENGES', payload: challenges });
            dispatch({ type: 'SET_LEADERBOARD', payload: leaderboard });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    useEffect(() => {
        if (state.user) {
            loadData();
        }
    }, [state.user]);

    return (
        <GameContext.Provider value={{ state, dispatch, loadData }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
```

### 5. Error Handling

```javascript
// utils/errorHandling.js
export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error
        const { status, data } = error.response;
        switch (status) {
            case 401:
                // Clear token and redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
                break;
            case 403:
                // Handle forbidden access
                break;
            case 404:
                // Handle not found
                break;
            default:
                // Handle other errors
                console.error('API Error:', data);
        }
        return data.message || 'An error occurred';
    } else if (error.request) {
        // Request made but no response
        return 'Network error. Please check your connection.';
    } else {
        // Other errors
        return error.message;
    }
};
```

## Testing & Quality Assurance

### API Test Coverage
All endpoints have been tested with the following scenarios:
1. Authentication flow (register/login)
2. Event recording and history
3. Challenge generation and progress
4. Leaderboard functionality
5. Analytics data retrieval

### Performance Considerations
1. **Caching:** Implement client-side caching for:
   - User profile data
   - Leaderboard (with 5-minute refresh)
   - Challenge data (with 1-minute refresh)

2. **Optimistic Updates:**
```javascript
const handleAction = async (eventType, metadata) => {
    // Optimistically update UI
    dispatch({ type: 'ADD_EVENT', payload: { eventType, metadata } });
    
    try {
        await eventAPI.recordEvent(eventType, metadata);
    } catch (error) {
        // Revert optimistic update
        dispatch({ type: 'REMOVE_EVENT', payload: { eventType, metadata } });
        handleApiError(error);
    }
};
```

## Next Steps & Roadmap

### Phase 1 (Completed)
- [x] Core API implementation
- [x] Authentication system
- [x] Event tracking
- [x] Challenge system
- [x] Leaderboard
- [x] Analytics

### Phase 2 (In Progress)
- [ ] Real-time notifications
- [ ] Social features expansion
- [ ] Advanced analytics dashboard
- [ ] Achievement animations

### Phase 3 (Planned)
- [ ] Mobile app integration
- [ ] Offline support
- [ ] AI-powered recommendations
- [ ] Advanced gamification features

## Support & Documentation

For detailed API documentation, run:
```bash
npm run docs
```

For any issues or questions:
1. Check the error handling guide above
2. Review the API documentation
3. Run the test suite: `npm test`
4. Contact the backend team for support
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