import React from 'react';
import i18n from '../../i18n'; // Import the i18n instance
import { BookOpenIcon } from '../../components/icons/BookOpenIcon';
import { WrenchIcon } from '../../components/icons/WrenchIcon';
import { LightbulbIcon } from '../../components/icons/LightbulbIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';

export const stepTypeConfig = {
    course: { 
        icon: <BookOpenIcon />, 
        title: i18n.t('stepType_course'), 
        bgColor: "bg-indigo-50 dark:bg-indigo-900/20", 
        borderColor: "border-indigo-500" 
    },
    project: { 
        icon: <WrenchIcon />, 
        title: i18n.t('stepType_project'), 
        bgColor: "bg-green-50 dark:bg-green-900/20", 
        borderColor: "border-green-500" 
    },
    skill: { 
        icon: <LightbulbIcon />, 
        title: i18n.t('stepType_skill'), 
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20", 
        borderColor: "border-yellow-500" 
    },
    mentor: { 
        icon: <UsersIcon />, 
        title: i18n.t('stepType_mentor'), 
        bgColor: "bg-sky-50 dark:bg-sky-900/20", 
        borderColor: "border-sky-500" 
    },
};