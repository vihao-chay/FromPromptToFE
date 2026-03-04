/**
 * GitHub OAuth Configuration
 *
 * IMPORTANT: Replace with your actual GitHub Client ID from GitHub Developer Settings.
 * Create OAuth App at: https://github.com/settings/developers
 */

const GITHUB_CLIENT_ID = (import.meta.env.VITE_GITHUB_CLIENT_ID ?? "").trim();
const GITHUB_REDIRECT_URI =
  (import.meta.env.VITE_GITHUB_REDIRECT_URI ?? "").trim() ||
  "http://localhost:5173/auth/github/callback";

/** Only valid when client ID is set; otherwise redirect would hit GitHub 404. */
/** prompt=select_account: show GitHub account picker so user can choose which account to use (not auto-use current browser login). */
export const GITHUB_OAUTH_URL =
  GITHUB_CLIENT_ID
    ? `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email&prompt=select_account`
    : "";

export { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI };
