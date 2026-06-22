# Potho-Prodorshok Frontend

React + Vite frontend for the Potho-Prodorshok Career OS.

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- i18next
- lucide-react
- Chart.js
- KaTeX
- Lottie
- Three.js

## Setup

```bash
npm install
npm run dev
```

Local URL:

```text
http://localhost:5173
```

## Environment

Create `career/.env` locally:

```env
VITE_APP_API_URL=http://localhost:5000
```

For production, set this to the deployed Flask backend URL.

## Scripts

```bash
npm run dev      # Start Vite dev server
npm run lint     # Run ESLint
npm run build    # Build production bundle
npm run preview  # Preview production build
```

## Main Areas

- `src/App.jsx` handles auth gating, shell navigation, command menu, theme, and route-like tab rendering.
- `src/pages/LandingPage` contains the public landing page.
- `src/pages/DashboardPage` contains the logged-in dashboard.
- `src/pages/CareerPlannerPage` handles roadmap generation, saved roadmaps, and roadmap step progress.
- `src/pages/AITutorPage` handles MCQ practice, adaptive questions, mock tests, and performance review.
- `src/pages/ScholarshipFinderPage` handles scholarship discovery and saving.
- `src/pages/LibraryPage` contains saved roadmaps, questions, mocks, scholarships, resources, revision cards, and chats.
- `src/pages/ProfilePage` manages student profile data.
- `src/components/chat` contains the floating career and doubt chat widgets.

## UI Notes

- The app supports light and dark mode through the root `light`/`dark` class.
- Keep interactive controls at least 40px in hit area.
- Use lucide icons for product controls.
- Avoid emoji in the interface.
- Preserve mobile, tablet, desktop, and wide-screen responsiveness.

## Verification

```bash
npm run lint
npm run build
```

Current expected warnings:

- Existing hook dependency warnings in chat/sidebar components
- Vite chunk-size warnings
- Browser data freshness warnings
- Lottie `eval` warning from the dependency
