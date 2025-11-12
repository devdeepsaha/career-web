#!/usr/bin/env python3
"""
OAuth Configuration Test Script
Run this to verify your OAuth setup
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

def test_env_vars():
    """Check if all required environment variables are set"""
    print("=" * 60)
    print("1. Testing Environment Variables")
    print("=" * 60)
    
    required = {
        'FLASK_SECRET_KEY': os.getenv('FLASK_SECRET_KEY'),
        'GOOGLE_CLIENT_ID': os.getenv('GOOGLE_CLIENT_ID'),
        'GOOGLE_CLIENT_SECRET': os.getenv('GOOGLE_CLIENT_SECRET'),
        'FLASK_ENV': os.getenv('FLASK_ENV'),
    }
    
    all_set = True
    for key, value in required.items():
        status = "✅ SET" if value else "❌ MISSING"
        print(f"{key}: {status}")
        if not value:
            all_set = False
    
    return all_set

def test_redirect_uris():
    """Show what redirect URIs should be configured"""
    print("\n" + "=" * 60)
    print("2. Required Google Cloud Console Settings")
    print("=" * 60)
    
    env = os.getenv('FLASK_ENV', 'development')
    
    if env == 'production':
        base_url = "https://pothoprodorshok.mooo.com"
    else:
        base_url = "http://localhost:5000"
    
    print(f"\nCurrent environment: {env}")
    print(f"\nAuthorized redirect URIs (add these to Google Console):")
    print(f"  • {base_url}/auth/google/callback")
    print(f"  • {base_url}/auth/google/authorized")
    
    print(f"\nAuthorized JavaScript origins:")
    if env == 'production':
        print(f"  • https://pothoprodorshok.mooo.com")
    else:
        print(f"  • http://localhost:5173")
        print(f"  • http://localhost:5000")

def test_database_connection():
    """Test database connection"""
    print("\n" + "=" * 60)
    print("3. Testing Database Connection")
    print("=" * 60)
    
    try:
        from extensions import db
        from flask import Flask
        
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        db.init_app(app)
        
        with app.app_context():
            # Try to connect
            db.engine.connect()
            print("✅ Database connection successful")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_session_config():
    """Show session configuration"""
    print("\n" + "=" * 60)
    print("4. Session Configuration")
    print("=" * 60)
    
    env = os.getenv('FLASK_ENV', 'development')
    
    config = {
        'SESSION_COOKIE_SECURE': True if env == 'production' else False,
        'SESSION_COOKIE_HTTPONLY': True,
        'SESSION_COOKIE_SAMESITE': 'Lax',
        'SESSION_COOKIE_DOMAIN': '.mooo.com' if env == 'production' else None,
    }
    
    print("\nRecommended session settings:")
    for key, value in config.items():
        print(f"  {key}: {value}")

def main():
    print("\n🔍 OAuth Configuration Test\n")
    
    # Run all tests
    env_ok = test_env_vars()
    test_redirect_uris()
    db_ok = test_database_connection()
    test_session_config()
    
    # Summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    if env_ok and db_ok:
        print("✅ Configuration looks good!")
        print("\nNext steps:")
        print("1. Verify Google Cloud Console settings match above")
        print("2. Restart your application")
        print("3. Test OAuth flow at your application URL")
    else:
        print("❌ Some issues found. Please fix them and run again.")
        sys.exit(1)

if __name__ == '__main__':
    main()