# Workload Manager Project Documentation

## 📖 Overview
The Workload Manager is a modern, full-stack enterprise application designed to manage employee tasks, roles, and profiles. It features a secure role-based access control (RBAC) system, interactive optimistic UI updates, and an elegant, flat-design Material UI (MUI) frontend inspired by platforms like Vercel and Stripe.

---

## 🛠 Tech Stack

### Frontend
* **Framework:** React.js
* **Routing:** React Router DOM v7.15.0
* **UI/UX:** Material UI (MUI v7) + Emotion (Custom `theme.js`)
* **Icons:** `@mui/icons-material`
* **HTTP Client:** Axios
* **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`)

### Backend
* **Framework:** Laravel 10 (PHP)
* **Authentication:** Laravel Sanctum (Token-based SPA Auth)
* **Database:** MySQL
* **ORM:** Eloquent
* **Key Packages:** * Spatie Laravel Permission (RBAC)
  * Spatie Laravel MediaLibrary (Profile Avatars)

---

## ✨ Core Features

### 1. Authentication & Security
* Secure Login and Registration views.
* Token-based authentication using `localStorage` and Sanctum.
* Protected frontend routes ensuring users only access their designated workspaces.

### 2. Admin Operations Console
* **Task Engine:** Create and assign tasks to multiple employees simultaneously.
* **Execution Roster:** View all active company tasks, filterable by status, with visual node assignments.
* **Personnel Roster:** View active employees, search/sort records, and execute destructive database purges (revoking access).

### 3. Employee Dashboard
* Personalized "My Work" board displaying only assigned directives.
* **Optimistic UI:** Instant visual transitions for task statuses (Pending → In Progress → Completed) without waiting for full page reloads.

### 4. Profile & Asset Management
* Update personal details (Name, Email, Password).
* Upload and preview profile avatars.
* Utilizes `FormData` and `_method=PATCH` spoofing to handle binary file uploads to Laravel's protected storage vault.

---

## 🎨 UI/UX Design System
The application strictly adheres to a premium, minimalist design philosophy:
* **Palette:** Deep Slate (`#0f172a`) for primary actions, Emerald Green (`#10b981`) for accents, and a Soft Slate canvas (`#f8fafc`).
* **Elevation:** Flat surfaces with 0 elevation. Uses crisp 1px structural borders (`borderColor: 'divider'`) instead of heavy drop shadows.
* **Typography:** Strict hierarchy utilizing `text.primary` for headers and `text.secondary` for metadata. Buttons use `textTransform: 'none'` for readability.

---

## 🛡 Safety & Database Protocol
To ensure system integrity and prevent unintended data loss, the following protocol MUST be followed for all backend operations:

1.  **Mandatory Warnings:** Any command that modifies the database structure or state (e.g., `php artisan migrate`, `db:seed`, or direct SQL) must be preceded by a clear explanation of its impact.
2.  **Destructive Operations:** Commands like `migrate:fresh` or `migrate:reset` carry a **Critical Warning** as they wipe all existing data. These must only be used with explicit user acknowledgement or when necessary for core architectural changes.
3.  **Schema Evolution:** When adding new migrations, explain exactly what columns, indexes, or tables are being introduced and how they affect existing models.
4.  **Seeding:** Describe what "dummy" data is being injected and which existing records might be superseded.

---

## 🚀 Local Development Setup

### Backend Initialization
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Rebuild the database, seed dummy accounts, and link local storage
php artisan migrate:fresh --seed
php artisan storage:link

# Start the Laravel server
php artisan serve


