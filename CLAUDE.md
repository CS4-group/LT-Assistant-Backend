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

`MongoDatabase` connects to MongoDB via the `mongodb` native driver. It provides `findAll`, `findById`, `find`, `insert`, `update`, `delete`, `deleteWhere`, `saveAll`, `getStats`, `getLastModified`, and rating-aggregation helpers (`getAverageRating`, `getWithRating`, `getAllWithRatings`, `getPaginatedWithRatings`). Call `connect()` before use and `close()` for graceful shutdown. All methods are async. The `_id` field is suppressed from all query results via projection.

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
| `/api/health` | `server.js` (inline) | None | Health check (returns timestamp) |
| `/api/auth` | `routes/auth.js` | Per-route | Signup, email confirmation, resend confirmation, login, logout, me |
| `/api/user` | `routes/user.js` | Required | Profile, onboarding goals |
| `/api/courses` | `routes/courses.js` | Required | CRUD + ratings + `/names` endpoint; supports `?limit&offset` pagination |
| `/api/teachers` | `routes/teachers.js` | Required | CRUD + ratings; supports `?limit&offset` pagination |
| `/api/clubs` | `routes/clubs.js` | Required | CRUD + ratings; supports `?limit&offset` pagination |
| `/api/reviews` | `routes/reviews.js` | Required | CRUD, like/unlike; returns `userLiked` per review |
| `/api/chatbot` | `routes/chatbot.js` | Required | Gemini AI counselor chatbot (gemini-2.5-flash) |
| `/api/planner` | `routes/planner.js` | Required | 4-year course planner (add/remove/move/reset) |

### Authentication (`middleware/auth.js`)

`requireAuth(db)` — reads JWT from httpOnly cookie (`token`), verifies with `jsonwebtoken`, checks `isConfirmed`, attaches `req.user = { id, email, name }`. Returns 401 if missing/invalid, 403 if unconfirmed. Applied globally in `server.js` to all non-auth routes.

Auth uses email/password with bcrypt (12 rounds). Signup requires email confirmation via Resend. JWTs are stored in httpOnly secure sameSite strict cookies (7-day expiry). Rate limiting (10 req/15 min) on all `/api/auth` routes. Input validation via `express-validator`. Security headers via `helmet`. CORS locked to `https://ltassistant.com` and `https://www.ltassistant.com` with credentials.

### Review System

Reviews link to entities via `entityType` (`course`, `teacher`, `club`) and `entityId`. The database computes average ratings by querying the `reviews` collection. Likes are tracked in a separate `review_likes` collection. Entity routes (courses, teachers, clubs) return computed `rating` and `reviewCount` fields.

### Course Planner

The planner stores an object on the user record (`user.coursePlan`) with the shape `{ freshman|sophomore|junior|senior: { fall: [courseId], spring: [courseId] } }`. The API enriches course IDs into full course objects on read.

## Environment Variables

Required in `.env`: `MONGODB_URI`, `JWT_SECRET`, `RESEND_API_KEY`, `GEMINI_API_KEY`, `PORT`.

## MongoDB Indexes

The migration script (`migrate-to-mongo.js`) creates indexes: unique `{ id }` on all entity collections, compound `{ entityType, entityId }` on reviews, `{ userId, reviewId }` on review_likes, and unique `{ email }` + sparse `{ confirmationToken }` on users. Server startup also ensures the user email and confirmation token indexes.

## Data

Data is stored in MongoDB. The `./data/` directory is referenced by the migration script but the JSON backup files are not tracked in git. Run `npm run migrate` to load them into MongoDB (idempotent — drops and re-inserts).

## Response Format

All endpoints return `{ success: boolean, data?: ..., message?: string, error?: string }`.
