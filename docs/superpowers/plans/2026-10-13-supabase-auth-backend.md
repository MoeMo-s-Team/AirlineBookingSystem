# Supabase Auth Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify Supabase access tokens in Spring Boot, derive authorities from `profiles`/`roles`, and expose the authenticated user's profile.

**Architecture:** Spring Security Resource Server verifies JWTs with the configured Supabase JWKS, issuer, and audience. A profile authorization filter then looks up `sub`, attaches `ROLE_CUSTOMER` or `ROLE_ADMIN` from the database, and rejects invalid profile state. `GET /api/profile/me` returns the authenticated profile.

**Tech Stack:** Java 21, Spring Boot 3.2, Spring Security OAuth2 Resource Server/Nimbus, Spring Data JPA, JUnit 5, Mockito, MockMvc.

**Spec:** `docs/superpowers/specs/2026-10-13-supabase-auth-design.md`

## Global Constraints

- Public signup always creates `CUSTOMER`; `ADMIN` is assigned only through a separate administrative process.
- Backend does not receive, store, or forward passwords.
- Verify JWT signature with Supabase JWKS and validate issuer, configurable audience, and expiration before reading `sub` or querying profile data.
- `SUPABASE_JWT_AUDIENCE` is required configuration; do not hard-code the audience.
- Derive authorities only from the database `Profile.role`; ignore JWT and metadata role claims.
- Invalid/missing/expired JWT returns `401`; valid JWT with missing profile returns `403 PROFILE_NOT_FOUND`; invalid role returns `403 PROFILE_ROLE_INVALID`.
- Public GET routes remain public; CRUD and `/all` admin routes require `ADMIN`.
- Backend is implemented and verified independently before frontend integration.

## Review Focus

- Invalid/missing/expired JWT on protected routes must return JSON `401` with `ApiResponse.code=UNAUTHORIZED` before profile lookup; Task 2 tests each validator, audience match/mismatch, and the response body.
- A verified `sub` without a profile must return `403 PROFILE_NOT_FOUND`; Task 1 tests missing profile and Task 2 tests the HTTP error response.
- A profile with missing or unknown role must return `403 PROFILE_ROLE_INVALID` without any authority; Task 1 and Task 2 test this.
- A database outage during profile lookup must return `5xx PROFILE_LOOKUP_FAILED`, never `403` or a synthetic customer profile; Task 2 tests this failure path and asserts no authority is installed.
- A role changed in the database must affect the next request even when the token has not changed; Task 3 sends the same JWT across two requests while the profile role changes and verifies customer/admin route authorization.

---

## File Map

- Modify `backend/pom.xml`: add Spring Security OAuth2 Resource Server; remove JJWT after deleting its two remaining production uses.
- Modify `backend/src/main/resources/application.yml` and `backend/src/main/java/com/airline/config/SupabaseProperties.java`: require issuer URI, JWKS URL, and audience settings.
- Modify `backend/src/main/java/com/airline/config/SecurityConfig.java`: configure JWT validation, a JSON `ApiResponse` authentication entry point, profile filter order, and request authorization.
- Delete `backend/src/main/java/com/airline/infrastructure/security/SupabaseJwtFilter.java`; create `ProfileAuthorizationFilter.java` and `ProfilePrincipal.java` in the same package.
- Create `backend/src/main/java/com/airline/domain/repository/ProfileRepository.java` and `backend/src/main/java/com/airline/application/service/ProfileService.java`; create `application/dto/ProfileIdentity.java` and `application/exception/ProfileAuthorizationException.java`.
- Modify `backend/src/main/java/com/airline/presentation/dto/response/ApiResponse.java` to carry stable error codes; create `presentation/dto/response/ProfileMeResponse.java` and `presentation/controller/ProfileController.java`.
- Modify `backend/src/main/java/com/airline/presentation/controller/FareController.java` to remove the public dev-token endpoint.
- Replace `backend/src/test/java/com/airline/infrastructure/security/SupabaseJwtFilterTest.java`; add focused tests for profile lookup, JWT validation, filter errors, profile endpoint, and route access.

## Task 1: Load and validate database profile identity

**Files:**
- Create: `backend/src/main/java/com/airline/domain/repository/ProfileRepository.java`
- Create: `backend/src/main/java/com/airline/application/dto/ProfileIdentity.java`
- Create: `backend/src/main/java/com/airline/application/exception/ProfileAuthorizationException.java`
- Create: `backend/src/main/java/com/airline/application/service/ProfileService.java`
- Test: `backend/src/test/java/com/airline/application/service/ProfileServiceTest.java`

**Interfaces:**
- Produces `ProfileRepository.findProfileWithRoleById(UUID id): Optional<Profile>` using a fetch join for `role`.
- Produces `ProfileService.requireIdentity(UUID id): ProfileIdentity`, where `ProfileIdentity` has `UUID id`, `String email`, `String fullName`, and `String role`.
- Produces `ProfileAuthorizationException.code()` with `PROFILE_NOT_FOUND` or `PROFILE_ROLE_INVALID`.

- [ ] **Step 1: Write failing service tests** for `CUSTOMER` and `ADMIN` mapping, missing profile code, and missing/unknown role code.
- [ ] **Step 2: Run `cd backend && mvn -Dtest=ProfileServiceTest test`**; confirm the new tests fail because the service and repository method do not exist.
- [ ] **Step 3: Implement the repository fetch join and `ProfileService.requireIdentity(UUID)`**. Accept only database roles `CUSTOMER` and `ADMIN`; do not read token claims in this service.
- [ ] **Step 4: Run `cd backend && mvn -Dtest=ProfileServiceTest test`**; all profile mapping and rejection cases pass.
- [ ] **Step 5: Commit** with `feat: resolve authenticated profile roles`.

## Task 2: Verify Supabase JWTs and attach profile authority

**Files:**
- Modify: `backend/pom.xml`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/main/java/com/airline/config/SupabaseProperties.java`
- Modify: `backend/src/main/java/com/airline/config/SecurityConfig.java`
- Delete: `backend/src/main/java/com/airline/infrastructure/security/SupabaseJwtFilter.java`
- Create: `backend/src/main/java/com/airline/infrastructure/security/ProfilePrincipal.java`
- Create: `backend/src/main/java/com/airline/infrastructure/security/ProfileAuthorizationFilter.java`
- Modify: `backend/src/main/java/com/airline/presentation/dto/response/ApiResponse.java`
- Modify: `backend/src/test/java/com/airline/presentation/dto/response/ApiResponseTest.java`
- Modify: `backend/src/main/java/com/airline/presentation/controller/FareController.java`
- Delete: `backend/src/test/java/com/airline/infrastructure/security/SupabaseJwtFilterTest.java`
- Create: `backend/src/test/java/com/airline/infrastructure/security/SupabaseJwtDecoderTest.java`
- Create: `backend/src/test/java/com/airline/infrastructure/security/ProfileAuthorizationFilterTest.java`
- Create: `backend/src/test/java/com/airline/infrastructure/security/SupabaseSecurityIntegrationTest.java`

**Interfaces:**
- Consumes `ProfileService.requireIdentity(UUID)` from Task 1.
- Produces a `JwtDecoder` backed by configured JWKS and validators for configured issuer, configured audience, and default timestamp rules.
- Produces `ProfilePrincipal(UUID id, String email, String fullName, String role)` and authentication authorities derived from its database role.
- Produces `ApiResponse.error(String code, String message)` while keeping existing success response fields unchanged.
- Protected routes use an `AuthenticationEntryPoint` that returns `401` JSON: `success=false`, `code="UNAUTHORIZED"`, and a stable message.
- `ProfileAuthorizationFilter.shouldNotFilter` skips Swagger/API docs and public GET flights/fares/services routes, explicitly excluding admin `/all` routes; a valid bearer on a public GET must not trigger profile lookup.

- [ ] **Step 1: Write failing decoder tests** for configured issuer/audience success, wrong issuer, audience mismatch, expired token, and a signature not matching the configured JWKS. Generate a temporary RSA signing key and serve its JWK Set from a local JDK HTTP server in the test.
- [ ] **Step 2: Run `cd backend && mvn -Dtest=SupabaseJwtDecoderTest test`**; confirm these cases fail against the current HS256-only filter.
- [ ] **Step 3: Configure Resource Server JWT verification** with required `SUPABASE_ISSUER_URI`, `SUPABASE_JWKS_URL`, and `SUPABASE_JWT_AUDIENCE`; audience comes only from configuration. Add the Resource Server starter and remove the obsolete JJWT dependencies after deleting their production call sites.
- [ ] **Step 4: Write failing filter tests** for authenticated profile resolution, `403 PROFILE_NOT_FOUND`, `403 PROFILE_ROLE_INVALID`, and database failure returning `5xx PROFILE_LOOKUP_FAILED`; assert lookup occurs only after a verified `JwtAuthenticationToken` reaches a protected route, and database failure stops the chain without authority.
- [ ] **Step 5: Add security integration tests**: missing, invalid signature, issuer, audience, and expiration on protected routes return JSON `401` with `code=UNAUTHORIZED` and never call `ProfileService`; a public GET with a valid bearer token succeeds without profile lookup.
- [ ] **Step 6: Implement `ProfileAuthorizationFilter` after `BearerTokenAuthenticationFilter`**. Parse the verified `sub` only for protected routes, resolve `ProfileIdentity`, install a `ProfilePrincipal` with exactly `ROLE_CUSTOMER` or `ROLE_ADMIN`, or write the specified 403/5xx JSON response and stop the chain. Catch `ProfileAuthorizationException` separately from `DataAccessException`; database exceptions return `5xx PROFILE_LOOKUP_FAILED`, never 403 or a customer fallback.
- [ ] **Step 7: Configure a JSON `AuthenticationEntryPoint`** in `SecurityConfig` for missing/invalid credentials on protected routes, returning `ApiResponse.error("UNAUTHORIZED", message)` with status 401. Keep public GET and docs routes out of profile resolution; ensure `/api/fares/all` and `/api/services/all` remain protected despite the public GET matchers.
- [ ] **Step 8: Remove `/api/fares/dev-token` and its JJWT imports**; remove the obsolete `secret-key` property from backend auth configuration. Remove JJWT dependencies after confirming there are no remaining production or test references.
- [ ] **Step 9: Run `cd backend && mvn -Dtest=SupabaseJwtDecoderTest,ProfileAuthorizationFilterTest,SupabaseSecurityIntegrationTest test`**; all JWT, filter ordering, public-route bypass, stable JSON error, profile, role, and database-failure cases pass.
- [ ] **Step 10: Commit** with `feat: verify Supabase JWTs and load database roles`.

## Task 3: Expose current profile and enforce the route matrix

**Files:**
- Create: `backend/src/main/java/com/airline/presentation/dto/response/ProfileMeResponse.java`
- Create: `backend/src/main/java/com/airline/presentation/controller/ProfileController.java`
- Modify: `backend/src/main/java/com/airline/config/SecurityConfig.java`
- Test: `backend/src/test/java/com/airline/presentation/controller/ProfileControllerTest.java`
- Test: `backend/src/test/java/com/airline/config/SecurityConfigRouteTest.java`

**Interfaces:**
- Consumes `ProfilePrincipal` installed by Task 2.
- Produces `GET /api/profile/me` returning `ApiResponse<ProfileMeResponse>` with `id`, `email`, `fullName`, and `role`.

- [ ] **Step 1: Write failing controller tests** for profile fields from the authenticated principal and `401` when no valid authentication is present.
- [ ] **Step 2: Run `cd backend && mvn -Dtest=ProfileControllerTest test`**; confirm the endpoint is not mapped yet.
- [ ] **Step 3: Implement the profile response DTO and controller**; do not accept user ID from request parameters, path, or body.
- [ ] **Step 4: Write route tests**: public GET flights/fares/services succeed anonymously; POST/PUT/DELETE and `/all` admin routes reject customer and accept admin; `/api/profile/me` requires authentication; `/api/fares/dev-token` is absent. Send the same JWT on two requests while the test profile changes from CUSTOMER to ADMIN; the second request must use the new database role.
- [ ] **Step 5: Configure and run route tests** with `cd backend && mvn -Dtest=ProfileControllerTest,SecurityConfigRouteTest test`; verify `401` for missing auth and `403` for insufficient role.
- [ ] **Step 6: Run `cd backend && mvn test`**; all backend tests pass.
- [ ] **Step 7: Commit** with `feat: expose authenticated profile endpoint`.

## Backend Phase Handoff

Before beginning the frontend plan, configure the Supabase issuer URI, JWKS URL, and audience in the backend environment. Confirm the deployed Supabase database has `CUSTOMER` and `ADMIN` roles and the auth-user profile trigger from `backend/src/main/resources/db/init.sql`. Use a real Supabase user token to verify `/api/profile/me` returns the matching database profile and role, then verify a customer cannot access an admin mutation.
