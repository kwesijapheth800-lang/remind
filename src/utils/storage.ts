import type { Lesson } from '../types'; /* <-- Added the 'type' keyword */

// Retrieve all saved lessons from local browser storage.
export async function getLessons(): Promise<Lesson[]> {
    const result = await chrome.storage.local.get("lessons");

    // Return an empty array when no lessons have been saved yet.
    // We use 'as Lesson[]' to tell TypeScript what shape this data is.
    return (result.lessons as Lesson[]) || [];
}

// Save a new lesson to the top of the existing list in local storage.
export async function saveLesson(newLesson: Lesson): Promise<void> {
    const lessons = await getLessons();

    // Add the new lesson to the beginning of the array so the newest
    // insights always appear first.
    lessons.unshift(newLesson);

    await chrome.storage.local.set({ lessons });
}

// Clear all lessons (Useful for debugging and settings)
export async function clearAllLessons(): Promise<void> {
    await chrome.storage.local.remove("lessons");
}

// Update an existing lesson
export async function updateLesson(updatedLesson: Lesson): Promise<void> {
    const lessons = await getLessons();
    const index = lessons.findIndex(l => l.id === updatedLesson.id);

    if (index !== -1) {
        lessons[index] = updatedLesson;
        await chrome.storage.local.set({ lessons });
    }
}

// Delete a single lesson by its ID
export async function deleteLesson(id: string): Promise<void> {
    const lessons = await getLessons();
    const filteredLessons = lessons.filter(lesson => lesson.id !== id);
    await chrome.storage.local.set({ lessons: filteredLessons });
}

