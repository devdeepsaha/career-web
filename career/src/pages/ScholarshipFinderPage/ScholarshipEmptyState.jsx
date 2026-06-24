import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileCheck2, Search, ShieldCheck } from 'lucide-react';

const ScholarshipEmptyState = () => {
    const { t } = useTranslation();

    return (
        <div className="saas-card p-5">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    <Search className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Ready to check scholarship fit</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{t('scholarship_emptyStateText')}</p>
                </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                    <ShieldCheck className="mb-2 h-4 w-4 text-emerald-500" />
                    Match score, amount, and eligibility reasons appear here.
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                    <FileCheck2 className="mb-2 h-4 w-4 text-blue-500" />
                    Missing documents and deadline urgency stay visible.
                </div>
            </div>
        </div>
    );
};

export default ScholarshipEmptyState;
