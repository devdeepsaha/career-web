# --- All imports must be at the top ---
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from collections import deque
import pkg_resources
import signal

# --- Print Gemini SDK version for debugging ---
try:
    print("Gemini SDK version:", pkg_resources.get_distribution("google-generativeai").version)
except Exception as e:
    print("Could not detect google-generativeai version:", e)

# --- Load environment variables from .env file ---
load_dotenv()

# --- Create the Flask App ---
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")
if not app.secret_key:
    raise ValueError("Flask secret key not found. Please set the FLASK_SECRET_KEY environment variable.")
CORS(app)

# --- Define the path for our persistent history file ---
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
    except (json.JSONDecodeError, IOError):
        return []

def write_history(new_question):
    history = read_history()
    history_deque = deque(history, maxlen=HISTORY_LENGTH)
    history_deque.append(new_question)
    try:
        with open(HISTORY_FILE, 'w') as f:
            json.dump(list(history_deque), f)
    except IOError as e:
        print(f"Error writing to history file: {e}")

# --- Configure the Gemini API securely with your key ---
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("API Key not found.")

genai.configure(api_key=api_key)

generation_config = {
    "temperature": 0.9
}

# --- Initialize model ---
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",   # ✅ correct syntax for v1
    generation_config=generation_config
)

# --- Helper function to get language name ---
def get_language_name(data):
    language_code = data.get('language', 'en')
    language_map = {'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali'}
    return language_map.get(language_code, 'English')

# --- Timeout handler for long AI calls ---
def timeout_handler(signum, frame):
    raise TimeoutError("AI generation timed out")
signal.signal(signal.SIGALRM, timeout_handler)

# ------------------ ROUTES ------------------

@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap_endpoint():
    data = request.get_json()
    language_name = get_language_name(data)
    
    skills = data.get('skills', '')
    interests = data.get('interests', '')
    goals = data.get('goals', '')
    status = data.get('status', '')
    education = data.get('education', '')
    targetCompanies = data.get('targetCompanies', '')

    prompt = f"""
    You are an elite career counselor.
    CRITICAL INSTRUCTION: Your entire response MUST be in the {language_name} language.
    
    User Profile:
    - Highest Qualification: {education if education else 'Not specified'}
    - Current Status: {status}
    - Skills: {skills}
    - Interests: {interests}
    - Target: {targetCompanies if targetCompanies else 'Not specified'}
    - Goal: {goals}

    Instructions: Generate a detailed roadmap as a JSON array of 8-10 objects. 
    Each object must have keys: "type", "title", "description", "source", "url".
    """
    try:
        signal.alarm(110)  # 110 sec timeout
        response = model.generate_content(prompt)
        signal.alarm(0)
        cleaned_text = response.text.strip().replace('```json', '').replace('```', '')
        roadmap_steps = json.loads(cleaned_text)
        return jsonify(roadmap_steps)
    except TimeoutError as te:
        print(f"Timeout: {te}")
        return jsonify({"error": "AI generation took too long. Try again later."}), 500
    except Exception as e:
        print(f"An error occurred in roadmap generation: {e}")
        return jsonify({"error": "Failed to generate roadmap from AI."}), 500

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    data = request.get_json()
    language_name = get_language_name(data)
    
    history = data.get('history', [])
    messages_for_ai = []

    system_instruction = f"You are a helpful career coach. All your responses must be in {language_name}."
    messages_for_ai.append({'role': 'user', 'parts': [system_instruction]})
    messages_for_ai.append({'role': 'model', 'parts': ["Okay, I will respond only in " + language_name]})

    for message in history:
        role = 'user' if message['sender'] == 'user' else 'model'
        messages_for_ai.append({'role': role, 'parts': [message['text']]})
    
    if not messages_for_ai:
        return jsonify({"error": "No history provided."}), 400

    try:
        signal.alarm(110)
        chat = model.start_chat(history=messages_for_ai[:-1])
        response = chat.send_message(messages_for_ai[-1]['parts'][0])
        signal.alarm(0)
        return jsonify({"reply": response.text})
    except TimeoutError as te:
        print(f"Timeout: {te}")
        return jsonify({"error": "AI chat took too long. Try again later."}), 500
    except Exception as e:
        print(f"An error occurred in chat: {e}")
        return jsonify({"error": "Sorry, I couldn't process that message."}), 500

@app.route('/get-question', methods=['POST'])
def get_question_endpoint():
    data = request.get_json()
    language_name = get_language_name(data)
    
    exam = data.get('exam')
    subject = data.get('subject')
    topic = data.get('topic')
    difficulty = data.get('difficulty')
    seen_questions = read_history()
    
    prompt = f"""
    Act as an AI Tutor. Generate one MCQ for:
    - Exam: {exam}, Subject: {subject}, Topic: {topic}, Difficulty: {difficulty}
    
    CRITICAL: Output must be JSON with keys "question", "options" (array of 4), and "answer".
    """
    try:
        signal.alarm(110)
        for _ in range(3):
            response = model.generate_content(prompt)
            cleaned_text = response.text.strip().replace('```json', '').replace('```', '')
            question_data = json.loads(cleaned_text)
            if question_data['question'] not in seen_questions:
                write_history(question_data['question'])
                signal.alarm(0)
                return jsonify(question_data)
        signal.alarm(0)
        return jsonify(question_data)
    except TimeoutError as te:
        print(f"Timeout: {te}")
        return jsonify({"error": "AI question generation took too long. Try again later."}), 500
    except Exception as e:
        print(f"An error occurred in question generation: {e}")
        return jsonify({"error": "Failed to generate question"}), 500

@app.route('/solve-doubt', methods=['POST'])
def solve_doubt_endpoint():
    data = request.get_json()
    language_name = get_language_name(data)
    
    question = data.get('question')
    prompt = f"""
    Act as an expert AI Tutor. A student has the following doubt: "{question}"
    Provide a clear, step-by-step explanation in {language_name}.
    """
    try:
        signal.alarm(110)
        response = model.generate_content(prompt)
        signal.alarm(0)
        return jsonify({"explanation": response.text})
    except TimeoutError as te:
        print(f"Timeout: {te}")
        return jsonify({"error": "AI explanation took too long. Try again later."}), 500
    except Exception as e:
        print(f"An error occurred in doubt solving: {e}")
        return jsonify({"error": "Sorry, I couldn't process that question."}), 500

@app.route('/generate-mock-test', methods=['POST'])
def generate_mock_test_endpoint():
    data = request.get_json()
    language_name = get_language_name(data)
    
    exam = data.get('exam')
    subject = data.get('subject')
    topic = data.get('topic')
    num_questions = data.get('num_questions', 5)

    prompt = f"""
    Generate {num_questions} MCQs for {exam}, {subject}, {topic}.
    Output JSON with keys: "question", "options" (4 items), "answer".
    """
    try:
        signal.alarm(110)
        response = model.generate_content(prompt)
        signal.alarm(0)
        cleaned_text = response.text.strip().replace('```json', '').replace('```', '')
        questions = json.loads(cleaned_text)
        return jsonify(questions)
    except TimeoutError as te:
        print(f"Timeout: {te}")
        return jsonify({"error": "AI mock test generation took too long. Try again later."}), 500
    except Exception as e:
        print(f"An error occurred in mock test generation: {e}")
        return jsonify({"error": "Failed to generate mock test"}), 500

# --- Run the Flask server on Render ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
