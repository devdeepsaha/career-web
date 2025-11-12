from flask import Blueprint, redirect, url_for, jsonify, session, request
from flask_dance.contrib.google import make_google_blueprint, google
from flask_login import login_user, logout_user, current_user
import os
import logging
from datetime import datetime
from extensions import db
from models import User

# Set up logging
logger = logging.getLogger(__name__)

# -------------------------------
# Blueprint setup
# -------------------------------
auth_bp = Blueprint("auth", __name__)

def get_frontend_url():
    """Get the correct frontend URL based on environment"""
    if os.getenv("FLASK_ENV") == "production":
        return "https://pothoprodorshok.onrender.com"
    else:
        return "http://localhost:5173"

# Google OAuth blueprint - FIXED VERSION
google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=[
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ],
    redirect_url="/auth/google/callback",
    offline=False,
    reprompt_consent=False,
)

# -------------------------------
# Trigger Google login
# -------------------------------
@auth_bp.route("/google/login")
def google_login():
    logger.info("🔵 Starting Google login flow...")
    
    # Clear any existing session data
    session.clear()
    
    if current_user.is_authenticated:
        logout_user()
        logger.info("✅ Logged out existing user")
    
    logger.info("🔵 Redirecting to Google OAuth...")
    return redirect(url_for("google.login"))

# -------------------------------
# OAuth callback handler
# -------------------------------
@auth_bp.route("/google/callback")
def google_callback():
    frontend_url = get_frontend_url()
    logger.info(f"🔵 OAuth callback triggered")
    logger.info(f"🔵 Frontend URL: {frontend_url}")
    logger.info(f"🔵 Google authorized: {google.authorized}")
    logger.info(f"🔵 Session keys: {list(session.keys())}")
    
    # Check if OAuth was successful
    if not google.authorized:
        logger.error("❌ Google OAuth not authorized")
        error_msg = request.args.get('error', 'oauth_failed')
        error_description = request.args.get('error_description', '')
        logger.error(f"❌ Error: {error_msg}")
        logger.error(f"❌ Description: {error_description}")
        return redirect(f"{frontend_url}?error=oauth_failed")

    try:
        # Fetch user info from Google
        logger.info("✅ Fetching user info from Google...")
        resp = google.get("/oauth2/v2/userinfo")
        
        if not resp.ok:
            logger.error(f"❌ Failed to fetch user info. Status: {resp.status_code}")
            logger.error(f"Response: {resp.text}")
            return redirect(f"{frontend_url}?error=fetch_failed")

        info = resp.json()
        logger.info(f"✅ Got user info: {info}")
        
        email = info.get("email")
        google_id = info.get("id")
        name = info.get("name", "")
        
        if not email or not google_id:
            logger.error(f"❌ Missing email or ID. Email: {email}, Google ID: {google_id}")
            return redirect(f"{frontend_url}?error=missing_data")

        logger.info(f"✅ Processing user - Email: {email}, Google ID: {google_id}")

        # Find or create user
        user = User.query.filter_by(google_id=google_id).first()
        
        if not user:
            logger.info(f"ℹ️ No existing user with Google ID {google_id}")
            
            # Check if email exists (user who signed up with email/password)
            existing_user = User.query.filter_by(email=email).first()
            
            if existing_user:
                logger.info(f"ℹ️ Found existing user with email {email}, linking Google account")
                existing_user.google_id = google_id
                user = existing_user
                db.session.commit()
            else:
                logger.info(f"✅ Creating NEW user for {email}")
                user = User(
                    email=email,
                    google_id=google_id,
                    confirmed=True,
                    confirmed_on=datetime.utcnow()
                )
                user.set_password(os.urandom(16).hex())
                db.session.add(user)
                db.session.commit()
                logger.info(f"✅ New user created! User ID: {user.id}")
        else:
            logger.info(f"✅ Found existing user. User ID: {user.id}")

        # Clear session before login
        session.clear()
        
        # Log in the user
        login_success = login_user(user, remember=True, force=True)
        logger.info(f"✅ Login result: {login_success}")
        logger.info(f"✅ Current user authenticated: {current_user.is_authenticated}")
        logger.info(f"✅ Current user ID: {current_user.id if current_user.is_authenticated else 'None'}")
        
        logger.info(f"✅ Redirecting to frontend: {frontend_url}")
        return redirect(frontend_url)

    except Exception as e:
        logger.error(f"❌ OAuth callback error: {str(e)}", exc_info=True)
        return redirect(f"{frontend_url}?error=auth_exception")

# -------------------------------
# DEBUG: Check OAuth status
# -------------------------------
@auth_bp.route("/google/status")
def google_status():
    """Debug endpoint to check Google OAuth status"""
    return jsonify({
        "authorized": google.authorized,
        "has_token": hasattr(google_bp, 'token') and google_bp.token is not None,
        "client_id_set": bool(os.getenv("GOOGLE_CLIENT_ID")),
        "client_secret_set": bool(os.getenv("GOOGLE_CLIENT_SECRET")),
        "current_user_authenticated": current_user.is_authenticated,
        "session_keys": list(session.keys())
    })