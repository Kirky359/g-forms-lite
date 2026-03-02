# Google Forms Lite Clone

A simplified clone of Google Forms with form creation, filling, and response viewing.

## Tech Stack

- **Monorepo:** npm workspaces
- **Shared:** TypeScript types (Form, Question, Response, Answer)
- **Server:** NestJS, GraphQL (Apollo), in-memory store
- **Client:** React, TypeScript, Redux Toolkit, RTK Query, React Router v6, CSS Modules

## Prerequisites

- Node.js 18+
- npm 7+

## Setup

1. Clone the repository and navigate to the project directory:

   ```bash
   cd TT_task
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the shared package (required before running client/server):

   ```bash
   npm run build --workspace=@forms/shared
   ```

## Running Locally

### Option 1: Run everything together

```bash
npm run dev
```

This builds the shared package, then runs both the server and client concurrently.

- **Client:** http://localhost:3000  
- **Server (GraphQL):** http://localhost:4000/graphql  

### Option 2: Run separately

Terminal 1 – Server:

```bash
npm run dev:server
```

Terminal 2 – Client (ensure shared is built first):

```bash
npm run build --workspace=@forms/shared
npm run dev:client
```

## Project Structure

```
TT_task/
├── packages/
│   ├── shared/     # Shared TypeScript types
│   ├── server/     # NestJS GraphQL API
│   └── client/     # React SPA
├── package.json
└── README.md
```

## Features

- **Homepage:** List all forms with links to fill or view responses
- **Form Builder:** Create forms with Text, Multiple Choice, Checkbox, and Date questions
- **Form Filler:** Fill out forms and submit responses
- **Responses:** View all submitted responses for a form
