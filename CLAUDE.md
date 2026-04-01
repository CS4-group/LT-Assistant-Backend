# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Run the server (node server.js)
npm run dev        # Same as npm start (no hot-reload configured)
npm install        # Install dependencies
npm run migrate    # Migrate JSON data files to MongoDB (idempotent)
```

There is no build step, no linter, and no test framework configured.

## Architecture

This is an Express.js (CommonJS) backend for **LT Assistant**, a high school course planning and review app. It uses MongoDB (native driver) for data storage.

### Database Layer (`database.js`)

`MongoDatabase` connects to MongoDB via the `mongodb` native driver. It provides `findAll`, `findById`, `find`, `insert`, `update`, `delete`, `deleteWhere`, and rating-aggregation helpers (`getAverageRating`, `getWithRating`, `getAllWithRatings`). All methods are async. The constructor takes a MongoDB URI; call `connect()` before use. The `_id` field is suppressed from all query results via projection.

### Route Pattern

Every route file exports a **factory function** that receives the `db` instance:

```js
module.exports = (db) => {
  const router = express.Router();
  // ... define routes ...
  return router;
};
```

Routes are mounted in `server.js` under `/api/<resource>`.

### API Routes

| Prefix | File | Auth | Purpose |
|---|---|---|---|
| `/api/auth` | `routes/auth.js` | None / JWT | Google OAuth sign-in, token verify, logout |
| `/api/user` | `routes/user.js` | Required | Profile, onboarding goals |
| `/api/courses` | `routes/courses.js` | None | CRUD + ratings |
| `/api/teachers` | `routes/teachers.js` | None | CRUD + ratings |
| `/api/clubs` | `routes/clubs.js` | None | CRUD + ratings |
| `/api/reviews` | `routes/reviews.js` | Mixed | CRUD, like/unlike (auth required for writes; optional for reads to attach `userLiked`) |
| `/api/chatbot` | `routes/chatbot.js` | None | Gemini AI counselor chatbot |
| `/api/planner` | `routes/planner.js` | Required | 4-year course planner (add/remove/move/reset) |

### Authentication (`middleware/auth.js`)

- **Required**: `authMiddleware(db)` — rejects 401 if no valid Bearer JWT.
- **Optional**: `authMiddleware.optional(db)` — attaches `req.user` if token present, continues otherwise. Used by review reads.

JWTs are signed with `JWT_SECRET` and contain `{ userId, email }`. Google OAuth verifies ID tokens via `google-auth-library`.

### Review System

Reviews link to entities via `entityType` (`course`, `teacher`, `club`) and `entityId`. The database computes average ratings by querying the `reviews` collection. Likes are tracked in a separate `review_likes` collection. Entity routes (courses, teachers, clubs) return computed `rating` and `reviewCount` fields.

### Course Planner

The planner stores an object on the user record (`user.coursePlan`) with the shape `{ freshman|sophomore|junior|senior: { fall: [courseId], spring: [courseId] } }`. The API enriches course IDs into full course objects on read.

## Environment Variables

Required in `.env`: `MONGODB_URI`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `PORT`.

## Data

Data is stored in MongoDB. The original JSON files in `./data/` are kept as backups. Run `npm run migrate` to load them into MongoDB.

## Response Format

All endpoints return `{ success: boolean, data?: ..., message?: string, error?: string }`.
