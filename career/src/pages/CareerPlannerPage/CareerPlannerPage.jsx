import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import UserInputForm from './UserInputForm';
import RoadmapDisplay from './RoadmapDisplay';
import EmptyStateGraphic from './EmptyStateGraphic';
import CareerPlannerChatbot from '../../components/chat/CareerPlannerChatbot';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5001';

const CareerPlannerPage = () => {
    const { t, i18n } = useTranslation(); // Get the i18n instance
    
    // Existing State
    const [skills, setSkills] = useState('');
    const [interests, setInterests] = useState('');
    const [goals, setGoals] = useState('');
    const [roadmap, setRoadmap] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRoadmapVisible, setIsRoadmapVisible] = useState(false);
    const [targetCompanies, setTargetCompanies] = useState('');
    
    // UPDATED State with new options and defaults
    const [status, setStatus] = useState('Class 12th Student');
    const [education, setEducation] = useState('');

    const generateRoadmap = async (e) => {
        e.preventDefault();
        if (!skills || !interests || !goals) {
            setError(t('careerPlanner_error_fillFields'));
            return;
        }
        setError(''); setIsLoading(true); setRoadmap([]); setIsRoadmapVisible(true);
        try {
            const response = await fetch(`${API_URL}/generate-roadmap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skills, 
                    interests, 
                    goals, 
                    status, 
                    targetCompanies,
                    education,
                    language: i18n.language // <-- Language added here
                }),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const generatedSteps = await response.json();
            setRoadmap(generatedSteps);
        } catch (err) {
            console.error("Failed to fetch roadmap:", err);
            setError(t('careerPlanner_error_generateFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">{t('careerPlanner_title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">{t('careerPlanner_subtitle')}</p>
            </div>
            <div className="flex flex-col lg:flex-row">
                <UserInputForm
                    skills={skills} setSkills={setSkills}
                    interests={interests} setInterests={setInterests}
                    goals={goals} setGoals={setGoals}
                    status={status} setStatus={setStatus}
                    targetCompanies={targetCompanies} setTargetCompanies={setTargetCompanies}
                    education={education} setEducation={setEducation}
                    generateRoadmap={generateRoadmap}
                    isLoading={isLoading} error={error}
                />
                {!isRoadmapVisible ? <EmptyStateGraphic /> : <RoadmapDisplay isLoading={isLoading} roadmap={roadmap} />}
            </div>
            <CareerPlannerChatbot />
        </div>
    );
};

export default CareerPlannerPage;