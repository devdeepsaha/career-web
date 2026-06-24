# models.py
from extensions import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(UserMixin, db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.Text)
    
    # Email confirmation field (required by database)
    confirmed = db.Column(db.Boolean, default=True, nullable=False)
    confirmed_on = db.Column(db.DateTime, nullable=True)
    
    # Google OAuth field
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    
    # Relationship to chat sessions
    chat_sessions = db.relationship('ChatSession', backref='user', lazy=True, cascade='all, delete-orphan')
    student_profiles = db.relationship('StudentProfile', backref='user', lazy=True, cascade='all, delete-orphan')
    roadmaps = db.relationship('Roadmap', backref='user', lazy=True, cascade='all, delete-orphan')
    saved_questions = db.relationship('SavedQuestion', backref='user', lazy=True, cascade='all, delete-orphan')
    question_attempts = db.relationship('QuestionAttempt', backref='user', lazy=True, cascade='all, delete-orphan')
    mock_tests = db.relationship('MockTest', backref='user', lazy=True, cascade='all, delete-orphan')
    saved_scholarships = db.relationship('SavedScholarship', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)


class ChatSession(db.Model):
    __tablename__ = "chat_session"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    chat_type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    messages = db.relationship('ChatMessage', backref='session', lazy=True, cascade='all, delete-orphan', order_by='ChatMessage.created_at')

    def to_dict(self):
        return {
            'id': self.id,
            'chat_type': self.chat_type,
            'title': self.title or 'New Chat',
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'message_count': len(self.messages)
        }


class ChatMessage(db.Model):
    __tablename__ = "chat_message"
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_session.id'), nullable=False)
    sender = db.Column(db.String(10), nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'sender': self.sender,
            'text': self.text,
            'created_at': self.created_at.isoformat()
        }


class StudentProfile(db.Model):
    __tablename__ = "student_profile"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(100), nullable=True)
    education = db.Column(db.String(200), nullable=True)
    skills = db.Column(db.Text, nullable=True)
    interests = db.Column(db.Text, nullable=True)
    goals = db.Column(db.Text, nullable=True)
    target_companies = db.Column(db.Text, nullable=True)
    target_exams = db.Column(db.Text, nullable=True)
    preferred_language = db.Column(db.String(20), default='en')
    student_type = db.Column(db.String(80), nullable=True)
    course_stream = db.Column(db.String(160), nullable=True)
    institution_name = db.Column(db.String(220), nullable=True)
    study_level = db.Column(db.String(120), nullable=True)
    gender = db.Column(db.String(60), nullable=True)
    caste_category = db.Column(db.String(80), nullable=True)
    disability_status = db.Column(db.String(80), nullable=True)
    scholarship_marks = db.Column(db.String(40), nullable=True)
    religion = db.Column(db.String(120), nullable=True)
    annual_family_income = db.Column(db.Numeric, nullable=True)
    region = db.Column(db.String(160), nullable=True)
    study_destination = db.Column(db.String(160), nullable=True)
    documents_json = db.Column(db.JSON, nullable=True, default=dict)
    scholarship_preferences_json = db.Column(db.JSON, nullable=True, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'status': self.status,
            'education': self.education,
            'skills': self.skills,
            'interests': self.interests,
            'goals': self.goals,
            'target_companies': self.target_companies,
            'target_exams': self.target_exams,
            'preferred_language': self.preferred_language,
            'student_type': self.student_type,
            'course_stream': self.course_stream,
            'institution_name': self.institution_name,
            'study_level': self.study_level,
            'gender': self.gender,
            'caste_category': self.caste_category,
            'disability_status': self.disability_status,
            'scholarship_marks': self.scholarship_marks,
            'religion': self.religion,
            'annual_family_income': float(self.annual_family_income) if self.annual_family_income is not None else None,
            'region': self.region,
            'study_destination': self.study_destination,
            'documents_json': self.documents_json or {},
            'scholarship_preferences_json': self.scholarship_preferences_json or {},
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class Roadmap(db.Model):
    __tablename__ = "roadmap"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    input_profile = db.Column(db.JSON, nullable=True)
    roadmap_json = db.Column(db.JSON, nullable=False)
    status = db.Column(db.String(40), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_json=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'status': self.status,
            'input_profile': self.input_profile,
            'step_count': len(self.roadmap_json or []),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_json:
            data['roadmap_json'] = self.roadmap_json
        return data


class SavedQuestion(db.Model):
    __tablename__ = "saved_question"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    options_json = db.Column(db.JSON, nullable=True)
    correct_answer = db.Column(db.Text, nullable=True)
    explanation = db.Column(db.Text, nullable=True)
    exam = db.Column(db.String(120), nullable=True)
    subject = db.Column(db.String(120), nullable=True)
    topic = db.Column(db.String(120), nullable=True)
    difficulty = db.Column(db.String(60), nullable=True)
    source = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'question_text': self.question_text,
            'options_json': self.options_json,
            'correct_answer': self.correct_answer,
            'explanation': self.explanation,
            'exam': self.exam,
            'subject': self.subject,
            'topic': self.topic,
            'difficulty': self.difficulty,
            'source': self.source,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class QuestionAttempt(db.Model):
    __tablename__ = "question_attempt"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    saved_question_id = db.Column(db.Integer, db.ForeignKey('saved_question.id'), nullable=True)
    question_text = db.Column(db.Text, nullable=False)
    selected_answer = db.Column(db.Text, nullable=True)
    correct_answer = db.Column(db.Text, nullable=True)
    is_correct = db.Column(db.Boolean, nullable=True)
    time_taken_seconds = db.Column(db.Integer, nullable=True)
    exam = db.Column(db.String(120), nullable=True)
    subject = db.Column(db.String(120), nullable=True)
    topic = db.Column(db.String(120), nullable=True)
    difficulty = db.Column(db.String(60), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'saved_question_id': self.saved_question_id,
            'question_text': self.question_text,
            'selected_answer': self.selected_answer,
            'correct_answer': self.correct_answer,
            'is_correct': self.is_correct,
            'time_taken_seconds': self.time_taken_seconds,
            'exam': self.exam,
            'subject': self.subject,
            'topic': self.topic,
            'difficulty': self.difficulty,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class MockTest(db.Model):
    __tablename__ = "mock_test"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    exam = db.Column(db.String(120), nullable=True)
    subject = db.Column(db.String(120), nullable=True)
    topic = db.Column(db.String(120), nullable=True)
    difficulty = db.Column(db.String(60), nullable=True)
    total_questions = db.Column(db.Integer, nullable=True)
    correct_answers = db.Column(db.Integer, nullable=True)
    incorrect_answers = db.Column(db.Integer, nullable=True)
    score = db.Column(db.Numeric, nullable=True)
    questions_json = db.Column(db.JSON, nullable=True)
    answers_json = db.Column(db.JSON, nullable=True)
    analysis_json = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, include_payload=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'exam': self.exam,
            'subject': self.subject,
            'topic': self.topic,
            'difficulty': self.difficulty,
            'total_questions': self.total_questions,
            'correct_answers': self.correct_answers,
            'incorrect_answers': self.incorrect_answers,
            'score': float(self.score) if self.score is not None else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_payload:
            data.update({
                'questions_json': self.questions_json,
                'answers_json': self.answers_json,
                'analysis_json': self.analysis_json,
            })
        return data


class SavedScholarship(db.Model):
    __tablename__ = "saved_scholarship"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    scholarship_json = db.Column(db.JSON, nullable=False)
    deadline = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(40), default='saved')
    match_score = db.Column(db.Integer, nullable=True)
    amount = db.Column(db.String(160), nullable=True)
    application_status = db.Column(db.String(80), nullable=True)
    documents_required_json = db.Column(db.JSON, nullable=True, default=list)
    missing_documents_json = db.Column(db.JSON, nullable=True, default=list)
    eligibility_snapshot_json = db.Column(db.JSON, nullable=True, default=dict)
    reminder_enabled = db.Column(db.Boolean, nullable=False, default=False)
    reminder_date = db.Column(db.Date, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    official_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'scholarship_json': self.scholarship_json,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'status': self.status,
            'match_score': self.match_score,
            'amount': self.amount,
            'application_status': self.application_status,
            'documents_required_json': self.documents_required_json or [],
            'missing_documents_json': self.missing_documents_json or [],
            'eligibility_snapshot_json': self.eligibility_snapshot_json or {},
            'reminder_enabled': self.reminder_enabled,
            'reminder_date': self.reminder_date.isoformat() if self.reminder_date else None,
            'notes': self.notes,
            'official_url': self.official_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
