import React, { useMemo, useState } from 'react';
import { BadgeCheck, BriefcaseBusiness, Lightbulb, Sparkles, Target, UsersRound } from 'lucide-react';
import teamData from '../../data/teamData';

const accentMap = {
    green: {
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        bar: 'bg-emerald-500',
        ring: 'ring-emerald-500/25',
    },
    blue: {
        text: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        bar: 'bg-blue-500',
        ring: 'ring-blue-500/25',
    },
    yellow: {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        bar: 'bg-amber-500',
        ring: 'ring-amber-500/25',
    },
    red: {
        text: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-950/30',
        bar: 'bg-rose-500',
        ring: 'ring-rose-500/25',
    },
};

const StatBar = ({ label, value, colorClass }) => (
    <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="truncate text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
            <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">{value}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${value}%` }} />
        </div>
    </div>
);

const Section = ({ title, icon, children }) => (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-300">
                {React.createElement(icon, { className: 'h-4 w-4' })}
            </div>
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{title}</h3>
        </div>
        {children}
    </section>
);

const ProfileCard = ({ member }) => {
    const accent = accentMap[member.accentColor] || accentMap.blue;

    return (
        <article className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="saas-card p-5 xl:sticky xl:top-16 xl:self-start">
                    <div className="flex items-start gap-4 xl:block xl:text-left">
                        <img
                            src={member.image}
                            alt={member.name}
                            className={`h-20 w-20 shrink-0 rounded-full object-cover outline outline-1 outline-black/10 ring-4 ${accent.ring} dark:outline-white/10 xl:h-32 xl:w-32`}
                        />
                        <div className="min-w-0 xl:mt-4">
                            <p className="truncate text-xl font-semibold tracking-[-0.01em] text-slate-950 dark:text-white">{member.name}</p>
                            <p className={`mt-1 text-sm font-semibold ${accent.text}`}>{member.role}</p>
                            <p className="mt-3 text-pretty text-sm leading-6 text-slate-600 dark:text-slate-400">{member.tagline}</p>
                        </div>
                    </div>

                    <div className="mt-5">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Skills</p>
                        <div className="flex flex-wrap gap-2">
                            {member.skills.map((skill) => (
                                <span key={skill} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${accent.bg} ${accent.text}`}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="saas-card min-w-0 p-5">
                    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                        <Section title="Bio" icon={BriefcaseBusiness}>
                            <p className="text-pretty text-sm leading-6 text-slate-700 dark:text-slate-300">{member.bio}</p>
                        </Section>

                        <Section title="Goals" icon={Target}>
                            <div className="space-y-2">
                                {member.goals.map((goal) => (
                                    <div key={goal} className="flex gap-2 text-sm leading-5 text-slate-700 dark:text-slate-300">
                                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <span>{goal}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section title="Motivations" icon={Sparkles}>
                            <div className="space-y-3">
                                {member.motivations.map((item) => (
                                    <StatBar key={item.label} label={item.label} value={item.value} colorClass={accent.bar} />
                                ))}
                            </div>
                        </Section>

                        <Section title="Working Style" icon={Lightbulb}>
                            <div className="space-y-3">
                                {member.personality.map((item) => (
                                    <StatBar key={item.label} label={item.label} value={item.value} colorClass={accent.bar} />
                                ))}
                            </div>
                        </Section>
                    </div>

                    <Section title="Friction Points" icon={UsersRound}>
                        <div className="grid gap-2 md:grid-cols-3">
                            {member.frustrations.map((item) => (
                                <div key={item} className="rounded-md border border-slate-200 bg-white p-3 text-sm leading-5 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>
        </article>
    );
};

const TeamProfile = () => {
    const [activeId, setActiveId] = useState(teamData[0]?.id);
    const activeMember = useMemo(() => teamData.find((member) => member.id === activeId) || teamData[0], [activeId]);

    return (
        <div className="px-3 py-4 sm:px-4 lg:px-5 2xl:px-6">
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">Team</p>
                    <h1 className="pp-page-title">People building the platform</h1>
                    <p className="pp-page-copy mt-1 max-w-3xl">A focused view of roles, strengths, motivations, and working styles behind Potho-Prodorshok.</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold tabular-nums text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    {teamData.length} contributors
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="saas-card p-2 xl:sticky xl:top-16 xl:self-start">
                    <div className="flex gap-2 overflow-x-auto xl:block xl:space-y-1">
                        {teamData.map((member) => {
                            const accent = accentMap[member.accentColor] || accentMap.blue;
                            const isActive = member.id === activeMember.id;

                            return (
                                <button
                                    key={member.id}
                                    onClick={() => setActiveId(member.id)}
                                    className={`flex min-w-56 items-center gap-3 rounded-lg p-2 text-left transition-[background-color,transform] duration-150 active:scale-[0.96] xl:w-full xl:min-w-0 ${
                                        isActive ? 'bg-slate-100 dark:bg-slate-900' : 'hover:bg-slate-50 dark:hover:bg-slate-900/70'
                                    }`}
                                >
                                    <img src={member.image} alt="" className={`h-10 w-10 rounded-full object-cover ring-2 ${isActive ? accent.ring : 'ring-transparent'}`} />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{member.name}</p>
                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <ProfileCard member={activeMember} />
            </div>
        </div>
    );
};

export default TeamProfile;
