````markdown
# Remind

> A personal memory system for the lessons you don't want to forget.

Remind is a local-first Brave browser extension designed to help you capture valuable lessons, advice, and ideas from the internet — then bring them back to your attention later.

Because consuming advice is easy.

Remembering it when you actually need it is the hard part.

---

## The Problem

We constantly consume valuable information.

We watch videos, read articles, browse social media, and discover ideas that genuinely resonate with us.

We think:

> "I need to remember this."

Then a few days later, we forget.

Remind is built around a simple idea:

> **We often need to be reminded more than we need to be taught.**

Instead of trying to make learning feel like school, Remind helps you save the ideas that matter and brings them back when you need to see them again.

---

## Core Concept

The workflow is simple:

```text
Discover something valuable
          ↓
Save the lesson
          ↓
Add optional context
          ↓
Choose when to be reminded
          ↓
See it again later
          ↓
Reflect on whether it mattered
          ↓
Take action
````

Remind is not designed to be a flashcard app.

It is not designed to test your memory.

It is not designed to turn personal growth into a game.

It is designed to help valuable ideas stay present in your life.

---

## Features

### Capture Lessons

Save highlighted text from webpages directly through the browser.

The extension can capture:

* The selected lesson
* The page title
* The source URL
* The website/domain
* The date it was saved

---

### Personal Context

Add an optional personal note explaining why the lesson matters to you.

For example:

> "I keep waiting until I feel motivated. I need to build systems instead."

The lesson is the idea.

The personal note is why it matters to you.

---

### Automatic Categorization

Remind can suggest a category for a saved lesson based on its content.

Possible categories include:

* Discipline
* Motivation
* Money
* Career
* Relationships
* Health
* Learning
* Creativity
* Philosophy
* Psychology
* Productivity

Categories can be edited by the user.

---

### Search

Search your personal library of saved lessons.

Search through:

* Lesson text
* Personal notes
* Categories
* Tags

---

### Reminders

Choose when a lesson should return to your attention.

The goal is not to force memorization.

The goal is to ask:

> **"You saved this because it mattered to you. Has it mattered in your life since then?"**

---

### Reflection

When a lesson returns, Remind can ask:

* Have you reflected on this?
* Have you acted on this?
* Should you be reminded about this again later?

No quizzes.

No scores.

No leaderboards.

No streaks.

Just the idea returning at the right time.

---

## Design Philosophy

Remind is built around five principles:

### 1. Low Friction

Saving something valuable should take seconds.

If saving a lesson feels like work, the system has failed.

---

### 2. Local First

Your lessons belong to you.

The first version stores data locally in your browser using:

```text
chrome.storage.local
```

No account is required.

No backend is required.

No cloud database is required.

---

### 3. Reflection Over Memorization

Remind does not ask:

> "Can you recite this lesson?"

It asks:

> "Did this idea change anything?"

---

### 4. Simplicity Over Feature Bloat

The product should remain focused.

Remind is not trying to become:

* A social network
* A productivity suite
* A learning platform
* A complicated second brain

The goal is simple:

> Save what matters. Be reminded of it later.

---

### 5. Beautiful but Practical

The interface is inspired by modern productivity products such as Linear.

The design direction focuses on:

* Clean interfaces
* Clear typography
* Calm visual hierarchy
* Light and dark themes
* Subtle animations
* Purple/blue accent colors
* Minimal visual noise

---

## Technology Stack

Remind is built using modern web technologies:

* React
* TypeScript
* Vite
* Manifest V3
* Chrome Extension APIs
* Brave Browser
* Local browser storage

The extension is designed to work with Chromium-based browsers, with Brave as the primary target.

---

## Project Structure

```text
remind/
│
├── public/
│   └── icons/
│       └── Extension icons
│
├── src/
│   ├── components/
│   │   └── Reusable UI components
│   │
│   ├── pages/
│   │   └── Application views
│   │
│   ├── services/
│   │   └── Storage and browser API logic
│   │
│   ├── types/
│   │   └── TypeScript types
│   │
│   └── App.tsx
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

The exact structure may evolve as the project grows.

---

## Getting Started

### Prerequisites

You need:

* Node.js
* npm
* Brave Browser
* Git (optional but recommended)

---

### Install the Project

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/remind.git
```

Move into the project directory:

```bash
cd remind
```

Install dependencies:

```bash
npm install
```

---

### Start Development

Run the development server:

```bash
npm run dev
```

---

### Build the Extension

Create a production build:

```bash
npm run build
```

The production files will be generated in the build output directory.

---

## Installing the Extension in Brave

After building the extension:

1. Open Brave.
2. Navigate to:

```text
brave://extensions
```

3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the generated extension build folder.

The extension should now appear in your installed extensions.

---

## Development Philosophy

Remind is being built incrementally.

The project prioritizes:

1. A reliable core experience
2. Simple architecture
3. Maintainable code
4. Clear user experience
5. Local data ownership
6. Useful features over unnecessary features

The project should not attempt to build everything at once.

---

## Roadmap

### Phase 1 — Foundation

* [x] Create the React + TypeScript project
* [x] Set up Vite
* [x] Initialize Git
* [ ] Configure the Manifest V3 extension
* [ ] Add extension icons
* [ ] Load the extension in Brave

---

### Phase 2 — Core UI

* [ ] Build the extension popup
* [ ] Create the Remind design system
* [ ] Add light and dark themes
* [ ] Add the primary accent color
* [ ] Build the lesson card
* [ ] Build the save lesson interface

---

### Phase 3 — Local Storage

* [ ] Save lessons locally
* [ ] Read saved lessons
* [ ] Edit lessons
* [ ] Delete lessons
* [ ] Persist data between browser sessions

---

### Phase 4 — Lesson Capture

* [ ] Capture highlighted webpage text
* [ ] Add right-click save functionality
* [ ] Capture webpage title
* [ ] Capture source URL
* [ ] Capture domain
* [ ] Add keyboard shortcut support

---

### Phase 5 — Organization

* [ ] Add categories
* [ ] Add tags
* [ ] Add personal notes
* [ ] Add automatic category suggestions
* [ ] Add lesson search
* [ ] Add source information panel

---

### Phase 6 — Reminders

* [ ] Add reminder scheduling
* [ ] Add due lesson display
* [ ] Add reminder postponement
* [ ] Add reflection prompts
* [ ] Add action tracking

---

## Privacy

The first version of Remind is designed to be local-first.

Your saved lessons are stored locally in your browser.

The project does not currently require:

* User accounts
* Cloud synchronization
* A backend server
* External AI APIs
* Paid services

---

## Status

🚧 **Early Development**

Remind is currently being built as a personal-use project.

The product and architecture may change as the project evolves.

---

## Philosophy

Most advice is not forgotten because it was useless.

It is forgotten because life gets loud.

Remind exists to bring useful ideas back into your attention.

> **Save what matters. Be reminded when it matters again.**

---

## License

This project is currently intended for personal use.

The license may be updated as the project develops.

````

