/**
 * GitHub OAuth Configuration
 *
 * IMPORTANT: Replace with your actual GitHub Client ID from GitHub Developer Settings.
 * Create OAuth App at: https://github.com/settings/developers
 */

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
const GITHUB_REDIRECT_URI =
  import.meta.env.VITE_GITHUB_REDIRECT_URI ||
  "http://localhost:5173/auth/github/callback";

/**
 * GitHub OAuth Authorization URL
 * Scope 'user:email' is required to access user's email address
 */
export const GITHUB_OAUTH_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email`;

export { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI };
