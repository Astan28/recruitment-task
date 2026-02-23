
# New Recruitment API


A modern API application for managing candidates and job offers, built with NestJS, TypeORM, and SQLite. The system is fully compatible with the existing (legacy) Express.js API and enables candidate synchronization between systems.

## Why NestJS?

I went with NestJS since it's the framework I'm most comfortable with. I could have stuck with Express to match the legacy API, but NestJS's modular structure and built-in testing utilities felt like a better fit for keeping this codebase clean and maintainable.

## Features
- Create candidates with job offer association
- Candidate validation and pagination
- Synchronization with legacy API (Express.js) with rollback support
- E2E tests (Jest)
- Containerization (Docker, Docker Compose)

## Requirements
- Node.js 18+
- Docker & Docker Compose (optional, for running the whole stack in containers)

## Configuration
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd recruitment-task/new-recruitment-api
   ```
2. Create a `.env` file based on `.env.example` and fill in the required variables:
   ```env
   PORT=3000
   LEGACY_API_URL=http://legacy-api:4040
   LEGACY_API_KEY=supersecretkey
   ```

## Local Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the API:
   ```bash
   npm run start
   ```
3. The API will be available at: http://localhost:3000

## Run with Docker
1. In the project root directory, run:
   ```bash
   docker-compose up --build
   ```
2. New API: http://localhost:3000
   
   Legacy API: http://localhost:4040

## Tests
- E2E tests:
  ```bash
  npm run test:e2e
  ```

## API Documentation
- REST endpoints:
  - `POST /candidates` — create a candidate
  - `GET /candidates` — list candidates with pagination


## Legacy API Synchronization
- After creating a candidate, data is automatically sent to the legacy API.
- If synchronization fails, the operation is rolled back.

