# --- All imports must be at the top ---
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from collections import deque

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

# --- Define a generation config to increase creativity ---
generation_config = genai.types.GenerationConfig(
    temperature=0.9
)

# --- Use the latest recommended model with the config ---
model = genai.GenerativeModel(
    'gemini-pro',
    generation_config=generation_config
)

# --- Helper function to get language name ---
def get_language_name(data):
    language_code = data.get('language', 'en')
    language_map = {'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali'}
    return language_map.get(language_code, 'English')


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

    Instructions: Generate a detailed roadmap as a JSON array of 8-10 objects. Each object must have keys: "type", "title", "description", "source", "url". The steps must be tailored to the user's profile and goal, especially for Indian competitive exams like GATE, NEET-PG, UPSC, NET, JEE, etc. Include a final "interview_prep" step.
    """
    try:
        response = model.generate_content(prompt)
        cleaned_text = response.text.strip().replace('```json', '').replace('```', '')
        roadmap_steps = json.loads(cleaned_text)
        return jsonify(roadmap_steps)
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

    chat_history = messages_for_ai[:-1]
    last_user_message = messages_for_ai[-1]['parts'][0]
    try:
        chat = model.start_chat(history=chat_history)
        response = chat.send_message(last_user_message)
        return jsonify({"reply": response.text})
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
    
    extra_instructions = ""
    if subject.lower() == 'gk':
        extra_instructions = "IMPORTANT: Avoid overly common GK topics. Do not ask about country capitals or the Taj Mahal. Ask about lesser-known facts."

    prompt = f"""
    Act as an AI Tutor. Generate one MCQ for:
    - Exam: {exam}, Subject: {subject}, Topic: {topic}, Difficulty: {difficulty}
    
    {extra_instructions}

    CRITICAL INSTRUCTION 1: Before finalizing the output, you must double-check the question to ensure it is factually correct and that the provided 'answer' is unambiguously the correct option among the 'options'.
    CRITICAL INSTRUCTION 2: The entire response (question, options, answer) MUST be in the {language_name} language.
    CRITICAL INSTRUCTION 3: Do NOT generate a question from this list: {json.dumps(seen_questions)}
    
    Return ONLY a single valid JSON object with keys: "question", "options" (an array of 4 strings), and "answer".
    """
    try:
        for _ in range(3):
            response = model.generate_content(prompt)
            cleaned_text = response.text.strip().replace('```json', '').replace('```', '')
            question_data = json.loads(cleaned_text)
            if question_data['question'] not in seen_questions:
                write_history(question_data['question'])
                return jsonify(question_data)
        return jsonify(question_data)
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
    
    CRITICAL INSTRUCTION: Provide a clear, step-by-step explanation in the {language_name} language.
    Use simple language and Markdown for formatting.
    """
    try:
        response = model.generate_content(prompt)
        return jsonify({"explanation": response.text})
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
    difficulty = data.get('difficulty', 'All')
    num_questions = data.get('num_questions', 5)

    if difficulty.lower() == 'all':
        difficulty_instruction = "Ensure the questions have a mix of easy, medium, and hard difficulty."
    else:
        difficulty_instruction = f"Ensure all questions are of {difficulty} difficulty."

    prompt = f"""
    Act as an AI question paper generator for Indian competitive exams.
    Generate a mock test with {num_questions} multiple-choice questions (MCQs) for the following criteria:
    - Exam: {exam}
    - Subject: {subject}
    - Topic: {topic}
    
    {difficulty_instruction}
    
    CRITICAL INSTRUCTION 1: Before finalizing the output, you must double-check every question to ensure it is factually correct and that the provided 'answer' is unambiguously the correct option among the 'options'. If a question is subjective or has no clear correct answer, discard it and generate a new one.
    
    CRITICAL INSTRUCTION 2: The entire response (all questions, options, answers) MUST be in the {language_name} language.
    
    Return ONLY a valid JSON array of objects. Each object must have three keys: "question", "options" (an array of 4 strings), and "answer".
    """
    try:
        response = model.generate_content(prompt)
        cleaned_text = response.text.strip().replace('```json', '').replace('```', '')
        questions = json.loads(cleaned_text)
        return jsonify(questions)
    except Exception as e:
        print(f"An error occurred in mock test generation: {e}")
        return jsonify({"error": "Failed to generate mock test"}), 500


@app.route('/analyze-performance', methods=['POST'])
def analyze_performance_endpoint():
    data = request.get_json()
    language_name = get_language_name(data)

    questions = data.get('questions', [])
    user_answers = data.get('userAnswers', {})
    
    if not questions:
        return jsonify({"error": "No questions provided for analysis."}), 400

    correct_answers = 0
    detailed_results = []
    for i, q in enumerate(questions):
        user_answer = user_answers.get(str(i))
        is_correct = (user_answer == q['answer'])
        if is_correct:
            correct_answers += 1
        detailed_results.append({
            "question": q['question'], "options": q['options'], "correct_answer": q['answer'],
            "user_answer": user_answer, "is_correct": is_correct
        })
    
    score = 0
    if len(questions) > 0:
        score = int((correct_answers / len(questions)) * 100)
    incorrect_answers = len(questions) - correct_answers

    prompt = f"""
    Act as an AI performance analyst. A student scored {score}%.
    Detailed results: {json.dumps(detailed_results, indent=2)}
    
    CRITICAL INSTRUCTION: Provide a brief, encouraging analysis in the {language_name} language. Identify strong/weak areas and give one actionable tip. Use Markdown.
    """
    try:
        response = model.generate_content(prompt)
        analysis_text = response.text
        return jsonify({
            "score": score, "accuracy": score, "analysis": analysis_text,
            "total_questions": len(questions), "correct_answers": correct_answers,
            "incorrect_answers": incorrect_answers, "detailed_results": detailed_results
        })
    except Exception as e:
        print(f"An error occurred in performance analysis: {e}")
        return jsonify({"error": "Failed to analyze performance"}), 500


@app.route('/find-scholarships', methods=['POST'])
def find_scholarships_endpoint():
    data = request.get_json()
    language_name = get_language_name(data)
    
    marks = data.get('marks')
    income = data.get('income')
    region = data.get('region')
    destination = data.get('destination')
    
    prompt = f"""
    Act as a scholarship advisor. A student has this profile:
    - Marks: {marks}, Income (INR): {income}, Region: {region}, Destination: {destination}

    Find 3-4 relevant scholarships.
    
    CRITICAL INSTRUCTION: The entire response (names, descriptions, eligibility) MUST be in the {language_name} language.
    
    Return ONLY a valid JSON array of objects. Each object must have keys: "name", "description", "eligibility", "direct_url", "search_url".
    For "search_url", create a Google search link for the scholarship name.
    """
    try:
        response = model.generate_content(prompt)
        cleaned_text = response.text.strip().replace('```json', '').replace('```', '')
        scholarships = json.loads(cleaned_text)
        return jsonify(scholarships)
    except Exception as e:
        print(f"An error occurred in scholarship finding: {e}")
        return jsonify({"error": "Failed to find scholarships"}), 500


# --- Code to run the server ---
if __name__ == '__main__':
    app.run(debug=True, port=5001)