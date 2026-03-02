# Trainee Front-End Developer Test Task: Google Forms Lite Clone

## Objective

Create a simplified clone of Google Forms with core functionality for form creation, viewing, and submission. The project must be structured as a monorepo, utilizing TypeScript, React, and Redux on the front-end, and a simple GraphQL server on the back-end for data storage.

## Technologies to Use

- **Front-End:** React, TypeScript, Redux (RTK), React Router (or similar), a basic styling solution (e.g., plain CSS/SCSS modules, styled-components, or Tailwind CSS).
- **Back-End:** Node.js, GraphQL a simple in-memory data store (no database). No authentication required.
- **Project Structure:** Monorepo

---

## Core Features & Requirements

### 1. Monorepo Setup

- The project **must** be a monorepo containing:
  - `client` (for the React application)
  - `server` (for the GraphQL API)
- Set up scripts to run both the client and server concurrently during development.

### 2. Back-End (`server`)

- **GraphQL API:** Implement a basic GraphQL server.
- **Schema Definition:** Define GraphQL types and queries/mutations for the following types:

  - **`Form`:** (with list of questions)
  - **`Question`:** (should support types like `TEXT`, `MULTIPLE_CHOICE`, `CHECKBOX`, `DATE`)
  - **`Response`:** (with form ID, and list of answers)
  - **`Answer`:** (answer to specific question)

- **Queries:**

  - `forms`: Returns a list of all created forms.
  - `form(id: ID!): Form`: Returns a single form by its ID.
  - `responses(formId: ID!): [Response!]`: Returns all responses for a given form ID.

- **Mutations:**

  - `createForm(title: String!, description: String, questions: [QuestionInput]): Form`: Creates a new form.
  - `submitResponse(formId: ID!, answers: [AnswerInput]): Response`: Submits a new response for a form.

- **Data Storage:** Use a simple in-memory store (e.g., a JavaScript array of objects or a Map) for forms and responses. Data does not need to persist across server restarts, but it should function correctly for the duration of the running server.

### 3. Front-End (`client`)

- **React + TypeScript:** All components and state management must be written in TypeScript, leveraging type definitions from the GraphQL schema where appropriate.
- **Redux (RTK):** Manage the application state using Redux Toolkit. This should include:
  - State for forms (list, current form being created/viewed).
  - State for responses.
  - Utilize **RTK Query** for simplified data fetching and caching from the GraphQL API. please, consider using [code generation](https://redux-toolkit.js.org/rtk-query/usage/code-generation)
- **Pages/Routes:**

  - **Homepage (`/`):**
    - Displays a list of all created forms (Form Title, description).
    - Each form should have a link to "View Form" (for filling out) and "View Responses".
    - A prominent button/link to "Create New Form".
  - **Form Builder (`/forms/new`):**
    - Allows creation of a new form.
    - Inputs for Form Title and Description.
    - **Question Management:**
      - Add new questions of different types: Text Input, Multiple Choice, Checkboxes, Date.
      - For Multiple Choice/Checkboxes: Allow adding/removing options for each question.
      - Display questions in a list, allowing for visual arrangement.
      - Ability to save the form (triggering a GraphQL mutation).
  - **Form Filler (`/forms/:id/fill`):**
    - Displays a specific form based on its ID.
    - Renders the appropriate input fields for each question type (text input, radio buttons, checkboxes, date picker).
    - A "Submit" button to send the responses to the back-end via a GraphQL mutation.
    - After submission, provide basic user feedback (e.g., "Form submitted successfully!" or an error message).
  - **Form Responses (`/forms/:id/responses`):**
    - Displays all submitted responses for a specific form based on its ID.
    - Present the answers in a readable format, linking answers back to their respective questions.

---

## Deliverables

- A link to a Git repository (e.g., GitHub, GitLab, Bitbucket) containing the monorepo.
- A clear `README.md` file in the root of the repository with:
  - Detailed instructions on how to set up and run both the client and server locally.

## Evaluation Criteria

- **Monorepo Setup:** Correct and functional monorepo configuration.
- **Front-End Implementation:**
  - Clean component structure and separation of concerns.
  - Proper data fetching and mutation handling with RTK Query.
  - **Minimal amount of TS in components; please write business logic in separate services/hooks/utils etc.**
- **Back-End Implementation:**
  - Correct GraphQL schema definition.
  - Proper implementation of queries and mutations.
- **Code Quality:** Readability, maintainability, consistent coding style, use of best practices.
- **Error Handling:** Basic error handling (e.g., loading states, displaying error messages).

---

## Bonus Points (Optional)

- Add basic client-side form validation (e.g., required fields, specific input formats).
- Unit/Integration tests for critical parts of the application (e.g., Redux slices, GraphQL resolvers, key React components).
