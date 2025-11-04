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
    
    # Relationship to chat sessions
    chat_sessions = db.relationship('ChatSession', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class ChatSession(db.Model):
    __tablename__ = "chat_session"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    chat_type = db.Column(db.String(50), nullable=False)  # 'career_planner' or 'doubt_solver'
    title = db.Column(db.String(200), nullable=True)  # Auto-generated from first message
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to messages
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

# This is a test for automatic deployment
class ChatMessage(db.Model):
    __tablename__ = "chat_message"
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_session.id'), nullable=False)
    sender = db.Column(db.String(10), nullable=False)  # 'user' or 'ai'
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'sender': self.sender,
            'text': self.text,
            'created_at': self.created_at.isoformat()
        }