// background.ts
import { saveLesson } from '../utils/storage';
import type { Lesson } from '../types';
import { suggestCategory } from '../utils/categorize';

// --- CAPTURE: CONTEXT MENU ---
chrome.runtime.onInstalled.addListener(() => {
    // Clear existing menus first to prevent "duplicate ID" errors when reloading
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "save-to-remind",
            title: "Save to REMIND",
            contexts: ["selection"]
        });
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "save-to-remind" && info.selectionText) {
        let domain = "unknown";
        if (tab?.url) {
            try {
                domain = new URL(tab.url).hostname;
            } catch (e) {
                domain = "unknown";
            }
        }

        const newLesson: Lesson = {
            id: crypto.randomUUID(),
            lessonText: info.selectionText.trim(),
            category: suggestCategory(info.selectionText.trim()),
            tags: [],
            source: {
                title: tab?.title || "Unknown Page",
                url: tab?.url || "",
                domain: domain
            },
            createdAt: new Date().toISOString(),
            reminder: {
                enabled: true,
                nextReminderAt: new Date().toISOString(),
                reminderInterval: "daily",
                isCurrentlyShowing: false // Initialized safely
            },
            reflection: { hasReflected: false, hasActed: false, lastReflection: null, lastAction: null },
            archived: false
        };

        await saveLesson(newLesson);
    }
});

// --- CAPTURE: KEYBOARD SHORTCUT ---
chrome.commands.onCommand.addListener(async (command) => {
    if (command === "save-selection") {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) return;

        try {
            const injectionResults = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => window.getSelection()?.toString() || ""
            });

            const selectedText = injectionResults[0]?.result;

            if (selectedText && selectedText.trim().length > 0) {
                let domain = "unknown";
                if (tab.url) {
                    try { domain = new URL(tab.url).hostname; } catch (e) { }
                }

                const newLesson: Lesson = {
                    id: crypto.randomUUID(),
                    lessonText: selectedText.trim(),
                    category: suggestCategory(selectedText.trim()),
                    tags: [],
                    source: {
                        title: tab.title || "Unknown Page",
                        url: tab.url || "",
                        domain: domain
                    },
                    createdAt: new Date().toISOString(),
                    reminder: { enabled: true, nextReminderAt: new Date().toISOString(), reminderInterval: "daily", isCurrentlyShowing: false },
                    reflection: { hasReflected: false, hasActed: false, lastReflection: null, lastAction: null },
                    archived: false
                };

                await saveLesson(newLesson);
            }
        } catch (error) {
            console.error("Failed to capture text via shortcut:", error);
        }
    }
});


// --- ALARMS & NOTIFICATIONS ---
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'check-due-lessons') {
        // Explicitly type the incoming data so .filter() works without red lines
        const storageData = (await chrome.storage.local.get("lessons")) as { lessons?: Lesson[] };
        const lessons = storageData.lessons || [];
        const now = new Date().toISOString();

        const dueLessons = lessons.filter((lesson) =>
            lesson.reminder.enabled &&
            lesson.reminder.nextReminderAt <= now &&
            !lesson.reminder.isCurrentlyShowing
        );

        for (const lesson of dueLessons) {
            // 1. Lock the lesson so it doesn't loop
            lesson.reminder.isCurrentlyShowing = true;
            await chrome.storage.local.set({ lessons });

            // 2. Inject the content script overlay
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'show-reminder',
                        lesson: lesson
                    });
                }
            });
        }
    }
});


// --- PHASE 9: REFLECTION & INTERVAL LOGIC ---
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "process-reflection") {
        handleReflectionUpdate(message.payload).then(() => sendResponse({ success: true }));
        return true;
    }
});

async function handleReflectionUpdate(payload: any) {
    const { id, hasReflected, hasActed, isSnooze } = payload;

    const result = await chrome.storage.local.get("lessons");
    const lessons = (result.lessons as Lesson[]) || [];
    const lessonIndex = lessons.findIndex(l => l.id === id);

    if (lessonIndex === -1) return;
    const lesson = lessons[lessonIndex];
    const now = new Date();

    // 1. Save their reflections
    if (hasReflected) {
        lesson.reflection.hasReflected = true;
        lesson.reflection.lastReflection = now.toISOString();
    }
    if (hasActed) {
        lesson.reflection.hasActed = true;
        lesson.reflection.lastAction = now.toISOString();
    }

    // 2. Calculate the next reminder date
    const nextDate = new Date();

    if (isSnooze) {
        // Snooze always pushes it exactly 1 day into the future
        nextDate.setDate(nextDate.getDate() + 1);
    } else {
        // Fetch the GLOBAL setting from storage and explicitly type it for TypeScript
        const settingsRes = (await chrome.storage.local.get("settings")) as { settings?: { globalInterval?: string } };
        const globalInterval = settingsRes.settings?.globalInterval || 'daily'; // defaults to daily if not set
        // Apply the master interval
        if (globalInterval === 'daily') {
            nextDate.setDate(nextDate.getDate() + 1);
        } else if (globalInterval === '2days') {
            nextDate.setDate(nextDate.getDate() + 2);
        } else if (globalInterval === 'weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
        } else {
            nextDate.setDate(nextDate.getDate() + 1); // Fallback
        }
    }

    // 3. Save it back to local storage
    lesson.reminder.nextReminderAt = nextDate.toISOString();
    lessons[lessonIndex] = lesson;
    await chrome.storage.local.set({ lessons });
}