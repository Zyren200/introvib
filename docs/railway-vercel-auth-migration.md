# IntroVibe Railway + Vercel Migration

IntroVibe now has a Railway-ready backend layer for the active product flow.

## Production-backed features

These features now persist through Vercel API routes and Railway MySQL:

- Account registration
- Login
- Session restore (`/api/auth/me`)
- Logout
- Account deletion
- 5-question personality assessment save
- Healthy Tips flow unlock
- Sudoku completion save
- Sudoku draft board save/load
- User settings save/load
- Quiet mode and app stats save/load
- Direct chat history save/load
- Direct message read state
- Group chat creation
- Group chat history save/load
- Group message read state
- User list hydration for matching/dashboard after auth requests

## Database setup

Import these files into Railway MySQL in order:

1. `database/railway_mysql_schema.sql`
2. `database/railway_mysql_seed.sql`

The schema now includes:

- `user_sessions`
- `user_settings`
- `user_app_state`
- `sudoku_progress`
- direct chat tables
- group chat tables

## API routes added

- `api/auth/register.js`
- `api/auth/login.js`
- `api/auth/me.js`
- `api/auth/logout.js`
- `api/account/index.js`
- `api/users/index.js`
- `api/assessment/complete.js`
- `api/sudoku/complete.js`
- `api/sudoku/progress.js`
- `api/settings/index.js`
- `api/app-state/index.js`
- `api/chat/state.js`
- `api/chat/direct/send.js`
- `api/chat/direct/read.js`
- `api/chat/groups/create.js`
- `api/chat/groups/send.js`
- `api/chat/groups/read.js`

## Environment setup

Copy `.env.example` values into your local env file or your Vercel project.

Recommended production values:

- `VITE_INTROVIBE_AUTH_MODE=api`
- `DATABASE_URL=<your Railway MySQL connection string>`

Recommended local development values:

- `VITE_INTROVIBE_AUTH_MODE=hybrid`
- `DATABASE_URL=<your Railway MySQL connection string>`

## Hybrid fallback behavior

`npm start` runs the Vite frontend only.

That means:

- with `VITE_INTROVIBE_AUTH_MODE=hybrid`, the app can fall back to browser storage when the API is unavailable
- with `VITE_INTROVIBE_AUTH_MODE=api`, the app expects the Vercel/Railway backend to be reachable

## Remaining local-only usage

The main IntroVibe flow is backend-backed now. Remaining local storage usage is for fallback or legacy support:

- hybrid fallback caches in `src/introVibeAuth.jsx`
- hybrid fallback helpers in `src/lib/introVibeSettings.js`
- hybrid fallback helpers in `src/lib/introVibeAppState.js`
- hybrid fallback helpers in `src/lib/introVibeChat.js`
- hybrid fallback Sudoku draft cache in `src/pages/sudoku-puzzle/index.jsx`
- session token storage in `src/lib/introVibeApi.js`
- older unused prototype file `src/context/AuthContext.jsx`
- currently unused UI-only components `src/components/ui/SessionTimer.jsx` and `src/components/ui/SupportivePrompts.jsx`

If you want a strict no-localStorage production build, set `VITE_INTROVIBE_AUTH_MODE=api`.
