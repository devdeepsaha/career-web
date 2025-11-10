from flask import Blueprint, redirect, url_for, jsonify, session
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer.storage import MemoryStorage
from flask_login import login_user, logout_user
import os
from extensions import db
from models import User

# -------------------------------
# Blueprint setup
# -------------------------------
auth_bp = Blueprint("auth", __name__)

# Google OAuth blueprint
google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=[
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ],
    redirect_url="/auth/google/callback",
    offline=True,
)

# Force fresh consent each time
google_bp.authorization_url_params["access_type"] = "offline"
google_bp.authorization_url_params["prompt"] = "consent"
google_bp.storage = MemoryStorage()

# -------------------------------
# Trigger Google login
# -------------------------------
@auth_bp.route("/google/login")
def google_login():
    # CRITICAL FIX 1: Clear any existing session before OAuth
    session.clear()
    logout_user()
    
    # CRITICAL FIX 2: Force new authorization
    if google.authorized:
        # Delete the existing token to force re-auth
        del google_bp.token
    
    return redirect(url_for("google.login"))

# -------------------------------
# Callback route
# -------------------------------
@auth_bp.route("/google/callback")
def google_callback():
    # CRITICAL FIX 3: Verify OAuth is actually authorized
    if not google.authorized:
        return jsonify({"error": "Authorization failed"}), 401

    try:
        # CRITICAL FIX 4: Fetch user info fresh from Google
        resp = google.get("/oauth2/v2/userinfo")
        if not resp.ok:
            return jsonify({"error": "Failed to fetch user info from Google"}), 400

        info = resp.json()
        email = info.get("email")
        google_id = info.get("id")  # NEW: Get Google's unique user ID
        
        if not email or not google_id:
            return jsonify({"error": "No email or ID found in Google response"}), 400

        # CRITICAL FIX 5: Use Google ID as primary identifier, not just email
        user = User.query.filter_by(google_id=google_id).first()
        
        if not user:
            # Check if email exists (for users who signed up with email/password)
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                # Link Google account to existing email account
                existing_user.google_id = google_id
                user = existing_user
            else:
                # Create new user
                user = User(
                    email=email,
                    google_id=google_id
                )
                user.set_password(os.urandom(16).hex())
                db.session.add(user)
            
            db.session.commit()

        # CRITICAL FIX 6: Clear session before login
        session.clear()
        
        # Log in the correct user
        login_user(user, remember=True, force=True)
        
        # CRITICAL FIX 7: Clear OAuth token after successful login
        if google.authorized:
            del google_bp.token

    except Exception as e:
        print(f"OAuth callback error: {e}")
        return jsonify({"error": "Authentication failed"}), 500

    # Redirect to frontend
    frontend_url = (
        "https://pothoprodorshok.onrender.com"
        if os.getenv("FLASK_ENV") == "production"
        else "http://localhost:5173"
    )

    return redirect(frontend_url)