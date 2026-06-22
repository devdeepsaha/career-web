# Potho-Prodorshok Career OS

Potho-Prodorshok is a full-stack career guidance and exam-preparation workspace for students. It combines AI-generated career roadmaps, tutor chat, MCQ practice, mock-test analytics, scholarship discovery, saved libraries, profile memory, and dashboard insights.

## Project Structure

```text
.
|-- career/           # React + Vite frontend
|-- career-backend/   # Flask + SQLAlchemy backend
|-- .github/          # Deployment workflow configuration
|-- .gitignore
`-- README.md
```

## Main Features

- Landing page with login and signup flow
- Session-based authentication with email/password and Google OAuth
- Student profile storage for education, skills, interests, goals, exams, and target institutions
- AI career roadmap generation with saved roadmap history
- AI tutor chat and doubt-solver chat with persisted chat sessions
- Tap-to-answer MCQ practice with saved attempts and saved questions
- Mock test generation, score analysis, and full review history
- Scholarship finder with saved application tracker
- Dashboard with readiness score, revision queue, timeline, weekly report, learning graph, nudges, and notifications
- Library for roadmaps, questions, mock tests, scholarships, resources, revision cards, and chats
- Dark and light mode responsive UI for mobile, tablet, desktop, and wide screens

## Frontend Setup

```bash
cd career
npm install
npm run dev
```

The frontend runs locally at:

```text
http://localhost:5173
```

Required frontend environment variable:

```env
VITE_APP_API_URL=http://localhost:5000
```

For production, point `VITE_APP_API_URL` to the deployed backend URL.

## Backend Setup

```bash
cd career-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The backend runs locally at:

```text
http://localhost:5000
```

Required backend environment variables:

```env
DATABASE_URL=
FLASK_SECRET_KEY=
GOOGLE_API_KEY=
FRONTEND_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MAIL_SERVER=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
```

## Database

The backend expects PostgreSQL/Supabase tables for:

- `user`
- `google_verified_emails`
- `chat_session`
- `chat_message`
- `sessions`
- `student_profile`
- `roadmap`
- `saved_question`
- `question_attempt`
- `mock_test`
- `saved_scholarship`

Some UI-only features currently use browser `localStorage`:

- Resource Vault
- Roadmap step progress and notes
- Study timer state

## Verification

Frontend:

```bash
cd career
npm run lint
npm run build
```

Backend:

```bash
cd career-backend
python -m py_compile app.py models.py auth.py
```

Known current warnings:

- Existing React hook dependency warnings in chat/sidebar components
- Vite chunk-size warnings due to large UI/animation/math dependencies
- Browser data freshness warning from Browserslist/Baseline packages
- Lottie dependency warning about `eval` inside `lottie-web`

## Deployment Notes

- Deploy the frontend and backend separately.
- Keep environment variables in the deployment provider, not in Git.
- Ensure the deployed backend CORS origin list includes the deployed frontend domain.
- Ensure the frontend `VITE_APP_API_URL` points to the deployed backend.
- Set `FRONTEND_URL` to the deployed frontend URL so Google OAuth redirects back to the right app.
- For Google OAuth, keep backend callback URLs and frontend redirect URLs aligned with Google Cloud Console.

## Privacy Summary

The app stores user account data and student workspace data so users can return to saved roadmaps, chats, questions, attempts, mock results, scholarships, and profile context. AI features may send user-provided prompts and generated context to the configured AI provider. See the in-app Policies page for the current privacy and terms text.

## License

MIT License.
