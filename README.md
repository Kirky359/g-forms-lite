# Google Forms Lite

A full-stack Google Forms clone with form building, quiz scoring, and response review.

**Live features:** create forms, add quiz questions with correct answers, submit responses, view per-response scores and correct/incorrect marks.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Monorepo | npm workspaces | Client and server share a `@forms/shared` types package without a separate registry |
| Shared types | TypeScript | Single source of truth for `Question`, `Form`, `Response` — both the GraphQL entities and client types implement these interfaces |
| API | NestJS + GraphQL (code-first) | Code-first means the schema is generated from TypeScript classes, keeping server types and the SDL in sync automatically |
| ORM | Prisma | Type-safe DB access with auto-generated client; migrations are explicit SQL files, not magic |
| Database | PostgreSQL | Relational structure is a natural fit (Forms → Questions, Responses → Answers with cascade deletes) |
| State / data fetching | Redux Toolkit Query | RTK Query handles caching and cache invalidation declaratively with tags — no manual refetch logic |
| Auth | Firebase Authentication | Handles Google OAuth, email/password, anonymous sign-in, and account linking without running an auth server |
| Frontend | React + TypeScript | — |
| Styling | SCSS Modules | Scoped class names prevent collisions; variables and mixins keep the design system consistent |
| Build | Vite | Fast HMR during development; proxies `/graphql` to the NestJS server so CORS is never an issue in dev |

---

## Architecture Decisions

### Why GraphQL instead of REST?

The client fetches forms with nested questions and responses with nested answers in a single request. With REST this would require multiple round-trips or over-fetching with a fat endpoint. GraphQL lets each page request exactly what it needs.

### Why code-first GraphQL?

In schema-first you write `schema.gql` and then hand-write resolver types that must stay in sync with it. Code-first generates `schema.gql` from the TypeScript decorators on entities and DTOs. One file to edit, schema never drifts.

### Why store `score` in the DB instead of recalculating on read?

Calculating score on every response read would require joining questions + answers on every `responses` query. Storing score at submission time is O(n) once; reading is O(1) forever. The tradeoff is that if you change a correct answer after responses are submitted, old scores are stale — acceptable for a forms tool.

### Why RTK Query instead of React Query or plain fetch?

RTK Query integrates directly with Redux, which already manages auth state. Tag-based cache invalidation (`["Form"]`, `["Responses"]`) means mutations automatically trigger refetches of related queries — no `useEffect` wiring. The GraphQL base query is a thin wrapper that injects the Firebase ID token on every request.

### Why Firebase Auth instead of custom JWT?

Custom JWT auth requires a token storage strategy, refresh logic, and a secrets management story. Firebase gives all of this for free. Account linking (`linkWithCredential`) lets a Google-OAuth user add email/password sign-in to the same account without creating a duplicate record.

### Why Prisma instead of raw SQL or another ORM?

Prisma generates a fully typed client from the schema, so a missing column or wrong field type is a compile error, not a runtime crash. Migrations are plain SQL files committed to the repo — easy to review and roll back.

### Why SCSS Modules instead of Tailwind?

Tailwind is faster for greenfield UI but makes component files noisy and makes design-system tokens (colors, spacing) implicit in class names. SCSS Modules keep styles colocated with components and centralise tokens in `_variables.scss`. The tradeoff is more files, but each component's styles are easy to find and change in isolation.

---

## Project Structure

```
Google-forms-lite/
├── packages/
│   ├── shared/                  # @forms/shared — types used by both client and server
│   │   └── src/
│   │       ├── types.ts         # Question, Form, Response, Answer interfaces
│   │       └── constants.ts     # MAX_TEXT_LENGTH etc.
│   │
│   ├── server/                  # NestJS GraphQL API
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # DB schema (source of truth for the database)
│   │   │   └── migrations/      # Plain SQL migration files
│   │   └── src/
│   │       ├── auth/            # Firebase Admin guard + CurrentUser decorator
│   │       ├── form/            # Form resolver, service, entity, DTO
│   │       ├── response/        # Response resolver, service, entity, DTO
│   │       ├── prisma/          # PrismaService (singleton injected via NestJS DI)
│   │       └── __tests__/       # Jest unit tests
│   │
│   └── client/                  # React SPA
│       └── src/
│           ├── components/      # QuestionEditor, QuestionRenderer, FormBuilderForm
│           ├── context/         # AuthContext (Firebase state + account linking)
│           ├── hooks/           # useFormBuilder, useFormFiller
│           ├── pages/           # FormBuilderPage, FormFillerPage, FormResponsesPage, …
│           ├── store/           # RTK Query base query + formsApi endpoints
│           ├── utils/           # quiz.ts (isAnswerCorrect, formatDisplayValue, …)
│           └── __tests__/       # Vitest unit tests
└── README.md
```

---

## Prerequisites

- Node.js 18+
- npm 7+
- PostgreSQL

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure server environment
cp packages/server/.env.example packages/server/.env
# Edit packages/server/.env:
#   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/forms"
#   PORT=4000

# 3. Configure client environment
cp packages/client/.env.example packages/client/.env
# Edit packages/client/.env with your Firebase project credentials

# 4. Run migrations
cd packages/server && npx prisma migrate dev && cd ../..

# 5. Build the shared package (required before running client or server)
npm run build --workspace=@forms/shared
```

---

## Running Locally

```bash
# Run client + server together
npm run dev
# Client → http://localhost:3000
# GraphQL → http://localhost:4000/graphql
```

---

## Tests

```bash
# Server (Jest)
npm test --workspace=server

# Client (Vitest)
npm test --workspace=client

# Watch mode (client)
npm run test:watch --workspace=client
```

**What is tested:**

- `response.service` — `calculateScore` for all question types (MULTIPLE_CHOICE, CHECKBOX, TEXT), partial scores, missing answers, and the null-score case for non-quiz forms
- `form.service` — `toFormEntity` transformation: options, correctAnswer, description null-handling
- `utils/quiz` — `isAnswerCorrect`, `formatDisplayValue`, `formatCorrectAnswer` including edge cases (order-independence, case-insensitivity, malformed JSON)
- `useFormFiller` — `validate()` (required fields, email format) and `toSubmitFormat()` (array serialization)
- `useFormBuilder` — add/remove/update questions, option management, `toMutationInput`, `initialize`, `reset`