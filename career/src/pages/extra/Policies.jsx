import React from 'react';
import { Database, FileText, LockKeyhole, Scale, ShieldCheck, Sparkles } from 'lucide-react';

const PolicySection = ({ title, icon, children }) => (
    <section className="saas-card p-4">
        <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {React.createElement(icon, { className: 'h-4 w-4' })}
            </div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
        </div>
        <div className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {children}
        </div>
    </section>
);

const Policies = () => (
    <>
        <title>Privacy Policy and Terms | Potho-Prodorshok</title>
        <meta name="description" content="Privacy Policy and Terms for Potho-Prodorshok Career OS." />

        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <div className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">Policies</p>
                <h1 className="pp-page-title">Privacy, data, and terms</h1>
                <p className="pp-page-copy mt-1 max-w-3xl">
                    This page explains how Potho-Prodorshok handles account data, student workspace data, AI-generated content, and acceptable use.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-4">
                    <PolicySection title="What we collect" icon={Database}>
                        <p>We collect account information such as email address, password hash, Google OAuth identifier when used, and session data needed to keep users signed in.</p>
                        <p>When users choose to use workspace features, we store student profile details, roadmaps, saved questions, question attempts, mock test results, scholarship tracker items, and chat history.</p>
                        <p>Some convenience features are stored only in the browser, including Resource Vault entries, roadmap step notes/progress, and study timer state.</p>
                    </PolicySection>

                    <PolicySection title="How AI features use data" icon={Sparkles}>
                        <p>Career roadmaps, tutor answers, mock analysis, scholarship suggestions, and mentor-memory responses may send user prompts and relevant context to the configured AI provider.</p>
                        <p>AI output may be inaccurate or incomplete. Users should verify important educational, career, scholarship, financial, or deadline information from official sources.</p>
                    </PolicySection>

                    <PolicySection title="How we use data" icon={ShieldCheck}>
                        <p>We use stored data to provide personalized dashboards, saved history, revision queues, mock analytics, recommendations, and continuity across sessions.</p>
                        <p>We do not sell personal information. Data is used to operate and improve the product experience.</p>
                    </PolicySection>

                    <PolicySection title="Security and storage" icon={LockKeyhole}>
                        <p>Passwords are stored as hashes, not plain text. Session cookies are configured as HTTP-only and secure in production-style settings.</p>
                        <p>The production database is expected to be hosted on Supabase/PostgreSQL. Access to production secrets should remain in deployment environment variables and should not be committed to Git.</p>
                    </PolicySection>

                    <PolicySection title="User control" icon={FileText}>
                        <p>Users can delete chat sessions, saved questions, archive roadmaps, and update scholarship tracker states from the app where supported.</p>
                        <p>For account or data deletion requests, users should contact the project maintainer through the support form or the email configured for support messages.</p>
                    </PolicySection>

                    <PolicySection title="Terms of use" icon={Scale}>
                        <p>The service is intended for educational guidance, career planning, and study support. Users must not misuse the app, attempt to disrupt service, or upload unlawful content.</p>
                        <p>AI-generated advice is informational and is not a substitute for professional counselling, official exam notices, official scholarship rules, or institutional guidance.</p>
                        <p>The app is provided as a student project/product prototype and may change over time as features are improved.</p>
                    </PolicySection>
                </div>

                <aside className="space-y-4">
                    <div className="saas-card p-4">
                        <h2 className="saas-section-title">Quick summary</h2>
                        <div className="mt-3 space-y-2">
                            {[
                                'Account and workspace data are stored so users can return to their saved work.',
                                'AI requests may include user-provided prompts and relevant app context.',
                                'Resource Vault, roadmap notes, and study timer are currently browser-local.',
                                'Important AI output should be verified with official sources.',
                            ].map((item) => (
                                <div key={item} className="rounded-lg bg-slate-50 p-3 text-sm leading-5 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </>
);

export default Policies;
