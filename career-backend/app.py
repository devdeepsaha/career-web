# --- All imports must be at the top ---
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from collections import deque # Using deque for efficient list management

# --- Load environment variables from .env file ---
load_dotenv()

# --- Create the Flask App ---
app = Flask(__name__)
# A secret key is still good practice, but not used for question history anymore
app.secret_key = os.getenv("FLASK_SECRET_KEY")
if not app.secret_key:
    raise ValueError("Flask secret key not found. Please set the FLASK_SECRET_KEY environment variable.")
CORS(app)

# --- NEW: Define the path for our persistent history file ---
HISTORY_FILE = 'question_history.json'
HISTORY_LENGTH = 40

# --- NEW: Function to read history from the file ---
def read_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, 'r') as f:
            # Handle empty file case
            content = f.read()
            if not content:
                return []
            return json.loads(content)
    except (json.JSONDecodeError, IOError):
        return []

# --- NEW: Function to write history to the file ---
def write_history(new_question):
    history = read_history()
    # Use a deque to easily manage the fixed length
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
    raise ValueError("API Key not found. Please set the GOOGLE_API_KEY environment variable.")
genai.configure(api_key=api_key)

# --- Define a generation config to increase creativity and reduce repetition ---
generation_config = genai.types.GenerationConfig(
    temperature=0.9 # High temperature for more variety
)

# --- Use the latest recommended model with the config ---
model = genai.GenerativeModel(
    'gemini-1.5-flash-latest',
    generation_config=generation_config
)


@app.route('/get-question', methods=['POST'])
def get_question_endpoint():
    data = request.get_json()
    exam = data.get('exam')
    subject = data.get('subject')
    topic = data.get('topic')
    difficulty = data.get('difficulty')
    
    # --- MODIFIED: Read the persistent history from the file ---
    seen_questions = read_history()
    
    # --- Add Negative Constraints for Generic Topics ---
    extra_instructions = ""
    if subject.lower() == 'gk':
        extra_instructions = "IMPORTANT: Avoid overly common GK topics. Do not ask about country capitals, the inventor of the telephone, the Taj Mahal, or Mahatma Gandhi. Ask about lesser-known facts in science, Indian culture, or world geography."

    prompt = f"""
    Act as an AI Tutor for Indian competitive exams.
    Generate one multiple-choice question (MCQ) for the following criteria:
    - Exam: {exam}
    - Subject: {subject}
    - Topic: {topic}
    - Difficulty: {difficulty}

    {extra_instructions}

    CRITICAL INSTRUCTION: Do NOT generate a question that is the same as any of these recently asked questions:
    {json.dumps(seen_questions)}

    Return the response ONLY as a single valid JSON object with three keys: "question", "options" (an array of 4 strings), and "answer".
    """
    try:
        # Regeneration loop to ensure uniqueness
        for _ in range(3): 
            response = model.generate_content(prompt)
            cleaned_text = response.text.strip().replace('```json', '').replace('```', '')
            question_data = json.loads(cleaned_text)
            
            if question_data['question'] not in seen_questions:
                # --- MODIFIED: Write the new question to the persistent file ---
                write_history(question_data['question'])
                return jsonify(question_data)
        
        # If still a duplicate, return it but don't save it to the history
        return jsonify(question_data)

    except Exception as e:
        print(f"An error occurred in question generation: {e}")
        return jsonify({"error": "Failed to generate question"}), 500


# (The rest of your endpoints remain unchanged)
@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap_endpoint():
    data = request.get_json()
    skills = data.get('skills', '')
    interests = data.get('interests', '')
    goals = data.get('goals', '')
    status = data.get('status', '')
    education = data.get('education', '')
    targetCompanies = data.get('targetCompanies', '')

    prompt = f"""
    You are an elite career counselor for students in India from all fields (engineering, medical, arts, commerce, etc.). Your task is to generate a hyper-detailed, actionable roadmap based on the user's profile.

    **User Profile:**
    - **Highest Qualification:** {education if education else 'Not specified'}
    - **Current Status:** {status}
    - **Current Skills:** {skills}
    - **Interests:** {interests}
    - **Target Companies/Institutes:** {targetCompanies if targetCompanies else 'Not specified'}
    - **Ultimate Goal:** {goals}

    **Your Response MUST follow these strict instructions:**
    1.  **Analyze the Goal:** First, understand the user's goal. Is it in tech, medicine, civil services, arts, etc.? All your advice must be tailored to this specific goal.
    2.  **Structure:** The output must be a JSON array of 8-10 step objects.
    3.  **Step Object:** Each step object must have these keys: `type`, `title`, `description`, `source`, and `url`.
    4.  **Adaptive Exam Suggestions (Crucial):**
        -   If the goal is **engineering/tech** (e.g., "Software Engineer," "VLSI designer") and the user is in B.Tech, suggest the **GATE exam** for M.Tech.
        -   If the goal is **medical** (e.g., "Doctor," "Surgeon") and the user has an MBBS, suggest the **NEET-PG exam**.
        -   If the goal is **civil services** (e.g., "IAS Officer"), suggest the **UPSC Civil Services Exam (CSE)**.
        -   If the goal is **academia/research** (e.g., "Professor"), suggest the **UGC-NET or CSIR-NET exams**.
        -   If the user is in **Class 12th**, suggest relevant entrance exams for their goal (e.g., **JEE** for engineering, **NEET** for medical, **CUET** for arts/commerce).
    5.  **Tailor All Steps:** All other steps (`skill`, `project`, `internship`, `networking`) must be directly relevant to the user's unique goal. A project for an aspiring doctor is different from one for a future historian.
    6.  **Provide a Final `interview_prep` Step:** This step should detail preparation for the specific selection process of the user's goal (e.g., technical interviews for tech, viva/personality tests for UPSC, clinical rounds for medical post-graduation).

    Generate the JSON array based on these adaptive rules.
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
    history = data.get('history', [])
    messages_for_ai = []
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


@app.route('/solve-doubt', methods=['POST'])
def solve_doubt_endpoint():
    data = request.get_json()
    question = data.get('question')
    prompt = f"""
    Act as an expert AI Tutor for students in India preparing for exams like JEE and NEET.
    A student has the following doubt: "{question}"
    Provide a clear, step-by-step explanation to solve the doubt.
    Use simple language. Use Markdown for formatting, like **bolding key terms** and using * for list items.
    Keep the explanation concise and focused on the core concept.
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
    exam = data.get('exam')
    subject = data.get('subject')
    num_questions = data.get('num_questions', 5)
    prompt = f"""
    Act as an AI question paper generator for Indian competitive exams.
    Generate a mock test with {num_questions} multiple-choice questions (MCQs) for the following exam and subject:
    - Exam: {exam}
    - Subject: {subject}
    
    Ensure the questions cover a range of important topics within the subject and have varying difficulty.
    Return the response ONLY as a valid JSON array of objects. Each object must have three keys: "question", "options" (an array of 4 strings), and "answer".
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
            "question": q['question'],
            "options": q['options'],
            "correct_answer": q['answer'],
            "user_answer": user_answer,
            "is_correct": is_correct
        })
    
    # Handle division by zero if there are no questions
    score = 0
    if len(questions) > 0:
        score = int((correct_answers / len(questions)) * 100)
    
    incorrect_answers = len(questions) - correct_answers

    prompt = f"""
    Act as an AI performance analyst. A student scored {score}%. They got {correct_answers} correct and {incorrect_answers} incorrect.
    Based on the detailed results: {json.dumps(detailed_results, indent=2)}

    Provide a brief, encouraging analysis. Identify the student's key strong and weak areas based on the topics of the questions they got right versus wrong.
    Give one actionable tip for improvement. Use Markdown for formatting.
    """
    try:
        response = model.generate_content(prompt)
        analysis_text = response.text
        return jsonify({
            "score": score,
            "accuracy": score,
            "analysis": analysis_text,
            "total_questions": len(questions),
            "correct_answers": correct_answers,
            "incorrect_answers": incorrect_answers,
            "detailed_results": detailed_results
        })
    except Exception as e:
        print(f"An error occurred in performance analysis: {e}")
        return jsonify({"error": "Failed to analyze performance"}), 500


@app.route('/find-scholarships', methods=['POST'])
def find_scholarships_endpoint():
    data = request.get_json()
    marks = data.get('marks')
    income = data.get('income')
    region = data.get('region')
    destination = data.get('destination')
    religion = data.get('religion')

    prompt = f"""
    Act as a scholarship advisor for students in India. A student has the following profile:
    - Academic Marks: {marks}
    - Annual Family Income (in INR): {income}
    - Student's Home Region: {region}
    - Desired Study Destination: {destination}

    Based on this profile, find 3-4 relevant scholarships.
    
    **Your Response MUST follow these strict instructions:**
    1.  The output must be a valid JSON array of objects.
    2.  Each object must represent a single scholarship and have the following keys: "name", "description", "eligibility", "direct_url", and "search_url".
    3.  For the "direct_url" key, provide the most accurate and official URL you know for the scholarship.
    4.  For the "search_url" key, you MUST provide a formatted Google search URL for the scholarship's name. The format should be: "https://www.google.com/search?q=YOUR+SCHOLARSHIP+NAME+scholarship". Replace spaces in the name with plus signs (+). THIS IS A RELIABLE BACKUP for the user.
    
    Example for "PM Scholarship Scheme":
    "search_url": "https://www.google.com/search?q=PM+Scholarship+Scheme+scholarship"

    Return ONLY the JSON array.
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