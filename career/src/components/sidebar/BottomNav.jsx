import React from 'react';
import { Brain, GraduationCap, LayoutDashboard, Library, Map, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BottomNav = ({ activeTab, onNavigate }) => {
    const { t } = useTranslation();

    const navItems = [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'planner', label: t('nav_planner'), icon: Map },
        { id: 'tutor', label: t('nav_tutor'), icon: Brain },
        { id: 'scholarship', label: 'Funds', icon: GraduationCap },
        { id: 'library', label: 'Library', icon: Library },
        { id: 'profile', label: 'Profile', icon: UserRound },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
            <div className="mx-auto grid h-14 max-w-xl grid-cols-6 gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex h-full min-w-0 flex-col items-center justify-center rounded-md transition-[transform,color,background-color] duration-150 active:scale-[0.96] ${
                                activeTab === item.id
                                    ? 'bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="mt-1 max-w-full truncate text-[11px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
