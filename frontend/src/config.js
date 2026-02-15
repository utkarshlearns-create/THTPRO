// All API requests use relative URLs (e.g., /api/users/login/)
// Next.js rewrites proxy them to the backend (see next.config.mjs)
// This avoids CORS issues since requests are same-origin
const API_BASE_URL = "";

export default API_BASE_URL;
