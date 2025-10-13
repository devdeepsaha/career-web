# ------------------- Imports -------------------
from flask import Flask, request, jsonify,session
from flask_cors import CORS
import google.generativeai as genai
import json, os
from dotenv import load_dotenv
from collections import deque
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db, login_manager

# ------------------- Load Env -------------------
load_dotenv()

# ------------------- Flask App -------------------
app = Flask(__name__)
# --- Add this block right after app = Flask(__name__) ---
app.secret_key = os.getenv("FLASK_SECRET_KEY")
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Initialize Extensions ---
db.init_app(app)
login_manager.init_app(app)
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "https://pothoprodorshok.onrender.com"]) 


if not app.secret_key:
    raise ValueError("FLASK_SECRET_KEY missing")
# --- Register blueprint AFTER app is created ---
from auth import auth_bp,google_bp
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(google_bp, url_prefix="/auth/google")  # Register Google OAuth blueprint

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

# Chat
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    language = get_language_name(data)
    history = data.get('history', [])
    messages = [{'role': 'user', 'parts': [f"You are a helpful AI career coach. Respond only in {language}."]}]
    for msg in history:
        role = 'user' if msg['sender'] == 'user' else 'model'
        messages.append({'role': role, 'parts': [msg['text']]})
    try:
        chat_session = model.start_chat(history=messages[:-1])
        response = chat_session.send_message(messages[-1]['parts'][0])
        return jsonify({"reply": response.text})
    except Exception as e:
        print("Chat error:", e)
        return jsonify({"error": str(e)}), 500

# AI Tutor - Get Question
# In app.py

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
    
# Solve Doubt
@app.route('/solve-doubt', methods=['POST'])
def solve_doubt():
    data = request.get_json()
    language = get_language_name(data)
    question = data.get('question', '')
    prompt = f"Explain clearly in {language}: {question}"
    try:
        response = model.generate_content(prompt)
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
    
# --- Add this User Model ---
class User(UserMixin, db.Model):
    __tablename__ = 'user'
    __table_args__ = {'extend_existing': True}  # <-- ADD THIS
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.Text)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
# --- Add this block to create tables and load users ---
with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- NEW AUTHENTICATION ENDPOINTS ---
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
    return jsonify({"message": "Signup successful", "user": {"id": new_user.id, "email": new_user.email}}), 201

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

