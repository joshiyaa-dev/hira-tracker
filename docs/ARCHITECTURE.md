# HIRA Architecture & Deployment Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Devices (Mobile/Web)                │
└───────────────┬──────────────────────────────────────────────┘
                │
        ┌───────▼────────┐
        │   Frontend     │
        │ React + Vite   │
        │  Port: 5173    │
        └───────┬────────┘
                │
        ┌───────▼──────────────┐
        │   Backend API        │
        │  Express + Node.js   │
        │   Port: 5000         │
        └─────┬────────────────┘
              │
     ┌────────┼────────────┐
     │                     │
┌────▼─────┐        ┌─────▼──────┐
│ MongoDB  │        │  AI Engine  │
│Database  │        │  FastAPI    │
│          │        │ Port: 8000  │
└──────────┘        └─────┬───────┘
                          │
                    ┌─────▼──────────┐
                    │ Datasets       │
                    │ Workouts/Foods │
                    └────────────────┘
```

## 🔄 Data Flow

1. **User Login**
   - Frontend → Backend (Phone OTP)
   - Backend handles authentication
   - JWT token issued

2. **Onboarding**
   - Frontend collects user data
   - Backend saves to MongoDB
   - User profile created

3. **Workout Generation**
   - Frontend requests workout
   - Backend sends to AI Engine
   - AI Engine generates based on:
     - User profile
     - Current readiness
     - Historical data
   - Response sent back to frontend

4. **Meal Suggestions**
   - Similar flow to workouts
   - Uses food dataset
   - Returns Indian food suggestions

5. **Readiness Scoring**
   - User submits daily check-in
   - Backend calculates score
   - Affects intensity recommendations

## 📊 Database Schema

### Collections Overview

**Users**
- Authentication & profile
- Indexed: phone number
- Stores preferences & settings

**Workouts**
- Daily workout plans
- Exercise logs
- Progress tracking
- Indexed: userId, date

**FoodLogs**
- Food consumption history
- Daily nutrition tracking
- Indexed: userId, date

**HealthCheckIns**
- Daily energy, sleep, stress, soreness
- Used for readiness calculation
- Indexed: userId, date

## 🚀 Deployment

### Local Development (All-in-One Setup)

1. **Terminal 1 - Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Visit http://localhost:5173
   ```

2. **Terminal 2 - Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   # Server: http://localhost:5000
   ```

3. **Terminal 3 - AI Engine**
   ```bash
   cd ai-engine
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   python app.py
   # Server: http://localhost:8000
   ```

4. **Terminal 4 - MongoDB**
   ```bash
   mongod
   # Listens on mongodb://localhost:27017
   ```

### Docker Deployment

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/hira
      NODE_ENV: production
    depends_on:
      - mongodb

  ai-engine:
    build: ./ai-engine
    ports:
      - "8000:8000"
    environment:
      BACKEND_URL: http://backend:5000

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:5000/api

volumes:
  mongodb_data:
```

**Run all services:**
```bash
docker-compose up
```

### Cloud Deployment (AWS/Heroku)

#### Heroku Deployment

1. **Frontend (Netlify)**
   ```bash
   npm install -g gh-pages
   npm run build
   # Deploy dist/ to Netlify
   ```

2. **Backend (Heroku)**
   ```bash
   heroku create hira-backend
   heroku config:set MONGODB_URI=your_mongodb_atlas_url
   git push heroku main
   ```

3. **AI Engine (Heroku)**
   ```bash
   heroku create hira-ai-engine
   git push heroku main
   ```

## 🔐 Security Checklist

- [ ] JWT secret configured
- [ ] CORS settings appropriate
- [ ] Environment variables not committed
- [ ] Phone OTP verification working
- [ ] Password hashing (if applicable)
- [ ] HTTPS enabled in production
- [ ] Database backups established
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info

## 📈 Performance Considerations

1. **Frontend**
   - Code splitting with Vite
   - Lazy loading of routes
   - Image optimization
   - Caching strategies

2. **Backend**
   - Database indexing (userId, date)
   - Query optimization
   - Connection pooling
   - Response caching

3. **AI Engine**
   - Model caching
   - Async processing
   - Dataset preloading
   - Batch operations

## 🔍 Monitoring & Logging

### Logging
```javascript
// Backend: Use Winston or Morgan
import morgan from 'morgan';
app.use(morgan('combined'));
```

### Error Tracking
```bash
# Add Sentry for error monitoring
npm install @sentry/node
```

### Performance Monitoring
```bash
# Use tools like Prometheus + Grafana
```

## 📱 API Rate Limiting

Add to backend:
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 🔄 Continuous Integration (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd frontend && npm ci && npm run build
      - run: npm run deploy

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm ci && npm run build

  ai-engine:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - run: cd ai-engine && pip install -r requirements.txt
```

## 📊 Key Metrics

Monitor these metrics:
- **API Response Time**: Target < 200ms
- **Database Query Time**: Target < 100ms
- **AI Generation Time**: Target < 5s
- **Error Rate**: Target < 0.1%
- **Uptime**: Target 99.9%

## 🆘 Troubleshooting

### Cannot connect to backend
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check CORS settings
# Backend should allow frontend origin
```

### AI engine not responding
```bash
# Check if Python server running
curl http://localhost:8000/health

# Check file permissions for datasets
ls -la ai-engine/data/
```

### Database connection failed
```bash
# Verify MongoDB is running
mongosh

# Check connection string
echo $MONGODB_URI
```

## 📝 Production Checklist

- [ ] Environment variables configured
- [ ] Database backups automated
- [ ] Error monitoring setup
- [ ] Performance monitoring active
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] API documentation complete
- [ ] User documentation ready
- [ ] Support channels established
- [ ] Rollback procedure documented

## 🎯 Next Steps

1. **Phase 1 (MVP)**
   - Core CRUD operations
   - Basic AI recommendations
   - User authentication

2. **Phase 2**
   - Smartwatch integration
   - Advanced ML models
   - Community features

3. **Phase 3**
   - Mobile native apps
   - Wearable integration
   - Social features

## 📞 Support

For deployment issues:
- Check logs: `npm run logs` / `docker logs`
- Review environment variables
- Verify database connection
- Check network connectivity
- Review error messages

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** Production Ready
