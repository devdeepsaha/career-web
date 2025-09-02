import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import teamData from '../../data/teamData';

// Reusable StatBar component
const StatBar = ({ label, value, colorClass }) => (
    <div className="mb-3">
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <div className="w-full bg-transparent dark:bg-slate-900 rounded-full h-2">
            <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

// Color map
const colorMap = {
    green: { bgPage: 'bg-green-50 dark:bg-slate-900', bgCard: 'bg-white dark:bg-slate-800', bgBox: 'bg-green-100 dark:bg-slate-700/50', text: 'text-green-600 dark:text-green-400', bgStatBar: 'bg-green-500', textTag: 'text-green-800 dark:text-green-300', bgTag: 'bg-green-200 dark:bg-green-900/40', hoverBorder: 'hover:border-green-500' },
    blue: { bgPage: 'bg-blue-50 dark:bg-slate-900', bgCard: 'bg-white dark:bg-slate-800', bgBox: 'bg-blue-100 dark:bg-slate-700/50', text: 'text-blue-600 dark:text-blue-400', bgStatBar: 'bg-blue-500', textTag: 'text-blue-800 dark:text-blue-300', bgTag: 'bg-blue-200 dark:bg-blue-900/40', hoverBorder: 'hover:border-blue-500' },
   red: {
    bgPage: 'bg-gray-200 dark:bg-slate-900',       // White page background in light mode
    bgCard: 'bg-gray-50 dark:bg-slate-800',    // Slightly off-white card background
    bgBox: 'bg-gray-200 dark:bg-slate-700/50',  // Light grey boxes
    text: 'text-gray-800 dark:text-white',   // Dark text in light mode, light text in dark mode
    bgStatBar: 'bg-white',                   // You might want a different accent color for stat bars
    textTag: 'text-gray-700 dark:text-gray-300',// Dark grey tag text
    bgTag: 'bg-gray-300 dark:bg-gray-700',      // Light grey tags
    hoverBorder: 'hover:border-white',       // You might want a different accent color for hover borders
},
    yellow: { bgPage: 'bg-yellow-50 dark:bg-slate-900', bgCard: 'bg-white dark:bg-slate-800', bgBox: 'bg-yellow-100 dark:bg-slate-700/50', text: 'text-yellow-600 dark:text-yellow-400', bgStatBar: 'bg-yellow-500', textTag: 'text-yellow-800 dark:text-yellow-300', bgTag: 'bg-yellow-200 dark:bg-yellow-900/40', hoverBorder: 'hover:border-yellow-500' },
};

// --- Reusable ProfileCard component with all sections restored ---
const ProfileCard = ({ member }) => {
    const { t } = useTranslation();
    const colors = colorMap[member.accentColor] || colorMap.green;

    return (
        <div className={`${colors.bgCard} rounded-2xl shadow-xl p-6 lg:p-8 border dark:border-slate-700 h-full`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Left Panel */}
                <div className="lg:col-span-3 flex flex-col items-center text-center">
                    <img src={member.image} alt={member.name} className="w-28 h-28 rounded-full object-cover shadow-lg" />
                    <h3 className="text-2xl font-bold mt-4 text-gray-800 dark:text-white">{member.name}</h3>
                    <p className={`${colors.text} font-semibold`}>{member.role}</p>
                    <p className={`italic text-gray-600 dark:text-gray-400 text-sm mt-4 p-3 ${colors.bgBox} rounded-lg border dark:border-slate-600 w-full`}>"{member.tagline}"</p>
                    <div className={`mt-6 w-full p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">{t('teamProfile_skills')}</h4>
                        <div className="flex flex-wrap justify-center gap-2">
                            {member.skills.map(skill => <span key={skill} className={`${colors.bgTag} ${colors.textTag} text-xs font-semibold px-3 py-1 rounded-full`}>{skill}</span>)}
                        </div>
                    </div>
                </div>
                {/* Main Content Area */}
                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {/* Middle Column */}
                    <div className="space-y-6">
                        <div className={`p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                            <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{t('teamProfile_bio')}</h4>
                            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{member.bio}</p>
                        </div>
                        <div className={`p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                            <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{t('teamProfile_personality')}</h4>
                            {member.personality && member.personality.map(item => (<StatBar key={item.label} label={item.label} value={item.value} colorClass={colors.bgStatBar} />))}
                        </div>
                        <div className={`p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                            <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{t('teamProfile_goals')}</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                {member.goals && member.goals.map((goal, index) => (<li key={index}>{goal}</li>))}
                            </ul>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className={`p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                            <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{t('teamProfile_motivations')}</h4>
                            {member.motivations.map(item => (
                                <StatBar key={item.label} label={item.label} value={item.value} colorClass={colors.bgStatBar} />
                            ))}
                        </div>
                        <div className={`p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                            <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{t('teamProfile_frustrations')}</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                {member.frustrations.map(frustration => (
                                    <li key={frustration}>{frustration}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
            </div>
        </div>
        </div>
    );
};


const TeamProfile = () => {
    const { t } = useTranslation();
    const [mainMember, setMainMember] = useState(teamData[0]);
    const otherMembers = teamData.filter(member => member.id !== mainMember.id);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const scrollLeft = scrollContainerRef.current.scrollLeft;
                const cardWidth = scrollContainerRef.current.offsetWidth;
                const newIndex = Math.round(scrollLeft / cardWidth);
                setActiveIndex(newIndex);
            }
        };
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll, { passive: true });
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const activeMemberForTheme = window.innerWidth < 1024 ? teamData[activeIndex] : mainMember;
    const colors = colorMap[activeMemberForTheme.accentColor] || colorMap.green;

    return (
        <div className={`${colors.bgPage} min-h-screen py-12 px-4 transition-colors duration-500`}>
            {/* --- MOBILE VIEW --- */}
            <div className="xl:hidden">
                <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-4 px-4">
                    {teamData.map((member, index) => (
                        <div key={index} className="w-full flex-shrink-0 snap-center p-2">
                           <ProfileCard member={member} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-2 mt-4">
                    {teamData.map((member, index) => (
                        <div key={index} className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${activeIndex === index ? `bg-${member.accentColor}-500` : 'bg-gray-300'}`}></div>
                    ))}
                </div>
            </div>
            
            {/* --- DESKTOP VIEW --- */}
            <div className="hidden xl:block max-w-7xl mx-auto relative px-24"> {/* Added padding for space on the left */}
                
                {/* Teammates panel, absolutely positioned */}
                <div className="absolute top-1/2-translate-y-1/2 left-0 flex flex-col items-center space-y-4">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-4">{t('teamProfile_team')}</h4>
                    {otherMembers.map(member => {
                        const memberColors = colorMap[member.accentColor] || colorMap.green;
                        return (
                            <div key={member.id} className="flex flex-col items-center cursor-pointer transform transition-transform duration-200 hover:scale-105" onClick={() => setMainMember(member)}>
                                <img src={member.image} alt={member.name} className={`w-20 h-20 rounded-full object-cover shadow-md ${memberColors.hoverBorder} border-2 border-transparent`} />
                                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{member.name}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Main profile card, centered within the available space */}
                <div className="max-w-5xl mx-auto">
                    <ProfileCard member={mainMember} />
                </div>

            </div>
        </div>
    );
};

export default TeamProfile;