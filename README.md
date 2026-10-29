# StudyFlow AI 📚

**Your Smart Study Planner** — a responsive, browser-based study planning prototype that helps students organize subjects, manage deadlines, and build a weekly study schedule.

> **Project status:** Front-end prototype. The study-plan generator uses rule-based scheduling in JavaScript; it does not currently call an AI model or external AI API.

## Features

- **Dashboard:** See completed tasks, planned study hours, upcoming deadlines, and a study streak.
- **Weekly planner:** Generate a suggested schedule using available daily study hours, preferred start time, deadlines, and task priorities.
- **Task management:** Add, edit, complete, delete, search, filter, sort, and reschedule tasks.
- **Subjects and deadlines:** Organize tasks by subject and review deadlines and subject-level progress.
- **Local persistence:** Keep planner data in your browser using `localStorage`.
- **Responsive layout:** Use the planner on desktop and smaller screens.
- **Login UI prototype:** Includes email/password validation and a show/hide password control.

## Built With

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`

No framework, package manager, or build step is required.

## Getting Started

1. Download or clone the repository:

   ```bash
   git clone https://github.com/laizadecena4-oss/StudyFlowAI.git
   ```

2. Open the project folder:

   ```bash
   cd StudyFlowAI
   ```

3. Open **`index.html`** in a modern web browser to use the study planner.

   To preview the login screen, open **`login.html`** (the uploaded source file is named `login(1).html`; rename it to `login.html` if needed).

## How to Use

1. Open **Subjects & deadlines** to add your subjects.
2. Open **My tasks** to add assignments, exams, projects, or study sessions with deadlines and priorities.
3. Open **Weekly planner** and select your available daily study hours and preferred start time.
4. Click **Generate my plan** to create a suggested schedule.
5. Mark tasks complete as you finish them. Use the dashboard to follow your progress.

**Note:** The scheduling logic prioritizes earlier deadlines and higher-priority tasks, with exam tasks used as a further tie-breaker. If no suitable slot is found, the app flags the task for attention.

## Project Structure

```text
StudyFlowAI/
├── index.html        # Main study planner interface
├── style.css         # Planner styles and responsive layout
├── script.js         # Task management, scheduling, and local storage
├── login.html        # Login interface (rename from login(1).html)
├── login.css         # Login page styles
├── login.js          # Client-side login form validation
└── README.md         # Project documentation
```

## Current Limitations

- **Authentication is not connected.** The login form validates inputs but does not sign users in; account creation and password reset are not implemented.
- **No AI service integration yet.** The automatic planner is currently a JavaScript scheduling algorithm.
- **Data is stored only in the current browser.** There is no database, account sync, or cloud backup.
- The interface starts with sample subjects and tasks to demonstrate the features.

## Possible Future Improvements

- Secure authentication and user accounts
- Cloud database and cross-device synchronization
- Optional AI-assisted study recommendations
- Calendar integration and deadline reminders
- Data export and import

## Repository

[StudyFlowAI on GitHub](https://github.com/laizadecena4-oss/StudyFlowAI)

---

*StudyFlow AI — plan smarter, stay organized, and make steady progress.*
