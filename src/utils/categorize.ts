// src/utils/categorize.ts

/**
 * A lightweight local categorization system.
 * Scans the saved text for keywords to automatically suggest a category.
 * If no clear match is found, it defaults to "Other".
 */
export function suggestCategory(text: string): string {
    const normalizedText = text.toLowerCase();

    // Discipline
    if (
        normalizedText.includes("discipline") ||
        normalizedText.includes("habit") ||
        normalizedText.includes("consistency") ||
        normalizedText.includes("routine")
    ) {
        return "Discipline";
    }

    // Money
    if (
        normalizedText.includes("money") ||
        normalizedText.includes("wealth") ||
        normalizedText.includes("invest") ||
        normalizedText.includes("finance")
    ) {
        return "Money";
    }

    // Relationships
    if (
        normalizedText.includes("relationship") ||
        normalizedText.includes("friend") ||
        normalizedText.includes("love") ||
        normalizedText.includes("partner")
    ) {
        return "Relationships";
    }

    // Learning / Mindset
    if (
        normalizedText.includes("learn") ||
        normalizedText.includes("study") ||
        normalizedText.includes("mindset") ||
        normalizedText.includes("knowledge")
    ) {
        return "Learning";
    }

    // Health
    if (
        normalizedText.includes("health") ||
        normalizedText.includes("workout") ||
        normalizedText.includes("sleep") ||
        normalizedText.includes("diet")
    ) {
        return "Health";
    }

    // Fallback
    return "Other";
}