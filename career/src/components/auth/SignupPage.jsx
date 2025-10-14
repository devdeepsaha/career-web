import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SignupPage = ({ onLoginSuccess, showLogin, onClose }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // ADDED: State to hold the success message after signup
    const [signupMessage, setSignupMessage] = useState('');

    const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });
            const data = await response.json();
            
            // MODIFIED: Handle different success/error responses from the backend
            if (response.status === 201) {
                // This is a successful signup that requires email confirmation.
                setSignupMessage(data.message);
                // We DO NOT call onLoginSuccess here anymore.
            } else if (!response.ok) {
                // This handles errors like 409 (email already exists).
                throw new Error(data.message || 'Signup failed');
            } else {
                // This would be for an immediate login, which we are not doing now.
                // onLoginSuccess(data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        window.location.href = `${API_URL}/auth/google/login`; // Redirect to backend OAuth
    };

    // ADDED: If signup is successful, show the message instead of the form.
    if (signupMessage) {
        return (
            <div className="w-full max-w-sm bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border dark:border-slate-700 text-center">
                <h2 className="text-2xl font-bold text-green-500 dark:text-green-400 mb-4">
                    {t('Success!')}
                </h2>
                <p className="text-gray-700 dark:text-slate-300 mb-6">
                    {signupMessage}
                </p>
                <button 
                    onClick={onClose} 
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    {t('Close')}
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border dark:border-slate-700">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">
                {t('Create Account')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="w-full mt-1 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="w-full mt-1 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {isLoading ? 'Creating account...' : 'Sign Up'}
                </button>
            </form>

            {/* --- Google Sign-Up Button --- */}
            <div className="mt-4">
                <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                    <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
                    {t('Sign Up with Google')}
                </button>
            </div>

            <div className="flex justify-between mt-4 text-sm">
                <button
                    onClick={showLogin}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    {t('Already have an account? Login')}
                </button>
                <button
                    onClick={onClose}
                    className="text-gray-500 dark:text-slate-400 hover:underline"
                >
                    {t('Maybe later')}
                </button>
            </div>
        </div>
    );
};

export default SignupPage;