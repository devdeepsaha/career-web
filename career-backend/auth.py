from flask import Blueprint, redirect, url_for, jsonify, session
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer.storage import MemoryStorage
from flask_login import login_user, logout_user
import os
from datetime import datetime
from extensions import db
from models import User

# -------------------------------
# Blueprint setup
# -------------------------------
auth_bp = Blueprint("auth", __name__)

# Determine the correct redirect URL based on environment
def get_redirect_url():
    """Get the correct OAuth redirect URL based on environment"""
    # Check if we're on the VM (production)
    if os.getenv("FLASK_ENV") == "production":
        base_url = "https://pothoprodorshok.mooo.com"
    else:
        # Development: Use localhost
        base_url = "http://localhost:5000"
    
    redirect_url = f"{base_url}/auth/google/callback"
    print(f"🔵 OAuth redirect URL configured: {redirect_url}")
    return redirect_url

def get_frontend_url():
    """Get the correct frontend URL based on environment"""
    if os.getenv("FLASK_ENV") == "production":
        return "https://pothoprodorshok.mooo.com"
    else:
        return "http://localhost:5173"

# Google OAuth blueprint with dynamic redirect URL
google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=[
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ],
    redirect_to="auth.google_callback",  # Flask route name instead of URL
    offline=True,
)

# Force fresh consent each time
google_bp.authorization_url_params["access_type"] = "offline"
google_bp.authorization_url_params["prompt"] = "consent"
google_bp.storage = MemoryStorage()

# -------------------------------
# Trigger Google login
# -------------------------------
# -------------------------------
# Trigger Google login
# -------------------------------
@auth_bp.route("/google/login")
def google_login():
    print("🔵 Starting Google login flow...")
    
    # CRITICAL FIX 1: Clear any existing session before OAuth
    session.clear()
    logout_user()
    print("✅ Session cleared and user logged out")
    
    # CRITICAL FIX 2: Force new authorization
    try:
        if google.authorized:
            # Delete the existing token to force re-auth
            del google_bp.token
            print("✅ Existing OAuth token deleted")
    except:
        print("ℹ️ No existing token to delete")
        pass
    
    print("🔵 Redirecting to Google login...")
    return redirect(url_for("google.login"))

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
        "client_secret_set": bool(os.getenv("GOOGLE_CLIENT_SECRET"))
    })

# -------------------------------
# Callback route
# -------------------------------
@auth_bp.route("/google/callback")
def google_callback():
    # Get frontend URL based on environment
    if os.getenv("FLASK_ENV") == "production":
        frontend_url = os.getenv("FRONTEND_URL", "https://pothoprodorshok.mooo.com")
    else:
        frontend_url = "http://localhost:5173"
    
    print(f"🔵 Frontend URL: {frontend_url}")
    # CRITICAL FIX 3: Verify OAuth is actually authorized
    if not google.authorized:
        print("❌ Google OAuth not authorized")
        return redirect(f"{frontend_url}?error=oauth_failed")

    try:
        # CRITICAL FIX 4: Fetch user info fresh from Google
        print("✅ Fetching user info from Google...")
        resp = google.get("/oauth2/v2/userinfo")
        
        if not resp.ok:
            print(f"❌ Failed to fetch user info. Status: {resp.status_code}")
            print(f"Response: {resp.text}")
            return redirect(f"{frontend_url}?error=fetch_failed")

        info = resp.json()
        print(f"✅ Got user info: {info}")
        
        email = info.get("email")
        google_id = info.get("id")  # NEW: Get Google's unique user ID
        name = info.get("name", "")
        
        if not email or not google_id:
            print(f"❌ Missing email or ID. Email: {email}, Google ID: {google_id}")
            return redirect(f"{frontend_url}?error=missing_data")

        print(f"✅ Processing user - Email: {email}, Google ID: {google_id}")

        # CRITICAL FIX 5: Use Google ID as primary identifier, not just email
        user = User.query.filter_by(google_id=google_id).first()
        
        if not user:
            print(f"ℹ️ No existing user with Google ID {google_id}")
            
            # Check if email exists (for users who signed up with email/password)
            existing_user = User.query.filter_by(email=email).first()
            
            if existing_user:
                print(f"ℹ️ Found existing user with email {email}, linking Google account")
                # Link Google account to existing email account
                existing_user.google_id = google_id
                user = existing_user
                db.session.commit()
            else:
                print(f"✅ Creating NEW user for {email}")
                # Create new user - AUTO SIGNUP!
                user = User(
                    email=email,
                    google_id=google_id,
                    confirmed=True,  # Google users are auto-confirmed
                    confirmed_on=datetime.utcnow()
                )
                user.set_password(os.urandom(16).hex())
                db.session.add(user)
                db.session.commit()
                print(f"✅ New user created successfully! User ID: {user.id}")
        else:
            print(f"✅ Found existing user with Google ID. User ID: {user.id}")

        # CRITICAL FIX 6: Clear session before login
        session.clear()
        
        # Log in the correct user
        login_success = login_user(user, remember=True, force=True)
        print(f"✅ Login user result: {login_success}")
        
        # CRITICAL FIX 7: Clear OAuth token after successful login
        try:
            if google.authorized:
                del google_bp.token
                print("✅ OAuth token cleared")
        except:
            pass  # Token might not exist, that's okay

        print(f"✅ Redirecting to frontend: {frontend_url}")
        return redirect(frontend_url)

    except Exception as e:
        print(f"❌ OAuth callback error: {str(e)}")
        import traceback
        traceback.print_exc()
        return redirect(f"{frontend_url}?error=auth_exception")