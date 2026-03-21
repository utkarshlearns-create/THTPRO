---
name: check-deploy
description: Check deployment status and verify the live site is working
user-invocable: true
disable-model-invocation: true
---

Check the deployment status of THTPRO:

1. **Git status**: Show current branch, uncommitted changes, and unpushed commits
2. **Recent commits**: Show last 5 commits with messages
3. **Frontend (Vercel)**: Check if latest push has been deployed by fetching https://www.thehometuitions.com and checking response status
4. **Backend (Render)**: Check if API is responding by fetching https://www.thehometuitions.com/api/users/tutors/search/?page=1 (public endpoint)
5. **Summary**: Report what's deployed vs what's local

Remind the user:
- Frontend deploys automatically on push to main (Vercel)
- Backend deploys automatically on push to main (Render) — takes longer (~2-5 min)
