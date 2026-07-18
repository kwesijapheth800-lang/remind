// content.ts

// Listen for messages from our background timer
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.action === "show-reminder") {
        showReminderOverlay(message.lesson);
    }
});

function showReminderOverlay(lesson: any) {
    const existing = document.getElementById("remind-overlay-container");
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = "remind-overlay-container";

    // Premium Linear-style dark theme
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 380px;
        background-color: #0D0D12;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
        z-index: 2147483647; 
        color: #E2E8F0;
        font-family: system-ui, -apple-system, sans-serif;
        padding: 20px;
        box-sizing: border-box;
        animation: remind-slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    const style = document.createElement("style");
    style.textContent = `
        @keyframes remind-slide-down {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .remind-section { margin-bottom: 16px; }
        .remind-q { font-size: 13px; color: #94A3B8; margin-bottom: 8px; }
        .remind-btn-group { display: flex; gap: 8px; }
        .remind-btn {
            background: #1A1A24;
            border: 1px solid rgba(255,255,255,0.1);
            color: #E2E8F0;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            flex: 1;
            transition: all 0.2s ease;
        }
        .remind-btn:hover { background: rgba(255,255,255,0.15); }
        /* The beautiful Sky/Teal-Blue accent you requested */
        .remind-btn.active { background: #00C2FF; color: #0D0D12; border-color: #00C2FF; font-weight: 600; }
        .remind-footer-btn {
            width: 100%;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.1);
            color: #94A3B8;
            padding: 10px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            margin-top: 8px;
            transition: all 0.2s ease;
        }
        .remind-footer-btn:hover { color: #E2E8F0; background: rgba(255,255,255,0.05); }
    `;
    document.head.appendChild(style);

    // Build the UI exactly as requested: Lesson -> Reflect -> Act -> Later
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #00C2FF;"></div>
                <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #94A3B8;">REMIND</span>
            </div>
            <button id="remind-close" style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 20px; line-height: 1;">&times;</button>
        </div>
        
        <div style="margin-bottom: 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #FFFFFF; font-weight: 500;">"${lesson.lessonText}"</p>
        </div>

        <div class="remind-section">
            <div class="remind-q">Have you reflected on this?</div>
            <div class="remind-btn-group">
                <button class="remind-btn" id="btn-reflect-yes">Yes</button>
                <button class="remind-btn" id="btn-reflect-no">Not yet</button>
            </div>
        </div>

        <div class="remind-section">
            <div class="remind-q">Have you acted on it?</div>
            <div class="remind-btn-group">
                <button class="remind-btn" id="btn-act-yes">Yes</button>
                <button class="remind-btn" id="btn-act-no">Not yet</button>
            </div>
        </div>

        <button class="remind-footer-btn" id="btn-remind-later">Remind me later</button>
    `;

    document.body.appendChild(container);

    // --- State Tracking ---
    let state = { hasReflected: false, hasActed: false };

    // --- Button Logic ---
    const reflectYes = document.getElementById("btn-reflect-yes")!;
    const reflectNo = document.getElementById("btn-reflect-no")!;
    const actYes = document.getElementById("btn-act-yes")!;
    const actNo = document.getElementById("btn-act-no")!;

    const toggleGroup = (btnYes: HTMLElement, btnNo: HTMLElement, isYes: boolean) => {
        if (isYes) {
            btnYes.classList.add("active");
            btnNo.classList.remove("active");
        } else {
            btnNo.classList.add("active");
            btnYes.classList.remove("active");
        }
    };

    reflectYes?.addEventListener("click", () => { state.hasReflected = true; toggleGroup(reflectYes, reflectNo, true); });
    reflectNo?.addEventListener("click", () => { state.hasReflected = false; toggleGroup(reflectYes, reflectNo, false); });

    actYes?.addEventListener("click", () => { state.hasActed = true; toggleGroup(actYes, actNo, true); });
    actNo?.addEventListener("click", () => { state.hasActed = false; toggleGroup(actYes, actNo, false); });

    // --- Close & Save Logic ---
    const closeAndSave = (isSnooze: boolean) => {
        // Send the complete state to the background script
        chrome.runtime.sendMessage({
            action: "process-reflection",
            payload: {
                id: lesson.id,
                hasReflected: state.hasReflected,
                hasActed: state.hasActed,
                isSnooze: isSnooze // true if "Remind Later", false if normal close
            }
        });

        container.style.opacity = '0';
        container.style.transform = 'translateY(-10px)';
        container.style.transition = 'all 0.3s ease';
        setTimeout(() => container.remove(), 300);
    };

    // "Remind me later" acts as a snooze (overrides intervals, reminds tomorrow)
    document.getElementById("btn-remind-later")?.addEventListener("click", () => closeAndSave(true));

    // The 'X' saves their reflections and calculates the NEXT reminder based on custom intervals
    document.getElementById("remind-close")?.addEventListener("click", () => closeAndSave(false));
}