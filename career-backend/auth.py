from flask import Blueprint, redirect, url_for, jsonify, session, request
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer.storage.sqla import SQLAlchemyStorage
from flask_dance.consumer import oauth_authorized
from flask_login import login_user, logout_user, current_user
import os
from datetime import datetime
from extensions import db
from models import User
from sqlalchemy.orm.exc import NoResultFound

# -------------------------------
# Blueprint setup
# -------------------------------
auth_bp = Blueprint("auth", __name__)

def get_frontend_url():
    """Get the correct frontend URL based on environment"""
    if os.getenv("FLASK_ENV") == "production":
        return "https://pothoprodorshok.mooo.com"
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
    redirect_url="/auth/google/callback",  # This is the Flask route
    offline=False,  # Changed from True - we don't need offline access
    reprompt_consent=False,  # Don't force consent every time
)

# -------------------------------
# Trigger Google login
# -------------------------------
@auth_bp.route("/google/login")
def google_login():
    print("🔵 Starting Google login flow...")
    
    # Clear any existing session data
    session.clear()
    
    if current_user.is_authenticated:
        logout_user()
        print("✅ Logged out existing user")
    
    print("🔵 Redirecting to Google OAuth...")
    return redirect(url_for("google.login"))

# -------------------------------
# OAuth callback handler
# -------------------------------
@auth_bp.route("/google/callback")
def google_callback():
    frontend_url = get_frontend_url()
    print(f"🔵 OAuth callback triggered")
    print(f"🔵 Frontend URL: {frontend_url}")
    print(f"🔵 Google authorized: {google.authorized}")
    print(f"🔵 Session keys: {list(session.keys())}")
    
    # Check if OAuth was successful
    if not google.authorized:
        print("❌ Google OAuth not authorized")
        error_msg = request.args.get('error', 'oauth_failed')
        error_description = request.args.get('error_description', '')
        print(f"❌ Error: {error_msg}")
        print(f"❌ Description: {error_description}")
        return redirect(f"{frontend_url}?error=oauth_failed")

    try:
        # Fetch user info from Google
        print("✅ Fetching user info from Google...")
        resp = google.get("/oauth2/v2/userinfo")
        
        if not resp.ok:
            print(f"❌ Failed to fetch user info. Status: {resp.status_code}")
            print(f"Response: {resp.text}")
            return redirect(f"{frontend_url}?error=fetch_failed")

        info = resp.json()
        print(f"✅ Got user info: {info}")
        
        email = info.get("email")
        google_id = info.get("id")
        name = info.get("name", "")
        
        if not email or not google_id:
            print(f"❌ Missing email or ID. Email: {email}, Google ID: {google_id}")
            return redirect(f"{frontend_url}?error=missing_data")

        print(f"✅ Processing user - Email: {email}, Google ID: {google_id}")

        # Find or create user
        user = User.query.filter_by(google_id=google_id).first()
        
        if not user:
            print(f"ℹ️ No existing user with Google ID {google_id}")
            
            # Check if email exists (user who signed up with email/password)
            existing_user = User.query.filter_by(email=email).first()
            
            if existing_user:
                print(f"ℹ️ Found existing user with email {email}, linking Google account")
                existing_user.google_id = google_id
                user = existing_user
                db.session.commit()
            else:
                print(f"✅ Creating NEW user for {email}")
                user = User(
                    email=email,
                    google_id=google_id,
                    confirmed=True,
                    confirmed_on=datetime.utcnow()
                )
                user.set_password(os.urandom(16).hex())
                db.session.add(user)
                db.session.commit()
                print(f"✅ New user created! User ID: {user.id}")
        else:
            print(f"✅ Found existing user. User ID: {user.id}")

        # Clear session before login
        session.clear()
        
        # Log in the user
        login_success = login_user(user, remember=True, force=True)
        print(f"✅ Login result: {login_success}")
        print(f"✅ Current user authenticated: {current_user.is_authenticated}")
        print(f"✅ Current user ID: {current_user.id if current_user.is_authenticated else 'None'}")
        
        print(f"✅ Redirecting to frontend: {frontend_url}")
        return redirect(frontend_url)

    except Exception as e:
        print(f"❌ OAuth callback error: {str(e)}")
        import traceback
        traceback.print_exc()
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