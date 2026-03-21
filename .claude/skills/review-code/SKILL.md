---
name: review-code
description: Review recent code changes for bugs, security issues, and best practices
argument-hint: [file path or "last commit"]
user-invocable: true
---

Review the code specified in $ARGUMENTS (or the last commit if not specified).

Check for:

1. **Security**:
   - No hardcoded secrets or API keys
   - Proper authentication checks (JWT Bearer token)
   - No SQL injection, XSS, or command injection
   - Sensitive endpoints have throttle classes
   - No localStorage tokens leaked in URLs

2. **Correctness**:
   - API endpoints match between frontend calls and backend URLs
   - Proper error handling for API failures
   - Role checks use correct role constants
   - Import statements are complete (no missing icons, no duplicates)

3. **Project conventions**:
   - Relative `/api/...` paths (not absolute URLs)
   - Tailwind classes only (no custom CSS)
   - `lucide-react` icons aliased if conflicts exist
   - `react-hot-toast` for notifications

4. **Common THTPRO pitfalls**:
   - Duplicate lucide-react imports causing `Illegal constructor`
   - Missing icon imports used in JSX
   - Wrong role names (e.g., `ADMIN` instead of `TUTOR_ADMIN`)
   - Forgetting to clear tokens on logout/password change

Report findings with file paths and line numbers. Suggest fixes for any issues found.
