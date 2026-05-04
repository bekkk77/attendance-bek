# Project Overview: attendance-bek

A student management system (Оюутны удирдлага) built with Next.js 16 and React 19. The application manages student records, attendance (via QR codes), and course materials. It uses a local JSON-based storage system for data persistence.

## ⚠️ Critical Instruction: Next.js 16 Compatibility
This project uses **Next.js 16** and **React 19**, which contain breaking changes from previous versions. Standard training data may be outdated. 
- **Documentation:** Always refer to `node_modules/next/dist/docs/` for accurate API and convention guidance.
- **Heed Deprecation Notices:** Pay close attention to linter or runtime warnings about deprecated APIs.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Frontend:** React 19, Tailwind CSS 4
- **Icons:** Lucide-react
- **Data Handling:** `qrcode` for attendance tracking
- **Storage:** Local JSON files (`data/` directory)
- **UI Language:** Mongolian (mn)

## Project Structure
- `app/`: Next.js App Router pages and API routes.
    - `api/`: Backend logic for students, attendance, and materials.
- `lib/db.js`: Lightweight data access layer using Node.js `fs` to read/write JSON files in `data/`.
- `data/`: JSON database files (`students.json`, `attendance.json`, `materials.json`).
- `public/`: Static assets.

## Commands
| Task | Command |
| :--- | :--- |
| **Development** | `npm run dev` |
| **Build** | `npm run build` |
| **Production Start** | `npm run start` |
| **Testing** | (None configured) |

## Development Conventions
1. **Data Management:** Use the helpers in `lib/db.js` (`readData`, `writeData`) for all data operations. Do not access `data/` files directly in components or routes.
2. **UI Style:** Follow the established Sidebar/Main Content layout in `app/layout.js`. Use Tailwind CSS 4 for styling and Lucide-react for icons.
3. **Language:** The user interface is in Mongolian. Maintain consistency in labels and messages.
4. **API Handlers:** Use standard Next.js Route Handlers (GET, POST, etc.) in `app/api/.../route.js`.
5. **Client Components:** Use `'use client';` directive for interactive components that require state or effects (e.g., `app/page.js`, `app/attendance/page.js`).

## TODOs
- [ ] Implement automated testing (Jest/Cypress/Playwright).
- [ ] Add search and filtering to student and attendance lists.
- [ ] Implement user authentication for administrative actions.
