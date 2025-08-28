# --- All imports must be at the top ---
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

# --- Load environment variables from .env file ---
load_dotenv()

# --- Create the Flask App ---
app = Flask(__name__)
CORS(app)

# --- Configure the Gemini API securely with your key ---
# This safely gets your key from the .env file
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("API Key not found. Please set the GOOGLE_API_KEY environment variable.")
genai.configure(api_key=api_key)

# --- Use the latest recommended model ---
model = genai.GenerativeModel('gemini-1.5-flash-latest')


@app.route('/generate-roadmap', methods=['POST'])
def generate_roadmap_endpoint():
    data = request.get_json()
    # Get all the new, flexible data from the frontend
    skills = data.get('skills', '')
    interests = data.get('interests', '')
    goals = data.get('goals', '')
    status = data.get('status', '')
    education = data.get('education', '')
    targetCompanies = data.get('targetCompanies', '')

    # This is the final, highly adaptive prompt
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
        if "json.decoder.JSONDecodeError" in str(e):
             return jsonify({"error": "AI response was not in valid JSON format."}), 500
        return jsonify({"error": "Failed to generate content from AI."}), 500


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


@app.route('/get-question', methods=['POST'])
def get_question_endpoint():
    data = request.get_json()
    exam = data.get('exam')
    subject = data.get('subject')
    topic = data.get('topic')
    difficulty = data.get('difficulty')
    prompt = f"""
    Act as an AI Tutor for Indian competitive exams.
    Generate one multiple-choice question (MCQ) for the following criteria:
    - Exam: {exam}
    - Subject: {subject}
    - Topic: {topic}
    - Difficulty: {difficulty}
    Return the response ONLY as a single valid JSON object with three keys: "question", "options" (an array of 4 strings), and "answer".
    """
    try:
        response = model.generate_content(prompt)
        cleaned_text = response.text.strip().replace('```json', '').replace('```', '')
        question_data = json.loads(cleaned_text)
        return jsonify(question_data)
    except Exception as e:
        print(f"An error occurred in question generation: {e}")
        return jsonify({"error": "Failed to generate question"}), 500


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
    prompt = f"""
    Act as an AI question paper generator for Indian competitive exams.
    Generate a short mock test with 5 multiple-choice questions (MCQs) for the following exam and subject:
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
        return jsonify({"score": 0, "accuracy": 0, "analysis": "No questions provided for analysis."})

    correct_answers = 0
    for i, q in enumerate(questions):
        if str(i) in user_answers and user_answers[str(i)] == q['answer']:
            correct_answers += 1
    
    score = int((correct_answers / len(questions)) * 100)
    accuracy = score

    prompt = f"""
    Act as an AI performance analyst for a student who just completed a mock test.
    The student's score was {score}%.
    Here are the questions and the student's answers (if they answered):
    {json.dumps({'questions': questions, 'user_answers': user_answers}, indent=2)}

    Provide a brief, encouraging analysis of the student's performance. 
    Identify 1-2 potential weak areas and 1-2 strong areas based on the questions they got wrong or right.
    Suggest a simple, actionable tip for improvement.
    Use Markdown for formatting, like **bolding key terms**.
    """
    try:
        response = model.generate_content(prompt)
        analysis_text = response.text
        return jsonify({"score": score, "accuracy": accuracy, "analysis": analysis_text})
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
    Act as a scholarship advisor for students. A student has the following profile:
    - Academic Marks: {marks}
    - Annual Family Income (in INR): {income}
    - Student's Home Region: {region}
    - Student's Religion: {religion}
    - Desired Study Destination: {destination}

    Based on this profile, find 3-4 relevant scholarships. For each scholarship, provide its name, a brief description, key eligibility criteria, and a direct, clean, and valid URL to the application or information page. The URL string must not contain any extra text, notes, or parentheses. It must be a direct link.

    Return the response ONLY as a valid JSON array of objects.
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