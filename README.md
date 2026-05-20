# CRM Customer 360 - Next.js Web App

Customer Relationship Management system built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- Framework: Next.js 16
- Language: TypeScript
- UI: Tailwind CSS + shadcn/ui
- State Management: React Query + Zustand
- Forms: React Hook Form + Zod
- HTTP Client: Axios

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Project Structure

```text
src/
├── app/                # App Router pages and layouts
├── components/
│   ├── auth/           # Auth-specific UI
│   ├── layout/         # Shared layout UI
│   ├── ui/             # Reusable primitive UI components
│   └── users/          # User management feature UI
├── helper/             # Small UI/auth helpers
├── hooks/              # Reusable hooks with shared logic
├── lib/
│   ├── api/            # API client and endpoint helpers
│   └── utils.ts        # Generic utilities
├── models/             # Domain models
├── services/           # Service layer
├── store/              # Zustand stores
├── types/              # Shared TypeScript types
└── middleware.ts       # Route protection / middleware
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## Conventions

- App code filenames inside `src/` must use `camelCase` or `PascalCase`.
- Do not use `-` in app code filenames.
- If multiple UI components only serve one feature or one screen, group them by feature instead of splitting into many tiny files.
- Keep shared, generic UI in `components/ui`; keep feature-only UI close to that feature.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Private - Internal Use Only
