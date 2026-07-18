// Define the exact structure of our saved lessons. 
// This strict typing prevents bugs when saving or retrieving data.

export interface Source {
    title: string;
    url: string;
    domain: string;
}

export interface Reminder {
    enabled: boolean;
    nextReminderAt: string;
    reminderInterval: string;
}

export interface Reflection {
    hasReflected: boolean;
    hasActed: boolean;
    lastReflection: string | null;
    lastAction: string | null;
}

export interface Lesson {
    id: string;
    lessonText: string;
    personalNote?: string;
    category: string;
    tags: string[];
    source: {
        title: string;
        url: string;
        domain: string;
    };
    createdAt: string;
    reminder: {
        enabled: boolean;
        nextReminderAt: string;
        reminderInterval: string;
        isCurrentlyShowing: boolean;
    };
    reflection: {
        hasReflected: boolean;
        hasActed: boolean;
        lastReflection: string | null;
        lastAction: string | null;
    };
    archived: boolean;
}