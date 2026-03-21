---
name: add-feature
description: Add a new feature to the THTPRO platform following project conventions
argument-hint: [feature description]
user-invocable: true
---

Implement the feature described in $ARGUMENTS. Follow this workflow:

1. **Understand**: Clarify what the feature does and which user roles it affects
2. **Plan**: Identify all files that need changes (backend API, frontend components, routes)
3. **Backend first** (if needed):
   - Add views in the appropriate file (`views.py`, `tutor_views.py`, `admin_views.py`, etc.)
   - Add serializers if new data shapes are needed
   - Add URL routes in `urls.py`
   - Use proper permissions from `core/permissions.py`
   - Add throttle classes for sensitive endpoints
4. **Frontend**:
   - Follow existing patterns in the relevant dashboard
   - Use Tailwind CSS only (indigo/violet primary, slate for text)
   - Use `lucide-react` for icons (alias with `as` if name conflicts exist)
   - Use `react-hot-toast` for notifications
   - API calls: relative `/api/...` with `Authorization: Bearer` header
5. **Verify**: Check the feature works with existing code, no import conflicts

Project conventions:
- Never hardcode role strings — use role constants
- Never use absolute backend URLs — always relative `/api/...`
- JWT from `localStorage.getItem('access')`
- Shadcn UI components available in `src/components/ui/`
