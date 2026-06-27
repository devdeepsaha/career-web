# ------------------- Imports -------------------
from flask import Flask, request, jsonify, session, redirect
from flask_cors import CORS
import google.generativeai as genai
import json, os
from dotenv import load_dotenv
from collections import deque
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db, login_manager
from flask_mail import Mail, Message
import secrets
import threading
from datetime import datetime, timedelta
import re
import random

# ------------------- Load Env -------------------
load_dotenv()

# ------------------- Flask App -------------------
app = Flask(__name__)

# CRITICAL: Secret key must be set first
app.secret_key = os.getenv("FLASK_SECRET_KEY")
if not app.secret_key:
    raise ValueError("FLASK_SECRET_KEY missing")

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
}

# Initialize database FIRST
db.init_app(app)

# Session Configuration - Use default Flask sessions
print("Using default Flask sessions")
app.config['SESSION_COOKIE_NAME'] = 'pothoprodorshok_session'
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)

# OAuth-specific settings
app.config['OAUTHLIB_RELAX_TOKEN_SCOPE'] = True
app.config['OAUTHLIB_INSECURE_TRANSPORT'] = os.getenv("FLASK_ENV") != "production"

# Mail Configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False') == 'True'

mail = Mail(app)

# Initialize login manager
login_manager.init_app(app)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://pothoprodorshok.onrender.com",
    "https://pothoprodorshok.mooo.com",
]
extra_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "").split(",") if origin.strip()]
ALLOWED_ORIGINS = list(dict.fromkeys(ALLOWED_ORIGINS + extra_origins))

# CORS Configuration - MUST be before blueprint registration
CORS(app,
    supports_credentials=True, 
    origins=ALLOWED_ORIGINS,
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Set-Cookie"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)

# Register blueprints
from auth import auth_bp, google_bp
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(google_bp, url_prefix="/auth/google")

# CRITICAL: Force Flask-Dance to use session-based storage
from flask_dance.consumer.storage.session import SessionStorage
google_bp.storage = SessionStorage()

# Import models
from models import (
    User,
    ChatSession,
    ChatMessage,
    StudentProfile,
    Roadmap,
    SavedQuestion,
    QuestionAttempt,
    MockTest,
    SavedScholarship,
)

# Create all tables
with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Basic public AI rate limiting. This protects API quota; persistent per-user limits can be added later.
RATE_LIMIT_WINDOW_SECONDS = 600
PUBLIC_AI_LIMIT = 45
public_ai_hits = {}
PUBLIC_AI_ENDPOINTS = {
    "landing_ai",
    "get_question",
    "generate_mock_test",
    "find_scholarships",
    "generate_roadmap",
    "chat",
    "solve_doubt",
    "solve_doubt_chat",
    "analyze_performance",
}

def client_ip():
    forwarded = request.headers.get("X-Forwarded-For", "")
    return forwarded.split(",")[0].strip() or request.remote_addr or "unknown"

def public_ai_rate_limited():
    now = datetime.utcnow()
    key = client_ip()
    hits = public_ai_hits.setdefault(key, deque())
    while hits and (now - hits[0]).total_seconds() > RATE_LIMIT_WINDOW_SECONDS:
        hits.popleft()
    if len(hits) >= PUBLIC_AI_LIMIT:
        return True
    hits.append(now)
    return False

# Make sessions permanent
@app.before_request
def make_session_permanent():
    session.permanent = True
    if request.method == "OPTIONS":
        return None

    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        origin = request.headers.get("Origin")
        if origin and origin not in ALLOWED_ORIGINS:
            return jsonify({"error": "Origin not allowed"}), 403

    if request.endpoint in PUBLIC_AI_ENDPOINTS and public_ai_rate_limited():
        return jsonify({"error": "Too many requests. Please wait a moment and try again."}), 429
    return None

# ------------------- Routes -------------------

@app.route('/')
def home():
    return jsonify({"message": "Server is running!"}), 200

@app.route('/logout-google')
def logout_google():
    session.pop("google_oauth_token", None)
    return "Google token cleared"

# ------------------- History -------------------
HISTORY_FILE = 'question_history.json'
HISTORY_LENGTH = 40

def read_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, 'r') as f:
            content = f.read()
            if not content: return []
            return json.loads(content)
    except:
        return []

def write_history(new_question):
    history = read_history()
    dq = deque(history, maxlen=HISTORY_LENGTH)
    dq.append(new_question)
    try:
        with open(HISTORY_FILE, 'w') as f:
            json.dump(list(dq), f)
    except Exception as e:
        print("History write error:", e)

# ------------------- Configure Gemini -------------------
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY missing")

genai.configure(api_key=api_key)
generation_config = {"temperature": 0.7, "max_output_tokens": 4096}
MODEL = "models/gemini-3.1-flash-lite-preview"
model = genai.GenerativeModel(model_name=MODEL, generation_config=generation_config)

# ------------------- Helpers -------------------
def get_language_name(data):
    return {'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali'}.get(data.get('language', 'en'), 'English')

def parse_date(value):
    if not value:
        return None
    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").date()
    except Exception:
        return None

def days_until_date(value):
    date_value = parse_date(value)
    if not date_value:
        return None
    return (date_value - datetime.utcnow().date()).days

def deadline_signal(value, status=""):
    status_text = (status or "").lower()
    days_left = days_until_date(value)
    if "not" in status_text and "open" in status_text:
        return {"label": "Not opened", "tone": "neutral", "days_left": days_left}
    if days_left is None:
        return {"label": "Check official notice", "tone": "neutral", "days_left": None}
    if days_left < 0:
        return {"label": "Closed", "tone": "closed", "days_left": days_left}
    if days_left == 0:
        return {"label": "Deadline today", "tone": "critical", "days_left": days_left}
    if days_left == 1:
        return {"label": "Deadline tomorrow", "tone": "critical", "days_left": days_left}
    if days_left <= 7:
        return {"label": f"Closes in {days_left} days", "tone": "urgent", "days_left": days_left}
    if days_left <= 30:
        return {"label": f"Closes in {days_left} days", "tone": "soon", "days_left": days_left}
    return {"label": f"{days_left} days left", "tone": "open", "days_left": days_left}

DOCUMENT_LABELS = {
    "aadhaar": "Aadhaar card",
    "pan": "PAN card",
    "bank": "Bank account",
    "marksheet": "Latest marksheet",
    "income_certificate": "Income certificate",
    "caste_certificate": "Caste certificate",
    "domicile_certificate": "Domicile certificate",
    "bonafide": "Bonafide or institute certificate",
    "admission_receipt": "Admission or fee receipt",
    "photo": "Passport photo",
}

MINORITY_RELIGIONS = {"muslim", "christian", "sikh", "buddhist", "jain", "parsi", "zoroastrian"}
CATEGORY_VALUES = {"sc", "st", "obc", "ews", "general", "minority", "pwd"}

def clean_user_text(value, max_length=500):
    if value is None:
        return ""
    text = str(value)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_length]

def normalize_token(value):
    return re.sub(r"[^a-z0-9]+", " ", clean_user_text(value, 120).lower()).strip()

def parse_numeric_input(value):
    text = clean_user_text(value, 40)
    match = re.search(r"\d+(?:\.\d+)?", text)
    if not match:
        return None
    try:
        return float(match.group(0))
    except ValueError:
        return None

def normalized_marks_percent(value, mode=None):
    number = parse_numeric_input(value)
    if number is None:
        return None
    marks_mode = normalize_token(mode or "")
    if marks_mode == "cgpa":
        if number > 10:
            return None
        return min(100, round(number * 10, 2))
    if marks_mode in {"percent", "percentage"}:
        if number > 100:
            return None
        return min(100, number)
    if number <= 10:
        return min(100, round(number * 10, 2))
    return min(100, number)

def scholarship_text(item):
    parts = [
        item.get("name", ""),
        item.get("description", ""),
        item.get("eligibility", ""),
        " ".join(item.get("matched_reasons") or []),
        " ".join(item.get("not_eligible_reasons") or []),
    ]
    return normalize_token(" ".join(str(part) for part in parts))

def hard_scholarship_blockers(item, data):
    text = scholarship_text(item)
    gender = normalize_token(data.get("gender", ""))
    caste = normalize_token(data.get("caste", ""))
    religion = normalize_token(data.get("religion", ""))
    disability = normalize_token(data.get("disability", ""))
    blockers = []

    female_only = any(term in text for term in ["girl", "girls", "female", "women", "woman", "pragati"])
    male_only = any(term in text for term in ["boys only", "male only"])
    if gender == "male" and female_only:
        blockers.append("Gender mismatch: this scholarship is for female/girl candidates.")
    if gender == "female" and male_only:
        blockers.append("Gender mismatch: this scholarship is for male candidates.")

    if "pwd" in text or "disability" in text or "disabled" in text or "differently abled" in text:
        if disability in {"no", "not specified", ""}:
            blockers.append("Disability mismatch: this scholarship appears to require PwD/disability status.")

    category_requirements = {
        "sc": [" sc ", "scheduled caste"],
        "st": [" st ", "scheduled tribe"],
        "obc": [" obc ", "other backward"],
        "ews": [" ews ", "economically weaker"],
    }
    padded_text = f" {text} "
    for category, terms in category_requirements.items():
        if any(term in padded_text for term in terms) and caste != category:
            blockers.append(f"Category mismatch: this scholarship appears to require {category.upper()} category.")

    minority_only = "minority" in text or "minorities" in text
    is_minority = religion in MINORITY_RELIGIONS or caste == "minority"
    if minority_only and religion and not is_minority:
        blockers.append("Minority status mismatch: this scholarship appears to require minority community eligibility.")

    return blockers

def normalize_student_documents(data):
    raw = data.get("documents") or {}
    return {key: bool(raw.get(key)) for key in DOCUMENT_LABELS}

def missing_documents_for(required_documents, student_documents):
    required = required_documents or []
    missing = []
    for document in required:
        label = str(document).strip()
        key = next((doc_key for doc_key, doc_label in DOCUMENT_LABELS.items() if doc_label.lower() == label.lower()), None)
        if key and not student_documents.get(key):
            missing.append(DOCUMENT_LABELS[key])
        elif not key:
            normalized = label.lower()
            found = any(doc_label.lower() in normalized and student_documents.get(doc_key) for doc_key, doc_label in DOCUMENT_LABELS.items())
            if not found:
                missing.append(label)
    return list(dict.fromkeys(missing))

def apply_scholarship_quality_fields(scholarships, data):
    student_documents = normalize_student_documents(data)
    normalized = []
    for item in scholarships:
        if not isinstance(item, dict):
            continue
        hard_blockers = hard_scholarship_blockers(item, data)
        if hard_blockers:
            print(f"Dropping hard-ineligible scholarship: {item.get('name')} | {hard_blockers}")
            continue
        required_documents = item.get("documents_required") or item.get("required_documents") or []
        if isinstance(required_documents, str):
            required_documents = [part.strip() for part in required_documents.split(",") if part.strip()]
        missing_documents = missing_documents_for(required_documents, student_documents)
        deadline = item.get("deadline") or item.get("application_deadline")
        status = item.get("application_status") or item.get("status") or ""
        signal = deadline_signal(deadline, status)
        score = item.get("match_score")
        try:
            score = int(score)
        except Exception:
            score = 0
        if not score:
            doc_ready = 100 if not required_documents else int(((len(required_documents) - len(missing_documents)) / max(len(required_documents), 1)) * 100)
            score = max(35, min(96, int(doc_ready * 0.35 + 58)))
        item["match_score"] = max(0, min(100, score))
        item["documents_required"] = required_documents
        item["missing_documents"] = missing_documents
        item["deadline"] = deadline
        item["deadline_signal"] = signal
        item["application_status"] = status or ("open" if signal.get("tone") in ["open", "soon", "urgent", "critical"] else "check official notice")
        if not item.get("amount"):
            item["amount"] = "Amount not confirmed"
        if not item.get("amount_basis"):
            item["amount_basis"] = "Exact benefit not available from generated data. Verify in the official notice before applying."
        if not item.get("source_note"):
            item["source_note"] = "Generated from profile context and known scholarship patterns; verify final amount, date, and rules from the official portal."
        if not item.get("direct_url", "").startswith("https://"):
            item["direct_url"] = "https://scholarships.gov.in/All-Scholarships"
        if not item.get("search_url", "").startswith("https://"):
            item["search_url"] = f"https://www.google.com/search?q={item.get('name', '').replace(' ', '+')}+scholarship"
        normalized.append(item)
    return normalized

def shuffle_question_options(question):
    if not isinstance(question, dict):
        return question
    options = question.get("options")
    answer = question.get("answer")
    if not isinstance(options, list) or len(options) != 4 or answer is None:
        return question
    shuffled = options[:]
    for _ in range(5):
        random.shuffle(shuffled)
        if shuffled != options:
            break
    if answer not in shuffled:
        shuffled[0] = answer
        random.shuffle(shuffled)
    question["options"] = shuffled
    return question

def first_profile_for_user(user_id):
    return StudentProfile.query.filter_by(user_id=user_id).order_by(StudentProfile.updated_at.desc()).first()

def profile_completeness(profile):
    if not profile:
        return 0
    fields = [
        profile.status,
        profile.education,
        profile.skills,
        profile.interests,
        profile.goals,
        profile.target_companies,
        profile.target_exams,
    ]
    filled = len([field for field in fields if field and str(field).strip()])
    return int((filled / len(fields)) * 100)

def recent_activity_for_user(user_id, limit=8):
    items = []
    for roadmap in Roadmap.query.filter_by(user_id=user_id).order_by(Roadmap.created_at.desc()).limit(4).all():
        items.append({
            "type": "roadmap",
            "title": roadmap.title,
            "detail": f"{roadmap.status or 'active'} roadmap",
            "created_at": roadmap.created_at.isoformat() if roadmap.created_at else None,
        })
    for attempt in QuestionAttempt.query.filter_by(user_id=user_id).order_by(QuestionAttempt.created_at.desc()).limit(4).all():
        items.append({
            "type": "question",
            "title": "Practice question",
            "detail": "Correct" if attempt.is_correct else "Needs review",
            "created_at": attempt.created_at.isoformat() if attempt.created_at else None,
        })
    for test in MockTest.query.filter_by(user_id=user_id).order_by(MockTest.created_at.desc()).limit(4).all():
        items.append({
            "type": "mock_test",
            "title": f"{test.exam or 'Mock test'}",
            "detail": f"{float(test.score or 0):.0f}% score",
            "created_at": test.created_at.isoformat() if test.created_at else None,
        })
    for scholarship in SavedScholarship.query.filter_by(user_id=user_id).order_by(SavedScholarship.created_at.desc()).limit(4).all():
        payload = scholarship.scholarship_json or {}
        items.append({
            "type": "scholarship",
            "title": payload.get("name", "Saved scholarship"),
            "detail": scholarship.status or "saved",
            "created_at": scholarship.created_at.isoformat() if scholarship.created_at else None,
        })
    return sorted(items, key=lambda item: item.get("created_at") or "", reverse=True)[:limit]

def topic_insights_for_user(user_id):
    attempts = QuestionAttempt.query.filter_by(user_id=user_id).order_by(QuestionAttempt.created_at.desc()).all()
    grouped = {}
    for attempt in attempts:
        topic = attempt.topic or attempt.subject or attempt.exam or "General practice"
        if topic not in grouped:
            grouped[topic] = {
                "topic": topic,
                "attempts": 0,
                "correct": 0,
                "wrong": 0,
                "last_seen": None,
                "questions": [],
            }
        grouped[topic]["attempts"] += 1
        if attempt.is_correct:
            grouped[topic]["correct"] += 1
        else:
            grouped[topic]["wrong"] += 1
            if len(grouped[topic]["questions"]) < 3:
                grouped[topic]["questions"].append(attempt.question_text)
        if attempt.created_at and (not grouped[topic]["last_seen"] or attempt.created_at.isoformat() > grouped[topic]["last_seen"]):
            grouped[topic]["last_seen"] = attempt.created_at.isoformat()

    insights = []
    for item in grouped.values():
        accuracy = round((item["correct"] / item["attempts"]) * 100) if item["attempts"] else 0
        strength = "strong" if accuracy >= 75 else "improving" if accuracy >= 45 else "weak"
        insights.append({**item, "accuracy": accuracy, "strength": strength})
    return sorted(insights, key=lambda item: (item["accuracy"], -item["attempts"]))[:12]

def revision_queue_for_user(user_id):
    wrong_attempts = QuestionAttempt.query.filter_by(user_id=user_id, is_correct=False).order_by(QuestionAttempt.created_at.desc()).limit(20).all()
    saved_questions = SavedQuestion.query.filter_by(user_id=user_id).order_by(SavedQuestion.created_at.desc()).limit(20).all()
    queue = []
    now = datetime.utcnow()

    for attempt in wrong_attempts:
        age_days = (now - attempt.created_at).days if attempt.created_at else 0
        due_state = "overdue" if age_days >= 3 else "due today" if age_days >= 1 else "repeat soon"
        queue.append({
            "type": "mistake",
            "title": attempt.topic or attempt.subject or "Wrong answer review",
            "question": attempt.question_text,
            "correct_answer": attempt.correct_answer,
            "due_state": due_state,
            "created_at": attempt.created_at.isoformat() if attempt.created_at else None,
        })

    for question in saved_questions:
        queue.append({
            "type": "saved",
            "title": question.topic or question.subject or "Saved question",
            "question": question.question_text,
            "correct_answer": question.correct_answer,
            "due_state": "saved review",
            "created_at": question.created_at.isoformat() if question.created_at else None,
        })

    return sorted(queue, key=lambda item: item.get("created_at") or "", reverse=True)[:12]

def timeline_for_user(user_id):
    items = []
    for roadmap in Roadmap.query.filter_by(user_id=user_id).order_by(Roadmap.created_at.desc()).limit(5).all():
        items.append({
            "type": "roadmap",
            "title": roadmap.title,
            "date": roadmap.created_at.isoformat() if roadmap.created_at else None,
            "status": roadmap.status,
        })
    for test in MockTest.query.filter_by(user_id=user_id).order_by(MockTest.created_at.desc()).limit(5).all():
        items.append({
            "type": "mock",
            "title": test.exam or "Mock test",
            "date": test.created_at.isoformat() if test.created_at else None,
            "status": f"{float(test.score or 0):.0f}% score",
        })
    for scholarship in SavedScholarship.query.filter_by(user_id=user_id).order_by(SavedScholarship.created_at.desc()).limit(5).all():
        payload = scholarship.scholarship_json or {}
        items.append({
            "type": "application",
            "title": payload.get("name", "Scholarship application"),
            "date": scholarship.deadline.isoformat() if scholarship.deadline else (scholarship.created_at.isoformat() if scholarship.created_at else None),
            "status": scholarship.status,
        })
    return sorted(items, key=lambda item: item.get("date") or "", reverse=True)[:10]

def career_path_for_roadmap(roadmap):
    if not roadmap:
        return None

    steps = roadmap.roadmap_json or []
    career_steps = []

    for index, step in enumerate(steps[:6]):
        if isinstance(step, str):
            title = step
            detail = ""
            resources = []
        elif isinstance(step, dict):
            title = step.get("title") or step.get("step") or step.get("name") or step.get("phase") or f"Stage {index + 1}"
            detail = step.get("description") or step.get("details") or step.get("action") or step.get("summary") or ""
            raw_resources = step.get("resources") or step.get("links") or step.get("resource_links") or []
            if isinstance(raw_resources, str):
                resources = [{"title": raw_resources, "url": raw_resources if raw_resources.startswith("http") else ""}]
            else:
                resources = []
                for resource in raw_resources[:3] if isinstance(raw_resources, list) else []:
                    if isinstance(resource, str):
                        resources.append({"title": resource, "url": resource if resource.startswith("http") else ""})
                    elif isinstance(resource, dict):
                        resources.append({
                            "title": resource.get("title") or resource.get("name") or resource.get("label") or resource.get("url") or "Resource",
                            "url": resource.get("url") or resource.get("link") or "",
                        })
        else:
            title = f"Stage {index + 1}"
            detail = ""
            resources = []

        career_steps.append({
            "roadmap_id": roadmap.id,
            "stage": index + 1,
            "title": title,
            "detail": detail,
            "resources": resources,
            "has_guide": bool(isinstance(step, dict) and step.get("ai_guide")),
        })

    return {
        "id": roadmap.id,
        "title": roadmap.title,
        "status": roadmap.status,
        "step_count": len(steps),
        "updated_at": roadmap.updated_at.isoformat() if roadmap.updated_at else None,
        "steps": career_steps,
    }

def readiness_score(profile, counts, mock_average):
    profile_score = profile_completeness(profile) * 0.35
    practice_score = min(counts.get("question_attempts", 0), 40) / 40 * 20
    roadmap_score = min(counts.get("roadmaps", 0), 3) / 3 * 15
    mock_score = (mock_average or 0) * 0.2
    opportunity_score = min(counts.get("saved_scholarships", 0), 5) / 5 * 10
    return round(profile_score + practice_score + roadmap_score + mock_score + opportunity_score)

def weekly_report_for_user(profile, counts, mock_average, topic_insights):
    weak_topics = [item["topic"] for item in topic_insights if item["strength"] == "weak"][:3]
    strong_topics = [item["topic"] for item in topic_insights if item["strength"] == "strong"][:3]
    return {
        "summary": "Your workspace is building a useful memory from roadmaps, practice, mock tests, saved questions, and opportunities.",
        "wins": [
            f"{counts.get('question_attempts', 0)} practice attempts recorded",
            f"{counts.get('mock_tests', 0)} mock tests completed",
            f"{counts.get('roadmaps', 0)} roadmaps saved",
        ],
        "weak_areas": weak_topics,
        "strong_areas": strong_topics,
        "next_actions": [
            "Review the due revision queue",
            "Take one mock test from a weak topic",
            "Update profile targets before generating the next roadmap" if profile_completeness(profile) < 90 else "Pin the roadmap you want to execute this week",
        ],
        "mock_average": mock_average,
    }

def mentor_context_text(user_id):
    try:
        profile = first_profile_for_user(user_id)
        latest_roadmap = Roadmap.query.filter_by(user_id=user_id).order_by(Roadmap.updated_at.desc()).first()
        mock_tests = MockTest.query.filter_by(user_id=user_id).all()
        mock_average = 0
        if mock_tests:
            scores = [float(test.score or 0) for test in mock_tests]
            mock_average = round(sum(scores) / len(scores))
        weak_topics = [item["topic"] for item in topic_insights_for_user(user_id) if item["strength"] == "weak"][:5]
        context = {
            "profile": profile.to_dict() if profile else None,
            "latest_roadmap": latest_roadmap.title if latest_roadmap else None,
            "weak_topics": weak_topics,
            "mock_average": mock_average,
        }
        return f"Student memory context: {json.dumps(context, ensure_ascii=False)}"
    except Exception as e:
        print("Mentor memory context error:", e)
        return "Student memory context unavailable."

# ------------------- Workspace Data APIs -------------------

@app.route('/dashboard-summary', methods=['GET'])
@login_required
def dashboard_summary():
    profile = first_profile_for_user(current_user.id)
    latest_roadmap = Roadmap.query.filter_by(user_id=current_user.id).order_by(Roadmap.updated_at.desc()).first()
    latest_chat = ChatSession.query.filter_by(user_id=current_user.id).order_by(ChatSession.updated_at.desc()).first()
    latest_mock = MockTest.query.filter_by(user_id=current_user.id).order_by(MockTest.created_at.desc()).first()
    mock_tests = MockTest.query.filter_by(user_id=current_user.id).all()
    wrong_attempts = QuestionAttempt.query.filter_by(user_id=current_user.id, is_correct=False).count()
    saved_scholarships = SavedScholarship.query.filter_by(user_id=current_user.id).count()
    saved_questions = SavedQuestion.query.filter_by(user_id=current_user.id).count()
    roadmaps = Roadmap.query.filter_by(user_id=current_user.id).count()
    attempts = QuestionAttempt.query.filter_by(user_id=current_user.id).count()
    mock_average = 0
    if mock_tests:
        scores = [float(test.score or 0) for test in mock_tests]
        mock_average = round(sum(scores) / len(scores))
    counts = {
        "roadmaps": roadmaps,
        "saved_questions": saved_questions,
        "saved_scholarships": saved_scholarships,
        "question_attempts": attempts,
        "mock_tests": len(mock_tests),
        "wrong_attempts": wrong_attempts,
    }
    topic_insights = topic_insights_for_user(current_user.id)
    readiness = readiness_score(profile, counts, mock_average)

    return jsonify({
        "profile": profile.to_dict() if profile else None,
        "profile_completeness": profile_completeness(profile),
        "counts": counts,
        "mock_average": mock_average,
        "career_readiness_score": readiness,
        "latest_roadmap": latest_roadmap.to_dict(include_json=False) if latest_roadmap else None,
        "career_path": career_path_for_roadmap(latest_roadmap),
        "latest_chat": latest_chat.to_dict() if latest_chat else None,
        "latest_mock": latest_mock.to_dict(include_payload=False) if latest_mock else None,
        "recent_activity": recent_activity_for_user(current_user.id),
        "topic_insights": topic_insights,
        "revision_queue": revision_queue_for_user(current_user.id),
        "timeline": timeline_for_user(current_user.id),
        "weekly_report": weekly_report_for_user(profile, counts, mock_average, topic_insights),
        "mentor_memory": {
            "profile": profile.to_dict() if profile else None,
            "latest_roadmap": latest_roadmap.title if latest_roadmap else None,
            "weak_topics": [item["topic"] for item in topic_insights if item["strength"] == "weak"][:5],
            "mock_average": mock_average,
        },
        "opportunity_matches": [
            f"Scholarships for {profile.education}" if profile and profile.education else "Scholarships matching your profile",
            f"Practice plan for {profile.target_exams}" if profile and profile.target_exams else "Exam practice plan from your weak topics",
            f"Projects for {profile.goals}" if profile and profile.goals else "Portfolio projects for your career goal",
        ],
        "notifications": [
            "Revision queue has overdue mistakes" if wrong_attempts else "No wrong-answer backlog yet",
            "Add deadlines to saved scholarships" if saved_scholarships else "Save scholarships to start deadline tracking",
            "Open your latest mock test for detailed review" if latest_mock else "Complete a mock test to unlock analytics",
        ],
        "recommendations": [
            "Review wrong practice questions" if wrong_attempts else "Generate your first practice question",
            "Update your student profile" if profile_completeness(profile) < 80 else "Generate a focused roadmap from your profile",
            "Check upcoming scholarship deadlines" if saved_scholarships else "Save scholarships you want to apply for",
        ],
    }), 200

@app.route('/global-search', methods=['GET'])
@login_required
def global_search():
    query = (request.args.get('q') or '').strip()
    if len(query) < 2:
        return jsonify([]), 200

    pattern = f"%{query}%"
    results = []
    for roadmap in Roadmap.query.filter(Roadmap.user_id == current_user.id, Roadmap.title.ilike(pattern)).limit(8).all():
        results.append({"type": "roadmap", "title": roadmap.title, "detail": roadmap.status, "id": roadmap.id})
    for question in SavedQuestion.query.filter(SavedQuestion.user_id == current_user.id, SavedQuestion.question_text.ilike(pattern)).limit(8).all():
        results.append({"type": "question", "title": question.question_text[:120], "detail": question.topic or question.subject, "id": question.id})
    for session_obj in ChatSession.query.filter(ChatSession.user_id == current_user.id, ChatSession.title.ilike(pattern)).limit(8).all():
        results.append({"type": "chat", "title": session_obj.title or "Chat", "detail": session_obj.chat_type, "id": session_obj.id})
    for scholarship in SavedScholarship.query.filter_by(user_id=current_user.id).limit(50).all():
        payload = scholarship.scholarship_json or {}
        title = payload.get("name", "Saved scholarship")
        description = payload.get("description", "")
        if query.lower() in f"{title} {description}".lower():
            results.append({"type": "scholarship", "title": title, "detail": scholarship.status, "id": scholarship.id})
    return jsonify(results[:20]), 200

@app.route('/student-profile', methods=['GET', 'PUT'])
@login_required
def student_profile():
    profile = first_profile_for_user(current_user.id)

    if request.method == 'GET':
        return jsonify(profile.to_dict() if profile else None), 200

    data = request.get_json() or {}
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.session.add(profile)

    for field in [
        'status',
        'education',
        'skills',
        'interests',
        'goals',
        'preferred_language',
        'student_type',
        'course_stream',
        'institution_name',
        'study_level',
        'gender',
        'caste_category',
        'disability_status',
        'scholarship_marks',
        'religion',
        'region',
        'study_destination',
    ]:
        if field in data:
            setattr(profile, field, data.get(field))
    if 'annual_family_income' in data:
        profile.annual_family_income = data.get('annual_family_income') or None
    if 'annual_income' in data:
        profile.annual_family_income = data.get('annual_income') or None
    if 'documents_json' in data:
        profile.documents_json = data.get('documents_json') or {}
    if 'documents' in data:
        profile.documents_json = data.get('documents') or {}
    if 'scholarship_preferences_json' in data:
        profile.scholarship_preferences_json = data.get('scholarship_preferences_json') or {}
    if 'target_companies' in data:
        profile.target_companies = data.get('target_companies')
    if 'targetCompanies' in data:
        profile.target_companies = data.get('targetCompanies')
    if 'target_exams' in data:
        profile.target_exams = data.get('target_exams')

    profile.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify(profile.to_dict()), 200

@app.route('/roadmaps', methods=['GET', 'POST'])
@login_required
def roadmaps():
    if request.method == 'GET':
        status = request.args.get('status')
        query = Roadmap.query.filter_by(user_id=current_user.id)
        if status:
            query = query.filter_by(status=status)
        items = query.order_by(Roadmap.updated_at.desc()).all()
        return jsonify([item.to_dict(include_json=False) for item in items]), 200

    data = request.get_json() or {}
    roadmap_json = data.get('roadmap_json') or data.get('roadmap')
    if not roadmap_json:
        return jsonify({"error": "roadmap_json is required"}), 400

    item = Roadmap(
        user_id=current_user.id,
        title=data.get('title') or 'Career roadmap',
        input_profile=data.get('input_profile') or {},
        roadmap_json=roadmap_json,
        status=data.get('status') or 'active',
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/roadmaps/<int:roadmap_id>', methods=['GET', 'PATCH', 'DELETE'])
@login_required
def roadmap_detail(roadmap_id):
    item = Roadmap.query.filter_by(id=roadmap_id, user_id=current_user.id).first()
    if not item:
        return jsonify({"error": "Roadmap not found"}), 404

    if request.method == 'GET':
        return jsonify(item.to_dict()), 200

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Roadmap deleted"}), 200

    data = request.get_json() or {}
    if 'title' in data:
        item.title = data.get('title') or item.title
    if 'status' in data:
        item.status = data.get('status') or item.status
    if 'roadmap_json' in data:
        item.roadmap_json = data.get('roadmap_json')
    item.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify(item.to_dict()), 200

@app.route('/roadmaps/<int:roadmap_id>/stages/<int:stage_number>/guide', methods=['POST'])
@login_required
def roadmap_stage_guide(roadmap_id, stage_number):
    item = Roadmap.query.filter_by(id=roadmap_id, user_id=current_user.id).first()
    if not item:
        return jsonify({"error": "Roadmap not found"}), 404

    steps = list(item.roadmap_json or [])
    index = stage_number - 1
    if index < 0 or index >= len(steps):
        return jsonify({"error": "Stage not found"}), 404

    data = request.get_json() or {}
    language = get_language_name(data)
    step = steps[index]
    if isinstance(step, str):
        step_data = {"title": step, "description": ""}
    elif isinstance(step, dict):
        step_data = dict(step)
    else:
        step_data = {"title": f"Stage {stage_number}", "description": ""}

    if step_data.get("ai_guide") and not data.get("regenerate"):
        return jsonify({"guide": step_data["ai_guide"], "roadmap": item.to_dict()}), 200

    profile = first_profile_for_user(current_user.id)
    profile_context = profile.to_dict() if profile else {}
    prompt = f"""
    You are an expert career mentor. Create a practical, structured action document in {language}
    for this saved roadmap stage.

    Roadmap title: {item.title}
    Stage number: {stage_number}
    Stage title: {step_data.get('title') or step_data.get('step') or 'Career stage'}
    Stage description: {step_data.get('description') or step_data.get('details') or step_data.get('action') or ''}
    Student profile: {json.dumps(profile_context, ensure_ascii=False)}

    Return ONLY valid JSON with this shape:
    {{
      "title": "short guide title",
      "summary": "2-3 sentence overview",
      "outcome": "what the student should be able to do after this stage",
      "steps": ["5-7 concrete actions"],
      "resources": [{{"title": "resource/search term", "reason": "why it helps"}}],
      "deliverable": "one thing the student should create or finish",
      "checklist": ["3-5 completion checks"],
      "ai_prompt": "a useful prompt the student can ask the AI tutor next"
    }}
    """

    try:
        response = model.generate_content(prompt)
        cleaned = response.text.strip().replace('```json', '').replace('```', '')
        guide = json.loads(cleaned)
        step_data["ai_guide"] = guide
        steps[index] = step_data
        item.roadmap_json = steps
        item.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({"guide": guide, "roadmap": item.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        print("Stage guide error:", e)
        return jsonify({"error": "Could not generate this roadmap stage guide."}), 500

@app.route('/saved-questions', methods=['GET', 'POST'])
@login_required
def saved_questions():
    if request.method == 'GET':
        query = SavedQuestion.query.filter_by(user_id=current_user.id)
        for key, column in {
            'exam': SavedQuestion.exam,
            'subject': SavedQuestion.subject,
            'topic': SavedQuestion.topic,
            'difficulty': SavedQuestion.difficulty,
        }.items():
            value = request.args.get(key)
            if value:
                query = query.filter(column.ilike(f"%{value}%"))
        items = query.order_by(SavedQuestion.created_at.desc()).all()
        return jsonify([item.to_dict() for item in items]), 200

    data = request.get_json() or {}
    question_text = data.get('question_text') or data.get('question')
    if not question_text:
        return jsonify({"error": "question_text is required"}), 400

    existing = SavedQuestion.query.filter_by(user_id=current_user.id, question_text=question_text).first()
    if existing:
        return jsonify(existing.to_dict()), 200

    item = SavedQuestion(
        user_id=current_user.id,
        question_text=question_text,
        options_json=data.get('options_json') or data.get('options'),
        correct_answer=data.get('correct_answer') or data.get('answer'),
        explanation=data.get('explanation'),
        exam=data.get('exam'),
        subject=data.get('subject'),
        topic=data.get('topic'),
        difficulty=data.get('difficulty'),
        source=data.get('source') or 'practice',
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/saved-questions/<int:question_id>', methods=['DELETE'])
@login_required
def delete_saved_question(question_id):
    item = SavedQuestion.query.filter_by(id=question_id, user_id=current_user.id).first()
    if not item:
        return jsonify({"error": "Saved question not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Saved question deleted"}), 200

@app.route('/question-attempts', methods=['GET', 'POST'])
@login_required
def question_attempts():
    if request.method == 'GET':
        query = QuestionAttempt.query.filter_by(user_id=current_user.id)
        if request.args.get('wrong_only') == 'true':
            query = query.filter_by(is_correct=False)
        items = query.order_by(QuestionAttempt.created_at.desc()).limit(200).all()
        return jsonify([item.to_dict() for item in items]), 200

    data = request.get_json() or {}
    question_text = data.get('question_text') or data.get('question')
    if not question_text:
        return jsonify({"error": "question_text is required"}), 400
    selected = data.get('selected_answer')
    correct = data.get('correct_answer') or data.get('answer')
    is_correct = data.get('is_correct')
    if is_correct is None and selected is not None and correct is not None:
        is_correct = selected == correct

    item = QuestionAttempt(
        user_id=current_user.id,
        saved_question_id=data.get('saved_question_id'),
        question_text=question_text,
        selected_answer=selected,
        correct_answer=correct,
        is_correct=is_correct,
        time_taken_seconds=data.get('time_taken_seconds'),
        exam=data.get('exam'),
        subject=data.get('subject'),
        topic=data.get('topic'),
        difficulty=data.get('difficulty'),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/mock-tests', methods=['GET', 'POST'])
@login_required
def mock_tests():
    if request.method == 'GET':
        items = MockTest.query.filter_by(user_id=current_user.id).order_by(MockTest.created_at.desc()).all()
        return jsonify([item.to_dict(include_payload=False) for item in items]), 200

    data = request.get_json() or {}
    item = MockTest(
        user_id=current_user.id,
        exam=data.get('exam'),
        subject=data.get('subject'),
        topic=data.get('topic'),
        difficulty=data.get('difficulty'),
        total_questions=data.get('total_questions'),
        correct_answers=data.get('correct_answers'),
        incorrect_answers=data.get('incorrect_answers'),
        score=data.get('score'),
        questions_json=data.get('questions_json') or data.get('questions'),
        answers_json=data.get('answers_json') or data.get('answers'),
        analysis_json=data.get('analysis_json') or data.get('analysis'),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/mock-tests/<int:test_id>', methods=['GET'])
@login_required
def mock_test_detail(test_id):
    item = MockTest.query.filter_by(id=test_id, user_id=current_user.id).first()
    if not item:
        return jsonify({"error": "Mock test not found"}), 404
    return jsonify(item.to_dict()), 200

@app.route('/saved-scholarships', methods=['GET', 'POST'])
@login_required
def saved_scholarships():
    if request.method == 'GET':
        status = request.args.get('status')
        query = SavedScholarship.query.filter_by(user_id=current_user.id)
        if status:
            query = query.filter_by(status=status)
        items = query.order_by(SavedScholarship.created_at.desc()).all()
        return jsonify([item.to_dict() for item in items]), 200

    data = request.get_json() or {}
    payload = data.get('scholarship_json') or data.get('scholarship')
    if not payload:
        return jsonify({"error": "scholarship_json is required"}), 400

    item = SavedScholarship(
        user_id=current_user.id,
        scholarship_json=payload,
        deadline=parse_date(data.get('deadline') or payload.get('deadline')),
        status=data.get('status') or 'saved',
        match_score=data.get('match_score') or payload.get('match_score'),
        amount=data.get('amount') or payload.get('amount'),
        application_status=data.get('application_status') or payload.get('application_status'),
        documents_required_json=data.get('documents_required_json') or payload.get('documents_required') or [],
        missing_documents_json=data.get('missing_documents_json') or payload.get('missing_documents') or [],
        eligibility_snapshot_json=data.get('eligibility_snapshot_json') or {
            "eligibility": payload.get("eligibility"),
            "matched_reasons": payload.get("matched_reasons") or [],
            "not_eligible_reasons": payload.get("not_eligible_reasons") or [],
            "next_year_eligibility": payload.get("next_year_eligibility"),
            "smart_answers": payload.get("smart_answers") or {},
        },
        reminder_enabled=bool(data.get('reminder_enabled')),
        reminder_date=parse_date(data.get('reminder_date')),
        notes=data.get('notes'),
        official_url=data.get('official_url') or payload.get('direct_url'),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/saved-scholarships/<int:scholarship_id>', methods=['PATCH', 'DELETE'])
@login_required
def saved_scholarship_detail(scholarship_id):
    item = SavedScholarship.query.filter_by(id=scholarship_id, user_id=current_user.id).first()
    if not item:
        return jsonify({"error": "Saved scholarship not found"}), 404

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Saved scholarship deleted"}), 200

    data = request.get_json() or {}
    if 'status' in data:
        item.status = data.get('status') or item.status
    if 'deadline' in data:
        item.deadline = parse_date(data.get('deadline'))
    if 'match_score' in data:
        item.match_score = data.get('match_score')
    if 'amount' in data:
        item.amount = data.get('amount')
    if 'application_status' in data:
        item.application_status = data.get('application_status')
    if 'documents_required_json' in data:
        item.documents_required_json = data.get('documents_required_json') or []
    if 'missing_documents_json' in data:
        item.missing_documents_json = data.get('missing_documents_json') or []
    if 'eligibility_snapshot_json' in data:
        item.eligibility_snapshot_json = data.get('eligibility_snapshot_json') or {}
    if 'reminder_enabled' in data:
        item.reminder_enabled = bool(data.get('reminder_enabled'))
    if 'reminder_date' in data:
        item.reminder_date = parse_date(data.get('reminder_date'))
    if 'notes' in data:
        item.notes = data.get('notes')
    if 'official_url' in data:
        item.official_url = data.get('official_url')
    if 'scholarship_json' in data:
        item.scholarship_json = data.get('scholarship_json') or item.scholarship_json
    item.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify(item.to_dict()), 200

# ------------------- Performance Analysis -------------------
@app.route('/analyze-performance', methods=['POST', 'OPTIONS'])
def analyze_performance():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    user_answers = data.get('userAnswers', {})
    questions = data.get('questions', [])
    total_questions = len(questions)
    correct_count = 0
    detailed_results = []

    for i, q in enumerate(questions):
        user_ans = user_answers.get(str(i)) or user_answers.get(i)
        is_correct = user_ans == q.get('answer')
        if is_correct:
            correct_count += 1
        detailed_results.append({
            "question": q.get('question'),
            "options": q.get('options'),
            "correct_answer": q.get('answer'),
            "user_answer": user_ans,
            "is_correct": is_correct
        })

    score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0

    try:
        analysis_prompt = f"""
        You are an AI tutor. A student just finished a mock test.
        Score: {score}%
        Questions and user answers: {json.dumps(detailed_results, ensure_ascii=False)}

        Analyze the student's performance as a practical study dashboard, not as a motivational paragraph.
        1. Mention exact question types, topics, concepts, or skills the student handled well.
        2. Mention exact question types, topics, concepts, or skills the student missed.
        3. Give concrete next actions: what to revise, what kind of questions to practice, and what to do in the next mock.
        4. Keep the analysis short and useful.
        5. Output valid JSON only with keys:
           "analysis": "2-3 sentence summary, no markdown",
           "strengths": ["specific strength 1", "specific strength 2"],
           "weaknesses": ["specific weak area 1", "specific weak area 2"],
           "recommendations": ["actionable next step 1", "actionable next step 2", "actionable next step 3"]
        Avoid generic praise. Avoid emojis.
        """

        ai_response = model.generate_content(analysis_prompt)
        cleaned = ai_response.text.strip().replace('```json','').replace('```','')
        ai_result = json.loads(cleaned)
        analysis_text = ai_result.get('analysis', '')
        strengths = ai_result.get('strengths', [])
        weaknesses = ai_result.get('weaknesses', [])
        recommendations = ai_result.get('recommendations', [])

    except Exception as e:
        print("AI analysis error:", e)
        analysis_text = f"You got {correct_count} out of {total_questions} correct."
        strengths = []
        weaknesses = []
        recommendations = []

    result_payload = {
        "score": score,
        "total_questions": total_questions,
        "correct_answers": correct_count,
        "incorrect_answers": total_questions - correct_count,
        "analysis": analysis_text,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "detailed_results": detailed_results
    }

    if current_user.is_authenticated and data.get('save'):
        try:
            saved_test = MockTest(
                user_id=current_user.id,
                exam=data.get('exam'),
                subject=data.get('subject'),
                topic=data.get('topic'),
                difficulty=data.get('difficulty'),
                total_questions=total_questions,
                correct_answers=correct_count,
                incorrect_answers=total_questions - correct_count,
                score=score,
                questions_json=questions,
                answers_json=user_answers,
                analysis_json=result_payload,
            )
            db.session.add(saved_test)
            db.session.commit()
            result_payload["saved_mock_test"] = saved_test.to_dict(include_payload=False)
        except Exception as e:
            print("Mock test save error:", e)
            db.session.rollback()

    return jsonify(result_payload)

# ------------------- Chat Session Management -------------------

@app.route('/chat-sessions', methods=['POST'])
@login_required
def create_chat_session():
    """Create a new chat session for the logged-in user"""
    data = request.get_json()
    chat_type = data.get('chat_type')
    
    if chat_type not in ['career_planner', 'doubt_solver']:
        return jsonify({"error": "Invalid chat type"}), 400
    
    new_session = ChatSession(
        user_id=current_user.id,
        chat_type=chat_type,
        title="New Chat"
    )
    db.session.add(new_session)
    db.session.commit()
    
    return jsonify(new_session.to_dict()), 201

@app.route('/chat-sessions', methods=['GET'])
@login_required
def get_chat_sessions():
    """Get all chat sessions for the logged-in user"""
    chat_type = request.args.get('chat_type')
    
    query = ChatSession.query.filter_by(user_id=current_user.id)
    if chat_type:
        query = query.filter_by(chat_type=chat_type)
    
    sessions = query.order_by(ChatSession.updated_at.desc()).all()
    return jsonify([s.to_dict() for s in sessions]), 200

@app.route('/chat-sessions/<int:session_id>', methods=['GET'])
@login_required
def get_chat_session(session_id):
    """Get a specific chat session with all its messages"""
    session_obj = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first()
    
    if not session_obj:
        return jsonify({"error": "Session not found"}), 404
    
    session_data = session_obj.to_dict()
    session_data['messages'] = [m.to_dict() for m in session_obj.messages]
    
    return jsonify(session_data), 200

@app.route('/chat-sessions/<int:session_id>', methods=['DELETE'])
@login_required
def delete_chat_session(session_id):
    """Delete a specific chat session"""
    session_obj = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first()
    
    if not session_obj:
        return jsonify({"error": "Session not found"}), 404
    
    db.session.delete(session_obj)
    db.session.commit()
    
    return jsonify({"message": "Session deleted successfully"}), 200

@app.route('/chat-sessions/<int:session_id>/messages', methods=['POST'])
@login_required
def save_message(session_id):
    """Save a message to a specific chat session"""
    session_obj = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first()
    
    if not session_obj:
        return jsonify({"error": "Session not found"}), 404
    
    data = request.get_json()
    sender = data.get('sender')
    text = data.get('text')
    
    if sender not in ['user', 'ai']:
        return jsonify({"error": "Invalid sender"}), 400
    
    if not text:
        return jsonify({"error": "Message text is required"}), 400
    
    message = ChatMessage(
        session_id=session_id,
        sender=sender,
        text=text
    )
    db.session.add(message)
    
    session_obj.updated_at = datetime.utcnow()
    
    if session_obj.title == "New Chat" and sender == 'user':
        title = text[:50].strip()
        title = re.sub(r'[#*_\[\]()]', '', title)
        session_obj.title = title if title else "Untitled Chat"
    
    db.session.commit()
    
    return jsonify(message.to_dict()), 201

# ------------------- Other Routes -------------------

@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap():
    data = request.get_json()
    language = get_language_name(data)
    skills = clean_user_text(data.get('skills', ''), 800)
    interests = clean_user_text(data.get('interests', ''), 800)
    goals = clean_user_text(data.get('goals', ''), 500)
    status = clean_user_text(data.get('status', ''), 200)
    education = clean_user_text(data.get('education', ''), 240)
    target = clean_user_text(data.get('targetCompanies', ''), 500)

    prompt = f"""
    You are a career coach. Output JSON array of 8-10 steps in {language}:
    Each step: "type", "title", "description", "source", "url".
    User: Education={education}, Status={status}, Skills={skills}, Interests={interests}, Goal={goals}, Target={target}.
    """

    try:
        for _ in range(3):
            response = model.generate_content(prompt)
            cleaned = response.text.strip().replace('```json', '').replace('```', '')
            try:
                roadmap = json.loads(cleaned)
                if current_user.is_authenticated and data.get('save'):
                    try:
                        title = data.get('title') or goals or "Career roadmap"
                        input_profile = {
                            "skills": skills,
                            "interests": interests,
                            "goals": goals,
                            "status": status,
                            "education": education,
                            "targetCompanies": target,
                            "language": data.get('language', 'en'),
                        }
                        saved_roadmap = Roadmap(
                            user_id=current_user.id,
                            title=str(title)[:180],
                            input_profile=input_profile,
                            roadmap_json=roadmap,
                            status='active',
                        )
                        db.session.add(saved_roadmap)

                        if data.get('update_profile'):
                            profile = first_profile_for_user(current_user.id)
                            if not profile:
                                profile = StudentProfile(user_id=current_user.id)
                                db.session.add(profile)
                            profile.skills = skills
                            profile.interests = interests
                            profile.goals = goals
                            profile.status = status
                            profile.education = education
                            profile.target_companies = target
                            profile.preferred_language = data.get('language', 'en')
                            profile.updated_at = datetime.utcnow()

                        db.session.commit()
                        return jsonify({
                            "roadmap": roadmap,
                            "saved_roadmap": saved_roadmap.to_dict(include_json=False)
                        })
                    except Exception as e:
                        print("Roadmap save error:", e)
                        db.session.rollback()
                return jsonify(roadmap)
            except json.JSONDecodeError:
                continue
        return jsonify({"error": "Failed to parse roadmap JSON"}), 500
    except Exception as e:
        print("Roadmap error:", e)
        return jsonify({"error": "Could not generate roadmap."}), 500

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    language = get_language_name(data)
    history = (data.get('history', []) or [])[-12:]
    session_id = data.get('session_id')
    
    mentor_context = mentor_context_text(current_user.id) if current_user.is_authenticated else ""
    messages = [{'role': 'user', 'parts': [f"You are a helpful AI career coach. Respond only in {language}. Use this context when relevant, but do not mention private data unless useful: {mentor_context}"]}]
    for msg in history:
        role = 'user' if msg.get('sender') == 'user' else 'model'
        messages.append({'role': role, 'parts': [clean_user_text(msg.get('text', ''), 1600)]})
    
    current_user_message = messages[-1]['parts'][0] if messages else ""
    
    try:
        chat_session = model.start_chat(history=messages[:-1])
        response = chat_session.send_message(messages[-1]['parts'][0])
        
        if current_user.is_authenticated and session_id:
            try:
                session_obj = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first()
                if session_obj:
                    user_message = ChatMessage(
                        session_id=session_id,
                        sender='user',
                        text=current_user_message
                    )
                    db.session.add(user_message)
                    
                    ai_message = ChatMessage(
                        session_id=session_id,
                        sender='ai',
                        text=response.text
                    )
                    db.session.add(ai_message)
                    
                    session_obj.updated_at = datetime.utcnow()
                    
                    if session_obj.title == "New Chat":
                        title = current_user_message[:50].strip()
                        title = re.sub(r'[#*_\[\]()]', '', title)
                        session_obj.title = title if title else "Untitled Chat"
                    
                    db.session.commit()
            except Exception as e:
                print(f"Error saving messages to DB: {e}")
                db.session.rollback()
        
        return jsonify({"reply": response.text})
    except Exception as e:
        print("Chat error:", e)
        return jsonify({"error": "Could not generate chat reply."}), 500

@app.route('/solve-doubt-chat', methods=['POST'])
def solve_doubt_chat():
    """Handle doubt solver chat with history support and session storage"""
    data = request.get_json() or {}
    language = get_language_name(data)
    history = (data.get('history', []) or [])[-12:]
    session_id = data.get('session_id')
    
    mentor_context = mentor_context_text(current_user.id) if current_user.is_authenticated else ""
    messages = [{'role': 'user', 'parts': [f"You are a helpful AI tutor that explains concepts clearly. Respond only in {language}. Use this student memory for personalization when relevant: {mentor_context}"]}]
    for msg in history:
        role = 'user' if msg.get('sender') == 'user' else 'model'
        messages.append({'role': role, 'parts': [clean_user_text(msg.get('text', ''), 1600)]})
    
    current_user_message = messages[-1]['parts'][0] if messages else ""
    
    try:
        chat_session = model.start_chat(history=messages[:-1])
        response = chat_session.send_message(messages[-1]['parts'][0])
        
        if current_user.is_authenticated and session_id:
            try:
                session_obj = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first()
                if session_obj:
                    user_message = ChatMessage(
                        session_id=session_id,
                        sender='user',
                        text=current_user_message
                    )
                    db.session.add(user_message)
                    
                    ai_message = ChatMessage(
                        session_id=session_id,
                        sender='ai',
                        text=response.text
                    )
                    db.session.add(ai_message)
                    
                    session_obj.updated_at = datetime.utcnow()
                    
                    if session_obj.title == "New Chat":
                        title = current_user_message[:50].strip()
                        title = re.sub(r'[#*_\[\]()]', '', title)
                        session_obj.title = title if title else "Untitled Chat"
                    
                    db.session.commit()
            except Exception as e:
                print(f"Error saving doubt chat messages to DB: {e}")
                db.session.rollback()
        
        return jsonify({"reply": response.text})
    except Exception as e:
        print("Doubt chat error:", e)
        return jsonify({"error": "Could not generate tutor reply."}), 500

@app.route('/get-question', methods=['POST'])
def get_question():
    data = request.get_json() or {}
    language_name = get_language_name(data)
    
    exam = clean_user_text(data.get('exam', ''), 120)
    subject = clean_user_text(data.get('subject', ''), 120)
    topic = clean_user_text(data.get('topic', ''), 160)
    difficulty = clean_user_text(data.get('difficulty', ''), 80)
    profile_context = clean_user_text(data.get('profile_context', ''), 1200)
    seen = read_history()

    prompt = f"""
    Act as an AI Tutor for Indian competitive exams.
    Generate one unique MCQ in JSON format for the following criteria:
    - Exam: {exam}
    - Subject: {subject}
    - Topic: {topic}
    - Difficulty: {difficulty}
    - Student profile context:
    {profile_context}

    CRITICAL INSTRUCTION 1: The entire response, including the "question", "options", and "answer", MUST be in the {language_name} language.
    CRITICAL INSTRUCTION 2: Do NOT generate a question from this list of previously seen questions: {json.dumps(seen)}
    CRITICAL INSTRUCTION 3: Pay special attention to chemical formulas. They must be written correctly (e.g., NaCl, H₂O, CaCO₃) without any extra prefixes like 'ext'. The response 'extNaCl' is WRONG; the correct response is 'NaCl'. Use LaTeX for formatting where appropriate (e.g., $H_2O$).
    CRITICAL INSTRUCTION 4: If the profile mentions CIL, Coal India Limited, Systems, EDP, or an engineering branch, align the question with that exam/branch instead of falling back to school-level defaults.
    Return ONLY a single valid JSON object with keys: "question", "options" (an array of 4 strings), and "answer".
    """

    try:
        for _ in range(3):
            response = model.generate_content(prompt)
            cleaned = response.text.strip().replace('```json', '').replace('```', '')
            q = json.loads(cleaned)
            if all(k in q for k in ["question", "options", "answer"]) and isinstance(q["options"], list) and len(q["options"]) == 4:
                if q['question'] not in seen:
                    write_history(q['question'])
                    return jsonify(shuffle_question_options(q))
        return jsonify(shuffle_question_options(q))
    except Exception as e:
        print("Question error:", e)
        return jsonify({"error": "Could not generate question."}), 500

@app.route('/solve-doubt', methods=['POST'])
def solve_doubt():
    data = request.get_json() or {}
    language = get_language_name(data)
    question = clean_user_text(data.get('question', ''), 3000)
    session_id = data.get('session_id')
    
    prompt = f"Explain clearly in {language}: {question}"
    
    try:
        response = model.generate_content(prompt)
        
        if current_user.is_authenticated and session_id:
            try:
                session_obj = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first()
                if session_obj:
                    user_message = ChatMessage(
                        session_id=session_id,
                        sender='user',
                        text=question
                    )
                    db.session.add(user_message)
                    
                    ai_message = ChatMessage(
                        session_id=session_id,
                        sender='ai',
                        text=response.text
                    )
                    db.session.add(ai_message)
                    
                    session_obj.updated_at = datetime.utcnow()
                    
                    if session_obj.title == "New Chat":
                        title = question[:50].strip()
                        title = re.sub(r'[#*_\[\]()]', '', title)
                        session_obj.title = title if title else "Untitled Chat"
                    
                    db.session.commit()
            except Exception as e:
                print(f"Error saving doubt to DB: {e}")
                db.session.rollback()
        
        return jsonify({"explanation": response.text})
    except Exception as e:
        print("Doubt error:", e)
        return jsonify({"error": "Could not solve this doubt."}), 500

@app.route('/generate-mock-test', methods=['POST'])
def generate_mock_test():
    data = request.get_json() or {}
    language = get_language_name(data)
    exam = clean_user_text(data.get('exam', ''), 120)
    subject = clean_user_text(data.get('subject', ''), 120)
    topic = clean_user_text(data.get('topic', ''), 160)
    raw_num_q = parse_numeric_input(data.get('num_questions', 5))
    num_q = max(1, min(30, int(raw_num_q or 5)))
    profile_context = clean_user_text(data.get('profile_context', ''), 1200)

    prompt = f"""
Generate {num_q} MCQs in JSON format for:
Exam: {exam}
Subject: {subject}
Topic: {topic}
Student profile context:
{profile_context}

Each question must have keys:
- "question"
- "options" (exactly 4)
- "answer"

Pay special attention to chemical formulas: write them correctly (e.g., NaCl, H₂O, CaCO₃), no prefixes like 'ext'.
Use LaTeX formatting where appropriate (e.g., $H_2O$).
If the profile mentions CIL, Coal India Limited, Systems, EDP, or an engineering branch, target that exam and branch instead of generic Class 10 questions.
The entire response must be in {language}.
Respond only with a JSON array.
"""

    try:
        response = model.generate_content(prompt)
        cleaned = response.text.strip().replace('```json', '').replace('```', '')
        questions = json.loads(cleaned)
        valid_questions = [shuffle_question_options(q) for q in questions if all(k in q for k in ["question", "options", "answer"]) and isinstance(q["options"], list) and len(q["options"]) == 4]
        if not valid_questions:
            return jsonify({"error": "No valid questions generated"}), 500
        return jsonify(valid_questions)
    except Exception as e:
        print("Mock test error:", e)
        return jsonify({"error": "Could not generate mock test."}), 500

@app.route('/find-scholarships', methods=['POST'])
def find_scholarships():
    data = request.get_json()
    try:
        scholarships = fetch_real_scholarships(data)
        if not scholarships:
            return jsonify({"error": "No scholarships found"}), 404
        return jsonify(scholarships)
    except Exception as e:
        print("Scholarship Finder error:", e)
        return jsonify({"error": "Could not find scholarships right now."}), 500

@app.route('/landing-ai', methods=['POST'])
def landing_ai():
    data = request.get_json() or {}
    question = clean_user_text(data.get("question") or "", 600)
    language = get_language_name(data)
    if not question:
        return jsonify({"answer": "Ask me about roadmaps, mock tests, scholarships, AI tutor, saved library, guest mode, or how the platform uses your profile."}), 200

    prompt = f"""
    You are QA AI for Potho-Prodorshok, an AI-powered career operating system for students and aspirants.
    Answer the visitor's question in {language}. Be helpful, concrete, and product-specific. No emojis.

    Product capabilities you can discuss:
    - Landing page, login/register, and guest preview mode. Guest mode lets visitors explore, but saving long-term data needs an account.
    - Student profile memory: education/status, skills, interests, goals, preferred language, target exams, CIL branch/context, stream, institution, region, gender/category/disability, income, and scholarship documents.
    - Dashboard: today's next action, AI weekly report, learning graph, continue cards, mock snapshot, revision queue, goal/career stage view, study timer, smart recommendations.
    - Career Planner: generates saved roadmaps, roadmap history, stage progress, stage pages with AI guides, resources, actions, and completion checklists.
    - AI Tutor: practice questions, tap-to-answer feedback, wrong-answer saving, explanations, adaptive weak-area questions, mock tests, mock analysis, and saved mock history.
    - Scholarship desk: eligibility match score, amount basis, deadlines, documents ready/missing, blockers, official portal links, notifications, application tracking, and scholarship smart bot.
    - Library: roadmaps, saved questions, mistakes, mock tests, scholarships, chats, and resources in one searchable workspace.
    - Dark/light mode, mobile/tablet/desktop responsive UI, language switching.

    Rules:
    - If asked what the app can do, give a concise but complete overview.
    - If asked about data, explain saved roadmaps, questions, attempts, mocks, scholarships, profile, and chats.
    - If asked about scholarships, say final amount/deadline must be verified on the official portal.
    - If asked to start or save, explain that full saving requires login; guest mode is a preview.
    - Keep answer under 120 words unless the user asks for detail.
    - Do not claim features outside the list.

    Visitor question: {question}
    """
    try:
        response = model.generate_content(prompt)
        return jsonify({"answer": response.text.strip()}), 200
    except Exception as e:
        print("Landing AI error:", e)
        return jsonify({"answer": "I can explain roadmaps, practice, mock tests, scholarships, saved library, profile memory, and guest mode. Try asking what you want to do first."}), 200

def fetch_real_scholarships(data):
    language = get_language_name(data)
    marks_mode = clean_user_text(data.get("marks_mode", ""), 20)
    marks = clean_user_text(data.get("marks", ""), 40)
    marks_percent = normalized_marks_percent(marks, marks_mode)
    income = clean_user_text(data.get("income", ""), 40)
    region = clean_user_text(data.get("region", ""), 120)
    destination = clean_user_text(data.get("destination", ""), 120)
    religion = clean_user_text(data.get("religion", ""), 120)
    student_type = clean_user_text(data.get("student_type", ""), 120)
    course_stream = clean_user_text(data.get("course_stream", ""), 160)
    institution = clean_user_text(data.get("institution", ""), 180)
    gender = clean_user_text(data.get("gender", ""), 60)
    caste = clean_user_text(data.get("caste", ""), 80)
    disability = clean_user_text(data.get("disability", ""), 80)
    documents = {DOCUMENT_LABELS.get(key, key): value for key, value in normalize_student_documents(data).items()}
    profile_context = clean_user_text(data.get("profile_context", ""), 1600)

    prompt = f"""
    You are an expert Indian scholarship advisor and application-readiness analyst.
    Generate a JSON array of 5-8 real or well-known scholarship opportunities in {language} tailored for this student.
    Use official Indian scholarship sources when possible, especially National Scholarship Portal schemes, AICTE schemes, UGC schemes, state schemes, and credible private scholarship portals.

    Current date: {datetime.utcnow().date().isoformat()}
    Marks: {marks} {f"({marks_percent}% normalized estimate)" if marks_percent is not None else ""}
    Marks input mode: {marks_mode or "auto"}
    Annual family income: {income}
    Region: {region}
    Destination: {destination}
    Religion: {religion}
    Student type: {student_type}
    Course/stream: {course_stream}
    Institution/college/school: {institution}
    Gender: {gender}
    Caste/category: {caste}
    Disability status: {disability}
    Documents available: {json.dumps(documents, ensure_ascii=False)}
    Student profile context:
    {profile_context}

    Official research context:
    - National Scholarship Portal lists academic year 2026-27 schemes, student application open/close status, eligibility checker, OTR, Aadhaar/EID based registration, Aadhaar-bank seeding, and PFMS payment tracking.
    - NSP examples currently show many central schemes opened from 2026-06-01 with student application deadlines such as 2026-10-31 or 2026-08-31; some schemes are "NOT YET OPENED".
    - Common scholarship documents include Aadhaar/EID, bank account details, latest marksheet, income certificate, caste/category certificate where applicable, domicile certificate where applicable, bonafide/institute certificate, admission/fee receipt, and photograph.
    - Treat the institution/college/school field as student context only. Do not claim that the institute itself issues a scholarship document unless the official scheme explicitly requires an institute/bonafide certificate.

    Hard filtering instructions:
    - Do NOT return female/girl/women-only scholarships when Gender is Male.
    - Do NOT return male-only scholarships when Gender is Female.
    - Do NOT return SC/ST/OBC/EWS-specific scholarships unless the Caste/category matches.
    - Do NOT return PwD/disability-only scholarships unless Disability status says Yes/PwD.
    - Do NOT return minority-only scholarships unless Religion/category indicates a minority community.
    - If a scheme is generally relevant but the student is not eligible, do not include it as a result.

    Each scholarship object must have these keys:
      "name" - the scholarship name
      "description" - a short description
      "amount" - expected benefit amount. Prefer exact amount from the known scheme. If exact amount is unknown, provide a clearly labeled scheme-based range and explain why.
      "amount_basis" - one sentence explaining where the amount comes from, such as scheme rules, NSP/AICTE pattern, or "official notice needed".
      "source_note" - short source transparency note, e.g. "NSP scheme listing / official notice should be checked before applying"
      "deadline" - ISO date YYYY-MM-DD if known, otherwise null
      "application_status" - "open", "not yet opened", "closed", or "check official notice"
      "eligibility" - eligibility criteria in clear student language
      "match_score" - integer 0-100 based on stream, income, marks, region, gender/category/disability and documents
      "matched_reasons" - array of concrete reasons with approximate contribution percentages, e.g. "Course stream match +25%", "Income under likely limit +20%". Never write generic phrases like "profile context matches".
      "not_eligible_reasons" - array of concrete blockers with approximate impact percentages, empty if likely eligible
      "next_year_eligibility" - short answer on whether the student can become eligible next year and what must change
      "documents_required" - array of required documents
      "missing_documents" - array of required documents the student does not currently have
      "application_steps" - array of 3-5 general next actions. Do not invent institute-specific steps such as "upload certificate from {institution}". Prefer actions like "Open the official portal", "Verify scheme notice", "Prepare listed documents", "Submit before deadline".
      "smart_answers" - object with keys "am_i_eligible", "why_not", "next_year", "documents"
      "direct_url" - a valid URL starting with "https://"
      "search_url" - a Google search URL for the scholarship
    Do not invent fake official domains. If unsure, use the NSP all-scholarships page or a Google search URL.
    Return ONLY valid JSON. No markdown.
    """

    try:
        for _ in range(3):
            response = model.generate_content(prompt)
            cleaned = response.text.strip().replace('```json', '').replace('```', '')
            try:
                scholarships = json.loads(cleaned)
                if isinstance(scholarships, list) and len(scholarships) > 0:
                    return apply_scholarship_quality_fields(scholarships, data)
            except json.JSONDecodeError:
                continue
        return []
    except Exception as e:
        print("Scholarship generation error:", e)
        return []

# --- AUTHENTICATION ENDPOINTS ---

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email address already registered"}), 409

    new_user = User(email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    login_user(new_user)
    return jsonify({
        "message": "Signup successful",
        "user": {"id": new_user.id, "email": new_user.email}
    }), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    
    if user is None or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401
        
    login_user(user)
    return jsonify({"message": "Login successful", "user": {"id": user.id, "email": user.email}}), 200

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logout successful"}), 200

@app.route('/check_session')
def check_session():
    if current_user.is_authenticated:
        return jsonify({"is_logged_in": True, "user": {"id": current_user.id, "email": current_user.email}}), 200
    else:
        return jsonify({"is_logged_in": False}), 200

# ------------------- Run App -------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
