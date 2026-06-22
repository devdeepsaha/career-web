import React from 'react';
import { HelpCircle, Mail, MessageSquareText, ShieldCheck } from 'lucide-react';

const FaqItem = ({ question, answer }) => (
    <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <summary className="cursor-pointer text-sm font-semibold text-slate-950 dark:text-white">{question}</summary>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{answer}</p>
    </details>
);

const Support = () => {
    const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/?tab=thankyou`
        : '/?tab=thankyou';

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <title>Support and FAQ | Potho-Prodorshok</title>
            <meta name="description" content="Support, FAQ, and contact page for Potho-Prodorshok." />

            <div className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">Support</p>
                <h1 className="pp-page-title">Help and contact</h1>
                <p className="pp-page-copy mt-1 max-w-3xl">
                    Find answers about the app, saved data, AI guidance, and how to reach the project maintainer.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-4">
                    <section className="saas-card p-4">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                <HelpCircle className="h-4 w-4" />
                            </div>
                            <h2 className="saas-section-title">Frequently asked questions</h2>
                        </div>
                        <div className="space-y-3">
                            <FaqItem
                                question="Is Potho-Prodorshok free to use?"
                                answer="The current core app is available as a student project/prototype. Access and hosting may change as the product evolves."
                            />
                            <FaqItem
                                question="How are AI recommendations generated?"
                                answer="The app sends user prompts and relevant workspace context to the configured AI provider, then stores useful outputs such as roadmaps, mock analysis, saved questions, and chat history when the user is signed in."
                            />
                            <FaqItem
                                question="What data is saved?"
                                answer="The app can save account data, profile details, roadmaps, chats, saved questions, practice attempts, mock test results, and saved scholarships. Some features, such as Resource Vault and roadmap step notes, are stored in the browser."
                            />
                            <FaqItem
                                question="Should I trust every AI answer?"
                                answer="No. AI output is guidance, not an official source. Users should verify exam rules, scholarship deadlines, career requirements, and important academic information from official sources."
                            />
                        </div>
                    </section>
                </div>

                <aside className="space-y-4">
                    <section className="saas-card p-4">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                <Mail className="h-4 w-4" />
                            </div>
                            <h2 className="saas-section-title">Contact</h2>
                        </div>
                        <form action="https://formsubmit.co/devdeep120205@gmail.com" method="POST" className="space-y-3">
                            <input type="hidden" name="_subject" value="New Potho-Prodorshok Support Message" />
                            <input type="hidden" name="_next" value={redirectUrl} />

                            <div>
                                <label className="pp-label">Name</label>
                                <input type="text" name="name" required className="pp-input" />
                            </div>
                            <div>
                                <label className="pp-label">Email</label>
                                <input type="email" name="email" required className="pp-input" />
                            </div>
                            <div>
                                <label className="pp-label">Message</label>
                                <textarea name="message" rows="5" required className="pp-input" />
                            </div>
                            <button type="submit" className="pp-button w-full">Send message</button>
                        </form>
                    </section>

                    <section className="saas-card p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-slate-500" />
                            <h2 className="saas-section-title">Data requests</h2>
                        </div>
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                            For account or data deletion requests, include the email address used for signup and a clear request in the contact form.
                        </p>
                    </section>

                    <section className="saas-card p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <MessageSquareText className="h-4 w-4 text-slate-500" />
                            <h2 className="saas-section-title">Bug reports</h2>
                        </div>
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                            Include the page name, device size, theme mode, and what you expected to happen. Screenshots help a lot.
                        </p>
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default Support;
