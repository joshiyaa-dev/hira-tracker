# Frontend Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── pages/          # 10 screen components
│   ├── components/     # Reusable UI components
│   ├── store/          # Zustand state management
│   ├── services/       # API client
│   ├── types/          # TypeScript definitions
│   ├── hooks/          # Custom React hooks
│   ├── styles/         # Global styles & Tailwind
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎨 Screens Implemented

1. **SplashScreen** - Animated logo & loading
2. **LoginScreen** - Phone OTP & Google auth
3. **OnboardingScreen** - 5-step user profiling
4. **Dashboard** - Main home screen
5. **WorkoutScreen** - Daily workout plan
6. **FoodScreen** - Nutrition & food logging
7. **ProgressScreen** - Stats & analytics
8. **SmartwatchScreen** - Device integration
9. **SettingsScreen** - Preferences & details

## 🔗 API Integration

Update `.env` file to point to backend:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 Responsive Design

- Mobile-first approach
- Optimized for all screen sizes
- Dark mode support
- Touch-friendly UI

## 🛠️ Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool (fast!)
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router** - Navigation

## 🚨 Troubleshooting

### Port already in use
```bash
npm run dev -- --port 3000
```

### Dependencies issue
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Environment Variables

Create `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=HIRA
```

## 📖 Further Reading

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://docs.pmnd.rs)
- [Vite Docs](https://vitejs.dev)
