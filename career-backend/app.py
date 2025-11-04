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
from datetime import datetime
import re

# ------------------- Load Env -------------------
load_dotenv()

# ------------------- Flask App -------------------
app = Flask(__name__)
# --- Add this block right after app = Flask(__name__) ---
app.secret_key = os.getenv("FLASK_SECRET_KEY")
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,  # Checks if a connection is alive before using it
    'pool_recycle': 300,    # Recycles connections every 5 minutes (300 seconds)
}

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_DOMAIN'] = '.pothoprodorshok.mooo.com'  # Set your domain here

# --- Mail Configuration (Brevo) ---
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False') == 'True'

mail = Mail(app)

# --- Initialize Extensions ---
db.init_app(app)
login_manager.init_app(app)
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173", 
    "https://pothoprodorshok.onrender.com",
    "https://pothoprodorshok.mooo.com"
]) 

if not app.secret_key:
    raise ValueError("FLASK_SECRET_KEY missing")

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Authentication required", "is_logged_in": False}), 401

# Also update the login_manager configuration
login_manager.session_protection = "strong"
login_manager.login_view = None  # Don't redirect, return JSON instead

# --- Register blueprint AFTER app is created ---
from auth import auth_bp, google_bp
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(google_bp, url_prefix="/auth/google")  # Register Google OAuth blueprint

# Import models AFTER db is initialized
from models import User, ChatSession, ChatMessage

# 👇 Add this route
@app.route('/logout-google')
def logout_google():
    session.pop("google_oauth_token", None)
    return "Google token cleared"

@app.route('/')
def home():
    return jsonify({"message": "Server is running!"}), 200

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
generation_config = {"temperature": 0.7, "max_output_tokens": 2048}
MODEL = "models/gemini-2.5-flash-lite-preview-09-2025"
model = genai.GenerativeModel(model_name=MODEL, generation_config=generation_config)

# ------------------- Helpers -------------------
def get_language_name(data):
    return {'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali'}.get(data.get('language', 'en'), 'English')

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

    score = int((correct_count / total_questions) * 100)

    # ---------------- AI Analysis ----------------
    try:
        # Build a prompt for AI to analyze the performance
        analysis_prompt = f"""
        You are an AI tutor. A student just finished a mock test.
        Score: {score}%
        Questions and user answers: {json.dumps(detailed_results, ensure_ascii=False)}

        Analyze the student's performance. 
        1. Explain in simple language which topics/questions were done well and which were wrong.
        2. Identify the student's STRENGTHS (topics/questions they excelled at) as a list.
        3. Identify the student's WEAKNESSES (topics/questions they struggled with) as a list.
        4. Give study recommendations for improvement.
        5. Output as JSON with keys:
           "analysis": "string explaining performance",
           "strengths": ["list of strengths"],
           "weaknesses": ["list of weaknesses"],
           "recommendations": ["list of actionable recommendations"]
        Respond in concise, friendly language.
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

    return jsonify({
        "score": score,
        "total_questions": total_questions,
        "correct_answers": correct_count,
        "incorrect_answers": total_questions - correct_count,
        "analysis": analysis_text,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "detailed_results": detailed_results
    })

# ------------------- Chat Session Management -------------------

# Create or get a chat session
@app.route('/chat-sessions', methods=['POST'])
@login_required
def create_chat_session():
    """Create a new chat session for the logged-in user"""
    data = request.get_json()
    chat_type = data.get('chat_type')  # 'career_planner' or 'doubt_solver'
    
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

# Get all chat sessions for the logged-in user
@app.route('/chat-sessions', methods=['GET'])
@login_required
def get_chat_sessions():
    """Get all chat sessions for the logged-in user"""
    chat_type = request.args.get('chat_type')  # optional filter
    
    query = ChatSession.query.filter_by(user_id=current_user.id)
    if chat_type:
        query = query.filter_by(chat_type=chat_type)
    
    sessions = query.order_by(ChatSession.updated_at.desc()).all()
    return jsonify([s.to_dict() for s in sessions]), 200

# Get a specific chat session with all messages
@app.route('/chat-sessions/<int:session_id>', methods=['GET'])
@login_required
def get_chat_session(session_id):
    """Get a specific chat session with all its messages"""
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first()
    
    if not session:
        return jsonify({"error": "Session not found"}), 404
    
    session_data = session.to_dict()
    session_data['messages'] = [m.to_dict() for m in session.messages]
    
    return jsonify(session_data), 200

# Delete a chat session
@app.route('/chat-sessions/<int:session_id>', methods=['DELETE'])
@login_required
def delete_chat_session(session_id):
    """Delete a specific chat session"""
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first()
    
    if not session:
        return jsonify({"error": "Session not found"}), 404
    
    db.session.delete(session)
    db.session.commit()
    
    return jsonify({"message": "Session deleted successfully"}), 200

# Save a message to a session
@app.route('/chat-sessions/<int:session_id>/messages', methods=['POST'])
@login_required
def save_message(session_id):
    """Save a message to a specific chat session"""
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first()
    
    if not session:
        return jsonify({"error": "Session not found"}), 404
    
    data = request.get_json()
    sender = data.get('sender')
    text = data.get('text')
    
    if sender not in ['user', 'ai']:
        return jsonify({"error": "Invalid sender"}), 400
    
    if not text:
        return jsonify({"error": "Message text is required"}), 400
    
    # Create the message
    message = ChatMessage(
        session_id=session_id,
        sender=sender,
        text=text
    )
    db.session.add(message)
    
    # Update session timestamp
    session.updated_at = datetime.utcnow()
    
    # Auto-generate title from first user message if title is still "New Chat"
    if session.title == "New Chat" and sender == 'user':
        # Extract first 50 chars of the message as title
        title = text[:50].strip()
        # Remove markdown and special characters
        title = re.sub(r'[#*_\[\]()]', '', title)
        session.title = title if title else "Untitled Chat"
    
    db.session.commit()
    
    return jsonify(message.to_dict()), 201

# ------------------- Other Routes -------------------

# generate-roadmap
@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap():
    data = request.get_json()
    language = get_language_name(data)
    skills = data.get('skills', '')
    interests = data.get('interests', '')
    goals = data.get('goals', '')
    status = data.get('status', '')
    education = data.get('education', '')
    target = data.get('targetCompanies', '')

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
                return jsonify(roadmap)
            except json.JSONDecodeError:
                continue
        return jsonify({"error": "Failed to parse roadmap JSON"}), 500
    except Exception as e:
        print("Roadmap error:", e)
        return jsonify({"error": str(e)}), 500

# Chat - UPDATED VERSION WITH SESSION STORAGE
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    language = get_language_name(data)
    history = data.get('history', [])
    session_id = data.get('session_id')  # Optional session ID
    
    messages = [{'role': 'user', 'parts': [f"You are a helpful AI career coach. Respond only in {language}."]}]
    for msg in history:
        role = 'user' if msg['sender'] == 'user' else 'model'
        messages.append({'role': role, 'parts': [msg['text']]})
    
    # Get the current user message (last one)
    current_user_message = messages[-1]['parts'][0] if messages else ""
    
    try:
        chat_session = model.start_chat(history=messages[:-1])
        response = chat_session.send_message(messages[-1]['parts'][0])
        
        # If user is logged in and session_id provided, save BOTH messages
        if current_user.is_authenticated and session_id:
            try:
                session_obj = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first()
                if session_obj:
                    # Save user message first
                    user_message = ChatMessage(
                        session_id=session_id,
                        sender='user',
                        text=current_user_message
                    )
                    db.session.add(user_message)
                    
                    # Save AI response
                    ai_message = ChatMessage(
                        session_id=session_id,
                        sender='ai',
                        text=response.text
                    )
                    db.session.add(ai_message)
                    
                    session_obj.updated_at = datetime.utcnow()
                    
                    # Auto-generate title from first user message
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
        return jsonify({"error": str(e)}), 500

# Doubt Solver Chat with Session Storage
@app.route('/solve-doubt-chat', methods=['POST'])
def solve_doubt_chat():
    """Handle doubt solver chat with history support and session storage"""
    data = request.get_json()
    language = get_language_name(data)
    history = data.get('history', [])
    session_id = data.get('session_id')  # Optional session ID
    
    # Build messages for AI
    messages = [{'role': 'user', 'parts': [f"You are a helpful AI tutor that explains concepts clearly. Respond only in {language}."]}]
    for msg in history:
        role = 'user' if msg['sender'] == 'user' else 'model'
        messages.append({'role': role, 'parts': [msg['text']]})
    
    # Get the current user message (last one)
    current_user_message = messages[-1]['parts'][0] if messages else ""
    
    try:
        chat_session = model.start_chat(history=messages[:-1])
        response = chat_session.send_message(messages[-1]['parts'][0])
        
        # If user is logged in and session_id provided, save BOTH messages
        if current_user.is_authenticated and session_id:
            try:
                session_obj = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first()
                if session_obj:
                    # Save user message first
                    user_message = ChatMessage(
                        session_id=session_id,
                        sender='user',
                        text=current_user_message
                    )
                    db.session.add(user_message)
                    
                    # Save AI response
                    ai_message = ChatMessage(
                        session_id=session_id,
                        sender='ai',
                        text=response.text
                    )
                    db.session.add(ai_message)
                    
                    session_obj.updated_at = datetime.utcnow()
                    
                    # Auto-generate title from first user message
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
        return jsonify({"error": str(e)}), 500

# AI Tutor - Get Question
@app.route('/get-question', methods=['POST'])
def get_question():
    data = request.get_json()
    language_name = get_language_name(data) # Get language
    
    exam = data.get('exam', '')
    subject = data.get('subject', '')
    topic = data.get('topic', '')
    difficulty = data.get('difficulty', '')
    seen = read_history()

    prompt = f"""
    Act as an AI Tutor for Indian competitive exams.
    Generate one unique MCQ in JSON format for the following criteria:
    - Exam: {exam}
    - Subject: {subject}
    - Topic: {topic}
    - Difficulty: {difficulty}

    CRITICAL INSTRUCTION 1: The entire response, including the "question", "options", and "answer", MUST be in the {language_name} language.
    CRITICAL INSTRUCTION 2: Do NOT generate a question from this list of previously seen questions: {json.dumps(seen)}
    CRITICAL INSTRUCTION 3: Pay special attention to chemical formulas. They must be written correctly (e.g., NaCl, H₂O, CaCO₃) without any extra prefixes like 'ext'. The response 'extNaCl' is WRONG; the correct response is 'NaCl'. Use LaTeX for formatting where appropriate (e.g., $H_2O$).
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
                    return jsonify(q)
        # If we still get a duplicate, return it but don't save to history
        return jsonify(q) 
    except Exception as e:
        print("Question error:", e)
        return jsonify({"error": str(e)}), 500
    
# Solve Doubt (old endpoint - keep for backward compatibility)
@app.route('/solve-doubt', methods=['POST'])
def solve_doubt():
    data = request.get_json()
    language = get_language_name(data)
    question = data.get('question', '')
    session_id = data.get('session_id')  # Optional session ID
    
    prompt = f"Explain clearly in {language}: {question}"
    
    try:
        response = model.generate_content(prompt)
        
        # If user is logged in and session_id provided, save both messages
        if current_user.is_authenticated and session_id:
            try:
                session_obj = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first()
                if session_obj:
                    # Save user question
                    user_message = ChatMessage(
                        session_id=session_id,
                        sender='user',
                        text=question
                    )
                    db.session.add(user_message)
                    
                    # Save AI response
                    ai_message = ChatMessage(
                        session_id=session_id,
                        sender='ai',
                        text=response.text
                    )
                    db.session.add(ai_message)
                    
                    session_obj.updated_at = datetime.utcnow()
                    
                    # Auto-generate title from first question
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
        return jsonify({"error": str(e)}), 500

# Mock Test Generator
@app.route('/generate-mock-test', methods=['POST'])
def generate_mock_test():
    data = request.get_json()
    language = get_language_name(data)
    exam = data.get('exam', '')
    subject = data.get('subject', '')
    topic = data.get('topic', '')
    num_q = data.get('num_questions', 5)

    prompt = f"""
Generate {num_q} MCQs in JSON format for:
Exam: {exam}
Subject: {subject}
Topic: {topic}

Each question must have keys:
- "question"
- "options" (exactly 4)
- "answer"

Pay special attention to chemical formulas: write them correctly (e.g., NaCl, H₂O, CaCO₃), no prefixes like 'ext'.
Use LaTeX formatting where appropriate (e.g., $H_2O$).
Respond only with a JSON array.
"""

    try:
        response = model.generate_content(prompt)
        cleaned = response.text.strip().replace('```json', '').replace('```', '')
        questions = json.loads(cleaned)
        valid_questions = [q for q in questions if all(k in q for k in ["question", "options", "answer"]) and isinstance(q["options"], list) and len(q["options"]) == 4]
        if not valid_questions:
            return jsonify({"error": "No valid questions generated"}), 500
        return jsonify(valid_questions)
    except Exception as e:
        print("Mock test error:", e)
        return jsonify({"error": str(e)}), 500

# Scholarship Finder
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
        return jsonify({"error": str(e)}), 500

# ------------------- Real Scholarship Fetcher -------------------
def fetch_real_scholarships(data):
    language = get_language_name(data)
    marks = data.get("marks", "")
    income = data.get("income", "")
    region = data.get("region", "")
    destination = data.get("destination", "")
    religion = data.get("religion", "")

    prompt = f"""
    You are an expert scholarship advisor.
    Generate a JSON array of 5-10 scholarships in {language} tailored for these user inputs:
    Marks: {marks}
    Income: {income}
    Region: {region}
    Destination: {destination}
    Religion: {religion}

    Each scholarship must have keys:
      "name" - the scholarship name
      "description" - a short description
      "eligibility" - eligibility criteria
      "direct_url" - a valid URL starting with "https://"
      "search_url" - a Google search URL for the scholarship
    Make the scholarships **realistic for India**. Fictional scholarships are fine, but URLs must be valid.
    """

    try:
        for _ in range(3):
            response = model.generate_content(prompt)
            cleaned = response.text.strip().replace('```json', '').replace('```', '')
            try:
                scholarships = json.loads(cleaned)
                if isinstance(scholarships, list) and len(scholarships) > 0:
                    # Ensure URLs are valid
                    for s in scholarships:
                        if not s.get("direct_url", "").startswith("https://"):
                            s["direct_url"] = "https://example.com"
                        if not s.get("search_url", "").startswith("https://"):
                            s["search_url"] = f"https://www.google.com/search?q={s.get('name', '').replace(' ', '+')}"
                    return scholarships
            except json.JSONDecodeError:
                continue
        return []
    except Exception as e:
        print("Scholarship generation error:", e)
        return []

# --- Add this block to create tables and load users ---
with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- AUTHENTICATION ENDPOINTS ---
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email address already registered"}), 409

    # Create new user
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