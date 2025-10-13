from flask import Blueprint, redirect, url_for, jsonify
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer.storage import MemoryStorage
from flask_login import login_user
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
    redirect_url="/auth/google/callback",  # custom callback
    offline=True,  # enable refresh tokens
)

# Ensure refresh token & consent prompt always appear
google_bp.authorization_url_params["access_type"] = "offline"
google_bp.authorization_url_params["prompt"] = "consent"
google_bp.storage = MemoryStorage()

# -------------------------------
# Trigger Google login
# -------------------------------
@auth_bp.route("/google/login")
def google_login():
    if not google.authorized:
        return redirect(url_for("google.login"))  # starts OAuth flow
    return redirect(url_for("auth.google_callback"))

# -------------------------------
# Callback route
# -------------------------------
@auth_bp.route("/google/callback")
def google_callback():
    if not google.authorized:
        return redirect(url_for("google.login"))

    # Fetch user info
    resp = google.get("/oauth2/v2/userinfo")
    if not resp.ok:
        return jsonify({"error": "Failed to fetch user info from Google"}), 400

    info = resp.json()
    email = info.get("email")
    if not email:
        return jsonify({"error": "No email found in Google response"}), 400

    # Find or create user
    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(email=email)
        user.set_password(os.urandom(16).hex())  # Random password
        db.session.add(user)
        db.session.commit()

    # Log in
    login_user(user)

    # Redirect to frontend
    frontend_url = (
        "https://pothoprodorshok.onrender.com"
        if os.getenv("FLASK_ENV") == "production"
        else "http://localhost:5173"
    )

    return redirect(frontend_url)
