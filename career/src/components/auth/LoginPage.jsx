import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LoginPage = ({ onLoginSuccess, showSignup, onClose }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');
            onLoginSuccess(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Redirect user to backend Google OAuth
    const handleGoogleSignIn = () => {
        window.location.href = `${API_URL}/auth/google/login`;
    };

    return (
        <div className="w-full max-w-sm bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border dark:border-slate-700">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">
                {t('Login')}
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
                        autoComplete="current-password"
                        className="w-full mt-1 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {/* --- Google Sign-In --- */}
            <div className="mt-4">
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                    <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
                    {t('Sign In with Google')}
                </button>
            </div>

            <div className="flex justify-between mt-4 text-sm">
                <button
                    onClick={showSignup}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    {t('Sign up')}
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

export default LoginPage;
