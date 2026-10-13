# Supabase Auth Frontend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace frontend mock authentication with Supabase Auth sessions and use the backend profile as the source of user identity and role.

**Architecture:** The browser uses Supabase JS for signup, password signin, session restoration, and signout. The API client reads the current Supabase access token and sends it as a Bearer token; `AuthContext` loads identity from backend `GET /api/profile/me` and exposes that profile to pages and route guards.

**Tech Stack:** React 19, TypeScript, Vite, `@supabase/supabase-js`, Vitest, jsdom, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-13-supabase-auth-design.md`  
**Backend prerequisite:** `docs/superpowers/plans/2026-10-13-supabase-auth-backend.md`

## Global Constraints

- Backend phase must be completed and independently verified before this phase begins.
- Signup sends `full_name` metadata only; the browser never sends or selects a role.
- Role and profile display data come from `GET /api/profile/me`, never email heuristics or user metadata.
- Use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or publishable key); never put a service role or signing key in frontend configuration.
- Keep session management in Supabase JS; remove mock account authentication and manually managed token/session fallbacks.
- Support Supabase email confirmation both enabled and disabled.
- Invalid/expired backend auth clears displayed identity; profile errors must not fall back to mock role data.

## Review Focus

- Signup with email confirmation enabled has no session yet; the UI must ask the user to confirm email and must not navigate as authenticated. Task 2 and Task 3 test this.
- Signup with confirmation disabled returns a session and loads backend profile; Task 2 tests this.
- A valid session restore followed by `/api/profile/me` failure must not preserve a stale admin role; Task 2 tests 401/403 and server failure behavior.
- Supabase refresh changes the access token; the next API request must use the current token rather than a copied stale token. Task 2 tests this.
- Non-email frequent flyer IDs and email strings containing `admin` must not authenticate or grant admin access; Task 3 tests email-only signin and server-sourced route role.

---

## File Map

- Modify `frontend/package.json` and `frontend/pnpm-lock.yaml`; add a `test` script and focused test dependencies.
- Modify `frontend/vite.config.ts`; configure Vitest/jsdom.
- Create `frontend/src/test/setup.ts` and `frontend/.env.example`.
- Create `frontend/src/lib/supabase.ts` as the single Supabase client.
- Modify `frontend/src/api/apiClient.ts` to read the current session token and expose backend error codes.
- Modify `frontend/src/context/AuthContext.tsx` to own Supabase session state and backend profile state.
- Modify `frontend/src/pages/SignInPage.tsx`, `SignUpPage.tsx`, `frontend/src/components/auth/AdminRoute.tsx`, `CustomerRoute.tsx`, `frontend/src/components/layout/TopNavBar.tsx`, `AdminSidebar.tsx`, and `frontend/src/pages/MyBookingsPage.tsx` to consume profile-backed identity and asynchronous auth methods.
- Create tests `frontend/src/lib/supabase.test.ts`, `frontend/src/api/apiClient.test.ts`, `frontend/src/context/AuthContext.test.tsx`, `frontend/src/pages/SignInPage.test.tsx`, and `frontend/src/pages/SignUpPage.test.tsx`.

## Task 1: Configure Supabase client and frontend test runner

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/pnpm-lock.yaml`
- Modify: `frontend/vite.config.ts`
- Create: `frontend/.env.example`
- Create: `frontend/src/lib/supabase.ts`
- Create: `frontend/src/test/setup.ts`
- Test: `frontend/src/lib/supabase.test.ts`

**Interfaces:**
- Produces one exported `supabase` client from `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)`.
- Produces `pnpm test --run` as the frontend test command.
- Test stack: `vitest`, `jsdom`, `@testing-library/react`.

- [ ] **Step 1: Add a failing client configuration test** that stubs the two Vite environment values, mocks `createClient`, imports the module, and asserts it passes the configured URL and publishable/anon key.
- [ ] **Step 2: Run `cd frontend && pnpm test --run src/lib/supabase.test.ts`**; confirm the test command or module fails because the client and test runner are not configured.
- [ ] **Step 3: Add the test runner dependencies and script, configure Vitest in `vite.config.ts`, add the shared setup file, create `src/lib/supabase.ts`, and add `.env.example` with placeholder values only.** Do not add service keys.
- [ ] **Step 4: Run `cd frontend && pnpm test --run src/lib/supabase.test.ts && pnpm build`**; the client test and production type/build check pass.
- [ ] **Step 5: Commit** with `feat: configure Supabase client`.

## Task 2: Connect session, backend profile, and API Bearer token

**Files:**
- Modify: `frontend/src/api/apiClient.ts`
- Modify: `frontend/src/context/AuthContext.tsx`
- Test: `frontend/src/api/apiClient.test.ts`
- Test: `frontend/src/context/AuthContext.test.tsx`

**Interfaces:**
- `AuthUser` is the backend profile shape: `{ id: string; email: string; fullName: string; role: 'CUSTOMER' | 'ADMIN' }`.
- `AuthContextType.signIn(email: string, password: string): Promise<AuthUser>`.
- `AuthContextType.signUp(fullName: string, email: string, password: string): Promise<{ confirmationRequired: boolean }>`.
- `AuthContextType.signOut(): Promise<void>`.
- Context exposes `user`, `isAuthenticated`, `isAdmin`, and `isLoading`; `user` is populated only from `GET /api/profile/me`.
- API client obtains the token with `supabase.auth.getSession()` for each request and attaches `Authorization: Bearer <access_token>` when present. `ApiError` includes optional backend `code`.

- [ ] **Step 1: Write failing API client tests** that assert the current session token is attached, no authorization header is added without a session, and a backend error preserves its `code`.
- [ ] **Step 2: Run `cd frontend && pnpm test --run src/api/apiClient.test.ts`**; confirm the current storage-scanning client fails the expectations.
- [ ] **Step 3: Implement session-based token lookup** in `apiClient.ts`; remove `skywing_token`, Supabase storage-key scanning, and fake session fallback.
- [ ] **Step 4: Write failing AuthContext tests** for initial session restoration plus `/api/profile/me`, signin success/error, signup metadata with no role, confirmation-required signup, signout, token refresh, 401/403 profile rejection, and 5xx without mock fallback.
- [ ] **Step 5: Run `cd frontend && pnpm test --run src/context/AuthContext.test.tsx`**; confirm mock-based auth cannot satisfy the cases.
- [ ] **Step 6: Implement AuthContext with `getSession` and `onAuthStateChange`**, Supabase `signInWithPassword`, `signUp({ options: { data: { full_name } } })`, and `signOut`. Load identity from `/api/profile/me`; never decode role from JWT or metadata. For a profile 401/403, clear displayed identity; for 5xx, clear displayed identity but retain the Supabase session so the user can retry.
- [ ] **Step 7: Run `cd frontend && pnpm test --run src/api/apiClient.test.ts src/context/AuthContext.test.tsx && pnpm build`**; session/token tests and production build pass.
- [ ] **Step 8: Commit** with `feat: connect Supabase sessions to backend profile`.

## Task 3: Update auth screens and role-based UI

**Files:**
- Modify: `frontend/src/pages/SignInPage.tsx`
- Modify: `frontend/src/pages/SignUpPage.tsx`
- Modify: `frontend/src/components/auth/AdminRoute.tsx`
- Modify: `frontend/src/components/auth/CustomerRoute.tsx`
- Modify: `frontend/src/components/layout/TopNavBar.tsx`
- Modify: `frontend/src/components/layout/AdminSidebar.tsx`
- Modify: `frontend/src/pages/MyBookingsPage.tsx`
- Test: `frontend/src/pages/SignInPage.test.tsx`
- Test: `frontend/src/pages/SignUpPage.test.tsx`

**Interfaces:**
- Consume the Task 2 `AuthContextType`; redirects use the returned `AuthUser.role`, not email text.
- Display `fullName`, email, and role from the backend profile. The auth screens do not invent frequent-flyer numbers or tiers.

- [ ] **Step 1: Write failing signin UI tests** for email-only sign-in, role-based admin/customer destination, rejection of an email containing `admin` when the returned role is CUSTOMER, and surfaced authentication errors.
- [ ] **Step 2: Write failing signup UI tests** for confirmation-required message/no navigation, immediate-session navigation, and Supabase error display.
- [ ] **Step 3: Run `cd frontend && pnpm test --run src/pages/SignInPage.test.tsx src/pages/SignUpPage.test.tsx`**; confirm current heuristic redirects and unconditional signup navigation fail.
- [ ] **Step 4: Update both pages** to use the Task 2 method contracts. Make signin email-only; navigate by the returned profile role; show confirmation instructions when `confirmationRequired` is true.
- [ ] **Step 5: Update route guards and shared UI** for uppercase `CUSTOMER`/`ADMIN`, `fullName`, and async signout. Remove email-based role selection and mock-only frequent-flyer/tier displays from auth surfaces; keep unrelated mock booking data untouched.
- [ ] **Step 6: Run `cd frontend && pnpm test --run src/pages/SignInPage.test.tsx src/pages/SignUpPage.test.tsx && pnpm build`**; auth page tests and production build pass.
- [ ] **Step 7: Commit** with `feat: use Supabase identity in auth screens`.

## Frontend Phase Handoff

Configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL` locally. Test against the backend phase and a Supabase project with email confirmation enabled and disabled. Confirm a newly registered user's profile is `CUSTOMER`; never infer `ADMIN` from the user's email.
