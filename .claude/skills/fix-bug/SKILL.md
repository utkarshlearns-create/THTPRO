---
name: fix-bug
description: Analyze and fix a bug reported by the user with full-stack debugging
argument-hint: [error message or description]
user-invocable: true
---

Fix the bug described in $ARGUMENTS. Follow this workflow:

1. **Reproduce**: Understand the error from the description/stacktrace
2. **Locate**: Find the relevant files across backend (Django) and frontend (Next.js/React)
3. **Root cause**: Identify WHY it's happening, not just WHERE
4. **Fix**: Apply the minimal fix needed — don't refactor surrounding code
5. **Verify**: Check for similar issues in related files (e.g., same pattern in other dashboards)

Key project context:
- Backend: Django REST Framework at `backend/`
- Frontend: Next.js App Router + React at `frontend/src/`
- Icons: `lucide-react` — watch for duplicate imports causing `Illegal constructor`
- Auth: SimpleJWT tokens in localStorage (`access`, `refresh`)
- API calls use relative `/api/...` paths (proxied via Next.js rewrites)
- Roles: PARENT, TEACHER, COUNSELLOR, TUTOR_ADMIN, SUPERADMIN, INSTITUTION

After fixing, summarize what was wrong and what you changed.
