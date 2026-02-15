// Central place for frontend → backend configuration.
// You can override this in a .env file with Vite:
//   VITE_API_BASE_URL="http://localhost:8000"
// For production, point it at your deployed backend URL.

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';



