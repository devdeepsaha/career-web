import React from 'react';
import { useTranslation } from 'react-i18next';
import LottieDisplay from '../../components/shared/LottieDisplay';

// Import your new scholarship animations
import scholarshipLight from '../../assets/study.json';
import scholarshipDark from '../../assets/study.json';

const ScholarshipEmptyState = () => {
    const { t } = useTranslation();

    return (
        <div className="pp-panel mx-auto max-w-md p-8">
            <LottieDisplay 
                lightAnimation={scholarshipLight}
                darkAnimation={scholarshipDark}
                text={t('scholarship_emptyStateText')}
            />
        </div>
    );
};

export default ScholarshipEmptyState;
