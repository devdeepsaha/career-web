import React from 'react';
import { BookOpenIcon } from '../../components/icons/BookOpenIcon';
import { WrenchIcon } from '../../components/icons/WrenchIcon';
import { LightbulbIcon } from '../../components/icons/LightbulbIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';

export const stepTypeConfig = {
    course: { icon: <BookOpenIcon />, title: "Recommended Course", bgColor: "bg-indigo-50 dark:bg-indigo-900/20", borderColor: "border-indigo-500" },
    project: { icon: <WrenchIcon />, title: "Hands-on Project", bgColor: "bg-green-50 dark:bg-green-900/20", borderColor: "border-green-500" },
    skill: { icon: <LightbulbIcon />, title: "Skill to Acquire", bgColor: "bg-yellow-50 dark:bg-yellow-900/20", borderColor: "border-yellow-500" },
    mentor: { icon: <UsersIcon />, title: "Networking & Mentorship", bgColor: "bg-sky-50 dark:bg-sky-900/20", borderColor: "border-sky-500" },
};