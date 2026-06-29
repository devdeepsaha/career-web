import React, { useState } from 'react';
import { ArrowLeft, Compass, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BrandLogo from '../shared/BrandLogo';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

const SignupPage = ({ onLoginSuccess, showLogin, onClose }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [signupMessage, setSignupMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });
            const data = await response.json();

            if (response.status === 201) {
                onLoginSuccess(data.user, data.auth_token);
                setSignupMessage(data.message);
            } else if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        window.location.href = `${API_URL}/auth/google/login`;
    };

    if (signupMessage) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950 dark:bg-slate-950 dark:text-white">
                <div className="saas-card w-full max-w-md p-8 text-center">
                    <h2 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-300">{t('Success!') || 'Success!'}</h2>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">{signupMessage}</p>
                    <button onClick={onClose} className="pp-button mt-8 w-full">
                        {t('Close') || 'Close'}
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-white">
            <div className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[0.9fr_1fr]">
                <aside className="hidden flex-col justify-between border-r border-slate-200 bg-slate-950 p-8 text-white dark:border-slate-800 lg:flex">
                    <div>
                        <button onClick={onClose} className="mb-12 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-white/70 transition-[color,transform] duration-200 hover:text-white active:scale-[0.96]">
                            <ArrowLeft className="h-4 w-4" />
                            Back to landing
                        </button>
                        <div className="flex items-center gap-3">
                            <BrandLogo className="h-10 w-auto" />
                            <span className="text-2xl font-extrabold">Potho Prodorshok</span>
                        </div>
                        <h1 className="mt-8 max-w-md text-3xl font-semibold leading-tight tracking-[-0.01em]">
                            Your journey to a future-proof career.
                        </h1>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                        <Compass className="mb-3 h-5 w-5 text-blue-200" />
                        <p className="text-sm font-medium leading-6 text-white/75">
                            Join learners using AI roadmaps, tutoring, and scholarship discovery to plan with clarity.
                        </p>
                    </div>
                </aside>

                <section className="flex w-full flex-col justify-center p-6 sm:p-8">
                    <button onClick={onClose} className="mb-8 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-slate-500 transition-[color,transform] duration-200 hover:text-slate-950 active:scale-[0.96] dark:text-slate-400 dark:hover:text-white lg:hidden">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>

                    <div className="mb-8">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Start planning</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.01em] text-slate-950 dark:text-white">
                            {t('Create Account') || 'Create Account'}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            Create your account to unlock the dashboard, saved sessions, and AI-generated guidance.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="pp-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="pp-input"
                            />
                        </div>

                        <div>
                            <label className="pp-label">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    className="pp-input pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-[background-color,color,transform] duration-150 hover:bg-slate-100 hover:text-slate-950 active:scale-[0.96] dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="pp-button flex w-full items-center justify-center gap-2"
                        >
                            <UserPlus className="h-4 w-4" />
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <div className="my-7 flex items-center gap-3">
                        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">or</span>
                        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignUp}
                        className="pp-button-secondary flex w-full items-center justify-center gap-3"
                    >
                        <img src="/google-icon.svg" alt="" width="20" height="20" className="h-5 w-5" />
                        Sign up with Google
                    </button>

                    <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-300">
                        Already have an account?
                        <button onClick={showLogin} className="ml-2 font-extrabold text-slate-950 underline underline-offset-4 dark:text-cyan-300">
                            Log in
                        </button>
                    </p>
                </section>
            </div>
        </main>
    );
};

export default SignupPage;
