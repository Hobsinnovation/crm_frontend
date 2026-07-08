# HOBS CRM — Frontend

A modern, responsive Customer Relationship Management (CRM) web application built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. This is the client-side application of the HOBS CRM platform, delivering a fast and intuitive user experience.

<p>
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js 15">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/shadcn%2Fui-Components-000000?style=flat-square" alt="shadcn/ui">
  <img src="https://img.shields.io/badge/Status-In%20Development-yellow?style=flat-square" alt="Status">
</p>

---

## 📋 Overview

HOBS CRM Frontend is a Single Page Application (SPA) that communicates with the [Laravel 12 backend API](https://github.com/Hobsinnovation/crm_backend). It provides dashboards and management interfaces for clients, leads, domains, invoices, and system administration.

## ✨ Features

- **Modern UI/UX** — Clean, accessible interface built with shadcn/ui components
- **Type Safety** — Fully typed codebase with TypeScript
- **Responsive Design** — Mobile-first layouts powered by Tailwind CSS
- **App Router** — Next.js 15 App Router with server and client components
- **API Integration** — Centralized API client layer for backend communication
- **Authentication** — Secure token-based login flow *(Phase 2)*
- **Role-Based Views** — UI adapts to user roles and permissions *(Phase 2)*
- **Admin Dashboard** — Analytics, user management, and system controls *(Phase 2)*

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| HTTP Client | Fetch API (custom client layer) |
| Backend API | Laravel 12 + Sanctum |

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.18
- npm >= 9.x (or yarn / pnpm)
- Running instance of the [backend API](https://github.com/Hobsinnovation/crm_backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hobsinnovation/crm_frontend.git
   cd crm_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**

   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
crm_frontend/
├── src/
│   ├── app/           # Next.js App Router pages & layouts
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities & API client
│   ├── services/      # API service functions
│   └── styles/        # Global styles
├── public/            # Static assets
├── .env.local         # Environment variables (not committed)
├── tailwind.config.ts # Tailwind configuration
└── tsconfig.json      # TypeScript configuration
```

## 📜 Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create optimized production build
npm run start    # Run production server
npm run lint     # Run ESLint checks
```

## 🧭 Roadmap

- [x] **Phase 1** — Project scaffolding, TypeScript, Tailwind & shadcn/ui setup, API client layer
- [ ] **Phase 2** — Authentication pages (login/register), protected routes, admin dashboard
- [ ] **Phase 3** — Client, lead, and domain management interfaces
- [ ] **Phase 4** — Invoicing UI, notifications center, and activity logs
- [ ] **Phase 5** — Performance optimization, testing, and deployment

## 🤝 Related Repositories

- **Backend:** [crm_backend](https://github.com/Hobsinnovation/crm_backend) — Laravel 12 REST API

## 📄 License

This project is proprietary software developed by **Hobs Innovation**. All rights reserved.

---

<p align="center">Built with ❤️ by <a href="https://github.com/Hobsinnovation">Hobs Innovation</a></p>