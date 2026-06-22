import React from 'react';
import { useTranslation } from 'react-i18next';
// --- FIX: Corrected the import path to go up two directories ---
import LottieDisplay from '../../components/shared/LottieDisplay'; 

import lightAnimation from '../../assets/cat.json';
import darkAnimation from '../../assets/cat-dark.json';

const EmptyStateGraphic = () => {
    const { t } = useTranslation();

    return (
        <div className="mx-auto max-w-sm py-8">
            <LottieDisplay 
                lightAnimation={lightAnimation}
                darkAnimation={darkAnimation}
                text={t('emptyState_roadmapText')}
            />
        </div>
    );
};

export default EmptyStateGraphic;
