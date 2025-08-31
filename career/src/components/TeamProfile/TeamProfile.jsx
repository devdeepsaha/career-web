import React, { useState } from 'react';
import teamData from '../../data/teamData'; // Adjust path as needed

// A small sub-component for the personality/motivation bars
const StatBar = ({ label, value, colorClass }) => (
  <div className="mb-3">
    <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-slate-900 rounded-full h-2">
      <div 
        className={`${colorClass} h-2 rounded-full`} 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

// --- UPDATED: Softer, more professional dark mode colors ---
const colorMap = {
    green: {
        bgPage: 'bg-green-50 dark:bg-slate-900',
        bgCard: 'bg-green-200 dark:bg-slate-800', 
        bgBox: 'bg-green-100 dark:bg-slate-700/50',
        border: 'border-green-500',
        text: 'text-green-600 dark:text-green-400',
        bgStatBar: 'bg-green-500',
        textTag: 'text-green-800 dark:text-green-300',
        bgTag: 'bg-green-200 dark:bg-green-900/40',
        hoverBorder: 'hover:border-green-500',
    },
    blue: {
        bgPage: 'bg-blue-50 dark:bg-slate-900',
        bgCard: 'bg-blue-200 dark:bg-slate-800',
        bgBox: 'bg-blue-100 dark:bg-slate-700/50',
        border: 'border-blue-500',
        text: 'text-blue-600 dark:text-blue-400',
        bgStatBar: 'bg-blue-500',
        textTag: 'text-blue-800 dark:text-blue-300',
        bgTag: 'bg-blue-200 dark:bg-blue-900/40',
        hoverBorder: 'hover:border-blue-500',
    },
    red: {
        bgPage: 'bg-red-50 dark:bg-slate-900',
        bgCard: 'bg-red-200 dark:bg-slate-800',
        bgBox: 'bg-red-100 dark:bg-slate-700/50',
        border: 'border-red-500',
        text: 'text-red-600 dark:text-red-400',
        bgStatBar: 'bg-red-500',
        textTag: 'text-red-800 dark:text-red-300',
        bgTag: 'bg-red-200 dark:bg-red-900/40',
        hoverBorder: 'hover:border-red-500',
    },
    yellow: {
        bgPage: 'bg-yellow-50 dark:bg-slate-900',
        bgCard: 'bg-yellow-200 dark:bg-slate-800',
        bgBox: 'bg-yellow-100 dark:bg-slate-700/50',
        border: 'border-yellow-500',
        text: 'text-yellow-600 dark:text-yellow-400',
        bgStatBar: 'bg-yellow-500',
        textTag: 'text-yellow-800 dark:text-yellow-300',
        bgTag: 'bg-yellow-200 dark:bg-yellow-900/40',
        hoverBorder: 'hover:border-yellow-500',
    },
};


const TeamProfile = () => {
  const [mainMember, setMainMember] = useState(teamData[0]); 
  const otherMembers = teamData.filter(member => member.id !== mainMember.id);
  
  const colors = colorMap[mainMember.accentColor] || colorMap.green; 

  return (
    <div className={`${colors.bgPage} min-h-screen py-12 px-4 transition-colors duration-500`}>
      
      <div className={`${colors.bgCard} rounded-2xl shadow-xl p-6 lg:p-8 max-w-6xl mx-auto border dark:border-slate-700`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          <div className="lg:col-span-3 flex flex-col items-center text-center">
            <img 
              src={mainMember.image} 
              alt={mainMember.name} 
              className="w-32 h-32 rounded-full object-cover shadow-lg"
            />
            <h3 className="text-2xl font-bold mt-4 text-gray-800 dark:text-white">{mainMember.name}</h3>
            <p className={`${colors.text} font-semibold`}>{mainMember.role}</p>
            
            <p className={`italic text-gray-600 dark:text-gray-400 text-sm mt-4 p-3 ${colors.bgBox} rounded-lg border dark:border-slate-600 w-full`}>
              "{mainMember.tagline}"
            </p>

            <div className={`mt-6 w-full p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Skills</h4>
                <div className="flex flex-wrap justify-center gap-2">
                {mainMember.skills.map(skill => (
                    <span key={skill} className={`${colors.bgTag} ${colors.textTag} text-xs font-semibold px-3 py-1 rounded-full`}>
                    {skill}
                    </span>
                ))}
                </div>
            </div>
          </div>

          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            <div className="space-y-6">
              <div className={`p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Bio</h4>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{mainMember.bio}</p>
              </div>
              <div className={`p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Personality</h4>
                <StatBar label="Introvert/Extrovert" value={70} colorClass={colors.bgStatBar} />
                <StatBar label="Analytical/Creative" value={85} colorClass={colors.bgStatBar} />
                <StatBar label="Passive/Active" value={60} colorClass={colors.bgStatBar} />
              </div>
              <div className={`p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Goals</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>To expand knowledge in AI/ML</li>
                  <li>To contribute to open-source projects</li>
                  <li>To mentor junior developers</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Motivations</h4>
                {mainMember.motivations.map(item => (
                  <StatBar key={item.label} label={item.label} value={item.value} colorClass={colors.bgStatBar} />
                ))}
              </div>
              <div className={`p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Frustrations</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {mainMember.frustrations.map(frustration => (
                    <li key={frustration}>{frustration}</li>
                  ))}
                </ul>
              </div>

              <div className={`p-4 ${colors.bgBox} rounded-lg border dark:border-slate-600`}>
                <h4 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Team</h4>
                <div className="flex justify-around items-center flex-wrap gap-4">
                  {otherMembers.map(member => {
                    const memberColors = colorMap[member.accentColor] || colorMap.green;
                    return (
                        <div 
                        key={member.id} 
                        className="flex flex-col items-center cursor-pointer transform transition-transform duration-200 hover:scale-105"
                        onClick={() => setMainMember(member)}
                        >
                        <img 
                            src={member.image} 
                            alt={member.name} 
                            className={`w-16 h-16 rounded-full object-cover shadow-md ${memberColors.hoverBorder} border-2 border-transparent`}
                        />
                        <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">{member.name}</p>
                        </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamProfile;