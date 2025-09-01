import React from 'react';
import { useTranslation } from 'react-i18next';
import LottieDisplay from '../../components/shared/LottieDisplay';

// Import your new scholarship animations
import scholarshipLight from '../../assets/study.json';
import scholarshipDark from '../../assets/study.json';

const ScholarshipEmptyState = () => {
    const { t } = useTranslation();

    return (
        <div className="lg:w-2/3 mt-12 lg:mt-0 max-w-sm mx-auto">
            <LottieDisplay 
                lightAnimation={scholarshipLight}
                darkAnimation={scholarshipDark}
                text={t('scholarship_emptyStateText')}
            />
        </div>
    );
};

export default ScholarshipEmptyState;