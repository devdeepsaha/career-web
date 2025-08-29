import React, { useState } from 'react';

// --- FIX: DEFINE THE API URL FOR VITE ---
const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5001';

const ScholarshipFinderPage = () => {
    const [marks, setMarks] = useState('');
    const [income, setIncome] = useState('');
    const [region, setRegion] = useState('India');
    const [destination, setDestination] = useState('India');
    const [religion, setReligion] = useState('');
    const [scholarships, setScholarships] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const findScholarships = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setScholarships([]);
        try {
            // --- FIX: USE THE API_URL VARIABLE IN THE FETCH CALL ---
            const response = await fetch(`${API_URL}/find-scholarships`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ marks, income, region, destination, religion })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setScholarships(data);
        } catch (err) {
            console.error("Failed to fetch scholarships:", err);
            setError("Could not find scholarships. Please ensure the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">Smart Scholarship Finder 🎓</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Find scholarships that match your profile, for studies in India and abroad.</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                    {/* Assuming your Form JSX goes here and uses the findScholarships function */}
                </div>
                <div className="lg:w-2/3">
                   {/* Assuming your Scholarship Results JSX goes here */}
                </div>
            </div>
        </div>
    );
};

export default ScholarshipFinderPage;